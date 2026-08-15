# Task Brief · Sanctuary Enso Mark（页面左下角金石圆相）

> **状态（2026-08-15）**：素材已入库 · UI 已接线 · **位置改为页面左下角**（不再钉蒲团中央）。  
> **目的**：Sanctuary / Membership 用户在主场景常驻一枚金石圆相徽章——静默但可辨的付费身份标识。  
> **原则**：经济可持续；不制造焦虑；与练习纪念（蒲团刺绣 / 芥子须弥）语义分立。

## 素材（已选）

| 项 | 口径 |
|---|---|
| **正式路径** | `public/ui/support/sanctuary-enso/sanctuary-enso-mark.png`（RGBA · ~847² · 真透明） |
| 来源 | 用户根目录 `Enso-sample0025.png`（原黑底）→ 抠图去底 + 圆形羽化 |
| 落选对照 | `candidates/`：`0021` 棋盘格伪透明抠图、rembg 变体、cream 预览——实现默认**只用**正式路径 |
| 为何选 0025 | 黑底键控干净、金盘边缘利落、银 Enso 笔触完整；0021 棋盘格键控易伤金属纹理 |

## 位置与视觉规格（解决「隐约」↔「彰显」张力）

> **2026-08-15 用户改口**：干脆挪到**页面左下角**合适位置（不再钉蒲团中间）。先前「蒲团正中央镶嵌」作废。

| 规格 | 验收锚 |
|---|---|
| 锚点 | **页面左下角** `position: fixed`。宽屏：`left: 16px` / `bottom: 20px`（safe-area max）；375：抬到三球之上（`64 + 83 + 12`），避免压 Quick Start |
| **直径** | 宽屏 **52 CSS px**；375 **44 CSS px**（chrome 量级，不是蒲团比例） |
| **默认透明度** | 盘体 **opacity 0.78–0.88**；勿低于 0.65（375 上会「看不见」） |
| Focusing | 可降至 **0.45–0.55**——仍在左下角；Rise 回 Idle 恢复默认 |
| Hover / 点按 | 装饰层 **`pointer-events: none`**；点按**不**开商店。身份说明放 Settings 一句即可 |
| 层级 | z-index **11**（与 kindness badges 同带；低于 dock 16 / `?` 22）；登记 `Z_INDEX.md` |
| 多分辨率 | 必测：**宽屏** + **375**。375 须抬过三球且 ≥ 44 CSS px |
| 文案 | 默认无气泡；Settings 可「Enso mark · Sanctuary」；禁夸耀成就腔 |

## 为何还要做（相对已有徽章）

| 已有 | 缺口 |
|---|---|
| Sanctuary 阿寅旁章条 | 练习上涨也会加枚；Tea 也有章——付费身份不够一眼 |
| Unlock 卡 Pass 文案 | 不在主场景朝夕可见 |
| **Enso（本任务）** | 主场景左下角**常驻可辨**身份 |

## 产品契约

| 项 | 口径 |
|---|---|
| 显示条件 | `isEntitled` 进阶（lifetime∪subscription）；**零** tip 耦合 |
| 与纪念刺绣 | Backlog「30 天蒲团刺绣」= **练习**纪念（边缘纹样）；Enso = **付费**身份徽章。禁止混资产 |
| 与芥子须弥 | 练习 score 卡；**不**替代 Enso |

## 实现要点

1. Idle chrome 条件渲染；读取正式 PNG。  
2. 单测：entitled 显示 / 未授权与 tip-only 不显示。  
3. TEST_TRACKER：宽+375 可辨性 + Focusing 淡化 + 不挡 Sit。  
4. `ASSET_INVENTORY` 已登记本目录。

## 建议分支

`feature/sanctuary-enso-mark`

## 不做

- 闪烁 / 粒子 / 旋转狂欢。  
- 未购用户主场景常驻大锁。  
- 把 Enso 点按绑成强制 Checkout。
