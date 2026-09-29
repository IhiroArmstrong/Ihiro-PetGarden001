# 产品知识库 —— 分类体系与字段结构

**状态（2026-09-26）**：仓内权威模板 + **第一批 5 条**（PO 人审已通过）+ **0006 呼吸练习试点**（#923 · **PO spot-check 已通过** · 盘点参考 · 检索走 0011+0001 · **不进 catalog** · `yin_may_retrieve: 否` · **验收数据：「呼吸练习在哪」→ 0011 已够用 · #961 不合**）+ **第二批 10 条**（顺延 0007–0017）+ **0018 寅币获取** + **0019 Five Moments / 0020 Honesty**（PO 书面放行）+ **0021–0023 Inspiration 三卡**（**PO spot-check 已通过** · catalog 已入库 · registry 已链 `kb-live-daily-quote` / `kb-live-zen-cinema` / `kb-live-wallpapers`）+ **KB-EDU-0001–0004 科普概念首批**（§4.7 · Brief #936 · **PO spot-check 已通过 2026-09-26** · **catalog 已入库** · `yin_may_retrieve: 是`）+ **0024–0026 Rituals 三场景**（§4.8 · **PO 2026-09-26 书面放行** · **catalog 已入库** · registry 已链 `kb-live-ritual-*` · 闸门 **28 条**）+ **0027–0028 Not alone 双条**（§4.9 · **PO 2026-09-26 书面放行** · **catalog 已入库** · registry 已链 `kb-live-quiet-together` / `kb-live-focus-circle`）+ **0029–0032 今日方向 / 栖居导航 / 社区 / 会员**（§4.10 · **PO 2026-09-27 书面放行成批入库** · **catalog 已入库** · registry 已链 `kb-live-today-direction` / `kb-live-sanctuary-nav` / `kb-live-community` / `kb-live-membership` · 闸门 **34 条** `审核状态: 已通过` 可进检索闸门）；0009 云备份禁用仍 **未审核** · registry 已改链 **0012**）。**运行时**：Electron 宽屏 Confide → `confideProductKnowledge.js` + `productKnowledgeCatalog.json`（关键词检索 · 原样短答 · `FT_CONFIDE_KB_RETRIEVAL=off` 回滚）。**已知技术债（PO 已立项、本轮不实现）**：KB 检索加一层 Qwen3-Embedding 近义匹配（复用 Confide 已装 embedding，替代无限加正则）；正式分类器方向仍见 `task-confide-kb-routing-gate.md`。  
**权威路径**：`focus-tiger/docs/product-knowledge-base.md`  
**交叉引用**：`task-briefs/task-confide-kb-retrieval-wiring.md`（检索接线）· `task-briefs/task-confide-kb-routing-gate.md`（路由闸门 · **PO 已点头** · 开工另开 Chat）· `task-briefs/task-kb-scaled-production.md`（规模化生产算法 · **PO 已拍板** · 第 1 步已合 #929 · 第 2 步缺口审计 `kb-live-gap-audit.md`）· `task-briefs/task-kb-practice-edu-concepts.md`（正念/专注/接地**科普概念**短答 · Brief **PO 已点头** · §4.7 首批 4 条 **已通过并入库 catalog**）· 过程性文档只做候选主题 · `LOCAL_AI_SCENARIOS_V1.md` · `LOCAL_AI_OPERATING_LAYER.md` · `CONFIDE_EXECUTABLE_INTENTS.md` · `MENU_CHROME_CENSUS.md` · `ONBOARDING_HINTS.md` · `CALM_ACTION_WISDOM.md` · `PRODUCT_POSITIONING.md` · `LOCAL_AI_WEB_MOUNT_PO_DECISION.md`

> 取代 Downloads 通用 RAG 草稿。知识库是后台检索源，不是帮助中心，也不是阿寅念稿机。

---

## 0. 心理练习「急救型」审核（已确认）

仓库与产品文档里 **没有** 固定的心理咨询资质审核人。产品定位明确：不是医疗器械、不是心理治疗或诊断（`HINT_APP_PURPOSE_WELLNESS_BODY`）；倾诉不做运行时危机干预生成、不假装专业救助。

因此 **第二步默认走「没有审核人」口径**：

- 急救型条目（接地引导语正文、危机相关练习）一律留在草稿池
- `yin_may_retrieve: 否`，不接入 Local AI
- 第一周样例 **只做产品功能短答**（本文 §四）
- 接地练习 **已有菜单入口**：知识库只指路，不入库可朗读长脚本

有人审之前，禁止把急救型改成 `yin_may_retrieve: 是`。

### 急救型草稿池（仅标题 / 场景登记 · 不进倾诉检索）

下列只记「用户可能在倾诉里问到、但库里禁止念长脚本」的场景；正文留在 locale / 练习 UI，**不**写成 `yin_may_retrieve: 是`。

| 登记 id | 标题 | 适用场景 | 现网入口 / 说明 |
|---|---|---|---|
| `KB-PSY-DRAFT-0001` | 接地练习引导语正文 | 想听阿寅念 5-4-3-2-1 步骤 | 已有 `⋯ → Ground exercise`；引导语见 `RESET_GROUND_*` / `RESET_LOOK_*` |
| `KB-PSY-DRAFT-0002` | 呼吸复位引导语正文 | 想听阿寅带呼吸节拍 | 左球 Breath practice；引导语见 `RESET_BREATH_*` / `BREATH_PHASE_*` |
| `KB-PSY-DRAFT-0003` | 压倒感时倾诉转接 | 坐不住且想被听见 | `RESET_OVERWHELMED_CONFIDE_OFFER` 指路到 Confide；非危机热线 |

### 0.1 科普概念类（非引导 · 2026-09-22）

「正念是什么 / 接地练习为什么常被认为有帮助」这类**读完即完整**的概念说明，与急救型引导语不是同一风险档，也**不能**套用寅币/备份那条「locale 盘点」流水线。

- **可做**：通用健康概念、术语辨析；不绑定具体疾病/症状名；不对「你」下行动指令。
- **不做**：任何读完还要跟着做的步骤（呼吸节拍、5-4-3-2-1、闭眼跟做）。菜单里已有入口的，只许指路到 `KB-FUNC-0002` / `0006`，禁止重写 `RESET_*`。
- **审核**：不要求心理咨询资质；产品/内容团队按判定表自检即可。未审核不得 `yin_may_retrieve: 是`。
- **判定口诀**：答案读完，用户要不要接着做动作？要做 → 一律不做。信源再权威也不松这条线。

范围线、信源改写、字段与分批流程见 `task-briefs/task-kb-practice-edu-concepts.md`。首批已通过草稿见 **§4.7**（`KB-EDU-0001`–`0004` · **catalog 已入库** · 闸门 **25 条**）。

---

## 一、产品约束（先于分类体系）

1. **Local AI 不是开放问答。** 仅 Electron 宽屏、用户主动打开「向阿寅倾诉 / Confide to Yin」时，才可能短生成。系统操作（备份、更新、改设置）不经阿寅之口逐步讲解，最多指路到界面。
2. **不做目录式帮助中心。** 知识库不对用户暴露成可浏览 FAQ。
3. **已有独立练习入口的内容不重写第二套脚本。** 只登记「在哪、叫什么、怎么进」。引导语以 locale 现网为准（例：`RESET_GROUND_*` / `RESET_LOOK_*`），不进倾诉检索正文。
4. **心理类字段禁止临床标签。** 「适用场景」只写可观察情境，不写诊断名。
5. **高风险信号不经知识库直出应答。** 走现网安全 / 危机语料路由，知识库条目不是唯一应答来源。
6. **对外文案以 en + ja 为准；** `zh.json` 是草稿槽，短答可附中文按钮名便于内部对照，但不得假装中文已是 v1 产品语言。

---

## 二、三库拆分（不混检索）

| 库名 | 内容范围 | 阿寅能否直接使用 |
|---|---|---|
| **陪伴可检索** | 用户在倾诉里可能问到的入口/术语短答 | 可以，只出已审核短答或指路；不念长脚本 |
| **产品说明事实** | 操作步骤、限制、版本差异 | 默认只指路；不讲课、不诊断 |
| **内部排障** | Known Errors、错误码、上报路径 | **不进倾诉生成** |

每条必须明确归属一个库。不允许一条同时进「陪伴可检索」和「内部排障」。

---

## 三、标准字段结构

| 字段名 | 是否必填 | 说明 |
|---|---|---|
| `id` | 必填 | 唯一编号，如 `KB-FUNC-0001` |
| `所属库` | 必填 | 陪伴可检索 / 产品说明事实 / 内部排障 |
| `一级分类` | 必填 | 产品功能 / 故障排查 / 产品维护 / 心理练习 |
| `二级分类` | 必填 | 操作入口 / 数据管理 / 术语说明 / 会话控制 等 |
| `标题` | 必填 | 短概括 |
| `适用场景` | 必填 | 可观察情境，禁止临床词 |
| `内容正文` | 必填 | 短答或指路；附 locale key 以便改 UI 时同步 |
| `yin_may_retrieve` | 必填 | 是 / 否 |
| `来源` | 必填 | 界面文案 / 设计说明 / AI生成待审 / AI生成已审 / 会话提炼 |
| `审核状态` | 必填 | 未审核 / 审核中 / 已通过 / 已驳回 |
| `审核人` | 心理类必填 | 无固定审核人时急救型一律 `yin_may_retrieve: 否` |
| `风险标记` | 心理类必填 | 否 / 是-需触发谨慎应答策略 |
| `适用产品版本` | 建议填 | |
| `更新时间` | 必填 | |
| `检索关键词` | 建议填 | 口语问法，不是诊断词 |

