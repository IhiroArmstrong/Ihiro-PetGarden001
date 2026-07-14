# Task 0 开发任务书
# 项目脚手架搭建 · focus-tiger/

**所属任务**：TASKS.md v5.0 → Phase 0 → 任务一的前置工作（脚手架先行，任务一的
3D场景内容填充是下一步）
**开发方式**：全新初始化 Vite + Three.js 项目
**本任务交付物**：一个 `npm run dev` 可以直接跑起来的空场景项目，
包含完整目录结构 + 所有模块的骨架代码（接口定义好，具体业务逻辑先不实现）

---

## 一、这个任务要做什么（一句话目标）

搭好整个项目的"骨架"——目录结构、每个模块的类/函数签名、模块之间的调用关系，
让 `npm run dev` 能跑起来看到一个占位的3D场景（灰色老虎占位模型坐在原地），
但**不实现任何真正的业务逻辑**（专注计时不算真时间、灰→金不会真的变色、
状态机不会真的切换）。

**这个任务做完之后，产品经理（我）会先检查目录结构和接口设计是否合理，
确认架构没问题，才会启动 Task 1（灰→金 Shader 与专注计时器的真实现）。**
所以请**不要**提前实现任何具体的业务逻辑，那是浪费的返工风险——这一点和
之前盆景项目 Task 1 的纪律是一样的。

---

## 二、明确的范围边界（非常重要，请严格遵守）

### ✅ 本任务要做的
- 完整的目录结构（见第三节），一个文件都不能少，也不能多建
- 每个模块导出正确的类/函数签名（见第四节），方法体里可以是空实现或最简单的
  占位返回值，但**签名必须和本文档一致**，因为后续任务要照着这个签名写代码
- Renderer / Scene 能正常初始化并渲染出一个占位场景（老虎用灰色球体或简单
  几何体占位即可，正式GLB模型还没准备好）
- package.json 配好 Vite + Three.js 依赖，`npm run dev` 和 `npm run build`
  都能正常跑通，不报错
- 每个未实现的方法内部，用注释明确标注这是留给哪个后续任务实现的

### ❌ 本任务明确不做的（属于后续任务，此处实现视为超范围）
- ❌ 不做真正的灰→金 shader 效果（属于 Task 1）
- ❌ 不做真正的专注计时逻辑（属于 Task 1）
- ❌ 不做 StateManager 的真实状态流转规则（属于 Task 2）
- ❌ 不做任何动画播放的具体实现（属于 Task 2 的 MoodController/Actions）
- ❌ 不做 localStorage 的真实读写（属于 Task 3）
- ❌ 不做沉睡态/唤醒仪式（属于 Task 4）
- ❌ 不建 `network/` 目录或任何相关文件——这是v5.0设计里明确废除的占位，
  现在不需要就不要建
- ❌ 不加任何调试用的按钮/面板/滑块（哪怕是为了方便自己肉眼验证）——
  这一版验收只看"场景是否正常渲染"，不需要交互

如果在实现过程中发现"这里加个调试按钮会更好验证"，请先跳过、记录下来，
不要现在做。

---

## 三、完整目录结构（请严格按此结构创建，一个不多一个不少）

```
focus-tiger/
├─ index.html
├─ vite.config.js
├─ package.json
├─ src/
│  ├─ main.js
│  │
│  ├─ core/
│  │  ├─ Renderer.js
│  │  ├─ Scene.js
│  │  ├─ PostProcessing.js
│  │  ├─ FocusSession.js
│  │  ├─ StateManager.js
│  │  └─ Milestone.js
│  │
│  ├─ character/
│  │  ├─ TigerCharacter.js
│  │  ├─ MoodController.js
│  │  └─ Actions.js
│  │
│  ├─ feedback/
│  │  ├─ FocusVisualizer.js
│  │  ├─ TransitionFX.js
│  │  └─ Ambience.js
│  │
│  ├─ input/
│  │  ├─ FocusInput.js
│  │  └─ UIControls.js
│  │
│  ├─ ui/
│  │  ├─ FocusHUD.js
│  │  ├─ RewardToast.js
│  │  └─ Screenshot.js
│  │
│  ├─ assets/
│  │  ├─ textures/            （空目录，占位，暂无贴图文件）
│  │  ├─ models/               （空目录，占位，暂无GLB文件）
│  │  └─ shaders/              （空目录，占位，暂无shader文件）
│  │
│  └─ utils/
│     ├─ Loaders.js
│     ├─ Constants.js
│     └─ Storage.js
```

