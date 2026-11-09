# 运行时仲裁 · 谁先说话

> **目的**：多套「谁可以占屏 / 改姿态 / 改路由」规则并存时，读代码应先问**哪一层**在裁决，避免再写第四套平行逻辑。  
> **边界**：本文是**阅读顺序与职责地图**，不是把模块合并成一个大文件；各模块测试仍各自维护。  
> **审计**：B1 发现 1-07；cloud 目录注释见 `ARCHITECTURE.md`（B1 · 1-06）。

## 1. 一句话分层

| 顺序 | 关心什么 | 谁裁决 | 真源文件 | 更细的 SSOT |
|---:|---|---|---|---|
| A | 会话大状态（Idle / Focus / Celebrate / Dormant） | 状态机 | `src/core/StateManager.js` | `ARCHITECTURE.md` 机器块 |
| B | 阿寅**精灵通道**（披毯、欢迎、付款回跳后第一帧等） | 精灵占用仲裁 | `src/core/spriteChannelArbitration.js` | 场景 AD · `SCENARIO_TESTS.md` |
| C | **叠层 UI**（卡片、横幅、首卡、Honesty、付款模态等） | 叠层槽位仲裁 | `src/core/overlaySlotArbitration.js` | `overlaySlotContractRegistry.js` · `SHARED_RESOURCES.md` §4 |
| D | 菜单 chrome / Honesty busy / postSession 门 | 会话 UI 门 | `SessionUiGate.js` · `sessionChromeSync.js` | `sessionUiGateContractRegistry.js` |
| E | 元素是否应对用户「可见」登记 | 可见性契约 | `visibilityContractRegistry.js` | `npm run visibility:doc-check` |
| F | 数字叠层谁在上（已登记层） | z-index 表 | — | `Z_INDEX.md` · `npm run check:z-index` |
| G | 倾诉**一句话走哪条产品路径**（产品 vs 情绪等） | 路由仲裁 v1 | `confideRoutingArbitrationShadow.js` 等 | `task-briefs/task-confide-routing-arbitration-v1.md` |
| H | 倾诉 **embedding / Llama 加载**与聊天谁先拿锁 | 生命周期仲裁 | Companion / L1 闸 | `confide-embedding-lifecycle-arbitration.md` |

**禁止混名**：G（路由）与 H（生命周期）不是同一套「仲裁」；命名已在 `confide-embedding-lifecycle-arbitration.md` 文首写明。

## 2. 同一次用户操作时的典型顺序

下列顺序描述**工程师查 bug 时的推荐问法**，不是单一 `main.js` 调用栈的完整列表。

1. **状态合法吗？** `StateManager` 当前 `STATES` 与转移（非法转移会 warn，不硬阻断）。
2. **精灵通道被谁占？** 睡觉、吹花序列、Stripe 回跳等先过 `spriteChannelArbitration`（与叠层分开；`overlaySlotArbitration.js` 文件头注释写明精灵仍在 `spriteChannelArbitration.js`）。
3. **允许开这块叠层吗？** UI 或 `main` 报告 intent → `requestOverlaySlot` / 快照输入 → `overlaySlotArbitration` + `OVERLAY_SOURCE_CONTRACTS`。
4. **菜单 / ⋯ / Sit 是否应 suppress？** `sessionChromeSync` · `computePostSessionOverlayActive` 等与 Honesty / Reflection 叠层联动（叠层 busy 时横幅、茶气泡等消费者见 `SHARED_RESOURCES.md` §4.1–4.2）。
5. **登记可见吗？** 改 `position:fixed` 或新 chrome 时对照 `visibilityContractRegistry` 与 `Z_INDEX.md`。
6. **若是 Confide 发句**：先 G（路由影子/规格）与 H（embedding 是否拖死 `ensure`）**分开查**；勿用「统一仲裁」一个词盖掉。

两层叠在一起时：**先 B 再 C** 常见于「阿寅还在演欢迎/披毯」与「首张卡能不能出」；**C 与 D** 常见于「Honesty 开着时 reminder 不出」。

## 3. 云端请求放哪一层

云 Worker（`focus-tiger/cloud/`）**不参与**上表 A–F 的占屏决定；前端只在用户点击或已登记的**后台网络**触点调用（见 `BACKGROUND_NETWORK.md`）。默认基址与审计见 `cloudApiClient.js` 与 B5 网络表（`docs/audit/findings/2026-11-07/B5-security-privacy-compliance-findings.md`）。

## 4. 改代码前自检（Brief / PR）

- 新叠层或新 `overlayBusy` 消费者 → 先写清归属 **C 还是 D**，更新 `overlaySlotContractRegistry` / `SHARED_RESOURCES.md` §4（`COLLAB.md` 第七节结论句）。
- 新冷启动第一幕 / 披毯 / 付款回跳 → 对照 **B** 与场景 AD，勿只改 UI 可见性。
- 新 Confide 分支 → 标明动的是 **G** 还是 **H**，对应用路由 Brief 或 embedding 生命周期文。

## 5. 尚未证明的事

B1 只确认上表模块**并存且有测试**；**没有**在本页证明两套规则会在同一次点击上互相否定。若复现冲突，记入 `docs/audit/RISK_REGISTER.md`（待建）并补一条场景到 `SCENARIO_TESTS.md`。
