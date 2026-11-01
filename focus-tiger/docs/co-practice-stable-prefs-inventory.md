# 共修稳定偏好盘点（L1 / L2 开工前）

> **日期**：2026-11-01  
> **性质**：只读地面真相 + PO 2026-11-01 六条规则 + 三条勘误。**不改 `src/`**。T60 补强 [#1525](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1525) **已合** `origin/develop`（merge `de3f6403`）。核对基线更新为 develop tip 含 #1525。  
> **配对 Brief**：[`task-briefs/task-co-practice-stable-prefs-l1-l2.md`](./task-briefs/task-co-practice-stable-prefs-l1-l2.md)  
> **读层分散补充**：[`pref-state-read-inventory.md`](./pref-state-read-inventory.md)  
> **核对基线（代码）**：`origin/develop` 含 #1525 merge **`de3f6403`**（其后还有 T71 docs）。  
> **不是**：T54 90 天实验、键盘三态、feature-affinity 页面计数、L3 时段文案。

---

## 0. 四句结论（PO 已认同）

1. 共修主路径上只有 **「上次选的分钟」**（`focus-tiger.focus-duration-pref.v1` + **T59**）会立刻记住；**没有**「最近 5 场里 ≥3 场同一选择」的稳定层。  
2. **没有**「最常用页面 / 入口点击」账本；v1 **不新增** `feature-affinity.v1`。续练位 v1 含义 = **最常用的练习配置一键续练**（分钟 + 同坐方式），不统计页面点击。  
3. **T58** 已合能力 = 邀请变安静 + 倦时默认 chip **最多短一档**（仍须自己点）；**不是**「越来越懂你」的完整 L1/L2。  
4. **T60** 漏键与输入节奏：[#1525](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1525) **已合**。白名单含 `open-ended-nudge.v1` / `practice-paper-hidden.v1`；删全部走 `clearAllFocusTigerUserData()`（含 `resetInputRhythmForDeleteAll`）；`audit:shared-resources-reset` 已进 `docs:check`。

---

## 1. 用户可选维度（共修相关）

| 维度 | 现网怎么记 | 稳定层（≥3/5） | L2 事实句 v1 |
|---|---|---|---|
| Focus 计时分钟 | 每次 **点 chip** 写 `focus-duration-pref`；开表时另写手动锚点 | **无** | 小本子陈述 T58；无「你常做 X 分钟」 |
| Breath 计时分钟 | 左球分轨；**无**与 Focus 同形的稳定键 | **无** | **无** |
| Companion 模式（Stay / Step / Across） | 上次点击写 `companion-mode` | **无** | **无** |
| 同坐配置（模板 / 配方 / open-ended） | `ritual-recipe`、官方模板写回时长 | **无** | **无** |
| 续练位（一键同配置开练） | **未实现** | 依赖稳定层 | v1 **禁止时段词** |

**计数事件（Brief 锁 · PO 勘误）**：稳定层只认 **亲手改选之后开表**。浏览 chip 不计。接受预选开练只刷新 `lastUsedAt`，**不**入 3/5 投票窗。晋升是滚动 5 场 ≥3，不是连续三次。

---

## 2. 存储键与删除 / 备份

| 键 / 模块 | 用途 | T60 白名单 develop | 本地 Backup v6 | T54 研究分享 |
|---|---|---|---|---|
| `focus-tiger.focus-duration-pref.v1` | 上次分钟 / 模式 | 是 | 是 | 否 |
| `FOCUS_DURATION_MANUAL_ANCHOR`（T58） | 手动锚点 | 是（yin-adaptation 包内） | 随适应 | 否 |
| `focus-tiger.yin-adaptation.v1` | 适应 / 暂停 / 忘掉 | 是 | 是 | 否 |
| `focus-tiger.invite-outcomes.v1` | T57 | 是 | 是 | 否 |
| `focus-tiger.session-duration-offer.v1` | T67 接合账 | 是 | **否** | 否 |
| `focus-tiger.awaken-check-ins.v1` | T52 | 是 | 是 | 否 |
| `companion-mode` | 上次陪伴模式 | 是 | 是 | 否 |
| `focus-tiger.open-ended-nudge.v1` | 无尽模式 nudge | **是（#1525）** | 登记 SHARED | 否 |
| `focus-tiger.practice-paper-hidden.v1` | 观察纸折叠 | **是（#1525）** | 登记 SHARED | 否 |
| **`focus-tiger.stable-prefs.v1`（规划）** | L1 稳定层 | Brief：进白名单 + backup | Brief：v6+ | **禁止** |

**忘掉边界（Brief 锁 · PO）**：忘掉清除 Yin「学到的」——**稳定层、T58 手动锚点、T57、T67**；**不清**用户显式设置——提醒时分、环境音、**上次选的分钟**（`focus-duration-pref` 仍清否：Brief 写 **保留 last pref**，只清 stable 与 anchor；与现网 `forgetYinAdaptationTuning` 差异在 PR-1 改）。

**「不是这样」（Brief 锁）**：清空该维度稳定值与连续计数；**14 天内**不再提升该维度（对齐 T57 暂停思路）；之后须重新 ≥3/5 才再出现 L2 / 预选。

---

## 3. 读点分散（为何感觉不到「懂」）

无统一 resolver。时长至少三条读法：生偏好、`resolveAdaptedFocusDurationHighlightMinutes`、T59「有没有存过」。配方写偏好可 bypass 锚点规则。详见 [`pref-state-read-inventory.md`](./pref-state-read-inventory.md) §2。

PR-1 目标：**稳定层写盘 + 单一读口**（仍不替代 T58 算法，只叠加 stable-prefs）。

---

## 4. v1 明确不做

- **`feature-affinity.v1`** 或任何「入口点击次数」账本（倾诉次数也不记）。  
- 登录首屏按点击重排菜单；续练位 **固定槽位**，只换文案与目标配置。  
- L3 **时段词**（ evening / 晚间 / morning …）出现在续练位或 L2 模板——时段事实仍只走 **T62** 单独同意。  
- 把 chip 点选次数当稳定层计数。  
- 把 T58 倦时短档默认接受算作「用户投短档票」。

---

## 5. 实现 PR 拆分（PO 锁定）

| PR | 代号 | 内容 |
|---|---|---|
| 已合 | T60 #1525 | 白名单两键 + 删全部 orchestrator + 输入节奏重置 + SHARED 审计 |
| docs | 本 PR | 本盘点 + L1/L2 Brief + 术语表 **T73–T75** |
| **PR-1** | **T73** | `stable-prefs.v1` + Focus 分钟 + L2 事实句 + 「不是这样」/ 忘掉扩展 + 测试 |
| **PR-2** | **T74** | 续练位 UI + 叠层仲裁 |
| **PR-3** | **T75** | Breath 分钟键 + Companion 模式稳定维度 |

**T68**：不重开已锁第 1 档数字；**L1 上线验收**加一条——复跑 T68 曝光夹具，看 C 通过率是否因 L1 抬高。

---

## 6. 审计缺口（顺带）

- `audit:local-backup-coverage` 仍只覆盖 backup 键；#1525 已增 **`audit:shared-resources-reset`**（SHARED 键须在白名单或显式豁免表）。  
- 产品 Privacy「删除全部」若未接 `clearAllFocusTigerUserData()`，仍与 DEV 实验室不同轨——SHARED 已要求未来须同 orchestrator。
