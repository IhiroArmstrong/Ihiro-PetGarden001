# 合并回应规格补条 · 情绪半边必须有真实情绪分并落桶

> **地位**：给 [`task-confide-mixed-emotion-then-product.md`](./task-confide-mixed-emotion-then-product.md)（CR-45 · 混合句「先接情绪、再答产品」）的**硬闸补条**。本文件可先于那份 Brief 合入。  
> **状态（2026-10-15）**：只出规格。**不实现、不改发送链、不调** `product_minus_mood_margin` **0.01**。  
> **跟进**：[`confide-routing-followup.md`](../confide-routing-followup.md) CR-45。

---

## 补条（必须同时成立，否则不合并）

在已有「至少一句函数 A 产品半边、至少另一句非产品半边」之上，**情绪半边那一分句**还须：

1. **真实情绪分**：该分句 `moodScore` ≥ 开发集上定的下限。下限 = 路由开发集 v2 里、非函数 A 产品路径的分句 `moodScore` 的 **5% 分位**（实验室 `npm run audit:routing-intent-feasibility` 写出 `destset_emotion_mood_floor_p05`；本次实验室 **0.50**（n=38 个开发集混合/情绪主导的非产品分句；`routing-intent-feasibility-1792055403737.json`））。低于下限 = 没有真实情绪分。  
2. **落到具体情绪桶**：该分句 `confideClassify` 必须落在 `CONFIDE_EMOTION_BUCKETS`（`anxious` / `tired` / `stuck` / `sad` / `scattered`）之一。`fallback`、安全层、他人攻击、空分类 **都不算**落桶。

任一失败 → **不合并**，退回今天的单路径（产品短答 / 诚实空态 / 情绪语料）。禁止用 generate、茶句、点头套话补第一段。

本条不改变函数 A 的 0.01，也不把「情绪分很高但没有具体桶」当成听见心情。

---

## 冲突扫描（对照场景 AE）

- **强度**：不增加用户步骤；只是少合并。  
- **语气**：没有真情绪分或落不了桶时，不假装先接住心情。  
- **职责**：纯产品锚仍不得合并（CR-45 原文）；本条再挡住「假情绪半边」。

无未拍板新冲突。实现仍等 PO 点头 CR-45。
