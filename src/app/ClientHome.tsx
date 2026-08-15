'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Feed from './Feed';
import Interactive3DCard from '@/components/ui/interactive-3d-card';
import { GlowCard } from '@/components/ui/spotlight-card';
import DisplayCards from '@/components/ui/display-cards';
import { pageTransition, staggerContainer, fadeUp } from '@/lib/animations';
import { Sparkles, Activity, FileText, Clock, TrendingUp } from 'lucide-react';
import CartoonMascot from '@/components/CartoonMascot';
import { SplineScene } from '@/components/ui/splite';

export default function ClientHome({ articles }: { articles: any[] }) {
  const [isReading, setIsReading] = useState(false);

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

  const unreadArticles = articles.filter(a => !isArticleCompleted(a));
  const hasUnread = unreadArticles.length > 0;
  const feedArticles = hasUnread ? unreadArticles : articles;

  if (articles.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <CartoonMascot state="thinking" size={120} />
        <h2 className="mt-8 text-2xl font-bold text-foreground">You're all caught up.</h2>
        <p className="mt-2 text-text-secondary">No new AI news to report right now.</p>
      </div>
    );
  }

  const featured = articles[0];
  const savedArticles = articles.filter(isArticleSaved);
  
  const gridArticles = savedArticles.map(article => ({
    title: article.analysis?.[0]?.short_headline || article.title,
    description: article.analysis?.[0]?.one_sentence_summary || "Read more about this topic.",
    date: article.category,
  }));

  // Analytics Math
  const totalRead = articles.filter(isArticleRead).length;
  const totalSources = 12; // Static or computed from actual sources if available

  return (
    <AnimatePresence mode="wait">
      {!isReading ? (
        <motion.div 
          key="dashboard"
          className="min-h-screen p-6 md:p-12 lg:p-24 max-w-6xl mx-auto pb-32"
          {...pageTransition}
        >
          {/* EDITORIAL HERO */}
          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-8 mb-32 min-h-[50vh]"
          >
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-1">
              <motion.span suppressHydrationWarning variants={fadeUp} className="text-sage font-mono tracking-widest uppercase text-sm mb-6 flex items-center gap-2">
                <Sparkles size={16} /> Edition <span suppressHydrationWarning>{new Date().toLocaleDateString()}</span>
              </motion.span>
              
              <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-8 text-foreground max-w-2xl">
                YOUR DAILY INTELLIGENCE,<br/>
                <span className="text-sage">CURATED BY AI.</span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-lg md:text-xl text-text-secondary font-medium max-w-xl mb-12">
                The most important stories, breakthroughs, and developments in artificial intelligence you actually need to know.
              </motion.p>
              
              <motion.div variants={fadeUp}>
                <button 
                  onClick={() => setIsReading(true)}
                  className="group relative flex h-14 items-center justify-center overflow-hidden rounded-full border border-sage/40 bg-foreground/90 px-10 text-background shadow-lg transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 text-sm font-medium"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {hasUnread ? "Start Reading" : "Read Again"}
                  </span>
                </button>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} className="w-full h-[350px] sm:h-[400px] lg:h-[550px] relative order-2 mt-8 lg:mt-0 flex items-center justify-center overflow-visible pointer-events-auto">
              <SplineScene 
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" 
                className="w-full h-full"
              />
            </motion.div>
          </motion.div>

          {/* FEATURED NEWSLETTER */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-32 cursor-pointer"
            onClick={() => setIsReading(true)}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] flex-1 bg-sage-soft/30"></div>
              <h2 className="text-sm font-mono tracking-widest uppercase text-text-muted">Featured Briefing</h2>
              <div className="h-[1px] flex-1 bg-sage-soft/30"></div>
            </div>

            <Interactive3DCard
              image={featured.image_url}
              title={featured.analysis?.[0]?.short_headline || featured.title}
              description={featured.analysis?.[0]?.one_sentence_summary}
              tags={[featured.category, 'AI', 'Curated']}
              actions={<span className="text-sm font-bold text-sage">Read Briefing →</span>}
              className="max-w-4xl cursor-pointer"
            />
          </motion.div>

          {/* AI / NEWSLETTER FEATURE & RECENT TRENDING */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <GlowCard glowColor="sage" size="full">
                <div className="flex flex-col h-full justify-center">
                  <Activity className="size-10 text-sage mb-6" />
                  <h3 className="text-3xl font-bold text-foreground mb-4 tracking-tight">How It Works</h3>
                  <div className="space-y-6 text-text-secondary">
                    <div className="flex gap-4 items-start">
                      <span className="font-mono text-sage font-bold">01</span>
                      <p>AI continuously monitors global tech sources and journalism.</p>
                    </div>
                    <div className="flex gap-4 items-start">
                      <span className="font-mono text-sage font-bold">02</span>
                      <p>Articles are analyzed, summarized, and fact-checked.</p>
                    </div>
                    <div className="flex gap-4 items-start">
                      <span className="font-mono text-sage font-bold">03</span>
                      <p>Your personalized briefing is compiled and delivered.</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 font-mono text-xs text-gold uppercase tracking-widest bg-sage-soft/20 self-start px-4 py-2 rounded-full border border-gold/20">
                    System Active
                  </div>
                </div>
              </GlowCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center lg:items-end justify-center min-h-[400px]"
              onClick={() => setIsReading(true)}
            >
              <div className="w-full max-w-sm mb-8 text-center lg:text-right">
                <h3 className="text-2xl font-bold text-foreground tracking-tight">Saved for Later</h3>
                <p className="text-text-secondary mt-2">Articles you bookmarked to read.</p>
              </div>
              <div className="w-full max-w-sm cursor-pointer" onClick={() => setIsReading(true)}>
                <DisplayCards cards={gridArticles} />
              </div>
            </motion.div>
          </div>

          {/* NEWSLETTER STATISTICS (Glassmorphism Stats) */}
          <motion.div
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8, ease: "easeOut" }}
             className="w-full"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] flex-1 bg-sage-soft/30"></div>
              <h2 className="text-sm font-mono tracking-widest uppercase text-text-muted">Your Analytics</h2>
              <div className="h-[1px] flex-1 bg-sage-soft/30"></div>
            </div>

            <div className="backdrop-blur-xl bg-sage-soft/10 border border-sage/20 rounded-[2rem] p-8 md:p-12 w-full shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/60 to-white/20 dark:from-white/10 dark:to-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-center mb-4 text-sage"><FileText size={32} /></div>
                  <div className="text-3xl font-bold text-foreground mb-1">{articles.length}</div>
                  <div className="text-sm text-text-secondary font-mono uppercase tracking-wider">Total Briefings</div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-sage-soft/40 to-sage-soft/10 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-center mb-4 text-sage"><Activity size={32} /></div>
                  <div className="text-3xl font-bold text-foreground mb-1">{totalSources}</div>
                  <div className="text-sm text-text-secondary font-mono uppercase tracking-wider">Sources Scanned</div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-center mb-4 text-gold"><Clock size={32} /></div>
                  <div className="text-3xl font-bold text-foreground mb-1">{totalRead}</div>
                  <div className="text-sm text-text-secondary font-mono uppercase tracking-wider">Articles Read</div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-sage/20 to-sage/5 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-center mb-4 text-sage"><TrendingUp size={32} /></div>
                  <div className="text-3xl font-bold text-foreground mb-1">94%</div>
                  <div className="text-sm text-text-secondary font-mono uppercase tracking-wider">Topic Match</div>
                </div>

              </div>
            </div>
          </motion.div>

        </motion.div>
      ) : (
        <motion.div
          key="reader"
          className="fixed inset-0 bg-background flex items-center justify-center overflow-hidden z-50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.3 } }}
        >
          <Feed initialArticles={feedArticles} onClose={() => setIsReading(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
