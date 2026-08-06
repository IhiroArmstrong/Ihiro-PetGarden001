# RISK_MITIGATION_PLAYBOOK.md — 中高风险任务落地降险

创建日期：2026-08-06  
权威路径：`focus-tiger/docs/RISK_MITIGATION_PLAYBOOK.md`  
索引：`RULES_INDEX.md` → `risk-mitigation-playbook`  
性质：**可复用 SSOT**——指导「穿透多核心模块」的新功能如何切片落地；**不**替代产品语义权威（`*_BIBLE` / `*_WIRING`），**不**替代回归锁完工门禁。

交叉引用（只引用、不复述）：

| 文档 | 分工 |
|---|---|
| [`WORKFLOW.md`](../../WORKFLOW.md) | Git / worktree / 合入 develop 前预览；本 playbook 的流程入口见其「中高风险功能落地」小节 |
| [`DOC_CODE_CONTRACT.md`](./DOC_CODE_CONTRACT.md) | 高风险契约清单与 `docs:check` 结构对齐 |
| [`DEV_WORKFLOW_QUALITY.md`](./DEV_WORKFLOW_QUALITY.md) | 回归锁 why/how；§2.3 高风险面 |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | 模块边界、Dispatcher / EmotionController 角色 |
| [`SCENE_ANIMATION_WIRING.md`](./SCENE_ANIMATION_WIRING.md) / [`HINTS_WIRING.md`](./HINTS_WIRING.md) / [`EMOTION_BIBLE.md`](./EMOTION_BIBLE.md) | 场景/情绪语义登记（落地时须改对应表，不是本文件的替身） |
| [`DEVELOP_DEBT_INVENTORY.md`](./DEVELOP_DEBT_INVENTORY.md) | 存量验证债务；本 playbook 管**新落地**，不管存量盘点 |

---

## 1. 触发条件

**满足任一条**即应套用本 playbook（Task Brief / 开工回复显式引用本文件）：

1. **多模块穿透**：一次功能落地会改动 **≥2 个**下列核心面——`EmotionController` / 场景动画 Dispatcher（或同类中央调度）/ 会话状态机或门闩（`SessionUiGate` 等）/ 场景互斥链（欢迎·深夜·DORMANT 等）/ 产品壳 UI 叠层 / 多语言产品路径。  
2. **新状态进生产路径**：新增情绪键、调度事件、频次门闩或互斥规则，且终态要进冷启动 / Idle / Focus 等**已有产品路径**（不仅调试面板）。  
3. **整包风险自评为中高**：若按「一次 PR 吞状态机 + UI + 文案 + i18n + 资产」落地，回归面难以在单次预览里说清。

**通常不必套用**（仍遵守日常回归锁即可）：

- 纯文案 / 纯文档 / 纯实验室素材入库且**明确不改**生产调度；  
- 单模块内局部修（例：只改一个 Store 读写、不碰调度与互斥）；  
- 已有 e2e/门闩契约覆盖的小修，且不引入新状态。

> **一句话**：切不切片看交付节奏；**要不要走本 playbook**看会不会穿透中央架构。

---

## 2. 降险四件套

可复用手法。四条可组合，**不能**用其中任一条当借口绕过 §3 架构红线。

| 手法 | 目的 | 适用信号 |
|---|---|---|
| **资产与逻辑解耦（Lab 先行）** | 把「帧率 / CapCut / oneshot 回 Idle / 调试可播」等不确定观感，从生产调度器上剥开；Lab 绿之前不动冷启动 / Dispatcher 产品钩子 | 新序列、新 UI 组件、新文案池观感未验；或素材体积/帧数仍可能调 |
| **功能切片（Slicing）** | 每个 Slice **独立可验收**（主路径 + 至少一条回流）；避免单 PR 吞状态机 + UI + 文案 + 多语言产品路径 | 预估触及 ≥3 类文件面，或「合进去才第一次能测完整故事」 |
| **优先级门闩** | 新状态与已有状态（休眠 / 欢迎 / DORMANT / 深夜等）相遇时，**明确裁决顺序**；互斥不并行、不同 tick 抢播 | 会与现有欢迎池、DORMANT、深夜茶/哈欠、Hold 强情绪等同刻或同日竞争 |
| **Feature Flag + 防守兜底** | 一键回退到**现有正式默认流程**；异步 / 动画 / 气泡等必须有**强制超时**释放控制权，失败不得卡住 Idle | 产品路径接线后仍可能要紧急关特性；有定时器、overlay、oneshot hold |

### 切片粒度参考（非强制模板）

| 常见顺序 | 做什么 | 生产调度 |
|---|---|---|
| Slice A · Lab 资产/动画 | 入库、manifest、控制器映射、调试可播、观感契约 | **不改** |
| Slice B · Lab UI / 文案 | 组件 + locale；在调试与动画**同钮**验收 | 仍不改 |
| Slice C · 产品接线 | Dispatcher / 门闩 / 互斥 / flag；`*_WIRING` 状态改「已实现」 | **此时才改** |
| Slice D · 抛光与锁 | e2e 失败用例、TEST_TRACKER 分列、体积/fps | 微调 |

顺序可按产品调整，但 **「越不确定越先 Lab」** 优先于 **「先接产品钩子好看进度」**。

---

## 3. 架构红线（不可被降险手法绕过）

### 元规则

> **切片切的是交付节奏和验证范围，不是切掉项目已有的架构纪律。**

降险四件套服务的是「少炸、可回退、可验收」；**不是**「先偷一条捷径、以后再补中央登记」。凡终态要进生产路径的行为，从第一个会改生产代码的 Slice 起，就必须遵守既有 Dispatcher / Registry / `*_BIBLE` / `*_WIRING` 纪律。

