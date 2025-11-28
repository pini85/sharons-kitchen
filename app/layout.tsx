import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { BottomNav } from "@/components/common/BottomNav";
import { SmoothScroll } from "@/components/common/SmoothScroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sharon's Kitchen",
  description: "Recipe & Meal Suggestion App",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SmoothScroll>
            <div className="min-h-screen pb-20">
              {children}
            </div>
            <BottomNav />
            <Toaster
              position="top-center"
              toastOptions={{
                className: "bg-card border border-border text-foreground",
                duration: 3000,
              }}
            />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
