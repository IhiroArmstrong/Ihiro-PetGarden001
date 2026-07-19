# ONBOARDING_HINTS.md — 分散式即时提示（完整版）+ 常驻补救入口

创建日期：2026-07-19（v3：按 SCENARIO_TESTS 故事补全「下一步该干啥」；对齐产品文案 Here & Now / Offline Space / Flow State）
结论：不做集中式引导浮层/coachmark 教程，改为两层机制配合：
1. **即时提示**：每个功能第一次真正出现时，用阿寅自己的文字气泡多带一句极简说明，用完即隐藏。
2. **补救入口**：界面角落一个极小的常驻「?」图标，点击后用同样的气泡样式，把当前场景该有的提示再说一遍——防止用户第一次没看进去就永久错过。

原则：不强迫用户读说明书；尽量做成**傻瓜交互式**开头——每一步只回答「此刻点哪里 / 可以跳过吗 / 点了会发生什么」。

---

## 一、完整提示点清单（按 Kelly 首日旅程 + 回流）

文案为过观察式四项自检后的**可上线稿**（描述可做之事，不评判用户状态）。

| hintId | 场景（对应故事） | 提示 EN / ZH | 自动出现时机 | 完成操作后记已读 | 补救可调 |
|---|---|---|---|---|---|
| `dormant-open` | A1 睡着的阿寅 | "Yin is resting. Sit when you feel ready." / 「阿寅在歇着。准备好了，再同坐。」 | 当日 DORMANT 且尚未开始过会话 | 点 Sit / How shall we sit? / 进入 Honesty | 是 |
| `honesty-optional` | A2 / D Honesty 提示 | "This check-in is optional — Sit still works." / 「这段补登可以略过，直接同坐也行。」 | 首次看到 Honesty 可忽略提示 | 点 Sit 忽略，或点进补登 | 是 |
| `sit-button` | A2 主 CTA | "Tap to sit with Yin." / 「点击与阿寅同坐。」 | 空闲且从未开过会话 | 点 Sit | 是 |
| `how-shall-we-sit` | 故事 I | "Or begin from here." / 「也可以从这里开始。」 | 首次看到 How shall we sit? 且门闩未就绪 | 点该钮或完成 Arrival | 是 |
| `notice` | A3b | "A tap is enough — or skip ahead." / 「点一下就好，也可以跳过。」 | 首次 Notice | 点选图标或 Skip | 是 |
| `breathing` | A3c | "Just breathe with Yin. Nothing else to do." / 「跟着阿寅呼吸就好，不用做别的。」 | 首次呼吸 beat | 呼吸结束或 Skip | 是 |
| `choose` | A3d | "Choose one — or type your own." / 「选一个，也可以自己写。」 | 首次 Choose | 确认/Skip | 是 |
| `companion-mode` | A4 面板 | "Pick one — the timer starts." / 「选一个，计时就会开始。」 | 首次展开三选一 | 点选任一模式 | 是 |
| `companion-stay` | A4 Here & Now | "Yin stays quiet nearby unless you are away a while." / 「你在时阿寅不多打扰；离开一阵才会轻轻留意。」 | 首次看到该选项（面板打开） | 点选 Here & Now | 是 |
| `companion-away` | E Offline Space | "Check-ins pause while you are away. Sit again when ready to begin." / 「离开时提醒会暂停。准备开始时再点同坐。」 | 首次看到该选项 | 点选 Offline Space | 是 |
| `companion-across-tools` | F Flow State | "Away reminders stay off in this mode." / 「这个方式下，离开提醒会保持关闭。」 | 首次看到该选项 | 点选 Flow State | 是 |
| `ambient-gated` | A5 未计时点 Sound | "Sound opens after sitting begins." / 「同坐开始后，声音才会打开。」 | 首次在未 FOCUSING 时点 Sound | 看到提示后即记已读 | 是 |
| `ambient-soundscape` | A5 Sound FAB / 面板 | "Playing music gently brightens Yin's glow." / 「播放音乐时，阿寅的光会慢慢亮一点。」 | 首次进入 FOCUSING 见到 Sound，或首次展开曲目面板 | 选曲或关面板 / 本场结束 | 是 |
| `rise-button` | C Rise | "Rising early is welcome too." / 「中途起身，也完全可以。」 | 首次 FOCUSING 见到 Rise | 点 Rise 或完成本场 | 是 |
| `reflection` | A10 / C | "Answer if you like — skipping is fine." / 「愿意就答；跳过也可以。」 | 首次进入 Reflection | 答完/跳过关闭 | 是 |
| `idle-after-session` | A11 结束后 | "Sit again whenever you like." / 「想再坐的时候，随时可以。」 | 首次会话结束回到空闲 | 再次 Sit 或离开页 | 是 |
| `help-fallback` | 补救兜底 | "Sit with Yin when you are ready." / 「准备好了，就与阿寅同坐。」 | （仅补救，不自动） | — | 是 |

