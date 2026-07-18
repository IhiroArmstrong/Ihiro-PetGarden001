# CORE_LOOP.md — 核心用户体验循环（Game Loop）

创建日期：2026-07-18
目的：梳理项目现存的三层产品叙事模型之间的关系，并记录本次"七步状态机"提案的采纳/修正结论。

---

## 一、三层模型的关系（先说清楚，避免以后打架）

项目里现在并行存在三层模型，缩放粒度不同，不是互相竞争的方案：

| 层级 | 模型 | 回答的问题 | 定稿时间 |
|---|---|---|---|
| 最抽象 | 觉察 Awareness → 专注 Focus → 心流 Flow → 内在成长 Growth | 为什么做这件事 | 2026-07-16 |
| 中间层 | Five Moments：Arrive / Focus / Recover / Transition / Reflect | 一天里什么时候会想起阿寅 | 2026-07-17 |
| 最具体 | 本文档：单次专注会话的七步状态机 | 一次坐下专注具体怎么走 | 2026-07-18 |

**七步状态机是 Five Moments 中 Arrive+Focus+Recover+Reflect 四格在单次会话粒度里的展开**，不是第四套并行模型。**Transition 不在这个状态机里**——它是独立于单次专注会话之外的短交互（任务切换），不需要塞进这七步。

---

## 二、七步状态机（v2：Arrival Practice 版本，2026-07-18 更新）

```
Arrive
  ├─ Honesty Check-in（按天触发，DORMANT 时可忽略提示，不改名，独立于下面的流程）
  └─ 点击 Sit with Yin → Arrival Practice（详见 ARRIVE_MOMENT_DESIGN.md v2）：
       欢迎 beat（~2秒，文字气泡）
         ↓（可整体跳过）
       Notice：状态点选（6图标单选，不持久化，仅换 Yin 一句观察式回应）
         ↓
       呼吸 beat（~5秒，无倒计时）
         ↓
       Choose：今天做什么（图标点选为主 + 次要打字入口，会存储、会回显）
         → 确认时 IntentionSet（palms-together）+ 坐垫光晕；跳过则直接往下
  （视觉氛围层：`LightProgression` 冷→暖 / 呼吸推近 / Choose 坐垫光晕，见 LIGHT_PROGRESSION_DESIGN.md）
  ↓
Focus（不变）
  ↓
Recover（原提案称 Return；分心不是失败，是循环里正常的一环）
  （视觉氛围层：Re-focus 触发时 DOM 扰动 + 约 20% 亮度下降、5s 平复；文案仍走 REFOCUS_ACKNOWLEDGE）
  ↓
情绪反馈 + Reflect（= 已实现的 Celebrating/sessionComplete + Reflection Moment；
                    Reflect 开头回显 Choose 内容，Notice 状态不回显）
  ↓
Grow Together（老虎成长 = 用户成长的映射，非独立宠物养成机制）
  （候选视觉：`lotus-chest-halo` 10 帧胸口莲花+脑后金光已入库，作纪念物解锁呈现候选；
    触发规则属 Backlog「纪念奖励系统」，未接线。环境首朵素材 `lotus-front-rising` 亦已到位。）
```

**关键变化**：Notice 和 Choose 不再是"一个被动画面+一个自由打字"，而是统一为
"点选为主"的轻量交互，Notice 换成 6 图标状态点选（换取 Yin 一句观察式回应，
不落库），Choose 换成 6 图标点选 + 次要打字入口（沿用存储/回显）。详细设计与
理由见 ARRIVE_MOMENT_DESIGN.md v2，本文档只保留结论。

---

## 三、逐项采纳/修正结论

### 采纳（无修改）
- **Recover 的地位提升**：从"背景提醒机制"提升为循环里正式的一环，叙事上明确"Focus → Distracted → Recover → Continue"，不是"Distracted → Fail"。不涉及新代码，是既有 Re-focus Acknowledge / mindfulAcknowledge 的重新定性，供文档和文案对齐。
- **Grow Together**：合并"老虎成长"与"用户成长"为同一叙事，老虎的成长只是用户成长的映射（觉察情绪、保持专注、健康节律等）。这与 2026-07-15 已拍板的"共同经历增加、环境细节解锁与永久纪念物"完全一致，本次只是把它正式写成循环图里的节点名。纪念物解锁视觉候选素材 `lotus-chest-halo`（10 帧）已入库；具体哪些里程碑触发、触发几次，等 Backlog「纪念奖励系统」排期再定，不在文档层擅自接线。
- **Choose = Session Intention**：确认是同一功能，不新增设计工作，见 ARRIVE_MOMENT_DESIGN.md。

