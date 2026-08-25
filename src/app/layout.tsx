import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
import { Nav } from "@/components/nav";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "prep-tracker", description: "10-week interview prep tracker" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#1a1b1f" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} dark h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint. Default is dark. */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem("theme")==="light")document.documentElement.classList.remove("dark")}catch(e){}` }} />
      </head>
      <body className="min-h-full flex flex-col bg-muted/40 text-foreground font-sans">
        <Nav />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-5 pb-24 md:pb-10 space-y-6">{children}</main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
