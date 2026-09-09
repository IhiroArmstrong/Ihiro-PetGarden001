export type CalmActionCopyEntry = { id: string; text: string };

export const CALM_ACTION_OVERLAY_SCHEMA_VERSION = 2 as const;

export const CALM_ACTION_RECOVER_IDS = [
	"CAW-R01",
	"CAW-R02",
	"CAW-R03",
	"CAW-R04",
	"CAW-R05",
	"CAW-R06",
	"CAW-R07",
	"CAW-R08",
	"CAW-R09",
	"CAW-R10",
	"CAW-R11",
	"CAW-R12",
	"CAW-R13",
	"CAW-R14",
] as const;

export const CALM_ACTION_ARRIVE_IDS = [
	"CAW-A01",
	"CAW-A02",
	"CAW-A03",
	"CAW-A04",
	"CAW-A05",
	"CAW-A06",
	"CAW-A07",
	"CAW-A08",
	"CAW-A09",
	"CAW-A10",
	"CAW-A11",
	"CAW-A12",
	"CAW-A13",
	"CAW-A14",
] as const;

export const CALM_ACTION_REFLECT_IDS = [
	"CAW-L01",
	"CAW-L02",
	"CAW-L03",
	"CAW-L04",
	"CAW-L05",
	"CAW-L06",
	"CAW-L07",
	"CAW-L08",
	"CAW-L09",
	"CAW-L10",
	"CAW-L11",
	"CAW-L12",
	"CAW-L13",
	"CAW-L14",
	"CAW-L15",
	"CAW-L16",
	"CAW-L17",
	"CAW-L18",
	"CAW-L19",
	"CAW-L20",
] as const;

const EN_RECOVER: CalmActionCopyEntry[] = [
	{ id: "CAW-R01", text: "You can return whenever your mind wanders." },
	{ id: "CAW-R02", text: "Coming back is part of the practice." },
	{
		id: "CAW-R03",
		text: "Every time you return, you are practicing progress.",
	},
	{
		id: "CAW-R04",
		text: "You cannot change the last moment, but you can shape this one.",
	},
	{
		id: "CAW-R05",
		text: "A difficult moment does not define your whole story.",
	},
	{
		id: "CAW-R06",
		text: "You can improve without being at war with yourself.",
	},
	{ id: "CAW-R07", text: "A pause does not erase your progress." },
	{ id: "CAW-R08", text: "Starting again is not starting over." },
	{
		id: "CAW-R09",
		text: "You are not starting from zero. You are starting wiser.",
	},
	{
		id: "CAW-R10",
		text: "Your next moment is the only one you can truly use.",
	},
	{
		id: "CAW-R11",
		text: "Falling behind is not the same as being lost.",
	},
	{ id: "CAW-R12", text: "Let the next breath be a place to land." },
	{ id: "CAW-R13", text: "You are allowed to try again tomorrow." },
	{ id: "CAW-R14", text: "Taking care of yourself is not wasted time." },
];

const JA_RECOVER: CalmActionCopyEntry[] = [
	{ id: "CAW-R01", text: "心がそれても、いつでも戻ってこられる。" },
	{ id: "CAW-R02", text: "戻ってくることも、続けることの一部だ。" },
	{
		id: "CAW-R03",
		text: "戻ってくるたびに、あなたは前に進んでいる。",
	},
	{
		id: "CAW-R04",
		text: "過去は変えられない。でも、この瞬間は変えられる。",
	},
	{
		id: "CAW-R05",
		text: "苦しい瞬間が、あなたのすべてを決めるわけではない。",
	},
	{
		id: "CAW-R06",
		text: "自分と戦わなくても、成長することはできる。",
	},
	{ id: "CAW-R07", text: "少し止まっても、これまでの積み重ねは消えない。" },
	{
		id: "CAW-R08",
		text: "もう一度始めることは、ゼロからやり直すことではない。",
	},
	{
		id: "CAW-R09",
		text: "ゼロからではない。経験を持って、もう一度始める。",
	},
	{
		id: "CAW-R10",
		text: "本当に使えるのは、目の前のこの瞬間だけ。",
	},
	{
		id: "CAW-R11",
		text: "遅れることと、道を見失うことは同じではない。",
	},
	{ id: "CAW-R12", text: "次のひと息を、着地できる場所にしよう。" },
	{ id: "CAW-R13", text: "明日、またやり直していい。" },
	{ id: "CAW-R14", text: "自分を大切にする時間は、無駄ではない。" },
];

