# feature/t95-developer-id-signed-probe

| 功能 | 类型（UI可见 / 纯后端） | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| 本机有 Developer ID 时，试包用正式身份签，并核对硬化运行时后模型库仍能加载 | UI可见 | 待人工测试 | **主路径：** `pack:prep` 在钥匙串有 Developer ID Application 时不再关掉自动发现。打出的 `Samatia.app` 身份是 Developer ID，带 runtime 标志；真界面进程加载已固化模型库。**钥匙串：** 该证书须「使用系统默认设置」，不要勾成「始终信任」，否则 codesign 会报无法连到根。**公证：** 用 App Store Connect API 密钥存进 `notarytool` 档案 `samatia-notary`（密钥文件不进仓库）。没有受理成功不得写成客户安装包已验证。**禁止**对整包做临时签名。 **2026-11-16 本机：** 信任改回默认后，签名试包 `guiProcessLoaded=true`、`developerIdSigned=true`、`hardenedRuntimeVerified=true`、Electron 45.3.1 / Node 24.22.2 / ABI 150。`codesign --verify --deep --strict` 通过。Gatekeeper `spctl` 曾为 Unnotarized Developer ID。本机无完整 Xcode，`stapler` 不可用。 | 2026-11-16 用户书面：信任已改回系统默认；改用 App Store Connect API 密钥（App 管理 · SamatiaKey），`.p8` 在本机、不入仓。 | — | — | `focus-tiger/desktop` · `release/mac-arm64/Samatia.app` | 2026-11-16 |
