# 近十天合并代码 · 对抗审计报告（2026-09-30）

> **性质**：只读审计，**未改任何运行时代码**，未开 PR 改动、未跑 e2e。
> **范围**：`origin/develop` 从 `2567ab98`（2026-09-20）到 tip，共 141 条 merge 提交。
> **四条轴**：安全路由 · 叠层是否互相挡住 · 知识库检索 · 语音朗读。
> **证据脚本**：`focus-tiger/.tmp/audit-probe-2026-09-30.mjs`（只 import 现网模块，不写盘）。

---

## 0. 结论速览

| # | 轴 | 结论 | 严重度 | 能否写确定性测试 |
|---|---|---|---|---|
| A-1 | 安全路由 | 危机改写句（不含关键词）走 generate，且**会被朗读出来** | 高 | 能（路由 + 朗读闸各一条） |
| A-2 | 安全路由 | `shouldSpeakConfideReply` 是**黑名单**；`'generate'` 不在枚举里，新路由默认「可朗读」 | 高 | 能 |
| A-3 | 安全路由 | `matchesSafetyRedirect` 纯子串匹配，"suicide prevention" 误判为危机 | 中 | 能 |
| K-1 | 知识库检索 | near-match 的 `farMax=0.62` **已经在现网生效**，把「产品问题但库里没有」从诚实空态改判成 generate；注释却写 "Unused by the live path" | 高 | 能 |
| K-2 | 知识库检索 | ~~单关键词 score=1 绕过 `MIN_SCORE = 2`~~ **定性错误，已更正**：分数 1 是 27 条已锁锚点的正常命中方式，缺陷只是常量注释在说谎 | ~~中~~ 低（文档） | 能（钉真实契约） |
| K-3 | 知识库检索 | 36 条目录只有 `shortAnswerEn`；ja / zh 用户拿到英文短答 | 中 | 能（结构断言） |
| K-4 | 知识库检索 | 未命中时把**用户原文前 200 字**写进 `turns.jsonl`，函数自己的注释说「不含用户自由文本」 | 高（隐私契约） | 能 |
| Z-1 | 叠层 | `#ui-overlay`(z10) 内的 z42 / z40 toast 会被 body 上的 z35/z36 面板整体盖住 | 中 | 能（DOM 层级断言） |
| Z-2 | 叠层 | `SystemTtsPreferenceUI` 用 `z-index: 12050`，超出登记表整个量纲且**未登记** | 中 | 能（静态扫描） |
| Z-3 | 叠层 | 近十天新增 6 个 fixed/absolute 叠层，`Z_INDEX.md` 只补了 1 行 | 中 | 能（静态扫描） |
| Z-4 | 叠层 | `FocusSitAdjustUI`(z11) 低于 `ActiveRecoverAnchorUI`(z12) 的隐形命中层，且与 `OpenEndedNudgeUI` 同在左列可能几何重叠 | 待验证 | 半（几何要人眼） |
| T-1 | 语音朗读 | 连发两条时不打断上一条朗读，两段语音叠着念 | 中 | 能 |
| T-2 | 语音朗读 | 专注结束播报与 Confide 朗读互不知情，可同时出声 | 中 | 能 |
| T-3 | 语音朗读 | 开关写盘失败时静默回滚勾选框，用户看不到失败态 | 中 | 能 |
| T-4 | 语音朗读 | `SystemTtsPreferenceUI` 没有 `destroy()`，document 级 `pointerdown` 捕获监听与 locale 订阅都不解绑 | 低 | 能 |
| T-5 | 语音朗读 | `WIDE_STAGE_CLASS.systemTts` 加到 `body` 上但**没有任何 CSS 消费**，是死开关 | 低 | 能 |

---

## 1. 安全路由

相关合入：#1029 `fix/confide-reply-routing-2026-09-30`、#995 `feature/confide-tts-v1`、#908 `feature/confide-stage2-semantic-cutover`、#938 `feature/confide-kb-routing-matrix`。

### 结构上是对的部分

