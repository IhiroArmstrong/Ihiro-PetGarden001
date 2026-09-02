# Task Brief · YPE L2 Cloud Algorithm Contract

> **状态（2026-08-26）**：Consent 附录有条件通过；身份键已拍（#456）。**本切片**锁定云端 **V1 算法契约**。  
> **V2（2026-09-02 口令已给 · 未改本 V1 运行时）**：秘密变换 + 服务器 `algorithmVersion` 见 `task-ype-v2-secret-transform.md`。属防剽窃层。本文件仍是 **V1 回声**契约，直至 V2 PR 改 Worker / Pack 校验。  
> **本切片禁止**：写入 `src/locales/*.json`、Privacy 现网开关、改 `l0Config.js`、改 L1/桌面 generate runtime、发明未拍板的 insight id（V2 id 只写在 V2 Brief）。  
> **权威**：`YIN_PERSONALIZATION_ENGINE.md` §E · §G · §H.3 · §H.5 · 文首不变量。V1 执行层 SSOT = 本文；V2 执行层 = V2 Brief。

---

## 冲突扫描

对照 `SCENARIO_TESTS.md`：Y Whisper / AE Confide / AG Memory / AF Presence / Z 备份 / 品味层 `/api/emotion-weight`。

| 轴 | 判断 |
|---|---|
| **a. 强度** | 无 UI。算法 **禁止**每次 Sit / 每次开口等服务器。云是异步 overlay。 |
| **b. 人设** | 禁止用完成率给用户贴「不够专注」；禁止诊断 / 人格类型。政策仍是三档陪伴，不是教练。 |
| **c. 职责** | **≠** 品味层（全局手感）。**≠** Memory ranking（留 L1）。**≠** Speak probability（留 L0）。**≠** 练习备份。 |

后台网络：本 Brief 不接线。开工 L2 拉/推 Pack 须另答 `BACKGROUND_NETWORK.md` 三问。

点击反馈：不涉及可点击交互。

**无新冲突。** 本切片把已拍的 Pack / 五键收成 **可实现的 V1 变换**，防止 Worker 做成训练管线或用完成率改档。

---

## V1 算法是什么（先锁语义）

```text
YPE V1 cloud algorithm
  = closed transform from H.3 five keys → PersonalizationStatePack v1
  ≠ foundation-model training
  ≠ taste-layer weights
  ≠ Memory ranking
  ≠ Speak probability
```

用户同意文案可以说「计算长期个人化模式并送回一小份状态」。工程上 V1 那份状态 **只允许** Pack 已拍字段。`patternInsights` 云端 V1 **必须为空**，因此 V1 **不得**用五键假装算出 `morning_settle` 或任何新 insight id。

**V1 允许的「计算」：**

1. 校验五键、灰度（样本不足则不下发 overlay）。  
2. 把用户已选陪伴档写入 Pack 的 `companionStyle`（确认 / 回声，不是从完成率推断另一档）。  
3. 签发 `packVersion` / `issuedAt` / `expiresAt`，供本机缓存与去重。  
4. 把五键留在该 `ype_profile_id` 行上，**直到关即删**。

**V1 明确不做：** 用 `focus_return_rate` / `reflection_frequency` / `practice_day_count_window` 去改 `companionStyle`（例如「回来得少 → 改成 quiet」）。那会变成监督、也和「用户选档优先」打架。

**V2 已排期（非本 Brief 运行时）**：在契约内长出真正政策 = `task-ype-v2-secret-transform.md`（防剽窃层序 2）。仍禁止完成率改档、禁止用户可见打分。V2 **token 白名单**可进 git；**阈值数字**允许只活在 Worker（`ANTI_PLAGIARISM_LAYER.md` §3.1）。须口令「开工 YPE V2」；Quiet Line 源码已合后才动 Pack 校验。

秘密层可以有 `algorithmVersion`（**只存在服务器**，不下发 Pack）。V1 的公开变换是上面的闭包，不是黑盒人格模型。

---

## 输入（仅此）

与 H.3 V1 相同，绑在 `ype_profile_id`：

| 键 | V1 算法角色 |
|---|---|
| `companion_style_preference` | Pack `companionStyle` 的唯一真源（合法则原样；非法 → `default`） |
| `intervention_preference` | **仅输入**；由本机档派生；**禁止**出现在 Pack |
| `focus_return_rate` | 可存；V1 **不**驱动 Pack 档位 / insight |
| `reflection_frequency` | 同上 |
| `practice_day_count_window` | 同上 |

禁止把 Confide 原文、Memory 摘要、Whisper 掩码、AF 标签、邮箱送进本变换。

**灰度（已拍）：** 窗口内完成次数不足（例：&lt;10）→ **不签发 overlay Pack**（本机继续 L0/L1）。不要用稀疏五键组合去「补一个更聪明的包」。

---

## 输出（仅此）

`PersonalizationStatePack` v1（§G）。未知 `schemaVersion` → 客户端整包丢弃。

```text
{
  schemaVersion: 1,
  packVersion: <monotonic>,
  issuedAt, expiresAt,
  companionStyle: "quiet" | "default" | "warm",
  patternInsights: []
}
```

**V1 变换（锁死）：**

```text
if consent != on OR profile missing OR insufficient sample:
  emit no overlay pack
else:
  companionStyle = normalize(companion_style_preference)  // quiet|default|warm else default
  patternInsights = []
  bump packVersion
```

本机应用规则（已拍，算法不得推翻）：

- 用户刚改的本机档 **优先于** 过期 / 更旧 Pack。  
- 没网 / 4xx / 过期 → Sit 不停，用 L0/L1。  
- Pack 若含 `rankHint` / `memoryHints` / 非空云端 insight / `intervention_probability` → **整包丢弃或忽略非法字段**（宁可丢包）。

---

## 禁止（Worker 开工即视为回归）

- per-turn / per-Sit **阻塞**等待本算法。  
- 下发 `rankHint`、`memoryHints`、有序 Memory id、现在开口指令。  
- Speak probability；改 L0 Whisper / busy 门闩。  
- 把个人 `companionStyle` 或五键写入 `/api/emotion-weight` 或练习备份 KV。  
- training / LoRA / 把五键当心理诊断。  
- 用户文案写 ranking、intervention、anonymous、删除天数。

---

## 与身份 / 同意的交界

- 主键：`ype_profile_id`（身份 Brief）。  
- OFF：删该行的 **signals + 已计算 Pack**；本机丢缓存。算法不得把删除做成「再算 90 天」。  
- 离线 OFF：先停 ingest；删除确认前 UI 不得声称云端已删。  
- 第二设备：另一套五键与 Pack，互不合并。

---

## 不做

- 本 Brief ≠ 已开工 Worker / locale  
- 锁具体 JSON 路径、KV 名、过期小时数（属 Worker SLA）  
- 开放式「以后公式随便换但 Pack 字段可以偷偷加」——加字段须升 `schemaVersion` 并另会
