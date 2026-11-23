import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, Trash2, Bookmark, Sparkles } from 'lucide-react';
import { removeSavedArticle } from '../actions';
import GlassFolder, { FolderFile } from '@/components/ui/glass-folder';
import CartoonMascot from '@/components/CartoonMascot';

export const dynamic = 'force-dynamic';

export default async function ReadLaterPage() {
  let articles: any[] = [];
  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select(`
        *,
        source:sources(name),
        analysis:article_analysis(*),
        status:user_article_status!inner(status, is_read, is_saved)
      `)
      .or('is_saved.eq.true,status.eq.read_later', { foreignTable: 'user_article_status' })
      .order('publication_date', { ascending: false });

    if (!error && data) {
      articles = data;
    }
  } catch (err) {
    console.warn("Could not query saved articles:", err);
  }

  const artPresets: ("ember" | "dusk" | "verdant" | "aurora" | "glacier")[] = [
    "ember", "dusk", "verdant", "aurora", "glacier"
  ];

  const folderFiles: FolderFile[] = articles.map((article, i) => {
    const analysis = Array.isArray(article.analysis) ? article.analysis[0] : article.analysis;
    return {
      name: analysis?.short_headline || article.title,
      meta: `${article.category || 'AI'} · ${article.source?.name || 'News'}`,
      art: artPresets[i % artPresets.length],
      href: article.url,
    };
  });

  if (!articles || articles.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background text-foreground">
        <div className="mb-8">
          <GlassFolder
            label="Empty Vault"
            tone="dark"
            art="glacier"
            width={320}
            files={[
              { name: "No saved articles yet", meta: "Swipe left in the feed", art: "aurora" },
              { name: "Weekend Rabbit Hole", meta: "Articles you bookmark", art: "verdant" }
            ]}
          />
        </div>
        <div className="mt-4 flex flex-col items-center">
          <CartoonMascot state="thinking" size={54} className="mb-2" />
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Your Vault is Empty.</h2>
        </div>
        <p className="text-text-secondary font-medium mt-3 max-w-md">
          While reading the morning brief, swipe left or tap the bookmark button to tuck stories into this glass folder for the weekend.
        </p>
        <Link href="/" className="mt-8 px-8 py-3.5 bg-foreground text-background font-bold rounded-full hover:scale-105 active:scale-95 transition-transform uppercase text-xs tracking-widest shadow-lg">
          Explore Today's Brief
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6 md:p-12 lg:p-24 pb-32 text-foreground">
      <div className="max-w-5xl mx-auto mt-6">
        <header className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pb-8 border-b border-sage/20">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-text-muted hover:text-sage transition-colors mb-6 uppercase">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-soft/20 text-sage text-xs font-mono font-bold tracking-widest uppercase mb-4">
              <Bookmark size={13} /> Saved Intelligence
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-foreground">
              Weekend <span className="text-sage">Rabbit Hole</span>
            </h1>
            <p className="text-lg text-text-secondary font-medium max-w-xl">
              Deep dives, papers, and essays bookmarked for unhurried weekend reading.
            </p>
          </div>

          <div className="hidden md:block shrink-0">
            <GlassFolder
              label="Saved Archive"
              tone="dark"
              art="ember"
              width={260}
              files={folderFiles.slice(0, 4)}
            />
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article: any) => {
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
                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors z-10 cursor-pointer"
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
