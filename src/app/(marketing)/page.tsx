import {
  BookOpen,
  ChevronRight,
  Globe,
  Newspaper,
  Sparkles,
  Trophy,
  Zap,
  Brain,
  Target,
  TrendingUp,
  Users,
  Star,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* ナビゲーション */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                News<span className="text-cyan-400">Lingua</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition">
                Features
              </a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">
                Pricing
              </a>
              <a href="#faq" className="text-sm text-gray-400 hover:text-white transition">
                FAQ
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/signin"
                className="text-sm text-gray-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-400 hover:to-blue-500 transition shadow-lg shadow-cyan-500/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* 背景エフェクト */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[128px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* バッジ */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-gray-300">
              AI-Powered Language Learning
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Learn Languages with
            <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Real-World News
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-10">
            NewsLinguaは、世界中のニュースを読みながら実践的な語彙力を身につける
            AI搭載の言語学習プラットフォームです。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition shadow-xl shadow-cyan-500/25 hover:shadow-2xl hover:shadow-cyan-500/30"
            >
              無料で始める
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-4 text-lg font-medium bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"
            >
              機能を見る
            </a>
          </div>

          {/* 信頼性指標 */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>1,000+ アクティブユーザー</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>4言語サポート</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>4.9/5.0 評価</span>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              なぜ NewsLingua なのか？
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              従来の語学学習とは一線を画す、ニュースベースの学習アプローチ
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Newspaper className="w-6 h-6" />}
              title="リアルなニュース記事"
              description="BBC、CNN、NHK Worldなど、世界中の信頼できるニュースソースから最新記事を取得"
              gradient="from-cyan-500 to-blue-600"
            />
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="AI単語解析"
              description="記事内の難しい単語を自動検出し、レベルに合った解説を表示"
              gradient="from-purple-500 to-pink-600"
            />
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="CEFRレベル診断"
              description="語彙力・読解力テストであなたのレベルを正確に診断"
              gradient="from-amber-500 to-orange-600"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="スペースド・レピティション"
              description="科学的な復習間隔で効率的に単語を記憶"
              gradient="from-green-500 to-emerald-600"
            />
            <FeatureCard
              icon={<Trophy className="w-6 h-6" />}
              title="ゲーミフィケーション"
              description="ストリーク、バッジ、レベルシステムで楽しく継続"
              gradient="from-rose-500 to-red-600"
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="進捗トラッキング"
              description="詳細な統計ダッシュボードで学習の成果を可視化"
              gradient="from-indigo-500 to-violet-600"
            />
          </div>
        </div>
      </section>

      {/* 対応言語 */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#0d0d15]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            4言語に対応
          </h2>
          <p className="text-lg text-gray-400 mb-12">
            英語、スペイン語、韓国語、中国語の学習をサポート
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <LanguageCard flag="🇺🇸" name="English" level="B1-C2" />
            <LanguageCard flag="🇪🇸" name="Español" level="A2-B2" />
            <LanguageCard flag="🇰🇷" name="한국어" level="A1-B1" />
            <LanguageCard flag="🇨🇳" name="中文" level="A1-B1" />
          </div>
        </div>
      </section>

      {/* 料金プラン */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              シンプルな料金プラン
            </h2>
            <p className="text-lg text-gray-400">
              無料で始めて、必要に応じてアップグレード
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              name="Free"
              price="¥0"
              period="forever"
              features={[
                "毎日5記事まで読める",
                "基本的な単語解析",
                "進捗トラッキング",
                "CEFRレベル診断",
              ]}
              cta="無料で始める"
              href="/signup"
            />
            <PricingCard
              name="Pro"
              price="¥980"
              period="/月"
              features={[
                "無制限の記事アクセス",
                "高度なAI単語解析",
                "オフライン学習",
                "優先サポート",
                "広告なし",
              ]}
              cta="Proを始める"
              href="/signup?plan=pro"
              popular
            />
            <PricingCard
              name="Business"
              price="¥4,980"
              period="/月"
              features={[
                "Proの全機能",
                "チーム管理",
                "進捗レポート",
                "API アクセス",
                "カスタムコンテンツ",
              ]}
              cta="お問い合わせ"
              href="/contact"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-purple-500/10 border border-white/10 p-12 text-center">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                今すぐ学習を始めよう
              </h2>
              <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                NewsLinguaで、ニュースを読みながら実践的な語彙力を身につけましょう。
                無料で始められます。
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-white text-[#0a0a0f] rounded-xl hover:bg-gray-100 transition shadow-xl"
              >
                <BookOpen className="w-5 h-5" />
                無料アカウントを作成
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">
              News<span className="text-cyan-400">Lingua</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition">利用規約</a>
            <a href="#" className="hover:text-white transition">プライバシーポリシー</a>
            <a href="#" className="hover:text-white transition">お問い合わせ</a>
          </div>
          
          <p className="text-sm text-gray-600">
            © 2024 NewsLingua. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
      <div className={`inline-flex p-3 mb-4 rounded-xl bg-gradient-to-br ${gradient}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function LanguageCard({
  flag,
  name,
  level,
}: {
  flag: string;
  name: string;
  level: string;
}) {
  return (
    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-center hover:bg-white/[0.04] hover:border-white/10 transition-all">
      <span className="text-5xl mb-4 block">{flag}</span>
      <p className="font-semibold mb-1">{name}</p>
      <p className="text-sm text-gray-500">{level}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  href,
  popular,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
}) {
  return (
    <div
      className={`relative p-8 rounded-2xl border ${
        popular
          ? "bg-gradient-to-b from-cyan-500/10 to-blue-600/10 border-cyan-500/30"
          : "bg-white/[0.02] border-white/5"
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-xs font-medium">
          Most Popular
        </div>
      )}
      
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-gray-500">{period}</span>
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {feature}
          </li>
        ))}
      </ul>
      
      <Link
        href={href}
        className={`block w-full py-3 text-center font-medium rounded-xl transition ${
          popular
            ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
            : "bg-white/5 border border-white/10 hover:bg-white/10"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

