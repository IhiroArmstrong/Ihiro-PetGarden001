# HONESTY_BRIDGE_CTA.md — Honesty Check-in 桥接 CTA 定稿

创建日期：2026-07-19  
最后更新：2026-07-19（用户拍板：立刻出桥接 + Welcome 同屏一小会儿；同日可多次补登）

---

## 一、拍板结论：加桥接，非合并

- **不采纳**：把 Honesty Check-in 本身改造成"选完时长直接开始计时"——这会
  混淆"补登已经在别处做过的练习"和"现在开始一次新的实时会话"这两件语义
  不同的事，破坏 Honesty Check-in 原本"仅补登、不计时"的定稿边界。
- **采纳**：补登仪式走完之后，单独出现一句轻量邀请，接受后进入**正常的**
  Arrival Practice → Companion Mode 流程，不跳过 Notice/Choose 直接开表；音乐
  是否播放仍由用户在 Ambient Soundscape 面板自己决定。

---

## 二、交互细节

- **出现时机**：补登呼吸/坐起结束 → **立刻**出桥接（不空等 3.2s）。
  Welcome 文案（「欢迎回来。阿寅醒来了。」 / `HONESTY_CHECKIN_THANKS`）作为桥接
  面板顶部轻量回显，与邀请同屏一小会儿——可称 Welcome 条，勿依赖单独 thanks 相位。
- **文案**：中文「要不要现在也坐一会儿？」/ EN: "Want to sit for a bit now too?"
- **两个选项**（Yes / No 同级）：
  - Yes → 完整 Arrival Practice → Companion Mode（不跳过、不直接开表/Ambient）
  - No / 忽略 → idle，无二次挽留
- **频率**：**每次**补登完成后都可出现（**不限**当日一次）。

### Honesty 同日多次补登（2026-07-19 拍板 B）

- **首次零完成**：仍自动 DORMANT + 可忽略「别处修行了吗？」提示。
- **当日已有完成**：不再自动弹睡觉提示；空闲显示安静入口 **Mindful Check-in /
  正念登入**（`HONESTY_IDLE_ENTRY`），可再开时长三选一。
- **同日再补登**：不切回睡态、不播 `dormantWake`；只走时长 → 呼吸引导 → 记账 → 桥接。

---

## 三、明确排除的做法

- 不做成"选完时长直接开始计时"。
- 不做拒绝后的追加挽留。
- 不做 Yes/No 视觉权重不对等。

---

## 四、实现落点

- `HonestyBridgeCtaController` / `HonestyBridgeCtaUI`（Welcome + 邀请同面板）
- `HonestyCheckInController.syncIdleEntry` + `#honesty-idle-entry`
- 定稿边界见 `PRODUCT_MOMENTS.md` Arrive；测试见 `TEST_TRACKER.md`
