# PRD：呼吸调频组件（Breath Pacer）

**产品**：Focus Tiger
**技术栈**：Lit / 原生 ES Module，无 React/Vue，无全局状态管理库
**目标**：新增一个独立、可复用、低耦合的呼吸引导组件 `<breath-pacer>`，用于三个场景：专注前降噪、专注中途微休息、独立日常放松。

---

## 0. 总体架构约束

- 新功能全部放在独立目录，**不修改**现有 Arrival Practice / Companion / Honesty 相关代码文件，只新增接入点。
- 组件与宿主页面之间**只通过 custom event 通信**，`<breath-pacer>` 本身不感知 Arrival、Companion 等业务概念。
- 呼吸记录写入本地 IndexedDB，独立的 object store，不复用/污染现有打卡数据表。
- 目录结构：

```
src/components/breath-pacer/
  breath-pacer.js        // Lit 组件主体（UI + 状态机接线）
  breath-engine.js        // 纯逻辑：呼吸状态机（无 DOM 依赖，可单测）
  breath-presets.js        // 三种节律的时间表配置
  breath-halo.css          // 光晕动画样式
  breath-storage.js        // IndexedDB 读写
```

---

## 任务 1：呼吸节律引擎（`breath-engine.js`）

**类型**：纯逻辑模块，无 DOM 依赖，需可单元测试。

### 输入
一个节律配置对象，例如：
```js
{ inhale: 4, hold: 4, exhale: 4 } // box breathing
{ inhale: 4, hold: 7, exhale: 8 } // 4-7-8
{ inhale: 4, hold: 0, exhale: 6 } // natural（无屏息）
```

### 行为
- 基于 `setInterval` 或 `requestAnimationFrame` 驱动一个状态机，状态为 `'inhale' | 'hold' | 'exhale'`。
- 每秒（或每帧）emit 一次当前状态：`{ phase, remainingSeconds, cycleIndex }`。
- 支持 `start(presetConfig, totalCycles)`、`pause()`、`resume()`、`stop()` 四个方法。
- 完成 `totalCycles` 个完整循环后，emit 一次 `'complete'` 事件，停止计时。
- 允许 `hold: 0` 时跳过屏息阶段，直接 inhale → exhale。

### 验收标准
- 提供单元测试：验证一个完整 4-4-4 循环 4 次后总耗时为 48 秒，且 phase 切换顺序正确。
- 该模块不引用任何 DOM API，可在 Node 环境下独立测试。

---

## 任务 2：节律预设配置（`breath-presets.js`）

导出三个预设：

```js
export const PRESETS = {
  box:     { label: '4-4-4 盒式呼吸',   inhale: 4, hold: 4, exhale: 4, defaultCycles: 4 },
  relax478:{ label: '4-7-8 放松呼吸',   inhale: 4, hold: 7, exhale: 8, defaultCycles: 4 },
  natural: { label: '4-6 自然舒缓呼吸', inhale: 4, hold: 0, exhale: 6, defaultCycles: 4 },
};
```

- `natural` 为默认预设。
- 每个预设附带一行引导文案（吸气.../留息.../呼气...），供 UI 层展示。

---

## 任务 3：`<breath-pacer>` Lit 组件（`breath-pacer.js`）

### Props / Attributes
- `preset`：`'box' | 'relax478' | 'natural'`，默认 `'natural'`
- `cycles`：数字，默认取预设的 `defaultCycles`

### 内部职责
- 引入任务 1 的引擎驱动状态机，不自行重写计时逻辑。
- UI 结构（自上而下）：
  1. 顶部极细进度条，反映 `cycleIndex / cycles`
  2. 右上角高透明度 `✕` 关闭按钮
  3. 中央：`<slot name="mascot">` 用于插入阿寅现有 Idle 帧（组件本身不内置阿寅美术资源）
  4. 中央叠加层：光晕 div，class 随 phase 切换（见任务 4）
  5. 阿寅下方一行淡入淡出文案：根据 phase 显示"吸气...""留息...""呼气..."
  6. 底部：3 个预设的 Pill 切换（box / relax478 / natural），点击切换后重启引擎
- 完成时（引擎 emit `'complete'`）：
  - 播放/触发一个 `mascot-nod` class（供阿寅美术层响应，组件不关心具体动画实现）
  - 展示两个同级按钮：`开始专注` / `好了，谢谢`
  - 点击分别 dispatch：`breath-complete-focus` / `breath-complete-done`（bubbles: true, composed: true）
- 点击右上角 `✕`：随时可退出，dispatch `breath-dismissed` 事件，**不记为失败，不做任何惩罚性提示**。

