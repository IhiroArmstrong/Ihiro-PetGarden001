# docs/electron-qa-2026-10-20

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Help Center 问号右侧独立钮 | UI可见 | 有问题 | 本条验收的是「问号 `#onboarding-hint-help` 右边是否另有 Help Center 钮」。现网 Help Center 在 ⋯ → Preferences，以及问号简介卡内 `onboarding-purpose-help-center`。本条不代表 T22 问卡已坏。 | **2026-10-20 用户书面**：Help Center 需要用一个合适的按钮，安插在目前问号按钮右边。 | post-v1 | 搁置 · B 类须 Brief（T26）；本回合不改 chrome | `#onboarding-hint-help` · `#help-center` | 2026-10-20 |
| 练习中停 inhale/exhale 语音 | UI可见 | 待人工测试 | **本条验收的是**练习进行中不再念 Inhale/Exhale，**不代表**关掉全部 Voice announcements。Voice announcements 开、宽屏 Electron。Arrival / Honesty / Ritual / MicroRitual 中间安静；Sit 结束句、仪式完成句等其它播放仍可。画面吸呼字可仍在。**自动化**：`systemTtsAnnouncements.test.js` 锁 `maybeSpeakBreathPhaseCue` 返回 false 且不 speak。人只补 Electron 听一声。 | **2026-10-20 用户书面**：任何练习中间都无需语音播放 inhale, exhale。其它播放可以。 | post-v1 | T27 实现旁支 `fix/stop-practice-breath-phase-tts`；合入后按 develop tip 复测 | Arrival / Honesty / Ritual / MicroRitual 呼吸段 | 2026-10-21 |
