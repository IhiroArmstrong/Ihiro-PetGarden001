# 偏好 / 状态读点盘点（记住 → 响应）

> **日期**：2026-11-01  
> **性质**：只读地面真相。对照 `origin/develop` tip `85caf325`（#1489 合入后）。**不改 `src/`。**  
> **配对 Brief**：[`task-briefs/task-remember-respond-read-layer.md`](./task-briefs/task-remember-respond-read-layer.md)  
> **人话**：现在机器上已经记下不少选择，但各入口自己去翻小本子，没有一本共用的「记住 → 再响应」。  
> **不是**：T58 小本子重做、T54 90 天实验、键盘/窗口三态判别、T68 共修发画。

---

## 0. 一句话

状态响应和个性化选择弱，主要不是「没信号」，而是 **信号各记各的、读的时候不经过同一扇门**。T58 的小本子是旅程里给人看的句子，不是全产品的唯一读源。

核对分支：本盘点基于 `origin/develop`（behind = 0，相对当时 tip `85caf325`）。主仓当时检出的 `feature/t66-mindflow-step2-embedding` 落后 8 笔，**不能**当 develop 事实。

---

## 1. 现有事实仓（写侧）

| 事实 | 键 / 模块 | 已合依据 | 记什么 | 谁写 |
|---|---|---|---|---|
| 上次时长 + 计时/无尽 | `focus-tiger.focus-duration-pref.v1` · `focusDuration.js` | 场景 T；T59 #1454 | 最近一次芯片或配方同步的分钟 / 模式 | 开表前芯片点选；官方坐姿模板；用户改配方 |
| 手动时长锚点 | `FOCUS_DURATION_MANUAL_ANCHOR_STORAGE_KEY` · `yinAdaptationStore.js` | T58 #1451 | 「自己拨过」的锚点，供倦时下调 | `main.js` 在芯片点选时与偏好一起写 |
| 适应开关 / 暂停 / 忘掉 | `focus-tiger.yin-adaptation.v1` | T58 #1451 | 开/关、按种类暂停、改正/忘掉 | 旅程小本子；邀请下场写入 |
| 结束打卡顺/乱/倦 | `focus-tiger.awaken-check-ins.v1` | T52 #1424 | 环缓标签 | `AwakenCheckInUI` |
| 邀请下场 | `focus-tiger.invite-outcomes.v1` | T57 #1449 | accepted / dismissed / ignored | `main.js` → `recordInviteOutcome` |
| 收工钟点 | `workEndPreference.js` | T61 #1455 | 用户自设时分 | 设置面板 |
| 晚间练习事实 | `eveningPracticeFacts.js` | T62 #1459 | 滚动 7 日；默认关 | 练习结束路径（须同意） |
| 场次出示 vs 实坐 | `focus-tiger.session-duration-offer.v1` | T67 #1478 | Yin 出示的默认档 + 坐完分钟 | `coPracticeSessionJoinLedger` |
| 上次陪伴模式 | `COMPANION_MODE_STORAGE_KEY` | 现网三选一 | 上次点的 Stay / Step away / Across tools | `CompanionModePicker` |
| 到达 Notice | `appendArrivalNoticeSignal` | Arrival v2 | 当场点过的觉察 | Arrival；**下次不预选**（口径表已写死） |
| 练习日历 / 旅程 | `journey-log.v1` 等 | 成长旅程 | 分钟与日期 | 完成仪式 |
| 应用内提醒时分 | `focus-tiger.reminder-preference.v1` | 现网 | 用户设的钟 | 提醒面板 |
| 会话存在摘要 | T50 | #1394 / #1401 | 影子；不改可见行为 | 本盘点不把它当用户偏好 |

T54 研究分享白名单 **不含** 适应 / T57 / T52 / T67 接合账。本层继续禁止塞进去。

---

## 2. 读点：谁在读、有没有绕过统一门

**结论：没有统一 resolver。** 最接近的是 `resolveAdaptedFocusDurationHighlightMinutes`（只服务开表前高亮），其它入口直接读自己的 store。

| 入口（用户能感到的） | 读什么 | 函数 / 模块 | 是否经统一 resolver | 绕过说明 |
|---|---|---|---|---|
| 开表前时长芯片高亮 | 锚点 + 近 5 次结束「倦」 | `resolveAdaptedFocusDurationHighlightMinutes` ← `main.js` 交给 picker 的 `preferredMinutes` | **仅时长高亮这一条** | 这是现在唯一的「适应读口」。不是全产品读门 |
| 「还是上次那个」那句 | 是否已有时长偏好 | `FocusDurationPickerUI` + T59 文案 | 否 | 只问「有没有存过偏好」，不问适应是否下调 |
| T67 出示默认分钟入账 | 同上高亮分钟 | `main.js` `offeredDefaultMinutes = resolveAdaptedFocusDurationHighlightMinutes` | 与芯片共用该函数 | 写接合账；不供其它 UI 读 |
| 旅程小本子句子 | 偏好键 + 打卡 + 适应状态 | `buildYinAdaptationNotebookLines` | 否（展示组装，不是产品读门） | 旅程详情专用 |
| 旅程关闭适应 | `yin-adaptation.v1` | `GrowthJourneyDetailUI` | 否 | 只影响 T58 规则，不重排入口 |
| 共修契约面开关说明 | 适应开/关、收工偏好 | `coPracticeContractSurface.js` `readYinAdaptationState` / `getWorkEndPreference` | 否 | 说明用，不驱动默认分钟 |
| 练习观察纸节律 | T52 结束标签 7 日 | `getPracticePaperCheckInRhythm` | 否 | 只读展示；不回调时长 |
| 晚间练习中性句 | T62 事实 | `eveningPracticeFacts.js` → 旅程详情 | 否 | 最接近「说出所见」，但只覆盖晚间且须单独同意 |
| 觉照邀请是否出 | 限频 + T58 暂停 | `isInviteKindAdaptationPaused` ← `main.js` | 否（邀请门闩，不是偏好门） | 变安静已做；不是个性化排序 |
| 收工邀请 | 用户自设钟 | `evaluateWorkEndInvite` | 否 | 用户声明，不是 Yin 提议钟点 |
| 陪伴三选一预选 | 上次模式 | `CompanionModePicker` 读自己的 storage | 否 | **记住上次模式**；三钮顺序固定，无重排 |
| 配方官方模板 | 写回时长偏好 | `officialSittingTemplateSelection.js` `savePreferredFocusDurationMinutes` | 否 | **写侧第二条路**，与芯片争同一键 |
| 开坐提示宿主 | 读时长偏好 | `sittingSessionPromptHost.js` `loadPreferredFocusDurationMinutes` | 否 | 绕过适应高亮函数，读的是生偏好 |
| 动画 Dispatcher | 会话态 FOCUSING / 深夜冷却 | `sceneAnimationDispatcher.js` | 否 | 生命感 / 冷却，**不是**偏好账本 |
| Confide / 一句话长短 | 路由与句包 | 倾诉与 CAW / Quiet Line | 否 | 不读 T52/T58 |
| 入口排序（Sit / 呼吸 / 菜单） | — | — | **无** | 未发现按人重排 |

