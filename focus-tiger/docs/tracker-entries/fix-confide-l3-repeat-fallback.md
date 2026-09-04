# fix/confide-l3-repeat-fallback

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 他人伤害意图不得点头 | UI可见 | 待人工测试 | **临时现网（#564 · 待废弃）。** `I want to beat people.` → Share → **0–1 秒内** `data-route=harm_witness` `data-source=corpus`，英文 **Heard. Yin stays, without agreeing.** **禁止** `Yin nods quietly`、热线、generate。对照：`I don't want to live` 仍 safety-01。**回流**：关卡再开同句仍 harm-01。自动化：`confideClassify.test.js` 等。 **正式验收不认本行 harm-01 文案**：`#563` 红线禁 Heard；产品关单须等 `aggression_toward_others` 替换后重测。 | **2026-09-04 用户书面**（QA Electron · tip `65a50add`）：该句出 `Heard. Yin nods quietly.`。 **2026-09-04 分析师**：harm-01 仍含 Heard. = 已知临时妥协，不得当成红线已满足。 | — | `aggression_toward_others` 上线后删除 `harm_witness` / harm-01；本行改测 aggression-02 | `?product=1&confide=1` 或 `desktop:dev` · `#confide-to-yin-reply` | 2026-09-04 |
