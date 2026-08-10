import { supabaseAdmin } from '@/lib/supabase';
import Feed from './Feed';

// Opt out of caching so we always get fresh unread articles
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch unread, worthy articles from the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select(`
      *,
      source:sources(name),
      analysis:article_analysis(*),
      status:user_article_status(status)
    `)
    .gte('publication_date', sevenDaysAgo)
    .not('analysis', 'is', null)
    .order('publication_date', { ascending: false });

  if (error) {
    console.error("Error fetching feed:", error);
    return <div>Error loading feed</div>;
  }

  // Filter in memory for worthy and unread
  const unreadFeed = (articles || []).filter((a: any) => {
    const an = Array.isArray(a.analysis) ? a.analysis[0] : a.analysis;
    const st = Array.isArray(a.status) ? a.status[0] : a.status;
    const isWorthy = an && an.is_worth_including;
    const isUnread = !st || st.status === 'unread';
    return isWorthy && isUnread;
  }).sort((a: any, b: any) => {
    const anA = Array.isArray(a.analysis) ? a.analysis[0] : a.analysis;
    const anB = Array.isArray(b.analysis) ? b.analysis[0] : b.analysis;
    const scoreA = (anA?.importance_score || 0) + (anA?.novelty_score || 0);
    const scoreB = (anB?.importance_score || 0) + (anB?.novelty_score || 0);
    return scoreB - scoreA;
  });

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden fixed inset-0 flex items-center justify-center">
      <Feed initialArticles={unreadFeed} />
    </main>
  );
}
