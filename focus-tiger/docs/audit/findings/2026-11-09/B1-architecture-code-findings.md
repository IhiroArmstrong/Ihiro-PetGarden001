# B1 · 架构与代码质量 — 审计发现（基线轮）

- 基准：[`AUDIT_BASELINE.md`](../../AUDIT_BASELINE.md) v1.1 · Brief：[`briefs/B1-architecture-code.md`](../../briefs/B1-architecture-code.md)
- 事实底稿：[`facts/2026-11-06/`](../../facts/2026-11-06/INDEX.md)（第 0 轮）。本轮补扫见 [`evidence/b1-static-scan.json`](evidence/b1-static-scan.json)
- 审计基线：`origin/develop` @ `f1e8a9f8`（Merge #1637）。该提交包含交接里点名的 #1633（merge `432ea198`）以及 #1636。取证时 develop 尖端已不是 #1633 本身
- 审计日期：2026-11-09 · 方式：**只读**（未改产品代码、未改任务账、未改 `ARCHITECTURE.md`）
- 用户可见产品名：**Samatia**（仓库与代码标识仍为 Focus Tiger）
- 与已合报告的关系：B5（#1589）、B6（#1587）、R2 / R2-lite 已在 develop。本轮**不重判** V1–V4
- 复核状态：全部条目 **未复核**
- 本报告**不是**发布裁决

PR 检索（开工前）：`gh pr list --state all --search "B1"` 命中的是已合的旁支说明（含 T76 冷启动 #1550 的字样、R2、深链 Brief），**没有**「架构与代码质量」这份 B1 的 OPEN 或 MERGED PR。T76 那一刀已合，本报告不重开。

---

## 0. 摘要

### 0.1 评分卡

# 审计评分卡 — 2026-11-09 — B1 — 基准 v1.1

## 摘要

- 未检维度：③ 测试与发布、④ 项目管理、⑤ 产品功能与场景、⑥ UI/UX、⑦ 可访问性与国际化、⑧ 性能与资源、⑨ 安全隐私合规、⑩ AI 质量与安全（后两项已有 B5/B6，本轮不重打）
- 否决项状态：V1 **未检（本轮不重判，见 B5）**　V2 **未检（见 B6）**　V3 **未检（见 B5）**　V4 **未检（见 B5）**
- 归一化加权分（仅已检维度 ①②，权重各 12%）：**50**
- 计算：`(2×12 + 2×12) ÷ (12+12) ÷ 4 × 100 = 50`。只供趋势。过线看各维度是否 ≥3，不看这个 50

| # | 维度 | 权重 | 检状态 | 得分(0-4，未检留空) | 通过线 | 是否过线 | 上次 | 变化 |
|---|---|---:|---|---:|---|---|---|---|
| 1 | 架构 | 12% | 部分已检 | 2 | ≥3 | 否 | 无 | 首次 |
| 2 | 代码质量 | 12% | 部分已检 | 2 | ≥3 | 否 | 无 | 首次 |
| 3–10 | （本 Brief 不负责） |  | 未检 |  |  |  |  |  |
| 11 | 风险管理 | 2% | **未建立** |  |  | 不参与 | 无 | 登记册仍未建立 |

维度 11：□ 已建立并评分　☑ 未建立（不参与归一化）

打分理由（推断，绑在已检子集上）：权威文档和一批契约检查是稳定的（状态机机器块、z-index、可见性、付款可点、三条专用 lint）。模块方向大体是界面调用核心（`ui → core` 407 处，反向 12 处）。同一窗口里最近 50 个合进 develop 的 PR，多数改动很小。拉低到 2 的是：入口文件又长又直接碰三维库、相对 import 有环且 CI 不拦、全库没有 eslint / 类型检查、架构目录注释仍把云写成占位。这是「有做法但不稳定」，不到「稳定可复现」。

## 结论（基线）

①② 都已检了一部分，都没过线。无 P0。不写可发布或不可发布。

---

### 0.2 覆盖率

分母 = Brief §4 的 20 条（架构 10 + 代码质量 10）。

