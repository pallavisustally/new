import type { Metadata } from "next";
import { Inter, Poppins, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../components/ThemeProvider";
import ThemeToggle from "../components/ThemeToggle";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sustally Scope 2 Assessment",
  description: "Scope 2 self assessment from Sustally, your impact ally.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var p=location.pathname;var locked=p==='/scope/certificate'||p.indexOf('/scope/certificate/')===0||p==='/dashboard'||p.indexOf('/dashboard/')===0;if(!locked&&localStorage.getItem('sustally-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <div className="fixed top-3 right-3 z-50 md:top-4 md:right-4">
            <ThemeToggle />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
