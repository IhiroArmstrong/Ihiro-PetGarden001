# Task Brief · A′ · Moment Whisper +「?」桥接加固

> **状态（2026-08-09）**：**已合** develop（#203）。  
> **父决策**：`task-five-moments-surface-plan.md`（§三 万全之策）。  
> **前置**：`task-five-moments-compass-b.md` 已合（#201）。

## 目标

即使用户从不打开 Settings，也能在**真实经历**各 Moment 时，用极轻量方式「认出」框架；并保证「?」是稳定补救入口。

## 范围

1. **Moment Whisper UI**：阿寅旁一行观察句；3–4s 淡出；可点关；**非**顶部 Banner。  
2. **Store**：`focus-tiger.moment-whispers-seen.v1`（或等价）按 Moment 键：`arrive` / `focus` / `recover` / `transition` / `reflect`。  
3. **触发映射（已有实体）**：  
   - `arrive`：进入 Arrival Practice（Sit 后欢迎/Notice 可见）首次  
   - `focus`：进入 Focusing 首次（一生一次）  
   - `reflect`：Reflection Moment 打开首次  
   - `recover` / `transition`：**仅登记**；主动 Recover / Transition 产品入口上线前 **永不 play**  
4. **互斥 / suppress**：与 `setPostSessionOverlayActive`、Arrival、Honesty、Companion、微仪式、Celebrating 忙态互斥（busy → 不出）。  
5. **「?」**：确认 purpose 含 Moments 段 + Compass 次要链（若 B 已做则本任务只补回归锁，不重做文案大改）。  
6. i18n en+ja（zh draft 可同步）。

## 不做

- 复活 auto tip 喷洒 / More tips  
- Focusing 期间重复 Whisper  
- 5-Dot 罗盘  
- 教导式「Moment of X · you should…」标题党  

## 验收

- 主路径：清空 whispers → Sit→Arrival 见 Arrive whisper 一次 → Focusing 见 Focus whisper 一次 → Reflection 见 Reflect 一次；再走同路径 **不再**出。  
- 回流：叠层打开时不出；关闭后再进未读 Moment 仍可出。  
- Focusing：第二次专注会话无 Whisper。  
- 「?」仍 only purpose（不喷 tips）；可进 Compass。  
- 单测：seen 门闩 + busy suppress；可选 e2e 单 spec。

## 文档

- `ONBOARDING_HINTS.md` 指针：Whisper ≠ Hint auto  
- `PRODUCT_MOMENTS` §5.6  
- `SHARED_RESOURCES` / `TEST_TRACKER` / `HINTS_WIRING` 一句边界
