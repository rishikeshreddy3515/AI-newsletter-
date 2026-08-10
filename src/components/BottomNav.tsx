'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Book, Bookmark } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isRead = pathname === '/read';
  const isReadLater = pathname === '/read-later';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 pb-safe md:hidden">
      <div className="flex items-center justify-around h-16 px-6">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isHome ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          aria-label="Today's News"
        >
          <div className={`p-1 rounded-xl transition-all ${isHome ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>
            <Home size={24} strokeWidth={isHome ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold">Today</span>
        </Link>
        
        <Link 
          href="/read" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isRead ? 'text-green-600 dark:text-green-400' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          aria-label="Read"
        >
          <div className={`p-1 rounded-xl transition-all ${isRead ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
            <Book size={24} strokeWidth={isRead ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold">Read</span>
        </Link>

        <Link 
          href="/read-later" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isReadLater ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          aria-label="Read Later"
        >
          <div className={`p-1 rounded-xl transition-all ${isReadLater ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>
            <Bookmark size={24} strokeWidth={isReadLater ? 2.5 : 2} className={isReadLater ? 'fill-current' : ''} />
          </div>
          <span className="text-[10px] font-bold">Saved</span>
        </Link>
      </div>
    </nav>
  );
}