- `confideClassify()` 把安全判定放在**第一位**，早于攻击性、早于情绪桶（`src/core/confide/confideClassify.js:37`）。
- KB 路径要求 `route === FALLBACK`（`confideProductKnowledge.js:109`），所以危机句不会掉进知识库短答。
- Stage 2 语义覆写显式豁免安全与攻击性两条路由（`confideSemanticStage2.js:65-70`）。
- YPE、陪伴在场、静思等消费者都各自挡了 `SAFETY_REDIRECT`。

**这一层的纵深防御是成立的**，问题不在「安全路由被别的东西抢走」，而在「根本没被判成安全路由」之后会发生什么。

### A-1（高）危机改写句 → generate → 被朗读

`matchesSafetyRedirect` 是一张固定短语表（`confideSafetyKeywords.js:13-55`）。实测（探针 C 段）：

| 输入 | 判为安全？ | 实际路由 |
|---|---|---|
| `I want to kill myself` | 是 | `safety_redirect` |
| `I do not see the point of being here anymore` | **否** | `fallback` |
| `I want to disappear forever` | **否** | `fallback` |
| `maybe everyone would be better off without me` | **否** | `fallback` |
| `我撑不下去了` | **否** | `fallback` |
| `我不想醒来了` | **否** | `fallback` |

掉到 `fallback` 意味着两件事同时发生：

1. 交给本地模型自由生成（`ConfideToYinUI.js:1089-1091`，该分支写死 `route: 'generate'`）；
2. 生成结果进 `_showReply` → `_maybeSpeakConfideReply`（`ConfideToYinUI.js:762`）→ **朗读出来**。

也就是说，安全网漏掉的那一类句子，恰好是唯一会被「模型自由发挥 + 出声念给用户听」双重放大的一类。这是四条轴里我认为最该先上测试的一条。

> 注：这不是说要把关键词表扩到能覆盖所有改写——扩表会带来 A-3 那类误判。可确定性测试的是**结构**：`'generate'` 路由在朗读闸里必须显式出现，而不是靠没被列进黑名单。

### A-2（高）朗读闸是黑名单，默认允许未知路由

> **2026-09-30 更正**：本节初稿把 `'generate'` 写成「漏掉了」，暗示它不该朗读。这是错的，见下方「更正与落地记录」A-2。`'generate'` 确实该朗读；真正的缺陷只是**默认值**。

```34:39:focus-tiger/src/core/systemTtsBridge.js
export function shouldSpeakConfideReply(route) {
  return (
    route !== CONFIDE_ROUTE.SAFETY_REDIRECT &&
    route !== CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
  );
}
```

两个问题叠在一起：

- **默认允许**。以后任何新增路由（危机相邻、边界拒绝、未成年保护等）不改这里就自动可朗读。
- **`'generate'` 不是 `CONFIDE_ROUTE` 的成员**，是 `ConfideToYinUI.js:1091` 里的裸字符串。枚举上加一条安全路由不会自动覆盖它。

改成白名单是结构性修法。**已于当晚落地**（PR #1036 · `dee156cc`）：白名单 = 五个情绪桶 + `fallback` + `generate`，两条危机路由仍纯文字，未登记 id 默认静音。九个现存 route id 行为零变化。

### A-3（中）子串匹配造成误判

`matchesSafetyRedirect` 对英文做 `haystack.includes(needle)`，无词边界、无否定处理。实测 `I read an article about suicide prevention today` → `safety_redirect`。用户会收到危机资源文案。按 `PRINCIPLES.md`「禁止 Confide 对不确定要不要谈的人主动贴心理状态标签」，这属于误伤方向。

同一机制下 `self harm` 会命中 `self harmony`、`hurt myself` 会命中引述句。CJK 侧 `自杀` 会命中「自杀式加班」这类比喻。

---

## 2. 知识库检索

相关合入：#1022 `feature/kb-near-match`、#992 `docs/kb-embedding-near-match`、#1016 `feature/kb-reminder-functional-bucket`、#999 / #998 / #996 / #984 目录批次、#924 `feature/confide-kb-retrieval-wiring`。

### K-1（高）near-match 的 `farMax` 已在现网改写诚实空态

`kbNearMatch.js:22` 写着：

```21:22:focus-tiger/src/core/confide/kbNearMatch.js
/** Unused by the live path. Live miss still uses the existing product gate. */
export const DEFAULT_KB_NEAR_FAR_MAX = 0.62;
```

