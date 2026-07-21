# NEW_ASSETS_2026-07-19-B.md — Rise 场景与斗篷入睡过渡

> **源 zip（仓库根）**
> - `rise-stretch-casual-transparent.zip`（39 帧）→ **Prompt 1 已执行（2026-07-20）**
> - `cloak-sleep-transparent.zip`（34 帧）→ **Prompt 2a 已入库；2b 已拍板；2c 待接线**
>
> **归档**：`focus-tiger/docs/NEW_ASSETS_2026-07-19-B.md`（与根目录同步）。

---

## 产品拍板（2026-07-20）

| 素材 | 场景 | 状态 |
|---|---|---|
| `rise-stretch-casual` | Rise（中途主动结束）；替换 `blinkBreathe` | **已接线** |
| `cloak-sleep` | 进入 Sleeping / DORMANT 过渡 | **2a 已入库**；**2b = ① 当日首次进 DORMANT 播一次**；**2c 未接线** |

---

## Prompt 1：rise-stretch-casual → Rise

**状态：已执行（2026-07-20）** — 见 commit / TEST_TRACKER「rise-stretch-casual」。

---

## Prompt 2：cloak-sleep → 进入 DORMANT

### 2a 入库-only — **已执行（2026-07-20）**

- 路径：`public/sprites/tiger-cub/monk-robe-default/cloak-sleep/frame_001–034.png`
- manifest：`cloakSleep`，6 fps，`loopMode: none`，`holdLastFrame: true`（≈5.7s）
- 调试：入库素材列表「cloak-sleep 披毯入睡(候选)」；**不**经 MoodController / 日切自动触发
- 与 Rise / `riseStretchCasual` 互斥（文档与 catalog 已写明）

### 2b 接入时机 — **已拍板**

> **① 当日首次进入 DORMANT 时播一次**，播完落入 `sleeping` 持续循环。  
> 不采用「仅夜晚」或「每次 Rise 后仍 DORMANT 再播」作为默认。

### 2c 接线 — **待办（等 Prompt 1 人工测通过后再开）**

实现要点（备忘，防忘上下文）：

1. 当日首次 `STATES.DORMANT` / `playEmotion('sleeping')` 入口：先 `cloakSleep`，`onComplete` → `sleeping`（CapCut 或短 cross-fade）。
2. 同日再次进入睡态：直接 `sleeping`，不重复披毯。
3. 须有「本自然日已播过 cloakSleep」日期戳（可复用 / 旁路 `DailyCompletionStore` 或独立 key）。
4. 与 Rise/`riseStretchCasual`、Celebrating、Honesty `dormantWake` 互斥；唤醒仍走 `dormantWake`（**2026-07-21**：`dormantWake` 已试接 `cloak-sleep` **倒放**）。
5. 单测：首次 DORMANT → cloakSleep；同日第二次 → 直接 sleeping。
6. TEST_TRACKER 正式触发行 + SCENARIO（零完成开场）。

### 2d 验收 — 2c 之后人工测
