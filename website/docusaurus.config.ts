import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "NewsLingua",
  tagline: "ニュースで学ぶ多言語ボキャブラリー",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  url: "https://newslingua.dev",
  baseUrl: "/",

  organizationName: "newslingua",
  projectName: "newslingua",

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "ja",
    locales: ["ja", "en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/newslingua/newslingua/tree/main/website/",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          editUrl:
            "https://github.com/newslingua/newslingua/tree/main/website/",
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/newslingua-social-card.jpg",
    colorMode: {
      defaultMode: "light",
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "NewsLingua",
      logo: {
        alt: "NewsLingua Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "ドキュメント",
        },
        {
          to: "/docs/api",
          label: "API",
          position: "left",
        },
        {
          href: "https://github.com/newslingua/newslingua",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "ドキュメント",
          items: [
            {
              label: "はじめに",
              to: "/docs",
            },
            {
              label: "アーキテクチャ",
              to: "/docs/architecture",
            },
            {
              label: "API仕様",
              to: "/docs/api",
            },
          ],
        },
        {
          title: "開発",
          items: [
            {
              label: "ロードマップ",
              to: "/docs/roadmap",
            },
            {
              label: "MCP統合",
              to: "/docs/mcp-integration",
            },
          ],
        },
        {
          title: "その他",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/newslingua/newslingua",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} NewsLingua. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "json", "typescript", "python"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
