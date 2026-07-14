# Task 1 开发任务书
# 灰→金视觉表达：材质插值 + 金光粒子 + 欢呼动画触发

**所属任务**：TASKS.md v5.0 → Phase 0 → 任务一（3D场景基础搭建）与任务二
（灰→金Shader与FocusSession计时器）的核心视觉部分
**前置条件**：Task 0 脚手架已验收通过，GLB模型（三视图已确认，模型面数50K）已就位
**开发方式**：在已有骨架文件基础上填充实现，**不新建文件**，
              严格对应 Task 0 定义的三个文件职责
**本任务交付物**：`character/TigerCharacter.js`、`feedback/FocusVisualizer.js`、
                 `character/Actions.js` 三个文件的完整实现

---

## 一、这个任务要做什么（一句话目标）

给定一个已经就位的老虎GLB模型，实现"focusLevel从0到1时，老虎从灰色渐变到金色，
周围逐渐出现金光粒子；达到1.0时触发一次欢呼动画+一次性光波特效"这一整套视觉表达。

**这次不是新建一个大文件，而是往 Task 0 已经搭好骨架的三个文件里填真实实现**，
请勿新建 `TigerMeditationVisualizer.js` 或任何合并职责的新文件——
三块效果分别属于三个已存在的文件，理由见下方"职责边界"说明。

---

## 二、职责边界（必须先搞清楚"这行代码该写在哪个文件"再动手）

```
character/TigerCharacter.js
  → 老虎"自己身上"的视觉状态：材质颜色插值（灰→金）
  → 对外暴露 setFocusLevel(level)，每帧由主循环调用
  → 老虎的动画播放（AnimationMixer），对外暴露 playAction(actionName)

feedback/FocusVisualizer.js
  → 老虎"周围环境"的持续性光效：金光粒子系统
  → 对外暴露 update(focusLevel)，每帧由主循环调用
  → 粒子数量/亮度随focusLevel从0到1线性/缓动增加
  → 不涉及老虎自身材质，只管粒子系统这一个独立的渲染对象

character/Actions.js + character/MoodController.js
  → CHEER动作的触发时机：由 StateManager 切换到 CELEBRATE 状态时，
    MoodController 监听到变化后调用 Actions.playAction(tiger, 'CHEER')
  → Actions.js 本身只负责"调用AnimationMixer播放指定clip"，
    不负责判断"什么时候该欢呼"（那是MoodController的职责，已在Task 0定义）

feedback/TransitionFX.js（本任务顺带实现，之前是空骨架）
  → CELEBRATE触发时的一次性金色光波扩散特效，播放完毕即销毁，
    区别于FocusVisualizer的持续性粒子——一个是"一直随focusLevel变化"，
    一个是"达标瞬间炸一下就没了"，不要混在一起实现
```

**判断口诀**：会不会"随focusLevel持续变化" → 是则FocusVisualizer；
"是否只在达标那一刻响一次" → 是则TransitionFX；
"是不是老虎自己身上的状态" → 是则TigerCharacter。

---

## 三、材质插值实现方案（灰→金，这是本任务技术难度最高的部分）

### 为什么不能简单改 `material.color`
```
50K面的模型大概率带了细节贴图（毛发纹理、条纹图案烘焙在diffuse贴图里），
如果只是简单地对 material.color 做 grey→gold 的颜色插值，
贴图本身的明暗细节会被整体颜色相乘覆盖，条纹细节可能糊成一片，
看起来像"给模型加了个滤镜"而不是"毛色真的在变化"。
```

