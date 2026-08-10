'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';

export default function TopNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Today', href: '/' },
    { name: 'Read', href: '/read' },
    { name: 'Read Later', href: '/read-later' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 z-40 flex items-center justify-between px-6 transition-all">
      <Link href="/" className="font-extrabold tracking-tight text-lg flex items-center gap-2 group">
        <div className="w-6 h-6 bg-black dark:bg-white rounded flex items-center justify-center text-white dark:text-black text-xs group-hover:scale-105 transition-transform">AI</div>
        Morning Brief
      </Link>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                isActive 
                  ? 'bg-black/5 dark:bg-white/10 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
        
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-2"></div>
        
        <Link 
          href="/dev" 
          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors" 
          title="Dev Tools"
        >
          <Settings size={20} />
        </Link>
      </div>
    </nav>
  );
}