但现网调用链是：`ConfideToYinUI.js:1549` 调 `decideKbNearMatch`（不传 env 覆写，吃默认值）→ 得到 `nearAction` → 传进 `resolveProductKnowledgeGateAction`，后者在 `embeddingState === 'ready'` 时**第一件事就是看 `nearAction`**：

```121:126:focus-tiger/src/core/confide/confideProductKnowledgeSemantic.js
  if (embeddingState === 'ready') {
    if (nearAction === 'skip') return 'skip';
    if (nearAction === 'honesty') return 'honesty';
    if (!semanticIsProduct) return 'skip';
    return 'honesty';
  }
```

实测（探针 B 段，`semanticIsProduct: true`）：

| 最近邻余弦 | `nearAction` | 最终 gate |
|---|---|---|
| 0.85 | hit | honesty（因为探针未给 `catalogHit`） |
| 0.70 | honesty | honesty |
| **0.61** | **skip** | **skip** |
| 0.30 | skip | skip |

`skip` 的含义是**放行去 generate**。所以：语义闸已经判定「这是一个产品问题」，但最近邻低于 0.62 时，系统不再说「这个我没有经过审核的答案」，而是让本地模型即兴编一个产品答案。这正好是 `product-knowledge-base.md`「检索不生成」要挡的情况，也是你今晚点名想锁的「知识库未命中时的诚实空态」。

`farMax` 那行注释与代码直接矛盾——注释说不参与现网，代码里它就是现网第一道分支。

> **2026-09-30 更正（重要，影响能不能改）**：本节初稿把 K-1 写成「疏漏」。复核后它不是疏漏，而是一处**被已提交测试锁住的、且与自己的 Brief 相矛盾的设计**：
>
> - `confideProductKnowledgeSemantic.test.js:53-62` 已经在断言 `nearAction: 'skip'` + `semanticIsProduct: true` → `'skip'`。也就是说现在这个行为是有人特意写用例钉住的，不是忘了。
> - 而 `task-briefs/task-confide-kb-embedding-near-match.md` 自己前后不一致：§三 第 3 行写「都远 → 不当成产品问题，去现写」（支持现有代码），但同文件 2026-09-30 的状态行和 §五 写「对不上就诚实空态，不改回自由生成」「禁止滑回自由生成」，§二 非目标又写「不把『查不到』改回自由生成」（支持改）。
>
> 因此 K-1 **不能按「修 bug」直接动**：改它会让那条已提交断言变红，等于推翻上一位作者的显式决定。按 `feature-conflict-review`，这是文档 vs 测试的冲突，需要你先拍板哪一边算数，再动代码。已在「待你决定」列出两个选项。

### K-2（中）单关键词 score=1 直接命中，绕过 `MIN_SCORE = 2`

```220:236:focus-tiger/src/core/confide/confideProductKnowledge.js
  if (top.score < CONFIDE_KB_RETRIEVAL_MIN_SCORE) {
    if (top.score < 1) return null;
    if (runner && top.score - runner.score < CONFIDE_KB_RETRIEVAL_MIN_MARGIN) {
      // …并列时才走 concept tie-break 或返回 null
    }
  } else if (runner && top.score === runner.score) {
    // …
  }
  return { id: top.id, shortAnswerEn: top.shortAnswerEn };
```

`top.score === 1` 且**没有 runner-up** 时，两个 `if` 都不拦，直接落到最后一行返回命中。实测 `backup` → `KB-FUNC-0003`（score 1，无并列）。常量注释写的是 "Minimum keyword score to treat as a hit (high bar)"，实际下限是 1。

影响：一个泛词就能触发一条被当成权威的短答，而且短答一旦命中就**优先于**语义闸（`resolveProductKnowledgeGateAction` 第一行 `if (catalogHit) return 'hit'`）。

