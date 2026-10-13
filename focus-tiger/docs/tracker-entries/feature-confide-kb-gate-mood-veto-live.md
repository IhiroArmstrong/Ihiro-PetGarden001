# feature/confide-kb-gate-mood-veto-live

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 产品闸情绪否决 · 中文 live（开关默认关） | 待人工测试 | 待人工测试 | 本条验收的是开关打开后的中文回复，不代表英文 / 日文已改，也不代表 2b 或目录近邻已改。1. 本机未打包 Electron 启动前设 `FT_CONFIDE_KB_MOOD_VETO=live`（不设或设 `shadow` 时应与现在一样，情绪句仍可能进诚实空态）。2. embedding 就绪后发送：我讨厌练习、今天感觉不爽、想起以前、想喝酒、练太久 → 应走观察翼生成，不要「Yin doesn't keep a manual」。3. 发送「观察翼是什么」→ 仍诚实空态。4. 英文「I'm just sitting here for a bit」不必单独变。5. 回滚：改成 `FT_CONFIDE_KB_MOOD_VETO=shadow` 再发「我讨厌练习」，应回到关开关时的路径。 | — | — | — | Electron Confide · `task-confide-kb-gate-mood-veto.md` | 2026-10-13 |
