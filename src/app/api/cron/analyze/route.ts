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
    if (authHeader !== `Bearer ${process.env.CRON_SECRET?.trim()}`) {
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
          You are an expert AI and machine learning analyst and a witty, intelligent editorial companion. 
          Analyze this article and return a JSON object evaluating its importance.
          
          Article Title: ${article.title}
          Article Content/Description: ${article.description || 'No description available.'}
          URL: ${article.url}
          Source Category: ${article.category}

          Return a JSON object with the following structure exactly:
          {
            "category": "string",
            "importance_score": <0-100 integer, 100 being industry-shaking>,
            "novelty_score": <0-100 integer, how new/unique is this?>,
            "technical_relevance_score": <0-100 integer>,
            "research_value_score": <0-100 integer>,
            "industry_impact_score": <0-100 integer>,
            "short_headline": "<A punchy, 4-6 word headline>",
            "one_sentence_summary": "<A dense, highly informative one-sentence summary>",
            "detailed_summary": "<2-3 paragraphs explaining the core concepts, methods, and results. Be technical but accessible.>",
            "why_it_matters": "<1 paragraph explaining why the AI community should care about this.>",
            "key_technical_details": "<Comma separated list of key models, techniques, or hardware mentioned>",
            "related_topics": ["<topic1>", "<topic2>"],
            "is_worth_including": <boolean, true ONLY if importance_score > 60 OR novelty > 75>,
            "editorial_comment": "<Optional: A short (3-10 words) witty, smart, or insightful comment from our AI mascot. e.g. 'Researchers cooked here.' or 'That's a lot of GPUs.' Leave null if the article is boring or standard PR.>"
          }
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
