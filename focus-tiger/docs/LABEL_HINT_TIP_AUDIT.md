# LABEL_HINT_TIP_AUDIT.md — 可交互入口说明信号全量清单

创建日期：2026-09-12  
状态：**纯审计 · 不改代码**  
基线：`origin/develop` `274b02e1`（落后数 0；**不能**用营销旁支代表主干）  
权威路径：`focus-tiger/docs/LABEL_HINT_TIP_AUDIT.md`  
规则草案：[`LABEL_HINT_TIP_STANDARDS.md`](./LABEL_HINT_TIP_STANDARDS.md)  
任务书（仓外）：`task-label-hint-tip-unification-audit.md`

核对方式：对 `src/ui/*UI.js`、Home 壳、`ui-kit`、`desktop/main.js` 打开源码看实际赋值，不只搜 `data-ft-tip`。  
**关键事实：**全仓 **无** `data-ft-tip`、**无** `idleHomeCtaTip.js`。任务书「三球已改自绘 tip」与 git **不一致**——以 git 为准。

---

## 大白话（给拍板用）

App 里解释按钮的办法至少有四套：按钮上直接写字、原生悬停（大约要等一秒）、自己画的小字条、以及绿色小圆点提醒「这里还没看过」。三颗主页球现在仍是「只有图标 + 慢悬停」。倾听耳已经是「自己画的小字条、很快出现」。看起来不专业，主要是因为这几套混在一起，而不是因为缺一种万能提示。

---

## 风险汇总

| 等级 | 条数 | 含义 |
|---|---:|---|
| 高 | 8 | 图标/抽象入口，用途不能从可见元素直接读出，且说明慢、缺失，或同类入口实现互相打架 |
| 中 | 16 | 有说明但机制不一致、触屏不可达、或脉冲/悬停叠床架屋 |
| 低 | 48 | 可见文字已够，或通用关闭/主按钮；维持现状 |
| **合计** | **72** | 范围=用户可点的按钮/图标/功能入口；不含纯装饰与大段说明文 |

建议实现时优先 **高 × 同类内部不一致**（Home 三球、宽/窄倾诉、环境音残句），不要先给已经写清楚的菜单行补 tip。

---

## 同类场景内部不一致（单独标注）

| ID | 场景 | 现象 |
|---|---|---|
| INC-1 | 图标悬停 | 倾听耳、换场入口 = 自绘 `__tip`（约 140–180ms 淡入）；Home 三球、音符残句、PiP、徽章下载 = 原生 `title`（约 1s）；HUD = Onboarding 宿主悬停气泡（未读时） |
| INC-2 | 倾诉入口 | 宽屏耳钮自绘 tip + `CONFIDE_EAR_TOOLTIP`；窄屏 ActionBar 倾诉钮原生 `title` = `CONFIDE_MENU_LABEL`（更短、更慢） |
| INC-3 | 脉冲 | ⋯ 行内 mint、音符 mint 仍在；Quick Start 球与 HUD **明文禁止** mint；钢蓝 `HINT_DISCOVERY_DOT_HOSTS` **空表**仍留 API |
| INC-4 | 自绘 tip 皮肤 | 耳钮玻璃浅底；Transition 深色小条。两套都不是 `data-ft-tip` |
| INC-5 | 产品口头 vs 代码 | 用户称右球为 Five Moments；代码右球是 Honesty 补登（`#ft-*-home-honesty` + `HONESTY_IDLE_ENTRY`）。Five Moments 在 ⋯ / 抽屉文字行 + 冷启动 Compass 卡 |

---

## 全量清单

字段：当前信号可多选。Touch=该查询层在触屏是否可达。

### A. Home 壳 / 三球 / 次级菜单

