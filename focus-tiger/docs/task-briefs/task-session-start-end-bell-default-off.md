# Task Brief · T39 开始铃结束铃默认关

> **状态（2026-10-23）**：PO 书面同意「无声场」落地走已排队的 T39 / T45 / T47；本刀是三刀里**第一刀**。点头前 **禁止**改 `src/`。  
> **类**：**B**（新用户坐下时默认不再响开始铃 / 结束铃）。  
> **代号**：**T39**（电脑版十二条对照 #7 · 执行序 4）。  
> **拍板句**（[`GLOSSARY.md`](../GLOSSARY.md) 不得改口）：开始铃、结束铃默认改成关。朗读保持可关，不要和铃混成一件事。T27 按原 Brief，不停结束句。  
> **不是**：T27（停 inhale/exhale）、T45（藏计时数字）、间隔磬、氛围乐。

## 一句话

没开过「计时提示音」的人，坐下和坐完默认安静。想听铃的人仍可在 Soundscape 里打开。系统朗读、间隔磬、结束句语音都不跟这把总开关绑死。

## 地面真相（`origin/develop` · 2026-10-23）

1. 开始铃 / 结束铃共用 Soundscape「计时提示音」总开关；`defaultSessionCuePref()` 里 `sessionStartBellEnabled` / `sessionEndBellEnabled` 现为 **`true`**，两字段 AND 同步。  
2. 间隔磬独立，默认 **关**（`sessionIntervalMs: 0`）。觉察观照卡独立，默认开（无间隔时不出卡）。  
3. T27 代码已合 #1377：练习中不念 inhale/exhale；专注结束句仍可播。账本有的行仍写 T27「排队中」，**以 git 为准：相位 TTS 已合，本刀不得再改那条路径。**

## 已经定下的做法

1. **只改默认。** `defaultSessionCuePref()` 与 `normalizeSessionCuePref` 里缺字段时的回落，开始铃 / 结束铃改为 **`false`**。总开关 UI 仍是同一把，仍同步两字段。  
2. **已写盘的偏好不强制改。** `focus-tiger.session-cues.v1` 里已经存过布尔值的用户，保持原值。没存过 key、或解析失败走默认的人，得到「关」。禁止静默把老用户的「开」改成「关」。  
3. **朗读分开。** Voice announcements / Confide TTS / 专注结束句播报开关与存储一律不动。关铃不等于关朗读。  
4. **间隔磬与觉察卡不动。** 默认仍是间隔 off；不把间隔磬绑进开始/结束总开关。  
5. **文案。** 开关仍叫现有 `SESSION_CUES_TOGGLE`；不新写「默认已为你关掉」之类推销句。面板须继续可见写出开关含义（现网 hint 保留）。

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 冷启动无 key | Web / Electron · 从未写 `session-cues.v1` | 坐下无开始铃、达标无结束铃；Soundscape 总开关显示关 | `defaultSessionCuePref` + `readSessionCuePref` 单测 |
| 老用户已开 | 存储里 start/end 为 true | 仍响铃；开关仍显示开 | `normalizeSessionCuePref` 保留 true |
| 老用户已关 | 存储里为 false | 仍静音 | 现有 false 测 |
| 用户当场打开 | 点 Soundscape「计时提示音」 | 0–1s 开关变为开；下一场坐下可响 | 现有 `writeSessionCuePrefEnabled` |
| 间隔 3/5 分 | 总开关关、间隔开 | 仍可按间隔出磬（与现网：总开关管 start/end；实现时单测锁「关 start/end 不等于强关 interval」——若现网 interval 已依赖总开关，本刀**不得**借机改 interval 契约，只改默认） | 单测对照现网 `tickInterval` 门闩 |
| T27 结束句 | Voice announcements 开、铃关 | 可达标后仍可听到结束句朗读；无结束铃 | 不改 `maybeSpeakFocusEndAnnouncement` |
| Breath 短档 | 铃关 | 开始/结束无磬 | 与 Focusing 同一 pref |
| 窄屏 / 宽屏 | 同一 Soundscape 开关 | 无视口分叉 | 变体矩阵记「无分叉」 |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化时：挂起 / 成功 / 失败 |
|---|---|---|
| Soundscape「计时提示音」 | 勾选状态立刻翻转（与现网相同） | 成功：`session-cues.v1` 写开或关；失败/配额：保持屏幕勾选与下次读盘一致的现网吞错（不新加 toast） |
| 坐下 / 达标 | 不新增控件；铃按 pref 响或不响 | 不因本刀写盘 |

本次不新增可点击控件。

## 边缘状态

| 边缘状态 | 预期 |
|---|---|
| 无 localStorage / 隐私模式 | 走默认关；不弹错误 |
| 半残 JSON（缺 start/end 字段） | 缺字段回落 **关**（这是默认变更）；已有布尔值不改 |
| Rise 早退 | 现网不补结束铃；本刀不改 |
| 氛围乐正在播 | 现网 duck 仍只在**真的播铃**时发生；默认关则不 duck |
| 付款 / Support | 不触及 |

## 冲突扫描（`SCENARIO_TESTS.md`）

| 轴 | 判断 |
|---|---|
| 强度 | 默认少一声，比催促弱；用户仍能打开。被动变安静，不重于主动 Recover。 |
| 语气 | 不新增「你应该安静」文案。 |
| 职责 | 只动计时磬默认。不抢 T27 TTS、不抢 T45 藏数字、不抢 Ambient 曲目 opt-in。 |

无未决冲突。相邻：Soundscape 计时提示音行、Focus / Breath 开表关表。

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层。不涉及后台网络。受保护付款路径：**否**。

## 范围（out）

- 不实现 T45 / T47。  
- 不改 T41 置顶、T42 贴边。  
- 不把开始铃与结束铃拆成两把用户开关（现网总开关保持）。  
- 不默认打开间隔磬。  
- 不改结束句 TTS。

## 验收

- `cd focus-tiger && npm run test:smoke`（含 pref 默认 false + 老用户 true 保留）。  
- 单条 e2e：若现有 Soundscape / sit-start 用例断言铃默认开，改为断言默认关或改为「开关可见、冷启动不响」；没有入口则 `n/a` + smoke 子集说明。  
- 手测：清空该 key 后 Sit → 无开始铃；打开开关再 Sit → 有铃。Voice announcements 开、铃关 → 结束句仍可朗读。

## 点头后开工

新 Chat · 旁支 `fix/t39-session-bells-default-off` · 基线 `origin/develop`。口令：「按 T39 Brief 开工」。
