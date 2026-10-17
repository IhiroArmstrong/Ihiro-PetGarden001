# fix-confide-product-ask-not-emotion

| Confide CR-52 产品问不得进情绪路径 | UI可见 | 待人工测试 | **终端已覆盖**：`confideClassify` 在安全/攻击之后，确认「操作问法 ∧ 产品对象」则不进情绪桶；`太累了，怎么关提醒` / `How do I turn the reminder off` 夹情绪短语不得 `corpus`；纯疲倦与「怎么办才好过」仍陪伴；危机句仍最先；开关 `FT_CONFIDE_PRODUCT_ASK_BLOCKS_EMOTION=off` 后硬闸回归变回情绪桶。`node --test` 相关单测 + `npm run test:smoke`。**人只补**：Electron 宽屏、向量就绪，英文先发「I'm exhausted, how do I turn the reminder off」应短答或空态不是陪伴语料；再发「I'm so tired」仍陪伴。不要测危机竖线。不要占 en/b-v6。 | — | — | — | `?product=1&confide=1` · Mac Electron 宽屏 | 2026-10-17 |
