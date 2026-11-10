# 深链 vs locale：路由 / query 结论（2026-11-10）

> **状态**：结论已写 · **无运行时**  
> **人话**：从日历或快捷指令开坐，用现成的网址参数，不必改语言总账、也不必为语言再开一套地址。  
> **类**：A 类（只锁结论；深链解析层仍是 B 类，须口令「按深链 Shortcuts Brief 开工解析层」）  
> **git 依据**：Brief [#1596](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1596) · 点头 [#1660](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1660) 已合 `develop`。截至 2026-11-10：`gh pr list` **无** 深链解析 OPEN/MERGED 实现 PR。

## 结论（locale 这一刀）

| 问 | 答 |
|---|---|
| 总账 `en.json` / `zh.json` / `ja.json` 要不要为深链改路由或 query？ | **不要。** |
| 深链用什么地址？ | 沿用现网 query：`start` + `min`（例 `?product=1&start=sit&min=5`；电脑版 `focus-tiger://app/` 同一套）。见 [`task-deep-link-shortcuts-cookbook.md`](./task-deep-link-shortcuts-cookbook.md) §2–§3。 |
| 丢弃提示文案呢？ | 将来解析层用 **切片**（en/ja 可发、zh 草稿）。**不**写进总账、**不**新开语言路由。 |
| 方案 A Support 总账对齐会不会动深链？ | **不会。** 只把已合切片里的 Support 句子抄进总账，运行时合并结果不变。 |

## 不是

- **不是** 开工深链 A 刀（解析 `open-url`）。  
- **不是** `.ics` 运行时。  
- **不是** 为语言加 `/zh/` 路径或 `?lang=`。  
- **不是** 放宽「功能 PR 改总账另写一句」。

口令「按深链 Shortcuts Brief 开工解析层」= **新 Chat** + 独立功能旁支。本文件不代替那一口令。
