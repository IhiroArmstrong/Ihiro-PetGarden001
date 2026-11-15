# Tracker fragment · feature/chat-with-yin-consent

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Chat with Yin 改名 + 首次强制同意 | UI可见 | 待人工测试 | **英文 Idle**（`?product=1`，宽屏）。⋯ 或耳朵打开倾诉：0–1 秒内先见 `[data-testid=confide-consent-modal]`，输入框不可用。点遮罩不关进聊天。不勾全点同意 → 红字仍停在框内。三项勾选后点同意 → 框关、可输入发送。点暂不使用或 Esc → 卡关、下次仍要勾选。Privacy sheet 见 Chat with Yin 一节。日语界面入口仍隐藏。危机区无 988 等号码。单测：`confideConsent.test.js`。 | — | — | — | feature/chat-with-yin-consent | 2026-11-15 |
