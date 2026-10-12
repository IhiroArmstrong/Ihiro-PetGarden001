# Task Brief · Help Center 补篇（呼吸时长 / Collections / 莲花 / 徽章≠寅币）

> **状态（2026-10-13）**：**已锁** · PO 书面「按这份 Brief 开工」。实现旁支 `feature/help-center-gap-articles`。
> **分支**：`feature/help-center-gap-articles`（worktree `…-wt-help-center-gap`）
> **类**：B（用户可见帮助正文）
> **父计划**：[`task-confide-help-center-miss-fallback.md`](./task-confide-help-center-miss-fallback.md) **第二刀**
> **第一刀已合**：#1183 诚实空态 → Help Center + `hello@twinsology.com`

## 一句话目标

把本场四条产品缺口写成 **Help Center 可点文章**。倾诉短答库、情绪闸、徽章误命中检索 **本刀不动**。

## 背景（用户原句）

Electron 同场：

1. `How long can I practice breathing?`
2. `Can I buy the collections?`
3. `莲花出现 表示 our evolution after practices?`
4. `徽章 是否 可以 做 focus coin 来 使用？`（目录需要专条；**Confide 仍会误命中寅币短答**，那是另一张单）

现网 Help Center 已有呼吸入口（0006 / 0011）、寅币获得（0018）、徽章下载（0035 / 0036）。缺的是：**时长上限**、**两扇收藏门怎么买**、**莲花含义（非等级）**、**徽章不能当币花**。

## 拍板（待你点头）

| 项 | 口径 |
|---|---|
| 形态 | 只加 4 篇 allowlist 文章 + `help-center.json` 三语文案。不改打开方式、不改玻璃卡、不改付款 |
| id | Help Center 专用 slug（**不**进 `productKnowledgeCatalog.json`，避免阿寅念长文） |
| 来源 | 已上线行为 + 已审用户向口径。禁止 TASKS / ISSUE / 内部排障 |
| 第三刀 | Confide 检索这些正文 → **另 Brief**。本刀合入后倾诉这四句仍可走诚实空态（已指 Help Center） |
| 明确不做 | 情绪误入产品闸；徽章误命中 0018 的检索改写；Art Collection / Yin's Collections 空白 bug；莲花公式 |

### 四篇 id / 分组

| id | section | 回答哪句 |
|---|---|---|
| `HELP-BREATH-DURATION` | practice | How long can I practice breathing? |
| `HELP-BUY-COLLECTIONS` | data | Can I buy the collections? |
| `HELP-LOTUS-BLOOMS` | practice | 莲花出现表示练习后的成长吗？ |
| `HELP-BADGE-NOT-COIN` | data | 徽章能否当寅币用？ |

locale 键：`HELP_CENTER_ARTICLE_<ID下划线>_TITLE` / `_BODY`（例：`HELP_CENTER_ARTICLE_HELP_BREATH_DURATION_TITLE`）。无 `kbTraceId`。

### 拟刊正文（点头即按此落盘；可改字再锁）

**HELP-BREATH-DURATION**

- en title: How long Breath practice can last
- en body: Breath practice on the left orb offers 1, 3, 5, 10, or 20 minutes. Twenty minutes is the longest Breath sitting.\n\nA full Sit with Yin starts at 10 minutes and uses different chips (10 / 15 / 25 / 45). Breath practice is the shorter pause, not a second Focus session.
- zh title: 呼吸练习能坐多久
- zh body: 左侧呼吸球可选 1、3、5、10 或 20 分钟，最长 20 分钟。\n\n完整同坐从 10 分钟起，档位是 10 / 15 / 25 / 45。呼吸练习是更短的停顿，不是第二场同坐。
- ja title: 呼吸練習は何分まで
- ja body: 左オーブの呼吸練習は 1・3・5・10・20 分。最長は 20 分です。\n\nSit with Yin は 10 分から（10 / 15 / 25 / 45 分）。呼吸練習は短い休憩であり、本格的な同坐ではありません。

**HELP-BUY-COLLECTIONS**

