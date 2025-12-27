import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          📰 {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs">
            ドキュメントを読む →
          </Link>
        </div>
      </div>
    </header>
  );
}

function FeatureCard({
  title,
  emoji,
  description,
}: {
  title: string;
  emoji: string;
  description: string;
}) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center padding-horiz--md">
        <div style={{ fontSize: "3rem" }}>{emoji}</div>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <FeatureCard
            emoji="📰"
            title="ニュースで学ぶ"
            description="世界のニュースを読みながら、実践的な語彙力を身につけます。"
          />
          <FeatureCard
            emoji="🤖"
            title="AI学習支援"
            description="MCPベースのAIアシスタントが、あなたの学習をサポートします。"
          />
          <FeatureCard
            emoji="🎮"
            title="ゲーミフィケーション"
            description="ストリーク、バッジ、XPで楽しく継続的に学習できます。"
          />
        </div>
        <div className="row" style={{ marginTop: "2rem" }}>
          <FeatureCard
            emoji="🎓"
            title="CEFRレベル判定"
            description="あなたの語彙力・読解力をCEFR基準で診断します。"
          />
          <FeatureCard
            emoji="🌐"
            title="多言語対応"
            description="英語、スペイン語、韓国語、中国語など複数言語に対応。"
          />
          <FeatureCard
            emoji="📱"
            title="マルチプラットフォーム"
            description="Web、iOS、Androidで同じ学習体験を提供します。"
          />
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} ドキュメント`}
      description="ニュースで学ぶ多言語ボキャブラリー学習プラットフォーム"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
