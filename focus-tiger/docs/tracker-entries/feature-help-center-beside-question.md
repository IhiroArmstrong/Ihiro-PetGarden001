# feature/help-center-beside-question

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Help Center 问号右侧钮 | UI可见 | 待人工测试 | **宽屏 ≥480 `?product=1`**：Idle 左下问号右边见暖米圆钮（书形标，`[data-testid=idle-help-center-beside]`）。点它 → **0–1 秒内**见 `#help-center` 目录，简介卡不开。点问号仍只出简介。已开简介再点新钮 → 简介关、帮助中心开。已开帮助中心再点问号 → 帮助中心关、简介开。已开帮助中心再点新钮 → 保持打开，不关不叠。Esc 关当前唯一一层。⋯ Preferences Help Center 行仍可打开同一张卡。**375**：ActionBar 问号右边 `#ft-narrow-help-center-btn` 同样打开。**回流**：关帮助中心后再点新钮仍开。e2e：`help-center-beside-question.spec.js`。 | — | — | — | `?product=1` · `#onboarding-hint-help` · `[data-testid=idle-help-center-beside]` · `#help-center` · 375 `#ft-narrow-help-center-btn` | 2026-10-21 |