| ID | 组件/按钮 | 场景 | 当前信号 | 可见即可懂？ | Touch | 建议 | 风险 |
|---|---|---|---|---|---|---|---|
| A01 | `#ft-wide-home-sit` / `#ft-narrow-home-sit` | Home | 原生 `title`（Sit/Rise 文案）+ `aria-label`；无脉冲；图标球 | 部分（图抽象） | 无（长按不可靠） | 原生title迁移为自绘 tip；**不必**加脉冲 | 高 |
| A02 | `#ft-wide-home-quickstart` / `#ft-narrow-home-quickstart` | Home | 原生 `title`=`QUICK_START_ARIA`；**禁 mint**（`NO_MINT_PULSE_HINT_IDS`）；未读时 Onboarding 会暂时摘 `title` | 否 | 无 | 同 A01；保持无脉冲 | 高 |
| A03 | `#ft-wide-home-honesty` / `#ft-narrow-home-honesty` | Home | 原生 `title`=`HONESTY_IDLE_ENTRY`；图标为 Honesty 非 Five Moments | 否 | 无 | 同 A01；产品确认文案是否仍叫补登 | 高 |
| A04 | `#quick-start-focus`（dock ⚡） | Home / Companion | 原生 `title` + ⚡ 可见；mint 未读时摘 title | 部分 | 无 | 迁自绘 tip；与 A02 去重（避免双球双 tip） | 中 |
| A05 | `#btn-focus` Sit/Rise | Home / Focus | **可见文字**主按钮 | 是 | 有（按钮本身） | 维持现状；不要加 tooltip | 低 |
| A06 | `#ft-wide-more-btn`（⋯） | Home 宽 | 可见「⋯」+ `WIDE_MORE_ARIA`；无 title；无自绘 tip | 部分 | 点开即见菜单 | 可补一条短自绘 tip「更多」；非必须 | 中 |
| A07 | `.ft-wide-more__item` 已解锁行 | ⋯ 菜单 | **可见 Label**；未读时行内 mint | 是 | 有 | 维持；脉冲按 registry | 低 |
| A08 | `.ft-wide-more__item.is-locked` | ⋯ 菜单 | 可见 Label + 原生 `title`=`ritual.menu_locked` | 部分 | 无 | 锁态可用可见「未解锁」或自绘 tip，去掉原生 title | 中 |
| A09 | `#ft-narrow-confide-btn` | 窄 Home | 原生 `title`=`CONFIDE_MENU_LABEL` + 图标 | 否 | 无 | 与宽屏耳钮对齐为自绘 tip（INC-2） | 高 |
| A10 | `#ft-narrow-help-btn` / `#onboarding-hint-help` | Home | 可见「?」；hover → 产品简介卡（非 title）；click hint `help-affordance` | 部分 | 点「?」出简介 | 维持；不要再叠原生 title | 低 |
| A11 | `#ft-narrow-mute-btn` | 窄 Home | 与宽屏音符同源：mint 未读摘 title；残句原生 `AMBIENT_NOTE_HOVER` | 否 | 无 | 残句改自绘 tip；mint 政策维持 | 高 |
| A12 | `.ft-narrow-grabber` | 窄抽屉 | `aria-label` 滑动提示；无 title | 部分 | 手势 | 维持；通用控件 | 低 |
| A13 | `.ft-narrow-sheet__close` | 窄抽屉 | 关闭；有 aria | 是 | 有 | 维持（通用 ×） | 低 |

### B. 常驻图标簇（热力图旁）

