# 产品知识库 —— 分类体系与字段结构

**状态（2026-09-22）**：仓内权威模板 + **第一批 5 条**（PO 人审已通过）+ **0006 呼吸练习试点**（#923 · 未审核）+ **第二批 10 条**（顺延 0007–0017）+ **0018 寅币获取**（PO 口径已过；**16 条** `审核状态: 已通过` 可进检索闸门；0009 云备份禁用仍 **未审核**）。**运行时**：Electron 宽屏 Confide → `confideProductKnowledge.js` + `productKnowledgeCatalog.json`（关键词检索 · 原样短答 · `FT_CONFIDE_KB_RETRIEVAL=off` 回滚）。**已知技术债（PO 已立项、本轮不实现）**：KB 检索加一层 Qwen3-Embedding 近义匹配（复用 Confide 已装 embedding，替代无限加正则）；正式分类器方向仍见 `task-confide-kb-routing-gate.md`。  
**权威路径**：`focus-tiger/docs/product-knowledge-base.md`  
**交叉引用**：`task-briefs/task-confide-kb-retrieval-wiring.md`（检索接线）· `task-briefs/task-confide-kb-routing-gate.md`（路由闸门 · 待 PO 点头 · 不写代码）· `task-briefs/task-kb-scaled-production.md`（规模化生产算法 · **PO 已拍板** · 第 1 步静态圈定已开工 · `kb-live-entry-registry.md`）· 过程性文档只做候选主题· `LOCAL_AI_SCENARIOS_V1.md` · `LOCAL_AI_OPERATING_LAYER.md` · `CONFIDE_EXECUTABLE_INTENTS.md` · `MENU_CHROME_CENSUS.md` · `ONBOARDING_HINTS.md` · `CALM_ACTION_WISDOM.md` · `PRODUCT_POSITIONING.md` · `LOCAL_AI_WEB_MOUNT_PO_DECISION.md`

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
  检索关键词: [一炷香, 今日同坐, Today's shared sitting, 25 minutes, 香]

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
| P0 | 0006 | 呼吸练习从哪进（左球） | 速查表左球行 · `micro_ritual.*` | 未审核（#923 试点） |
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
    禁止：把 `RESET_BREATH_*` / `BREATH_PHASE_*` 引导语写入本条或倾诉检索块（与 `KB-PSY-DRAFT-0002` 分工）。
  yin_may_retrieve: 是
  来源: 界面文案
  审核状态: 未审核
  审核人: —
  风险标记: 否
  适用产品版本: 现网 Idle 左球主路径（Extended Breath Practice · 1/3/5/10/20 分钟）
  更新时间: 2026-09-22
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
  检索关键词: [怎么陪, How shall we sit, 这次怎么陪你, 陪伴模式, Begin, Offline Space, Flow State]

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
  检索关键词: [呼吸练习, Breath practice, 短坐, 10分钟, quick start, 左球, 和 Sit 区别]

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
  检索关键词: [练习记录, Journey log, 旅程留痕, 练了多久从哪看, practice trail, 日历]

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
  检索关键词: [Presence moments, 情绪记录, 签到, 从哪看情绪, mood check-in, 趋势从哪看]

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
  检索关键词: [明文, plain JSON, 加密, 备份格式, 导出文件, unencrypted, 装了什么, 里面有什么, 包不包含]

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

**共通**

- [ ] 未接线检索运行时之前，阿寅不得「按本库生成长文」
- [ ] 改按钮文案时先改 locale，再改本文件正文与 `locale_keys`

---

## 六、流水线（仍建议，尚未建工具）

存量权威文案（locale / 菜单普查 / 产品文档）→ 草稿池 → 人审打标 → 入库 → Local AI 只索引 `yin_may_retrieve: 是` ∧ `审核状态: 已通过` 的短答 → 未命中回流。  
接线行为 SSOT：`task-briefs/task-confide-kb-retrieval-wiring.md`（原样/模板输出 · 不 L3 转述）。产品问闸门与未命中空态：`task-briefs/task-confide-kb-routing-gate.md`（**待 PO 点头**；点头前不得当已实现）。  
内部排障永不进入倾诉索引。
