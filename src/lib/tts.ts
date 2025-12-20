// Text-to-Speech ユーティリティ

import type { Language } from "@/types/vocabulary";

const LANGUAGE_CODES: Record<Language, string> = {
  english: "en-US",
  spanish: "es-ES",
  korean: "ko-KR",
  chinese: "zh-CN",
};

export function speak(text: string, language: Language = "english"): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Speech synthesis not supported");
    return;
  }

  // 既存の発話をキャンセル
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANGUAGE_CODES[language] || "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  // 利用可能な音声から適切なものを選択
  const voices = window.speechSynthesis.getVoices();
  const languageCode = LANGUAGE_CODES[language];
  const preferredVoice =
    voices.find(
      (v) => v.lang.startsWith(languageCode.split("-")[0]) && v.localService,
    ) || voices.find((v) => v.lang.startsWith(languageCode.split("-")[0]));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
