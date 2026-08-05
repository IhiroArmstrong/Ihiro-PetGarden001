# 吹花鼓励 · 冷启动微仪式设计（拍板记录）

**日期**：2026-08-05  
**状态**：产品规则已拍板；**代码未接线**（下一步 = Phase 1 实验室入库）  
**素材源（未入库）**：仓库根 `yin-smiling-meditate-conjure-flowers-blow-away_transparent/`（65 帧 · ~53MB · 1056×864 RGBA）  
**目标路径（入库时）**：`public/sprites/tiger-cub/monk-robe-default/conjure-flowers-blow-away/frame_NNN.png`（须 kebab-case；去掉 `_transparent` / 下划线）  
**建议情绪键（暂定）**：`conjureFlowersBlowAway`（或短名 `flowerBlowWelcome`；Phase 1 定稿）  
**权威交叉**：`SCENE_ANIMATION_WIRING.md` · `EMOTION_BIBLE.md`（观察式措辞）· `PRINCIPLES.md` · `ASSET_INVENTORY.md` · Brief `task-briefs/task-flower-blow-welcome-phased.md`

---

## 一、产品意图（一句话）

用户**打开 App 本身**就是一次自我觉察；在 Day1 / 久别重逢时，用「阿寅变花轻吹」+ 轻量鼓励气泡，给出无条件、非评判的欢迎——**不**替代日常冷启动欢迎池，也**不**与同日其它开场问候叠啰嗦。

---

## 二、已拍板规则（2026-08-05）

### 2.1 与现欢迎池关系（策略 C + 同日互斥）

| 场景 | 行为 |
|---|---|
| **Day 1 / 首次安装冷启动** | **100% 吹花**（第一印象礼物） |
| **久别重逢**（≥ **3** 个自然日未打开） | **100% 吹花** |
| **普通隔天 / 次日首次打开** | **仍走现有** `WELCOME_APP` 池：`magicBookReading` 60% · `nodGreeting` 40%（**不**吹花） |
| **同自然日内** | 吹花 与 `WELCOME_APP` 池（含 `magicBookReading` / `nodGreeting`）**二选一**，禁止同日两套开场问候 |

> 用户书面强调：吹花与 `magicBookReading` 一天内冷启动只能二选一。落地时按 **整族互斥**（吹花 ↔ 欢迎池任一项），避免书/点头再叠一层啰嗦。

### 2.2 开局优先级（互斥，不并行）

```
1. DORMANT / 睡态路径          → 走休眠/苏醒既有逻辑；跳过吹花
2. 命中 Day1 或 久别吹花门闩   → 吹花 + 鼓励气泡（且当日不再跑 WELCOME_APP）
3. 否则当日首次冷启动          → 现有 WELCOME_APP 池
4. 欢迎已跳过 / 未播           → 才可检深夜茶/哈欠（既有互斥不变）
5. 兜底                        → Idle 坐禅
```

**原则**：互斥时一招压一招；睡着的阿寅不得与变花气泡同现。

### 2.3 文案与语言

- **观察式 only**（`EMOTION_BIBLE`「观察式措辞」/ `PRINCIPLES`）。  
- **采用**维度 B 调性：「在这里就够了 / No hurry / Being here is enough」——无条件接纳、不催时长。  
- **不采用**（已否决）：夸表现（`doing amazingly` / 「十分素晴らしい」）、贴标签式「了不起」、`missed you` / 「待っていました」等易生软义务的久别句。  
- **首次造访**：气泡 **EN + JA 双语叠显**。  
- **之后**：只跟用户当前 **locale**（v1.0 对外 en / ja）。  
- 文案键进 `locales/*.json` + `t()` / `tPool()`；禁止业务硬编码句子。  
- 久别专用观察式定稿句：**Phase 2 文案轮再定**（本文件只锁原则，不锁最终英日句）。

### 2.4 时机与转场（统一稿）

| 项 | 拍板值 |
|---|---|
| 气泡驻留 | **3.0–3.5 s**（足够读完） |
| 回 Idle | **`CAPCUT_DISSOLVE_MS` ≈ 1s** + `freezeUntilCrossFadeEnds`；禁止闪切 |
| 气泡淡出 | 可与花瓣消散同节奏；**不得**用「只淡气泡、硬切角色」代替 CapCut |
| 入场 | 与吹花动作同步淡入（约 400ms ease-out 可作实现参考，非硬门禁） |

### 2.5 交互与叠层

- 吹花期间：**允许点 Sit**（不阻塞主路径进入专注）。  
- 气泡：**允许**点气泡或点页面空白处 → 立即消失（不卡主流程）。  
- 窄屏 HUD：气泡定位在阿寅头顶轴线上、约 12–16px 间距；勿压脸/耳；样式走现有 glass（`glassPanelStyles` / Arrival 暖米半透明），**勿**新引 Cinzel / Playfair 等外链展示字体（与现壳一致优先）。  
- **禁止**做成 Toast/Modal 硬弹窗感；气质 = 随风喃喃。

