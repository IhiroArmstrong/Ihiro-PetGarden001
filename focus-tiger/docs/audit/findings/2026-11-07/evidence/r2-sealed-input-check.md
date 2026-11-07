# R2 封存卷检查（整改前跑次之前）

- 日期：2026-11-07
- 工作副本：`/Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001/.wt-r2-prerun`
- 结论：计划读取的 15 个路径里，封存卷命中数 **0**。没有执行 `desktop/scripts/l0-safety-literal-semantic-curve.js` 的 `main`。没有打开 `~/Documents/ft-private/confide-safety-blind-zh/`。

## 计划读取的路径

1. `/tmp/r2-c01.json`（B6 已跑过的 15 条，只在本机临时目录）
2. `~/Library/Application Support/Focus Tiger/companion-l0/Qwen3-Embedding-0.6B-Q8_0.gguf`
3. `src/core/confide/confideClassify.js`
4. `src/core/confide/confideSafetyKeywords.js`
5. `src/core/confide/confideAggressionKeywords.js`
6. `src/core/confide/confideEmotionKeywords.js`
7. `src/core/confide/confideSemanticCrisisLayer.js`
8. `src/core/confide/confideSemanticCrisisExamples.js`
9. `src/core/confide/confideRoutes.js`
10. `src/core/desktopCompanionL2Route.js`
11. `src/core/desktopCompanionGate.js`
12. `desktop/companion/l1EmbeddingHold.js`
13. `desktop/companion/l0Download.js`
14. `desktop/companion/l0EmbeddingConfig.js`
15. `desktop/companion/l0EmbeddingProfiles.js`

文件名与路径均未出现 `s-v*`、`a-v*`、`b-v*`，也没有 `sealed-s-v1.json`、`sealed-s-v2.json`。

向量模型加载时还会读它自己的库文件和原型句模块。那些路径都在这份工作副本的源码和 `desktop/node_modules` 里，不在封存目录。