| ID | 组件/按钮 | 场景 | 当前信号 | 可见即可懂？ | Touch | 建议 | 风险 |
|---|---|---|---|---|---|---|---|
| B01 | `#confide-ear-chrome` | 宽 Idle | **自绘** `__tip` + `CONFIDE_EAR_TOOLTIP`；无原生 title；无 mint | 否（仅图标） | hover:none 只提高透明度，**不出字** | 作为自绘 tip 样板收编 `data-ft-tip`；补触屏一次出字 | 中 |
| B02 | `#language-preference-fab` | Idle | 地球图标 + `LANGUAGE_FAB_ARIA`；click 脉冲 `language-preference` | 否 | mint 可点 | 未读靠脉冲+气泡；**done 后补自绘 tip**（现无残句） | 高 |
| B03 | `#reminder-preference-toggle` | Idle | 时钟图标 + aria；click 脉冲 `in-app-reminder` | 否 | mint 可点 | 同 B02 | 高 |
| B04 | `#reminder-preference-confirm`（→） | 提醒面板 | 符号 + `reminder.confirm_aria` | 部分 | 有按钮 | 可见「保存」优于 tooltip；可维持 | 中 |
| B05 | `.ambient-soundscape__mute` | Idle / Focus | mint + 未读摘 title；done 后原生 title；另有滑杆 `title` 提示 | 否 | 无（残句） | 残句+滑杆 hint 迁自绘；面板内文字开关维持 Label | 高 |
| B06 | 环境音面板：音量/引磬/节拍/觉察 **label.title** | Focus 设置 | 可见 Label + 原生 title 补充句 | 部分 | 无 | 补充句可改自绘或改成可见小字；禁止只靠慢 title | 中 |
| B07 | 试听行 play/pause `AMBIENT_AUDITION_ROW_HINT` | 环境音 | 原生 title | 部分 | 无 | 迁自绘或用可见 ▶/❚❚ | 中 |
| B08 | `#weekly-practice-heatmap` | Idle | 色块展示；click hint `weekly-heatmap`；**无格子 tooltip / 无下钻**（TRACKER 亦记） | 部分 | 无 hover 详情 | 维持纯展示，除非产品要下钻（另立项） | 低 |
| B09 | `#transition-moment-trigger` | Idle | 自绘深色 `__tip`；`TRANSITION_MOMENT_TRIGGER_LABEL` | 否 | 无点击出字 | 皮肤与 B01 对齐；触屏规则同标准 §五 | 中 |
| B10 | `#idle-companion-pip` / Immersive PiP | Idle / 桌面 | 原生 `IDLE_COMPANION_PIP_HINT` / `IMMERSIVE_PIP_HINT` | 否 | 无 | 迁自绘 tip | 中 |
| B11 | `#yin-support-fab` | Idle | **可见** `SUPPORT_FAB_LABEL` + aria | 是 | 有 | 维持；不要加 tooltip | 低 |
| B12 | `IdleYinTapAnchorUI` 额头 | Idle | 一次白玉句 `IDLE_YIN_TAP_HINT`（非 hover） | 首次是 | 点额头即动作 | 维持；交叉引用冷启动 E11 | 低 |
| B13 | `SeasonalThemeChrome` whisper | Idle | 可见句子按钮 | 是 | 有 | 维持（内容气泡 ≠ 控件 tip） | 低 |
| B14 | `MomentWhisperUI` | Moments | 可见句子按钮 | 是 | 有 | 维持 | 低 |
| B15 | `SoftUpdatePromptUI` | 壳 | 可见更新条按钮 | 是 | 有 | 维持 | 低 |

### C. Five Moments / Sit / Breath / Honesty / MicroRitual