### 推荐方案：保留贴图细节的渐变映射（Gradient Remap）
```
思路：不改变贴图本身的明暗信息（保留毛发纹理的层次），
      而是用一个uniform控制的"渐变查找"，把贴图的灰度值
      重新映射到"灰色渐变条"或"金色渐变条"上，
      两条渐变条之间按focusLevel做mix。

实现步骤（请先检查GLB实际材质结构，再决定用哪种方式接入）：
  1. Cursor请先用 console.log 打印出GLB加载后 mesh.material 的实际结构
     （是MeshStandardMaterial吗？有几张贴图？map/normalMap/roughnessMap分别是什么），
     把结果记录在代码注释里，方便后续排查
  2. 如果材质是标准 MeshStandardMaterial，用 material.onBeforeCompile
     注入自定义片元着色器代码，在采样完 diffuseColor 后，
     用其亮度(luminance)去lerp两个uniform颜色（uGrayTint / uGoldTint），
     再乘回原有细节，这样能保留贴图的纹理层次，只改变色相基调
  3. 如果Cursor判断GLB材质本身就比较简单（没有复杂贴图，接近纯色），
     可以退化为直接对 material.color 做颜色插值，更简单可靠，
     但请在代码注释里写明"已确认贴图较简单，采用简化方案"，
     不要在没检查的情况下默认用简化方案

uniform命名建议（保持和 Constants.js 已有色值对应）：
  uFocusLevel     // 0.0 - 1.0，由 TigerCharacter.setFocusLevel() 每帧更新
  uGrayTint       // 对应 Constants.COLORS.idleGrayStart/End 的中间值
  uGoldTint       // 对应 Constants.COLORS.focusGoldFull
```

### `TigerCharacter.js` 接口实现要求
```js
export class TigerCharacter {
  constructor(mountNode) {
    this.mountNode = mountNode;
    this.mixer = null;       // THREE.AnimationMixer，加载GLB后初始化
    this.clips = {};         // 动画clip名称 → THREE.AnimationClip 的映射表
    // 加载GLB请用 utils/Loaders.js 的 loadGLTF()，不要在这个文件里重复造轮子
  }

  async load(glbPath) {
    // 加载GLB，挂载到mountNode
    // 加载完成后：
    //   1. console.log打印所有材质结构（见上方要求）
    //   2. console.log打印 gltf.animations 里所有clip的name，
    //      记录下来后再决定 Actions.js 里 ACTIONS.CHEER 等枚举
    //      具体对应哪个clip名称（不要凭空猜测clip名字）
  }

  setFocusLevel(level) {
    // 更新 uFocusLevel uniform（如果用shader方案）
    // 或直接做颜色插值（如果确认用简化方案）
  }

  playAction(actionName) {
    // 调用 Actions.playAction(this, actionName)
  }

  update(deltaTime) {
    // 每帧调用 this.mixer.update(deltaTime)，驱动动画播放
    // 注意：这个update方法之前Task 0骨架里没有，属于本任务新增，
    //      main.js的主循环需要同步调用它
  }
}
```

---

## 四、金光粒子实现方案（`FocusVisualizer.js`）

```
技术选型：THREE.Points + 加色混合（AdditiveBlending），
         不需要用完整的GPU粒子系统库，量级不大（建议上限200-300个粒子），
         没必要引入额外依赖

行为规则：
  focusLevel 0.0-0.3：粒子数量0（不生成）
  focusLevel 0.3-0.7：粒子数量随focusLevel线性增长（比如30%→50粒，70%→150粒）
  focusLevel 0.7-1.0：粒子数量达到上限并保持，透明度/亮度随focusLevel继续增强

粒子行为：
  从老虎周围一个环形/球形区域内随机生成，缓慢向上飘散并逐渐淡出，
  到达一定高度后重新回到起始区域（循环利用，不要每帧new新的粒子对象，
  用固定大小的BufferGeometry + 预分配的position数组，性能更可控）

粒子贴图：
  用一个简单的径向渐变光斑贴图即可（白色到透明的圆形glow），
  这张贴图请放在 assets/textures/particle-glow.png，
  如果暂时没有美术资源，Cursor可以用Canvas API程序化生成一张
  （画一个radial gradient的圆形，导出为texture），不需要等美术资源到位
```

```js
export class FocusVisualizer {
  constructor(postProcessing) {
    this.postProcessing = postProcessing;
    // TODO: 初始化粒子系统（THREE.Points + BufferGeometry），
    //       挂载点应该在Scene.js传入的老虎位置附近，
    //       具体挂载方式请检查Scene.js里mounts.tiger的坐标
  }

  update(focusLevel) {
    // 根据上述规则更新粒子数量/透明度
    // 每帧调用，驱动粒子的飘散动画
  }
}
```

---

## 五、欢呼动画触发（`Actions.js` + 确认`MoodController.js`联动）

