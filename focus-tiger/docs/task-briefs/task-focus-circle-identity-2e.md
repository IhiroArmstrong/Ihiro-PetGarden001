# Task Brief · Focus Circle Identity（刀 2e · 认人层）

> **状态（2026-09-07）**：口令「开工 2e」。权威 `FROM_APP_TO_CULTURE.md` §13.5 · §13.4 刀 2 信封（**2d → 2e**）。  
> **本文件无** 跨设备 OTP 绑定、头像上传、自由简介、圈内聊天、was-here 精确榜。

## 一句话

入圈用户可在 My circle 面板设 **可选限长昵称** + **预设 Tiger/Yin 徽标**；Witness Idle 痕迹文案由「一位同伴」改为 **昵称（可本机隐藏回匿名）**；不扩 2d 布局、不暴露 `memberId`。

## 已拍板（勿再开放）

1. **信封四条**（§13.5）：**不做**头像上传 · **不做**自由简介 · 跨设备 **仅**复用现有邮箱 OTP（**不在本 PR**） · 审核 = **本机隐藏**昵称 → 显示「一位同伴」。
2. **表面**：My circle 面板内编辑；Witness Idle 行 **只改文案**（`{name}` 占位）；**不**为 2d was-here 加名单/头像槽。
3. **匿名默认**：未设昵称 / 本机 hidden / 对方未设 → locale 冻表 `FOCUS_CIRCLE_IDENTITY_ANON_LABEL`（与 2c「一位同伴」同档）。
4. **昵称**：trim · **1–16** 字符 · 禁止控制字符 · Worker 白名单校验；空 = 清除昵称。
5. **徽标**：仅 `tiger` \| `yin` \| 空；面板内三选一；Idle Witness **可选**前缀字符（不增 DOM 块级布局）。
6. **API**：`identity_set` · `witness_peek` 合并返回 `identities` + 每 trace `authorMemberId`（客户端 **不**渲染 UUID）。
7. **存储**：`TIP_KV` `circle:v1:identity:{circleId}`；本机 `focus-tiger.focus-circle-identity.v1`（草稿）+ `focus-tiger.focus-circle-identity-hidden.v1`（按圈 hidden 集）。
8. **Kill switch**：`?focusCircleIdentity=0`；`?focusCircle=0` 仍总关。
9. **生产**：源码合入 ≠ 现网；须口令「部署」后 Worker 才有 identity actions。
10. **2d 被动开关**：Witness 认人 **不**再开第三个隐身开关；was-here 仍用既有 passive share。

## 冲突扫描

对照 `SCENARIO_TESTS` AP（Witness）· AQ（was-here）· AN（圈管理）。

| 轴 | 结论 |
|---|---|
| **a. 强度** | 昵称在已开的 My circle 面板；不比 Sit 重；Idle hide 一键。 |
| **b. 语气** | 仍观察式；禁止排行榜/精确在线。 |
| **c. 职责** | ≠ was-here 计数（AQ）；≠ sitting dots（AO）；只改 Witness 展示名。 |

## 后台网络

`identity_set` **仅用户点 Save**；`witness_peek` 与 2c 同 Idle observer → **不涉及**新后台拉取三问。

## 点击反馈

Save → 0–1s disabled + 状态文案；Hide name → 立刻回匿名文案；Save 失败见面板短句。

## 不做

- OTP 跨设备、头像上传、自由简介、聊天、精确榜、Focusing 内 UI、memberId 展示、主动审核管线

## 验收场景（AR · 开工后写入 SCENARIO_TESTS）

1. A 设昵称「Kai」+ Tiger 徽标 → Save → B 见 Witness 痕「Kai…」非「一位同伴」。  
2. B 点 **Hide this name** → 该 `authorMemberId` 本机 hidden → 回匿名；A 仍见 B 昵称（若 B 有设）。  
3. A 清昵称 Save → B 见匿名。  
4. `?focusCircleIdentity=0` → 全员匿名（仍可有 Witness 痕）。  
5. 与 AQ 并存：was-here 仍无昵称；Witness 可有昵称。
