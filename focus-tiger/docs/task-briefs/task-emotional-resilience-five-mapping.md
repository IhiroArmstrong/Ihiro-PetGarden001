# Task Brief：情绪韧性五项对照表（只动文档）

> **状态**：方案文档 · **本轮不写运行时代码** · PO 2026-11-26 点头生效  
> **类**：A 类（文档 + 事实核对）  
> **上游**：[`task-ground-exercise-standalone-menu.md`](./task-ground-exercise-standalone-menu.md)（2026-09-13）· [`PRODUCT_MOMENTS.md`](../PRODUCT_MOMENTS.md) · [`COMPANION_CONTRACT.md`](../COMPANION_CONTRACT.md) · [`inner-development-daily-noticing.md`](../inner-development-daily-noticing.md)  
> **交付 SSOT**：对照表正文见 [`inner-development-daily-noticing.md`](../inner-development-daily-noticing.md) §8；本节留存拍板与核对记录。

---

## 大白话

五项情绪韧性练习**不**并进接地练习，也**不**新开「情绪韧性训练」栏目。这一轮只做两件事：先核对三个事实；再写对照表——每项对应现网哪个入口、覆盖多少、哪里是空白。

接地练习正文**不加**「不用赶它走」；沿用 `RESET_GROUND_*`。

---

## 一、已拍板

| # | 决策 | 落点 |
|---|---|---|
| 1 | 接地两钮保持原样（感受地面 / 环顾四周），五项不当第三、第四钮 | §六 |
| 2 | 五项只当内在成长方向的对照表，不做「情绪韧性训练」菜单 | §四 · 方向锁 §8 |
| 3 | 「挫折之后重新开始」不叫 **Recover**；**Recover** 继续只表示专注内的注意力回神 | §五 |
| 4 | 接地练习正文不加说教句，沿用 `RESET_GROUND_*` | 接地 Brief §5.2 |
| 5 | 用户可见文案不出现「挫折」「韧性」「训练」「变强」；用户侧「回来」口径只用「回来就能再坐」 | §四 |

---

## 二、事实核对（V1–V3）

### V1 · 接地开场句 locale

| 键 | en | zh | ja |
|---|---|---|---|
| `RESET_GROUND_INTRO` | Feel the ground beneath you. Nothing to fix — just notice the contact. | 感受脚下的地面。不必修正——只是觉察接触。 | 足の下の地面を感じてみる。直す必要はない——触れ合いだけに気づく。 |

**出处**（develop 树）：

- [`focus-tiger/src/locales/en.json`](../src/locales/en.json) L111  
- [`focus-tiger/src/locales/zh.json`](../src/locales/zh.json) L109  
- [`focus-tiger/src/locales/ja.json`](../src/locales/ja.json) L109  

**结论**：分析稿引用的中文句与现网一致；文档应写 **locale 键名**，不要无键裸引。

### V2 · 专注中邀请点「要」是否打开感受地面

**属实。** Focusing · Here & Now · T51 觉察邀请（`AwakenInviteUI`）点 Yes → **直接** `RecoverResetPracticeUI.show(RESET_ROUTES.GROUND)`，**不**经「更多」菜单、**不**经两钮选择层。

**出处**：[`focus-tiger/src/main.js`](../src/main.js) L2377–L2385（`onAccept`：`kind !== 'extend'` 时 `recoverResetPracticeUI?.show(RESET_ROUTES.GROUND)`）。

**与接地 Brief 关系**：Brief 决策 2 / §5.1 描述的是 **Idle → 更多 → Ground exercise** 主入口；§3.2 写「无任何被动触发」指 **已废弃的 refocus emoji 条**，**不**包含用户点「要」后的 Focusing 邀请。须在接地 Brief **补登记**第二入口（见该 Brief §3.5）。

**设计含义（文档）**：邀请可拒绝（C-08）；用户主动点头后才开练习；**不是**系统猜心情弹课。与「不在菜单里塞第三钮」无冲突。

### V3 · 公案落地后「感受地面」

**用户自己点；仅打开选择层，不自动开四段引导。**

- 次按钮 `data-testid=contemplative-inquiry-land` → `onLand` → `groundExerciseChoiceUI.open()`  
- **出处**：[`focus-tiger/src/ui/ContemplativeInquiryUI.js`](../src/ui/ContemplativeInquiryUI.js) L421–L423 · [`focus-tiger/src/main.js`](../src/main.js) L2762–L2764  
- **验收锚点**：[`e2e/contemplative-inquiry.spec.js`](../e2e/contemplative-inquiry.spec.js)（点 land → 选择层可见）

**结论**：不是被动路径；不 contradict Brief「用户点名」。

---

## 三、对照表交付

见 [`inner-development-daily-noticing.md`](../inner-development-daily-noticing.md) **§8**。

---

## 四、文案红线（对照 COMPANION_CONTRACT）

- 用户可见不出现：挫折、韧性、训练、变强（C-02 / C-03 / C-05 / C-06）。  
- 「回来就能再坐」；不带缺席天数（C-04）。  
- 不写「系统判断你情绪差时弹出」（C-08 / C-09）。  
- 本轮不新增用户可见文案；表里若建议新句 → 标 **B 类，另走 Brief**（C-11）。

---

## 五、命名纪律

- **Recover** = 专注内注意力回神（被动 Re-focus + 主动 Tiger Anchor），见 [`PRODUCT_MOMENTS.md`](../PRODUCT_MOMENTS.md) §4.3。  
- 「挫折之后重新开始」挂点写 Journey 回来、诚实补登、归来问候；**不写 Recover**。

---

## 六、明确排除

- 不改接地接线、文案、两钮结构。  
- 不动 Take a Breath / MicroRitual。  
- 不建新菜单、栏目、练习。  
- 不碰倾诉安全线。  
- 不写 `src/`（本 Brief 回合）。

---

## 七、共用机制核对（COLLAB.md 第七节）

本轮无 UI、无浮层 → **本轮不适用**（overlayBusy / HUD 呼吸 / z≥17 遮罩均不涉及）。

---

## 八、验收

- [x] V1–V3 各有路径、行号、原文或「未找到」  
- [x] 对照表五项齐全，有现网依据  
- [x] 无第四节禁词作用户可见建议  
- [x] V2 属实 → 接地 Brief §3.5 已登记  
- [x] B 类候选见方向锁 §8.4

---

## 九、后续门槛

2026-12-08 首包之后，仅当出现用户**点名**要练「先停一下」的证据，才立项与接地、引导冥想**平级**的「暂停」短练习，另写 Brief。门槛：用户点名、一次一项、几十秒、可跳过、不打分、过 C-11。无证据则不做。

---

## 十、B 类候选（另走 Brief）

| 候选 | 原因 |
|---|---|
| 平级「暂停」短练习（非 Ground 第三钮） | 唯一预期空白；与 Take a Breath、T51 邀请近接，须单独冲突扫描 |
| 任何接地 `RESET_GROUND_*` 措辞增改 | Brief §5.2 禁止本轮新写说教句 |