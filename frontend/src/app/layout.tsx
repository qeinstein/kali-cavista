import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import { LoaderProvider } from "@/app/context/LoaderContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spag - AI Health Partner",
  description: "Your modern, premium AI health companion.",
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< Updated upstream
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased bg-background text-foreground min-h-screen flex flex-col font-sans`}
      >
        <LoaderProvider>
          <TopNav />
          {/* Main content wrapper supports full-screen sections or sidebars later */}
          <main className="flex-1 flex flex-col min-h-screen pt-[72px]">
            {children}
          </main>
        </LoaderProvider>
=======
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased bg-background text-foreground min-h-screen flex flex-col font-sans`}
      >
        <ThemeProvider>
          <LoaderProvider>
            <TopNav />
            {/* Main content wrapper supports full-screen sections or sidebars later */}
            <main className="flex-1 flex flex-col min-h-screen pt-[72px]">
              {children}
            </main>
          </LoaderProvider>

          {/* Floating Action Buttons Group */}
          <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4">
            <FloatingAI />
            <VoiceNavigator />
          </div>
        </ThemeProvider>
>>>>>>> Stashed changes
      </body>
    </html>
  );
}
