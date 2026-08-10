import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { resend } from '@/lib/resend';

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET?.trim()}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todayDate = new Date().toISOString().split('T')[0];

    // Check if we already sent a newsletter today
    const { data: existing } = await supabaseAdmin
      .from('newsletters')
      .select('id')
      .eq('date', todayDate)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Newsletter already generated for today' });
    }

    // 2. Fetch worthy articles from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // We use !inner on the analysis join to ensure we only get articles that have analysis
    const { data: articles, error: fetchError } = await supabaseAdmin
      .from('articles')
      .select(`
        *,
        source:sources(name),
        analysis:article_analysis(*)
      `)
      .gte('publication_date', sevenDaysAgo)
      .not('analysis', 'is', null)
      //.eq('analysis.is_worth_including', true) // PostgREST filtering on joined table is tricky, we'll filter in memory
      .order('publication_date', { ascending: false });

    if (fetchError || !articles) {
      throw new Error(`Failed to fetch articles: ${fetchError?.message}`);
    }

    // Filter and sort in memory
    const validArticles = articles
      .filter((a: any) => {
         const an = Array.isArray(a.analysis) ? a.analysis[0] : a.analysis;
         return an && an.is_worth_including;
      })
      .sort((a: any, b: any) => {
        const anA = Array.isArray(a.analysis) ? a.analysis[0] : a.analysis;
        const anB = Array.isArray(b.analysis) ? b.analysis[0] : b.analysis;
        const scoreA = (anA?.importance_score || 0) + (anA?.novelty_score || 0);
        const scoreB = (anB?.importance_score || 0) + (anB?.novelty_score || 0);
        return scoreB - scoreA;
      })
      .slice(0, 12); // Take top 12

    if (validArticles.length === 0) {
      return NextResponse.json({ message: 'No worthy articles found for today.' });
    }

    // Group by category
    const grouped: Record<string, any[]> = {};
    for (const article of validArticles) {
      const cat = article.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(article);
    }

    // Generate HTML
    const htmlParts = [
      `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">`,
      `<h1 style="font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px;">AI MORNING BRIEF</h1>`,
      `<p style="color: #666; font-size: 14px; margin-bottom: 32px; border-bottom: 1px solid #eaeaea; padding-bottom: 16px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>`,
    ];

    for (const [category, categoryArticles] of Object.entries(grouped)) {
      htmlParts.push(`<h2 style="font-size: 20px; color: #000; margin-top: 32px; margin-bottom: 16px; border-bottom: 2px solid #000; display: inline-block; padding-bottom: 4px;">${category}</h2>`);
      
      for (const article of categoryArticles) {
        const analysis = Array.isArray(article.analysis) ? article.analysis[0] : article.analysis;
        htmlParts.push(`
          <div style="margin-bottom: 28px;">
            <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 4px; line-height: 1.3;">${analysis.short_headline || article.title}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 12px; font-weight: 500;">
              ${article.source?.name || 'Unknown Source'} • ${new Date(article.publication_date).toLocaleDateString()}
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #333; margin-bottom: 12px;">
              ${analysis.detailed_summary}
            </p>
            <div style="background: #f9f9f9; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
              <p style="font-size: 14px; line-height: 1.5; margin: 0;"><strong>Why it matters:</strong> ${analysis.why_it_matters}</p>
            </div>
            <a href="${article.url}" style="display: inline-block; color: #0066cc; text-decoration: none; font-size: 14px; font-weight: 600;">Read Original →</a>
          </div>
        `);
      }
    }

    htmlParts.push(`
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">Open Full Brief in App</a>
      </div>
    `);

    htmlParts.push(`</div>`);
    const finalHtml = htmlParts.join('\n');

    // Save to database
    const { error: dbError, data: newsletter } = await supabaseAdmin
      .from('newsletters')
      .insert({
        date: todayDate,
        content_json: grouped,
        html_content: finalHtml,
        is_sent: false
      })
      .select()
      .single();

    if (dbError) throw new Error(`Newsletter DB Error: ${dbError.message}`);

    // Send via Resend
    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: process.env.NEWSLETTER_FROM_EMAIL!,
      to: process.env.NEWSLETTER_TO_EMAIL!,
      subject: `AI Morning Brief - ${new Date().toLocaleDateString()}`,
      html: finalHtml,
    });

    if (emailError) {
      console.error("Resend Error:", emailError);
      return NextResponse.json({ success: true, warning: 'Newsletter generated but email failed', error: emailError });
    }

    // Mark as sent
    await supabaseAdmin
      .from('newsletters')
      .update({ is_sent: true })
      .eq('id', newsletter.id);

    return NextResponse.json({ success: true, message: 'Newsletter generated and sent' });
  } catch (error: any) {
    console.error('Newsletter pipeline failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
