"use client";

import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Flame,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Newspaper,
  Settings,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FeatureSection {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  steps: string[];
  tips?: string[];
}

const FEATURES: FeatureSection[] = [
  {
    id: "news",
    title: "ニュースで学ぶ",
    icon: Newspaper,
    description:
      "最新の英語ニュースを読みながら、実践的な語彙力を身につけましょう。",
    steps: [
      "メニューから「ニュース」を選択",
      "興味のある記事をタップして開く",
      "わからない単語があればタップして意味を確認",
      "「単語帳に追加」で保存して後から復習",
    ],
    tips: [
      "コンテンツ設定で好みのカテゴリを選択すると、興味のある記事が優先表示されます",
      "記事を読み終わったら、ディスカッションで感想を共有できます",
    ],
  },
  {
    id: "vocabulary",
    title: "単語帳",
    icon: BookOpen,
    description: "保存した単語を効率的に復習し、確実に定着させましょう。",
    steps: [
      "メニューから「単語帳」を選択",
      "学習したい単語を選んでタップ",
      "発音を聞いて正しい発音を覚える",
      "チェックボックスで習得度を管理",
    ],
    tips: [
      "3回チェックを入れると「習得済み」になります",
      "1〜2回のチェックは「学習中」として表示されます",
      "チェックなしの単語は「未着手」としてカウントされます",
    ],
  },
  {
    id: "assessment",
    title: "レベル診断",
    icon: Trophy,
    description:
      "CEFRに基づいたレベル診断で、今の英語力を客観的に把握できます。",
    steps: [
      "メニューから「レベル診断」を選択",
      "語彙力テストを受験（約10分）",
      "結果を確認してレベルを把握",
      "おすすめの学習プランを確認",
    ],
    tips: [
      "定期的にテストを受けて成長を実感しましょう",
      "CEFRレベル: A1(初級) → A2 → B1 → B2 → C1 → C2(上級)",
    ],
  },
  {
    id: "slang",
    title: "スラングテスト",
    icon: Flame,
    description:
      "ネイティブが使うカジュアルな表現やスラングの理解度をチェックできます。",
    steps: [
      "メニューから「スラングテスト」を選択",
      "クイズ形式で10問に回答",
      "正解・不正解を確認して学習",
      "スコアで理解度を把握",
    ],
    tips: [
      "SNSや映画でよく使われる表現が出題されます",
      "ビジネスシーンでは使用を避けるべき表現もあります",
    ],
  },
  {
    id: "community",
    title: "コミュニティ",
    icon: Users,
    description: "ランキングで他のユーザーと競い合い、モチベーションをアップ。",
    steps: [
      "メニューから「コミュニティ」を選択",
      "週間・総合ランキングを確認",
      "自分の順位とXPを確認",
      "学習を続けてランキングを上げよう",
    ],
    tips: [
      "毎週月曜日に週間ランキングがリセットされます",
      "学習するたびにXPが獲得できます",
    ],
  },
  {
    id: "achievements",
    title: "実績・バッジ",
    icon: Award,
    description: "学習の成果をバッジとして獲得し、成長を実感しましょう。",
    steps: [
      "メニューから「実績」を選択",
      "獲得済みバッジと未獲得バッジを確認",
      "各バッジの条件と進捗を確認",
      "バッジを獲得してXPボーナスをゲット",
    ],
    tips: [
      "バッジにはレアリティがあり、レアなほどXP報酬が高くなります",
      "語彙、読書、継続などカテゴリごとにバッジがあります",
    ],
  },
  {
    id: "content-settings",
    title: "コンテンツ設定",
    icon: MessageSquare,
    description: "好みのカテゴリを設定して、パーソナライズされた学習体験を。",
    steps: [
      "メニューから「コンテンツ設定」を選択",
      "興味のあるカテゴリにチェック",
      "見たくないカテゴリをブロック",
      "スラング・タブー表現の表示設定を調整",
    ],
    tips: [
      "優先カテゴリの記事が上位に表示されます",
      "ブロックしたカテゴリの記事は非表示になります",
      "スラング表示をオンにするとカジュアルな表現も学べます",
    ],
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "習得済み・学習中・未着手の違いは？",
    answer:
      "単語帳の各単語には3つのチェックボックスがあります。3回全てチェックすると「習得済み」、1〜2回チェックすると「学習中」、チェックなしは「未着手」となります。復習のたびにチェックを増やして、確実に定着させましょう。",
  },
  {
    question: "CEFRレベルとは？",
    answer:
      "CEFR（セファール）は、ヨーロッパ言語共通参照枠の略で、言語能力を6段階（A1〜C2）で評価する国際基準です。A1が初級、C2が最上級レベルです。NewsLinguaでは語彙力診断でこのレベルを判定します。",
  },
  {
    question: "スラング表示の設定はどこにありますか？",
    answer:
      "メニュー → コンテンツ設定 から「スラング表示」と「タブー表現表示」のオン/オフを切り替えられます。学習目的に応じて設定してください。",
  },
  {
    question: "単語はどうやって追加しますか？",
    answer:
      "ニュース記事を読んでいる時に、わからない単語をタップすると意味が表示されます。「単語帳に追加」ボタンを押すと、その単語が単語帳に保存されます。",
  },
  {
    question: "データは同期されますか？",
    answer:
      "ログインしている場合、学習データはクラウドに自動保存されます。複数のデバイスから同じアカウントでログインすれば、学習進捗を引き継げます。",
  },
  {
    question: "オフラインで使えますか？",
    answer:
      "保存済みの単語帳はオフラインでも閲覧できます。ただし、新しいニュース記事の取得やAI機能はインターネット接続が必要です。",
  },
];

