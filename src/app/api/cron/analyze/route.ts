import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ai } from '@/lib/gemini';
import { Type, Schema } from '@google/genai';

export const maxDuration = 300; // Allow Vercel up to 5 minutes

const responseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      article_id: { type: Type.STRING },
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
      "article_id", "category", "importance_score", "novelty_score", "technical_relevance_score",
      "research_value_score", "industry_impact_score", "short_headline",
      "one_sentence_summary", "detailed_summary", "why_it_matters",
      "key_technical_details", "related_topics", "is_worth_including"
    ]
  }
};

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET?.trim()}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch unanalyzed articles
    const { data: unanalyzed, error: fetchError } = await supabaseAdmin
      .from('articles')
      .select(`
        *,
        article_analysis ( id )
      `)
      .order('publication_date', { ascending: false })
      .limit(15); // Process up to 15 at once in a single prompt

    if (fetchError) {
      throw new Error(`Fetch error: ${fetchError.message}`);
    }

    const articlesToAnalyze = unanalyzed.filter((a: any) => !a.article_analysis || a.article_analysis.length === 0);
    
    if (articlesToAnalyze.length === 0) {
      return NextResponse.json({ success: true, analyzed: 0, message: 'No articles need analysis' });
    }

    const prompt = `
      You are an expert AI and machine learning analyst and a witty, intelligent editorial companion. 
      Analyze the following list of articles and return a JSON array evaluating their importance.
      
      Articles:
      ${articlesToAnalyze.map((a: any, i: number) => `
      [Article ${i}]
      ID: ${a.id}
      Title: ${a.title}
      Description: ${a.description || 'No description available.'}
      Category: ${a.category}
      URL: ${a.url}
      `).join('\n')}

      Return a JSON array of objects. Each object must strictly follow the required schema, making sure to include the exact "article_id" provided above.
      For the "editorial_comment" field (optional), provide a short (3-10 words) witty, smart, or insightful comment from our AI mascot (e.g. 'Researchers cooked here.'). Leave null if the article is boring or standard PR.
      The "is_worth_including" boolean should be true ONLY if importance_score > 60 OR novelty_score > 75.
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

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    const analysisResults = JSON.parse(response.text);
    
    // Insert all results into Supabase
    const { error: insertError } = await supabaseAdmin
      .from('article_analysis')
      .insert(analysisResults);
      
    if (insertError) {
       console.error("DB Batch Insert Error:", insertError);
       throw new Error(`DB Insert Error: ${insertError.message}`);
    }

    return NextResponse.json({
      success: true,
      analyzed: analysisResults.length
    });

  } catch (error: any) {
    console.error('Analysis pipeline failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