| ID | 组件/按钮 | 场景 | 当前信号 | 可见即可懂？ | Touch | 建议 | 风险 |
|---|---|---|---|---|---|---|---|
| C01 | Five Moments Compass 五钮 | 冷启动 / ⋯ | **可见时刻名** | 是 | 有 | 维持；交叉引用冷启动 E09 | 低 |
| C02 | Compass Skip / Got it / Close | 同上 | 可见文字 | 是 | 有 | 维持 | 低 |
| C03 | Companion 三模式卡 | Sit 点选 | 卡上标题+描述；按钮另写 `btn.title = description`（与可见文重复） | 是 | 有 | **去掉多余**原生 title | 中 |
| C04 | Companion dock「How shall we sit?」 | Sit | 可见问句；click hint `how-shall-we-sit` | 是 | 有 | 维持 | 低 |
| C05 | Honesty 面板选项 / 时长 | Honesty | 可见文案按钮 | 是 | 有 | 维持 | 低 |
| C06 | Honesty 桥接 Yes/No | 会后 | 可见 CTA | 是 | 有 | 维持；auto hint 已关 | 低 |
| C07 | `#honesty-idle-entry`（若仍露出） | Home | 与 A03 同源语义 | 视是否露字 | — | 若只剩球，归 A03 | 中 |
| C08 | MicroRitual 芯片 / Leave | 微仪式 | 可见文字 | 是 | 有 | 维持 | 低 |
| C09 | RitualFlow Continue/Skip/Done | 仪式 | 可见文字 | 是 | 有 | 维持 | 低 |
| C10 | Arrival Notice/Choose 点选 | Arrive | 可见步骤 | 是 | 有 | 维持 | 低 |
| C11 | Focus 时长芯片 | Sit | 可见分钟 + 下方寅币 **可见小字**（`focusCoinsDurationHint`） | 是 | 有 | 维持（这是 Label 不是 hover） | 低 |
| C12 | `ActiveRecoverAnchor` | Focusing | 幽灵可见 hint + aria；冷却时藏句留热区 | 是（有句时） | 点即 Recover | 维持；不是 tooltip | 低 |
| C13 | Recover Reset 报价钮 / Close | Recover | 可见；Close 仅 `aria-label='Close'` | 是 | 有 | 维持通用关闭 | 低 |
| C14 | Calm Action Arrive/Recover 卡 | Moments | 可见卡按钮 | 是 | 有 | 维持 | 低 |
| C15 | `FocusAwarenessCard` / 会中觉察 | Focus | 面板内可见 | 是 | 有 | 维持 | 低 |
| C16 | Breath pacer Close | Breath | 通用 Close | 是 | 有 | 维持 | 低 |
| C17 | Reflection Continue/Skip | Reflect | 可见文字 | 是 | 有 | 维持 | 低 |
| C18 | Cold start goal 选项 | 冷启动 | 可见选项 | 是 | 有 | 维持 | 低 |

### D. Confide / Journey / Support / Membership

| ID | 组件/按钮 | 场景 | 当前信号 | 可见即可懂？ | Touch | 建议 | 风险 |
|---|---|---|---|---|---|---|---|
| D01 | Confide Send / Close / Cancel | Confide | 可见文字 | 是 | 有 | 维持。芯片文案审计见 observation 桶文档，**不重复审路由** | 低 |
| D02 | Confide 口头芯片 | Confide | 可见问句 | 是 | 有 | 维持；不要加 tooltip | 低 |
| D03 | Confide 记忆同意 Allow/Deny | Confide | 可见 | 是 | 有 | 维持 | 低 |
| D04 | Journey Log 关闭 / 备份 / OTP | Journey | 可见 | 是 | 有 | 维持 | 低 |
| D05 | Journey 洞见标记 | Journey | `aria-label` 无 title | 部分 | 无 | 若只是装饰标记可维持；若可点则补短 tip | 中 |
| D06 | Support 卡 CTA | Support | 卡上标题+利益点+CTA 文字 | 是 | 有 | 维持 | 低 |
| D07 | Membership Buy/Restore/Close | 会员 | 可见 | 是 | 有 | 维持 | 低 |
| D08 | Sanctuary / Tip 徽章下载钮 | 已购 | 图标 + 原生 title「下载」 | 部分 | 无 | 迁自绘 tip | 中 |
| D09 | Newsletter / Zen Cinema / Wallpaper / Daily quote 卡钮 | Growth | 可见主按钮 | 是 | 有 | 维持 | 低 |
| D10 | Mustard seed 前后翻 / 保存 | 印 | 可见或 aria | 部分 | 有 | 箭头类维持；勿加噪 | 低 |
| D11 | Focus Coins 关闭 / 挥手 / 兑换 / 佩戴 | 寅币 | 面板内可见文字钮 | 是 | 有 | 维持 | 低 |
| D12 | `collection-shelf` 格 | ui-kit | 原生 `title`（未解锁英文硬编码 "Not yet revealed"） | 部分 | 无 | 迁自绘 + locale；去掉硬编码 | 中 |

### E. Focus Circle / Presence / 设置 / 桌面壳 / 实验室

