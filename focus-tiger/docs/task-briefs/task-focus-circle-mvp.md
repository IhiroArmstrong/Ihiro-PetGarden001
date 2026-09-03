# Task Brief · Focus Circle MVP（刀 2a）

> **状态（2026-09-04）**：口令「开工 Focus Circle MVP」。权威 `FROM_APP_TO_CULTURE.md` §13.4 刀 2 · §13.5 识别信封。  
> **本文件无 Witness / 圈内 Presence / 昵称徽标 / Echo / Practice Identity 运行时。**

## 一句话

3–8 人安静小圈：Privacy 内建圈或 6 位暗号加入；无聊天；离开即退圈；无账号。与全球 Quiet Together 灯火分层，禁止两套全球房间。

## 已拍板（勿再开放）

1. **表面**：仅 `?` → Privacy 内「Focus Circle」区块；**不**在 Idle 画圈内 presence（属 2b）。
2. **邀请**：6 位暗号（ Crockford 类字符集）；可选深链 `?circleJoin=XXXXXX` 预填加入框。
3. **上限**：每圈最多 **8** 人；满员返回诚实错误，禁止假人数。
4. **身份**：本机 `memberId` UUID；**不是**账号。昵称 / 徽标 / OTP 跨设备 **不在本 PR**。
5. **离开**：用户点 Leave；失败不挡本地清_membership_。
6. **存储**：`TIP_KV` 前缀 `circle:v1:id:` + `circle:v1:code:`（与 `lantern:` / `tip:` 隔离）。
7. **生产**：源码合入 ≠ 现网；须口令「部署」后 Worker 才有 `/api/focus-circle`。
8. **刀 2b/2c 不在本 PR**：圈内模糊 sitting、Gentle Witness、认人层 UI。

## 冲突扫描

对照 `SCENARIO_TESTS` AM（Quiet Together）/ W（Privacy）/ AF（Presence Signals）。

| 轴 | 结论 |
|---|---|
| **a. 强度** | 建圈/加入在 Privacy 内；不比 Sit 重；灯火仍全球层。 |
| **b. 语气** | 观察式；无排行、无离开广播、无聊天。 |
| **c. 职责** | ≠ 全球灯火；≠ Presence Signals（本机练习事实）；≠ Stay in touch。 |

## 后台网络三问

1. **时机**：create/join/leave/status **仅用户点击**触发 → 不涉及后台网络三问。
2. **写盘**：membership 只在成功响应后 `setItem`；同内容跳过。
3. **卡顿**：不 await Sit；失败显示 Privacy 内短句，不挡练习。

## 点击反馈

Create / Join / Leave / Copy：0–1 秒内 disabled 或状态文案变化；错误须可见（非 SB 静默）。

## 不做

- 聊天、精确在线名单、Witness、圈内 Idle 灯火、昵称上传、Circle OTP、假人数