| 状态 | 条数 | 哪些 |
|---|---:|---|
| 已检 | 6 | 决策可否追溯；模块边界；自动化守门；lint/类型/格式是否存在；复杂度 Top；近窗 PR 规模 |
| 部分已检 | 6 | 核心状态流；多套仲裁是否冲突；schema 迁移；错误处理；全局状态与硬编码；依赖 |
| 方法未采用（不因此扣分） | 3 | C4 图；独立 ADR 目录；SQALE |
| 未检 | 5 | 构建体积与测试时长；ISO 可移植性/兼容性；重复与死代码普查；命名与中英混用普查；「AI 生成代码」作者归因 |

按「已动手（含部分已检、含方法未采用）」计：**15/20 = 75%**。按「整条已检」计：**6/20 = 30%**。未检子项不打 0–4 分。

### 0.3 发现一览

| 编号 | 级别 | 标题 | 成本 | 影响面 |
|---|---|---|---|---|
| 1-01 | **P1** | 入口 `main.js` 7691 行，并直接 import Three.js，和架构文档写的「只拼装」不一致 | L | 内部 |
| 1-02 | **P1** | 相对 import 有环（扫描见 12 环），CI 不检查 | M | 内部 |
| 1-03 | P2 | `core` 反向引用 `ui`（含在 core 里 new 界面类） | M | 内部 |
| 1-04 | P2 | 装了 eslint，但没有配置、也没有全库类型检查 | M | 内部 |
| 1-05 | P2 | `schemaVersion` 散落在各功能；备份和坐配方有自己的迁移，没有统一迁移器 | M | 内部 |
| 1-06 | P2 | `ARCHITECTURE.md` 目录注释仍把 cloud 写成 stub / 现网 mock | S | 内部 |
| 1-07 | P2 | 多套仲裁/契约各有测试，没有一张先后顺序说明 | M | 内部 |
| 2-01 | P3 | 空的 `catch {}` 没扫到；忽略型 catch 集中在环境声 | S | 内部 |

无 P0。

---

## 1. 本轮怎么扫的

在 `origin/develop` @ `ead9213d` 上只读执行：

```bash
node focus-tiger/docs/audit/findings/2026-11-09/evidence/b1-static-scan.mjs
gh pr list --repo IhiroArmstrong/Ihiro-PetGarden001 --state merged --base develop --limit 50 \
  --json number,additions,deletions,changedFiles,mergedAt,title
```

扫描范围：`focus-tiger/src/**/*.js` 的相对 import。不解析 `three`、`lit` 这种包名。原始 JSON：[`evidence/b1-static-scan.json`](evidence/b1-static-scan.json)。PR 窗口摘要：[`evidence/b1-pr-size-sample.json`](evidence/b1-pr-size-sample.json)。

| 量 | 值 |
|---|---|
| `src` 下 js | 1225 |
| 生产文件 / 行 | 691 / 153794 |
| `*.test.js` / 行 | 534 / 66917 |
| 相对 import 环（去重样本） | 12 |
| 解析失败的相对 import | 6（含 css `?inline` 与扫描器对少数路径的误解析，不当成缺文件） |
| 生产文件里 `from 'three'` | 17 |
| 生产文件出现 `schemaVersion` | 21 |
| 生产文件直接写 `localStorage.` | 6 |
| 空 `catch { }` | 0 |

`core/` 目录 902 个 js、约 14.0 万行，**含测试**。不要把这个数字当成「核心生产代码 14 万行」。

未跑：`vite build` 产物字节、全量单测计时、jscpd / 死代码工具、license-checker 重跑（沿用第 0 轮许可证文件，本轮不重新解释安全结论）。

---

## 2. 架构（维度 ①）

### 2.1 决策可追溯（已检）

这些决策能在现有权威文档或已合 PR 里找到，不依赖一份叫 ADR 的目录：

| 决策 | 落点 |
|---|---|
| 状态机只允许 IDLE / FOCUSING / CELEBRATE / DORMANT | `ARCHITECTURE.md` 机器块，真源 `src/core/StateManager.js`；`npm run state:doc-check` |
| 叠层数字 | `docs/Z_INDEX.md` + `npm run check:z-index` |
| 付款入口不能被别的改动盖住 | 付款可点契约，进 `test:e2e:smoke` |
| 三维场景仍在 | 生产依赖 `three`（`package.json` dependencies）；17 个生产文件 `from 'three'` |

