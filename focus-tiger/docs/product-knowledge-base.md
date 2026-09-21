# 产品知识库 —— 分类体系与字段结构

**状态（2026-09-22）**：仓内权威模板 + 第一周 5 条产品功能短答（对照现网 locale / 菜单普查；**PO 人审已通过**）。**无运行时**；不接线 Local AI 检索，不改倾诉生成。  
**权威路径**：`focus-tiger/docs/product-knowledge-base.md`  
**交叉引用**：`task-briefs/task-confide-kb-retrieval-wiring.md`（检索接线方向锁 · Q1–Q5 已拍板 · 无运行时）· `LOCAL_AI_SCENARIOS_V1.md`（阿寅不是开放问答）· `LOCAL_AI_OPERATING_LAYER.md`（备份/更新不进 Confide）· `CONFIDE_EXECUTABLE_INTENTS.md`（口头白名单）· `MENU_CHROME_CENSUS.md`（⋯ / 抽屉路径）· `ONBOARDING_HINTS.md`（不做目录式 FAQ）· `CALM_ACTION_WISDOM.md`（禁临床标签）· `PRODUCT_POSITIONING.md`（不承诺心理咨询）

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

## 四、第一周样例（对照现网 · 已通过）

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

---

## 五、第一周验收（文档层）

- [x] 5 条人审通过后，`审核状态` 改为已通过（2026-09-22 PO spot-check 0002/0003）
- [ ] `所属库` 与 `yin_may_retrieve` 与三库表一致
- [ ] 未接线检索运行时之前，阿寅不得「按本库生成长文」
- [ ] 本周不把任何急救型心理练习写成 `yin_may_retrieve: 是`
- [ ] 改按钮文案时先改 locale，再改本文件正文与 `locale_keys`

---

## 六、流水线（仍建议，尚未建工具）

存量权威文案（locale / 菜单普查 / 产品文档）→ 草稿池 → 人审打标 → 入库 → Local AI 只索引 `yin_may_retrieve: 是` ∧ `审核状态: 已通过` 的短答 → 未命中回流。  
接线行为 SSOT：`task-briefs/task-confide-kb-retrieval-wiring.md`（原样/模板输出 · 不 L3 转述 · 实现 Issue 待盘点清单稳定后拆）。  
内部排障永不进入倾诉索引。
