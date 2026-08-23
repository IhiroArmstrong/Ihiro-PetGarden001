# Task Brief · Reflection 通用情绪共鸣（Mindful Reflection Echo）

> **状态（2026-08-07）**：实现中 · 分支 `feature/reflection-echo-copy-pool`。  
> **目的**：Reflection 提交非空答案后，阿寅以「禅宗道友」给一句克制、温暖的通用共鸣（非 AI、非教练）。

## 权威边界

| 项 | 口径 |
|---|---|
| 触发 | 用户对某题 **Continue** 且该题答案非空（**已定**：按题触发，非整场收束句） |
| 末题停留 | 末题非空 Continue 后**不**自动关卡。共鸣留下，输入框只读；再点 Continue / Skip / Skip all / Esc 才关。禁止 0.9s 定时关。空白 Continue / 末题 Skip 仍立刻关。 |
| Skip / Skip all | **不**出新共鸣（先前 Continue 的共鸣可保留至关面板） |
| 文案 | 观察式、不贴标签、不追因、不说教（`EMOTION_BIBLE` / `PRINCIPLES`） |
| 数据 | **不上传**；不改 Reflection 本地存储 schema |
| i18n | en + ja + zh；`REFLECTION_ECHO_1`…`_7`；按 `localDate` + salt 取模 |
| **禁止** | 生成式 AI；分析人格；付费门挡关面板；**共鸣句内**塞 Buy Tea / Sanctuary 硬推销（「Buy now」腔）。**允许** Reflection 底部 Daily Wisdom + 委婉 Sanctuary 印花（见 `task-daily-wisdom-reflection-mount.md`；`PRINCIPLES` 经济可持续） |

## 实现要点

1. `reflectionEchoCopy.js` + locales `REFLECTION_ECHO_*`。  
2. `TigerReflectionMoment`：`[data-testid=reflection-companion-echo]` 轻量一行。  
3. 单测：非空 → 出句；Skip → 不出；池长度 ≥5。  
4. TEST_TRACKER：主路径 + Rise 后再坐一场回流。