C4 图：**方法未采用**。不因此扣分。

独立 ADR 目录：**方法未采用**。用上表代替。不因此判不过线；不过线来自 1-01、1-02、1-06，不是因为没有 ADR 文件夹。

### 2.2 模块边界（已检）

相对 import 跨目录次数（扫描器，生产+测试一起计）：

| 方向 | 次数 |
|---|---:|
| `ui → core` | 407 |
| `main.js → core` | 185 |
| `ui → locales` | 100 |
| `main.js → ui` | 88 |
| `core → utils` | 57 |
| `core → locales` | 39 |
| `core → ui` | 12 |

主方向是界面依赖核心。反向的 12 处是 1-03。

### 2.3 自动化守门（已检：有哪些、缺哪些）

PR 冒烟（`.github/workflows/pr-smoke.yml`）会跑 `test:smoke`（含 `docs:check`、三条专用 lint、单测）、`test:e2e:smoke`、菜单可达、以及 `vite build`。另有文档契约 workflow、可见性契约 workflow。依赖高危审计是每周定时（`dependency-audit.yml`），不是 PR 必过。

已有、且和架构约束相关的脚本包括：`check:z-index`、`check:glass-card-roots`、`check:companion-contract`、`state:doc-check`、`gate:doc-check`、`visibility:doc-check`。

没有：全库 eslint、import 环、`core` 不得 import `ui` 的检查。见 1-02、1-04。

### 2.4 核心状态与 schema（部分已检）

本地读写大多走 `src/utils/Storage.js`。生产代码里直接出现 `localStorage.` 的只有 6 个文件（扫描 Top：`OnboardingHintsStore.js`、`localStorageCapacityAudit.js`、`AmbientSoundscapeUI.js`、`CompanionModePicker.js`、`presenceSignalsGate.js`、`main.js`）。本轮没有把每一把存储钥匙的读写入口画成一张图。

备份快照有显式版本和按版本展开的钥匙表：`PRACTICE_BACKUP_SCHEMA_VERSION = 7`（`src/core/practiceBackup/practiceBackupSnapshot.js:25`），v1 钥匙表仍被接受（同文件约 27–35 行）。坐配方有 `migrateAndNormalizeRecipe`（`src/core/ritualRecipe/ritualRecipeSchema.js:225`）。另外约 19 个生产文件各自出现 `schemaVersion`，本轮没有逐个做「旧数据升级走查」。第 0 轮已记出口钥匙与重置钥匙数量不一致。2026-11-09 本分支跑 `npm run docs:check` 时，同一脚本打印 **31 export keys、105 reset keys**。这仍是覆盖缺口，不在这里重跑走查，也不上升成「数据不可恢复」（那是 V4，本轮不重判）。

### 2.5 多套仲裁（名单已检，运行时冲突未检）

这些文件同时存在，并且多数带测试：

- `src/core/overlaySlotArbitration.js`
- `src/core/spriteChannelArbitration.js`
- `src/core/confide/confideRoutingArbitrationShadow.js`
- `src/core/overlaySlotContractRegistry.js`
- `src/core/sessionUiGateContractRegistry.js`
- `src/core/visibilityContractRegistry.js`
- `src/core/overlayUiSurfaceContract.js`

本轮只确认它们并存。没有跑场景去证明两套规则在同一次点击上打架。所以「职责重叠」是风险登记，不是已复现的用户故障。见 1-07。

### 2.6 构建体积与测试时长（未检）

源码行数已有（§1，对齐 `f1e8a9f8`）。没有读取 `vite build` 产物字节，也没有在本机重跑测试金字塔计时。develop 上菜单可达那一条（run `42598029402`，`ead9213d`）大约 2 分钟且成功；那不是整份测试时长，不拿来打分。

### 2.7 ISO/IEC 25010（仅已检子项）

| 子特性 | 检状态 | 说明 |
|---|---|---|
| 可维护性（模块化、可分析性） | 部分已检 | 与维度 ①② 同一已检子集，不另给一个更高的分。见得分 2 |
| 可移植性 | 未检 | 未做换运行时 / 换壳的走查 |
| 兼容性 | 未检 | 未做浏览器矩阵或旧备份实机升级 |

