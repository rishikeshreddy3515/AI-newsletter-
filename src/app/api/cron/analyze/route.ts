import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ai } from '@/lib/gemini';
import { Type, Schema } from '@google/genai';

export const maxDuration = 300; // Allow Vercel up to 5 minutes

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING },
    importance_score: { type: Type.INTEGER },
    novelty_score: { type: Type.INTEGER },
    technical_relevance_score: { type: Type.INTEGER },
    research_value_score: { type: Type.INTEGER },
    industry_impact_score: { type: Type.INTEGER },
    short_headline: { type: Type.STRING },
    one_sentence_summary: { type: Type.STRING },
    detailed_summary: { type: Type.STRING },
    why_it_matters: { type: Type.STRING },
    key_technical_details: { type: Type.STRING },
    related_topics: { 
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    is_worth_including: { type: Type.BOOLEAN }
  },
  required: [
    "category", "importance_score", "novelty_score", "technical_relevance_score",
    "research_value_score", "industry_impact_score", "short_headline",
    "one_sentence_summary", "detailed_summary", "why_it_matters",
    "key_technical_details", "related_topics", "is_worth_including"
  ]
};

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch unanalyzed articles
    // We use a query to find articles that don't have an analysis yet
    const { data: unanalyzed, error: fetchError } = await supabaseAdmin
      .from('articles')
      .select(`
        *,
        article_analysis ( id )
      `)
      .order('publication_date', { ascending: false })
      .limit(10); // Process 10 at a time to avoid timeout/rate limits

    if (fetchError) {
      throw new Error(`Fetch error: ${fetchError.message}`);
    }

    const articlesToAnalyze = unanalyzed.filter((a: any) => !a.article_analysis || a.article_analysis.length === 0);
    
    let analyzedCount = 0;
    const errors = [];

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const article of articlesToAnalyze) {
      try {
        const prompt = `
          Analyze the following AI/ML article or research paper.
          Determine its relevance and importance to a highly technical AI/ML engineer or researcher.
          
          Title: ${article.title}
          Content/Description: ${article.description || 'No description available.'}
          URL: ${article.url}
          Source Category: ${article.category}

          Return a JSON object containing the required analysis.
          If information is unavailable, explicitly say that it was not available in the source material.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.2,
          }
        });

        if (response.text) {
          const analysisResult = JSON.parse(response.text);
          
          const { error: insertError } = await supabaseAdmin
            .from('article_analysis')
            .insert({
              article_id: article.id,
              ...analysisResult
            });
            
          if (insertError) {
             console.error("DB Insert Error for article", article.id, insertError);
             errors.push(`DB Insert Error: ${insertError.message}`);
          } else {
             analyzedCount++;
          }
        }

        // Add delay to prevent rate limit (15 RPM free tier = 4 seconds per request)
        await delay(4000);
      } catch (err: any) {
        console.error(`Analysis failed for article ${article.id}:`, err);
        errors.push(`Article ${article.id}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      analyzed: analyzedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Analysis pipeline failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