---

## 四、功能短答条目

### 4.1 第一批（对照现网 · 已通过）

下列正文已按 `en.json` / `zh.json` / `ja.json` 与 `MENU_CHROME_CENSUS.md` 核对按钮名与路径。  
**2026-09-22 PO 人审**：spot-check 0002（⋯ → Practice → Ground exercise）与 0003（⋯ → Preferences → Backup & restore）；其余 3 条沿用同一 locale / 菜单普查对照，规则层已核查。  
阿寅若将来检索命中，只许复述「短答」段，禁止续写步骤或练习引导语。

### 现网入口速查（写条目时对照此表，勿另编路径）

| 意图 | 宽屏 | 窄屏 | 主按钮文案 en / ja / zh-draft |
|---|---|---|---|
| 开始同坐 | Idle 底栏主钮 | 同左 | Sit with Yin / 阿寅と坐る / 与阿寅同坐（`BTN_FOCUS_START`） |
| 结束同坐 | 同坐中主钮 | 同左 | Rise / 立つ / 起身（`BTN_FOCUS_STOP`） |
| 怎么陪 | ⋯ → Practice → How shall we sit? | 抽屉同组 | How Shall We Sit? / 这次怎么陪你？（`COMPANION_MODE_TITLE`）；确认钮 Begin / 开始（`COMPANION_MODE_CONTINUE`） |
| 接地练习 | ⋯ → Practice → Ground exercise（Five Moments **上方**） | 抽屉同位置 | Ground exercise / グラウンディング / 接地练习；两钮 Feel the Ground / Look Around（ja：足元を感じる / 周りを見渡す；zh：感受地面 / 环顾四周） |
| 本地备份 | ⋯ → Preferences → Backup & restore | 抽屉 Preferences 组 | Backup & restore / バックアップと復元 / 备份与恢复（`LOCAL_BACKUP_MENU_LABEL`）。隐私文案写作「设置 → 备份与恢复」 |
| 可选云备份 | ⋯ → Practice → Journey log | 抽屉同组 | Journey log / 旅程留痕；行文 Bind email for optional cloud backup / 绑定邮箱可获得云端备份（`JOURNEY_LOG_BACKUP_LINK_OFF`） |
| 倾诉 | ⋯ → Practice → Confide to Yin；宽屏另有倾听耳 | 抽屉有菜单行，**无**本机生成 | Confide to Yin / 寅に打ち明ける / 向阿寅倾诉。发送 Share / 伝える；关闭 Close / 閉じる / 关闭；取消 Cancel / キャンセル / 取消 |
| 今日进度 | 左上 HUD 条 | 同左 | Today's shared sitting / 今日同坐（`HUD_PROGRESS_SHARED_SITTING`）；默认约 25 分钟软顶，**界面不写「一炷香」** |

专注同坐时长从 **10 分钟**起选（`focus_duration.hint`）。更短的停顿走左球 **Breath practice**，不是主钮 Sit。

```yaml
- id: KB-FUNC-0001
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: 如何开始一次坐
  适用场景: 想坐下来但不知道从哪开始
  内容正文: |
    短答（en）：Tap Sit with Yin on the home seat. Pick how long — Focus sittings start at 10 minutes. If How Shall We Sit? appears, choose a way, then Begin. A shorter pause is Breath practice, not Sit.
    指路：Idle 主钮 `BTN_FOCUS_START` → 时长条 → 可选 `COMPANION_MODE_*` → `COMPANION_MODE_CONTINUE`。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22）
  风险标记: 否
  适用产品版本: 现网产品壳（Idle 主路径）
  更新时间: 2026-09-22
  locale_keys: [BTN_FOCUS_START, COMPANION_MODE_TITLE, COMPANION_MODE_CONTINUE, focus_duration.hint, HINT_QUICK_START]
  检索关键词: [怎么开始, Sit with Yin, 与阿寅同坐, 阿寅と坐る, 从哪坐, Begin]

- id: KB-FUNC-0002
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: 接地练习在哪里
  适用场景: 坐不住、刚被打断、想找一个具体动作把注意力拉回身体或房间
  内容正文: |
    短答（en）：Open More (⋯) or the bottom drawer. In Practice, tap Ground exercise (above Five Moments). Choose Feel the Ground or Look Around. Yin only points here and does not read the steps aloud.
    禁止：把 `RESET_GROUND_*` / `RESET_LOOK_*` 引导语写入本条或倾诉检索块。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22 · spot-check）
  风险标记: 否
  适用产品版本: 接地练习独立菜单已合入后的产品壳
  更新时间: 2026-09-22
  locale_keys: [GROUND_EXERCISE_MENU_LABEL, GROUND_EXERCISE_FEEL_LABEL, GROUND_EXERCISE_LOOK_LABEL, GROUND_EXERCISE_CLOSE]
  检索关键词: [接地练习, Ground exercise, グラウンディング, 感受地面, Feel the Ground, 环顾四周, Look Around, 5-4-3-2-1]

- id: KB-FUNC-0003
  所属库: 产品说明事实
  一级分类: 产品功能
  二级分类: 数据管理
  标题: 备份从哪里进
  适用场景: 想保存或换设备带走自己的记录
  内容正文: |
    短答（en）：For a file on this device: More (⋯) or the drawer → Backup & restore (Preferences). For optional cloud snapshot of the practice trail: Journey log → bind email. Yin only points; Yin does not back up for you.
    说明：本地导出是明文 JSON、未加密（`LOCAL_BACKUP_PANEL_BLURB` / 隐私「本地导出」节）。云备份是可选、同意后静默快照，打坐中不发送（`JOURNEY_LOG_BACKUP_PRIVACY`）。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22 · spot-check）
  风险标记: 否
  适用产品版本: 现网（本地备份菜单 + Journey 可选云备份）
  更新时间: 2026-09-22
  locale_keys: [LOCAL_BACKUP_MENU_LABEL, LOCAL_BACKUP_PANEL_BLURB, JOURNEY_LOG_MENU_LABEL, JOURNEY_LOG_BACKUP_LINK_OFF, PRIVACY_SHEET_EXPORT_IMPORT]
  检索关键词: [备份, Backup & restore, 备份与恢复, 导出, 旅程留痕, Journey log, 换设备]

- id: KB-FUNC-0004
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 术语说明
  标题: 「一炷香」和今日同坐
  适用场景: 看到「一炷香」或左上进度条，不确定它指什么
  内容正文: |
    短答（en）：The bar at the top left is Today's shared sitting — how long you have sat today, with a quiet ~25 minute soft aim. The product does not label that bar「一炷香」. 「一炷香」is an internal / design name for that light daily sit; the old end-of-sit incense animation is not on the live completion path.
    勿把实验室钮「一炷香完成」写成用户主路径。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22）
  风险标记: 否
  适用产品版本: 现网 HUD；IncenseComplete 会话结束自动播仍为已放弃
  更新时间: 2026-09-22
  locale_keys: [HUD_PROGRESS_SHARED_SITTING, HINT_FOCUS_HUD_PROGRESS]
  检索关键词: [一炷香, 今日同坐, Today's shared sitting, 25 minutes, 香, progress bar, hud, top left, 进度条, soft aim, today's sitting]

- id: KB-FUNC-0005
  所属库: 产品说明事实
  一级分类: 产品功能
  二级分类: 会话控制
  标题: 怎么结束当前的倾诉
  适用场景: 说到一半想停下来，不确定怎么退出
  内容正文: |
    短答（en）：Tap Close on the Confide card, or Cancel if you have not sent. Esc closes the top overlay first. There is no voice command to exit. Yin does not judge why you stop. While you Sit, the local model unloads so sitting can stay smooth.
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22）
  风险标记: 否
  适用产品版本: 现网倾诉叠层（桌面宽屏另有本机模型卸载）
  更新时间: 2026-09-22
  locale_keys: [CONFIDE_PANEL_CLOSE, CONFIDE_PANEL_CANCEL, CONFIDE_PANEL_SEND, CONFIDE_DESKTOP_STATUS_UNLOADED_FOCUSING]
  检索关键词: [结束倾诉, Close, 关闭, キャンセル, Cancel, 退出, Esc]
```

### 4.2 盘点第二批（对照现网 · PO 书面放行）

来源：**只搬运 / 裁剪 / 打标**——#923 已占 `KB-FUNC-0006`（左球呼吸）；本批原 0006–0016 **顺延为 0007–0017**。`0009` 云备份专述因功能暂时禁用保持 **未审核**；其余 10 条与第一批合计 **15 条** `审核状态: 已通过`（可进检索闸门）。

| 优先级 | id | 标题 | 盘点依据 | 审核 |
|---|---|---|---|---|
| P0 | 0006 | 呼吸练习从哪进（左球） | 速查表左球行 · `micro_ritual.*` | **已通过** · 盘点参考 · 检索走 0011+0001 · 不进 catalog |
| P0 | 0007 | 如何结束同坐（Rise） | 速查表 `BTN_FOCUS_STOP` | 已通过 |
| P0 | 0008 | How shall we sit 在哪 | 速查表 `COMPANION_MODE_*` | 已通过 |
| P0 | 0009 | Journey log 可选云备份 | `JOURNEY_LOG_BACKUP_*` | **未审核（云备份暂禁用）** |
| P0 | 0010 | 倾诉从哪里开 | 速查表 Confide 行 | 已通过 |
| P0 | 0011 | Breath practice 和 Sit 的区别 | 速查表 + `focus_duration.hint` | 已通过 |
| P1 | 0012 | 练习记录从哪看（Journey log） | CI-00 答数据；UI 指路 | 已通过 |
| P1 | 0013 | Presence moments 从哪看 | CI-02 答趋势 | 已通过 |
| P1 | 0014 | What Yin remembers 从哪看 | CI-03 答列表 | 已通过 |
| P1 | 0015 | 本地备份是明文 JSON | `PRIVACY_SHEET_EXPORT_IMPORT` | 已通过 |
| P1 | 0016 | 同坐时本机模型会卸载 | `CONFIDE_DESKTOP_STATUS_UNLOADED_FOCUSING` | 已通过 |
| P1 | 0017 | 浏览器里没有本机倾诉生成 | `LOCAL_AI_WEB_MOUNT_PO_DECISION` | 已通过 |

