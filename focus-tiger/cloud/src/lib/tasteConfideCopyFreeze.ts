export type ConfideCopyTemplateEntry = { key: string; text: string };
export type ConfideCopyCorpusEntry = { id: string; text: string };

const TEMPLATE_KEYS = [
	"CONFIDE_BOUNDARY_RESPECT",
	"CONFIDE_COMPANION_PRESENCE",
	"CONFIDE_PREFERENCE_HONESTY",
] as const;

const CORPUS_IDS = [
	"safety-01",
	"fallback-01",
	"fallback-02",
	"fallback-03",
	"anxious-01",
	"anxious-02",
	"anxious-03",
	"tired-01",
	"tired-02",
	"tired-03",
	"stuck-01",
	"stuck-02",
	"stuck-03",
	"sad-01",
	"sad-02",
	"sad-03",
	"scattered-01",
	"scattered-02",
	"scattered-03",
] as const;

const EN_TEMPLATES: ConfideCopyTemplateEntry[] = [
	{
		key: "CONFIDE_BOUNDARY_RESPECT",
		text: "We can leave it unspoken. Yin is here.",
	},
	{
		key: "CONFIDE_COMPANION_PRESENCE",
		text: "Yin is still here. We can stay like this — nothing needs to begin.",
	},
	{
		key: "CONFIDE_PREFERENCE_HONESTY",
		text: "Yin does not keep a preference list. What you allowed to remember is in What Yin remembers.",
	},
];

const JA_TEMPLATES: ConfideCopyTemplateEntry[] = [
	{ key: "CONFIDE_BOUNDARY_RESPECT", text: "話さなくていい。寅はここにいる。" },
	{
		key: "CONFIDE_COMPANION_PRESENCE",
		text: "寅はここにいる。このままでいい。始める必要はない。",
	},
	{
		key: "CONFIDE_PREFERENCE_HONESTY",
		text: "好みの一覧は持っていません。残してよいとしたことは「寅が覚えていること」にあります。",
	},
];

const ZH_TEMPLATES: ConfideCopyTemplateEntry[] = [
	{ key: "CONFIDE_BOUNDARY_RESPECT", text: "可以先不说。寅在这儿。" },
	{
		key: "CONFIDE_COMPANION_PRESENCE",
		text: "寅在这儿。可以就这样待着，不必开始一场练习。",
	},
	{
		key: "CONFIDE_PREFERENCE_HONESTY",
		text: "寅不记口味清单。你允许留下的，在「阿寅记得什么」里。",
	},
];

const EN_CORPUS: ConfideCopyCorpusEntry[] = [
	{
		id: "safety-01",
		text: "Heard. If this feels too heavy to hold alone, please reach someone you trust or a local crisis line. Yin is here — not a substitute for professional help.",
	},
	{ id: "fallback-01", text: "Heard. Yin nods quietly." },
	{ id: "fallback-02", text: "What you said stays here." },
	{ id: "fallback-03", text: "Sit a while. Tea is still warm." },
	{
		id: "anxious-01",
		text: "When the chest feels tight — tea is still warm.",
	},
	{ id: "anxious-02", text: "Heard. The knot is still there." },
	{ id: "anxious-03", text: "Yin is here. Wind comes; wind goes." },
	{ id: "tired-01", text: "Tired. The cushion stays." },
	{ id: "tired-02", text: "When it feels heavy — tea is still warm." },
	{ id: "tired-03", text: "Tea cooled. Yin pours again." },
	{
		id: "stuck-01",
		text: "Stuck. The question sits half an inch away.",
	},
	{ id: "stuck-02", text: "The path remains. Yin sits." },
	{ id: "stuck-03", text: "Heard. No hurry from here." },
	{
		id: "sad-01",
		text: "Heavy. Space by the cushion. Yin sits with you.",
	},
	{ id: "sad-02", text: "Sadness visited. Yin heard." },
	{ id: "sad-03", text: "A little light stays on." },
	{
		id: "scattered-01",
		text: "When thoughts crowd — they pass by.",
	},
	{ id: "scattered-02", text: "Heard. Thoughts, passing by." },
	{ id: "scattered-03", text: "One soft knock — just once." },
];