### 对外事件契约（供宿主页面监听，组件自身不处理跳转逻辑）
| 事件名 | 触发时机 | detail |
|---|---|---|
| `breath-phase-change` | 每次 phase 切换 | `{ phase, remainingSeconds, cycleIndex }` |
| `breath-complete-focus` | 完成后点击"开始专注" | `{ preset, cyclesCompleted }` |
| `breath-complete-done` | 完成后点击"好了，谢谢" | `{ preset, cyclesCompleted }` |
| `breath-dismissed` | 用户中途点 ✕ 退出 | `{ preset, phaseAtExit }` |

### 验收标准
- 组件可独立跑通，不依赖 Arrival/Companion 相关代码即可渲染和交互。
- 三个预设切换后引擎正确重启，UI 无残留旧状态。

---

## 任务 4：光晕动画（`breath-halo.css`）

- 纯 CSS 实现，叠加在阿寅现有 Sprite 上层，**不新增美术资源**。
- 用 `radial-gradient` 做光晕底色，`transform: scale()` 做扩散/收缩。
- 三个 class，对应组件 phase 切换时挂载：

```css
.breath-halo { /* 基础样式，radial-gradient 背景 */ }
.breath-halo.inhale { transform: scale(1.15); filter: brightness(1.1); transition: all 4s ease-in-out; }
.breath-halo.hold    { animation: halo-pulse 1s ease-in-out infinite; }
.breath-halo.exhale  { transform: scale(0.9); filter: brightness(0.9); transition: all 4s ease-in-out; }
```

- transition 时长应与当前预设的 inhale/exhale 秒数动态匹配（可通过 CSS 变量 `--phase-duration` 由 JS 设置）。

### 验收标准
- 动画时长与呼吸节律配置联动，切换预设后光晕节奏同步改变，无卡顿或跳变。

---

## 任务 5：本地存储（`breath-storage.js`）

- 新建独立 IndexedDB object store（如 `breathSessions`），**不复用**现有打卡数据表。
- 每次完成或中途退出时写入一条记录：`{ timestamp, preset, cyclesCompleted, completed: boolean }`。
- 提供 `saveBreathSession(record)` 和 `getRecentBreathSessions(limit)` 两个方法。

### 验收标准
- 组件销毁/页面刷新后，历史记录仍可通过 `getRecentBreathSessions` 读出。

---

## 任务 6：三个接入点（建议人工 review，不要一次性交给 Cursor 自动改）

1. **独立入口（场景 3）**：Idle 页面阿寅胸口增加一个可点击热区，唤起全屏 `<breath-pacer preset="natural">`。**优先做这个**，验证组件本身可用性，风险最低。
2. **Arrival 接入（场景 1）**：Arrival Practice 第 4c 步，原有 5 秒呼吸 beat 替换为 `<breath-pacer>`，监听 `breath-complete-focus` 后跳转 Here & Now 计时；监听 `breath-dismissed` 则维持原有 Arrival 流程不受影响。
3. **专注中途接入（场景 2）**：在暂停态弹出 `<breath-pacer preset="box" cycles="?">`（建议更短，如 2 个循环/30 秒），完成或退出后都需要正确恢复此前的专注计时器状态（暂停的计时不能被清零）。**建议最后做**，涉及计时器状态同步，逻辑最复杂，需要人工重点 review。

---

## 建议的开发与验收顺序

1. 任务 1（引擎）+ 单元测试 → 独立验证，无 UI 干扰
2. 任务 2（预设配置）
3. 任务 3（组件外壳）+ 任务 4（光晕动画）→ 可视化联调
4. 任务 5（存储）
5. 接入点 1（独立入口）→ 上线验证
6. 接入点 2（Arrival）
7. 接入点 3（专注中途）→ 人工重点 review

---

## 给 Cursor 的单任务 Prompt 模板（示例，可直接复制粘贴使用）

> 写一个纯逻辑模块 `breath-engine.js`，实现一个呼吸状态机。输入节律配置 `{inhale, hold, exhale}`（单位：秒）和循环次数 `totalCycles`。要求：
> - 提供 `start()`, `pause()`, `resume()`, `stop()` 方法
> - 每秒 emit 一次 `{phase, remainingSeconds, cycleIndex}`，phase 为 `'inhale'|'hold'|'exhale'`
> - `hold: 0` 时跳过屏息阶段
> - 完成所有循环后 emit `'complete'` 事件并自动停止
> - 不依赖任何 DOM API，附带可在 Node 环境运行的单元测试
> - 不要引入除标准库外的任何依赖
