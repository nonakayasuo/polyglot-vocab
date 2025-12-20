"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { Language } from "@/types/vocabulary";
import { LANGUAGES } from "@/types/vocabulary";

// 言語設定の型
interface LanguageConfig {
  value: Language;
  label: string;
  flag: string;
  ttsCode: string;
}

// TTS言語コードのマッピング
const TTS_CODES: Record<Language, string> = {
  english: "en-US",
  spanish: "es-ES",
  korean: "ko-KR",
  chinese: "zh-CN",
};

// 言語設定を取得
export function getLanguageConfig(language: Language): LanguageConfig {
  const info = LANGUAGES.find((l) => l.value === language);
  return {
    value: language,
    label: info?.label ?? language,
    flag: info?.flag ?? "🌐",
    ttsCode: TTS_CODES[language],
  };
}

// コンテキストの型
interface LanguageContextValue {
  language: Language;
  config: LanguageConfig;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// プロバイダー
interface LanguageProviderProps {
  language: Language;
  children: ReactNode;
}

export function LanguageProvider({
  language,
  children,
}: LanguageProviderProps) {
  const config = getLanguageConfig(language);

  return (
    <LanguageContext.Provider value={{ language, config }}>
      {children}
    </LanguageContext.Provider>
  );
}

// カスタムフック
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// オプショナル版（コンテキスト外でも使用可能）
export function useLanguageOptional() {
  return useContext(LanguageContext);
}

