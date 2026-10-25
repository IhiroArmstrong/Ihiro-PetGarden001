# Task Brief · 冷启动全静音后的声音入口

> **状态（2026-10-25）**：PO 书面点头方案并命写本 Brief。本文件为锁稿。**点头前禁止改 `src/`**；口令「按本 Brief 开工」后才改界面。  
> **类**：**B**（用户可见文案、首次 hint、音符面板结构、菜单一行）。  
> **短名**：冷启动声音入口（无 T 代号；不在本 PR 改 `GLOSSARY.md`）。  
> **拍板句**：冷启动默认全静音保留。不新做设置页、不新增角落按钮。音符是唯一主入口。首次一句短提示。Voice 收进同一张面板；倾诉朗读不并入。不做总开关。`⋯` → Preferences 一行 **Sound** 只打开同一张面板。  
> **不是**：T39（只改铃默认）、T27（停 inhale/exhale）、T34（倾诉屏上朗读）、System TTS V1 的音色/语速、氛围乐付费门。

## 一句话

默认安静不变。新用户要能立刻明白「为什么没声」以及「点音符去开」；打开后看见 Music / Sitting bells / Voice（能读才出现）都是 Off，而不是以为坏了。

## 地面真相（`origin/develop` · 2026-10-25）

1. **默认已静**：氛围乐 opt-in（冷启动 Off）；开始/结束铃默认关（T39）；间隔磬默认关；系统朗读 `announcementsEnabled` 默认关。倾诉朗读是另一条开关，本刀不动。  
2. **音符面板已有两页签**：Ambience（曲目+音量）与 Chimes（磬音量、「计时提示音」总开关、间隔节奏、觉察卡）。**没有** Voice 块。  
3. **系统朗读独立卡**：Electron **仅宽屏** `⋯` → `system-tts` 打开 `#system-tts-preference`（`Z.TTS_OUTLIER`）。网页无此行。窄屏抽屉今天也没有朗读行。  
4. **首次 hint**：id `ambient-soundscape`，键 `HINT_AMBIENT_SOUNDSCAPE`（现网 en：*Tap for music, if it helps you settle.*）。锚 `.ambient-soundscape__mute`，窄屏 remap `#ft-narrow-mute-btn`。**只有一条 hint**，不是宽窄各喷一次。薄荷绿在音符上。  
5. **消失条件与本刀不一致**：现网 **仅选曲** `onTrackChosen` 才 `markSeen`；`onPanelOpened` 反而会 `revealClickHint`；纯静音/开播不清 mint。`ONBOARDING_HINTS.md` 正文仍写旧长句，与 locale 短句已不完全同步。  
6. **菜单普查**：`MENU_CHROME_CENSUS.md` §2.3 把音符标成「故意不进菜单」。`idleChromeOrchestration.js` 注释：Sound 只活在右上音符 / 窄屏 ♪。`SCENARIO_TESTS.md` 开场步仍写「与菜单 / 抽屉 Sound 同效」（菜单行后来删了，剧本未改口）。  
7. **觉察卡**在 Chimes 页，默认开，**不是声音**。本刀不把它改成第四块声音、也不改默认开。

## 已经定下的做法

### 主入口

只用现有音符（宽屏右上 `.ambient-soundscape__mute`，窄屏底栏 `#ft-narrow-mute-btn` / ActionBar ♪）。不新增齿轮、喇叭、FAB、独立设置页。

### 首次提示

沿用 hint id `ambient-soundscape` 与薄荷绿圆点，**替换**只谈音乐的那句。不做横幅、不弹窗、不每次登录重喷。

| 视口 | 锁定英文（en） |
|---|---|
| 宽屏 | Everything is quiet for now. Tap the note if you'd like sound. |
| 窄屏 | Everything is quiet for now. Tap ♪ if you'd like sound. |

实现：仍是 **同一条** hint，按视口换文案（两把 locale 键或运行时挑选）。宽屏不得出现 ♪ 句；窄屏不得出现 *the note* 句。箭头/尖角必须指着当时可见的那颗音符——指向本身解释「点哪里」。禁止叠两条 mint。

zh / ja 写进 **locale slice**（禁止改 `en.json` / `zh.json` / `ja.json` 总账），语义等同：把静写成状态、把选择交给用户、不说「系统已为你关闭」。PO 可改字不改意思。建议稿（可原样进 slice）：

