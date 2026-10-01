# Tracker fragment · fix/circle-safari-identity-membership

| Safari My Circle 昵称 Saving 卡死 + 重复 Join 涨人数 | UI可见 | 待人工测试 | **主路径**：Safari（非 Electron）打开 My circle → 已加入 → 输入昵称点 Save circle name → 12 秒内见 Saved 或明确失败句，不得永久 Saving。**回流**：Join 六位码 → 见暗号+人数；关面板再开仍已加入；不得因本地存不住而反复 Join 同一码涨人数。**存储失败**：Safari 无痕/配额满时应见明确错误，不得假成功。 | 2026-09-17 用户书面：Safari 保存昵称一直 Saving；粘贴 Electron 码 Join 后很快又要录入，同用户重复 Join 人数一直涨。 | release-blocker | 修 identity_set API 调用、join 本地持久化校验、Saving try/finally。Electron+Safari 同码复测。禁止本碎片标已通过。 | `fix/circle-safari-identity-membership` | 2026-09-17 |