> **2026-09-30 更正（本节定性是错的）**：上面「实际下限是 1」的观察属实，但**「这是缺陷」的判断错了**，而且错在根子上——我把 `MIN_SCORE = 2` 读成了命中地板。
>
> 实现时按这个定性去执行，`confideKbRoutingMatrix` 里 **27 条已锁锚点**当场从命中知识库掉成诚实空态：
>
> ```
> kb-0001-how-zh · kb-0001-how-en · kb-0002-where-zh · kb-0002-where-en ·
> kb-0002-what-is · kb-0003-where-zh · kb-0004-what-hud · kb-0005-cancel ·
> kb-0008-what · kb-0011-diff-zh · kb-0011-diff-en · kb-0012-where-zh ·
> kb-0013-where-zh · kb-0014-where-zh · kb-0014-how · kb-0016-unload-zh ·
> kb-0017-desktop · kb-0018-coins-word-order-spaces · kb-0020-honesty-short-zh ·
> kb-0020-honesty-en · kb-0021-daily-quote-short-zh · kb-0023-wallpapers-zh ·
> kb-0023-wallpapers-en · kb-0025-emotional-reset-short-zh ·
> kb-0027-quiet-together-zh · kb-0028-focus-circle-zh · kb-0030-sanctuary-nav-en
> ```
>
> 也就是说，**知识库绝大多数正常问法本来就靠分数 1 命中**。`MIN_SCORE` 从来不是命中地板，它是「有争议时才需要拉开差距」的线。真实规则：
>
> - 分数 ≥ 2 → 命中（完全并列时走科普 / 功能逃生口）
> - 分数 = 1 且**无人争** → 命中（27 条锚点依赖）
> - 分数 = 1 且**有人争**（差距 < `MIN_MARGIN`）→ 逃生口或 `null`
> - 分数 < 1 → `null`
>
> 所以 K-2 不是逻辑缺陷，是**常量注释在说谎**，而审计跟着注释一起判错。已改为只修注释 + 加用例钉住真实契约，运行时零变化（PR #1040）。
>
> `backup` 这类裸产品名词仍返回短答。要不要压掉它是另一件事，判据不能是分数（分数拦不住它，也拦不住那 27 条），得是「这句话像不像一个问句」。PO 2026-09-30 决定**不做**，作为已知项记入 tracker。
>
> **给后来人的教训**：`MIN_SCORE`、`MAX_*`、`*_THRESHOLD` 这类名字加上一句自信的注释，很容易被当成契约读。下判断前先跑一次真实夹具，看它到底拦住了谁。

### K-3（中）短答只有英文

`productKnowledgeCatalog.json` 全 36 条只有 `shortAnswerEn` 一个文案字段（`rg -o '"shortAnswer[A-Za-z]*"' | sort -u` 只有一项）。`getRetrievableProductKnowledgeEntry` 也只返回 `shortAnswerEn`。日文 / 中文界面下命中知识库会突然蹦出英文段落。

这条与「文案走 `src/locales/*.json` + `t()`」的架构硬性摘要不一致——知识库短答是唯一绕过 locale 层直接进对话气泡的产品文案。

### K-4（高）诚实空态顺手把用户原文写进 `turns.jsonl`

```296:308:focus-tiger/src/core/confide/confideProductKnowledge.js
/**
 * turns.jsonl / observation miss row (no user free text beyond query hash).
 */
export function buildKbRetrievalMissTurnLog({ text, reason, locale = 'en' }) {
  return {
    at: new Date().toISOString(),
    kind: 'kb_retrieval_miss',
    locale,
    text: String(text || '').slice(0, 200),
    reason,
    catalogSchemaVersion: catalog.schemaVersion
  };
}
```

注释承诺「不含用户自由文本，只有 query hash」，实现直接存原文前 200 字。调用点 `ConfideToYinUI.js:1585-1592` 通过 companion bridge `appendTurnLog` 落盘。

Confide 的输入正是用户情绪与私事。这条虽然不在你点名的四轴之一，但它就长在「知识库未命中」这条路径上，属于顺带发现，建议单独立项。

---

## 3. 叠层是否互相挡住

相关合入：#986 `feature/sanctuary-home-nav-chrome`、#1021 `fix/sanctuary-nav-escape-import`、#1013 `feature/system-tts-global-switch`、#1015/#1017/#1023 voice-command slices、#1018 `fix/voice-undo-toast-hit`、#1005 `feature/open-ended-focus-slice2`、#1025 `feature/pomodoro-kb-and-sit-adjust`、#956 `feature/today-direction-help-and-options-version`。

### Z-1（中）`#ui-overlay` 内的高 z 值是假的

