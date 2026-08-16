import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, Trash2 } from 'lucide-react';
import CartoonMascot from '@/components/CartoonMascot';
import { removeSavedArticle } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ReadLaterPage() {
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select(`
      *,
      source:sources(name),
      analysis:article_analysis(*),
      status:user_article_status!inner(status, is_read, is_saved)
    `)
    .or('is_saved.eq.true,status.eq.read_later', { foreignTable: 'user_article_status' })
    .order('publication_date', { ascending: false });

  if (error) {
    return <div>Error loading saved articles.</div>;
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <CartoonMascot state="thinking" size={100} />
        <h2 className="text-3xl font-extrabold mt-8 tracking-tight text-foreground">Nothing saved yet.</h2>
        <p className="text-text-secondary font-medium mt-3">Swipe left when something looks worth returning to.</p>
        <Link href="/" className="mt-8 px-6 py-3 bg-sage text-background font-bold rounded-full hover:scale-105 transition-transform">
          Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6 md:p-12 lg:p-24 pb-32">
      <div className="max-w-5xl mx-auto mt-12">
        <header className="mb-16 flex items-start justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono tracking-widest text-text-muted hover:text-sage transition-colors mb-6 uppercase">
              <ArrowLeft size={16} /> Dashboard
            </Link>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-foreground">
              Your Weekend<br/>
              <span className="text-sage">Rabbit Hole</span>
            </h1>
            <p className="text-lg text-text-secondary font-medium max-w-xl">
              Stories you saved for when you actually have time to read.
            </p>
          </div>
          <div className="hidden sm:block">
            <CartoonMascot state="reading" size={100} />
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article: any, i: number) => {
            const analysis = Array.isArray(article.analysis) ? article.analysis[0] : article.analysis;
            return (
              <div key={article.id} className="bg-sage-soft/10 rounded-[2rem] p-8 shadow-sm border border-sage/20 hover:shadow-lg hover:border-sage/40 transition-all flex flex-col group">
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 bg-sage-soft/40 text-sage text-[10px] font-black uppercase tracking-widest rounded-full">
                    {article.category}
                  </span>
                  <span suppressHydrationWarning className="text-xs font-mono font-semibold text-text-muted">
                    {new Date(article.publication_date).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-4 leading-snug text-foreground group-hover:text-sage transition-colors">
                  {analysis?.short_headline || article.title}
                </h2>
                <p className="text-text-secondary text-sm mb-8 leading-relaxed font-medium flex-1">
                  {analysis?.detailed_summary || article.description}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-sage/20 mt-auto">
                  <span className="text-xs font-mono font-bold text-gold uppercase tracking-widest">{article.source?.name}</span>
                  <div className="flex items-center gap-4">
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-bold text-sage hover:text-foreground transition-colors"
                    >
                      Read Original <ExternalLink size={14} />
                    </a>
                    <form action={removeSavedArticle.bind(null, article.id)}>
                      <button 
                        type="submit"
                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors z-10"
                        title="Remove from Saved"
                      >
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
