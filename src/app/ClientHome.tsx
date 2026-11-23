'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Feed from './Feed';
import Interactive3DCard from '@/components/ui/interactive-3d-card';
import { GlowCard } from '@/components/ui/spotlight-card';
import CinematicOrbitHero from '@/components/ui/cinematic-orbit-hero';
import GlassFolder, { FolderFile } from '@/components/ui/glass-folder';
import Link from 'next/link';
import { Sparkles, Activity, FileText, Clock, TrendingUp, Trash2, ArrowRight, Bookmark, Compass } from 'lucide-react';
import CartoonMascot from '@/components/CartoonMascot';
import { cleanupDatabase, wipeSavedArticles, updateArticleStatus } from './actions';

export default function ClientHome({ articles }: { articles: any[] }) {
  const [localArticles, setLocalArticles] = useState(articles);
  const [isReading, setIsReading] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  useEffect(() => {
    // Silently enforce the cleanup rules in the background
    cleanupDatabase().catch(() => {});
  }, []);

  const isArticleRead = (article: any) => {
    const st = Array.isArray(article.status) ? article.status[0] : article.status;
    return st?.is_read === true || st?.status === 'read';
  };

  const isArticleSaved = (article: any) => {
    const st = Array.isArray(article.status) ? article.status[0] : article.status;
    return st?.is_saved === true || st?.status === 'read_later';
  };

  const isArticleCompleted = (article: any) => {
    return isArticleRead(article) || isArticleSaved(article);
  };

  const unreadArticles = localArticles.filter(a => !isArticleCompleted(a));
  const hasUnread = unreadArticles.length > 0;
  const feedArticles = hasUnread ? unreadArticles : localArticles;

  const handleWipeSaved = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWiping(true);
    const { success } = await wipeSavedArticles();
    if (success) {
      setLocalArticles(prev => prev.filter(a => !isArticleSaved(a)));
    }
    setIsWiping(false);
  };

  const featured = localArticles[0];
  const savedArticles = localArticles.filter(isArticleSaved);

  // Transform saved articles into interactive GlassFolder sheets
  const artPresets: ("ember" | "dusk" | "verdant" | "aurora" | "glacier")[] = [
    "ember", "dusk", "verdant", "aurora", "glacier"
  ];

  const folderFiles: FolderFile[] = savedArticles.length > 0
    ? savedArticles.map((article, i) => {
        const analysis = Array.isArray(article.analysis) ? article.analysis[0] : article.analysis;
        return {
          name: analysis?.short_headline || article.title,
          meta: `${article.category || 'AI'} · ${article.source?.name || 'News'}`,
          art: artPresets[i % artPresets.length],
          href: article.url,
        };
      })
    : [
        { name: "Swipe left on stories", meta: "to save them here", art: "aurora" },
        { name: "Weekend Rabbit Hole", meta: "Saved articles collection", art: "verdant" },
        { name: "Autonomous Systems", meta: "AI Architecture · 5 min", art: "ember" },
      ];

  const totalRead = localArticles.filter(isArticleRead).length;
  const totalSources = 14;

  return (
    <AnimatePresence mode="wait">
      {!isReading ? (
        <motion.div
          key="dashboard"
          className="min-h-screen bg-background text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* CINEMATIC 3D ORBIT HERO */}
          <CinematicOrbitHero
            articles={localArticles}
            onStartReading={() => setIsReading(true)}
          />

          {/* MAIN EDITORIAL CONTENT SECTION */}
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 pb-32">
            
            {/* FEATURED STORY SPOTLIGHT */}
            {featured && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="mb-24"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-[1px] flex-1 bg-sage-soft/30"></div>
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-sage flex items-center gap-2">
                    <Sparkles size={14} /> Lead Story of the Day
                  </span>
                  <div className="h-[1px] flex-1 bg-sage-soft/30"></div>
                </div>

                <div 
                  onClick={() => setIsReading(true)}
                  className="cursor-pointer group"
                >
                  <Interactive3DCard
                    image={featured.image_url}
                    title={featured.analysis?.[0]?.short_headline || featured.title}
                    description={featured.analysis?.[0]?.one_sentence_summary || featured.description}
                    tags={[featured.category || 'AI', 'Front Page', 'Curated']}
                    actions={
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-sage group-hover:translate-x-1 transition-transform">
                        Read Story in Full Brief <ArrowRight size={16} />
                      </span>
                    }
                    className="max-w-5xl mx-auto"
                  />
                </div>
              </motion.div>
            )}

            {/* TWO-COLUMN EDITORIAL: GLASS FOLDER SAVED SECTION & METHODOLOGY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24 items-center">
              
              {/* GLASS FOLDER INTERACTIVE CONTAINER */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="flex flex-col items-center lg:items-start"
              >
                <div className="w-full mb-6 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono tracking-widest uppercase text-sage font-bold flex items-center gap-2">
                      <Bookmark size={14} /> Personal Vault
                    </span>
                    <Link href="/read-later" className="group flex items-center gap-2 mt-1">
                      <h3 className="text-3xl font-extrabold text-foreground tracking-tight group-hover:text-sage transition-colors">
                        Saved for Later
                      </h3>
                      <ArrowRight size={22} className="text-sage opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </div>

                  {savedArticles.length > 0 && (
                    <button
                      onClick={handleWipeSaved}
                      disabled={isWiping}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sage-soft/10 hover:bg-sage-soft/20 text-text-secondary hover:text-red-500 border border-sage/20 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer"
                      title="Clear saved articles"
                    >
                      <Trash2 size={13} />
                      {isWiping ? 'Clearing...' : 'Clear'}
                    </button>
                  )}
                </div>

                <p className="text-text-secondary text-sm font-medium mb-8 max-w-md">
                  Click or tap the glass folder below to fan open your bookmarked intelligence briefings.
                </p>

                {/* THE GLASS FOLDER COMPONENT */}
                <div className="relative p-4 rounded-3xl bg-sage-soft/10 dark:bg-black/20 border border-sage/20 backdrop-blur-xl shadow-xl flex items-center justify-center min-h-[340px] w-full">
                  <GlassFolder
                    label="Saved Stories"
                    tone="dark"
                    art="ember"
                    width={330}
                    files={folderFiles}
                    action="more"
                    menu={[
                      { label: "Open Weekend Archive", onSelect: () => window.location.href = '/read-later' }
                    ]}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between w-full px-2">
                  <span className="text-xs font-mono text-text-muted">
                    {savedArticles.length} {savedArticles.length === 1 ? 'item' : 'items'} saved
                  </span>
                  <Link 
                    href="/read-later"
                    className="text-xs font-mono font-bold text-sage hover:underline flex items-center gap-1"
                  >
                    View All Saved <ArrowRight size={12} />
                  </Link>
                </div>
              </motion.div>

              {/* METHODOLOGY & HOW IT WORKS */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <GlowCard glowColor="sage" size="full">
                  <div className="flex flex-col h-full justify-center p-2">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-sage/20 border border-sage/30 flex items-center justify-center text-sage">
                        <Compass className="size-6" />
                      </div>
                      <CartoonMascot state="thinking" size={44} />
                    </div>
                    
                    <h3 className="text-3xl font-extrabold text-foreground mb-4 tracking-tight">
                      Curated Daily Intelligence
                    </h3>
                    
                    <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                      Instead of overwhelming noise, our agentic pipeline filters hundreds of arXiv preprints, GitHub releases, and executive disclosures down to what actually matters.
                    </p>

                    <div className="space-y-4 text-sm text-text-secondary">
                      <div className="flex gap-4 items-start">
                        <span className="font-mono text-sage font-bold text-xs px-2 py-0.5 rounded bg-sage/10">01</span>
                        <p><strong className="text-foreground">Continuous Ingestion:</strong> Tracking leading laboratories, research institutions, and newsletters.</p>
                      </div>
                      <div className="flex gap-4 items-start">
                        <span className="font-mono text-sage font-bold text-xs px-2 py-0.5 rounded bg-sage/10">02</span>
                        <p><strong className="text-foreground">Analytical Synthesis:</strong> Gemini models evaluate novelty, technical relevance, and industry impact.</p>
                      </div>
                      <div className="flex gap-4 items-start">
                        <span className="font-mono text-sage font-bold text-xs px-2 py-0.5 rounded bg-sage/10">03</span>
                        <p><strong className="text-foreground">Tactile Reading:</strong> Swipe right to archive, swipe left to bookmark for the weekend.</p>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-sage/20 flex items-center justify-between">
                      <button
                        onClick={() => setIsReading(true)}
                        className="inline-flex items-center gap-2 text-sm font-bold text-sage hover:text-foreground transition-colors cursor-pointer"
                      >
                        Launch Interactive Feed <ArrowRight size={15} />
                      </button>
                      <span className="font-mono text-[10px] text-gold uppercase tracking-widest bg-sage-soft/20 px-3 py-1 rounded-full border border-gold/20">
                        Live Briefing
                      </span>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>

            </div>

            {/* EDITORIAL ANALYTICS GRID */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="w-full"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-sage-soft/30"></div>
                <h2 className="text-xs font-mono tracking-widest uppercase text-text-muted font-bold">
                  Intelligence Metrics
                </h2>
                <div className="h-[1px] flex-1 bg-sage-soft/30"></div>
              </div>

              <div className="backdrop-blur-xl bg-sage-soft/10 border border-sage/20 rounded-[2rem] p-8 md:p-12 w-full shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                  
                  <div className="p-6 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm">
                    <div className="flex justify-center mb-4 text-sage"><FileText size={28} /></div>
                    <div className="text-3xl font-extrabold text-foreground mb-1">{localArticles.length}</div>
                    <div className="text-xs text-text-secondary font-mono uppercase tracking-wider">Briefings Available</div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm">
                    <div className="flex justify-center mb-4 text-sage"><Activity size={28} /></div>
                    <div className="text-3xl font-extrabold text-foreground mb-1">{totalSources}</div>
                    <div className="text-xs text-text-secondary font-mono uppercase tracking-wider">Sources Monitored</div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm">
                    <div className="flex justify-center mb-4 text-gold"><Clock size={28} /></div>
                    <div className="text-3xl font-extrabold text-foreground mb-1">{totalRead}</div>
                    <div className="text-xs text-text-secondary font-mono uppercase tracking-wider">Completed Stories</div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm">
                    <div className="flex justify-center mb-4 text-sage"><TrendingUp size={28} /></div>
                    <div className="text-3xl font-extrabold text-foreground mb-1">98%</div>
                    <div className="text-xs text-text-secondary font-mono uppercase tracking-wider">Signal to Noise</div>
                  </div>

                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      ) : (
        <motion.div
          key="reader"
          className="fixed inset-0 bg-background flex items-center justify-center overflow-hidden z-50"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.25 } }}
        >
          <Feed initialArticles={feedArticles} onClose={() => setIsReading(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
