// 単語難易度・頻度データベース
// CEFR レベル B2-C2 の単語を判定

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface WordDifficultyInfo {
  word: string;
  cefrLevel: CEFRLevel;
  frequencyRank: number; // 1-20000
  isAcademic: boolean; // Academic Word List に含まれるか
  category?: string; // 分野（science, business, etc.）
}

// CEFR B2レベルの代表的な単語（英検準1級相当）
// 約2000語から一部を抽出
const B2_WORDS = new Set([
  "abandon",
  "abstract",
  "accelerate",
  "accomplish",
  "accumulate",
  "acknowledge",
  "acquisition",
  "advocate",
  "aesthetic",
  "afford",
  "aggregate",
  "allocate",
  "alternative",
  "ambiguous",
  "analyze",
  "anticipate",
  "apparatus",
  "apparent",
  "appreciate",
  "appropriate",
  "arbitrary",
  "assembly",
  "assess",
  "asset",
  "assign",
  "assumption",
  "attribute",
  "authority",
  "behalf",
  "beneficial",
  "bias",
  "boundary",
  "capability",
  "capacity",
  "cease",
  "circumstance",
  "clarify",
  "coefficient",
  "coherent",
  "collapse",
  "commence",
  "commodity",
  "communicate",
  "compile",
  "complement",
  "comprehensive",
  "comprise",
  "conceive",
  "concentrate",
  "conclude",
  "concurrent",
  "conduct",
  "confirm",
  "conflict",
  "consequence",
  "considerable",
  "consistent",
  "constitute",
  "constraint",
  "construct",
  "consult",
  "contemporary",
  "context",
  "contradict",
  "contribute",
  "controversy",
  "convention",
  "convert",
  "cooperate",
  "coordinate",
  "core",
  "corporate",
  "correspond",
  "criteria",
  "crucial",
  "currency",
  "decline",
  "deduce",
  "define",
  "demonstrate",
  "denote",
  "deposit",
  "derive",
  "device",
  "devote",
  "dimension",
  "diminish",
  "discrete",
  "discriminate",
  "displace",
  "display",
  "dispose",
  "distinct",
  "distort",
  "distribute",
  "diverse",
  "domain",
  "domestic",
  "dominant",
  "draft",
  "duration",
  "dynamic",
  "economy",
  "edit",
  "element",
  "eliminate",
  "emerge",
  "emphasis",
  "empirical",
  "enable",
  "encounter",
  "enhance",
  "enormous",
  "ensure",
  "entity",
  "environment",
  "equate",
  "equivalent",
  "erode",
  "establish",
  "ethical",
  "evaluate",
  "eventual",
  "evidence",
  "evolve",
  "exceed",
  "exclude",
  "exhibit",
  "expand",
  "expert",
  "explicit",
  "exploit",
  "expose",
  "external",
  "extract",
  "facilitate",
  "factor",
  "feature",
  "federal",
  "file",
  "finance",
  "flexible",
  "fluctuate",
  "focus",
  "format",
  "formula",
  "framework",
  "function",
  "fund",
  "fundamental",
]);

// CEFR C1レベルの代表的な単語（英検1級相当）
// 約3000語から一部を抽出
const C1_WORDS = new Set([
  "aberration",
  "abolish",
  "abridge",
  "abrupt",
  "absolve",
  "abstain",
  "abstraction",
  "abundance",
  "accentuate",
  "acclaim",
  "accommodate",
  "accord",
  "accrue",
  "acquaint",
  "acquiesce",
  "acumen",
  "adamant",
  "adept",
  "adhere",
  "adjacent",
  "adjunct",
  "administer",
  "advent",
  "adversary",
  "adverse",
  "affinity",
  "affluent",
  "aggravate",
  "agile",
  "alleviate",
  "allocate",
  "allot",
  "allude",
  "ambivalent",
  "amend",
  "analogy",
  "anchor",
  "animate",
  "annex",
  "annotate",
  "anomaly",
  "anonymous",
  "antecedent",
  "anthology",
  "apathy",
  "apparatus",
  "apprehend",
  "apt",
  "arbitrary",
  "arcane",
  "ardent",
  "arduous",
  "articulate",
  "ascertain",
  "ascribe",
  "aspire",
  "assent",
  "assert",
  "assimilate",
  "astute",
  "attest",
  "augment",
  "auspicious",
  "austere",
  "authentic",
  "authorize",
  "autonomous",
  "avert",
  "avid",
  "axiom",
  "backdrop",
  "baffle",
  "bane",
  "barrage",
  "benchmark",
  "benevolent",
  "bereave",
  "besiege",
  "bestow",
  "blatant",
  "blight",
  "bolster",
  "boon",
  "breach",
  "brevity",
  "brisk",
  "buttress",
  "calibrate",
  "candid",
  "candor",
  "capitulate",
  "cardinal",
  "catalyst",
  "categorize",
  "caustic",
  "cessation",
  "chasm",
  "chronicle",
  "circumscribe",
  "circumvent",
  "cite",
  "clamor",
  "clandestine",
  "clemency",
  "coalesce",
  "coerce",
  "cognition",
  "coherence",
  "cohesive",
  "collaborate",
  "collateral",
  "colloquial",
  "commemorate",
  "commend",
  "commensurate",
  "commission",
  "compel",
  "compensate",
  "competent",
  "complacent",
  "complement",
  "comply",
  "component",
  "compound",
  "comprehensive",
]);

