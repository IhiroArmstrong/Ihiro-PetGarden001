# feature/focus-circle-mvp

| Focus Circle MVP（刀 2a） | UI可见 | 待人工测试 | **入口**：`?` → **隐私** → Focus Circle（菜单「You are not alone」下一刀）。**A 建圈**：创建圈子 → 暗号 +「圈中 1 人」→ 复制（主屏无变化正常）。**B 加入**：须**另一浏览器/Chrome 用户/Electron 配置**（同浏览器多标签共用 localStorage）；只点**加入**+粘贴暗号。**期望**：A、B 均「圈中 2 人」；A 开着 Privacy 约 5s 内自动刷新。**满 8 人**：不必 8 浏览器——Worker 单测已锁；人工可 2 配置 + 第 9 人 join 验满员文案。**对照**：乱码 / Leave / `?circleJoin=`。**不测**：Idle 圈内表现（2b）。 | 2026-09-04：A 端人数不随 B 加入刷新；同意菜单分组 You are not alone | — | — | `fix/focus-circle-status-poll` | 2026-09-04 |
