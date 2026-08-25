# Task Brief · Yin Personalization Engine · L0（本地政策接口）

> **状态（2026-08-26）**：**L0 开工**（口令「开工 Yin Personalization Engine」）。  
> **权威架构**：`YIN_PERSONALIZATION_ENGINE.md` §3 / §5。  
> **前置**：方向锁 #451 已合 `develop`。  
> **禁止本切片**：L1 检索重写、L2 State Pack / Worker、Speak probability、仪式 generate 扩权、品味层混桶、练习备份 6 key。

---

## 冲突扫描

对照 `SCENARIO_TESTS.md` 场景 Y Whisper / AE Confide / Sit / AG Memory。

| 轴 | 相邻 | 判断 |
|---|---|---|
| **a. 强度** | Sit；Y；AE | 只收口现有门闩，不新增点击、不先问云。Sit 不加重。 |
| **b. 人设** | 观照者；Safety | 政策档 L0 固定 `default`；禁止教练督促 / 临床标签。 |
| **c. 职责** | AG Memory；AF Presence；品味层；备份 | YPE 编排不替代 store。retrieve 仍走 Memory 1d。 |

无新可点击路径。不涉及后台网络。

---

## 做什么

1. `src/core/yinPersonalizationEngine.js`：三档枚举、层序常量、丢弃 Pack、Confide generate 与 Moment Whisper **parity 包装**。  
2. `ConfideToYinUI` / `MomentWhisperUI` 经该接口调用现网门闩。  
3. 单测锁：style 恒 `default`；Pack 不应用；generate / Whisper 与旧 helper 同真值。

## 不做

- quiet/warm UI 切换  
- `memoryRankHints` 覆盖检索  
- cloud 路由  
- 新 localStorage key

## 验收

- 单元：`yinPersonalizationEngine.test.js`  
- 用户路径：Whisper 一生一次 + busy 仍静默；Confide 安全/情绪桶仍不 generate。观感应与开工前相同。