| 键用途 | zh | ja |
|---|---|---|
| 宽屏 | 此刻很安静。想听声音，点那个音符。 | いまは静かなままです。音がほしければ、音符をタップしてください。 |
| 窄屏 | 此刻很安静。想听声音，点 ♪。 | いまは静かなままです。音がほしければ、♪ をタップしてください。 |

薄荷绿消失后的悬停残句 `AMBIENT_NOTE_HOVER` 不得再缩回「只谈选曲」。改为同气质短句（可宽窄各一句，或一句不点名「音乐」）。

### 消失条件（满足任一即永久 `markSeen('ambient-soundscape')`）

1. 用户点开过音符面板（含 `⋯` → Sound 打开的同一张）。  
2. 用户自己打开过任意一种**系统声音**：背景乐、开始/结束铃、间隔磬、系统朗读。

记在现有 hints-seen 本地存储。不要每次登录重现。换设备 / 清站点数据后再出现一次可以接受。无 localStorage 则每次会话可再出现，不弹错误。

**相对现网**：`onPanelOpened` 改为 markSeen（不要再 reveal）；打开铃 / 间隔磬 / Voice / 选非 Off 曲目均须 markSeen。纯关掉面板外的音符静音、且从未开过面板，不清（与「点开过面板」正交）。

### 音符面板结构

一张暖米玻璃卡（现有 Soundscape，`glassPanelStyles`）。**不要**再做成「Ambience / Chimes 页签、Voice 藏在第三页」——首次打开须能看见各块标题及 Off（窄屏可纵向滚动）。自上而下：

| 块 | 内容 | 冷启动可见态 |
|---|---|---|
| **Music** | 背景曲（含 Off）、音量 | 高亮 Off / 未在播，一眼是关 |
| **Sitting bells** | 开始铃+结束铃（现网同一把「计时提示音」）、间隔磬、磬声音量 | 计时提示音关；间隔为无/0。觉察卡可仍留在本块，**不算**声音 Off 行，默认开不变 |
| **Voice** | 原系统朗读开关（结束句等功能性播报）+ 现网 hint（Mac 声音、默认关、不影响倾诉） | 关；见下一小节显示规则 |

冷启动三块（Voice 若显示）都必须清楚是 Off，让人明白「是我没开，不是坏了」。不把开始铃与结束铃拆成两把（T39 已锁总开关）。

### Voice 显示规则

- **仅** `canUseSystemTts`（电脑版且桥可用）时渲染 Voice 块。  
- 网页 / 无桥：**整块隐藏**，不留灰行、不写「不可用」。  
- 相对 System TTS V1「窄屏不露出朗读」：**本刀修订**——窄屏 Electron 只要桥可用，Voice 出现在音符面板里（菜单不再单独承担朗读）。Web 仍不露出。  
- 原来的 `⋯` → Voice announcements / `system-tts` **删除**。开关迁入 Voice 块后 **禁止两处并存**（含隐藏着仍能 `openPanel` 的 `#system-tts-preference`）。菜单可达契约从 `#system-tts-preference` 改到本面板 Voice 开关。  
- 存储仍用 `focus-tiger.system-tts-pref.v1`。写盘失败须现网同款可见失败（status / `aria-invalid`），禁止哑点击弹回。  
- **倾诉朗读**位置、开关、默认、危机不念：完全不变。

### 不做总开关

面板顶部不设「全部静音 / 全部恢复」。冷启动已全静；总开关与分项谁优先会搅状态；气质偏工具。

### 备用入口

`⋯` / 窄屏抽屉 → **Preferences** 新增一行，文案键只出 **Sound**（不要 “Sound settings”）。宽窄都有。点击 **0–1 秒内**打开**同一张**音符面板（复用现有 `onSound` / Soundscape 开合与 `ft-wide-stage-sound` / `ft-narrow-stage-sound`），不做第二套设置。视觉不要抢 Practice 主路径。

这是「找不到音符」的退路，**不是**把音符改成菜单项。音符快捷按钮仍在。实现 PR 须改 `MENU_CHROME_CENSUS.md`：§2.3 不再把音符写成「故意完全不进菜单」；改为「主入口仍是角落音符；Preferences 一行只打开同一面板」。与 `SCENARIO_TESTS`「菜单 Sound 同效」重新对齐。

### 文案禁令

