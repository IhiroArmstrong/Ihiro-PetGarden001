# feature/c3-reflection-cta-tier

| Reflection CTA 分层（C.3） | UI可见 | 待人工测试 | **主路径**：`?product=1` → Sit → Rise → `#tiger-reflection-moment` 出现 → **Continue** 为暖色 Primary pill；**Skip** 为无框文字链；**Skip all** 在卡片右上角小号 Tertiary 文字（不与 Skip/Continue 同一行）。**行为不变**：Skip 跳本题、Skip all 进 Wisdom 着陆、Continue 提交/关场；Esc 仍整场划过；零劝导文案。**375**：三控件可点、不挡 mute。**回流**：Wisdom 着陆期只留 Continue；Honesty 桥接 Yes/No **未改**。自动化：`TigerReflectionMoment.test.js` C.3 结构断言 + `e2e/reflection-intention-echo.spec.js` + `e2e/calm-action-reflect.spec.js`。 | — | — | — | `#tiger-reflection-moment` · `/?product=1` · 375×667 | 2026-09-13 |