- en title: Buying Yin's Collections and Art Collection
- en body: There are two shelves.\n\nYin's Collections (fan Collection, or More → Yin's Collections) uses focus coins you earn by sitting. Those pieces cannot be bought with money.\n\nYin's Art Collection (More → Yin's Art Collection) is a separate paid art shelf. Choose a set, leave an email, and check out if you want the prints.
- zh title: 收藏能不能用钱买
- zh body: 有两处货架。\n\n阿寅珍藏（扇叶 Collection，或菜单里的 Yin's Collections）用同坐攒的寅币结缘，不能用现金买。\n\nYin's Art Collection（菜单灵感组）是另一处付费画册。选套装、留下邮箱，再结账即可。
- ja title: コレクションは購入できるか
- ja body: 棚は二つあります。\n\nYin's Collections（扇の Collection、またはメニュー）は同坐で得たフォーカスコインで結縁します。現金では買えません。\n\nYin's Art Collection は別の有料アート棚です。セットを選び、メールを残して会計します。

**HELP-LOTUS-BLOOMS**

- en title: What the lotus blooms mean
- en body: Lotus blooms are quiet traces of time you have sat. They are not ranks, scores, or a character evolution track.\n\nOpen Where you are from the home journey line. Up to twelve blooms sit in a row between the next-step sentence and your lifetime minutes. The home seat no longer draws flowers in front of Yin.
- zh title: 莲花出现表示什么
- zh body: 莲花是你坐过的安静痕迹，不是等级、分数，也不是角色进化条。\n\n从首页旅程短行打开「你在这里」。最多十二朵排在下一小步和累计分钟之间。主屏阿寅身前不再画花。
- ja title: 蓮の花は何を表すか
- ja body: 蓮は坐った時間の静かな跡です。等級・点数・キャラクター進化ではありません。\n\nホームの旅程から Where you are を開くと、次の一歩と累計分数のあいだに最大十二輪が並びます。ホームの寅の前には花を描きません。

**HELP-BADGE-NOT-COIN**

- en title: Badges are not focus coins
- en body: A badge may look like a Focus Coin, but it is a keepsake. You cannot spend a badge in Yin's Collections.\n\nFocus coins are earned by sitting or breathing, and you spend those under Yin's Collections. If you already have a badge, tap it in the badge frame to download the picture.
- zh title: 徽章不能当寅币花
- zh body: 徽章长得像寅币，只是纪念，不能拿到珍藏里花掉。\n\n寅币靠同坐或呼吸获得，在阿寅珍藏里结缘。已有徽章时，在展示框里点按即可下载图片。
- ja title: バッジはコインではない
- ja body: バッジはフォーカスコインに似ていても記念品です。Yin's Collections では使えません。\n\nコインは同坐や呼吸で得て、コレクションで使います。バッジがあるときは枠内をタップして画像を保存できます。

## 冲突扫描

- **AX Help Center**：只加目录篇；打开 / Close / 问号链不变。
- **AE 倾诉**：不改 catalog、不改空态（#1183 已指路）。四句在倾诉里仍可 miss → 诚实空态。
- **S Breath / T Sit chips**：只描述现网 1/3/5/10/20 vs 10/15/25/45，不改 picker。
- **AC 珍藏 / AW 艺术收藏**：只写两扇门怎么买；不修空白面板、不改 Stripe。
- **AV Where you are**：莲花文案跟现网宿主（详情横排、主屏无花），不改公式。
- **人设**：Help Center 可以讲清规则；阿寅仍不念长说明书。

**结论**：无未拍板冲突。与「徽章误命中寅币短答」「情绪误入产品闸」相邻但 **刻意拆单**（你已书面另开）。

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。点主题仍走现网 Help Center 卡片（场景 AX 的 0–1 秒内见正文）。

## 验收（点头后的实现）

- 目录 Practice 可见呼吸时长、莲花两篇；Your data 可见买收藏、徽章≠寅币。
- 点开四篇，标题和正文与上表一致（en/zh/ja）。
- `helpCenterCatalog.test.js`：四 id 在 allowlist；`productKnowledgeCatalog.json` **不含** 这四 id。
- 回归：原 39 篇仍在；`KB-OPS-*` 仍禁；打开方式不变。
- 不改付款契约；不跑全量 e2e。单测：`helpCenterCatalog.test.js`（及 locale 键存在则一并锁）。

## 回滚

从 `HELP_CENTER_ARTICLES` 去掉四 id，删对应 locale 键。

## 点头后改哪些文件

- `src/core/helpCenterCatalog.js` + `.test.js`
- `src/locales/slices/help-center.json`
- `docs/task-entries/help-center-gap-articles.md`
- `docs/tracker-entries/feat-help-center-gap-articles.md`
- 本 Brief 状态改为已锁
- `ISSUE_LEDGER` 优化建议行改为跟进中（本支）