**注意**：`assets/` 下三个子目录本任务先建空目录占位即可（Git不追踪空目录，
可以放一个 `.gitkeep` 文件），正式美术资产还没有产出，不需要现在放任何文件进去。

---

## 四、各模块骨架的接口规格（Cursor请严格照此签名实现）

### 4.1 `src/main.js`
```js
// 入口文件：只做"拼装 + 主循环调度"，不允许直接创建 THREE.Scene() /
// THREE.PerspectiveCamera() / THREE.WebGLRenderer() 等底层对象——
// 这些必须封装在 core/Renderer.js 和 core/Scene.js 里，main.js 只负责调用。

import { createRenderer } from './core/Renderer.js';
import { createScene } from './core/Scene.js';
import { createPostProcessing } from './core/PostProcessing.js';

// TODO(Task 1): 引入 FocusSession / StateManager 并接入主循环
// TODO(Task 2): 引入 MoodController 并接入状态变化回调

function init() {
  const { renderer, camera } = createRenderer(document.querySelector('#app'));
  const { scene, mounts } = createScene();
  const composer = createPostProcessing(renderer, scene, camera);

  function animate() {
    requestAnimationFrame(animate);
    composer.render();
  }
  animate();
}

init();
```

### 4.2 `src/core/Renderer.js`
```js
// 职责：只负责 renderer / camera / lights 的初始化，不涉及场景内容。

export function createRenderer(container) {
  // TODO: 创建 THREE.WebGLRenderer，挂载到 container
  // TODO: 创建 THREE.PerspectiveCamera，设置合理的初始位置（面向老虎占位模型）
  // TODO: 创建基础光源（一盏主光 + 一盏补光即可，不需要复杂布光）
  // TODO: 监听 window resize，保持画布自适应
  return { renderer, camera, lights };
}
```

### 4.3 `src/core/Scene.js`
```js
// 职责：场景图组装——老虎、莲花、光环的挂载点。
// 本任务用占位几何体代替正式模型（老虎=灰色球体，莲花=扁平圆柱，光环=细圆环），
// 正式GLB模型接入是 Task 1 及以后的工作。

export function createScene() {
  // TODO: 创建 THREE.Scene()
  // TODO: 添加占位老虎（灰色球体，材质用 Constants.js 里定义的"沉静灰"色值）
  // TODO: 添加占位莲花台、光环挂载点（Object3D 空节点即可，不需要真的建模）
  return {
    scene,
    mounts: {
      tiger: null,   // 占位模型的引用，供 TigerCharacter.js 后续替换为GLB
      lotus: null,
      halo: null
    }
  };
}
```

### 4.4 `src/core/PostProcessing.js`
```js
// 职责：管理 EffectComposer 和后处理 pass 链。
// 本任务只需要搭好 EffectComposer 骨架 + 一个基础 RenderPass，
// 灰→金 shader pass 的真正接入是 Task 1 的工作。

export function createPostProcessing(renderer, scene, camera) {
  // TODO: 创建 EffectComposer
  // TODO: 添加基础 RenderPass（保证composer.render()能正常出图）
  // TODO(Task 1): 在此追加灰→金 ShaderPass，本任务不做
  return composer;
}
```

