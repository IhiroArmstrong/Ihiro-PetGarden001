# Task Brief：引导冥想课前音乐提示

> **状态**：**锁稿 · 按 Brief 开工**（PO 2026-11-21 书面授权：Brief 无需再点头即可实现）  
> **类**：**B**（选课前置一步、文案、氛围乐会话）  
> **依赖**：[`task-guided-meditation-script-v1.md`](./task-guided-meditation-script-v1.md) P1f（duck / 静默光圈）  
> **口令**：`大任务 引导冥想课前音乐提示`

---

## 0. 大白话

用户点某一课之前，若此刻**没有在播**氛围乐，先问一句：**要不要开背景音乐**（静默段落会轻音乐垫底；念指导时会压低音量）。选「开」→ 与本页点击同一手势里开播（**不把**冷启动写成默认开）；选「先不用」→ 直接进入课，与今天一样。若用户进来前已经在播音乐，**不再多问**；结束或关本课后，**仅当**是本次点「开」才播的，才按 Rise 同类规则停播，不把 `ambient-pref` 写成 `enabled:true`。

---

## 1. 切片

| 切片 | 内容 | 本 PR |
|---|---|---|
| B1 | 选课 → 可选「课前音乐」一步 UI + locale | 必须 |
| B2 | `main` 接线：`startSittingMusic` / `startSession` / 课毕 `endSession`（仅 ephemeral） | 必须 |
| B3 | 单测 + e2e 回归（点「先不用」主路径） | 必须 |
| B4 | `tracker-entries` 碎片 | 必须 |

---

## 2. 变体矩阵（A10）

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 宽屏课卡 | Idle 静音，点某课 | 0–1s 见课前问句 + 两钮；点「先不用」进播放页 | e2e 补一步 |
| 窄屏 | 同上 | 同一步，不挡 ⋯ | 菜单可达网既有 |
| 已在播氛围乐 | `isAudiblePlaying()` | **跳过**课前步，直接开课 | 单测 `shouldOffer…` |
| 点「开音乐」 | 课前步 | 0–1s 内开播（preferred 或默认曲）；进课后 duck 仍生效 | 单测 + 可选 e2e |
| 课毕 / 关叠层 | 本次 ephemeral 开播 | 停播；Idle 仍静音偏好 | 单测 end 钩 |
| 课毕 | 课前已在播 | **不停**用户原本的音乐 | 单测 |
| Web / Electron | 无分叉 | 同文案；Web 仍无系统朗读主路径 | 既有 script e2e |
| en / zh / ja | 壳文案三语 | 句子见 `guided-meditation.json` slice | slice 齐全 |

---

## 3. 点击反馈（0–1 秒）（A14）

| 控件 | 点击后 0–1 秒内 | 持久化 |
|---|---|---|
| 课卡 | 课前步可见，或已在播则直接播放页 | — |
| 开背景音乐 | 面板缘音符态更新 + 播放页第一句 | 不写 `enabled:true` |
| 先不用 | 播放页第一句 / 桌面起念 | — |
| 课前步返回 | 回三课列表 | — |

---

## 4. 边缘状态

| 边缘 | 预期 |
|---|---|
| `startSittingMusic` 失败 | 仍开课；用户见播放页（可无声），**不**静默卡在课前步 |
| 忙会话 | 仍由 `guidedMeditationBusyYield` 拦菜单，本刀不改 |
| 听课中切回列表 | 若 ephemeral 已开，停播 |
| 再开第二课 | 若 Idle 又静音 → 再问；若刚停 ephemeral → 再问 |

---

## 5. 共用机制核对

- **overlayBusy**：仍 `guidedMeditationOpen`；课前步在同一叠层内，**不**新开 registry。  
- **HUD 呼吸**：不接线。  
- **z-index**：不改层号；Support / 音符 idle-chrome dim 不受影响。  
- **受保护路径**：否。  
- **后台网络**：不涉及。

---

## 6. 文案（锁定语义 · locale slice）

| 键 | en（锁定） |
|---|---|
| `GUIDED_MEDITATION_MUSIC_PROMPT` | Quiet moments can have soft background music. Turn it on for this practice? |
| `GUIDED_MEDITATION_MUSIC_YES` | Play background music |
| `GUIDED_MEDITATION_MUSIC_NO` | Not now |

zh / ja：同语义写入 slice，不用命令式「必须开」。

---

## 7. 明确不做

- 冷启动改默认开乐、新角落按钮、持久「永远别问」开关  
- 改 Help / 付款 / 脚本正文  
- Chrome `speechSynthesis` 路线

---

## 8. 冲突扫描

- **冷启动 opt-in**：一致，只在用户点「开」时播。  
- **Sit `startSittingMusic`**：同一 `persist:false` 契约。  
- **脚本课「静默配乐」**：选「开」后 duck 逻辑不变。  
- **ambient-soundscape hint**：不合并、不抢 mint。