/**
 * 国際化（i18n）設定
 */

export const locales = ["ja", "en", "es", "ko", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ja";

export const localeNames: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
  es: "Español",
  ko: "한국어",
  zh: "中文",
};

export const localeFlags: Record<Locale, string> = {
  ja: "🇯🇵",
  en: "🇬🇧",
  es: "🇪🇸",
  ko: "🇰🇷",
  zh: "🇨🇳",
};