```yaml
- id: KB-FUNC-0006
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: 呼吸练习从哪进（左球）
  适用场景: 想短暂陪阿寅坐一会儿，不确定该点左球还是底栏 Sit
  内容正文: |
    短答（en）：On the home seat, tap the left orb — Breath practice. Pick how long (chips from 1 minute up). It is a soft sit with Yin, not a full Focus session. Yin only points here and does not read the in-breath / out-breath coaching lines aloud.
    指路：Idle 左球 `#ft-wide-home-quickstart` / `#ft-narrow-home-quickstart`（`QUICK_START_ARIA`）→ 时长 chip `micro_ritual.pick_duration` → 点选即开。Leave（`micro_ritual.leave`）结束、不记账、不进 Reflection、不写 Journey log；完成且关 Reflection 才入账（见 `MICRO_RITUAL_PLAN.md`）。**不在** ⋯ / 抽屉；Companion 三选一展开时宽屏左球隐藏（`ft-wide-stage-companion`）。
    与 0001 分工：0001 = 主钮 Sit 完整同坐（10 分钟起）；本条 = 左球短坐入口。
    **检索口径（2026-09-22）**：避免与 0001 / 0011 三处呼吸入口打架 — registry 已链 **0011**；可检索问法走 0011（Breath vs Sit）+ 0001（主路径起步）。本条正文仅作盘点参考（Leave / 不记账等细节），**不进** `productKnowledgeCatalog.json`。
    禁止：把 `RESET_BREATH_*` / `BREATH_PHASE_*` 引导语写入本条或倾诉检索块（与 `KB-PSY-DRAFT-0002` 分工）。
  yin_may_retrieve: 否
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-23 · spot-check · Leave/入账分工与正文一致）
  风险标记: 否
  适用产品版本: 现网 Idle 左球主路径（Extended Breath Practice · 1/3/5/10/20 分钟）
  更新时间: 2026-09-23
  locale_keys: [QUICK_START_ARIA, HINT_QUICK_START, HINT_MICRO_RITUAL, micro_ritual.button, micro_ritual.pick_duration, micro_ritual.minutes_chip, micro_ritual.leave, focus_duration.hint]
  检索关键词: [呼吸练习, Breath practice, 左球, quick start, 短坐, 一分钟, 从哪进, 怎么呼吸, 和 Sit 区别]

- id: KB-FUNC-0007
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: 如何结束同坐（Rise）
  适用场景: 正在同坐，想先起身或结束这一场
  内容正文: |
    短答（en）：While you are sitting, the main button at the bottom says Rise. Tap it to end this sit. You can start again anytime with Sit with Yin.
    指路：同坐中主钮 `BTN_FOCUS_STOP`（Rise）→ 结束本场；非倾诉 Close、非 Esc 关叠层。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22 · PO 书面放行；常测路径）
  风险标记: 否
  适用产品版本: 现网 Idle 主路径
  更新时间: 2026-09-22
  locale_keys: [BTN_FOCUS_STOP, BTN_FOCUS_START]
  检索关键词: [结束同坐, Rise, 起身, 立つ, 怎么起来, stop sitting]

- id: KB-FUNC-0008
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: How shall we sit 在哪
  适用场景: 开始同坐前想选「这次怎么陪」，或不知道三张模式卡是什么
  内容正文: |
    短答（en）：After you tap Sit with Yin, How Shall We Sit? may appear. Open More (⋯) or the drawer → Practice → How Shall We Sit? if you need it again. Pick Here & Now, Offline Space, or Flow State, then tap Begin.
    禁止：把三张卡的 hint 全文写进短答；只指路 + 卡名。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22 · PO 书面放行；常测路径）
  风险标记: 否
  适用产品版本: 现网 Companion 模式卡
  更新时间: 2026-09-22
  locale_keys: [COMPANION_MODE_TITLE, COMPANION_MODE_STAY, COMPANION_MODE_STEP_AWAY, COMPANION_MODE_ACROSS_TOOLS, COMPANION_MODE_CONTINUE, HINT_COMPANION_MODE]
  检索关键词: [怎么陪, How shall we sit, 这次怎么陪你, 陪伴模式, Begin, Offline Space, Flow State, Here and Now, 三种陪法, companion mode where]

- id: KB-FUNC-0009
  所属库: 产品说明事实
  一级分类: 产品功能
  二级分类: 数据管理
  标题: Journey log 可选云备份
  适用场景: 想给练习轨迹留一份可选云端快照，或分不清和本地 JSON 导出的区别（**2026-09-22：云备份功能暂时禁用，本条保持未审核、不进检索索引**）
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → Practice → Journey log. Bind email for optional cloud backup if you want a quiet snapshot of your practice trail on Focus Tiger's cloud. It does not run while you sit. Turning backup off deletes the cloud copy; local records stay on this device.
    与 0003 分工：0003 = 两个入口总览；本条 = Journey 云备份专述。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 未审核
  审核人: —
  风险标记: 否
  适用产品版本: 现网 Journey log + 可选云备份
  更新时间: 2026-09-22
  locale_keys: [JOURNEY_LOG_MENU_LABEL, JOURNEY_LOG_BACKUP_LINK_OFF, JOURNEY_LOG_BACKUP_PRIVACY, JOURNEY_LOG_BACKUP_STATUS_DISABLED]
  检索关键词: [云备份, cloud backup, Journey log, 绑定邮箱, 旅程留痕, 练习轨迹备份]

- id: KB-FUNC-0010
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: 倾诉从哪里开
  适用场景: 想跟阿寅说几句，不知道入口在哪
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → Practice → Confide to Yin. On a wide desktop screen there is also a listening ear shortcut. Type a few words and tap Share. Nothing leaves this device on desktop; in a browser, on-device generation is not available — Yin still listens with short, quiet lines where the product allows.
    窄屏：菜单有 Confide 行，无本机模型生成（见 0017）。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22 · PO 书面放行；常测路径）
  风险标记: 否
  适用产品版本: 现网 Confide 叠层
  更新时间: 2026-09-22
  locale_keys: [CONFIDE_MENU_LABEL, CONFIDE_EAR_TOOLTIP, CONFIDE_PANEL_TITLE, CONFIDE_PANEL_BLURB, CONFIDE_PANEL_SEND]
  检索关键词: [倾诉, Confide, 向阿寅倾诉, 寅に打ち明ける, 从哪里说, Share, 耳朵]

- id: KB-FUNC-0011
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 术语说明
  标题: Breath practice 和 Sit 的区别
  适用场景: 只想歇几分钟，不确定该点主钮 Sit 还是左边小球
  内容正文: |
    短答（en）：Sit with Yin is for a Focus sit — durations start at 10 minutes. For a shorter pause, use Breath practice on the left orb: a soft sit with Yin, not a full Focus session.
    禁止：念 `RESET_BREATH_*` / `BREATH_PHASE_*` 引导语正文。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22 · PO 书面放行；常测路径）
  风险标记: 否
  适用产品版本: 现网底栏 / 左球
  更新时间: 2026-09-22
  locale_keys: [focus_duration.hint, HINT_QUICK_START, BTN_FOCUS_START]
  检索关键词: [呼吸练习, Breath practice, 短坐, 10分钟, quick start, 左球, 和 Sit 区别, 怎么呼吸, 从哪进, 左球在哪, where is breath practice, how to breathe]

- id: KB-FUNC-0012
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: 练习记录从哪看（Journey log）
  适用场景: 想自己翻练习日历 / 场次，而不是只在倾诉里问「练了多久」
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → Practice → Journey log to see your practice trail on this device. In Confide you can also ask how long you have practiced — Yin reads what is written down here, not a second ledger.
    与 CI-00 分工：CI-00 = 口头读数据；本条 = UI 指路。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22 · PO 书面放行；常测路径）
  风险标记: 否
  适用产品版本: 现网 Journey log
  更新时间: 2026-09-22
  locale_keys: [JOURNEY_LOG_MENU_LABEL, CONFIDE_CHIP_FILL_PRACTICE_DURATION]
  检索关键词: [练习记录, Journey log, 旅程留痕, 练了多久从哪看, practice trail, 日历, journey log 在哪, 查看练习, practice calendar]

- id: KB-FUNC-0013
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: Presence moments 从哪看
  适用场景: 想翻自己在 Arrival / Reflection 留下的小记号，或对照倾诉里问到的情绪趋势
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → Practice → Presence moments. These are small check-ins saved on this device. In Confide you can ask what your mood has looked like recently — Yin summarizes what is written here, not a diagnosis.
    与 CI-02 分工：CI-02 = 口头读趋势；本条 = UI 指路。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22 · PO 书面放行；常测路径）
  风险标记: 否
  适用产品版本: 现网 Presence moments 面板
  更新时间: 2026-09-22
  locale_keys: [PRESENCE_SIGNALS_MENU_LABEL, PRESENCE_SIGNALS_PANEL_BLURB, PRESENCE_SIGNALS_DISCLOSURE, CONFIDE_CHIP_FILL_PRESENCE_RECENT]
  检索关键词: [Presence moments, 情绪记录, 签到, 从哪看情绪, mood check-in, 趋势从哪看, presence signals, 情绪面板, mood record where]