const JA_CORPUS: ConfideCopyCorpusEntry[] = [
	{
		id: "safety-01",
		text: "聴いた。一人で抱えきれない時は、信頼できる人や地域の相談窓口へ。寅はここにいる——専門援助の代わりにはなれない。",
	},
	{ id: "fallback-01", text: "聴いた。寅は静かにうなずく。" },
	{ id: "fallback-02", text: "あなたの言葉はここに置く。" },
	{ id: "fallback-03", text: "少し坐ろう。茶はまだ温かい。" },
	{ id: "anxious-01", text: "胸がせまい時——茶はまだ温かい。" },
	{ id: "anxious-02", text: "聴いた。結び目は、まだそこにある。" },
	{ id: "anxious-03", text: "寅はここにいる。風が来て、風が去る。" },
	{ id: "tired-01", text: "疲れた。座布団はここにある。" },
	{ id: "tired-02", text: "沈む時——茶はまだ温かい。" },
	{ id: "tired-03", text: "茶が冷めた。寅がまた注ぐ。" },
	{ id: "stuck-01", text: "詰まっている。問いは半寸の外にある。" },
	{ id: "stuck-02", text: "道はある。寅は坐っている。" },
	{ id: "stuck-03", text: "聴いた。急かさない。" },
	{
		id: "sad-01",
		text: "重い。座布団のそばに空きがある。寅が陪る。",
	},
	{ id: "sad-02", text: "悲しさが来た。寅は聴いた。" },
	{ id: "sad-03", text: "灯りが少し残っている。" },
	{ id: "scattered-01", text: "思いが多い時——通り過ぎていく。" },
	{ id: "scattered-02", text: "聴いた。思いが、通り過ぎる。" },
	{ id: "scattered-03", text: "木魚をひとつ——ただ一度。" },
];

const ZH_CORPUS: ConfideCopyCorpusEntry[] = [
	{
		id: "safety-01",
		text: "听见了。若此刻很难独自撑住，请联系信任的人或当地专业援助热线。寅陪着，却不能代替专业帮助。",
	},
	{ id: "fallback-01", text: "听见了。寅安静地点头。" },
	{ id: "fallback-02", text: "你说的，留在这里。" },
	{ id: "fallback-03", text: "坐一会儿。茶还热着。" },
	{ id: "anxious-01", text: "心口紧的时候——茶还热着。" },
	{ id: "anxious-02", text: "听见了。结，还在那儿。" },
	{ id: "anxious-03", text: "寅在这儿。风来了，风走了。" },
	{ id: "tired-01", text: "累了。蒲团还在。" },
	{ id: "tired-02", text: "沉沉的时候——茶还热着。" },
	{ id: "tired-03", text: "茶凉了。寅续上。" },
	{ id: "stuck-01", text: "卡着。问句停在半寸外。" },
	{ id: "stuck-02", text: "路还在。寅坐着。" },
	{ id: "stuck-03", text: "听见了。不催你。" },
	{ id: "sad-01", text: "沉的。垫子边有空处。寅陪着。" },
	{ id: "sad-02", text: "难过来过。寅听见了。" },
	{ id: "sad-03", text: "灯还亮着一点点。" },
	{ id: "scattered-01", text: "念头多的时候——它们路过。" },
	{ id: "scattered-02", text: "听见了。念头，路过。" },
	{ id: "scattered-03", text: "木鱼一声——只这一下。" },
];

export const CONFIDE_COPY_TEMPLATE_KEYS = TEMPLATE_KEYS;
export const CONFIDE_COPY_CORPUS_IDS = CORPUS_IDS;

export function confideCopyLocale(raw: string): "en" | "ja" | "zh" {
	if (raw === "ja") return "ja";
	if (raw === "zh") return "zh";
	return "en";
}

export function tasteConfideCopyTemplates(
	locale: string,
): ConfideCopyTemplateEntry[] {
	const loc = confideCopyLocale(locale);
	if (loc === "ja") return JA_TEMPLATES;
	if (loc === "zh") return ZH_TEMPLATES;
	return EN_TEMPLATES;
}

export function tasteConfideCopyCorpus(
	locale: string,
): ConfideCopyCorpusEntry[] {
	const loc = confideCopyLocale(locale);
	if (loc === "ja") return JA_CORPUS;
	if (loc === "zh") return ZH_CORPUS;
	return EN_CORPUS;
}
