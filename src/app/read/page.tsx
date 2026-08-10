import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import CartoonMascot from '@/components/CartoonMascot';

export const dynamic = 'force-dynamic';

export default async function ReadPage() {
  // Fetch articles marked as read
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select(`
      *,
      source:sources(name),
      analysis:article_analysis(*),
      status:user_article_status!inner(status, is_read, is_saved)
    `)
    // We want articles where is_read is true (or old status is read for compatibility)
    .or('is_read.eq.true,status.eq.read', { foreignTable: 'user_article_status' })
    .order('publication_date', { ascending: false });

  if (error) {
    return <div>Error loading read articles.</div>;
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-gray-950 pb-24">
        <CartoonMascot state="thinking" size={100} />
        <h2 className="text-3xl font-extrabold mt-8 tracking-tight">Nothing here yet.</h2>
        <p className="text-gray-500 font-medium mt-3">Read some articles from Today's News, and they'll appear here.</p>
        <Link href="/" className="mt-8 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform">
          Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-12 lg:p-24 pb-32">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 flex items-start justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors mb-6 md:hidden">
              <ArrowLeft size={16} /> Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Reading History</h1>
            <p className="text-lg text-gray-500 font-medium">Stories you've already consumed.</p>
          </div>
          <div className="hidden sm:block">
            <CartoonMascot state="idle" size={80} />
          </div>
        </header>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {articles.map((article: any, i: number) => {
            const analysis = Array.isArray(article.analysis) ? article.analysis[0] : article.analysis;
            return (
              <div key={article.id} className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">{article.category}</span>
                  <span suppressHydrationWarning className="text-xs font-semibold text-gray-400">{new Date(article.publication_date).toLocaleDateString()}</span>
                </div>
                <h2 className="text-2xl font-bold mb-4 leading-snug">
                  {analysis?.short_headline || article.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed font-medium flex-1">
                  {analysis?.detailed_summary || article.description}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{article.source?.name}</span>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Read Original <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
