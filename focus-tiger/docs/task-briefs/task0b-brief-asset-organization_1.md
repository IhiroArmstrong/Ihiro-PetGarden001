# Task 0b 开发任务书
# 素材归档 + 首屏Poster过渡接入

> **⚠️ 历史注记（2026-07-15）**：本文中"灰→金视觉表达"等相关表述为当时方案，已被新视觉原则取代（本体固有色恒定，金色由光环/环境光反射表达，见 `DESIGN.md`「视觉状态」章节）。原文保留不改写，阅读时以新原则为准。

**所属任务**：TASKS.md v5.1 → 项目根目录结构调整 + 首屏加载体验策略
**前置条件**：以下原始文件已经由产品经理放入项目工作区（具体存放的临时位置
请Cursor自行确认，可能在项目根目录、也可能在一个临时文件夹里，先找到再动手）：
  - TASKS.md、COLLAB.md
  - 之前产出的两份Task Brief（项目脚手架、灰→金视觉表达）
  - 老虎三视图参考图（若干张图片）
  - 老虎GLB模型文件
  - （可能有）粒子光斑等贴图素材

**开发方式**：文件整理 + 路径引用同步修改，不涉及新功能开发
**本任务交付物**：归档完成的项目目录结构 + 一个能正常工作的首屏Poster过渡效果

---

## 零、执行前必做：GLB压缩（32.4MB → 目标3MB以下）

```
现有GLB文件32.4MB，远超Phase 0验收标准里"GLB+贴图总体积 < 3MB"的红线，
必须先压缩再归档进public/models/，否则后续所有性能验收都无从谈起。

32MB量级大概率是贴图未压缩导致的（50K面的几何数据本身不该有这么大），
请按以下步骤处理：

1. 用 gltf-transform CLI 一次性处理（几何体Draco压缩 + 贴图转KTX2）：

   npm install -g @gltf-transform/cli
   gltf-transform optimize tiger-raw.glb tiger.glb \
     --compress draco \
     --texture-compress ktx2 \
     --texture-size 1024x1024

2. 处理完用 gltf-transform inspect tiger.glb 检查产出文件的体积构成
   （几何体多大、每张贴图多大、动画数据多大），确认已经降到3MB以下，
   如果还超标，优先降贴图分辨率（basecolor/normal保留1024，
   roughness/metalness/AO这类灰度贴图可以降到512），
   模型减面放在最后手段，改动成本最高

3. 用 gltf-transform inspect 顺便检查一下animation clip列表，
   如果建模软件导出时带了多余的IK辅助骨骼/未使用的take，
   一并清理掉，只保留会用到的动画

4. 压缩产出的 tiger.glb（这个才是最终要放进public/models/的文件）
   替换掉原始的32.4MB版本
```

### 连带的代码要求：Loaders.js 需要支持Draco/KTX2解码

```
压缩后的GLB用普通GLTFLoader无法直接加载，Draco压缩的几何体和KTX2压缩的
贴图都需要额外的解码器，这一点请一并加进本任务的交付范围：

  - DRACOLoader 需要decoder(wasm)文件，请放到 public/draco/
  - KTX2Loader 需要Basis transcoder(wasm)文件，请放到 public/basis/
  - utils/Loaders.js 的 loadGLTF() 实现时，需要给 GLTFLoader 挂载
    DRACOLoader 和 KTX2Loader 实例，并分别指定上述解码器路径

这两个解码器文件可以从 three.js 官方仓库的 examples/jsm/libs/ 目录下获取
（draco/ 和 basis/ 两个文件夹），不需要自己编译。
```

---

## 一、这个任务要做什么（一句话目标）

把散落的原始文件按TASKS.md v5.1定义的目录结构分类归档，同步修改所有引用这些
文件路径的代码，并且实现"首屏先显示一张预渲染静态图，3D场景加载完成后淡入
替换"的Poster过渡效果。

---

## 二、文件归档规则（请先找到文件再对照下表分类移动）

```
TASKS.md, COLLAB.md              →  docs/
之前的两份Task Brief              →  docs/task-briefs/
老虎三视图参考图                  →  art-reference/tiger-turnaround/
老虎GLB模型文件                   →  public/models/tiger.glb
                                      （请统一改名为 tiger.glb，
                                       如果原文件名不同，改名后在提交说明
                                       里注明原文件名，方便追溯）
粒子光斑等贴图（如果已有）         →  public/textures/
```

**重要**：`docs/` 和 `art-reference/` 里的内容不参与Vite构建，不需要在任何
`import` 语句里引用它们，纯粹是文件归档，不要因为"这个文件夹没被代码引用"
就觉得放错了地方。

---

## 三、路径引用同步（归档完文件后，必须同步做的事）