`#ui-overlay` 自己是 `z-index: 10`，形成独立层叠上下文。挂在它里面的元素，z 值只在内部比较：

| 元素 | 挂载点 | 声明 z | 实际参与全局比较的值 |
|---|---|---|---|
| `VoiceCommandUndoToast`（`main.js:1066`） | `#ui-overlay` | 42 | 10 |
| `MindfulAcknowledgeToast`（`main.js:1063`） | `#ui-overlay` | 40 | 10 |
| `HomeSanctuaryNavFanUI` backdrop / fan（`main.js:1824`） | `document.body` | 35 / 36 | 35 / 36 |
| `SystemTtsPreferenceUI` panel（`main.js:1352`） | `document.body` | 12050 | 12050 |

后果：语音启动专注后那条 5 秒「撤销」条（z42）在**语义上**是最高层，实际会被导航扇的遮罩（z35，body）整片盖住并吞掉点击。语音下达指令 → 扇形导航 → 想撤销，这条路径里撤销按钮点不到。

这条恰好是 #1018 `fix/voice-undo-toast-hit` 想解决的同族问题的另一半：那个 PR 修的是「静止态 `display:flex` 抢点击」（`VoiceCommandUndoToast.js:12-26`，修得很干净），没有覆盖「被别人盖住」这一侧。

### Z-2（中）`z-index: 12050`

```153:157:focus-tiger/src/ui/SystemTtsPreferenceUI.js
      .system-tts-pref__panel {
        position: fixed;
        right: max(16px, env(safe-area-inset-right));
        bottom: max(16px, env(safe-area-inset-bottom));
        z-index: 12050;
```

`Z_INDEX.md` 全表最高的产品层是 `#loading-mask` 的 100，并且「常用冲突带」明写「勿把常驻 chrome 抬到 40+，除非确要盖过确认」。12050 比启动遮罩还高，且**表里没有这一行**。

面板在右下角 320px 宽，那一带原本住着 Soundscape 右下 FAB 容器（z23）与语言地球钮（z16）。面板开着时这两个都被压住。好在外点关闭走了 `shouldIgnoreOutsideDismissTarget`，`⋯` 逃生舱不会被永久吞掉——但这是靠 dismiss 守卫兜底，不是靠层级正确。

### Z-3（中）登记表漂移

近十天 `Z_INDEX.md` 只 `+1` 行（`OpenEndedNudgeUI` z14）。同期新增/改动但**未登记**的层：

| 文件 | z | 挂载 | 位置 |
|---|---|---|---|
| `SystemTtsPreferenceUI.js` | 12050 | body | 右下 |
| `VoiceCommandUndoToast.js` | 42 | `#ui-overlay` | 底部居中 108px |
| `HomeSanctuaryNavFanUI.js` | 35 / 36 | body | 锚点扇形 |
| `TodayDirectionOptionsBannerUI.js` | 16 / 34 | 相对父容器 | 顶部居中 |
| `PracticeImprintCardUI.js` | 18 / 19 | — | 卡 + 内层 |
| `FocusSitAdjustUI.js` | 11 | 相对父容器 | 左 18px / 上 196px |

同时 `VISIBILITY_SUPPRESS_TRIGGER_PATHS`（`src/core/visibilityContractRegistry.js:58-76`）里六个之中只登记了 `VoiceCommandUndoToast.js`。也就是说改这五个叠层不会触发整表 visibility e2e。

### Z-4（待验证，需人眼）左列两张卡

- `OpenEndedNudgeUI`：`top: 108px; left: 18px; z-index: 14`
- `FocusSitAdjustUI`：`top: 196px; left: 18px; z-index: 11`

两张都是 Focusing 期间左列提示，垂直间距只有 88px。开放式专注提示若换行到两三行，会压到坐姿卡上，而坐姿卡 z 更低。另外 z11 低于 `ActiveRecoverAnchorUI` 的 z12 隐形命中层（`Z_INDEX.md:39` 明确「冷却期微光+提示 hidden、invisible hit 仍在」），两者若有几何交集，坐姿卡的点击会被摸头热区吃掉。

这条我只能给出「数值上具备条件」，实际是否重叠取决于文案行数和视口，**属于必须人眼的那一类**，不建议今晚写测试。

