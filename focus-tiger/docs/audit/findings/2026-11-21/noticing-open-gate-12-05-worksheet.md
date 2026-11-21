# 觉察一句开门 · 12/5 判定工作纸（提前材料）

**写于**：2026-11-21  
**判定日**：仍是 **2026-12-05**（含当天）。本页是提前备好的勾选纸，**不是** 12/5 已签发。  
**性质**：纯文档。不改 `src/`。Agent **不得**代填签发栏。  
**挂钩**：[开门门禁 v2](../../first-package-open-gate-v2.md) §2 · [书面风险接受](../../first-package-written-risk-acceptance.md) · [G2/G3 证据](../2026-11-20/noticing-open-gate-g2-g3-evidence.md)

人话：12 月 5 日当天，对照下面四格勾绿或红。绿/红以当天 `origin/develop` 为准，不以本页 11 月 21 日的摘录当终局。

---

## 1. 四闸（12/5 当天勾）

| 闸 | 规则 | 11/21 已有证据 | 12/5 |
|---|---|---|---|
| G1 | 发布构建倾诉走不到生成 | [#1792](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1792) 已合；`npm run check:generation-gate` → `release-no-generate=ok` | 绿 / 红 |
| G2 | 固定回复旁求助可见 | [#1807](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1807) 已合；`e2e/noticing-g2-help-resources.spec.js`。人只补 Electron 手感 1 句 | 绿 / 红 |
| G3 | 句库过输出闸 600+20 | [#1809](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1809) 已合；`noticingFixedLineLibrary.test.js` + `outputGate.test.js` 25/25 | 绿 / 红 |
| G4 | 语气 + 独立安全两份审 | [#1799](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1799) 已合；第 7 项补审删句 [#1814](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1814) | 绿 / 红 |

**豁免（已锁）**：G1 / G2 红 = 结构不合格，不得签发可发。G3 / G4 红可记残余。**禁止**因红藏入口。**禁止**把红当成打开自由生成。

12/8 包装日不因本表单独顺延。

---

## 2. 专用池补审（不是四闸之一）

#1828 已把「想伤害别人」接回 `aggression-01` / `02` / `03`。这四句**没进过**句库 G4 安全审。12/5 当天由**人**在书面风险接受「专用池四句」表签一行。本页不改字、不代签。

夹具程序（NF-01–NF-10）见 [#1842](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1842)（OPEN）。夹具绿 ≠ 专用池已审。

中档关心路径裁剪（[#1836](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1836) / [#1837](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1837)）**不是** 12/5 四闸条件。

---

## 3. 12/5 当天还要再跑的命令（人填通过行）

```bash
cd focus-tiger && npm run check:generation-gate
cd focus-tiger && node --test src/core/noticingOneLine/noticingFixedLineLibrary.test.js
```

G2 以 develop 上已合 e2e 为准；不必为勾选新开实现旁支。

---

## 4. 签发（仅 12/5 · 人填）

| 栏 | 填写 |
|---|---|
| 判定人 | |
| 日期 | 须为 2026-12-05 |
| G1–G4 | 上表四格 |
| 专用池一行 | 风险接受页已签 / 未签 |
| 备注 | 哪条红、残余是什么；不得写「已藏入口」 |