- id: KB-FUNC-0014
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: What Yin remembers 从哪看
  适用场景: 想逐条查看或删掉阿寅记住的观察，而不只是在倾诉里口头问「你还记得什么」
  内容正文: |
    短答（en）：Open Confide to Yin, then tap What Yin remembers inside the card. You can forget any row there. Saying「Show me what you remember」in Confide lists a short summary — the full list is in that panel.
    与 CI-03 分工：CI-03 = 口头列摘要；本条 = UI 指路 + Forget 入口。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22 · PO 书面放行；常测路径）
  风险标记: 否
  适用产品版本: 现网 Yin Personal Memory 1c 面板
  更新时间: 2026-09-22
  locale_keys: [YIN_MEMORY_PANEL_LINK, YIN_MEMORY_PANEL_TITLE, YIN_MEMORY_PANEL_BLURB, YIN_MEMORY_FORGET, CONFIDE_MEMORY_LIST_HEADER, CONFIDE_MEMORY_LIST_MORE]
  检索关键词: [阿寅记得什么, What Yin remembers, 记忆列表, 忘掉, Forget, Show me what you remember]

- id: KB-FUNC-0015
  所属库: 产品说明事实
  一级分类: 产品功能
  二级分类: 数据管理
  标题: 本地备份文件是明文 JSON
  适用场景: 担心导出文件是否加密，或能否直接打开看内容
  内容正文: |
    短答（en）：Backup & restore exports a plain JSON file on this device — not encrypted. You can move it yourself; treat it like private data. Scope includes practice records, presence check-ins, reflections, Yin memory, and preferences — not ambient music uploads.
    与 0003 分工：0003 = 入口指路；本条 = 格式与范围事实。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22 · PO 书面放行；常测路径）
  风险标记: 否
  适用产品版本: 现网本地备份面板
  更新时间: 2026-09-22
  locale_keys: [LOCAL_BACKUP_PANEL_BLURB, PRIVACY_SHEET_EXPORT_IMPORT]
  检索关键词: [明文, plain JSON, 加密, 备份格式, 导出文件, unencrypted, 装了什么, 里面有什么, 包不包含, 包含哪些, 哪些数据, what's in the backup, what does backup include]

- id: KB-FUNC-0016
  所属库: 产品说明事实
  一级分类: 产品功能
  二级分类: 会话控制
  标题: 同坐时本机模型会卸载
  适用场景: 同坐中打不开倾诉、或看到「模型正在释放」类状态
  内容正文: |
    短答（en）：On desktop, the local companion model unloads while you Sit so focusing can stay smooth. Finish or Rise first, then open Confide again if you need to talk.
    与 0005 分工：0005 = 怎么关倾诉叠层；本条 = 同坐期间的资源策略。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22 · PO 书面放行；常测路径）
  风险标记: 否
  适用产品版本: Electron 宽屏本机模型
  更新时间: 2026-09-22
  locale_keys: [CONFIDE_DESKTOP_STATUS_UNLOADED_FOCUSING, CONFIDE_DESKTOP_STATUS_UNLOADING]
  检索关键词: [同坐不能倾诉, 模型卸载, unloads while you sit, 坐着不能聊, 释放模型]

- id: KB-FUNC-0017
  所属库: 产品说明事实
  一级分类: 产品功能
  二级分类: 术语说明
  标题: 浏览器里没有本机倾诉生成
  适用场景: 在手机浏览器或网页版里期待阿寅本地短生成，或看到「此设备不可用」
  内容正文: |
    短答（en）：On-device Local AI runs in the Focus Tiger desktop app on Mac or Windows — not in this browser. You can still practice and open Confide where the product allows; short quiet lines may appear, but browser-side model download and generation are not shipped.
    PO 决策：`LOCAL_AI_WEB_MOUNT_PO_DECISION.md`（暂不立项）。
  yin_may_retrieve: 是
  来源: 设计说明
  审核状态: 已通过
  审核人: PO（2026-09-22 · PO 书面放行；常测路径）
  风险标记: 否
  适用产品版本: Web 产品壳 vs Electron
  更新时间: 2026-09-22
  locale_keys: [SUPPORT_WEB_LOCAL_AI_NOTE, RESET_OVERWHELMED_CONFIDE_UNAVAILABLE, CONFIDE_PANEL_BLURB]
  检索关键词: [网页不能聊, 浏览器没有本地 AI, Web Confide, 手机浏览器, desktop app, Safari]

- id: KB-FUNC-0018
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 经济说明
  标题: 寅币 / Focus Coins 怎么获得
  适用场景: 问怎么攒寅币、focus coins 从哪来，而不是问珍藏目录价格
  内容正文: |
    短答（en）：Sit or breathe with Yin to earn more focus coins — longer, more consistent practice earns more. There is a quiet daily pause so you need not binge. Look under Yin's Collections.
    中文对照：静坐或呼吸练习都能获得寅币，练得越久越规律，得到的越多。有温和的每日停顿，不必赶着刷。入口在阿寅的珍藏。
    口径：PO 2026-09-22 批准粗粒度获取方式；**禁止**在短答里念日封顶数字或催促加练（不制造焦虑）。账本细则仍只在 `FOCUS_COINS.md`。
  yin_may_retrieve: 是
  来源: 产品设计 + PO 口径
  审核状态: 已通过
  审核人: PO（2026-09-22 · 获取口径书面批准）
  风险标记: 否
  适用产品版本: 现网寅币 / Yin's Collections
  更新时间: 2026-09-22
  locale_keys: [focus_coins.duration_hint]
  检索关键词: [寅币, Focus Coins, focus coins, 怎么获得寅币, earn coins, 攒币, 怎么攒]
```

### 4.4 batch-2 Step 4（Five Moments / Honesty · 已通过 · catalog 已入库）

> **Status**: Step 4 权威源起草 · **PO 2026-09-22 书面放行**（无需 §4.4 语气 spot-check）· **已进** `productKnowledgeCatalog.json` · registry `catalogKbIds` 已链 **0019** / **0020**。  
> **Inspiration 三卡**：Daily quote → Zen Cinema → Wallpapers 均已入库 catalog（闸门 **25 条** · 含 EDU batch1）。**0019/0020**（#939）· **0021**（#940）· **0022/0023**（本旁支）。

```yaml
- id: KB-FUNC-0019
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: Five Moments 罗盘从哪开
  适用场景: 想知道一天五个时刻是什么、从哪进 Arrive / Focus / Recover / Transition / Reflect
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → Practice → The 5 Moments. On a wide screen you can also tap the right orb — Five moments with Yin. The compass shows Arrive → Focus → Recover → Transition → Reflect. Tap a moment to jump to that surface — for example Reflect opens Journey log. Yin only points; this is not a second timer.
    指路：菜单 `FIVE_MOMENTS_MENU_LABEL` → `#five-moments-compass`；宽屏 Idle 右球 `FIVE_MOMENTS_IDLE_ENTRY`。芯片映射见 `resolveFiveMomentAction`（Arrive→Arrival · Focus→Companion · Recover→ritual-emotional-reset · Transition→C5 overlay · Reflect→Journey log）。
    禁止：把 Five Moments 说成强制打卡；禁止念 `RESET_BREATH_*` / 引导语正文。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22 · 书面放行）
  风险标记: 否
  适用产品版本: 现网 Five Moments Compass（B 轨）
  更新时间: 2026-09-22
  locale_keys: [FIVE_MOMENTS_MENU_LABEL, FIVE_MOMENTS_IDLE_ENTRY, FIVE_MOMENTS_CARD_TITLE, FIVE_MOMENTS_CARD_BLURB, FIVE_MOMENTS_ARRIVE, FIVE_MOMENTS_FOCUS, FIVE_MOMENTS_RECOVER, FIVE_MOMENTS_TRANSITION, FIVE_MOMENTS_REFLECT]
  检索关键词: [Five Moments, 五个时刻, 五时刻, The 5 Moments, Arrive Focus Recover, 一天五个, five moments with yin, 罗盘, compass]

- id: KB-FUNC-0020
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: Honesty Check-in 从哪进
  适用场景: 想把别处的静心时间诚实补登回来，或分不清和左球 Breath practice / 主钮 Sit 的区别
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → Practice → Honesty Check-in — below The 5 Moments. Pick how long your quiet time elsewhere was, take one syncing breath, then Yin records it. This is optional; Sit with Yin still works without it. After check-in you may see a gentle bridge asking if you want to sit now too.
    指路：菜单 `HONESTY_IDLE_ENTRY`（`#honesty-idle-entry` 宽屏 Idle 入口仍存在）。与 0011 分工：0011 = 左球短坐 Breath practice；本条 = 荣誉制补登别处的静心。与 Arrival 分工：Honesty 补登 ≠ 点 Sit 后的 Arrival Practice。
    禁止：怀疑性文案；禁止把 Honesty 说成必须打卡；禁止念 `HONESTY_BREATH_*` 引导语正文。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-22 · 书面放行）
  风险标记: 否
  适用产品版本: 现网 Honesty Check-in + 桥接 CTA
  更新时间: 2026-09-22
  locale_keys: [HONESTY_IDLE_ENTRY, HONESTY_FEATURE_TITLE, HONESTY_DURATION_TITLE, HONESTY_DURATION_SUBTITLE, HONESTY_CHECKIN_PROMPT, HONESTY_CHECKIN_RECORDED, HONESTY_BRIDGE_PROMPT, HINT_HONESTY_OPTIONAL]
  检索关键词: [Honesty Check-in, 诚实补登, 别处的静心, 荣誉制, 补登练习, honest check-in, quiet time elsewhere, 补登从哪进]

- id: KB-FUNC-0021
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: A Quiet Line（今日静语）从哪开
  适用场景: 想找每日一句静语、保存静语图片，或分不清和 Zen Cinema / Wallpapers 的区别
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → Inspiration → A Quiet Line. One quiet line is chosen locally for today and stays the same until tomorrow. Tap Save image to keep a postcard on your device — no account needed. Yin only points; open the card to read today's words.
    指路：菜单 `DAILY_ZEN_QUOTE_MENU_LABEL`（proxy `daily-quote`）→ `DailyZenQuoteCardUI`。同日锁定见 `dailyZenQuote.js`（`DAILY_ZEN_QUOTE_POOL_V2_STORAGE_KEY` · 本地 YYYY-MM-DD 确定性抽取）。与 0012 分工：若当日句为 insight-spark 种子且用户当场打开过卡，Journey log 可能带 `insightSpark` 标记 — 本条只指路开卡，不念句库正文。与 Zen Cinema / Wallpapers 分工：本条 = 静语礼物卡 + 本地存图；不播外链视频、不下载壁纸包。
    禁止：把静语说成必须每日打卡；禁止在短答里念 `DAILY_ZEN_QUOTE_*` / `DAILY_ZEN_QUOTE_INSIGHT_*` 句库正文；禁止说成社交分享或需登录。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-23 · tone spot-check）
  风险标记: 否
  适用产品版本: 现网 Daily quiet-line card（growth ③）
  更新时间: 2026-09-23
  locale_keys: [DAILY_ZEN_QUOTE_MENU_LABEL, DAILY_ZEN_QUOTE_CARD_TITLE, DAILY_ZEN_QUOTE_CARD_BLURB, DAILY_ZEN_QUOTE_SAVE_NOTE, DAILY_ZEN_QUOTE_CANCEL, DAILY_ZEN_QUOTE_SAVE]
  检索关键词: [A Quiet Line, Daily quote, 一句静语, 今日静语, quiet line for today, 每日一句, daily quote menu, save image quote, 静语从哪开, quiet line card]
```

> **权威源（0019–0021）**：`src/locales/en.json` · `fiveMomentsCompassGate.js` · `PRODUCT_MOMENTS.md` · `dailyZenQuote.js` · `DailyZenQuoteCardUI.js` · `kbLiveEntryRegistry.js` · `MENU_CHROME_CENSUS.md` · `SCENARIO_TESTS.md` 场景 U2

### 4.5 batch-2 Step 4（Zen Cinema · 已通过 · catalog 已入库）

> **Status**: **PO spot-check 已通过** · **已进** `productKnowledgeCatalog.json` · registry `kb-live-zen-cinema` 链 `KB-FUNC-0022` · 闸门 **20 条**（与 0023 合入后 **21 条**）。

```yaml
- id: KB-FUNC-0022
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: Zen Cinema 从哪开
  适用场景: 想找短片冥想视频、或分不清和 A Quiet Line / Wallpapers 的区别
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → Inspiration → Zen Cinema. Yin offers one short visual meditation — tap Watch on YouTube to open a featured film in your browser (not inside the app). Yin only points; this is a small gift when you have a quiet minute.
    指路：菜单 `ZEN_CINEMA_MENU_LABEL`（proxy `zen-cinema`）→ `ZenCinemaCardUI` → `openZenCinemaExternal`（`zenCinemaConfig.js` · 单支精选 YouTube 外链 · 无应用内播放器）。与 0021 分工：0021 = 本地每日静语卡 + Save image；本条 = 浏览器打开一支短片。与 Wallpapers 分工：本条 = 外链视频；Wallpapers = 阿寅静帧本地存图。
    禁止：说成频道墙或需登录；禁止在短答里念 `ZEN_CINEMA_FILM_TITLE` 片名正文；禁止说成必须每日打卡；禁止与 Daily quote / Wallpapers 混为一谈。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO
  风险标记: 否
  适用产品版本: 现网 Zen Cinema gift card（growth ①）
  更新时间: 2026-09-25
  locale_keys: [ZEN_CINEMA_MENU_LABEL, ZEN_CINEMA_CARD_TITLE, ZEN_CINEMA_CARD_BLURB, ZEN_CINEMA_OPENS_YOUTUBE, ZEN_CINEMA_CANCEL, ZEN_CINEMA_WATCH]
  检索关键词: [Zen Cinema, 禅意影院, mindful moments with yin, watch on youtube, 短片冥想, zen cinema menu, 影院从哪开, youtube meditation, visual meditation]
```

> **权威源（0022）**：`src/locales/en.json` · `zenCinemaConfig.js` · `ZenCinemaCardUI.js` · `kbLiveEntryRegistry.js` · `MENU_CHROME_CENSUS.md` · `SCENARIO_TESTS.md` 场景 U1

### 4.6 batch-2 Step 4（Wallpapers · 已通过 · catalog 已入库）

> **Status**: **PO spot-check 已通过** · **已进** `productKnowledgeCatalog.json` · registry `kb-live-wallpapers` 链 `KB-FUNC-0023` · 闸门 **21 条**。

```yaml
- id: KB-FUNC-0023
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: Wallpapers（阿寅静帧）从哪开
  适用场景: 想找阿寅静帧壁纸、保存到锁屏或桌面，或分不清和 A Quiet Line / Zen Cinema 的区别
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → Inspiration → Wallpapers. Yin offers a few quiet still frames from her day — pick one and tap Save image to keep it on your device (lock screen or desktop). No account, tip, or Pass needed. Yin only points; this is a free gift.
    指路：菜单 `WALLPAPER_MENU_LABEL`（proxy `wallpapers`）→ `DigitalWallpapersCardUI` → `digitalWallpapersCatalog.js`（5 张静帧 · 免费）→ `saveDigitalWallpaperImage` 下载 `focus-tiger-wallpaper-*.png`。与 0021 分工：0021 = 当日静语明信片（上图下字）；本条 = 纯静帧、无金句。与 0022 分工：本条 = 本地存图；0022 = 浏览器打开 YouTube 短片。
    禁止：说成付费门或需登录；禁止在短答里念 `WALLPAPER_STILL_*` 静帧标题正文；禁止把 Save image 说成一键社交分享核心卖点；禁止与 Daily quote / Zen Cinema 混为一谈。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO
  风险标记: 否
  适用产品版本: 现网 Digital wallpapers gift card（growth ②）
  更新时间: 2026-09-25
  locale_keys: [WALLPAPER_MENU_LABEL, WALLPAPER_CARD_TITLE, WALLPAPER_CARD_BLURB, WALLPAPER_SAVE_NOTE, WALLPAPER_CANCEL, WALLPAPER_SAVE]
  检索关键词: [Wallpapers, 壁纸, 阿寅静帧, yin stills, save wallpaper, lock screen, 静帧从哪开, digital wallpaper, free wallpaper, save image wallpaper]
```

> **权威源（0023）**：`src/locales/en.json` · `digitalWallpapersCatalog.js` · `saveDigitalWallpaper.js` · `DigitalWallpapersCardUI.js` · `kbLiveEntryRegistry.js` · `MENU_CHROME_CENSUS.md` · `SCENARIO_TESTS.md` 场景 U3

### 4.7 科普概念首批（KB-EDU · PO spot-check 已通过 · catalog 已入库）

> **Status**: Brief #936 PO 已点头 · 候选清单 PO 已筛选（①③ 不合并 · ④ 仅 Sit/Breath/Ground 三角 · 不含 Five Moments / Confide）· **4 条已通过**（2026-09-26 PO spot-check §4.7）· **已进** `productKnowledgeCatalog.json` · `yin_may_retrieve: 是` · 闸门 **23 条** · **不改** Confide 路由 / generate。  
> **起草顺序**：② 接地 → ① 正念 → ③ 专注 vs 冥想 → ④ 概念→入口对照。

```yaml
- id: KB-EDU-0001
  所属库: 陪伴可检索
  一级分类: 心理练习
  二级分类: 科普概念
  内容类型: 科普概念
  标题: 接地练习是什么、为什么常被认为有帮助
  适用场景: 想知道「接地 / grounding」这个说法指什么（不是正在求被带着做）
  内容正文: |
    短答（en）：Grounding is a simple name for noticing what you can see, hear, or feel in the present moment, so attention can rest with the body and the room instead of racing ahead in thought. Many people find that kind of present-moment noticing helpful for everyday calm and focus. It is a general wellness idea, not a medical treatment. Reading this is enough; you do not need to follow any steps here. If you want the in-app exercise, Yin only points to Ground exercise and does not read the steps aloud.
    指路：复用 KB-FUNC-0002（⋯ → Practice → Ground exercise）。禁止写入 RESET_GROUND_* / RESET_LOOK_*。
  禁止事项核查:
    具体步骤指令: 否
    治疗类表述: 否
    具体数字: 否
    具体疾病或症状名称: 否
    针对你的行动指令: 否
    照搬信源: 否
  信源类型: 公共卫生机构科普材料
  来源: AI生成已审
  审核状态: 已通过
  审核人: PO（2026-09-26 · spot-check §4.7）
  审核人角色: 产品/内容团队
  风险标记: 否
  yin_may_retrieve: 是
  适用产品版本: 接地练习独立菜单已合入后的产品壳
  更新时间: 2026-09-26
  检索关键词: [接地是什么, what is grounding, 接地练习原理, grounding 是什么意思, grounding meaning]

- id: KB-EDU-0002
  所属库: 陪伴可检索
  一级分类: 心理练习
  二级分类: 科普概念
  内容类型: 科普概念
  标题: 正念是什么
  适用场景: 想知道「正念 / mindfulness」这个说法指什么（纯概念，不是正在求练习步骤或产品入口）
  内容正文: |
    短答（en）：Mindfulness is a general wellness word for noticing what is happening right now — thoughts, feelings, and body sensations — with a bit of openness instead of fighting or judging every moment. Many people find that kind of gentle awareness helpful for everyday stress and focus. It is not a medical treatment. Reading this is enough; you do not need to follow any steps here.
    分工：「正念和冥想一样吗 / 专注和冥想差在哪」→ KB-EDU-0003；「在本产品里从哪练」→ KB-EDU-0004 或已有 KB-FUNC-* 指路条。
  禁止事项核查:
    具体步骤指令: 否
    治疗类表述: 否
    具体数字: 否
    具体疾病或症状名称: 否
    针对你的行动指令: 否
    照搬信源: 否
  信源类型: 公共卫生机构科普材料
  来源: AI生成已审
  审核状态: 已通过
  审核人: PO（2026-09-26 · spot-check §4.7）
  审核人角色: 产品/内容团队
  风险标记: 否
  yin_may_retrieve: 是
  适用产品版本: 现网产品壳
  更新时间: 2026-09-26
  检索关键词: [正念是什么, what is mindfulness, 正念定义, mindfulness meaning, 什么是正念]

- id: KB-EDU-0003
  所属库: 陪伴可检索
  一级分类: 心理练习
  二级分类: 科普概念
  内容类型: 科普概念
  标题: Focus sit 和 meditation 在说法上差在哪
  适用场景: 分不清 focus / meditation / 正念 在公众说法里各指什么，或问「我这是在冥想吗」（不是正在求被带着做）
  内容正文: |
    短答（en）：In everyday language, meditation is a broad umbrella for many quiet practices. Focus practice usually means keeping attention on one chosen object for a while. Mindfulness often names open, non-judging awareness of the present moment. The words overlap, but they are not identical. In Focus Tiger the main path is called Sit with Yin — a Focus sit with Yin, not a generic meditation class. Shorter pauses use Breath practice on the left orb; see KB-FUNC-0011 for how that differs from Sit. Yin explains the words only; Yin does not coach breathing or guide steps here. Reading this is enough; nothing here to follow along with.
    分工：纯「正念是什么」→ KB-EDU-0002；菜单路径 → KB-FUNC-0001 / 0011 / KB-EDU-0004。
  禁止事项核查:
    具体步骤指令: 否
    治疗类表述: 否
    具体数字: 否
    具体疾病或症状名称: 否
    针对你的行动指令: 否
    照搬信源: 否
  信源类型: 同行综述转述 + 产品定位用语（PRODUCT_POSITIONING.md）
  来源: AI生成已审
  审核状态: 已通过
  审核人: PO（2026-09-26 · spot-check §4.7）
  审核人角色: 产品/内容团队
  风险标记: 否
  yin_may_retrieve: 是
  适用产品版本: 现网产品壳（Sit 10 分钟起 · 左球 Breath practice）
  更新时间: 2026-09-26
  检索关键词: [专注和冥想有什么区别, focus vs meditation, 正念和冥想一样吗, 我这是在冥想吗, Focus sit and meditation, meditation vs focus sit, 专注和冥想, 正念和专注是一回事吗]

- id: KB-EDU-0004
  所属库: 陪伴可检索
  一级分类: 心理练习
  二级分类: 科普概念
  内容类型: 科普概念
  标题: 正念 / 接地 / 专注在本产品里各对应什么入口
  适用场景: 已听懂概念，想知道 Focus Tiger 里哪一类练习对应哪条现网入口（不是正在求步骤或引导语）
  内容正文: |
    短答（en）：This is a concept-to-entry map only — Yin repeats the approved FUNC short answers for paths, never reads exercise scripts aloud. Focus / sitting with Yin → main button Sit with Yin (KB-FUNC-0001). A shorter breath pause → left orb Breath practice (KB-FUNC-0011; inventory detail KB-FUNC-0006). Grounding as a practice → Ground exercise (KB-FUNC-0002). Reading this map is enough; for exact taps Yin points to those entries, not a second menu manual.
    范围：首批仅 Sit / Breath / Ground 三角；不含 Five Moments、Confide、Inspiration 礼物卡。
  禁止事项核查:
    具体步骤指令: 否
    治疗类表述: 否
    具体数字: 否
    具体疾病或症状名称: 否
    针对你的行动指令: 否
    照搬信源: 否
  信源类型: 界面文案 / 已有 KB-FUNC-* 指路条
  来源: AI生成已审
  审核状态: 已通过
  审核人: PO（2026-09-26 · spot-check §4.7）
  审核人角色: 产品/内容团队
  风险标记: 否
  yin_may_retrieve: 是
  适用产品版本: 现网产品壳（§4.1 速查表）
  更新时间: 2026-09-26
  检索关键词: [正念在这app里从哪练, 接地功能在哪, 专注在这产品里怎么练, where is grounding in the app, mindfulness in this app, breath vs sit where, 概念对应入口, 从哪开始专注]
```

> **权威源（EDU-0001–0004）**：`task-kb-practice-edu-concepts.md` · `PRODUCT_POSITIONING.md` · §4.1 现网入口速查 · `KB-FUNC-0001` / `0002` / `0011` / `0006`

### 4.8 batch-2 Step 4（Rituals 三场景 · 已通过 · catalog 已入库）

> **Status**: **PO 2026-09-26 书面放行** · **已进** `productKnowledgeCatalog.json` · registry `kb-live-ritual-morning` / `kb-live-ritual-emotional-reset` / `kb-live-ritual-work-transition` 链 **0024–0026** · 闸门 **28 条**。

```yaml
- id: KB-FUNC-0024
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: Morning Ritual 从哪开
  适用场景: 想找早晨仪式、或分不清和左球 Breath practice / Five Moments Arrive 的区别
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → Rituals → Morning Ritual. This is one of Yin's advanced guided scenes — it unlocks with Yin Membership or Sanctuary Lifetime. If it is still locked, the menu shows Available with subscription. Yin walks you through a short morning check-in with chip choices; she only points here and does not read the steps aloud.
    指路：菜单 `ritual.morning.menu`（proxy `ritual-morning`）→ `RitualFlow.js` / `RitualFlowUI.js`（welcome → chips → breath → chips → end）。与 0011 分工：0011 = 左球短坐 Breath practice；本条 = 多步 Morning Ritual。与 0019 分工：Five Moments **Arrive** 芯片 → Arrival Practice；本条 = Rituals 菜单独立场景。与 0025 分工：本条 = 早晨意图；0025 = 情绪重置（Recover 芯片也可直达 0025）。
    禁止：把 Morning Ritual 说成必须每日打卡；禁止在短答里念 `ritual.morning.*` welcome/chip 正文；禁止念 `RESET_BREATH_*` / `ritual.shared.breath_guide` 引导语正文；禁止与 MicroRitual 混为一谈。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-26 · 书面放行）
  风险标记: 否
  适用产品版本: 现网 RitualFlow · Morning（entitlement-gated）
  更新时间: 2026-09-26
  locale_keys: [ritual.morning.menu, ritual.morning.welcome, ritual.morning.complete, ritual.shared.continue, ritual.shared.leave, ritual.menu_locked]
  检索关键词: [Morning Ritual, 早晨仪式, morning ritual menu, 晨间仪式, ritual morning, 仪式从哪开, advanced ritual, morning check-in]

- id: KB-FUNC-0025
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: Emotional Reset 从哪开
  适用场景: 想找情绪重置仪式、或分不清 Five Moments Recover 芯片与左球 Breath practice 的区别
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → Rituals → Emotional Reset — or tap Recover on The 5 Moments compass when unlocked. This advanced scene unlocks with Yin Membership or Sanctuary Lifetime. Yin sits with what feels heavy through chip choices and a longer breath — no fixing, just company. She only points here and does not read the steps aloud.
    指路：菜单 `ritual.emotional_reset.menu`（proxy `ritual-emotional-reset`）→ `RitualFlow.js` / `RitualFlowUI.js`。与 0019 分工：Five Moments **Recover** 芯片 → 同 proxy（`resolveFiveMomentAction`）；本条也覆盖菜单直达。与 0011 分工：0011 = 左球短坐；本条 = 多步 Emotional Reset。与 0024/0026 分工：0024 = 早晨；0026 = 下班过渡。
    禁止：把 Emotional Reset 说成心理治疗或贴诊断标签；禁止在短答里念 `ritual.emotional_reset.*` 正文；禁止念 `RESET_BREATH_*` / 引导语正文；禁止说成必须打卡。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-26 · 书面放行）
  风险标记: 否
  适用产品版本: 现网 RitualFlow · Emotional Reset（entitlement-gated）
  更新时间: 2026-09-26
  locale_keys: [ritual.emotional_reset.menu, ritual.emotional_reset.welcome, ritual.emotional_reset.complete, ritual.shared.continue, ritual.shared.leave, ritual.menu_locked]
  检索关键词: [Emotional Reset, 情绪重置, emotional reset ritual, recover moment, Five Moments Recover, 重置仪式, 情绪仪式, reset ritual menu]

- id: KB-FUNC-0026
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: Work Transition 从哪开
  适用场景: 想找下班过渡仪式、或分不清 Five Moments Transition 免费叠层与本条的区别
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → Rituals → Work Transition. This advanced scene unlocks with Yin Membership or Sanctuary Lifetime. Yin helps you mark what can stay at work and what you bring home — chip choices, not a lecture. She only points here and does not read the steps aloud.
    指路：菜单 `ritual.work_transition.menu`（proxy `ritual-work-transition`）→ `RitualFlow.js` / `RitualFlowUI.js`。与 0019 分工：Five Moments **Transition** 芯片 → 免费 C5 Transition Moment 叠层（约 10s 边界标记）；**本条** = Rituals 菜单里的 Work Transition 多步场景，二者不同入口。与 0024/0025 分工：0024 = 早晨；0025 = 情绪重置。
    禁止：把 Work Transition 与 Five Moments Transition 叠层混为一谈；禁止在短答里念 `ritual.work_transition.*` 正文；禁止念引导语正文；禁止说成必须打卡。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-26 · 书面放行）
  风险标记: 否
  适用产品版本: 现网 RitualFlow · Work Transition（entitlement-gated）
  更新时间: 2026-09-26
  locale_keys: [ritual.work_transition.menu, ritual.work_transition.welcome, ritual.work_transition.complete, ritual.shared.continue, ritual.shared.leave, ritual.menu_locked]
  检索关键词: [Work Transition, 下班过渡, work transition ritual, transition ritual menu, 工作过渡, leave work ritual, after work ritual, 过渡仪式]
```

> **权威源（0024–0026）**：`src/locales/en.json` · `RitualFlow.js` · `RitualFlowUI.js` · `fiveMomentsCompassGate.js` · `kbLiveEntryRegistry.js` · `MENU_CHROME_CENSUS.md` · `SCENARIO_TESTS.md` 场景 AF · Slice 2

### 4.9 batch-2 Step 4（Not alone 双条 · 已通过 · catalog 已入库）

> **Status**: **PO 2026-09-26 书面放行** · **已进** `productKnowledgeCatalog.json` · registry `kb-live-quiet-together` / `kb-live-focus-circle` 链 **0027–0028** · 闸门 **30 条**。

```yaml
- id: KB-FUNC-0027
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: Quiet together worldwide 从哪开
  适用场景: 想找全球同坐灯笼、或分不清和 Focus Circle / 普通 Sit 的区别
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → You are not alone → Quiet together worldwide. While you sit, a shared lantern count can show how many people are quietly with Yin — anonymous, no chat, no account. It is on by default; you can turn it off anytime in Privacy. Sitting with Yin still works either way. Yin only points here and does not read presence numbers aloud.
    指路：菜单 `QUIET_TOGETHER_MENU_LABEL`（proxy `quiet-together`）→ `quietTogetherPresence.js` / Privacy sheet `PRIVACY_SHEET_QUIET_TOGETHER_*`。与 0028 分工：本条 = 全球匿名灯笼（默认开 · `?quietTogether=0` 关闸）；0028 = 最多 8 人的私密小圈 + 邀请码。与 0001 分工：Sit 不依赖灯笼；灯笼只伴同坐感，不门闩练习。禁止在短答里念具体灯笼数字或制造 FOMO。
    禁止：说成必须社交才算练习；禁止承诺实时人数准确到秒；禁止与 Focus Circle 混为一谈；禁止在短答里念 `QUIET_TOGETHER_LANTERNS_*` 动态文案正文。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-26 · 书面放行）
  风险标记: 否
  适用产品版本: 现网 Quiet Together（gated-default-on · 需 cloud base URL）
  更新时间: 2026-09-26
  locale_keys: [QUIET_TOGETHER_MENU_LABEL, QUIET_TOGETHER_PANEL_TITLE, QUIET_TOGETHER_PANEL_BLURB, PRIVACY_SHEET_QUIET_TOGETHER_LABEL, PRIVACY_SHEET_QUIET_TOGETHER_HINT, QUIET_TOGETHER_PANEL_CLOSE]
  检索关键词: [Quiet together, 全球同坐, quiet together worldwide, lantern count, 同坐灯笼, quiet together menu, 匿名同坐, worldwide lanterns]

- id: KB-FUNC-0028
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: Focus Circle（我的小圈）从哪开
  适用场景: 想找 Focus Circle / 邀请码小圈、或分不清和 Quiet together / 普通 Sit 的区别
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → You are not alone → My circle. Up to eight people can share a quiet circle — invite someone with a six-character code outside the app. No chat, no account, and no names in this first version. It is optional; Sit with Yin works without it. Yin only points here and does not read circle codes aloud.
    指路：菜单 `FOCUS_CIRCLE_MENU_LABEL`（proxy `focus-circle`）→ `focusCircleMembership.js` / Privacy sheet `PRIVACY_SHEET_FOCUS_CIRCLE_*`（Create · Join · Leave · Copy invite code）。与 0027 分工：本条 = 私密小圈 + 邀请码；0027 = 全球匿名灯笼。与 0001 分工：Focus Circle 不门闩 Sit。禁止在短答里念 witness / traces 句库正文。
    禁止：说成必须拉满 8 人才算练习；禁止承诺聊天或账号体系；禁止在短答里念 `FOCUS_CIRCLE_PEER_TRACES_*` 动态正文；禁止与 Quiet together 灯笼混为一谈。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-26 · 书面放行）
  风险标记: 否
  适用产品版本: 现网 Focus Circle MVP（live · 需 cloud base URL）
  更新时间: 2026-09-26
  locale_keys: [FOCUS_CIRCLE_MENU_LABEL, FOCUS_CIRCLE_PANEL_TITLE, FOCUS_CIRCLE_PANEL_BLURB, PRIVACY_SHEET_FOCUS_CIRCLE_TITLE, PRIVACY_SHEET_FOCUS_CIRCLE_HINT, PRIVACY_SHEET_FOCUS_CIRCLE_CREATE, PRIVACY_SHEET_FOCUS_CIRCLE_JOIN, PRIVACY_SHEET_FOCUS_CIRCLE_COPY]
  检索关键词: [Focus Circle, 我的小圈, my circle menu, focus circle invite code, 邀请码, quiet circle, 小圈从哪开, circle join code, focus circle menu]
```

> **权威源（0027–0028）**：`src/locales/en.json` · `quietTogetherPresence.js` · `quietTogetherPreference.js` · `focusCircleMembership.js` · `kbLiveEntryRegistry.js` · `MENU_CHROME_CENSUS.md` · `SCENARIO_TESTS.md` 场景 AG–AK

### 4.10 batch-2 Step 4（今日方向 / 栖居导航 / 社区 / 会员 · 已通过 · catalog 已入库）

> **Status**: **PO 2026-09-27 书面放行成批入库** · **已进** `productKnowledgeCatalog.json` · registry 四行已链 **0029–0032** · 闸门 **34 条**。batch-2 存活面候选清零；Reminder / Language 仍为 conditional，本批不起草。

```yaml
- id: KB-FUNC-0029
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: 今日方向从哪开
  适用场景: 想再选今天想做什么，或分不清和 Sit 的区别
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → Preferences → Choose today's direction again. You can also tap the Today ball on the home screen. It reopens four quiet choices: Focus for a bit, Quiet down, Study or work, or Just looking around. Sitting with Yin still works if you skip it. Yin only points here and does not choose for you.
    指路：菜单 `TODAY_DIRECTION_MENU_LABEL`（proxy `today-direction`）与首页球 `TODAY_DIRECTION_HOME_BALL_LABEL` → `ColdStartGoalCardUI.js`。四选文案来自 `COLD_START_GOAL_*`。与 0001 分工：本条只重开方向卡，不代替 Sit。
    禁止：说成必须每天选才算练习；禁止替用户选定方向；禁止念横幅刷新文案正文。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-27 · 书面放行成批入库）
  风险标记: 否
  适用产品版本: 现网今日方向（live）
  更新时间: 2026-09-27
  locale_keys: [TODAY_DIRECTION_MENU_LABEL, TODAY_DIRECTION_HOME_BALL_LABEL, COLD_START_GOAL_TITLE, COLD_START_GOAL_FOCUS, COLD_START_GOAL_CALM, COLD_START_GOAL_STUDY, COLD_START_GOAL_BROWSE]
  检索关键词: [today's direction, 今日方向, Choose today's direction again, 重新选择今日方向, today direction menu, What would you like to do today, Today ball, 今日方向从哪开]

- id: KB-FUNC-0030
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: 栖居导航从哪开
  适用场景: 想在 Home / Calendar / Collection 之间走，或分不清和练习菜单的区别
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → Practice & moments → Navigate sanctuary. On a wide home screen you can also tap the compass ball. It opens Home, Calendar, and Collection — a way around the sanctuary, not a new practice. Yin only points here.
    指路：菜单 `SANCTUARY_NAV_MENU_LABEL`（proxy `sanctuary-nav`）与宽屏指南针球 → `HomeSanctuaryNavFanUI.js`。扇叶文案 `SANCTUARY_NAV_HOME` / `CALENDAR` / `COLLECTION`。
    禁止：说成新的练习或仪式；禁止与 Journey log 混成同一条。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-27 · 书面放行成批入库）
  风险标记: 否
  适用产品版本: 现网栖居导航（live）
  更新时间: 2026-09-27
  locale_keys: [SANCTUARY_NAV_MENU_LABEL, SANCTUARY_NAV_ARIA, SANCTUARY_NAV_HOME, SANCTUARY_NAV_CALENDAR, SANCTUARY_NAV_COLLECTION]
  检索关键词: [Navigate sanctuary, 栖居导航, sanctuary navigation, compass ball, 指南针, sanctuary nav menu, Home Calendar Collection, 导航从哪开]

- id: KB-FUNC-0031
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: 社区从哪开
  适用场景: 想找 Join our community，或分不清和同坐 / 小圈的区别
  内容正文: |
    短答（en）：Open More (⋯) or the drawer → Preferences → Join our community. That opens the public community page in a new tab. It is optional; sitting with Yin does not require joining. Yin only points here and does not read invite links aloud.
    指路：菜单 `COMMUNITY_MENU_LABEL`（proxy `community`）→ `communityLink.js` 打开公开社区页。与 0027/0028 分工：本条 = 站外社区页；那两条 = 应用内同坐灯笼 / 小圈。
    禁止：说成必须加入才算练习；禁止在短答里念 Slack 邀请链接。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-27 · 书面放行成批入库）
  风险标记: 否
  适用产品版本: 现网社区外链（live）
  更新时间: 2026-09-27
  locale_keys: [COMMUNITY_MENU_LABEL]
  检索关键词: [Join our community, 社区, community menu, 加入社区, community page, 社区从哪开, where is community, join community]

- id: KB-FUNC-0032
  所属库: 陪伴可检索
  一级分类: 产品功能
  二级分类: 操作入口
  标题: 会员从哪开
  适用场景: 想找订阅入口，或分不清会员、终身通行证和请茶的区别
  内容正文: |
    短答（en）：Open More (⋯) or the drawer. Just above Rituals the row says Subscribe for more scenes, or Premium unlocked if advanced scenes are already open. Membership is optional and can be canceled anytime — it opens the same advanced rituals and ambience as Sanctuary Lifetime. A tea tip does not unlock those. Sit with Yin works without it. Yin only points here and does not read prices aloud.
    指路：菜单行 `MEMBERSHIP_MENU_CTA` / `MEMBERSHIP_MENU_UNLOCKED`（proxy `membership`，紧挨 Rituals 标题上方）→ `idleChromeOrchestration.js`。卡片文案 `MEMBERSHIP_CARD_BLURB`。与请茶分工：请茶不解锁场景。与 0024–0026 分工：本条只指路会员行，不念仪式步骤。
    禁止：FOMO / 硬推销；禁止在短答里念价格；禁止说成不订阅就不能 Sit。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 已通过
  审核人: PO（2026-09-27 · 书面放行成批入库）
  风险标记: 否
  适用产品版本: 现网会员菜单行（live · 未解锁为 CTA，已解锁为 Premium unlocked）
  更新时间: 2026-09-27
  locale_keys: [MEMBERSHIP_MENU_CTA, MEMBERSHIP_MENU_UNLOCKED, MEMBERSHIP_MENU_LABEL, MEMBERSHIP_CARD_BLURB, MEMBERSHIP_CLOSE, SUPPORT_MODAL_SUBTITLE]
  检索关键词: [Yin Membership, 会员, Subscribe for more scenes, Premium unlocked, membership menu, 订阅会员, where is membership, 会员从哪开]
```

> **权威源（0029–0032）**：`src/locales/en.json` · `idleChromeOrchestration.js` · `ColdStartGoalCardUI.js` · `HomeSanctuaryNavFanUI.js` · `communityLink.js` · `kbLiveEntryRegistry.js`

### 4.3 内部排障草案（不进倾诉索引）

```yaml
- id: KB-OPS-0001
  所属库: 内部排障
  一级分类: 产品维护
  二级分类: 上报路径
  标题: Known Errors 修复通知（Stay in touch）
  适用场景: Support / 研发查用户如何订阅已知问题修复邮件
  内容正文: |
    内部：Idle → Preferences → Stay in touch（Newsletter）→ 文案含 known-error 修复与版本说明。不进 Confide 检索。
  yin_may_retrieve: 否
  来源: 界面文案
  审核状态: 未审核
  审核人: —
  风险标记: 否
  适用产品版本: 现网 Newsletter 留资
  更新时间: 2026-09-22
  locale_keys: [NEWSLETTER_CARD_BLURB]
  检索关键词: [known error, newsletter, stay in touch]

- id: KB-OPS-0002
  所属库: 内部排障
  一级分类: 故障排查
  二级分类: 日志路径
  标题: Confide 语义影子日志（研发）
  适用场景: 研发导出 Stage 2 影子 / live 分类 CSV
  内容正文: |
    内部：`npm run audit:confide-semantic-shadow` 扫本机 `turns.jsonl`。不进 Confide 检索、不对用户口述路径。
  yin_may_retrieve: 否
  来源: 设计说明
  审核状态: 未审核
  审核人: —
  风险标记: 否
  适用产品版本: Electron 实验室脚本
  更新时间: 2026-09-22
  locale_keys: []
  检索关键词: [semantic shadow, turns.jsonl, audit]
```

---


## 五、验收清单（文档层）

**第一批**

- [x] 5 条人审通过后，`审核状态` 改为已通过（2026-09-22 PO spot-check 0002/0003）
- [x] `所属库` 与 `yin_may_retrieve` 与三库表一致（第一批）

**第二批（2026-09-22 PO 书面放行）**

- [x] 10 条功能短答（0007–0008、0010–0017）对照 §4.1 速查表与 locale，无另编路径
- [x] 0012–0014 与 CI-00/02/03 分工句保留，不重复教数据格式
- [x] `0009` 云备份专述保持未审核（功能暂禁用）
- [x] 急救型草稿池仅标题登记，`yin_may_retrieve` 仍为否
- [x] KB-OPS 两条 `yin_may_retrieve: 否`，永不进倾诉索引
- [x] 累计 **16 条** `审核状态: 已通过`（0001–0005 + 0007–0008 + 0010–0018）→ 可检索；embedding 近义匹配另记技术债，本轮不实现

**batch-2 Step 4（2026-09-22 PO 书面放行）**

- [x] 0019 Five Moments / 0020 Honesty 对照 locale + `fiveMomentsCompassGate.js`，无另编路径
- [x] registry `catalogKbIds` 已链 0019 / 0020；`productKnowledgeCatalog.json` 已入库
- [x] 0006 PO spot-check 已通过（2026-09-23）；正文作盘点参考，`yin_may_retrieve: 否`，不进 catalog
- [x] 累计 **18 条** `审核状态: 已通过`（0001–0005 + 0007–0008 + 0010–0020）→ 可检索

**batch-2 Inspiration · Daily quote（2026-09-23 PO spot-check 已通过）**

- [x] 0021 对照 `dailyZenQuote.js` + locale + `MENU_CHROME_CENSUS.md`，无另编路径
- [x] PO tone spot-check → 标已通过并进 `productKnowledgeCatalog.json`
- [x] registry `kb-live-daily-quote` 链 `KB-FUNC-0021`；闸门升至 **19 条**

**KB-EDU 科普概念首批（2026-09-26 · PO spot-check 已通过）**

- [x] Brief #936 PO 已点头；候选 4 条全留（①③ 不合并 · ④ 仅 Sit/Breath/Ground）
- [x] §4.7 起草 `KB-EDU-0001`–`0004`；禁止事项核查全「否」；无 `RESET_*` 正文
- [x] PO 逐条 spot-check §4.7 → 标已通过（2026-09-26）
- [x] `KB-EDU-0001`–`0004` 进 `productKnowledgeCatalog.json`；四条 `yin_may_retrieve: 是`
- [x] 闸门升至 **25 条**（21 FUNC + 4 EDU；0006 / 0009 仍不进 catalog）

**batch-2 Rituals（2026-09-26 · PO 书面放行）**

- [x] §4.8 起草 `KB-FUNC-0024`–`0026`；locale_keys 机器核对绿
- [x] PO 书面放行 tone → 标已通过并进 `productKnowledgeCatalog.json`
- [x] registry `kb-live-ritual-*` 链 **0024–0026**；闸门升至 **28 条**

**batch-2 Not alone（2026-09-26 · PO 书面放行）**

- [x] §4.9 起草 `KB-FUNC-0027`–`0028`；locale_keys 机器核对绿
- [x] PO 书面放行 tone → 标已通过并进 `productKnowledgeCatalog.json`
- [x] registry `kb-live-quiet-together` / `kb-live-focus-circle` 链 **0027–0028**；闸门升至 **30 条**

**batch-2 收尾四条（2026-09-27 · PO 书面放行成批入库）**

- [x] §4.10 起草 `KB-FUNC-0029`–`0032`；locale_keys 机器核对绿
- [x] PO 书面放行成批入库 → 标已通过并进 `productKnowledgeCatalog.json`
- [x] registry 四行链 **0029–0032**；闸门升至 **34 条**；batch-2 候选清零（Reminder / Language 仍 conditional）

**共通**

- [ ] 未接线检索运行时之前，阿寅不得「按本库生成长文」
- [ ] 改按钮文案时先改 locale，再改本文件正文与 `locale_keys`

---

## 六、流水线（仍建议，尚未建工具）

存量权威文案（locale / 菜单普查 / 产品文档）→ 草稿池 → 人审打标 → 入库 → Local AI 只索引 `yin_may_retrieve: 是` ∧ `审核状态: 已通过` 的短答 → 未命中回流。  
接线行为 SSOT：`task-briefs/task-confide-kb-retrieval-wiring.md`（原样/模板输出 · 不 L3 转述）。产品问闸门与未命中 / 未就绪空态：`task-briefs/task-confide-kb-routing-gate.md`（**PO 已点头**；本闸运行时未接线）。  
内部排障永不进入倾诉索引。
