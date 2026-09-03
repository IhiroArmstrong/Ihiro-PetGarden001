export type TasteQuietLineEntry = { key: string; text: string };

export const TASTE_QUIET_LINE_EN: TasteQuietLineEntry[] = [
  { key: "DAILY_ZEN_QUOTE_1", text: "The world and I were never two." },
  { key: "DAILY_ZEN_QUOTE_2", text: "One breath is already a return." },
  { key: "DAILY_ZEN_QUOTE_3", text: "Sitting still is also a kind of care." },
  { key: "DAILY_ZEN_QUOTE_4", text: "The day can wait while you arrive." },
  { key: "DAILY_ZEN_QUOTE_5", text: "Quiet does not ask for proof." },
  { key: "DAILY_ZEN_QUOTE_6", text: "You do not have to finish the path to rest on it." },
  { key: "DAILY_ZEN_QUOTE_7", text: "A pause is not an absence." },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_1", text: "If a thought is already here, who is arriving late to meet it?" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_2", text: "The mood has weather; the sky was not asked to agree." },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_3", text: "When attention wandered, something stayed to notice the empty seat." },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_4", text: "Is the tightness a story, or only tightness for a while?" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_5", text: "Before the next sentence forms, a gap is already being heard." },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_6", text: "A feeling asks to be someone; it can also remain only a feeling." },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_7", text: "Where does the day begin, if this breath has no yesterday?" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_8", text: "What hears the quiet after a thought ends?" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_9", text: "This moment does not need a better version of itself." },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_10", text: "The question of doing it right is also just a sound passing through." },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_11", text: "Can looking look, without turning into a chore?" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_12", text: "Not every ache needs a name to be felt." },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_13", text: "Watching happens — must someone be doing it?" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_14", text: "No conclusion is required before the next breath arrives." }
];

export const TASTE_QUIET_LINE_JA: TasteQuietLineEntry[] = [
  { key: "DAILY_ZEN_QUOTE_1", text: "光は、気づかなくても部屋に届いている。" },
  { key: "DAILY_ZEN_QUOTE_2", text: "ひと息は、すでに帰還。" },
  { key: "DAILY_ZEN_QUOTE_3", text: "静かに座ることも、ひとつのいたわり。" },
  { key: "DAILY_ZEN_QUOTE_4", text: "到着するあいだ、一日は待てる。" },
  { key: "DAILY_ZEN_QUOTE_5", text: "静けさは、証明を求めない。" },
  { key: "DAILY_ZEN_QUOTE_6", text: "道を歩き終えなくても、休んでよい。" },
  { key: "DAILY_ZEN_QUOTE_7", text: "間は、欠けではない。" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_1", text: "思いがすでにここにあるなら、遅れて会いに来るのは誰だろう。" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_2", text: "気分には天気がある。空は同意を求められていない。" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_3", text: "注意が歩いていったとき、空いた席に気づいていたものがあった。" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_4", text: "そのこわばりは物語か、それともしばらくのこわばりか。" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_5", text: "次の一文が形になる前に、すきまはすでに聞こえている。" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_6", text: "感情は誰かになろうとする。ただの感情のままでもいられる。" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_7", text: "この息に昨日がないなら、一日はどこから始まるだろう。" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_8", text: "思いが静まったあと、その静けさを聞いているのは何だろう。" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_9", text: "この瞬間は、より良い版を必要としていない。" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_10", text: "「正しくできているか」という問いも、通り過ぎる音にすぎない。" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_11", text: "見ることは、雑用にならずに、見ていられるだろうか。" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_12", text: "疼きのすべてに、感じるための名前が要るわけではない。" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_13", text: "見ることが起きている——それをしている誰かが、要るだろうか。" },
  { key: "DAILY_ZEN_QUOTE_INSIGHT_14", text: "次の息が来る前に、結論はまだ着いていない。" }
];

export function tasteQuietLinePool(locale: string): TasteQuietLineEntry[] {
	return locale === "ja" ? TASTE_QUIET_LINE_JA : TASTE_QUIET_LINE_EN;
}
