'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Feed from './Feed';
import CartoonMascot from '@/components/CartoonMascot';
import { pageTransition, staggerContainer, fadeUp } from '@/lib/animations';

export default function ClientHome({ articles }: { articles: any[] }) {
  const [isReading, setIsReading] = useState(false);

  // If we have no articles, show empty state immediately
  if (articles.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <CartoonMascot state="thinking" size={120} />
        <h2 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">You're all caught up.</h2>
        <p className="mt-2 text-gray-500">No new AI news to report right now.</p>
      </div>
    );
  }

  const featured = articles[0];
  const gridArticles = articles.slice(1, 5); // Take next 4 for the grid

  return (
    <AnimatePresence mode="wait">
      {!isReading ? (
        <motion.div 
          key="dashboard"
          className="min-h-screen p-6 md:p-12 lg:p-24 max-w-7xl mx-auto"
          {...pageTransition}
        >
          <header className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-black text-xl">
                AI
              </div>
              <span className="font-bold tracking-tight text-xl">Morning Brief</span>
            </div>
            <nav className="hidden md:flex gap-8 text-sm font-semibold text-gray-500">
              <a href="#" className="text-black dark:text-white">Today</a>
              <a href="#">Research</a>
              <a href="#">Models</a>
              <a href="/read-later">Read Later</a>
            </nav>
          </header>

          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            animate="show"
            className="mb-16 md:flex justify-between items-end gap-8"
          >
            <motion.div variants={fadeUp} className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.1] mb-6">
                While you were sleeping,<br/>
                AI moved <span className="text-blue-600 dark:text-blue-400">again.</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium">
                Here is what actually mattered in AI today, distilled for you.
              </p>
            </motion.div>
            
            <motion.div variants={fadeUp} className="mt-8 md:mt-0 flex items-center gap-6">
              <CartoonMascot state="idle" size={80} />
              <button 
                onClick={() => setIsReading(true)}
                className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform active:scale-95 shadow-xl"
              >
                Start Reading
              </button>
            </motion.div>
          </motion.div>

          {/* Featured Article */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-12">
            <div className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-xl cursor-pointer" onClick={() => setIsReading(true)}>
              <div className="md:flex">
                <div className="md:w-1/2 h-64 md:h-auto bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                   {featured.image_url ? (
                     <img src={featured.image_url} alt="Featured" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                       <span className="font-mono text-xs uppercase tracking-widest">{featured.category}</span>
                     </div>
                   )}
                </div>
                <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest rounded-full self-start mb-4">
                    Top Story
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">{featured.analysis[0]?.short_headline || featured.title}</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">{featured.analysis[0]?.one_sentence_summary}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gridArticles.map((article, i) => (
              <motion.div 
                key={article.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                onClick={() => setIsReading(true)}
                className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md cursor-pointer transition-shadow"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">{article.category}</span>
                <h3 className="font-bold leading-snug">{article.analysis[0]?.short_headline || article.title}</h3>
              </motion.div>
            ))}
          </div>

        </motion.div>
      ) : (
        <motion.div
          key="reader"
          className="fixed inset-0 bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden z-50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.3 } }}
        >
          {/* A close button to go back to dashboard */}
          <button 
            onClick={() => setIsReading(false)}
            className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/50 dark:bg-black/50 backdrop-blur rounded-full flex items-center justify-center font-bold shadow-sm hover:scale-105 transition-transform"
          >
            ✕
          </button>
          <Feed initialArticles={articles} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