// CEFR C2レベルの代表的な単語（ネイティブレベル）
// 高度な語彙
const C2_WORDS = new Set([
  "abstruse",
  "accost",
  "acerbic",
  "acrimonious",
  "adulation",
  "aegis",
  "affable",
  "aggrandize",
  "alacrity",
  "albeit",
  "altruism",
  "amalgamate",
  "ameliorate",
  "anachronism",
  "anathema",
  "anecdote",
  "animosity",
  "antithesis",
  "aphorism",
  "aplomb",
  "apocalyptic",
  "apotheosis",
  "appease",
  "approbation",
  "apropos",
  "archaic",
  "archetype",
  "ardor",
  "arid",
  "arrogate",
  "ascetic",
  "asperity",
  "aspersion",
  "assiduous",
  "atrophy",
  "audacious",
  "auspice",
  "avarice",
  "avuncular",
  "baleful",
  "balk",
  "banality",
  "bastion",
  "beatific",
  "bedlam",
  "begrudge",
  "behemoth",
  "behoove",
  "belabor",
  "beleaguer",
  "belie",
  "bellicose",
  "bemoan",
  "beneficent",
  "benign",
  "berate",
  "bereft",
  "besmirch",
  "betoken",
  "bilk",
  "bivouac",
  "blandishment",
  "blasé",
  "blazon",
  "blithe",
  "bombast",
  "boorish",
  "bourgeois",
  "brazen",
  "bucolic",
  "burgeon",
  "burnish",
  "byzantine",
  "cabal",
  "cacophony",
  "cadence",
  "cajole",
  "calumny",
  "camaraderie",
  "canard",
  "canonical",
  "capacious",
  "capricious",
  "captious",
  "castigate",
  "cataclysm",
  "catharsis",
  "caucus",
  "caveat",
  "celerity",
  "censure",
  "cerebral",
  "chagrin",
  "charlatan",
  "chary",
  "chastise",
  "chicanery",
  "chimera",
  "churlish",
  "circuitous",
  "circumlocution",
  "clairvoyant",
  "clamber",
  "cloister",
  "coax",
  "codify",
  "cogent",
  "cognizant",
  "collusion",
  "comely",
  "commiserate",
  "commodious",
  "compendium",
  "complicit",
  "compunction",
  "concatenate",
  "conciliatory",
  "concomitant",
  "concord",
  "condescend",
  "condone",
  "conducive",
  "conflagration",
  "confluence",
  "confound",
]);

// Academic Word List (AWL) - 学術英語で頻出
const ACADEMIC_WORDS = new Set([
  "abstract",
  "accurate",
  "achieve",
  "acknowledge",
  "acquire",
  "adapt",
  "adequate",
  "adjacent",
  "adjust",
  "administer",
  "adult",
  "advocate",
  "affect",
  "aggregate",
  "aid",
  "albeit",
  "allocate",
  "alter",
  "alternative",
  "ambiguous",
  "amend",
  "analyze",
  "annual",
  "anticipate",
  "apparent",
  "append",
  "appreciate",
  "approach",
  "appropriate",
  "approximate",
  "arbitrary",
  "area",
  "aspect",
  "assemble",
  "assess",
  "assign",
  "assist",
  "assume",
  "assure",
  "attach",
  "attain",
  "attitude",
  "attribute",
  "author",
  "authority",
  "automate",
  "available",
  "aware",
  "behalf",
  "benefit",
  "bias",
  "bond",
  "brief",
  "bulk",
  "capable",
  "capacity",
  "category",
  "cease",
  "challenge",
  "channel",
  "chapter",
  "chart",
  "chemical",
  "circumstance",
  "cite",
  "civil",
  "clarify",
  "classic",
  "clause",
  "code",
  "coherent",
  "coincide",
  "collapse",
  "colleague",
  "commence",
  "comment",
  "commission",
  "commit",
  "commodity",
  "communicate",
  "community",
  "compatible",
  "compensate",
  "compile",
  "complement",
  "complex",
  "component",
  "compound",
  "comprehensive",
  "comprise",
  "compute",
  "conceive",
  "concentrate",
  "concept",
  "conclude",
  "concurrent",
  "conduct",
  "confer",
  "confine",
  "confirm",
]);