未检子项不打 0–4。

---

## 3. 代码质量（维度 ②）

### 3.1 lint / 类型 / 格式（已检）

- `eslint` 在 `package.json` devDependencies（约第 125 行）。`focus-tiger` 根下没有 eslint 配置文件。`cloud/` 有 `tsconfig.json` 和 prettier；练习壳是 JS，没有对应的全库类型检查脚本。
- 真正进冒烟的 lint 是三条专用脚本：`lint:main-use-before-define`、`lint:confide-original-utterance`、`lint:co-practice-research-ci`。
- 因此「有没有 lint」的答案是：有几条契约 lint，没有通用规范闸。见 1-04。

### 3.2 复杂度 Top（已检，生产文件，按行数）

| 行数 | 文件 |
|---:|---|
| 7704 | `src/main.js` |
| 3551 | `src/ui/OnboardingHintsUI.js` |
| 2664 | `src/ui/ConfideToYinUI.js` |
| 1880 | `src/ui/NarrowIdleShell.js` |
| 1774 | `src/ui/AmbientSoundscapeUI.js` |
| 1723 | `src/ui/FocusCoinsPanelUI.js` |
| 1622 | `src/core/EmotionController.js` |
| 1620 | `src/ui/WideIdleMoreMenu.js` |

工具可复现：§1 的扫描脚本。圈复杂度本轮没跑（没有 plato / eslint complexity），所以不报函数级圈复杂度数字。文件行数本身已说明入口和几块界面超出单次可审体积。见 1-01。

### 3.3 重复与死代码（未检）

没有跑克隆检测。不把「文件多」写成「重复代码已证实」。

### 3.4 命名、注释、中英混用（未检）

没有做普查。不打分。

### 3.5 错误处理（部分已检）

对生产文件做了单层 `catch { ... }` 正则：空花括号 **0**。忽略型短 catch（注释 `/* ignore */` 或不抛、不打日志）样本集中在 `src/audio/AmbientSoundscapeController.js`（扫描列出约 240、248、517 行等）。未全量扫未处理的 Promise。见 2-01。

### 3.6 全局状态、魔法数字、硬编码 URL（部分已检）

直接 `localStorage.` 见 §2.4。魔法数字没有普查。硬编码 `https://` 只抽了样，原始样本在扫描 JSON 的 `hardcodedUrlSample`，本轮不把其中云地址再判一次安全（那是 B5）。

### 3.7 依赖（部分已检）

练习壳生产依赖只有 `lit` 和 `three`（`package.json` dependencies）。体积贡献 Top 10 **未检**（没看构建产物）。许可证沿用第 0 轮 `facts/2026-11-06/licenses-focus-tiger-prod.json`，本轮没有重跑 `license-checker`。桌面端依赖的高危项以 B5 为准，这里不改那份结论。

### 3.8 PR 规模（已检，窗口写明）

最近 50 个合进 `develop` 的 PR，合并时间从 2026-11-07 到 2026-11-09（`gh pr list --base develop --state merged --limit 50`）。增删行合计：

| 合计增删 | 个数 |
|---|---:|
| ≤200 | 33 |
| 201–800 | 13 |
| 801–2000 | 3 |
| >2000 | 1 |

中位约 133 行（#1633，文档）。唯一超过 2000 的是 B5 发现稿本身（#1589，+2409 / 4 文件），不是产品代码。这个窗口里，合进去的改动大多一次看得完。窗口只有约两天，不能外推成「从来都很小」。

### 3.9 技术债 SQALE（方法未采用）

不打分，不因此扣分。

### 3.10 AI 生成代码风险（未检）

没有作者归因，也没有重复实现检测。不把大文件或环说成「模型写的」。

---

## 4. 发现

### 1-01 入口文件又长又直接碰三维库

