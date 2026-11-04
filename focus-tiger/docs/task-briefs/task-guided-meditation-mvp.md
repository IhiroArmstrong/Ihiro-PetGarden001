# Task Brief：Guided Meditation P1 MVP（草稿 · 待 PO 点头）

> 状态：draft · **未点头不得写 `src/`**  
> 依赖：P0 审计 [`guided-meditation-p0-audit.md`](../guided-meditation-p0-audit.md) · P0.5 原创稿 + TTS 授权  
> 类：B 类（用户可见入口、练习、文案）  
> 一口令一 PR。建议口令（点头后新 Chat）：`大任务 按引导冥想 MVP Brief 开工 只碰 focus-tiger/src/audio focus-tiger/src/ui focus-tiger/src/core focus-tiger/src/locales/slices`

---

## 0. 大白话

做三件事：更多菜单里多一项「引导冥想」；点进去三节课列表；跟着声音和字幕练完，练习分钟算进和静坐、呼吸同一本账。冷启动多选项 **本刀不做**。

---

## 1. 切片

| 切片 | 内容 | 本 PR？ |
|---|---|---|
| P0.5 | en/ja 原稿 + 预渲染音频 + ATTRIBUTION | 独立内容/资产 PR，可先于或并列，但运行时 PR 不得无音频占位假完成 |
| P1a | 菜单一项 + 列表面板 | 与 P1b 同 PR 亦可，禁止拆成「只有菜单没有播放」 |
| P1b | 播放器：双轨、cue、暂停、结束淡出、失败提示 | 必须 |
| P1c | 计入 + 聚合注册表 + 体验注册表 | 必须同批 |
| P1d | overlay / sprite 忙会话 / e2e | 必须同批 |
| P2 | 冷启动第五项 | **禁止**本 PR |

## 2. 验收（点头后）

- 宽屏 `⋯` 与窄屏抽屉 Practice 组、Ground 下方可见 Guided Meditation。
- 列表 3 课；点一课 0–1 秒内见字幕区 + 暂停/结束（音频可稍后到，须有加载态）。
- 暂停/继续；结束淡出配乐。
- 达完成规则后练习日与莲花增加；Confide 时长读聚合不丢这条。
- Focusing / Honesty / Breath 进行中不能叠开本课。
- 课开着 `⋯` 仍在。
- en/ja；zh 草稿不宣称。
- 你亲测听感后才可标 TRACKER「已通过」。

## 3. 变体矩阵（A10）

| 维 | 变体 | 期望 |
|---|---|---|
| 视口 | 宽屏 / 375 | 列表+播放不挡菜单逃生舱；宽屏不挡脸 |
| 语言 | en / ja | 字幕与音频 locale 一致；缺 ja 音频则明示不可用，禁止 silent 播 en |
| 课 | 3 / 5 / 10 分 | 独立音频与 cue |
| 权利 | 免费核心 | MVP 三课免费；不挂会员锁 |
| 壳 | Web / Electron | 同一播放器；不用系统 TTS |

## 4. 点击反馈（A14）

- 点菜单项 0–1s：面板打开或按钮禁用理由。
- 点课 0–1s：标题 + 加载或首句。
- 暂停/结束 0–1s：按钮态变化；结束若记账则 pending→成功/失败分开展示。
- 设计静默：无。加载失败不在 `SILENT_BEHAVIORS`。

## 5. 边缘状态

- 音频 404 / 超时：可见失败 + 可关面板；不计入。
- 课中切走 tab：暂停（P1 须实测后锁）。
- 未完成退出：不计（若 PO 采纳审计方案 A）。
- 无 TTS 文件：该课不可点。

## 6. 共用机制核对

- **overlayBusy：** 本课计入忙碌，Idle 摸头/进睡否决；不把 `⋯` 放进 busy 隐藏。
- **HUD 呼吸：** 不复用 Focusing HUD 倒计时冒充「引导」；可用本课剩余或句进度，须新文案。
- **dim：** 若用 overlay 遮罩，走 Idle chrome 消费者，不得盖 Support FAB / 音符 / `⋯`。
- **O-04：** 新增 `OVERLAY_UI_SURFACE` 一行（见审计 D3）。

## 7. 风险

- **中：** 双轨音频在 Safari。
- **中：** 与 T76「无引导」文案并存，Help/KB 须后续改口（可同 PR 补 EDU 一句「另有带声音的课」——点头后才改知识库）。
- **低：** 课包增大桌面更新体积。

## 8. 明确不做

冷启动第五项、中文对外、疗效宣称、云、运行时 TTS、真人录音、身体扫描/慈心扩课、并入 Recover。