禁止推销/说教：「系统已为你关闭声音」「You should turn sound on」「stays off until you choose」说明书口吻。静是状态，不是缺陷。

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 冷启动 · 宽屏 Web | 无 hints-seen、无声音 pref | 薄荷绿+宽屏英文句指右上音符；无声；无 Voice 块；无新角落钮 | 本刀补 hint 文案 + 面板 Off；e2e 冷启动 Off |
| 冷启动 · 窄屏 Web | 375 | 同一 hint、窄屏英文（含 ♪）指底栏 ♪；面板两块皆 Off | 本刀补；现有 mute remap |
| 冷启动 · Electron 宽屏 | `canUseSystemTts` | 上者 + Voice 块可见且 Off | 本刀补 Voice 可见 |
| 冷启动 · Electron 窄屏 | 桥可用 | Voice 在音符面板，不靠菜单行 | 本刀补（相对 TTS V1 的修订） |
| 点开面板 | 未读 mint | 0–1s 面板开；mint 永久消失；刷新不再出现 | 改 `onPanelOpened` markSeen |
| 仅选曲 / 开铃 / 开间隔 / 开 Voice | 未读 | 任一开启 → markSeen | 本刀补；勿只锁选曲 |
| `⋯` → Sound | 宽 / 窄 Idle | 0–1s 同一张面板；无第二卡 | 菜单可达改契约 |
| 菜单无 system-tts | Electron 宽屏 | Preferences 无 Voice announcements 行 | `idleChromeOrchestration` + 可达契约 |
| 网页无 Voice 占位 | Web 开面板 | 只有 Music + Sitting bells，无灰 Voice | 单测 / e2e |
| 倾诉朗读 | Confide 开、本刀前后 | 行为与入口不变 | 不改 T34 路径；回归现有单测 |
| 老用户已开铃或乐 | 已写盘 true / 已选曲 | 不强制改回关；mint 若已 seen 不再喷 | 现有 pref 保留 |
| 换设备 | 新机无 hints-seen | 提示可再出现一次 | 文档验收；不强制 e2e |
| zh / ja | 界面语言 | 语义等同的短句，不是英文原文 | locale slice + `jaCopyGuards` |
| Rise 后再开面板 | 现网停播 | 曲目记忆/Off 高亮仍按现网氛围契约；本刀不改停播 | 现有 ambient e2e |
| 付款 / Support | 任意 | 不触及 | n/a |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化时：挂起 / 成功 / 失败 |
|---|---|---|
| 音符（未读 mint） | 面板展开；mint/气泡收起 | hints-seen 写入成功则刷新后不再出现；配额失败：本会话已收起，下次冷启动可再出现，**不**新 toast |
| 音符（已读） | 与现网相同：开面板 / 有声时点静音 | 氛围 pref 现网吞错 |
| Music 选曲 / Off | 高亮立刻变；选非 Off 应开始尝试播放（现网） | `ambient-pref.v1` 现网 |
| Sitting bells 计时提示音 | 勾选立刻翻转 | `session-cues.v1`；失败保持屏幕与读盘一致，不新 toast（T39） |
| 间隔节奏 | 下拉值立刻变 | 同上 key 的 interval 字段 |
| Voice 开关 | 勾选立刻翻转；On/Off 文案立刻变 | `system-tts-pref.v1`；失败：弹回 + 现网失败句 + `aria-invalid` |
| `⋯` → Sound | 菜单收、同一张音符面板可见 | 无新存储 |
| 倾诉里的朗读 | **不改** | — |

按设计不生效的点击：无。不在 `SILENT_BEHAVIORS` 新挂条。网页没有 Voice 行 ≠ 哑点击（根本不渲染）。

## 边缘状态

| 边缘状态 | 预期 |
|---|---|
| 无 localStorage / 隐私模式 | 声音默认关；hint 可每会话出现；开关失败走现网失败可见，不崩 |
| 半残 hints-seen JSON | 按现网 hints 解析；坏数据当未读 |
| 浏览器自动播放拦截 | 现网面板内再点选解锁；本刀不改 Gate |
| `canUseSystemTts` 中途变 false | Voice 整块隐藏，不留灰 |
| Focusing 中开面板 | 现网 Focusing 可换曲；本刀加的块同样可开；mint 若未读，开面板仍 markSeen |
| 窄屏抽屉开着再开 Sound | 关抽屉、开同一面板；不挡底栏 ♪（菜单逃生舱） |
| 独立 TTS 卡残留 | **不得**再出现 `#system-tts-preference` |
| 已购 / Stripe | 不触及 |
| 模型未就绪 | 不触及 Confide |

