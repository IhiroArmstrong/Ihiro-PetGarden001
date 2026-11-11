# feature/deep-link-electron-dispatch-c · 2026-11-11

| 深链 C 刀 Electron 协议分发 | UI可见 | 待人工测试 | **本条验收的是电脑壳**：`focus-tiger://app/?product=1&start=sit&min=5` 进壳后查询仍在；结账回跳（`pro_session` / `art_session`）仍走结账、不抢开坐。非法 `start` 不得当结账。**不代表**网页 B 刀已合时才会有的「立刻开坐 / 忙碌轻提示」；Health 钮不在本刀。自动化：`node --test src/core/practiceDeepLinkDesktopDispatch.test.js src/core/practiceDeepLinkLocation.test.js src/core/practiceDeepLinkParse.test.js`。**回流**：壳已开着时再点同一协议，不得整页冲掉结账确认路径。 | — | — | — | `npm run desktop:dev` · `focus-tiger://app/?product=1&start=sit&min=5` | 2026-11-11 |