### 2.6 降级与兜底

- **Feature flag**（建议名 `ENABLE_FLOWER_WELCOME`，默认可先 `false` 直至 Phase 2 产品接线验收）：`false` 时完全回退现有冷启动，零产品路径污染。  
- 气泡 **≤3.5s 强制销毁**（含 dismiss / 超时）；动画失败也不得卡住 Idle 控制权。

---

## 三、风险规避（采纳 + 修正）

整包一次落线会穿透 EmotionController / Dispatcher / 欢迎·深夜互斥 / UI / i18n，**风险中高**。标准策略：**切片、渐进、资产与产品调度解耦、防守兜底**。

### 3.1 采纳

| 策略 | 说明 |
|---|---|
| **资产先行、逻辑后置** | Phase 1：只入库 + 实验室可播 + CapCut 回 Idle；**不改**冷启动 / `WELCOME_APP` |
| **分 Slice 交付** | 勿单 PR 吞状态机+气泡+字体+频次+双语产品路径 |
| **优先级门闩** | §2.2；DORMANT 高于吹花；吹花与欢迎池同日互斥 |
| **Feature flag + 气泡强制定时销毁** | §2.6 |
| **机制与资产解耦** | 素材/oneshot 管道可先绿；产品触发后置 |

### 3.2 修正（不采纳原提案中的危险简化）

| 原提案 | 本项目修正 | 原因 |
|---|---|---|
| Slice 2「冷启动单点硬调、**不改 Dispatcher / 不碰 EMOTION_BIBLE**」 | 产品接线**必须**走 `sceneAnimationDispatcher` + 先登记 `EMOTION_BIBLE` / 接线表 | 另开平行冷启动路径 = known-risky 互斥灾难复刻 |
| 「不立刻改 EmotionController 闭环」说到 Phase 1 | Phase 1 **会**注册 oneshot + 调试入口；**不会**改生产 `WELCOME_APP` 调度 | 实验室可播需要控制器映射；与「不改冷启动」不矛盾 |
| Slice 1 用 `onAppReady` 直接出产品气泡、无动画 | 产品路径禁止孤儿气泡；UI 可先在**实验室/调试**与动画同钮验收 | 避免用户只见字不见仪式 |
| 优先级示例落到「标准 Idle」并跳过欢迎池 | 未命中吹花时仍走 **现有 WELCOME_APP**，再深夜互斥 | 与策略 C 一致 |
| 原设计「隔天 30–50% 随机吹花」 | **不做**（策略 C：普通隔天只走现池） | 已拍板 |

### 3.3 推荐切片顺序（本项目）

| 切片 | 内容 | 产品冷启动 |
|---|---|---|
| **Phase 1 · Lab 入库** | 改名复制帧 → manifest → `playEmotion` oneshot → CapCut Idle → `#emotion-debug-ui` 钮；更新 `ASSET_INVENTORY` / Bible 草稿行 | **不改** |
| **Phase 2a · 气泡 UI** | glass 气泡 + 观察式文案池（en/ja）+ 首次双语叠显逻辑 + dismiss/超时；**实验室**与吹花同播验收 | 仍不改 |
| **Phase 2b · 产品接线** | Dispatcher 事件 + Day1/久别门闩 + 同日 XOR 欢迎池 + flag；接线表状态改为已实现 | **此时才改** |
| **Phase 2c · 抛光** | 文案轮换记账、体积/fps 微调、e2e 门闩失败用例、TEST_TRACKER 分列 | — |

> 与「先静态气泡再动画」的差异：**本项目先 Lab 动画衔接**（观感契约高风险面），再气泡，再 Dispatcher——避免无帧率/无 CapCut 基线就接产品。

---

## 四、明确不做（本阶段）

- 不改现有 `WELCOME_APP` 权重（直至 Phase 2b）。  
- 不接挥手 `welcomeBack`（仍停接线）。  
- 不引入角色语音。  
- 不把吹花升到 Celebrating / Milestone 档。  
- 不把定性/夸表现/missed-you 文案写进字典。

---

## 五、下一步（待讨论确认后执行）

1. **立刻可执行**：Phase 1 Lab 入库（独立 `feature/*` worktree；素材从主仓根目录复制并 kebab 重命名）。  
2. Phase 1 验收：调试钮完整弧线 + CapCut 回 Idle；fps 落在 ack 舒适带（约 3.5–7s 叙事；65 帧需选定 fps）。  
3. 再开 Phase 2a 气泡讨论（文案定稿句 + z-index 登记）。

---

## 六、变更记录

| 日期 | 说明 |
|---|---|
| 2026-08-05 | 初版：策略 C + 同日 XOR 欢迎池；观察式文案；时机统一；Sit 可点；气泡可点消；风险切片采纳与修正；Phase 1 尚未开工 |
