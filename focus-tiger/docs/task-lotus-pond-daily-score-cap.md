# Task Brief：莲花池「单日软封顶」——补 growth score 的防作弊缝隙

状态：**已拍板 · 已合入实现**（PO 2026-09-10）。

---

## 拍板结论

| 问题 | 决定 |
|---|---|
| 封顶阈值 | **180 分钟/天**（备选 120 / 240 仅备查） |
| 花朵计数 | **不封顶** — 只有 score 读取封顶 |
| 历史数据 | **不倒算** — grandfather `scoreEligibleLifetimeMinutes = lifetimeMinutes` |
| 监控 | **console.info** 超封顶时一条 |

## 方案摘要

```
score = practiceDayCount + floor(scoreEligibleLifetimeMinutes / 60)
```

- 写入侧：`LotusPondStore.addMinutes` 按日历日追踪封顶，累加 `scoreEligibleLifetimeMinutes`。
- 花朵 / 真实 `lifetimeMinutes`：不封顶。
- Persona：`single-binge` score 11→4；新增 `single-binge-extreme`（24h score=4）。
- 验收线：binge persona score ≤ 21×60%（≤12）。

## 实现路径（§2.4）

见 `src/core/scoreDailyCap.js` · `LotusPondStore.js` · `GROWTH_METRICS_CHARTER.md` § scoreFormula.v3。

## 明确不做

- 不改解锁门槛数值
- 不改花朵阈值
- 不做计时器强制暂停
