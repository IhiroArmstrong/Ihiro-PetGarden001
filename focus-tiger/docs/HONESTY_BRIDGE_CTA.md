# HONESTY_BRIDGE_CTA.md — Honesty Check-in 桥接 CTA 定稿

创建日期：2026-07-19

---

## 一、拍板结论：加桥接，非合并

- **不采纳**：把 Honesty Check-in 本身改造成"选完时长直接开始计时"——这会
  混淆"补登已经在别处做过的练习"和"现在开始一次新的实时会话"这两件语义
  不同的事，破坏 Honesty Check-in 原本"仅补登、不计时"的定稿边界。
- **采纳**：补登仪式（10秒呼吸引导 → dormantWake 动作）走完之后，单独出现
  一句轻量邀请，接受后进入**正常的** Arrival Practice → Companion Mode 流程，
  不跳过 Notice/Choose 直接开表；音乐是否播放仍由用户在 Ambient Soundscape
  面板自己决定，不因为点了这个 CTA 就自动开启。

---

## 二、交互细节

- **出现时机**：dormantWake 动作播完、DORMANT 状态清除之后，紧接着出现，
  不是弹窗打断，是同一非模态文案条样式的延续。
- **文案方向**（初稿，需过观察式四项自检）：
  中文："要不要现在也坐一会儿？" / EN: "Want to sit for a bit now too?"
- **两个选项**：
  - Yes → 直接进入正常的 Sit with Yin 触发链路（Arrival Practice 完整走一遍，
    不跳过任何步骤）
  - No / 忽略 → 直接回到 idle-breathing，不追加任何形式的二次挽留或稍后提醒
- **视觉权重**：Yes 和 No 必须同级（参考 Reflection 三问 Skip/Continue 同级
  按钮的既有模式），不做主次强调。
- **频率限制**：每次 Honesty Check-in 完成后最多出现一次，不管选 Yes 还是 No，
  当天不再重复弹出这个桥接邀请（即使用户当天又触发了别的 DORMANT 相关流程，
  这个 CTA 也不重复）。

---

## 三、明确排除的做法

- 不做成"选完时长直接开始计时"（原始提议里"Yes 则音乐/timer 直接激活"的
  简化版本不采纳，必须经过正常 Arrival Practice）。
- 不做拒绝后的追加挽留（不二次弹出、不当天稍后提醒）。
- 不做 Yes/No 视觉权重不对等的设计。

---

## 四、Cursor 实现 Prompt

```
在 Honesty Check-in 的 dormantWake 动作播放完成、DORMANT 状态清除之后，
新增一个桥接邀请 CTA：

1. 展示时机：dormantWake 播放完成的下一拍，非模态文案条样式（复用现有
   MindfulAcknowledgeToast 或同级组件），不是弹窗。
2. 文案："要不要现在也坐一会儿？"/"Want to sit for a bit now too?"，接入前
   需过 EMOTION_BIBLE 四项观察式自检。
3. 两个选项视觉权重相同（参考 Reflection Skip/Continue 同级按钮样式）：
   - 选 Yes：进入正常的 Sit with Yin 触发链路，完整走 Arrival Practice
     （Notice → 呼吸 → Choose）→ Companion Mode → 计时开始，不允许跳过
     任何环节直接开始计时。
   - 选 No 或忽略：直接回到 idle-breathing，不触发任何后续提醒或二次弹出。
4. 频率限制：每次 Honesty Check-in 完成后最多出现一次，当天不重复弹出，
   与用户选择 Yes 或 No 无关。
5. 严禁实现"选完时长直接开始计时"的简化版本——Honesty Check-in 本身的
   补登边界不变，这个 CTA 是独立的、可拒绝的邀请，不是 Honesty Check-in
   流程的一部分。
6. 补充单元测试：CTA 只在 dormantWake 完成后出现一次；选 No 后当天不再
   出现；选 Yes 后正确进入完整 Arrival Practice（不跳过 Notice/Choose）。
7. 更新 TEST_TRACKER.md 新增此项为待人工测试；更新 PRODUCT_MOMENTS.md
   中 Arrive 相关小节，补充这条桥接逻辑与 Honesty Check-in 的边界说明。
```
