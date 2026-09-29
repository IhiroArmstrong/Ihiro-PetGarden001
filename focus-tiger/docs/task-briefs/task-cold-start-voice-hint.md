# Task Brief C · Cold-start Voice Hint（冷启动导航文案）

> **状态**：口径已对齐（2026-09-28）。**禁止在 Brief B Slice 1 实测通过之前上线任何提示。** 本回合无运行时。

## 已拍板

| 项 | 口径 |
|---|---|
| 语言 | **纯英文**。不使用「I need 番茄钟 开始专注」这类中英混写。 |
| 来源 | 每一句必须来自 Brief B 的 golden set，并且实机听写能识别。 |
| 露出 | Electron / macOS 宽屏，且英语界面，且命令入口已可用。日语界面、Web、窄屏不显示。 |
| 形态 | 导航区一行静态字。不弹窗、不遮罩、不发声。显示提示不等于请求麦克风。 |
| 收起 | 成功用语音发出一次命令后不再出现；也可手动关闭。 |

## 现网核对（2026-09-28）

冷启动导航不是一句空位。现有 hint 注册在 `onboardingHintRegistry.js`：

- `sit-button` / `quick-start` 锚在 `#btn-focus`、`#quick-start-focus`
- 英语 `HINT_QUICK_START` 现文是 Breath practice，不是语音示范
- 场景 V 是冷启动欢迎（Day1 / 久别），场景 A 是全新用户 Idle

语音提示应是**新的一行**，条件与麦克风相同。不得叠在睡态或唤醒动画上（场景 AD 的睡态纪律仍有效）。具体锚点留到 C 的 Slice 1，且必须等 B 的句式实测通过。

## 文案候选（先不放进 locale）

| 编号 | 文案 | 对应句式 |
|---|---|---|
| C1 | Try saying "Start a 25-minute focus." | Start a 25-minute focus |
| C2 | Try saying "I need to focus for an hour." | I need to focus for an hour |

我认为最合理的是 **只放 C1**：它是最短、且会直接开始 25 分钟，不会先掉进追问。C2 留作轮换候选。C3「Start a pomodoro」、C4「Start focusing」先不放——后者会追问，不适合当第一句示范。

## 仍待拍板

自动收起：成功一次就收，还是再加「最多 3 次冷启动」。我认为最合理：**成功一次就收**；3 次只是没人用语音时的兜底，可以后补，不必挡第一句。

## 明确不做

中英混合；多句同时展示；教程遮罩；提示阶段就要麦克风；解析器未上线先放提示。