### 4.5 `src/core/FocusSession.js`
```js
// 职责：专注会话的计时与focusLevel计算。本任务只搭骨架，计时逻辑留空。

export class FocusSession {
  constructor(targetMinutes = 25) {
    this.targetMinutes = targetMinutes;
    this.elapsedSeconds = 0;
    this.isRunning = false;
  }
  start() { /* TODO(Task 1) */ }
  pause() { /* TODO(Task 1) */ }
  resume() { /* TODO(Task 1) */ }
  stop() { /* TODO(Task 1) */ }
  getFocusLevel() {
    // TODO(Task 1): 真实计算 elapsedSeconds / (targetMinutes*60)，限制在[0,1]
    return 0;
  }
}
```

### 4.6 `src/core/StateManager.js`
```js
// 职责：全局状态机唯一状态源。本任务只需定义状态常量和订阅机制骨架，
// 真正的状态流转规则（什么条件下从FOCUSING切到CELEBRATE等）是 Task 2 的工作。

export const STATES = Object.freeze({
  IDLE: 'IDLE',
  FOCUSING: 'FOCUSING',
  BREAK: 'BREAK',
  CELEBRATE: 'CELEBRATE',
  DORMANT: 'DORMANT'
});

export class StateManager {
  constructor() {
    this.state = STATES.IDLE;
    this._listeners = [];
  }
  setState(nextState) {
    // TODO(Task 2): 校验状态流转是否合法，非法流转应拒绝并给出警告
    this.state = nextState;
    this._listeners.forEach(cb => cb(nextState));
  }
  onChange(callback) {
    this._listeners.push(callback);
  }
}
```

### 4.7 `src/core/Milestone.js`
```js
// 职责：里程碑数据计算（连续天数、累计时长）。本任务只搭骨架，
// 真实的读写与判定逻辑是 Task 3/Task 7 的工作。

export class Milestone {
  constructor(storage) {
    this.storage = storage;
  }
  recordSession(durationMinutes) { /* TODO(Task 3) */ }
  getStreakDays() { /* TODO(Task 3) */ return 0; }
  getTotalMinutes() { /* TODO(Task 3) */ return 0; }
}
```

### 4.8 `src/character/TigerCharacter.js`
```js
// 职责：老虎模型的加载与渲染控制（颜色/材质驱动）。
// 本任务先包一层占位几何体的引用，GLB加载逻辑是 Task 1 的工作。

export class TigerCharacter {
  constructor(mountNode) {
    this.mountNode = mountNode; // Scene.js 传入的挂载点
  }
  setFocusLevel(level) {
    // TODO(Task 1): 驱动 shader uniform，实现灰→金渐变
  }
  playAction(actionName) {
    // TODO(Task 2): 调用 Actions.js 播放对应动作
  }
}
```

### 4.9 `src/character/MoodController.js`
```js
// 职责：把 StateManager 的状态变化"翻译"成该播放哪个老虎动作。
// 重要约束：本类绝不允许自行存储/维护专注状态，只允许持有对
// stateManager / tigerCharacter / actions 三者的引用。Cursor实现时
// 请勿在这个类里出现类似 this.currentFocusState = ... 的独立字段。

export class MoodController {
  constructor(stateManager, tigerCharacter, actions) {
    this.tigerCharacter = tigerCharacter;
    this.actions = actions;
    stateManager.onChange((state) => this.handleStateChange(state));
  }
  handleStateChange(state) {
    // TODO(Task 2): 状态→动作的映射表，例如
    // FOCUSING -> actions.SIT, CELEBRATE -> actions.CHEER, DORMANT -> actions.DOZE
  }
}
```

### 4.10 `src/character/Actions.js`
```js
// 职责：定义所有可播放的动作枚举与占位播放函数。
// 真正的骨骼动画播放逻辑是 Task 2 的工作（依赖GLB里的动画clip）。

export const ACTIONS = Object.freeze({
  SIT: 'SIT',
  CHEER: 'CHEER',
  DOZE: 'DOZE',
  BLINK: 'BLINK',
  WAKE_UP: 'WAKE_UP'
});

export function playAction(tigerCharacter, actionName) {
  // TODO(Task 2): 根据actionName播放对应的GLB动画clip
}
```

