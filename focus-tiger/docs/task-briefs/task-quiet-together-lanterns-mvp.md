# Task Brief · Quiet Together ∪ Global Lanterns MVP

> **状态（2026-09-04）**：口令「开工 Quiet Together / Global Lanterns MVP」。权威 `FROM_APP_TO_CULTURE.md` §13.4 刀 1 · `PROCESS.md` Backlog「异步无声共修」。  
> **本文件无 Circle / 聊天 / Practice Identity / Echo 运行时。**

## 一句话

匿名同坐：开启专注即点灯；Idle / Arrive 背景可见诚实人数或灯火；可关；结束离开；不聊天。与灯火共用一套 presence，禁止两套全球房间。

## 已拍板（勿再开放）

1. **第一刀表面**：只 Idle / Arrive。Focusing 内不画灯火（可另评抢戏，不作文化永久封死）。
2. **诚实**：无云 / 失败 / 人数为 0 → **不画**，禁止假人数。
3. **可关**：Privacy 开关；默认开；关闭后既不贡献也不看见。`?quietTogether=0` 研发关。
4. **身份**：随机会话 UUID，不是账号。禁止邮箱 / 昵称 / 头像。
5. **离开**：Rise / 完成 / 关开关 / `pagehide` / TTL 120s。
6. **存储**：`TIP_KV` 前缀 `lantern:v1:live`（与 `tip:` / `funnel:` 隔离）。不新建 KV 绑定。
7. **生产**：源码合入 ≠ 现网。须用户口令「部署」后 Worker 才有 `/api/lantern-presence`。
8. **刀 2 不在本 PR**：Circle 暗号、轻量识别层、Witness、Echo、Practice Identity。

## 冲突扫描

对照 `SCENARIO_TESTS` Arrival / Idle 呼吸眨眼 / Focusing HUD / Privacy / Presence Signals / Stay in touch。

| 轴 | 结论 |
|---|---|
| **a. 强度** | 灯火 `pointer-events: none`；不比 Sit 更重。Privacy 多一个开关，与漏斗/YPE 同级。 |
| **b. 语气** | 观察式短句；无排行、无离开广播。 |
| **c. 职责** | ≠ Presence Signals（本机练习事实）；≠ Stay in touch（邮箱）；≠ 品味层句包；≠ Confide。 |

## 后台网络三问

1. **时机**：Idle/Arrive peek 推迟 2.5s；Honesty / Reflection / Focusing 为 busy（Arrival 开着仍允许 peek，因为 Arrive 是展示面）。Heartbeat 在 Sit 后 2.5s 才发，不挡呼吸第一拍。
2. **写盘**：人数未变不刷新 DOM；偏好只在用户拨开关时 `setItem`。
3. **卡顿**：`postCloudJson` 不 await Sit；失败隐藏灯火。慢网 Idle 呼吸仍须人工。

## 点击反馈

Privacy 开关：0–1 秒内勾选状态切换；关则灯火立刻消失并 leave。灯火本身不可点（`pointer-events: none`，非 SB 静默按钮）。

## 不做

- Focusing 内背景灯火、涟漪轻触、聊天、精确在线名单、假人数、Circle、账号
- 为 Circle 另造 OTP
- 未口令 Redeploy 生产 Worker
