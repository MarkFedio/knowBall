import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SportsGrid | The 4×4 Multi-Sport Trivia Grid",
  description: "The daily 4×4 all-sports trivia matrix connecting the NFL, NBA, MLB, and NHL with cross-sport stats, accolades, and markets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-black text-zinc-100 font-sans">{children}</body>
    </html>
  );
}