---

## 4. 语音朗读

相关合入：#987 `docs/tts-v1-decision`、#989 `feature/system-tts-probe`、#994 `fix/system-tts-probe-blank-window`、#995 `feature/confide-tts-v1`、#1013 `feature/system-tts-global-switch`。

### 做对的部分

- 全局播报默认关（`systemTtsPreference.js:16-18`），读写都包了 try/catch，坏 JSON 退回默认值。
- 平台闸收得很紧：Electron + 桌面 bridge + 宽视口三个条件同时成立才可用（`systemTtsBridge.js:71-75`）。Web 构建整条链路 no-op。
- Confide 卡 `open()` / `close()` 都调了 `_stopConfideTts()`（`ConfideToYinUI.js:408` / `:449`），关卡片不会留下还在念的声音。
- 全局播报开关与 Confide 朗读**刻意解耦**，注释写清了，没有把两者混成一个开关。

### T-1（中）不打断，只叠加

`_maybeSpeakConfideReply`（`ConfideToYinUI.js:779-791`）直接 `bridge.speak()`，没有先 `stop()`。用户连发两条、或第一条还在念时第二条回复到达，两段语音会排队或叠着念。`_stopConfideTts()` 已经存在，只是没接在这里。

### T-2（中）两个出声源互不知情

`maybeSpeakFocusEndAnnouncement()`（`main.js:4317`）在专注结束时出声，同样不 `stop()`、也不查 Confide 是否正在朗读。用户在专注尾声打开 Confide 说话，收到回复的同时专注结束播报触发 → 两句叠着。

两条合起来说明：现在缺一个「同一时刻只有一个声音」的收口，而不是各自都有 bug。

### T-3（中）开关失败是静默的

```123:130:focus-tiger/src/ui/SystemTtsPreferenceUI.js
  _onToggleChange() {
    const enabled = this.toggleInput.checked;
    const result = setSystemTtsAnnouncementsEnabled(undefined, enabled);
    if (!result.saved) {
      this.toggleInput.checked = !enabled;
    }
    this._render();
  }
```

`saved === false`（无痕模式、配额满、storage 抛异常）时勾选框自己弹回去，`statusEl` 重新渲染成「关」，**没有任何一句话告诉用户保存失败**。按 `INTERACTION_FEEDBACK_PRINCIPLES.md` 的持久化三态可见性，挂起 / 成功 / 失败要分别可见；这里失败态与「用户自己取消」长得一模一样。也不在 `SILENT_BEHAVIORS.md` 的白名单里。

### T-4（低）没有 destroy

构造函数里 `document.addEventListener('pointerdown', this._onDocPointer, true)`（`:95`）与 `this._unsubLocale = onLocaleChange(...)`（`:98`）都没有解绑入口，类上没有 `destroy()` / `dispose()`。当前是单例、进程内只建一次，所以现网无泄漏；但只要以后按视口重建（窄宽切换重挂壳就是现成场景），捕获阶段的监听会累积，每次外点都多跑一遍。

### T-5（低）死开关

`WideIdleMoreMenu.js` 在点「system-tts」菜单项时 `document.body.classList.add(WIDE_STAGE_CLASS.systemTts)`（`:805`），并在三处 clear 里移除。但该 stage class **没有任何 CSS 规则消费**——文件里只有 `ft-wide-stage-sound` / `ft-wide-stage-reminder` / `ft-wide-stage-companion` 的抬层规则。面板能显示纯粹靠 z12050（见 Z-2）。加类、清类都是空转。

---

## 5. 建议的下一步（供你排序，本回合不执行）

**我认为最合理的**：第三步只写两批测试，就挑 A-1/A-2 与 K-1，理由是这两条失败时的产品后果最重（危机句被模型即兴回答且念出来 / 产品问题被模型编答案），而且判定完全确定，不依赖语气与版式。

