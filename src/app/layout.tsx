import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#060b13",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://sportsgrid.app"),
  title: "SportsGrid | The Daily 4×4 Multi-Sport Trivia Grid",
  description:
    "The daily 4×4 all-sports trivia matrix connecting NFL, NBA, MLB, and NHL with cross-sport stats, accolades, and markets.",
  applicationName: "SportsGrid",
  appleWebApp: {
    capable: true,
    title: "SportsGrid",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sportsgrid.app",
    siteName: "SportsGrid",
    title: "SportsGrid | The Daily 4×4 Multi-Sport Trivia Grid",
    description:
      "Play the daily 4×4 all-sports trivia matrix connecting NFL, NBA, MLB, and NHL with cross-sport stats, accolades, and markets.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SportsGrid 4x4 Trivia Matrix Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SportsGrid | The Daily 4×4 Multi-Sport Trivia Grid",
    description:
      "Daily 4×4 all-sports trivia matrix connecting NFL, NBA, MLB, and NHL with cross-sport stats and accolades.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Chakra+Petch:wght@500;600;700;800&family=Graduate&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-black text-zinc-100 font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
