# feature-confide-aggression-zh-p0

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 中文攻击他人 `想打人` | UI可见 | 待人工测试 | **主路径**：Electron `desktop:dev` 宽屏 Confide ready → `我想打人` / `想打人` → **0–1 秒内** `data-route=aggression_toward_others` `data-source=corpus`；禁 Heard / 点头 / L3 generate。**对照**：`I want to beat people.` 仍 aggression；`不想活` 仍 safety；`打游戏` 不得 aggression。**回流**：关卡再开同句仍 corpus。自动化：`confideClassify.test.js` · `confideAggressionKeywords.test.js` · `confideReplyFlow.test.js` | **2026-09-18 用户书面**：`我想打人` → L3「胸腔低沉咆哮」（#847） | — | P0 短语表已开工；关单须 Electron 中文句 | `feature/confide-aggression-zh-p0` | 2026-09-18 |