const EN_ARRIVE: CalmActionCopyEntry[] = [
	{ id: "CAW-A01", text: "Start with what is in front of you." },
	{ id: "CAW-A02", text: "You do not need to feel ready to begin." },
	{ id: "CAW-A03", text: "The next step is enough for now." },
	{ id: "CAW-A04", text: "A quiet beginning is still a beginning." },
	{
		id: "CAW-A05",
		text: "You are already here. That is enough to begin.",
	},
	{
		id: "CAW-A06",
		text: "This moment is still a good place to begin.",
	},
	{ id: "CAW-A07", text: "Start before you feel ready." },
	{
		id: "CAW-A08",
		text: "You do not have to finish everything to begin.",
	},
	{
		id: "CAW-A09",
		text: "When life feels heavy, make the next step smaller.",
	},
	{
		id: "CAW-A10",
		text: "You only need to carry what belongs to today.",
	},
	{ id: "CAW-A11", text: "A rough first step is still a step." },
	{
		id: "CAW-A12",
		text: "Action often brings the clarity you were waiting for.",
	},
	{
		id: "CAW-A13",
		text: "You do not need to see the mountain. One step is enough.",
	},
	{ id: "CAW-A14", text: "Make it easier, not harder, to begin." },
];

const JA_ARRIVE: CalmActionCopyEntry[] = [
	{ id: "CAW-A01", text: "まず、目の前にあることから始めよう。" },
	{ id: "CAW-A02", text: "準備が整っていなくても、始めていい。" },
	{ id: "CAW-A03", text: "今は、次の一歩だけで十分。" },
	{ id: "CAW-A04", text: "静かな始まりも、立派な始まりだ。" },
	{
		id: "CAW-A05",
		text: "もうここにいる。それだけで始めるには十分だ。",
	},
	{
		id: "CAW-A06",
		text: "この瞬間も、始めるには十分いいタイミングだ。",
	},
	{ id: "CAW-A07", text: "準備が整う前に始めよう。" },
	{
		id: "CAW-A08",
		text: "すべてを片づけなくても、始められる。",
	},
	{
		id: "CAW-A09",
		text: "重く感じたら、次の一歩をもっと小さくしよう。",
	},
	{
		id: "CAW-A10",
		text: "今日の自分には、今日のことだけを抱えればいい。",
	},
	{ id: "CAW-A11", text: "不完全な一歩でも、それは確かな一歩だ。" },
	{
		id: "CAW-A12",
		text: "待っていた答えは、行動したあとに見えてくることが多い。",
	},
	{
		id: "CAW-A13",
		text: "山の全貌は見えなくていい。今の一歩で足りる。",
	},
	{ id: "CAW-A14", text: "始めることを、もっと簡単にしよう。" },
];

