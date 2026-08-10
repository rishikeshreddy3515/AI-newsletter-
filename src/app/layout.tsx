import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

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
        <TopNav />
        
        <div className="pt-16 pb-16 md:pb-0">
          {children}
        </div>

        <BottomNav />
      </body>
    </html>
  );
}
