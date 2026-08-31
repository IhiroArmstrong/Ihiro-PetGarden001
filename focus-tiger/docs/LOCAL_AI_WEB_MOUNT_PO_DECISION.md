# Local AI · Web 挂载 · Product Owner Formal Decision

**状态（2026-09-01）**：**产品负责人正式拍板** · **不是**开工令 · **无 runtime**  
**交叉引用**：`task-desktop-on-device-companion.md` · `PRODUCT_POSITIONING.md`「禅意倾听者」· `FEATURE_CONFLICT_REVIEW.md`（Safari ≠ Web 本地 AI）

**签字**：Product Owner · 2026-09-01

---

## 术语：什么叫「Web 挂载」

在本决策中，**Web 挂载**指：

> 在**真实 Web 产品壳**（Safari / Chrome 打开 `?product=1`，**不带** lab / harness 参数）里，向普通用户交付**浏览器端本地大模型推理**——含 WebGPU / WebLLM / WASM 等路径下的 GGUF 下载、缓存、生成式 Confide，以及依赖 `desktopShell.companion` bridge 的 companion 能力。

**下列路径不计入 Web ship**（不得当成「Web 已挂本地 AI」）：

| 路径 | 说明 |
|---|---|
| **Electron 宽屏** `node-llama-cpp` | 桌面窄例外；已有独立政策 |
| **`?confide=1` QA harness** | 开发/验收用；`confideUserVisibilityGate.js` 写明 *does NOT imply user-visible ship* |
| **`CONFIDE_USER_MOUNT_ENABLED` 翻开** | 若将来执行，仅是 Web **检索不生成** Confide 的产品可见闸；**≠** 本决策所指的浏览器端推理挂载 |

付款可走 Web（Stripe Checkout）；**用**本地模型仍只 Electron + 宽屏 + 非低配。分工：**网页结账、桌面用 AI**。

---

## PO 结论

| 决策 | PO 结论 | 状态 |
|---|---|---|
| **Web 本地 AI 挂载** | **暂不立项** | 🔒 |
| **重评条件** | 须 **PO 书面翻 flag**；生态成熟（尤其移动端内存管理与跨浏览器一致性）且用户确有强需求时再议 | 🟡 |
| **现网分工** | Web = 练习 / Support / 付款 / 检索路径 Confide（若将来单独翻 mount）；本地生成 = Electron only | ✅ 维持 |

**一句话**：

> **不是「浏览器跑不了」，而是「投入产出比现在还不划算」。**

对小团队而言，要为浏览器单独适配模型下载/缓存/生命周期逻辑，并应对各浏览器 WebGPU 实现差异，工程量在产品优先级上很难排得过其他功能。行业里 GB 级本地模型做进生产级网页产品、并保证跨浏览器稳定体验的案例仍不多。

---

## 分析师意见摘要（2026-09-01 · 入库依据）

### 一、技术门槛已在降低，但不等于工程成本消失

- **Safari 26**（2025-09 随 macOS Tahoe / iOS 26）已默认开启 **WebGPU**；Chrome、Edge、Firefox、Safari 四大浏览器均已支持，覆盖率约 70%。
- WebLLM、transformers.js 等基于 WebGPU 的框架**能在主流浏览器跑通**。
- 「浏览器里跑不了模型」若只看 WebGPU，已不如半年前站得住脚。

### 二、真正卡住的点（与 WebGPU 支持与否关系不大）

1. **模型下载与缓存**：桌面靠原生文件系统存 GB 级 `.gguf`；网页只能用 Cache API / IndexedDB，配额与清理策略不统一，清缓存即丢模型。
2. **无常驻进程**：桌面可用 `node-llama-cpp` 精确控制「进入 Focusing 就卸载」；网页 Tab 被回收、后台限流，生命周期控制权弱得多。
3. **移动端更紧**：手机浏览器沙盒 + 系统内存压力，GB 级模型稳定性与耗电普遍不如原生 App。
4. **性能仍逊原生**：即便 WebGPU 覆盖面广，浏览器端框架实测通常仍慢于原生 `node-llama-cpp`，中低端设备差距更明显。

### 三、对 Focus Tiger 的含义

- **维持**「网页结账、桌面用 AI」分工。
- **禁止**在未翻本决策 flag 前立项 WebLLM / Web 端 GGUF / PWA 本地智能体（与 `task-desktop-on-device-companion.md` §明确不做 一致）。
- **1–2 年后**若生态更成熟且需求明确，可重新评估 ROI；**现在硬上性价比不高**。

---

## 与既有政策的对齐

本拍板**不废止**下列已锁政策，只补充**为何现在不做**的正式依据：

- `task-desktop-on-device-companion.md` — 禁止 Web / PWA / `src/` 主线接入模型；禁止 WebLLM 进渲染进程
- `PRODUCT_POSITIONING.md` — Web 仍检索；本地模型仍只 Electron
- `RESPONSIVE_LAYOUT.md` 原则 A — 本地智能体仅 Electron 宽屏；375 无 AI 不是漏适配
- `FEATURE_CONFLICT_REVIEW.md` — Safari 5173 测 Web 关单 **不能**当成「Web 已有本地 AI」

---

## 明确不做（直至 PO 书面重评）

- 浏览器端 WebGPU / WebLLM / transformers.js 生产级本地推理栈
- 为 Web 单独维护一套模型下载 / 缓存 / Tab 生命周期逻辑
- 「对等降级成 WebLLM」以弥补 Electron 缺失
- 把 `?confide=1` harness 或 Electron 能力误记为 Web ship 回归通过

**较弱**：因 Safari 26 有 WebGPU 就默认排期 Web 挂载；未 PO 书面翻 flag 就开工浏览器推理 POC 并进主线。
