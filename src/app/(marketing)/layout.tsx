import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NewsLingua - Learn Languages with Real-World News",
  description:
    "AI搭載の言語学習プラットフォーム。世界のニュースを読みながら実践的な語彙力を身につけよう。",
  keywords: [
    "語学学習",
    "英語学習",
    "ニュースで学ぶ",
    "AI言語学習",
    "CEFR",
    "スペイン語",
    "韓国語",
    "中国語",
  ],
  openGraph: {
    title: "NewsLingua - Learn Languages with Real-World News",
    description:
      "AI搭載の言語学習プラットフォーム。世界のニュースを読みながら実践的な語彙力を身につけよう。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "NewsLingua - Learn Languages with Real-World News",
    description:
      "AI搭載の言語学習プラットフォーム。世界のニュースを読みながら実践的な語彙力を身につけよう。",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

