# feature/confide-fact-card-near-match

| 产品问答贴近事实卡（近义用正文，不是关键词名单） | 纯后端 + UI文案 | 待人工测试 | **Electron 宽屏 Confide，embedding 已就绪。英文第一优先。** 终端已锁：`catalogEntryEmbeddingText` 含短答不含问法 keywords；给卡只加失败句关键词近义文本不变；0037/0038 含 Brief 能力说明；诚实空态日志无 `text`。人工只抽：① 背景音乐换一种英文说法（本 Brief 未写过的原句）是否念 0037 短答。② 「要不要打卡」换说法是否念 0038。③ 吃饭闲聊不得进诚实空态。④ 0020 仍答入口在哪，不得被 0038 抢走「从哪进 Honesty」。关单前另开会话出未见过的英文问法批；没那批不得写「换说法已经接住」。 | — | — | — | `kbNearMatch.js` · `productKnowledgeCatalog.json` · 宽屏 Confide | 2026-10-15 |
