# Task Brief · Help Center 设备访问 + Apple Health 诚实说明

> **状态（2026-11-12）**：PO 书面「现在立项：纯文案 B 类」— **已锁**  
> **分支**：`feature/help-center-platform-health`  
> **类**：B（用户可见帮助正文 + 问号简介一小块）

## 一句话目标

把「iPhone/iPad Safari、无 App Store 壳」与「Health 只写不读、Shortcuts、§5.3 平台边界」写成 Help Center 两篇短答；Web 问号卡只加**非 Electron** 可见的一小块摘要，不改成说明书。

## 拍板

| 项 | 口径 |
|---|---|
| Help Center | 新增 `HELP-DEVICES-SAFARI`（start）· `HELP-APPLE-HEALTH-LOG`（data） |
| 问号「?」 | 仍只出简介卡；**新增** Web 专用块（与 desktop RAM 对称：`!isDesktopShellRuntime()`） |
| Confide 检索 | 不进 `productKnowledgeCatalog.json`；问卡 alias 文件锁检索 |
| Health 运行时 | 本刀**不**接结束钮；文案与 [`task-deep-link-shortcuts-cookbook.md`](./task-deep-link-shortcuts-cookbook.md) §5.3 对齐 |
| 变体矩阵（A10） | 触及 en/zh/ja · 宽 Web / 窄 Web / Electron（Electron 不显示 Web 块） |
| 点击反馈（A14） | 不涉及新可点击控件；问号块为只读文字；既有 Help Center 链不变 |

## 冲突扫描

- **场景 W / AX**：简介不叠长文；用户点已有 Help Center 链 → 0–1s 见目录 → 可点新篇。**无职责重叠**。
- **场景 Q（Health PR #1688）**：文案先于或并行功能 PR；不写「已可记入」若 develop 尚未接线。**无强度错位**。

## 明确不做

- 不改 Health 偏好 UI、不增 Preferences 行  
- 不把 Confide 短答库扩容为长 Health 稿  
- 不在问号卡加第二条 Health 专用按钮（摘要句指到 Help Center）