// 頻度ランクを計算（簡易版）
// 実際のCOCAデータに基づくランクを使用する場合は外部データを読み込む
function getFrequencyRank(word: string): number {
  const lowerWord = word.toLowerCase();

  // 基礎語彙（上位3000語相当）
  if (lowerWord.length <= 4) return 1000;

  // レベルに基づく大まかなランク
  if (B2_WORDS.has(lowerWord)) return 5000 + Math.floor(Math.random() * 3000);
  if (C1_WORDS.has(lowerWord)) return 8000 + Math.floor(Math.random() * 4000);
  if (C2_WORDS.has(lowerWord)) return 12000 + Math.floor(Math.random() * 5000);

  // デフォルト
  return 10000;
}

// 単語のCEFRレベルを判定
export function getCEFRLevel(word: string): CEFRLevel | null {
  const lowerWord = word.toLowerCase();

  if (C2_WORDS.has(lowerWord)) return "C2";
  if (C1_WORDS.has(lowerWord)) return "C1";
  if (B2_WORDS.has(lowerWord)) return "B2";

  // 短い基本的な単語はB1以下
  if (lowerWord.length <= 4) return "B1";

  return null; // 判定不可
}

// 単語が学術的かどうか
export function isAcademicWord(word: string): boolean {
  return ACADEMIC_WORDS.has(word.toLowerCase());
}

// 単語の難易度情報を取得
export function getWordDifficulty(word: string): WordDifficultyInfo | null {
  const lowerWord = word.toLowerCase();
  const level = getCEFRLevel(lowerWord);

  if (!level) return null;

  return {
    word: lowerWord,
    cefrLevel: level,
    frequencyRank: getFrequencyRank(lowerWord),
    isAcademic: isAcademicWord(lowerWord),
  };
}

// 単語リストをフィルタリング（B2-C2レベルのみ）
export function filterAdvancedWords(
  words: string[],
  options: {
    minLevel?: CEFRLevel;
    maxLevel?: CEFRLevel;
    excludeBasic?: boolean; // 基礎3000語を除外
    academicOnly?: boolean;
  } = {}
): WordDifficultyInfo[] {
  const {
    minLevel = "B2",
    maxLevel = "C2",
    excludeBasic = true,
    academicOnly = false,
  } = options;

  const levelOrder: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const minIndex = levelOrder.indexOf(minLevel);
  const maxIndex = levelOrder.indexOf(maxLevel);

  const results: WordDifficultyInfo[] = [];

  for (const word of words) {
    const info = getWordDifficulty(word);
    if (!info) continue;

    const levelIndex = levelOrder.indexOf(info.cefrLevel);
    if (levelIndex < minIndex || levelIndex > maxIndex) continue;

    if (excludeBasic && info.frequencyRank < 3000) continue;
    if (academicOnly && !info.isAcademic) continue;

    results.push(info);
  }

  // 頻度ランクでソート（より頻出な単語を優先）
  return results.sort((a, b) => a.frequencyRank - b.frequencyRank);
}

// テキストから高度な単語を抽出
export function extractAdvancedWords(
  text: string,
  userKnownWords: Set<string> = new Set()
): WordDifficultyInfo[] {
  // 単語を抽出（英語のみ）
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];

  // 重複を除去
  const uniqueWords = [...new Set(words)];

  // ユーザーが既に知っている単語を除外
  const unknownWords = uniqueWords.filter((w) => !userKnownWords.has(w));

  // C1-C2レベルの単語をフィルタリング
  return filterAdvancedWords(unknownWords, {
    minLevel: "C1",
    maxLevel: "C2",
    excludeBasic: true,
  });
}

// 記事の難易度を分析
export function analyzeTextDifficulty(
  text: string,
  userKnownWords: Set<string> = new Set()
): {
  totalWords: number;
  uniqueWords: number;
  advancedWords: WordDifficultyInfo[];
  difficultyScore: number; // 0-100
  level: "beginner" | "intermediate" | "advanced" | "native";
} {
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const uniqueWords = [...new Set(words)];
  const advancedWords = extractAdvancedWords(text, userKnownWords);

  const advancedRatio = advancedWords.length / Math.max(uniqueWords.length, 1);
  const difficultyScore = Math.min(100, Math.round(advancedRatio * 500));

  let level: "beginner" | "intermediate" | "advanced" | "native";
  if (difficultyScore < 20) level = "beginner";
  else if (difficultyScore < 40) level = "intermediate";
  else if (difficultyScore < 60) level = "advanced";
  else level = "native";

  return {
    totalWords: words.length,
    uniqueWords: uniqueWords.length,
    advancedWords,
    difficultyScore,
    level,
  };
}

// B2-C2レベルの全単語を取得（日次レコメンド用）
export function getAllAdvancedWords(): string[] {
  return [
    ...Array.from(B2_WORDS),
    ...Array.from(C1_WORDS),
    ...Array.from(C2_WORDS),
  ];
}
