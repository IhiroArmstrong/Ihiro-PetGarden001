# fix/mustard-seed-poem-traditional

| 芥子须弥纪念印 · 诗词繁体 | UI可见 | 待人工测试 | **文案**：两首乐五斋原诗及署名改为繁体（不随 locale；EN 译不变）。**主路径**：`__mustardSeedSeal.open({ mode:'force' })` → Case 1 须见「大鵬展翅九萬里…芥子亦足納須彌」+「樂五齋詩稿」；`open({ mode:'force', caseId:'hero-not-pond' })` → Case 2 须见「山海奇雲風幡舞…英雄豈是池中物」+「樂五齋七言歌行」。**禁止**再出现简体「大鹏/谁言/纳须弥/奇云/红尘/岂/乐五斋」。自动化：`mustardSeedSeal.test.js`。 | — | — | — | `?product=1` · `#mustard-seed-seal-card` · `__mustardSeedSeal` | 2026-08-23 |