const EN_REFLECT: CalmActionCopyEntry[] = [
	{
		id: "CAW-L01",
		text: "A good day does not have to be a perfect day.",
	},
	{
		id: "CAW-L02",
		text: "You do not need to keep pace with everyone.",
	},
	{
		id: "CAW-L03",
		text: "Your pace is allowed to be your own.",
	},
	{
		id: "CAW-L04",
		text: "Small actions become powerful when repeated.",
	},
	{ id: "CAW-L05", text: "You showed up. That matters." },
	{
		id: "CAW-L06",
		text: "A small finish can still be meaningful.",
	},
	{
		id: "CAW-L07",
		text: "Not every win needs to be loud.",
	},
	{
		id: "CAW-L08",
		text: "You moved forward today. That is enough.",
	},
	{
		id: "CAW-L09",
		text: "Progress is rarely a straight line.",
	},
	{
		id: "CAW-L10",
		text: "You are still growing, even when it feels slow.",
	},
	{
		id: "CAW-L11",
		text: "Notice what went well before you judge the rest.",
	},
	{
		id: "CAW-L12",
		text: "You did what you could with the day you had.",
	},
	{
		id: "CAW-L13",
		text: "You are allowed to leave some things undone.",
	},
	{
		id: "CAW-L14",
		text: "A quiet ending can still be a good ending.",
	},
	{
		id: "CAW-L15",
		text: "Take the lesson. Leave the weight behind.",
	},
	{
		id: "CAW-L16",
		text: "Today is complete, even if everything is not.",
	},
	{
		id: "CAW-L17",
		text: "Consistency does not have to look impressive.",
	},
	{
		id: "CAW-L18",
		text: "You are building more than today's result.",
	},
	{
		id: "CAW-L19",
		text: "There is no need to become someone overnight.",
	},
	{
		id: "CAW-L20",
		text: "The life you want is shaped by what you repeat.",
	},
];

const JA_REFLECT: CalmActionCopyEntry[] = [
	{
		id: "CAW-L01",
		text: "良い一日は、完璧な一日でなくていい。",
	},
	{
		id: "CAW-L02",
		text: "誰もが同じペースで進む必要はない。",
	},
	{
		id: "CAW-L03",
		text: "自分のペースは、自分だけのものでいい。",
	},
	{
		id: "CAW-L04",
		text: "小さな行動も、続ければ大きな力になる。",
	},
	{
		id: "CAW-L05",
		text: "ここまで来た。それだけでも意味がある。",
	},
	{
		id: "CAW-L06",
		text: "小さな達成にも、十分な意味がある。",
	},
	{
		id: "CAW-L07",
		text: "すべての達成を、大げさに祝う必要はない。",
	},
	{
		id: "CAW-L08",
		text: "今日は前に進めた。それだけで十分。",
	},
	{
		id: "CAW-L09",
		text: "成長は、まっすぐな線を描くものではない。",
	},
	{
		id: "CAW-L10",
		text: "ゆっくりに感じても、あなたは進み続けている。",
	},
	{
		id: "CAW-L11",
		text: "足りなかったことを見る前に、うまくいったことにも目を向けよう。",
	},
	{
		id: "CAW-L12",
		text: "今日という一日の中で、できることをやった。",
	},
	{
		id: "CAW-L13",
		text: "やり残したことがあっても、大丈夫。",
	},
	{
		id: "CAW-L14",
		text: "静かな終わり方でも、良い一日は終えられる。",
	},
	{
		id: "CAW-L15",
		text: "学びだけを持ち帰り、重さはここに置いていこう。",
	},
	{
		id: "CAW-L16",
		text: "すべてが終わらなくても、今日という一日は終わる。",
	},
	{
		id: "CAW-L17",
		text: "続けることは、いつも華やかでなくていい。",
	},
	{
		id: "CAW-L18",
		text: "あなたが積み上げているのは、今日の結果だけではない。",
	},
	{
		id: "CAW-L19",
		text: "一晩で、別の自分になる必要はない。",
	},
	{
		id: "CAW-L20",
		text: "望む人生は、毎日繰り返すことによって形づくられていく。",
	},
];

export function tasteCalmActionRecoverPool(
	locale: string,
): CalmActionCopyEntry[] {
	return locale === "ja" ? JA_RECOVER : EN_RECOVER;
}

export function tasteCalmActionArrivePool(
	locale: string,
): CalmActionCopyEntry[] {
	return locale === "ja" ? JA_ARRIVE : EN_ARRIVE;
}

export function tasteCalmActionReflectPool(
	locale: string,
): CalmActionCopyEntry[] {
	return locale === "ja" ? JA_REFLECT : EN_REFLECT;
}