### 三类「降险话术陷阱」

| 陷阱 | 陷阱描述 | 为什么看似合理 | 正确做法 |
|---|---|---|---|
| **A. 单点硬调、跳过中央调度** | 「先在 `onAppReady` / 某入口硬调 `playEmotion`，不碰 Dispatcher / Registry，等稳了再登记」 | 改动面小、PR 绿得快、少碰 known-risky 互斥链 | 即使是**最小**生产 Slice：只要终态进产品路径，**从一开始**走正式 Dispatcher（或项目规定的中央调度）+ Registry / Bible / 接线表登记。Lab-only 硬调仅限调试面板，**不得**冒充产品路径 |
| **B. 先接产品钩子、后补动画/资产** | 「先把气泡/文案挂上冷启动，动画帧率/CapCut 以后再验」 | 产品故事早可见、好像进度更快 | **越不确定的部分越要先在 Lab 孤立验证**（序列衔接、回 Idle、超时释放）；产品钩子留到资产与 Lab UI 可验收之后。禁止产品路径出现「有字无仪式 / 有钩无帧」的孤儿体验 |
| **C. 未命中新分支就走「简化兜底」** | 「没命中新彩蛋 → 直接 Idle / 静默跳过」，另造一条更短的临时默认 | 少写分支、少测互斥、flag 关了也简单 | 兜底必须指向**已有的正式默认流程**（例：现有 `WELCOME_APP` 池 → 再走深夜互斥），**禁止**新建一条更简单的临时默认路径。Feature flag 关闭 = 完全回退旧正式路径，不是「半套新逻辑 + 简化空路径」 |

### 与其它 SSOT 的边界（防重复）

- **本文件**：何时降险、四件套怎么用、哪些话术不许当借口。  
- **`ARCHITECTURE` / `*_WIRING` / `*_BIBLE`**：具体模块怎么接线、情绪语义是什么——落地时改那些文件，**不**把语义抄进本 playbook。  
- **回归锁 / `DEV_WORKFLOW_QUALITY`**：修好/重写时的主路径+回流、已好清单——与本 playbook **叠加**，不互相替代。

---

## 4. 落地前检查清单

每个 Slice 落地前（开 PR / 请人预览前）须逐条确认。任一条「试图绕开」→ **不得**声称本 Slice 可合。

- [ ] 本次改动是否试图绕开中央 Dispatcher / Registry？（是 → 停；Lab-only 调试入口除外，且不得进产品路径）  
- [ ] 兜底路径是否指向**已有正式默认流程**，而非新建简化路径？  
- [ ] Lab 验证顺序是否先于生产钩子接入？（不确定观感已在 Lab 可播/可关；产品钩子在后）  
- [ ] 本次改动是否已在对应的 `*_BIBLE` / `*_WIRING`（及必要的 `ASSET_INVENTORY` / `SHARED_RESOURCES`）里登记或更新状态？  
- [ ] 新状态与 DORMANT / 欢迎 / 深夜 / Hold 等相遇时，优先级与互斥是否写进 Brief 或接线表（禁止「先上线再猜」）？  
- [ ] Feature flag（若本 Slice 已接产品路径）关闭时，是否**零污染**回退旧正式路径？异步/动画/overlay 是否有强制超时释放控制权？  
- [ ] 本 Slice 是否独立可验收（主路径 + 回流），且未把「下一 Slice 才做的架构登记」偷渡成「本 Slice 已完成」？  
- [ ] 高风险契约面（见 `DOC_CODE_CONTRACT`）若被触及，是否已计划/补上结构或行为锁（`docs:check` / smoke / e2e 失败用例）？

---

## 5. 案例参考（吹花欢迎 · 脱敏摘要）

来源经验：冷启动「吹花鼓励」微仪式（穿透 EmotionController、场景 Dispatcher、欢迎/DORMANT 互斥、气泡 UI、多语言）。产品细则仍以 [`FLOWER_BLOW_WELCOME_DESIGN.md`](./FLOWER_BLOW_WELCOME_DESIGN.md) 为准；**此处只抽象可复用教训**。

### 5.1 正面：四件套用得对

| 四件套 | 该次怎么用 |
|---|---|
| 资产与逻辑解耦 | Phase 1 只入库 + 调试可播 + CapCut 回 Idle；**不改**冷启动 / `WELCOME_APP` |
| 功能切片 | Lab 动画 → Lab 气泡 → Dispatcher 产品接线 → 抛光；每片可单独验收 |
| 优先级门闩 | DORMANT 高于彩蛋；彩蛋与欢迎池同日互斥（XOR）；未命中彩蛋仍走现池 |
| Feature Flag + 防守兜底 | flag 关 = 完全回退现有冷启动；气泡强制超时销毁，动画失败不卡住 Idle |

### 5.2 反面：架构红线对照（原提案 vs 修正）

| 原提案（话术陷阱） | 修正后做法 | 对应陷阱 |
|---|---|---|
| 产品路径「单点硬调、不碰 Dispatcher / Bible」 | 产品接线**必须**走 Dispatcher + 先登记 Bible / 接线表 | A |
| 「先挂产品气泡 / onAppReady，后补动画」 | 先 Lab 动画衔接与回 Idle，气泡先在实验室与动画同验，**最后**接产品钩子 | B |
| 未命中吹花 → 直接落 Idle（跳过欢迎池） | 未命中仍走**现有** `WELCOME_APP`，再进入既有深夜互斥 | C |

---

## 6. 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-06 | 初版：触发条件、降险四件套、架构红线（三类话术陷阱）、落地前清单、吹花案例脱敏摘要；接入 `risk-mitigation-playbook` |
