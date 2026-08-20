export type TasteDailyWisdomEntry = {
	id: string;
	text: string;
	attribution?: string;
};

export const TASTE_DAILY_WISDOM_EN: TasteDailyWisdomEntry[] = [
  { id: "catch-this-moment", text: "Catch this moment." },
  { id: "cling-to-nothing", text: "Cling to nothing." },
  { id: "not-the-emotion", text: "You are not the emotion." },
  { id: "one-breath-return", text: "One breath is already a return." },
  { id: "watch-without-chase", text: "Watch the thought; do not chase it." },
  { id: "enough-for-now", text: "This is enough for now." },
  { id: "asai-floating-world", text: "Live in this moment—savor the moon, the snow, the cherry blossoms and the maple leaves. Even if poverty stands before you, do not worry. The heart is like a floating gourd; follow the stream. This is the floating world.",
    attribution: "Asai Ryōi · Tales of the Floating World · 17th c." },
  { id: "dogen-study-self", text: "To study the Way is to study the self. To study the self is to forget the self.",
    attribution: "Eihei Dōgen · Genjōkōan" },
  { id: "zhaozhou-drink-tea", text: "Go drink tea.",
    attribution: "Zhaozhou Congshen (Jōshū)" },
  { id: "sengcan-no-preferences", text: "The Great Way is not difficult for those who have no preferences.",
    attribution: "Sengcan · Xinxin Ming" },
  { id: "huineng-not-a-thing", text: "Originally there is not a single thing.",
    attribution: "Huineng · Platform Sutra" },
  { id: "basho-seek-what-they-sought", text: "Do not seek to follow in the footsteps of the wise. Seek what they sought.",
    attribution: "Matsuo Bashō" },
  { id: "bankei-let-thoughts-pass", text: "Do not try to stop thoughts; simply let them come and go.",
    attribution: "Bankei Yōtaku" },
  { id: "linji-just-be", text: "Just be ordinary—nothing special to seek.",
    attribution: "Linji Yixuan (Rinzai)" }
];

export const TASTE_DAILY_WISDOM_JA: TasteDailyWisdomEntry[] = [
  { id: "catch-this-moment", text: "この瞬間を、つかまえて。" },
  { id: "cling-to-nothing", text: "何にも執着しない。" },
  { id: "not-the-emotion", text: "あなたは、その感情そのものではない。" },
  { id: "one-breath-return", text: "ひと息は、すでに帰還。" },
  { id: "watch-without-chase", text: "想いを見守り、追わない。" },
  { id: "enough-for-now", text: "いまは、これで足りる。" },
  { id: "asai-floating-world", text: "いまを生き、月・雪・桜・紅葉を心から味わう。目前に貧窮があっても、それを憂えない。心は瓢のように流れに沿い、浮世を渡る——これが浮世である。",
    attribution: "浅井了意『浮世物語』・17世紀" },
  { id: "dogen-study-self", text: "仏道をならうといふは、自己をならふなり。自己をならふといふは、自己をわするるなり。",
    attribution: "道元『現成公案』" },
  { id: "zhaozhou-drink-tea", text: "喫茶去。",
    attribution: "趙州従諗" },
  { id: "sengcan-no-preferences", text: "至道無難、唯嫌揀擇。",
    attribution: "僧璨『信心銘』" },
  { id: "huineng-not-a-thing", text: "本来無一物。",
    attribution: "慧能『六祖壇経』" },
  { id: "basho-seek-what-they-sought", text: "古人の跡を求めず、古人の求めたるところを求めよ。",
    attribution: "松尾芭蕉" },
  { id: "bankei-let-thoughts-pass", text: "思いを止めようとせず、ただ来ては去るにまかせよ。",
    attribution: "盤珪永琢" },
  { id: "linji-just-be", text: "ただ平常であれ——求める特別などない。",
    attribution: "臨済義玄" }
];

export function tasteDailyWisdomPool(locale: string): TasteDailyWisdomEntry[] {
	return locale === "ja" ? TASTE_DAILY_WISDOM_JA : TASTE_DAILY_WISDOM_EN;
}