### 2.1 分散仲裁的现网形状

1. **时长有三条读法**：生偏好 `loadPreferredFocusDurationMinutes`、适应高亮 `resolveAdaptedFocusDurationHighlightMinutes`、T59「有没有存过」。同一场开表可以「高亮 15、那句仍说还是上次那个 25」。  
2. **时长有两条写法**：芯片点选（同时写偏好 + 手动锚点）；配方模板/编辑只写偏好键。锚点与偏好可能日后分叉。  
3. **「乱 / 倦」只在结束打卡写入**；观察纸读、适应层只用「倦」。到达 Notice 另仓，互不看见。  
4. **邀请暂停**只挡邀请，不挡芯片、不挡模式顺序、不挡一句话。

---

## 3. 状态 → 响应矩阵（空白处）

目标状态用少量可靠的：刚到、想开始、专注中、被打断后回来、收尾/收工，加上用户自己声明的乱/倦。每个状态看四个输出面。

图例：**有** = 现网已接且用户可感到；**弱** = 有信号或有动作，但几乎不随这个人/这个状态变；**空** = 该格没有差异化。

| 状态 | 精灵姿态 | 一句话长短 | 默认推荐分钟 | 入口排序 |
|---|---|---|---|---|
| 刚到（冷启动 / Arrive） | 弱：欢迎池 / 吹花 / Honesty，按日额度而非个人账 | 弱：通用欢迎 / 花句 | 空：尚未开表 | 空：Sit 坞固定 |
| 想开始（开表前） | 弱：Idle 呼吸基底 | 弱：T59 一句（有偏好才出） | **有**：上次分钟；倦够则锚点下一档 | 弱：三模式预选上次，**顺序不改** |
| 专注中 | 弱：收控件 / 静坐画面，不按人变 | 弱：T51 邀请固定编排 | 空：表已开 | 空：专注中收入口，无排序 |
| 被打断后回来 | **有**：Re-focus 点头 + toast（被动额度） | 弱：观察短句，不读打卡 | 空 | 空 |
| 收尾 / 收工 | 弱：结束仪式通用 | 弱：T61 用用户自己的钟问一句 | 空 | 空 |
| 用户声明「乱」 | 空：不改姿态 | 弱：观察纸可看见 | **空（有意）**：T58 写死第一版不用「乱」缩时长 | 空 |
| 用户声明「倦」 | 空 | 弱：小本子适应句 + 观察纸 | **有**：高亮短一档 | 空 |
| 提议—确认（Yin 问、人一键要/不要） | 空 | 空 | 空 | 空 |

四级阶梯对照：

| 级 | 要什么 | 现网 |
|---|---|---|
| 1 记住 | 同一选择 ≥3 次再预选 | **不够**。只有「上次」时长和「上次」模式，没有次数门槛 |
| 2 适应 | 拒绝多了更安静；倦则建议更短 | **已有** T58，且只许更安静 |
| 3 说出所见 | 数据槽 × 人审模板 | **一块**：T62 晚间句（须同意）。没有「这周有 4 个晚上练」通用槽 |
| 4 请你确认 | Yin 提议、接受/不要都入账 | **空**。T61 是人先设钟，不是 Yin 提议再确认 |

---

## 4. 已排除（本盘点不建议当缺口去补传感）

- 键盘节奏 / 窗口切换三态（焦虑/漂移/心流）：壳里稳定信号不足；C-11 禁止宣称未实现能力。T53 默认关，失败则退回 T51。  
- 把 Dispatcher `late_night` 冷却当成「懂你熬夜」：那是生命感时钟，不是睡眠诊断（T61/T62 口径）。  
- 到达 Notice 预选下次心情：口径表写明 **不得说**；现网不会预选。若要做，须另 Brief，不塞进读层第一刀。  
- T54 90 天：分享开关已合 ≠ 实验已开。本层指标只准本机、不对外宣称「越来越懂」。

---

## 5. 最小本机指标（先埋点、后宣称）

现网 **没有** 预选接受率 / 手动改写率 / 提议接受率。T67 接合账能事后对「出示默认 vs 实坐」，但不是这三率。埋点须：本机、可清、不进 T54 白名单。未达标前禁止对外说「确实越来越懂」。
