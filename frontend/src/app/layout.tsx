import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Spag - AI Health Partner",
  description: "Your modern, premium AI health companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col font-sans`}
      >
        <LoaderProvider>
          <TopNav />
          {/* Main content wrapper supports full-screen sections or sidebars later */}
          <main className="flex-1 flex flex-col min-h-screen pt-[72px]">
            {children}
          </main>
        </LoaderProvider>
      </body>
    </html>
  );
}
