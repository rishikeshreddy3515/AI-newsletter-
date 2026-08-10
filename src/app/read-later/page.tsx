import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReadLaterPage() {
  // Fetch articles marked as 'read_later'
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select(`
      *,
      source:sources(name),
      analysis:article_analysis(*),
      status:user_article_status!inner(status)
    `)
    .eq('status.status', 'read_later')
    .order('publication_date', { ascending: false });

  if (error) {
    return <div>Error loading saved articles.</div>;
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-2">No saved stories</h2>
        <p className="text-gray-500">Swipe left on a story in the main feed to save it for later.</p>
        <Link href="/" className="mt-8 text-blue-600 font-semibold hover:underline">
          Go to Feed
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
      <h1 className="text-3xl font-extrabold mb-8">Read Later</h1>
      
      <div className="flex flex-col gap-6">
        {articles.map((article: any) => {
          const analysis = Array.isArray(article.analysis) ? article.analysis[0] : article.analysis;
          return (
            <div key={article.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{article.category}</span>
                <span suppressHydrationWarning className="text-xs text-gray-500">{new Date(article.publication_date).toLocaleDateString()}</span>
              </div>
              <h2 className="text-xl font-bold mb-2 leading-tight">
                {analysis?.short_headline || article.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                {analysis?.detailed_summary || article.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500">{article.source?.name}</span>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Read Original <ExternalLink size={14} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
