import { supabaseAdmin } from '@/lib/supabase';
import ClientHome from './ClientHome';
import { CURATED_FALLBACK_ARTICLES } from '@/lib/constants';

// Opt out of caching so we always get fresh unread articles
export const dynamic = 'force-dynamic';

export default async function Home() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  let todayFeed: any[] = [];

  try {
    const { data: articles, error } = await supabaseAdmin
      .from('articles')
      .select(`
        *,
        source:sources(name),
        analysis:article_analysis(*),
        status:user_article_status(status, is_read, is_saved)
      `)
      .gte('publication_date', sevenDaysAgo)
      .not('analysis', 'is', null)
      .order('publication_date', { ascending: false });

    if (!error && articles && articles.length > 0) {
      todayFeed = articles
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
        });
    }
  } catch (err) {
    console.warn("Supabase temporarily unreachable, loading curated briefing:", err);
  }

  // Graceful fallback to rich curated AI stories if database is empty or paused
  if (todayFeed.length === 0) {
    todayFeed = CURATED_FALLBACK_ARTICLES;
  }

  return (
    <ClientHome articles={todayFeed} />
  );
}
