# SCENARIO_TESTS.md — 用户场景操作故事测试脚本

> **已归档（2026-07-20）**：本文件为纠偏底稿「有待核对-SCENARIO_TESTS720」。  
> **请勿再改。** 权威正文：`focus-tiger/docs/SCENARIO_TESTS.md`。  
> 仓库根 `SCENARIO_TESTS.md` 仅为指向 docs 的指针。

创建日期：2026-07-19
定位：这份文档和 TEST_TRACKER.md 不是替代关系，是两个层级——TEST_TRACKER 是"每个
功能点单独测试"的清单，本文档是"把功能点串成一次真实使用故事"的剧本，很多 bug
只有在功能连起来走的时候才会暴露（比如 A 功能结束后该不该触发 B 功能）。建议两份
一起用：走完一个场景故事后，回头把涉及到的功能点在 TEST_TRACKER 里勾掉。

**重要提示**：部分步骤对应的功能仍在"已知未完成"状态（本文档已逐条标注），走到
这些步骤时看到"没反应"或"和预期不符"，不代表新 bug，是已知缺口，不要重复报告。

---

## 场景 A：Kelly 的第一个早晨（全新用户，当日 DORMANT）

*（2026-07-19 已按 Cursor 代码核对结果更正，见文末变更记录）*

1. 打开 App，因为当日 DORMANT（尚无完成记录），第一次看到的应该是**阿寅睡着的
   样子（sleeping）**，不是 idle-breathing——DORMANT 状态下的默认呈现是睡眠，
   不是清醒静坐。
2. 应该看到 Honesty Check-in 的可忽略提示（"Did you practice elsewhere?"）。
   Kelly 决定直接开始，不理会提示，点击 **Sit with Yin**。
3. Arrival Practice 展开：
   a. 欢迎 beat（~2秒文字气泡）
   b. Notice：六个状态图标（Calm/Okay/Busy Mind/Stressed/Low Energy/Not Sure），
      Kelly 点了 "Okay" → 应看到 Yin 一句观察式回应（如 "Things feel okay today."）
   c. 呼吸 beat（~5秒，无倒计时，跟随呼吸律动）
   d. Choose：六个活动图标（Reading/Deep Work/Creative Work/Meditation/Writing/
      Just One Small Step），Kelly 点了 "Deep Work" → 应看到 palms-together
      合十确认动作播放一次
4. Companion Mode 三选一展开，**实际文案是 "Here & Now" / "Offline Space" /
   "Flow State"**（不是早期设计稿里的 Stay here / I'll step away / I'm working
   across tools，本文档已全部更正为实际文案），Kelly 选 **Here & Now**。
5. 确认后计时开始，可以顺手展开角落的 Ambient Soundscape 面板，选一首播放。
6. 全程不切换标签页、不动鼠标，观察 idle 期间表现。**注意：目前正式接入的
   idle 循环只有"呼吸×5次→眨眼"这一套，gaze-p1~p4 张望组合、yawn-stretch、
   tea-drinking、ear-wiggle-head-touch 等素材均已入库但尚未接入 IdleOrchestrator
   随机池**——如果没看到这些变体出现，不是概率没命中，是本来就还没接线，
   不用干等。
7. 达到目标时长 → **当日首次触发完整 Celebrating**（celebrate-dance 或
   dance-v2 随机二选一）；**如果是当天第二次及以后达标，触发的是轻量的
   SessionComplete，不是完整 Celebrating**——这条分级逻辑已经接好了，
   不是缺口，走场景 A 第二遍时应该能看到区别。
8. IncenseGreeting（莲花+金色粒子）：**目前仍只有调试入口，正式业务流程里
   还不会自动播放**，走到这一步看不到莲花动画是正常现象，不要报告成 bug。
9. 进入 Reflection Moment：开头先看到 Choose 内容回显（"Attention toward:
   Deep Work" / "注意力所向：Deep Work"），然后三问逐题出现，每题可独立跳过，
   Kelly 答了第一题、跳过后两题。
10. 回到相应状态（idle-breathing 或 sleeping，取决于当日是否还有后续会话），
    Honesty Check-in 的提示今天不应再出现（DORMANT 已清除）。

---

## 场景 B：分心后自己走神又回来（Recover / Re-focus Acknowledge）

1. Kelly 当天第二次点 Sit with Yin 开始新会话（Arrival Practice 走一遍，
   Companion Mode 选 Stay here）。
2. 计时进行中，Kelly 切换到另一个浏览器标签查看邮件，超过 60 秒后切回。
3. 应观察到：非模态文案条 + nod-bow（鞠躬）动作播放，文案应为观察式语气
   （不是"你走神了"这类评判性表达）。
4. **更正**：Re-focus 触发**会占用** MindfulAcknowledge/stretchReminder 共享的
   每日提醒额度（上限 3 次），不是独立于共享额度之外——这条是原始设计就定好
   的规则（三类提醒共用自然日额度），之前版本的剧本写反了，已更正。Re-focus
   本身另有"每场会话最多 1 次"的独立限制，这条不变，但它同时也计入共享额度。
5. 继续完成本次会话。

---

## 场景 C：中途主动放弃（未达标）

1. 开始新会话，进行到一半，Kelly 觉得今天状态不好，点击 **Rise**。
2. 不应播放 Celebrating，不应播放 IncenseGreeting。
3. 应该看到短暂留白后，直接淡入 Reflection Moment（不经过完成反馈动画）。
4. 如果本次 Choose 选了内容，回显仍应正常显示（回显与是否达标无关，两条
   路径都回显——这是此前已拍板的规则）。