| 批次 | 锁什么 | 形态 | 失败即证明有 bug |
|---|---|---|---|
| 批 1 | ~~`shouldSpeakConfideReply('generate') === false`~~ → 见下方更正；实际锁的是「已好清单 + 未登记 id 静音」；`confideClassify` 对六条危机改写句的现状快照 | `src/core/systemTtsBridge.test.js` + `confideClassify` 新增用例 | 是 |
| 批 2 | `resolveProductKnowledgeGateAction` 在 `semanticIsProduct=true` + `nearAction='skip'` 时必须回 `honesty` 而非 `skip`；`pickProductKnowledgeHit` 对 score=1 无并列必须回 `null` | `confideProductKnowledgeSemantic.test.js` + `confideProductKnowledge.test.js` | 是 |

Z-1 / Z-2 / Z-3 更适合做**静态扫描**（新增 `position: fixed` 且未登记 `Z_INDEX.md` 则 CI 红），不适合铺 e2e：选择器一变就红，且覆盖的是已有 visibility 套件重复过的区域。

T-1 / T-2 / T-3 可以进第三批，但要先决定产品语义（同一时刻是否只允许一个声音），属于要你拍板的那一类，不是纯补测试。

Z-4 与「节日四行 / 坐姿练习会不会被挡住」留给人眼。

---

## 6. 更正与落地记录（2026-09-30 当晚）

初稿写完后按你的排序去落地，落地过程中发现初稿有两处措辞会**误导修法**。这里逐条更正，原文保留不删，便于对照。

### A-2 更正：`'generate'` 该朗读，缺陷只在默认值

初稿写「朗读闸漏掉了 `'generate'`」，第 5 节又把批 1 的断言写成 `shouldSpeakConfideReply('generate') === false`。**按这个断言改会把语音朗读整体变静**：

`task-briefs/task-confide-tts-v1.md`（2026-09-26 PO 锁定）写的挂载点是「每条回复在文字出现后 0–1s 内朗读」，安全例外只有 `safety_redirect` / `aggression_toward_others` 两条纯文字，本期非目标明确是「危机句以外的新路由特殊逻辑」。本地生成的回复正是 TTS v1 的主用例。

所以真正的缺陷不是「`generate` 被朗读」，而是「**没被列进黑名单的东西一律被朗读**」——空串、`undefined`、以及将来任何新增路由。落地的修法（`dee156cc`）保持九个现存 route id 行为零变化，只把默认值从「出声」翻成「静音」，并新增一条「已好清单」用例逐个锁住这九条，确保这次改动本身不动产品语义。

A-1 的另外半边（危机改写句的**分类范围**）没动，按你的要求先补 Brief。批 1 的第 3 组用例把这个缺口钉成快照，注释写明钉的是现状不是期望。

### K-1 更正：不是疏漏，是文档与已提交测试对打

详见 §K-1 内的更正块。结论：需要你先决定「Brief §五 算数」还是「已提交断言算数」，代码才能动。

### K-2：红用例已写并验红，但修复属用户可见改动

两条用例已写好并确认变红（`confideProductKnowledge.test.js`，25 用例 23 通过 2 失败），但**没有随批 1 提交**：修好之后 `backup` 这类裸产品名词会从「返回短答」变成「诚实空态」，是用户能看见的行为变化，按 `brief-before-user-visible` 属 B 类，要先有 Brief。用例原文存档如下，拍板后可一步贴回：

```js
it('honors CONFIDE_KB_RETRIEVAL_MIN_SCORE when nothing ties (audit K-2)', () => {
  assert.equal(CONFIDE_KB_RETRIEVAL_MIN_SCORE, 2);
  assert.equal(
    pickProductKnowledgeHit('x', [
      { id: 'KB-FUNC-0001', score: 1, shortAnswerEn: 'single keyword' }
    ]),
    null
  );
});

it('a bare product noun is not an approved match (audit K-2)', () => {
  const probe = probeProductKnowledgeCatalog('backup');
  assert.equal(probe.attempted, true);
  assert.equal(probe.hit, false);
  assert.equal(probe.reason, 'below_threshold');
});
```

（`CONFIDE_KB_RETRIEVAL_MIN_SCORE` 需加进该文件的 import 列表。）

### 一并记录

`focus-tiger/scripts/classify-tracker-no-auto.cjs` 当时缺版权头、卡住了报告提交。复核时分类会话已自行提交该文件（`89c8c47c`），版权头已在，无需代劳。

---

*审计人：Agent · 2026-09-30 · 初稿只读无运行时改动；§6 记录当晚落地的 A-2 修复（PR #1036）*
