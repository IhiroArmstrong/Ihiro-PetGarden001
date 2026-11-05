# Task Brief：Guided Meditation P1 MVP（草稿 · 待 PO 点头）

> 状态：draft · **PO 2026-11-04 方向已拍板** · **未点头 MVP Brief 不得写 `src/`**  
> 依赖：P0 [`guided-meditation-p0-audit.md`](../guided-meditation-p0-audit.md) · 媒体 [`guided-meditation-media-delivery-audit.md`](../guided-meditation-media-delivery-audit.md) · P0.5 剪辑/授权/cue  
> 类：B 类（用户可见入口、练习、文案、Help 改口）  
> 口令（点头后新 Chat）：`大任务 按引导冥想 MVP Brief 开工`

---

## 0. 大白话

做四件事：菜单里多「引导冥想」；列表里 **英文** 课（**22 分长片 + 优先上的 3–5 分入门**）；点课 **播你的原声视频**（Web 边下边播，桌面可离线保存）；练够规则算进练习账。**同时**改 Help，让「同坐无语音」和「另有引导课」不打架。冷启动 **不改**。

---

## 1. 切片

| 切片 | 内容 | 本 PR？ |
|---|---|---|
| P0.5 | 母版剪 3–5 分 + cue JSON；**授权 OK 后**上传 R2 | 资产/内容 PR；**授权前禁止上传** |
| P1a | 菜单 + 列表面板 + 课卡语言标 | 必须 |
| P1b | `<video>` 播放 + cue + 暂停/结束 + 加载/失败 | 必须 |
| P1c | 点课 manifest/下载（姊妹篇 spec）+ 计入 + 聚合注册 | 必须同批 |
| P1d | overlay / 忙会话 / e2e | 必须同批 |
| P1e | **Help EDU-0003 + KB + e2e alias**（§F2 审计） | **上线硬门禁** |
| P2 | 冷启动二级选 | **禁止** |

## 2. 验收（点头后）

- Practice 组 Ground 下可见 Guided Meditation（宽+375）。
- **英文**课列表；长片 + 入门短课（短课未就绪时可只上长片，须 PO 书面接受）。
- 点课 0–1s 有加载/首帧；Web **不必等整片下完**即可播。
- 短课 ≥90% / 长课 ≥3 实际分钟 → 练习日与莲花正确；Confide 聚合含新源。
- Focusing / Honesty / Breath 互斥；课中 `⋯` 仍在。
- Help 搜 `meditation`：Sit 仍 **no voice guidance** + **另有 guided meditation 菜单课**。
- 你亲测听感 + 授权已核实后才可 TRACKER「已通过」。

## 3. 变体矩阵（A10）

| 维 | 变体 | 期望 |
|---|---|---|
| 视口 | 宽屏 / 375 | 不挡脸；菜单逃生舱 |
| 语言 | **en MVP** | 课卡标 English；ja 课未上线不 silent 播 en 标 ja |
| 课 | 长 22 分 + 短 3–5 分 | 不同 manifest 条目；计入规则见 Brief §8 |
| 媒体 | Web 流式 / 桌面缓存 | 姊妹篇 spec |
| 权利 | 免费 | 无 entitlement 门闩 |

## 4. 点击反馈（A14）

- 菜单 / 点课 / 暂停 / 结束 / 重试下载：0–1s 可见态；失败非静默。

## 5. 边缘状态

- 404 / 校验失败 / 无网未缓存：课卡「需要网络」或重试；不计入。
- 长课 <3 分、短课 <90%：不计入。
- 授权未核实：**不上传**，不假装「已上线」。

## 6. 共用机制核对

- overlayBusy 计本课忙碌；`⋯` 不隐藏。
- dim 不盖 Support FAB / 倾听耳。
- 新增 `OVERLAY_UI_SURFACE` 行（审计 D3）。

## 7. 风险

- **中：** Help 改口 + T76 e2e 回归。
- **中：** Safari 视频流式 + 弱网。
- **高（流程）：** 配乐 App 内授权未核实前上传。

## 8. 明确不做

冷启动第五项、运行时 TTS 作第一课、疗效宣称、后台预下载、日语课（无母版）、并入 Recover。
