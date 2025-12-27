import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NewsLingua - ニュースで学ぶ語学プラットフォーム",
  description:
    "BBC、CNN、NHK Worldなどのニュースで英語・スペイン語・韓国語・中国語を学ぶ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-gradient-radial">
        {children}
      </body>
    </html>
  );
}