### 4.11 `src/feedback/FocusVisualizer.js`
```js
// 职责：只负责 focusLevel 数值 → 光效/粒子/背景暖度参数的映射。
// 不允许在这个类里处理与 focusLevel 无关的环境效果（那是 Ambience.js 的职责）。

export class FocusVisualizer {
  constructor(postProcessing) {
    this.postProcessing = postProcessing;
  }
  update(focusLevel) {
    // TODO(Task 1): 根据 focusLevel 更新光效/粒子密度参数
  }
}
```

### 4.12 `src/feedback/TransitionFX.js`
```js
// 职责：只处理状态切换瞬间的一次性过场特效（如CELEBRATE时的金色光波），
// 播放完毕即结束，不长期持有任何状态。

export class TransitionFX {
  constructor(scene) {
    this.scene = scene;
  }
  playCelebrateBurst() {
    // TODO(Task 2): 播放一次性的金色光波扩散效果
  }
}
```

### 4.13 `src/feedback/Ambience.js`
```js
// 职责：只负责与 focusLevel 无关的静态环境基调（水墨雾气、柔光）。

export class Ambience {
  constructor(scene) {
    this.scene = scene;
  }
  setup() {
    // TODO(Task 1): 设置基础雾气/柔光，本任务只需方法能被调用不报错
  }
}
```

### 4.14 `src/input/FocusInput.js`
```js
// 职责：专注信号来源。MVP阶段只实现手动按钮触发，
// 番茄钟/传感器接入点先预留接口但不实现（不要写具体逻辑，方法体留空+TODO即可）。

export class FocusInput {
  constructor(onStart, onStop) {
    this.onStart = onStart;
    this.onStop = onStop;
  }
  bindManualButton(buttonElement) {
    // TODO(Task 1): 绑定点击事件，调用 onStart/onStop
  }
  // 以下两个方法本任务只需要函数存在，方法体留空即可，不实现具体逻辑
  bindPomodoroTimer() { /* 预留，暂不实现 */ }
  bindSensor() { /* 预留，暂不实现 */ }
}
```

### 4.15 `src/input/UIControls.js`
```js
// 职责：按钮/手势/快捷键的统一绑定入口。本任务只搭骨架。

export class UIControls {
  constructor() {}
  bindAll() { /* TODO(Task 1) */ }
}
```

### 4.16 `src/ui/FocusHUD.js` / `src/ui/RewardToast.js` / `src/ui/Screenshot.js`
```js
// 三个UI组件本任务只需要能被 import 且导出一个空的类/函数，
// 具体渲染逻辑分别属于 Task 1（HUD）、Task 7（RewardToast）、
// Phase 1（Screenshot），本任务不实现。

export class FocusHUD { constructor() {} render() { /* TODO(Task 1) */ } }
export class RewardToast { constructor() {} show() { /* TODO(Task 7) */ } }
export class Screenshot { constructor() {} capture() { /* TODO(Phase 1) */ } }
```

### 4.17 `src/utils/Loaders.js`
```js
export function loadGLTF(path) {
  // TODO(Task 1): 封装 GLTFLoader，返回 Promise
}
export function loadTexture(path) {
  // TODO(Task 1): 封装 TextureLoader，返回 Promise
}
```

### 4.18 `src/utils/Constants.js`
```js
// 直接复制 TASKS.md v5.0 "原则三：视觉风格规范" 的色板，
// 以及关键阈值参数，方便所有模块统一引用，不允许颜色值/阈值散落在各文件里硬编码。

export const COLORS = {
  idleGrayStart: '#cdd0d3',
  idleGrayEnd: '#a8adb3',
  focusGoldMid: '#e0b979',
  focusGoldFull: '#f0c060',
  stripeColor: '#8b6914',
  ambienceFog: '#e8e6e1',
  accentRed: '#8b2e2e',
  textInk: '#2c1f14'
};

export const FOCUS_SESSION_DEFAULT_MINUTES = 25;
export const DORMANT_TRIGGER_DAYS = 3;
export const WAKE_UP_RITUAL_MINUTES = 1;
```

