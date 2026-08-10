import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Home, Bookmark, Archive, Settings } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Morning Brief",
  description: "Your daily premium AI briefing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased selection:bg-blue-500/30`}>
        {/* Simple Top Nav */}
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50 flex items-center justify-between px-6">
          <Link href="/" className="font-extrabold tracking-tight text-lg flex items-center gap-2">
            <div className="w-6 h-6 bg-black dark:bg-white rounded flex items-center justify-center text-white dark:text-black text-xs">AI</div>
            Morning Brief
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-500 hover:text-black dark:hover:text-white transition" title="Home"><Home size={20} /></Link>
            <Link href="/read-later" className="text-gray-500 hover:text-black dark:hover:text-white transition" title="Read Later"><Bookmark size={20} /></Link>
            <Link href="/archive" className="text-gray-500 hover:text-black dark:hover:text-white transition" title="Archive"><Archive size={20} /></Link>
            <Link href="/dev" className="text-blue-500 hover:text-blue-600 transition" title="Dev Tools"><Settings size={20} /></Link>
          </div>
        </nav>
        
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