```
1. utils/Loaders.js 或 character/TigerCharacter.js 里加载GLB的路径，
   统一改成 '/models/tiger.glb'（public/下的文件用绝对路径引用，
   不要用 import 语句去import一个GLB文件）

2. 如果FocusVisualizer.js里加载了粒子贴图，同理改成
   '/textures/particle-glow.png' 这种绝对路径引用方式

3. 全项目搜索一遍，确认没有残留指向旧路径（比如误写成
   src/assets/models/xxx 这种Task 0草稿阶段的占位路径）的引用

4. README（如果项目里有）同步更新一下目录结构说明，
   如果还没有README，这次不需要专门新建，不是本任务范围
```

---

## 四、首屏Poster过渡效果实现

### 第一步：生成"真实渲染截帧"作为占位图（不是另画一张示意图）

```
用Three.js把老虎默认灰态的场景离屏渲染一帧，导出为PNG，
存放到 public/textures/poster-idle.png

实现方式（任选其一，哪个方便就用哪个）：
  a. 写一个一次性的本地脚本，用当前项目已有的Renderer/Scene初始化逻辑，
     渲染一帧后用renderer.domElement.toDataURL()导出保存
  b. 或者在浏览器里正常跑起项目后，手动截一张WebGL canvas的图，
     裁剪保存即可，不需要过度自动化这一步（这是一次性工作，
     不需要做成可重复执行的构建脚本）

关键约束：这张图必须是"真实3D场景渲染出来的样子"，构图/光照/角度要和
真实场景一致，否则占位图消失、真实3D淡入的瞬间会有肉眼可见的"对不上"，
比空白等待体验更差。
```

### 第二步：index.html 里直接嵌入占位图（在JS执行前就能显示）

```html
<!-- index.html，示意结构，具体class/id命名Cursor可自行决定，
     但必须保证poster是在JS bundle加载执行之前就能被浏览器绘制出来的 -->
<div id="app">
  <img id="poster" src="/textures/poster-idle.png" alt="">
  <canvas id="scene-canvas" style="opacity:0;"></canvas>
</div>
```

### 第三步：加载完成后的淡出/淡入切换

```
在main.js里，GLB和其他资源全部加载完成、场景可以正常渲染的那一刻：
  1. canvas的opacity从0过渡到1（CSS transition即可，不需要额外动画库）
  2. poster图片的opacity从1过渡到0，过渡结束后彻底移除该DOM节点
  3. 两者的过渡时长建议一致（比如400-600ms），确保交叉淡入淡出而不是
     一个消失后另一个才出现的生硬切换

不需要做加载进度条/百分比这类额外UI，本任务范围只到"无缝切换"这一步，
更完整的Loading体验（比如带进度提示）如果后续需要，另开任务处理。
```

---

## 五、验收标准（Checklist）

- [ ] `public/models/tiger.glb` 压缩后体积已确认 < 3MB（含贴图），
      压缩前后的体积对比数据请记录在提交说明里
- [ ] `public/draco/`、`public/basis/` 两个解码器目录已就位，
      `Loaders.js` 的 GLTFLoader 已正确挂载 DRACOLoader 和 KTX2Loader，
      且指定了对应的解码器路径
- [ ] `docs/`、`docs/task-briefs/`、`art-reference/tiger-turnaround/`、
      `public/models/`、`public/textures/` 五个目录都已建好并放入对应文件
- [ ] 项目根目录/临时文件夹里不再残留未归档的原始文件
- [ ] `npm run dev` 正常启动，GLB和贴图能正常加载，控制台无404
- [ ] 全项目搜索确认没有残留指向Task 0草稿阶段占位路径的引用
- [ ] 首屏打开的瞬间（哪怕网络节流到3G模拟），能立刻看到poster静态图，
      不会有白屏空窗期
- [ ] 3D场景加载完成后，poster与真实canvas之间是交叉淡入淡出，
      不是生硬跳变，且两者构图基本一致（因为poster就是真实渲染截帧）
- [ ] poster图片本身体积可控（建议 < 200KB，毕竟它要最先被下载，
      如果它自己都很大就失去了"优先展示"的意义）

---

## 六、给Cursor的补充建议

1. 如果找不到产品经理提到的原始文件（GLB/三视图/贴图），先反馈确认文件
   实际存放位置，不要假设文件不存在就跳过这部分任务，也不要用占位几何体
   替代后就当作任务已完成——Task 0阶段用占位几何体是因为当时GLB确实还没
   有，现在已经明确文件已经就位。

2. Poster截帧这一步不需要写成自动化脚本反复生成，就是个一次性操作，
   花5分钟手动截好图存进项目即可，不要为了"优雅"而过度投入时间在这上面。

---
*本任务书对应 TASKS.md v5.1 · 项目根目录结构调整 + 首屏Poster过渡策略*
*前置：Task 0（脚手架）、Task 1（灰→金视觉表达）均已产出对应代码/Brief*
