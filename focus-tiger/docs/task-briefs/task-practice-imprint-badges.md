# Task Brief · 修行纪念印 · 累计里程碑徽章（Web2 · 无链）

> **状态（2026-08-24）**：待排期 · 用户拍板采纳 Web2「岁月印记」，**明确拒** mint / wallet / token / SBT。  
> **接哪里**：C 轨 **Yin's Collections → 勋章印记** 页签（`FOCUS_COINS.md` §7 四页签之四）+ 纪念奖励 Backlog 的「金牌/徽章」子集（**不**做成就墙、**不**做 3D 柜）。  
> **与现网关系**：`MilestoneGlow`（连续 7/21/100 **仪式动画**）与 `mustardSeedSeal`（score≥21 **诗稿印**）**保留**；本 Brief = **静态高精度禅意徽章** + **累计时长 / 温和练习 score** 触发，**不用「连坐 N 天」作对外文案**。

---

## 一句话目标

用户达成可解释的**长期练习积累**（累计专注分钟、统一 practice score 等）后，获得**只增不减**的「修行纪念印」静态徽章，归档在珍藏 **勋章印记** 页签；主界面仅可选轻量 toast / 一次出卡，**不**搞打卡竞速话术。

---

## 产品契约

| 项 | 口径 |
|---|---|
| 对外名 | **修行纪念印** / **Practice Imprint**（日）· **岁月印记**（营销句可用，UI 主名用前者） |
| 禁止词 | mint、wallet、token、NFT、SBT、区块链、铸币 |
| 触发（首刀建议） | **累计终身专注分钟**（`LotusPondStore` / 与 score 同源）+ **统一 practice score** 档；例：600 / 3000 / 10800 分钟（100h）或 score 21 / 42 / 84（与芥子印 score 公式一致：`days + floor(minutes/60)`） |
| **不做** | 以「连续 N 天未断」作为**徽章解锁条件**或**卡片主文案**（MilestoneGlow 动画节点可保留 streak id，但徽章 copy 写「同坐累计」「陪伴时长」） |
| 呈现 | 2D 极简禅意静图（茶盏、蒲团、芥子印气质）；卡面含：开始季语（如「始于 2026 年夏」）、累计分钟、生成本地日；**不**写链上 hash |
| 持久化 | 新 key 或扩 `entitlement-ownership` 式只增列表（`imprintIds[]`）；与 Tea/Sanctuary `badgeIds` **零写入** |
| 入口 | 达成时一次 `#practice-imprint-card`（可复用 `MustardSeedSealCardUI` 壳族）；⋯/抽屉 **Yin's Collections → 勋章印记** 可重读 |
| 档位 | **免费**（C 轨身份，非 B 轨 entitlement） |

---

## 范围

**做**：

1. SKU / imprint 定义表（kebab-case id + 门槛 + 静图路径 + i18n）。  
2. 判定：会话完成 / Honesty 补登后评估（与 `practiceBadgeAward` / score 同源，**单测锁**）。  
3. Collections **勋章印记** 页签（首版可 3–5 枚 + 未解锁灰位占位）。  
4. 一次出卡 + 菜单重读；`TEST_TRACKER` + 场景附录一行。

**不做**：

- 链、托管钱包、导出「可验证证书 hash」。  
- 成就墙全屏、3D 公仔柜。  
- 用 imprint 解锁 Deep Ambient / 仪式（B 轨）。  
- 改 MilestoneGlow streak 判定（另任务若需改 copy 只改 i18n，不动节点 math）。

---

## 已好清单

- Celebrating / SessionComplete / MilestoneGlow 优先级与互斥不退化。  
- 芥子印、Idle 练习徽章条、莲花池 Slice A 自动纪念不被拦截。  
- Honesty 补登与正常计时一视同仁（门槛计数须含补登分钟）。  
- 中断不撤回已得 imprint。

---

## 建议分支

`feature/practice-imprint-badges` · 独立 worktree · `--base develop`。

---

## 依赖与顺序

| 前置 | 说明 |
|---|---|
| **建议并行** | `task-journey-daily-card`（存图管线可复用卡面导出 helper） |
| **同壳** | Collections 四页签壳：`task-yin-collections-four-tabs.md`（本任务占「勋章印记」页签） |
| **素材** | 设计师出 3–5 枚静图（kebab-case 路径）；首版可用占位 + 芥子印章 reuse 一张 |

**预估**：4–6 人日（UI 壳 + 判定 + 单测；不含全量美术）。

---

## 后台网络

不涉及用户点击外自动请求；imprint 判定与写入纯本地。云端备份若纳入须走 `PRACTICE_BACKUP` 白名单扩展立项，**本任务默认不扩 6 key**。
