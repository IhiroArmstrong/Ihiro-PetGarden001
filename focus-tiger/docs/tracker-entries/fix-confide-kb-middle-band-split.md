# fix/confide-kb-middle-band-split

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 中间带拆开：闲聊现写，观察翼不进这一档 | UI可见 | 待人工测试 | **仅 Electron 宽屏**（`?product=1&confide=1`），embedding 已就绪。① `Where can I eat noodle?` / `So can I talk to you?` → `data-source=generate`（失败才 corpus），**禁止**「没有手册」。② `What is the observation wing?` / `观察翼是什么`：本刀不改。就绪时它离目录约 0.51，低于 0.62，会继续到现写；embedding 未就绪时仍是诚实空态。③ `How can I take a breath for three minutes` → `product_knowledge`，正文为 KB-FUNC-0011（左球短呼吸）。④ `Where can I download focus coins?` 仍是 0018 赚币短答——库里没有「从哪下载」。回流：关卡再开后再发①。自动化：`confideProductKnowledgeSemantic.test.js` · `confideProductKnowledge.test.js`。 | 2026-09-30 Electron 宽屏：吃面、能不能聊 → 没有手册；三分钟呼吸 → 现写陪坐；下载寅币 → 赚币短答 | — | — | `confideProductKnowledgeSemantic.js` · `productKnowledgeCatalog.json` · `l1EmbeddingHold.js` | 2026-09-30 |