5. 三问正常可跳过。

---

## 场景 D：请假一天后的 Honesty Check-in

1. 第二天，Kelly 一整天没打开 App，直到晚上才想起来打开。
2. 当日 DORMANT，应看到可忽略提示。这次她选择不忽略，点击进入。
3. 选择练习时长（10/20/30+ 分钟），Kelly 选 "20"。
4. 10 秒呼吸引导播放。
5. dormantWake（伸懒腰）动作播放。
6. DORMANT 状态清除，今天不强制她再做一次正式 FocusSession——确认她仍然
   可以选择再点 Sit with Yin 做一次真实会话，两者不冲突。

---

## 场景 E：Offline Space 模式（原设计稿称 I'll step away）

1. 开始会话，Companion Mode 选 **Offline Space**。
2. 离开电脑 10+ 分钟不操作。
3. **已知缺口**：文档设计里"无互动约10分钟触发 waveHello"的自动触发器尚未
   实现，目前只有调试入口——如果回来后没有看到 wave-hello 播放，这是已知
   状态，不是新 bug；只需确认离开期间**没有**触发 Re-focus 提醒（因为
   suppressAwayReminders 应该生效）。
4. 回来后手动继续/结束会话，确认活跃累计计时在离开期间是否正确暂停。

---

## 场景 F：Flow State 模式（原设计稿称 I'm working across tools）

1. 开始会话，Companion Mode 选 **Flow State**。
2. 频繁切换到其他应用/标签页（模拟多任务工作），每次间隔控制在 30 分钟
   累计阈值以内。
3. 确认全程**不**触发任何离开类提醒（关闭 away 提醒是这个模式的核心设计）。
4. **更正**：宽松 idle 兜底阈值**已确认为 30 分钟**，不再是开放待定项——
   如果单次离开累计超过 30 分钟，确认是否正确出现宽松 idle 兜底提示。

---

## 场景 G：语言切换

**更正**：目前**没有应用内的语言设置界面**，不能在"设置"里点切换。测试方式改为：
浏览器控制台执行 `__i18n.setLocale('zh')` / `__i18n.setLocale('en')`。

1. 在浏览器控制台执行 `__i18n.setLocale('zh')`，切换到中文。
2. 重新走一遍场景 A 的 Arrival Practice + Reflection 流程，确认所有文案
   （欢迎语、Notice 回应、Choose 提示、回显文案、三问）都正确切换成中文，
   没有遗漏的英文残留或变量未替换（如显示成 "{intention}" 这类占位符）。
3. 执行 `__i18n.setLocale('en')` 切回英文，重复确认。

---

## 场景 H：正式瞳孔跟随功能

**已废弃，不需要测试**——2026-07-18 已确认放弃 EyeTracking 实时跟随鼠标方案
（原因见 CORE_LOOP.md），如果界面上还能看到瞳孔跟着鼠标动，说明回退没做干净，
这个反而要报告。

---

## 给 Cursor 的 Prompt

```
请对照 SCENARIO_TESTS.md 里的场景 A-G，逐条核对当前代码实现是否与描述一致，
重点关注：
1. 每个场景里标注"已知缺口"的步骤，确认代码现状确实如描述（没有被偷偷实现
   又没更新文档，或者反过来文档过时了）。
2. 场景 G/F 涉及的宽松 idle 兜底阈值等具体数值，请如实报告代码里当前的实际
   数值，不要假设。
3. 场景 H 请确认 EyeTracking 回退是否彻底（界面上不应再有任何瞳孔跟随鼠标
   的表现）。
4. 对于场景里依赖概率触发的步骤（idle 变体、blink-smile 等），请提供一个
   仅调试环境可用的"强制触发"入口或参数，方便测试时不用干等概率命中，
   同时确保这个调试入口不会出现在生产构建里。
5. 核对完成后，在 TEST_TRACKER.md 里补充/更新对应功能行的状态，不要重复
   已有条目。
```

---

## 变更记录

**2026-07-19**：根据 Cursor 对照代码的核对结果，更正以下过时内容：
- A1：DORMANT 状态下默认呈现应为 sleeping，不是 idle-breathing
- A4/E/F：Companion Mode 三个选项实际文案为 "Here & Now" / "Offline Space" /
  "Flow State"，全文已替换旧版设计稿文案
- A6：正式接入 IdleOrchestrator 的 idle 变体目前只有"呼吸×5→眨眼"，
  gaze-p1~p4、yawn-stretch、tea-drinking、ear-wiggle-head-touch 均已入库
  但尚未接线，走场景时不应假设这些会出现
- A7（原 A8）：每日首次 Celebrating vs 后续 SessionComplete 的分级逻辑
  **已接线**，此前标注的"缺口"是错的，已更正
- A8（原 A9）：IncenseGreeting 自动播放**仍未接线**，此前描述成"应该播放"
  是错的，已更正为"仍是调试态"
- B4：Re-focus 触发**会占用**共享每日提醒额度（上限3），此前"不算共享额度"
  的描述与原始设计相反，已更正
- F4：Flow State（原 across-tools）宽松 idle 兜底阈值**已确认为 30 分钟**，
  不再是开放待定项
- G：目前无应用内语言切换 UI，测试方式改为浏览器控制台 `__i18n.setLocale()`
- H：EyeTracking 回退已确认干净，无需改动