- 级别：P1
- 类型：事实
- 检状态：已检
- 修复成本：L
- 影响面：内部
- 描述：`src/main.js` 7704 行。文件开头直接 `import * as THREE from 'three'`，并调用 `createRenderer`。`ARCHITECTURE.md` 写入口「只做拼装+主循环调度，不直接碰 Three.js 底层对象」。
- 证据：
  - 行数：[`evidence/b1-static-scan.json`](evidence/b1-static-scan.json) 的 `topProd`（`f1e8a9f8` 重扫）
  - `src/main.js:8` 注释要求三维调用留在 Renderer/Scene；`:10-11` 仍 `import * as THREE`
  - `docs/ARCHITECTURE.md` 目录树里对 `main.js` 的那句职责（约 127 行）
- 影响：改坐姿、改开机、改三维，经常落在同一个文件里，评审和回归都放大。文档读者会以为入口不碰三维对象。
- 建议整改：新的拼装放进已有的 `src/boot/`，把 `import * as THREE` 移出 `main.js`。不要在一次 PR 里重写这 7704 行。
- 建议负责人：待治理登记
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 1-02 相对 import 有环，CI 不拦

- 级别：P1
- 类型：事实
- 检状态：已检
- 修复成本：M
- 影响面：内部
- 描述：扫描器在 `src` 相对 import 上找到 12 个环。其中两条已用源码行号复核。最长的一环穿过个人记忆与倾诉边界相关模块（只引用扫描结果，本轮没有打开那些文件的正文）。PR 冒烟不检查 import 环。
- 证据：
  - 扫描：[`evidence/b1-static-scan.json`](evidence/b1-static-scan.json) 字段 `cycleSample`；命令见 §1
  - 已复核：`src/core/journeyLogGate.js:6` import `eveningPracticeFacts.js`；`src/core/eveningPracticeFacts.js:11` import `journeyLogGate.js`
  - 已复核：`src/core/FocusSession.js:12` import `focusDuration.js`；`src/core/focusDuration.js:16` import `FocusSession.js`
  - 扫描列出的长环（未逐行打开）：`yinPersonalMemoryForget.js` → `yinPersonalMemoryRemember.js` → `confidePracticeFacts.js` → `confideBoundaryRespect.js` → `yinPersonalMemoryVerbalForget.js` → 回到 Forget
  - CI：`.github/workflows/pr-smoke.yml` 的步骤里没有环检查
- 影响：改记忆或练习记录时，加载顺序和测试替身容易互相拽住。现在靠人眼，守门不存在。
- 建议整改：先把共享的纯函数抽到不被回引的叶子文件，打断已复核的两环和扫描里的长环；再加一条只报 `src` 相对 import 环的检查进冒烟。
- 建议负责人：待治理登记
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 1-03 core 反向依赖界面

- 级别：P2
- 类型：事实
- 检状态：已检
- 修复成本：M
- 影响面：内部
- 描述：扫描 `core → ui` 12 次。核心目录里有的文件直接构造界面类，或向界面模块要布局常数和 z-index。
- 证据：
  - `src/core/createIdleChromeFacade.js:6-7` 构造 `NarrowIdleShell`、`WideIdleMoreMenu`
  - `src/core/EmotionController.js:27` import `../ui/zIndexLayers.js`
  - `src/core/wideMenuRadialLayout.js:13` import `../ui/homeChromeClearance.js`
  - `src/core/reflectionPresenceBridge.js:12` import `../ui/ReflectionFlowState.js`
- 影响：界面一改导出，核心测试和情绪控制器跟着变。数量远小于 `ui → core`，所以不是整层倒挂，但是边界已经漏了。
- 建议整改：布局常数和 z-index 放到既不属 ui 也不属情绪控制器的小模块；壳的 `new` 留在 `main` / `boot`，core 只保留无界面的 facade 接口。
- 建议负责人：待治理登记
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 1-04 没有全库 eslint / 类型检查

- 级别：P2
- 类型：事实
- 检状态：已检
- 修复成本：M
- 影响面：内部
- 描述：依赖里有 eslint，练习壳没有配置，也没有 `npm run lint` 这种全库入口。冒烟里的 lint 是三条业务契约，不是语法和未使用变量的网。
- 证据：
  - `focus-tiger/package.json` devDependencies 的 `eslint`；scripts 里只有 `lint:main-use-before-define`、`lint:confide-original-utterance`、`lint:co-practice-research-ci`
  - 本轮在 `focus-tiger` 下找 eslint 配置，只看到 `cloud/tsconfig.json` 与 `cloud/.prettierrc`