```
本任务只需要把 Task 0 里 Actions.js 的 TODO 补上，
MoodController.js 的状态→动作映射表如果Task 0已经写了骨架，
本任务负责把 CELEBRATE → CHEER 这条映射的调用打通即可，
不需要重新设计MoodController的整体逻辑。
```

```js
// Actions.js
export function playAction(tigerCharacter, actionName) {
  const clip = tigerCharacter.clips[actionName];
  if (!clip) {
    console.warn(`未找到动作clip: ${actionName}，请检查GLB实际的animation clip命名`);
    return;
  }
  const action = tigerCharacter.mixer.clipAction(clip);
  action.reset();
  if (actionName === 'CHEER') {
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
  }
  action.play();
}
```

```
CHEER触发时，请同时调用 TransitionFX.playCelebrateBurst()（本任务一并实现），
两者应该在 MoodController.handleStateChange() 里同一个CELEBRATE分支下触发，
不要拆到两处不同地方各自监听状态，避免不同步。

TransitionFX的光波实现：一个从老虎位置扩散的圆环/球壳，
scale从0快速放大到一定范围同时opacity归零，用THREE.Mesh + 
自定义简单shader或直接用几何体scale动画都可以，实现细节不做强制要求，
关键约束是"播放完毕后必须彻底移除/隐藏，不能常驻在场景里"。
```

---

## 六、性能检查（这是3D路线的硬性要求，请勿跳过）

```
50K面模型 + shader材质 + 粒子系统 + 骨骼动画，叠加起来是本项目目前最重的一次渲染，
请在本任务完成后，务必在真实移动设备（或Chrome DevTools的移动端CPU节流模拟）
下实测帧率，目标：中端手机稳定30fps以上。

如果帧率不达标，优先排查顺序：
  1. 粒子数量上限是否设置过高（先降到100试试）
  2. shader的onBeforeCompile注入是否有不必要的重复计算
  3. 最后才考虑模型减面（这个改动成本最高，尽量先用前两项优化）

这项检查结果请写在代码提交说明里，产品经理验收时会看这个数据。
```

---

## 七、验收标准（Checklist）

- [ ] 未新建任何文件，所有实现都填在 Task 0 已定义的文件里
- [ ] `TigerCharacter.js` 的材质方案有明确说明（shader remap 或简化方案），
      且注释里写明了是基于对实际GLB材质结构检查后的判断，不是凭空假设的
- [ ] focusLevel从0渐变到1时，老虎肉眼可见地从灰色平滑过渡到金色，
      贴图纹理细节（如果有）没有被完全糊掉
- [ ] 金光粒子数量/亮度随focusLevel变化的规律符合第四节描述
      （0.3以下无粒子，0.3-0.7线性增长，0.7以上封顶）
- [ ] focusLevel达到1.0时：CHEER动画播放一次（不循环）+ TransitionFX光波
      播放一次后自动消失，不会常驻在场景里
- [ ] MoodController里没有出现新的独立状态字段（沿用Task 0的约束）
- [ ] 中端设备实测帧率≥30fps，或明确记录了当前帧率数据供产品经理评估
- [ ] console.log的调试信息（材质结构、animation clip名称）已经打印过
      并在代码注释里记录了实际结果，不需要保留在正式代码里持续打印

---

## 八、给Cursor的补充建议

1. **先花5分钟加载GLB并打印结构，再动手写shader**，这一步不能省。
   材质插值方案的选择完全取决于实际的贴图情况，凭经验猜测容易返工。

2. **粒子系统不要过度设计**，200-300个粒子的简单Points系统足够表达
   "金光渐盛"的感觉，不需要复杂的GPU compute粒子或者物理模拟。

3. 如果shader的onBeforeCompile方案调试起来卡壳超过预期，
   可以先用简化方案（直接改material.color插值）**跑通整个流程**，
   把这个技术难点单独标注为"待优化项"反馈给产品经理，
   不要因为死磕一个技术点导致整个任务卡住交付。

---
*本任务书对应 TASKS.md v5.0 · Phase 0 · 任务一/任务二核心视觉部分*
*前置：Task 0（脚手架）已完成 · 后续：Task 2（StateManager真实状态流转规则）*
