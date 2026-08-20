# Task Brief · Companion 一句话 + 冷启动 30s/3min 验收脚本

> **状态（2026-08-20）**：#379 已合 tip `5352356`。用户书面：三句 hint **先按现稿**；人工测 How shall we sit? 时看语感；再改只动 locale `COMPANION_MODE_*_HINT`，不必重开门闩/开表逻辑。  
> **分支**：`cursor/companion-mode-copy-coldstart-8475`（代码）· `cursor/companion-hint-copy-lock-8475`（拍板记入）

## 产品规则

| 项 | 口径 |
|---|---|
| **模式卡 hint** | 只改 `COMPANION_MODE_*_HINT` 三句；标题 Here & Now / Offline Space / Flow State **不变**。现稿已合入；后续语感只动 locale |
| **语感** | 结缘 / 静舍：邀请、观察、不问；禁止说明书腔（Keep this screen / Minimize / 分心 / distraction） |
| **不复活** | Onboarding auto tip（**SB-15**） |
| **30s / 3min** | **验收脚本**，不是新功能。3 分钟闭环用已有 `?sessionMinutes=1` Sit（默认 10 分档不改）。**不**把 nod-bow 塞进 3 分钟必测 |

## 已好清单

- Companion 点选开表 / Offline 跳过 Arrival / 回流门闩 **不变**
- `spriteChannelArbitration` **不碰**
- 切走轻语仍收回（场景 B 经典 Re-focus）
- 默认 Focus 最短/默认仍 **10** 分钟

## 明确不做

- 回访 60s 内 glow pulse
- 菜单薄荷绿脉冲
- 新触发逻辑 / 新门闩
- 为改 hint 字重开 Companion 点选/门闩（用户 2026-08-20：再改只动 locale）
