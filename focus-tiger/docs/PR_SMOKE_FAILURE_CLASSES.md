# PR_SMOKE_FAILURE_CLASSES.md — PR smoke 失败归类与菜单走完门闩

创建日期：2026-10-17  
权威路径：`focus-tiger/docs/PR_SMOKE_FAILURE_CLASSES.md`  
索引：`RULES_INDEX.md` → `pr-smoke-failure-classes`  
排查顺序仍见 [`.cursor/rules/focus-tiger-ci-failure-triage.mdc`](../../.cursor/rules/focus-tiger-ci-failure-triage.mdc)（先取日志，再归类）。

---

## 根因表（2026-10-16–17 一批红灯）

主要放大器：一条时序敏感的浏览器 e2e 放在每个 PR 的必跑冒烟里；再叠加并行测试改共享生成文件。不是十几种产品同时坏了。

| 种类 | 根因 | 性质 | 处理 |
|---|---|---|---|
| **1. 菜单走完超时** | `menu-full-reachability`（宽屏 Idle → 窄屏抽屉）在 CI 上点击/滚动超时、页面打不开 | 测试不稳 | **已移出**每个 PR 的必跑 `test:e2e:smoke`。nightly + 合入 develop 后 + 改菜单路径的 PR 仍跑 |
| **2. 语言包索引竞态** | 并行测试改共享生成文件 `localeSliceModules.js`，别的测试读到半成品，报缺 `LOCALE_SLICES` | 测试基建竞态 | **T11** #1322；本刀不处理 |
| **3. 菜单选择器叠了两个** | `#ft-wide-more-radial` 和 `#ft-wide-more-menu` 同时命中 | 改菜单的 PR 自己的测试债 | 该 PR 同批修选择器；本刀不改产品代码 |
| **4. PR 自己的语法/夹具错** | 如变量重复声明 | 该 PR 的代码问题 | 修这个 PR |
| 噪声 | `Error: boom` 是测试模拟的 PWA 注册失败 | 忽略 | 不要当产品回归 |

「全仓一起红」的错觉：种类 1 每个 PR 都会跑，同一 PR 又常连红 2～3 轮。

---

## 菜单走完现在跑在哪

| 时机 | 是否跑 `test:e2e:menu-reachability` |
|---|---|
| 每个 PR 的 Required `test:pr-smoke`（默认浏览器冒烟） | **否**。只留启动/短壳：产品壳、scenario A 开表、付款契约、玻璃护栏 |
| PR 改动命中下方路径清单 | **是**（`pr-smoke.yml` 额外一步，仍算同一个 Required check） |
| 合入 `develop` 之后 | **是**（`menu-full-reachability.yml` `push`） |
| 每日定时 | **是**（同 workflow `schedule`，UTC 04:30） |
| 手动 | **是**（`workflow_dispatch`） |

本地改菜单：`cd focus-tiger && npm run test:e2e:changed -- e2e/menu-full-reachability.spec.js`（单 spec 硬顶见 `.cursor/rules/testing-strategy.mdc`，`e2e-local-budget`）。

### 路径清单（PR 额外一步）

真源：[`scripts/menu-reachability-trigger-paths.js`](../scripts/menu-reachability-trigger-paths.js)。命中任一即跑菜单走完：

- `focus-tiger/src/ui/NarrowIdleShell*`
- `focus-tiger/src/ui/WideIdleMoreMenu*`
- `focus-tiger/src/core/idleChromeOrchestration*`
- `focus-tiger/src/core/IdleChromeFacade*`
- `focus-tiger/src/core/createIdleChromeFacade.js`
- `focus-tiger/src/core/menuReachabilityContract*`
- `focus-tiger/src/core/wideMenuRadialLayout*`
- `focus-tiger/src/core/electronIdleContextMenu*`
- `focus-tiger/src/locales/slices/menu-*`
- `focus-tiger/e2e/menu-full-reachability*`
- `focus-tiger/e2e/wide-idle-more-menu*`
- `focus-tiger/e2e/helpers/product-shell.js`
- `.github/workflows/menu-full-reachability.yml`

首次合入后，对照最近 30 天改过菜单的 PR 核对本清单是否漏路径。

### nightly 通知

| 项 | 值 |
|---|---|
| **负责人** | PO（Armstrong） |
| **渠道** | GitHub → Watch 本仓 → Custom → **Actions** 失败邮件；以及 Actions 页 workflow **menu-full-reachability** |
| **连续红** | 连续 **2** 个调度日失败 → 当天处理或开 issue，禁止当关掉的检查 |

---

## 团队防范清单

**看红灯时**

1. 先看失败的 step 名和第一条 `✘` / `not ok`，不要看 `Error: boom`。
2. 对照根因表归类，再决定重跑还是修。
3. 报 `LOCALE_SLICES` 的，先当种类 2，不要当文档回归。
4. 同一 PR 连红 2 次且报错相同，说明可复现，不等于 flake。种类 1 或 2 → 标已知基建；否则是这个 PR 的问题。

**写测试时**

1. 并行测试里，共享生成文件只准在开跑前写一次。
2. 压测、破坏性测试必须写临时或 probe 文件，禁止碰生产路径上的共享文件。
3. 一个选择器必须只命中一个节点。宽/窄两套菜单不得共用会命中多个节点的 locator。
4. 新增的 e2e 先在 nightly 稳定跑一段时间，再考虑进 PR 必跑。

**改菜单时**

1. 选择器和测试同批修改。PR 描述写明「已确认宽/窄菜单选择器各只命中一个节点」。
2. 本地跑一次菜单走完，再推送。

**CI 范围**

1. PR 必跑只放快速、确定性强的检查。
2. 慢的、时序敏感的 e2e 放 nightly 或合入后。
3. 每个 nightly 检查要有负责人（本项见上一节）。

---

## Agent 开 PR 时（强制 · 与 triage 交叉）

条文执行层在 `ci-failure-triage`；此处只锁「归哪一类」。

1. smoke 失败必须先对照本表写明种类，才允许改代码或重跑。
2. 种类 1、2 命中时，在 PR 评论标注「已知问题 + 对应 PR/issue」，不要每次重新分析。
3. 同一 PR 同一报错最多自动重跑 **1** 次，仍红就停下来报告。
4. 改菜单的 PR：描述里确认宽/窄选择器唯一性。
5. 新增或修改共享生成文件、压测：描述里声明写入时机（仅开跑前）和 probe 路径。