export default function HelpPage() {
  const [expandedFeature, setExpandedFeature] = useState<string | null>("news");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* ヘッダー */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ホームに戻る</span>
            </Link>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-slate-900 dark:text-white">
                ヘルプ・使い方
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* イントロセクション */}
        <section className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            NewsLinguaへようこそ
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            ニュースを読みながら英語の語彙力を効率的に伸ばすアプリです。
            <br />
            このページでは、アプリの使い方と各機能について説明します。
          </p>
        </section>

        {/* クイックスタート */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6" />
              <h2 className="text-xl font-bold">クイックスタート</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/20 rounded-xl p-4">
                <div className="text-3xl font-bold mb-1">1</div>
                <div className="font-medium mb-1">ニュースを読む</div>
                <p className="text-sm opacity-90">
                  興味のある記事を選んで読み始めましょう
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <div className="text-3xl font-bold mb-1">2</div>
                <div className="font-medium mb-1">単語をタップ</div>
                <p className="text-sm opacity-90">
                  わからない単語をタップして意味を確認
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <div className="text-3xl font-bold mb-1">3</div>
                <div className="font-medium mb-1">復習する</div>
                <p className="text-sm opacity-90">
                  保存した単語を単語帳で繰り返し学習
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 機能説明 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-500" />
            各機能の使い方
          </h2>
          <div className="space-y-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              const isExpanded = expandedFeature === feature.id;

              return (
                <div
                  key={feature.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedFeature(isExpanded ? null : feature.id)
                    }
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-700">
                      {/* 手順 */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                          手順
                        </h4>
                        <ol className="space-y-2">
                          {feature.steps.map((step, index) => (
                            <li key={step} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center justify-center">
                                {index + 1}
                              </span>
                              <span className="text-slate-600 dark:text-slate-400">
                                {step}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* ヒント */}
                      {feature.tips && feature.tips.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                              ヒント
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {feature.tips.map((tip) => (
                              <li
                                key={tip}
                                className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2"
                              >
                                <span>•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 学習ステータスの説明 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            学習ステータスについて
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              ホーム画面に表示される学習ステータスは、単語帳の各単語のチェック状態に基づいています。
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    習得済み
                  </span>
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  3回全てのチェックが入った単語
                </p>
                <p className="text-xs text-emerald-500 mt-1">
                  完全に覚えた単語としてカウント
                </p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-blue-700 dark:text-blue-400">
                    学習中
                  </span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  1〜2回チェックが入った単語
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  まだ復習が必要な単語
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-400 flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    未着手
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  チェックが入っていない単語
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  これから学習する単語
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* よくある質問 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-purple-500" />
            よくある質問
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isExpanded = expandedFAQ === index;

              return (
                <div
                  key={item.question}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFAQ(isExpanded ? null : index)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <span className="font-medium text-slate-900 dark:text-white pr-4">
                      {item.question}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* サポートセクション */}
        <section className="text-center">
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-8">
            <Settings className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              お困りの場合は
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              このヘルプで解決しない場合は、設定画面からお問い合わせください。
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              <Settings className="w-4 h-4" />
              設定を開く
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
