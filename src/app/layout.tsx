import type { Metadata } from "next";
import { Space_Grotesk, Doto } from "next/font/google";
import "./globals.css";
import GlassNavbar from "@/components/ui/glass-navbar";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const doto = Doto({ 
  subsets: ["latin"],
  variable: '--font-doto',
  display: 'swap',
});

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
      <body className={`${spaceGrotesk.variable} ${doto.variable} bg-background text-foreground antialiased selection:bg-sage/30`}>
        <GlassNavbar 
          logo="AI Morning Brief"
          navItems={["Home", "Saved", "Dev"]}
          showLogo={true}
        />
        
        <div className="pb-16 md:pb-0">
          {children}
        </div>
      </body>
    </html>
  );
}