- 影响：空 catch、未使用绑定、明显的类型错误要等人或专用脚本碰上。专用脚本覆盖的是已出过事的契约，不是普遍质量。
- 建议整改：先加「只报告、不失败」的扁平配置（空 catch、未使用），清完一批再改成 PR 失败。不要第一天就对 15 万行生产代码全量失败。
- 建议负责人：待治理登记
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 1-05 schema 版本各自为政

- 级别：P2
- 类型：事实
- 检状态：部分已检
- 修复成本：M
- 影响面：内部
- 描述：备份和坐配方有版本号和迁移/按版本接受旧钥匙，并且有测试。其它功能各自写 `schemaVersion`，没有一个总迁移入口。本轮没有证明某次升级会丢掉用户数据。
- 证据：
  - `src/core/practiceBackup/practiceBackupSnapshot.js:25` `PRACTICE_BACKUP_SCHEMA_VERSION = 7`；同文件 v1 钥匙表仍存在
  - `src/core/ritualRecipe/ritualRecipeSchema.js:225` `migrateAndNormalizeRecipe`
  - 扫描：21 个生产文件出现 `schemaVersion`（名单在 JSON）
- 影响：新存储钥匙可能忘了进备份白名单。第 0 轮覆盖脚本已经记过出口钥匙和重置钥匙数量不一致；那是体验/备份完整性风险，B5 已把「看起来像进度清空」另记为 P1，这里不升成否决。
- 建议整改：继续用现有 `audit:local-backup-coverage` 当闸；新的 `schemaVersion` 要在该功能的测试里写明旧版样本。不必先做一套大一统迁移框架。
- 建议负责人：待治理登记
- 关联任务账条目：待治理登记（备份覆盖脚本已在；本条不新开实现）
- 复核状态：未复核

### 1-06 架构目录注释仍把云写成占位

- 级别：P2
- 类型：事实
- 检状态：已检（文档句子）；云是否仍在线沿用 B5，本轮未重抓包
- 修复成本：S
- 影响面：内部
- 描述：`ARCHITECTURE.md` 的目录树把 `cloud/src` 写成 stub，并留着「现网仍旧 mock」的日期注释。B5 已把默认云地址写成在用的 Worker。两份都在 develop 上，读者无法单靠架构文档知道云是不是还是占位。
- 证据：
  - `docs/ARCHITECTURE.md:104`（`cloud/src` 仍注 stub）；同文件 `:108`（`2026-08-20`「现网仍旧 mock」）
  - 已合 B5：`findings/2026-11-07/B5-security-privacy-compliance-findings.md` 对 `src/core/cloudApiClient.js` 默认基址的引用
- 影响：按架构文档做边界判断的人，会把已经存在的云路径当成还没上线。
- 建议整改：改目录注释：cloud 是独立 Worker 包，哪些路径默认会请求、哪些写死关闭，指到 B5 的网络表，不要再写 stub / mock。本审计 PR 按 Brief 不改这份权威文档。
- 建议负责人：待治理登记
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 1-07 仲裁与契约没有一张先后图

- 级别：P2
- 类型：事实（并存）+ 建议（画图）
- 检状态：名单已检；运行时是否冲突 **未检**
- 修复成本：M
- 影响面：内部
- 描述：叠层槽位、精灵通道、倾诉路由影子、会话 UI 门、可见性契约各自有模块和测试。没有一份说明「同一次点击先问谁」。
- 证据：§2.5 的文件名单。本轮没有复现两套规则互相否定。
- 影响：后来的人会再写第三套仲裁。这是可维护性风险，不是已证实的用户故障。
- 建议整改：在架构文档加一页「谁先说话」，每个名字对应现有文件。未证明冲突之前，不要合并这些模块。
- 建议负责人：待治理登记
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 2-01 忽略型 catch 集中在环境声