### 4.19 `src/utils/Storage.js`
```js
// 职责：localStorage 封装。本任务只搭骨架，真实读写是 Task 3 的工作。
// Schema（供Task 3参考，本任务不需要真正写入）：
// { totalFocusMinutes: 0, streakDays: 0, tigerName: '阿寅', lastSessionTimestamp: null }

export function getStorage(key, fallback) {
  // TODO(Task 3)
  return fallback;
}
export function setStorage(key, value) {
  // TODO(Task 3)
}
```

---

## 五、package.json / vite.config.js 要求

```
依赖：
  three（最新稳定版即可，不指定具体次版本号，Cursor可自行选择当前稳定版）
  vite（devDependency）

脚本：
  "dev": "vite"
  "build": "vite build"
  "preview": "vite preview"

vite.config.js：使用默认最简配置即可，不需要额外插件
```

---

## 六、验收标准（Checklist）

产品经理（我）会按以下清单验收这次脚手架，请对照自查后再交付：

- [ ] 目录结构与第三节完全一致，不多建、不少建任何文件/文件夹
- [ ] `network/` 目录及相关文件确认不存在
- [ ] `npm install && npm run dev` 可以正常启动，浏览器打开后能看到占位场景
      （灰色球体或简单几何体代表老虎，坐落在占位莲花台上），控制台无报错
- [ ] `npm run build` 可以正常产出，无报错
- [ ] `core/` 下 Renderer.js / Scene.js / PostProcessing.js 是三个独立文件，
      渲染器初始化逻辑没有写在 main.js 里
- [ ] `StateManager.js` 的 STATES 常量包含且仅包含
      IDLE / FOCUSING / BREAK / CELEBRATE / DORMANT 五个状态
- [ ] `MoodController.js` 内部**没有**任何独立维护状态的字段
      （只允许持有对 stateManager / tigerCharacter / actions 的引用）
- [ ] 每一个标注了 TODO 的方法，注释里都明确写了是留给哪个后续任务实现的
      （格式统一为 `// TODO(Task N): 具体说明`）
- [ ] 所有第四节列出的类/函数，签名（类名、方法名、参数）与本文档完全一致
- [ ] 没有出现任何调试用的按钮/滑块/面板（本任务验收只看场景是否正常渲染）
- [ ] `assets/textures` `assets/models` `assets/shaders` 三个目录存在（可以是空的）

---

## 七、给Cursor的补充建议

1. **占位几何体不需要美术打磨**：老虎用一个简单的 `THREE.SphereGeometry` +
   `Constants.js` 里"沉静灰"色值的 `MeshStandardMaterial` 即可，不需要花时间
   做出"看起来像老虎"的占位模型，这一版只验证渲染管线通不通。

2. **如果对某个模块的职责边界有疑问**（比如某个方法到底该放 FocusVisualizer
   还是 Ambience），优先参考第四节每个文件开头的"职责"注释，那是最终判断依据；
   如果依然模糊，按你的工程判断先放一个更合理的位置，并在代码注释里标注
   "职责边界待产品经理确认"，不需要为了这类细节单独来回确认。

3. **不要因为"骨架代码里 TODO 太多，感觉没做什么"而自行加料**。这一版的
   价值就是把架构定下来、让后续任务能各自独立往里面填代码，架构本身的正确性
   比"这一版能不能用"更重要。

4. 完成后请把项目交给产品经理（我）review，我会重点检查：
   - 目录结构和接口签名是否与本文档完全一致
   - MoodController 是否真的没有偷偷维护状态（这是最容易被无意间破坏的约束）
   - `npm run dev` 首次加载是否顺畅，为后续的性能红线打好基础

---
*本任务书对应 TASKS.md v5.0 · Phase 0 · 任务一前置脚手架*
*下一步：Task 0验收通过后，将交付 Task 1 开发任务书（灰→金 Shader 与专注计时器的真实现）*
