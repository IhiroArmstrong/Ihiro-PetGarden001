# fix-confide-paraphrase-echo-guard

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide T32 复述提问护栏 | UI可见 | 待人工测试 | **仅 Electron 非低配宽屏 · Confide ready。** **改动**：generate 答句若实词全来自用户句（名词化短改写）则拒收，改走 corpus 陪伴短句。**主路径**：用自己的一句带人名/对象的不喜欢陈述 → Share → 可见答不得只是把实词收成名词短语再念一遍；应是另一句陪伴短句（可 corpus）。**对照**：`Why should I do some meditation?` 若 generate 带了新实词（坐 / 等 / 身体）须放行；`睡不着` 仍允许贴题英文观察句。**负例**：危机句仍转介。**自动化**：`l3ObserveShuffleGate.test.js`（实词复述 + 既有照抄/套势）· `npm run test:smoke`。关单不认本行代替黄金脚本 60 句。 | — | — | 未验证桌面 generate | `isContentWordParrotReply` · `sanitizeCompanionL2Reply` | 2026-10-21 |
