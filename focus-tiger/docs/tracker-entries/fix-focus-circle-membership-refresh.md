# Tracker fragment · fix/focus-circle-membership-refresh

| Focus Circle 成员态轮询互踩（拷贝提示 / Start 卡死 / Leave 闪 / 人数 1↔2） | UI可见 | 待人工测试 | **主路径**：Electron + 另一 Safari，同一六位码。Start a circle → 短时间内见暗号+人数，按钮恢复可点。Copy → 1 秒内见 copied，窗口再点一下仍在。对面加入后人数稳定为 2，不得久闪 1↔2。**回流**：Leave → 回到未入圈；再 Join 同码 → 稳定已加入（暗号+人数+Leave）。故意断网或慢网点 Start → 约 12 秒内失败句，可再点。测本旁支预览，勿与 5173 QA 树混用。 | 2026-09-17 用户书面：图4 Copy 无提示；图5 Start 只有等待；图6 Leave 闪后再加入不像已加入；人数 1↔2 久闪。 | release-blocker | 本支修成员态 generation/seq、禁止 refresh 清提示、mutation 超时。Witness 429 / 日语 / 收藏叠层另刀。禁止本碎片标已通过。 | `fix/focus-circle-membership-refresh` | 2026-09-17 |