- 级别：P3
- 类型：事实
- 检状态：部分已检
- 修复成本：S
- 影响面：内部
- 描述：生产文件里没有扫到完全空的 `catch { }`。短忽略集中在环境声控制器，多处是 `/* ignore */`。
- 证据：[`evidence/b1-static-scan.json`](evidence/b1-static-scan.json) 的 `quietCatchSample`；例 `src/audio/AmbientSoundscapeController.js:248`
- 影响：偏好读失败时静默退回，用户听不到解释。本轮没有证明这会造成坏数据。
- 建议整改：保留「读不到就用默认」的行为，但不要用空注释吞掉意外异常；若维持沉默，在 `SILENT_BEHAVIORS` 里点名。那是后续产品 PR 的事。
- 建议负责人：待治理登记
- 关联任务账条目：待治理登记
- 复核状态：未复核

---

## 5. 已有、且本轮认为站得住的做法

这些不是发现，避免读完只看见缺口：

- 状态机合法边写在代码里，并同步进 `ARCHITECTURE.md` 机器块。
- 叠层、玻璃卡、陪伴契约、可见性、付款可点，都有检查或 e2e，不是只写在评论里。
- 界面依赖核心是主流方向（407 对 12）。
- 直接碰 `localStorage` 的生产文件很少，多数走 `Storage.js`。
- 备份 schema 已到 7，旧版钥匙表还在；坐配方有迁移函数。
- 2026-11-07 至 2026-11-09 合进 develop 的 50 个 PR，多数增删在 200 行以内。

---

## 6. 未检清单

| 维度 | 未检子项 | 缺什么 / 下一步 |
|---|---|---|
| ① | 构建产物体积 | 跑 `vite build` 后记录 js/css 字节，并写环境 |
| ① | 测试时长 | 引用一条完整 `test:pr-smoke` 或全量 e2e 的 CI 计时，不要只用菜单可达那 2 分钟 |
| ① | 运行时仲裁冲突 | 抽一条叠层场景，对账槽位仲裁和会话 UI 门 |
| ① | 除备份/配方外的 schema 升级走查 | 每个 `schemaVersion` 文件补一条旧样本 |
| ① | 可移植性、兼容性 | 不在本轮打分 |
| ② | 圈复杂度 | 有 eslint 后再开 complexity 规则，或单独跑一次并存原始输出 |
| ② | 重复 / 死代码 | jscpd 或等价工具的原始报告 |
| ② | 命名与中英混用普查 | 单独抽一目录，不要凭印象 |
| ② | 未处理 Promise 全量 | 有 lint 规则后再计 |
| ② | 依赖体积 Top 10 | 构建分析；许可证若要刷新再跑 license-checker |
| ② | AI 生成代码 | 没有作者数据就不判 |
| ③–⑩ | 整个维度 | 其它 Brief。⑨⑩ 不在这里改分 |
| 11 | 组织级风险登记册 | 未建立。本文件不是登记册 |

---

## 7. 90 天整改计划（建议，不在本 PR 实现）

| 顺序 | 何时 | 做什么 | 对应 | 完成时能看到 |
|---|---|---|---|---|
| 1 | 30 天内 | 打断已复核的两环和扫描里的长环；冒烟增加相对 import 环检查 | 1-02 | 环列表变短，CI 会红 |
| 2 | 30 天内 | 改 `ARCHITECTURE.md` 的 cloud 注释，并加一页仲裁先后（只文档） | 1-06、1-07 | 文档不再写 stub/mock |
| 3 | 60 天内 | 新拼装进 `boot/`；`main.js` 不再 `import * as THREE`。不要求一次拆完 7704 行 | 1-01 | 入口文件不再出现 `from 'three'` |
| 4 | 60–90 天 | eslint 先报告后失败；布局常数从 `ui` 挪走，core 不再 `new` 界面壳 | 1-03、1-04 | PR 上能看到通用 lint |
| 5 | 随做随做 | 新存储继续过备份覆盖脚本；不为「统一迁移框架」单独立项，除非走查证明旧数据读失败 | 1-05 | 覆盖脚本仍绿 |

P0 没有，所以上表不阻断其它已排产品工作。要不要插队，由治理会话登记，本审计不改队列表。

---

## 8. 风险登记

组织级风险登记册：**未建立**。维度 11 不参与归一化，也不判过线。上面的 P1/P2 是这份发现稿里的条目，不是已编号的登记册行。

---

## 9. 基准修订

本轮不改 `AUDIT_BASELINE.md`。没有新的否决项，也没有要改通过线的证据。