| ID | 组件/按钮 | 场景 | 当前信号 | 可见即可懂？ | Touch | 建议 | 风险 |
|---|---|---|---|---|---|---|---|
| E01 | Focus Circle Create/Join/Leave | 隐私/⋯ | 可见按钮文字 | 是 | 有 | 维持 | 低 |
| E02 | Witness Respond / Hide | Circle | 可见文字 | 是 | 有 | 维持 | 低 |
| E03 | Presence dots / Quiet Together | Circle | 展示为主；关面板可见 | 部分 | 无 hover 详情 | 与热力图一样：不要默默加 tooltip 当产品功能 | 低 |
| E04 | Language 列表项 | 设置 | 可见语言名 | 是 | 有 | 维持 | 低 |
| E05 | Local practice export/import | 设置 | 可见 | 是 | 有 | 维持 | 低 |
| E06 | PresenceSignals Allow/Deny/Delete | 设置 | 可见 | 是 | 有 | 维持 | 低 |
| E07 | FlowerBlow 气泡 | 冷启动 | 可见一次句 | 是 | 有 | 维持（非控件 tip） | 低 |
| E08 | Contextual tea tip 气泡 | 会中 | 可见茶句 | 是 | 有 | 维持；勿与控件 tip 合并 | 低 |
| E09 | `OnboardingHintsUI` mint / host-hover 气泡 | 多场景 | 发现性气泡（auto 喷洒已关） | 视未读 | click 圆点可达 | 维持 HINTS SSOT；残句层改自绘后与之去重 | 中 |
| E10 | `main.js` 实验室 Clear hints / funnel / reset | `?dev` | 原生 title | 部分 | 无 | 实验室可保留 title **或**同样迁走；产品面不优先 | 低 |
| E11 | Electron `tray.setToolTip('Focus Tiger')` | 桌面托盘 | 系统托盘 tip（不是 DOM title） | 部分 | n/a | 维持；**豁免** DOM title 禁令 | 低 |
| E12 | Focus HUD 环 / 条 / streak | Focusing | 未读：宿主悬停出 hint 文案；无 mint；streak **禁止**原生 title；done 后环/条可能静默 | 部分 | 无 | done 后补自绘残句（与 B02 同类） | 中 |
| E13 | `tooltip-card` 自定义元素 | ui-kit | 卡片标题属性 `title`=可见 h3，不是浏览器 tooltip | 是 | 有 | 维持；命名易混，标准里豁免 | 低 |
| E14 | `notification-badge` | 「?」 | 朱红点=未读帮助，不是钢蓝 discovery | 部分 | — | 维持；勿与 mint 混色 | 低 |

---

## 机制对照（实现层，便于开工）

| 机制 | 代表代码 | 延迟观感 | 是否在主干 |
|---|---|---|---|
| 原生 `title` | `WideIdleMoreMenu._refreshHomeCtas` · `NarrowIdleShell` · `AmbientSoundscapeUI` · `CompanionModePicker._syncQuickStartLabel` | ~1s（系统） | **是 · 三球仍走这条** |
| 自绘 `__tip` | `ConfideEarChromeUI` · `TransitionMomentTriggerUI` | 140–180ms 淡入（几乎无额外 delay） | 是 |
| Onboarding 宿主悬停 / mint | `OnboardingHintsUI._bindHostMintHover` · `_syncHudHostHover` | 气泡，非 title | 是；**auto 喷洒已关** |
| `data-ft-tip` / `idleHomeCtaTip.js` | — | 任务书称 120ms | **否 · 未实现** |
| 钢蓝 discovery dot | `hintDiscoveryDots.js` `HINT_DISCOVERY_DOT_HOSTS=[]` | — | API 在、宿主空 |

---

## 建议的实现批次（拍板后，非本轮）

1. **P0** 高风险图标残句：A01–A03、A09、A11、B05 残句。统一成倾听耳同款自绘 tip（再收成 `data-ft-tip`）。
2. **P1** done 后静默的图标：B02、B03、E12。
3. **P2** 去重：C03 双份 description、A08 锁态 title、D08/D12 下载格、B06 滑杆。
4. **P3** 触屏规则按标准 §五做一次，不要每个入口发明一套。
5. **不做**：给 A05/A07/B11/D01 等可见文字钮批量加 tip；不要把 mint 画到三球上「为了统一」。

---

## 修订

| 日期 | 说明 |
|---|---|
| 2026-09-12 | 首份全量审计；基线 `274b02e1` |
