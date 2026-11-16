# feature/t95-developer-id-signed-probe

| 功能 | 类型（UI可见 / 纯后端） | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| 本机有 Developer ID 时，试包用正式身份签，并核对硬化运行时后模型库仍能加载 | UI可见 | 待人工测试 | **主路径：** `npm run prep:sign-notarize-staple`（或分步见 [`t95-desktop-release-week-checklist.md`](../t95-desktop-release-week-checklist.md)）。**钥匙串：** 叶子证书须「使用系统默认」。**公证：** App Store Connect API 密钥 → 档案 `samatia-notary`（`.p8` 不进仓）。**贴票：** `xcrun stapler`（CLT 即可）。**禁止**临时 ad-hoc 签整包。 **2026-11-16 彩排：** Accepted `600e233b-a522-4e2f-8624-965026126752`；贴票后 `guiProcessLoaded=true`。**仍不是** 存桶对客包。 | 2026-11-16 用户：信任默认 + API 密钥公证。 | — | — | `focus-tiger/desktop` · `release/mac-arm64/Samatia.app` | 2026-11-16 |
