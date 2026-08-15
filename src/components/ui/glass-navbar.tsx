'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

interface GlassNavbarProps {
  logo?: string;
  navItems?: string[];
  showLogo?: boolean;
}

const defaultProps = {
  logo: "AI Morning Brief",
  navItems: ["Home", "Saved", "Dev"],
  showLogo: true,
};

export default function GlassNavbar({ 
  logo = defaultProps.logo, 
  navItems = defaultProps.navItems, 
  showLogo = defaultProps.showLogo 
}: GlassNavbarProps) {
  const pathname = usePathname();

  const getHref = (item: string) => {
    if (item === "Home") return "/";
    if (item === "Read") return "/read";
    if (item === "Saved") return "/read-later";
    if (item === "Dev") return "/dev";
    return `/${item.toLowerCase()}`;
  };

  return (
    <div className="relative w-full flex items-center justify-center p-4 md:p-8 overflow-hidden z-50">
      <nav className="relative w-full max-w-6xl h-14 md:h-16 bg-gradient-to-b from-sage-soft/40 to-sage-soft/10 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-full flex items-center justify-between px-4 md:px-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.6)] z-10 transition-all duration-300">
        
        <div className="flex items-center gap-3 text-foreground font-semibold text-base md:text-lg">
          {showLogo && (
            <Link href="/" className="flex items-center justify-center text-sage transition-transform duration-300 hover:rotate-180 cursor-pointer">
              <Sparkles size={24} strokeWidth={2} />
            </Link>
          )}
          <Link href="/" className="font-semibold tracking-tight hidden sm:block">
            {logo}
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-6 sm:gap-4">
          {navItems.map((item, index) => {
            const href = getHref(item);
            const isActive = pathname === href;
            
            return (
              <Link
                key={index}
                href={href}
                className={`text-foreground font-medium text-xs md:text-sm px-3 py-1.5 md:px-5 md:py-2 rounded-full transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 ${
                  isActive 
                    ? 'bg-white/40 dark:bg-white/10 text-sage dark:text-sage font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_2px_8px_rgba(0,0,0,0.05)] border border-white/20' 
                    : 'hover:bg-white/20 dark:hover:bg-white/5 text-text-secondary dark:text-text-muted hover:text-foreground border border-transparent'
                }`}
              >
                {item}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
