# LIGHT_PROGRESSION_DESIGN.md — 光影的物理苏醒（2D 翻译版）

创建日期：2026-07-18　最后更新：2026-07-18（Cursor Prompt 已实现 · `LightProgression`）
来源：外部提案《通过 3D 相机镜头的推拉与光影的物理苏醒做多维视觉外显》，因原方案基于
3D 相机/Shader 实现，与 2026-07-15 已定的"2D 主线、3D 仅奖励柜"技术路线冲突，本文档
保留设计意图，将实现介质翻译为 2D + CSS/DOM，供 Arrival Practice 与 Recover 使用。

**实现落点**：`src/effects/LightProgression.js`；Arrival 经 `ArrivalPracticeUI` 钩子接线；
Recover 挂在 `MindfulReminderController` 的 `refocus` 展示回调上；日常 `focusLevel`
经主循环 `updateFocusGlow` 驱动 DOM Rim。原则边界已写入 `PRINCIPLES.md`「光影物理渐进原则」
与 `ARCHITECTURE.md`「2D 主线的金色进度表达」。增强细则见
`task-briefs/task-light-progression-parallax-rim.md`（视差 Dolly + 4s 呼吸 + DOM Rim）。

---

## 一、核心原则（可推广，见第四节）

**用光影/环境的物理渐变外显内在状态，而非文字说明或数值进度条。** 这条原则和实现
介质无关，2D 层同样适用，且和项目已确立的"金色 Rim Light 是外围叠加层，角色本体
固有色不变"原则天然兼容——因为现有 Rim Light 本来就是 DOM/CSS 叠加层，不是 3D
Shader，这次只是把"渐变"这个时间维度加进去。

---

## 二、Arrival Practice 的光影渐进

| 阶段 | 视觉变化 | 实现方式 |
|---|---|---|
| Welcome/Notice | 背景冷灰色调；用户点选状态图标后，背景微微泛暖 | 背景容器 CSS 渐变色 transition，点选事件触发一次颜色过渡（约1-2秒） |
| 呼吸 beat | 画面轻微"推近"感（三层视差）；呼吸律动时光环虚影随吸气/呼气明暗 | 背景层 `scale→1.06`、Yin `#sprite-overlay` `scale→1.12`（UI 不缩放）；外围 DOM 光环 **4s** 周期脉动（不染皮毛） |
| Choose 确认 | 角色脚下坐垫处轻轻亮起一圈光；角色播合十 `intentionSet` | 坐垫 CSS 光晕（`LightProgression.onChooseConfirmed`）与 `palms-together` **叠加保留**——氛围层 + 动作层分工；跳过 Choose 时两者均不触发 |

以上均为氛围层，不影响 Arrival Practice 已定的跳过机制、数据存储规则（见
ARRIVE_MOMENT_DESIGN.md），纯视觉增强，不改变交互逻辑。

### 日常 FOCUSING 的 DOM Rim（2026-07-18 增强）

- `#light-progression-rim`：挂在 `#app`、位于 sprite 之下的外围金晕；`opacity` 随
  `visualLevel`（含 presenceBoost），并叠加 4s 呼吸调制。
- 叙事烧录动画播放期仍归零（主循环已用 `shouldSuppressRuntimeGlow`）。
- `FocusVisualizer`（Three 粒子）仍每帧更新以保留奖励柜/3D 路径，但 **2D 主线主观感以 DOM Rim 为准**；不引入双套 rim PNG、不引入 GSAP。

---

## 三、Recover 的"温柔接纳"光影

用户离开页面超过一定时长（沿用 Re-focus Acknowledge 现有的 60 秒阈值，不采用
提案里的 30 秒，保持和现有阈值一致，避免多一套数字）后返回：

1. 现有 Rim Light DOM 叠层短暂出现"扰动"效果——CSS animation 做一次轻微的
   透明度/滤镜波动（不需要真实水波 Shader，视觉上"像涟漪"即可，成本是一段
   CSS keyframes）。
