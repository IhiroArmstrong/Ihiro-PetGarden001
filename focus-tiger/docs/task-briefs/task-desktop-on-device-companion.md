# Task Brief · Electron 桌面端侧陪伴（窄范围生成例外）

> **状态（2026-08-18）**：政策已拍板；L0 探针已在 **Apple M5 16GB** 过数值闸。分析师跟进：**这批数字只证明高配可行，还不能定论**。**不合** PR #336 直到 Focusing 掉帧人工测完；**M1 8GB** 是选型分水岭（未测）。**不锁** 0.6B、**不开** L1。仍无产品入口。  
> **定位权威**：`PRODUCT_POSITIONING.md`「禅意倾听者」（2026-08-10 检索不生成 **仍有效**；本文件只执行 2026-08-18 **窄例外**）。  
> **Web Confide**：`task-confide-to-yin-v1.md`（检索路径不变；禁止把本例外做进 `src/`）。  
> **壳**：`task-electron-desktop-scaffold.md`（步骤 A/B **不含**本功能；不得绑进托盘验收）。

---

## 拍板（硬 · 2026-08-18）

**批复措辞（须原样遵守，禁止改写成「全面允许生成」）**：

> **仅限桌面端受约束生成、其余场景仍然检索不生成。**

| 0.4 问 | 批复 |
|---|---|
| 是否修订「禅意倾听者」 | **窄例外，不是废止。** Web / PWA / 已审仪式文案仍检索不生成。 |
| 入口 | 与 Confide **合并成一个** Idle ⋯ / 抽屉项。禁止「倾诉」和「AI 阿寅」并排。 |
| 触发 | **仅用户主动、仅 Idle。** 不主动开口。 |

用户需求可以开这个口子；**不能**拿本次批准扩大到别的场景。

---

## 冲突扫描（已拍板）

对照 `SCENARIO_TESTS.md`。人设 / 职责曾与 2026-08-10 红线冲突；强度上聊天面板重于 Whisper / Recover。拍板后的边界：

| 相邻 | 三轴 | 拍板后 |
|---|---|---|
| Confide | 职责 | **同一入口**；桌面多一层最后兜底生成 |
| Y Whisper / X Recover / B Re-focus / P 提醒 / Arrival / Reflection | 语气 + 强度 | **不得**生成；继续已审文案 |
| X / X2 轻触阿寅 | 职责 | **不**改成聊天 |
| AA / AB | 职责 | 不是托盘、不是 PiP；不挡步骤 B |

正面案例格式见 `FEATURE_CONFLICT_REVIEW.md`「检索不生成 vs 桌面陪伴」。

---

## 技术（已认可 · 不再开选型会）

| 项 | 口径 |
|---|---|
| 运行时 | **node-llama-cpp**，仅 Electron **主进程**（或 utility / 子进程）。禁止渲染进程。 |
| 模型文件 | **不进 DMG**；首次打开入口时下载到 userData |
| 默认型号 | L0 实测后再锁。候选起点 Qwen3-0.6B Q4；不在 L0 前争论 0.6B vs 1.7B |
| Focusing | **卸载模型**，释放统一内存 |
| 隔离 | 代码只放 `focus-tiger/desktop/`（如 `companion/`）。Web / PWA **不** feature-detect。无 `window.desktopShell.companion` 则菜单行 **不注册** |
| 体积 | 原生库增量约 30–50 MB（arm64）；模型另下 ~0.5 GB 量级 |

tok/s 文献数不是本机实测。L0 不过关 → 停，改模型或放弃入口。

---

## 路由（实现时锁死）

```text
0 安全 safety_redirect（固定转介句；模型不调用）
  → 1 产品仪式（Arrival / Whisper / Recover / Re-focus / 提醒 / Reflection……已审 i18n）
  → 2 Confide 语料桶（anxious / tired / stuck / sad / scattered）
  → 3 仅桌面：自由倾诉短生成
```

第 3 层约束：短句；承接不建议；不诊断；不呼吸指令；不教练清单；超长截断。生成失败 → 走 Confide `fallback` 语料，不空白、不重试死循环。

文字优先；**不含**语音。

---

## 体验（未实现时先锁契约）

- 点菜单：0–100ms 接收反馈 + 面板淡入（对齐 Journey Log / Confide 玻璃卡，**不要** Whisper 气泡）。
- 未下载 / 加载中：面板内可见进度或铺垫句；禁止哑点击。
- 低配（内存不足或探测失败）：**不提供该能力**（桌面菜单行不出现）；不在 Web 做降级。
- 危机命中：只用 Confide 安全文案。

---

## 工作量分级（实现顺序）

