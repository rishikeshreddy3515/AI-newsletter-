import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { supabaseAdmin } from '@/lib/supabase';

const parser = new Parser({
  customFields: {
    item: ['author', 'creator', 'description', 'content:encoded', 'pubDate'],
  },
});

export const maxDuration = 300; // Allow Vercel up to 5 minutes

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch active sources
    const { data: sources, error: sourceError } = await supabaseAdmin
      .from('sources')
      .select('*')
      .eq('is_active', true);

    if (sourceError || !sources) {
      throw new Error(`Failed to fetch sources: ${sourceError?.message}`);
    }

    let totalIngested = 0;
    const errors: string[] = [];

    // 2. Fetch and parse each RSS feed
    for (const source of sources) {
      try {
        const feed = await parser.parseURL(source.rss_url);
        
        for (const item of feed.items) {
          if (!item.title || !item.link) continue;
          
          const pubDate = item.pubDate || item.isoDate || new Date().toISOString();
          // Skip if older than 7 days to save processing
          const ageInDays = (Date.now() - new Date(pubDate).getTime()) / (1000 * 60 * 60 * 24);
          if (ageInDays > 7) continue;

          // Normalize
          const title = item.title.trim();
          const url = item.link.trim();
          const author = item.creator || item.author || null;
          const description = item['content:encoded'] || item.content || item.description || null;
          
          // Upsert to DB
          const { error: insertError } = await supabaseAdmin
            .from('articles')
            .upsert({
              source_id: source.id,
              title,
              url,
              author,
              description,
              category: source.category,
              publication_date: new Date(pubDate).toISOString(),
              canonical_url: url // basic deduplication for now
            }, {
              onConflict: 'url',
              ignoreDuplicates: true
            });

          if (insertError) {
            console.error('Insert error:', insertError);
          } else {
            totalIngested++;
          }
        }
      } catch (feedErr: any) {
        console.error(`Error processing feed ${source.name}:`, feedErr);
        errors.push(`Source ${source.name}: ${feedErr.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      ingested: totalIngested,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Ingestion pipeline failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
