# Task Brief · Reflection 通用情绪共鸣（Mindful Reflection Echo）

> **状态（2026-08-07）**：用户同意 **现在就排**；与支付无关的小任务。**本回合只文档**；实现另开 feature。  
> **目的**：Reflection 提交非空答案后，阿寅以「禅宗道友」给一句克制、温暖的通用共鸣（非 AI、非教练）。

## 权威边界

| 项 | 口径 |
|---|---|
| 触发 | 用户对某题 **Continue** 且该题答案非空（或整场至少一题非空后的收束句——实现时定一种，写入单测） |
| Skip / Skip all | **可不**出共鸣 |
| 文案 | 观察式、不贴标签、不追因、不说教（`EMOTION_BIBLE` / `PRINCIPLES`） |
| 数据 | **不上传**；不因共鸣改 Reflection 本地存储 schema（除非只加已读 flag） |
| i18n | en + ja 池；**5–8** 条随机（或按 localDate 取模，避免连刷同句） |
| **禁止** | 生成式 AI；分析人格；付费门；塞 Buy Tea / Sanctuary CTA 进共鸣句 |

## 文案气质（示例 · 非定稿）

- “What you wrote is held here. Yin sits with you.”  
- “Heard. No fixing needed — just company.”  
- “This stays between you and the quiet.”  
- “You wrote it. We understand. Yin is here with you.”

## 实现要点（将来）

1. `COPY_POOLS` 或 locales `REFLECTION_ECHO_*`。  
2. `TigerReflectionMoment` UI 轻量一行（勿挤爆三问）。  
3. 单测：非空 → 出句；Skip → 不出；池长度 ≥5。  
4. TEST_TRACKER 人工：主路径 + Rise 后再坐一场回流。  

建议分支：`feature/reflection-echo-copy-pool`。