共 **16** 个可自动提示 + **1** 个兜底。旧稿「Stay here / I'll step away」已改为产品键名。

### 音乐与光效（对应 ambient-soundscape 文案）

代码已有 `presenceBoost`（可闻播放时长叠 Rim）。v3 起另加：**正在播放时**立刻给边缘光一层缓亮 lift，使文案与体感一致（见实现）。

---

## 二、补救入口设计

- **位置**：左下角极小「?」（与右下 Sound 对仗，不抢主视觉），常驻。
- **交互**：按**当前界面**只复述上表对应一句；无匹配时用 `help-fallback`。
- **与即时提示**：即时「用完即隐藏」；补救不受已读限制。

### 气泡视觉（与按钮/输入框区分）

- 漫画说话框：圆角 + **小尖角**指向对应控件（Rise → `#btn-focus`；Sound → FAB；Reflection → 面板**上方**，不挡 Skip）。
- 浅绿灰填充 + 斜体衬线，避免与 Continue / 输入框同款米黄圆角胶囊。
- 可同时显示多条未读提示（例如 FOCUSING 时 Rise + Sound 各一条）。

### 点击关闭（硬性）

- **所有**提示气泡（含「?」补救拉出的）**必须**允许鼠标点击气泡本身后**立刻消失**。
- 自动出现的提示：点击 = 记已读（`hints-seen`）+ 隐藏，之后该条不再自动出现；「?」仍可再调。
- 补救提示：点击仅隐藏，不改已读状态（补救本就不看已读）。
- 不另做「知道了」按钮；点气泡即关闭。键盘 Enter / Space 同等。

---

## 三、实现约束（不变）

1. 不新建教程浮层（遮罩、高亮、箭头、分步导航）。
2. 不做集中式引导流程；每条独立触发。
3. 每条独立记忆已读。
4. 提示无需单独「知道了」按钮；**点击气泡立刻关闭**（见上节）；完成对应操作亦记已读。
5. 「?」足够小、安静，不像帮助中心。

---

## 四、数据存储

```
localStorage key: focus-tiger.hints-seen.v1
结构：{ [hintId: string]: true }
hintId：见第一节表
规则：首次对应操作完成后写入 true；**用户点击气泡关闭也写入 true**（自动提示）；补救入口不受已读限制。
```

---

## 五、Cursor 实现 Prompt

```
基于 ONBOARDING_HINTS.md v3，实现分散式即时提示 + 常驻补救入口：

1. 新增本地存储 focus-tiger.hints-seen.v1（第四节）；hintId 以第一节完整表为准（含 dormant-open、honesty-optional、how-shall-we-sit、ambient-gated、idle-after-session 等）。
2. 各位置在现有 UI 旁用安静气泡追加一行小字；仅未读时自动出现；完成对应操作后 markSeen 并隐藏。
3. 常驻角落「?」补救入口：按当前场景 resolve hintId 并强制展示；永不因已读而隐藏入口本身。
4. **点击气泡立刻消失**（硬性）：自动提示点击 = markSeen + 隐藏；补救点击仅隐藏。pointer-events 可点；无需单独「知道了」按钮。
5. 禁止教程类 UI（遮罩、高亮、箭头、分步导航）。
6. 文案用第一节已过观察式自检的中英稿，写入 locales。
7. 确认 Ambient 播放时 Rim 有可见缓亮（累计 presenceBoost + 正在播放 lift）；补单测。
8. 实验室 debug 面板增加「清空 hints-seen」；仅非 ?product=1。
9. 单元测试：首次显示、已读不再自动显示、补救始终可调、hintId 互不干扰、resolveScene、点击关闭。
10. 更新 TEST_TRACKER.md；更新 PRODUCT_MOMENTS.md 说明为何不做集中式引导。
11. 产品壳 ?product=1 仍显示「?」与即时提示（属于产品表面，不是实验室调试条）。
```