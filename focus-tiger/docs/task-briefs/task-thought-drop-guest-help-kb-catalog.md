# Task Brief · Thought Drop 帮助 guest 全文 + KB catalog（路线 X · 阶段 2）

> **状态**：**PO 2026-11-19 点头开工**（合理则办 · **窄口径 B**）  
> **代号**：`thought-drop-guest-help-kb-catalog`（不得自编 T 号）  
> **类**：**B 类**（Help Center 长文、Confide 内 KB 短答、菜单路径登记）  
> **依赖**：方向锁 [`NOTICING_ONE_LINE.md`](../NOTICING_ONE_LINE.md) · 改名 `#1782` / `#1783` 已合 · 隐私/备份扫尾 `#1786` **已合** `39df3914`  
> **旁支**：`feature/thought-drop-guest-help-kb-catalog`  
> **不是**：`ConfideToYinUI` 路由 · `noticingOneLineGenerateGate` · 付款受保护路径 · `confide*` / `data-testid` 改名 · R2L-02 · 营销站法律全文

## 0. 大白话

菜单已经叫 Thought Drop / 觉察一句。帮助中心和卡片内短答还在说「Chat with Yin 尚未对客人开放」——这和第一份安装包**必须能打开入口**打架。

本刀把帮助长文、KB catalog、登记路径改成可见名，并改成：**入口已开，一次一句，固定接住；不是自由聊天，不是本机模型现场写，不是解锁陪伴。**

## 0.1 Plan A 拍板（锁死）

**窄口径 B**（本 Brief 唯一实现路径）：

| 可写 | 禁止写 |
|---|---|
| 菜单路径 ⋯ → Practice → Thought Drop / 觉察一句 | Chat with Yin is ready now / 本机生成已开 |
| 入口已开；留下一闪而过的念头；不是对话 | unlock companion / after you unlock / 打开即可深度聊天 |
| 日语入口仍隐藏 | 暗示日语倾诉已开 |
| 高危仍走固定求助 | 临床评估、诊断、治疗 |

须改 [`plan-a-guest-confide-copy-policy.js`](../../scripts/plan-a-guest-confide-copy-policy.js)：

1. `PLAN_A_CONFIDE_TOPIC_RE` 纳入 Thought Drop / 觉察一句。  
2. 新增 **safe 短语**（入口已开 + 一次一句 / 非专业照护 / 非本机自由生成），使 Help 新稿能过扫描。  
3. **保留** forbidden：`Chat with Yin is ready now`、`unlock companion`、`with on-device` 等购买/生成承诺。  
4. 单测：旧「尚未对客人开放」仍可接受；新「入口已开但非生成」须绿；「ready now / unlock」仍红。

**不采用 A**（只换名、仍写尚未开放）：会与已合的 Route X 入口对客事实矛盾。

## 1. 目标

1. **Help Center** `help-center.json`：intro、confide note、Companion 区文章标题与正文（en/zh；ja 只改路径名、不发明日文入口）。  
2. **`productKnowledgeCatalog.json`**：短答与 trigger 里的菜单名 / 功能名。  
3. **KB 登记**：`kbLiveEntryRegistry.js` · `docs/kb-live-entry-registry.md`。  
4. **生成/校验**：`generate-help-center-articles.mjs` 标题模板；`confideProductKnowledge.test.js`；`voiceProductLexicon.js` 可见名。  
5. **邻接 locale**：`confide-ja-not-yet-open.json` 英段、`co-practice-research-consent.json` 收集说明、`guided-meditation.json` busy hint、`samatia-display-name.json` 中仅指该入口的句子——**不改** Support 结账叙事。

## 2. 非目标

- `marketing-site` 法律摘录（另 Brief）  
- 仓内 `PRIVACY_NOTICE.md` 归档全文  
- Help 品类重排或新文章  
- Confide 发送链 / 危机层  
- 阶段 1 已合的 privacy slice（#1786）

## 3. 冲突扫描

对照 **AE**、**T22** Help Center、Plan A guest 扫描、**T10** 语音词。

| 轴 | 判断 |
|---|---|
| **强度** | 文案承认入口已开，但不加重生成或聊天 |
| **语气** | Thought Drop 降预期；禁止写回深度聊天 |
| **职责** | KB 只答路径/操作，不承担情绪句 |

无未决冲突（PO 已锁窄 B）。

## 变体矩阵

| 变体 | 预期 |
|---|---|
| en Help Companion 区 | 区名 Thought Drop；路径一致；不出现「not open to guests」作为现状 |
| zh | 觉察一句 |
| Confide 内问怎么打开 | catalog：⋯ → Practice → Thought Drop |
| Plan A 扫描 | 绿 |
| ja 界面 | 入口仍隐 |

## 点击反馈（0–1 秒）

不涉及新控件。Q1/Q2：**不涉及可点击交互**。

## 边缘状态

| 边缘 | 预期 |
|---|---|
| 旧 forbidden 无 caveat | 仍红 |
| catalog 与 help 路径不一致 | 以 `CONFIDE_MENU_LABEL` 合并后 locale 为准 |

## 共用机制 / 付款 / 后台网络

不碰受保护付款路径、z-index、overlay。**不涉及后台网络**。

## 验收

- `cd focus-tiger && npm run test:smoke`  
- `npm run check:plan-a-guest-confide-copy`  
- `confideProductKnowledge.test.js` 绿  
- TRACKER：UI 待人工测试 — Help Companion 区 en/zh 各 2 篇

## 参考

- [`NOTICING_ONE_LINE.md`](../NOTICING_ONE_LINE.md) §2–§3  
- #1786 阶段 1 扫尾已合