### 采纳但修改了实现方式（v2 更新）
- **Notice / Choose 点选设计**：v1 曾判定 Notice 应做成"无输入的被动停顿"，v2 采纳了更好的方案——**单次点击的图标选择**（Notice 六个身心状态图标；Choose 六个活动图标+次要打字入口），既避免了自由打字的负担，又保留了"觉察当下"的实际体验。Notice 的回应措辞遵循"描述状态、不描述用户"（如 "A busy mind is here today." 而非 "You are busy."），是 PRINCIPLES"观照者而非情绪本身"原则的具体落地。
- **数据规则区分**：Notice 点选**不持久化、不做跨会话统计**，仅用于挑选 Yin 当次的一句回应，避免变相恢复已被否决的"情绪分析"功能；Choose 点选/打字**沿用存储与回显**（focus-tiger.intentions.v1）。这条界限是硬性的，不是实现细节，写进本文档防止以后被合并简化时误删。
- **跳过机制（新增强制要求）**：Arrival Practice 必须提供整体跳过 + Notice/Choose 各自独立跳过的路径，不能是不可跳过的强制流程——项目至今没有任何强制交互，这次不能开先例。
- **"You don't have to answer" 提示语**：不新增解释性文案，复用 Reflection Moment 已验证的 Skip/Continue 同级按钮 / 可发现的跳过入口模式。如仍需要一句轻量提示，用 "Optional." 或 "Skip anytime."，不用完整句子。

### 命名对齐
- **"Arrival Practice"**（v2 新名字，采纳）：指 Arrive Moment 里"点 Sit with Yin 之后、开始计时之前"的这一整套流程（欢迎+Notice+呼吸+Choose）。**注意与 Honesty Check-in 区分**：后者是按天触发、内容关于"是否在别处练习过"的既有功能，两者并存，不是改名替换关系。
- "Morning Check-in" → 不采用这个名字（无论指代 Honesty Check-in 还是 Arrival Practice），因为 "Morning" 暗示时间绑定，与"regular practice, at your own pace"原则冲突。
- "Return" → 文档层继续用 "Recover"（PRODUCT_MOMENTS.md 已定），"Return" 可以作为用户可见文案里的动词（如提示文字 "You're back."），与 "Sit with Yin/Rise" 是用户动词、"FocusSession/StateManager" 是内部代码名的既有分层一致。
- **触发时机确认**：Arrival Practice 挂在"点击 Sit with Yin"，不是"打开 App 就触发"——打开 App 只看环境细节进度或调设置的场景不应被强制走一遍流程。

### Recover 与 `welcomeBack` 边界（2026-07-18 已拍板）

**叙事中间态：统一「怎么讲」，不合并实现。**

| | Recover 家族 | `welcomeBack`（wave-hello） |
|---|---|---|
| **是什么** | 会话内、与分心 / 注意力相关的回归 | Idle 生命感偶遇（陪伴有呼吸） |
| **成员** | 已有：Re-focus Acknowledge；未来：用户主动发起的 Recover | **明确不进** Recover 家族 |
| **触发** | 离页/失焦回归、或用户主动拉回 | 约 10 分钟无互动后 30% 挥手等 |
| **代码** | 情绪键 / 触发器 / 提醒限频池 **继续分开**；不因叙事统一而合并类或共用额度 | 同左：独立键与触发，**不占** Re-focus 提醒池 |

- 用户可见动词可用 "return / You're back."，文档与产品结构名仍用 **Recover**。
- Companion Mode 的 step-away / across-tools 关闭的是 **Recover 侧**（Re-focus），不是偶遇挥手；二者不得混为一谈。
- 禁止把 `welcomeBack` 改写成「你刚才不够专注」类 Recover 文案。
