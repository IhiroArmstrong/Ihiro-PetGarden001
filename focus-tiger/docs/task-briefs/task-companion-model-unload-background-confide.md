# Task Brief · 本地 AI 模型「切后台 / 关 Confide 即 unload」

> **状态（2026-09-06）**：**可开工**（产品已拍板宽限期 **60 秒**）。  
> **分支**：`fix/companion-unload-background-confide`（勿与 `docs/hints-briefs-arrival-c1-sep6` 等文档旁支混改）。

## 一句话

复用 `setFocusing(true)` 已验证的 `unload()` IPC，把触发点从「仅 Focusing」扩展到「Electron shell 隐藏（含最小化/收进托盘）」与「关闭 Confide 面板」，堵上模型常驻内存的两个已知缺口。

## 背景

现状核实（见 `l1Runtime.js` / `ConfideToYinUI.js` / `onShellVisibility`）：

| 场景 | 改前 |
|---|---|
| Sit → Focusing | 已 unload，已验证释放约 1.27GB RSS |
| App 退后台（shell hidden/托盘） | 未接线，`onShellVisibility` 只服务 AttentionSignals/Checkout |
| 关闭 Confide 面板 | 未接线，`close()` 显式传 `unload: false` |

结果：Idle 开着 Confide、或关闭面板后、或切到别的 App/收进托盘，模型仍可能常驻内存。对 8GB 门槛机型（尤其 Apple 统一内存）是不必要的常驻负担。

**产品拍板（2026-09-06）**：宽限期 **60 秒**——真离开后 ~1.1GB 占用 60 秒对 8GB 机型不是压力量级，用它换掉「每次误触都要重新 load」的体验损耗是划算的。

## 范围声明（明确不做什么）

- 不改低配门槛（8GB 判定逻辑维持现状）。
- 不改 Focusing 现有的**立即** unload 逻辑，只复用其 IPC；Focusing **不**套用本任务宽限期。
- 不做运行时内存压力检测（仍是启动时查一次总内存）。
- 不改 `resolveConfideReply` 降级到语料库的现有兜底逻辑。

## 设计细节

**触发点 1：Electron shell hidden**

- 挂载在现有 `onShellVisibility` 回调链路上，新增 unload 调度分支（不影响 AttentionSignals/Checkout 既有逻辑）。
- 覆盖：窗口最小化、收进系统托盘、切换到其他 App（shell `hidden: true`）。
- `hidden: false` → 取消宽限计时器。

**触发点 2：关闭 Confide 面板**

- `ConfideToYinUI.close()` → 经 `onClose` 调度宽限 unload（不立即 unload）。
- `open()` → 取消宽限计时器。

**宽限期：60 秒（已拍板）**

- 两个触发点共用**单一**计时器；已挂计时器时不叠加第二个。
- 宽限内 shell 恢复可见或 Confide 重新打开 → 取消计时器，不触发 unload。
- Entering Focusing → 取消计时器 + 既有立即 unload（不变）。

## 验收标准

- [ ] Electron shell `hidden` 且超过 60s 未恢复 → 模型 unload。
- [ ] 宽限内 shell 恢复可见 → 不 unload。
- [ ] 关闭 Confide 且超过 60s 未重开 → 模型 unload。
- [ ] 宽限内重新打开 Confide → 不 unload。
- [ ] Focusing 仍立即 unload，不套用宽限期。
- [ ] AttentionSignals/Checkout 的 `onShellVisibility` 行为不变。
- [ ] 低配（本就不 load）路径不受影响。

## 风险

- 宽限期计时器与 Focusing 立即 unload、多触发点同时命中：须单一计时器 + Focusing 时 `cancel()`。
- `onShellVisibility` 多消费方：新增分支不得改变既有回调时序。

## 后台网络三问

不涉及后台网络（无新增网络请求）。