| 级 | 做什么 | 停点 |
|---|---|---|
| **L0** | 主进程加载小模型；记 M1 8GB / M2 16GB 的 RSS、TTFT、tok/s、Focusing 是否掉帧 | 失败则不上入口 |
| **L1** | desktop-only 面板 + 下载进度 + IPC；Focusing 卸载 | 无阿寅人设调优也可 |
| **L2** | 四层路由 + 人设约束；**内部多轮对话**，把跑偏案例攒下来调 prompt | **禁止**一过 L0/L1 就给真实用户 |
| **L3** | 崩溃隔离、门槛、许可声明；考虑随收费 DMG | 不早于步骤 B；不早于定位口径已合入 |

口令「开工桌面陪伴 L0」已下达；本切片只交 **L0 探针**，仍 **不等于** 产品入口。

### L0 怎么跑（本机 Mac）

```text
npm --prefix desktop install
npm run desktop:companion-l0
```

- 首次会下载约 0.5 GB GGUF 到 `~/Library/Application Support/Focus Tiger/companion-l0/`（**不进 git、不进 DMG**）。
- 报告 JSON 写到同一目录 `report-*.json`，并打印 `verdict`。
- **不上** Idle ⋯ / 抽屉入口；`preload` 仍只有既有四条 IPC。
- 跳过窗口（只测加载，不采 rAF）：`FT_COMPANION_L0_SKIP_WINDOW=1 npm run desktop:companion-l0`
- 勿与口令「开工同坐点 L0」混在同一句话里。

L0 数字出来之前 **不锁型号、不排 L1 面板**。

### 分析师跟进（2026-08-18 · 硬）

M5 16GB 过闸 **≠** 「大多数用户机型可行」。真正的瓶颈机型是 **M1 8GB** 统一内存。

- **Focusing 掉帧（M5 · 2026-08-18 用户肉眼）**：双终端下 **无可见影响 / 无卡顿**。
- **M1 8GB**：仍未测。不必现在去找旧电脑；缺这组数就 **不能锁默认模型、不能假定 8GB 机器也给出入口**（Brief 已有：低配探测失败则不出菜单）。在 8GB 数字之前：
  - **禁止**合入 [#336](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/336)
  - **禁止**锁死 Qwen3-0.6B
  - **禁止**开 L1 / 人设 / 选型会

`Idle rAF p95 Δ` 只是探针自己对主循环的干扰，**不能**代替肉眼看 Sit→Focusing 呼吸是否顿挫。`desktop:companion-l0` **会跑完即退**，不能单独完成这项人工测。

**Focusing 掉帧（本机、几分钟）** — 两个终端：

1. 产品窗（**不要**带 `FT_COMPANION_L0`）：`npm run desktop:dev` → Sit → Focusing，看阿寅呼吸。
2. 另开终端、Focusing 已开始后：`FT_COMPANION_L0_SKIP_WINDOW=1 npm run desktop:companion-l0`（子进程加载 ≈0.9 GB 再卸载，**本命令不开窗**）。盯的是终端 1 那个产品窗：加载中 / **dispose 那几百毫秒** 呼吸有没有可见顿挫。

**M1 8GB（有机器再跑）**：同一套 `npm run desktop:companion-l0`，把 `report-*.json` 的 RSS / TTFT / tok/s / `verdict` 记回 TRACKER。这是「默认模型该多小 / 低配是否直接不提供入口」的分水岭，不是走过场。

---

## 明确不做

- 全面推翻「检索不生成」
- Web / PWA / `src/` 主线接入模型
- 主动开口、点阿寅聊天、用 Whisper/toast 做多轮
- 默认依赖 Ollama；WebLLM 进渲染进程
- 语音；把本功能绑进 Electron 步骤 A/B 验收
- 改 `SCENARIO_TESTS.md`（正式场景等 L2 后再议附录）

---

## 已好清单（实现时守住）

- `?product=1` 与 Safari 路径零模型、零新入口
- Confide v1 分类 / 安全阀 / 语料行为不因桌面例外而变
- 场景 B / X / Y / P 文案不被模型改写
- 收费 DMG 托盘（步骤 B）仍按脚手架 Brief

## 进度

- [x] L0 探针代码（download / load / generate / unload / Idle rAF 代理）；**产品入口仍不上**
- [x] L0 本机数字（**Apple M5 16GB · Metal**）：load ≈ 0.8s，TTFT ≈ 0.65s，≈ 116 tok/s，RSS 加载峰值 ≈ 0.9 GB，卸载后回落；Idle rAF p95 增量 ≈ 0.1ms。型号 **未锁**（只测了这一台）
- [x] L0 Focusing 掉帧（双终端：产品窗 Sit→Focusing + skip-window 探针卸载）— **2026-08-18 用户肉眼（M5）**：对 Focusing 的 Yin **无任何可见影响 / 无卡顿**
- [ ] L0 **M1 8GB** 同一探针（选型分水岭；未测。**不必现在找旧电脑**；缺数则低配默认不出入口、不锁 0.6B）
- [ ] L1 desktop-only 面板 + 下载 UX + IPC — **8GB 未测不开**
- [ ] L2 四层路由 + 人设；内部多轮攒跑偏案例
- [ ] L3 崩溃隔离 / 门槛 / 许可；不早于步骤 B