## 冲突扫描（`SCENARIO_TESTS.md`）

| 轴 | 判断 |
|---|---|
| 强度 | 首次一句短 hint + 既有薄荷绿，弱于 Recover / 付款。禁止横幅。被动安静不重于主动开声。 |
| 语气 | 锁定句把静当状态、不催促，与观照者一致。禁止说明书「系统已关」。 |
| 职责 | **有意重叠、已拍板主次**：角落音符 = 主入口；菜单 Sound = 打开同一面板的退路。不与倾诉朗读抢开关。不改 T39 铃默认、不改 T27 相位 TTS。相对 TTS V1：朗读开关搬家，不是新能力。觉察卡仍非声音。 |

相邻：开场「不应自动有音乐」、Soundscape 选曲、Focus/Breath 磬、Electron Voice announcements、菜单 Preferences、`ambient-soundscape` hint。Census「故意不进菜单」由本刀 **书面改口**（链接，不是拆掉音符）。无未决冲突。

## 共用机制核对

- **overlayBusy / HUD 呼吸 / 精灵占用**：不把 Soundscape 改成新的 Yin-busy 叠层。不进 `OVERLAY_UI_SURFACE`。结论：Idle 呼吸与摸头不因开声音面板而按 Confide 那套唤醒合同重写。  
- **z≥17 / 新建可点击叠层**：Voice **不得**再做成 `#system-tts-preference` 那种独立 fixed 卡（现网 `Z.TTS_OUTLIER` 12050）。开关画在已登记的 Ambient 面板里。退役独立卡后，实现 PR 更新 `Z_INDEX.md` / `glassCardVisualSurfaces.js` / `check-glass-card-roots.js`。菜单 Sound 复用已有 `ft-*-stage-sound`，不新分配 z。  
- **遮罩 dim**：不新增 Idle dim。开面板时现网 chrome dim 契约不扩大到付款 FAB 误伤。  
- **受保护付款路径**：**否**。不改 Support FAB / 三卡 / checkout。  
- **后台网络**：不涉及。

## 范围（out）

- 不新增总开关、新角落按钮、常驻横幅、登录弹窗。  
- 不把倾诉朗读并入。  
- 不改铃/乐/朗读的**默认关**（本刀是入口与说明，不是把默认改回开）。  
- 不拆开始铃/结束铃为两把。  
- 不改 T45 藏数字、T47 收控件、T44 系统通知。  
- 不在本 Brief PR 改 `src/`。不在本 PR 改 `GLOSSARY.md` / `TASKS.md` 已有段落。

## 文档（实现 PR 同批，本 Brief PR 只落 Brief）

实现时须改、本刀未改：

- `ONBOARDING_HINTS.md`（`ambient-soundscape` 文案与消失条件）  
- `HINTS_WIRING.md` 若消失条件影响 Focusing 互斥叙述  
- `MENU_CHROME_CENSUS.md` §2.3 / Preferences 表  
- `SHARED_RESOURCES.md` 若 hints-seen 语义变更需一句  
- 产品知识库「idle 音符开关」事实句若仍写「只开关背景乐」则改成「打开声音页」  
- locale slice（en 锁定句 + zh/ja）  
- `TEST_TRACKER` 碎片：待人工测试  

## 验收

- 全新用户：圆点+对应视口英文；无任何系统声音；音符外无新入口。  
- 点开音符：Music / Sitting bells /（仅支持时）Voice，能显示的块均为 Off。  
- 点开面板 **或** 打开任意一种系统声音后，圆点不再出现；刷新与再登录（同机同站点数据）不再出现。  
- 网页无 Voice 占位。  
- `⋯` → Sound 打开同一张面板。  
- `⋯` 不再有单独系统朗读行；`#system-tts-preference` 不存在。  
- 倾诉朗读不变。  
- 宽屏 / 窄屏提示文案各自正确。  
- `cd focus-tiger && npm run test:smoke`；菜单可达与 Soundscape / hint 相关 e2e 按变体矩阵更新（`menu-full-reachability`、`onboarding-remedy-contract`、ambient mute 等入口对不上就改断言，禁止假绿）。

## 点头后开工

新 Chat · 旁支 `fix/cold-start-sound-entry` · 基线 `origin/develop`。口令：「按本 Brief 开工」。  
本 Brief 合入 develop 不等于已实现。