2. 亮度短暂下降约 20%，配合现有 Re-focus Acknowledge 非模态文案条一起出现。
   **文案定稿**：初稿 "You're back. It's okay, let's settle down again." 未过
   EMOTION_BIBLE 四项观察式自检（含安慰评价 + 建议口吻），**不采用**；继续使用既有
   `REFOCUS_ACKNOWLEDGE` 观察式文案池。
3. 用户停留页面 5 秒后，扰动效果平复，Rim Light 恢复原亮度——用一个简单的
   timer + CSS transition 即可，不需要检测用户"是否真的安定下来"这类复杂状态。

这套效果挂在**现有 Re-focus Acknowledge 触发链路上**，只是给它加一层视觉，不新增
触发逻辑、不影响 CORE_LOOP.md 里已定的"welcomeBack 不算 Recover"边界。

---

## 四、是否推广为通用设计方法：有条件采纳

"用光影物理渐变外显状态"这个原则本身值得写进设计规范，供以后新场景复用，但要
明确边界，避免以后又有人拿着 3D 方案来对不上技术路线：

**采纳为通用方法**：
- 状态变化优先用环境光/色调/透明度的连续过渡表达，而不是弹窗、数字、进度条。
- 所有实现默认基于 2D DOM/CSS 叠加层，复用 IncenseGreeting/FocusVisualizer 已有的
  叠层模式，不引入新的渲染技术栈。

**不采纳/需要明确排除**：
- 任何要求"实时 3D 相机控制""Shader 场景渲染"作为主界面交互的提案，除非未来
  技术路线再次变更为 3D 主线（当前无此计划），否则一律先翻译成 2D 等效方案
  再评估，不直接按 3D 方案排期。

建议把第四节这两条原样补进 PRINCIPLES.md 或 ARCHITECTURE.md，作为以后评估类似
外部提案的检查清单，避免每次都要重新发现"这是 3D 方案，但我们是 2D 主线"这个
冲突。

---

## 五、Cursor 实现 Prompt

```
基于 LIGHT_PROGRESSION_DESIGN.md，为 Arrival Practice 和 Recover（Re-focus
Acknowledge）增加光影渐进的视觉层，均为 2D DOM/CSS 实现，不引入 3D 相机或
Shader：

1. Arrival Practice 三处氛围效果（见设计文档第二节）：
   - Welcome/Notice 背景色随点选状态过渡（冷→暖）
   - 呼吸 beat 期间角色容器轻微 scale 过渡，配合 FocusVisualizer 占位光效
     透明度随呼吸周期脉动
   - Choose 确认瞬间：坐垫处一次性 fade-in 光晕（复用 IncenseGreeting 叠层手法）
     **与** `intentionSet`（`palms-together`）角色合十**叠加保留**；跳过 Choose 时两者均不触发
   均为纯视觉增强，不得改动 Arrival Practice 已定的跳过机制、数据存储规则、
   触发时机。

2. Recover（Re-focus Acknowledge）光影效果（见设计文档第三节）：
   - 触发时机沿用现有 60 秒阈值，不新增 30 秒这套数字
   - 返回时 Rim Light DOM 叠层做一次 CSS keyframes 扰动+约20%亮度下降，
     5 秒后自动平复，与现有非模态文案条同时出现
   - 文案 "You're back. It's okay, let's settle down again." 接入前过
     EMOTION_BIBLE 四项观察式自检，不要直接使用未过检的初稿

3. 不要引入新的渲染依赖（Three.js 相机系统、Shader），全部效果用现有 CSS/DOM
   能力实现；如某个效果确实做不到 2D 等效，请先反馈说明，不要自行改用 3D 方案。

4. 更新 PRINCIPLES.md 或 ARCHITECTURE.md，补充"光影物理渐进"作为通用设计
   原则及其边界（见设计文档第四节），供以后评估类似提案时复用。

5. 更新 CORE_LOOP.md / ARRIVE_MOMENT_DESIGN.md 中 Arrival Practice 和 Recover
   小节，注明视觉层已接入光影渐进效果。
```
