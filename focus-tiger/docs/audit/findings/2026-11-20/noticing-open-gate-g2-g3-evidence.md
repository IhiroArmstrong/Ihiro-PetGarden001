# 觉察一句开门 · G2 / G3 终端证据（路线 X）

**日期**：2026-11-20  
**性质**：纯文档 · 贴命令与通过行。不改 `src/`。  
**挂钩**：[开门门禁 v2](../../first-package-open-gate-v2.md) G2/G3 · T100 关单三项 §4。与 OPEN [#1808](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1808)（红灯永不藏入口）分列。

---

## G2（#1807 已合 develop）

**PR**：[#1807](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1807) · `test/noticing-g2-help-e2e` · MERGED 2026-11-20。

**自动化**：`focus-tiger/e2e/noticing-g2-help-resources.spec.js` — 英文宽屏，非危机 A/B 与 `safety-01` 后，同一卡内 `[data-testid=confide-to-yin-help-resources]` 可见可点，展开现网 crisis 指引、不进 `#yin-support-modal`。

**人只补**：Electron 真机发送手感一句（见 [`tracker-entries/test-noticing-g2-help-e2e.md`](../../../tracker-entries/test-noticing-g2-help-e2e.md)）。

---

## G3（固定句过现有输出闸 inspector）

闸对 **固定句库** 跑，不是对模型生成跑（句库 Brief §3）。未改 600 / 放行样本。

```bash
cd focus-tiger && node --test src/core/noticingOneLine/noticingFixedLineLibrary.test.js
```

**2026-11-20 本机通过行（摘录）**：

```
✔ G3: every en/zh/ja line is allowed by the existing output-gate inspector
ℹ tests 6
ℹ pass 6
ℹ fail 0
```

**支撑**：层 A 违规/放行规模与 T100 模块自检（10 类 × 3 语 × 20 包 = 600 违规；放行集同尺度 20 包）见：

```bash
cd focus-tiger && node --test src/core/outputGate/outputGate.test.js
```

```
ℹ tests 25
ℹ pass 25
ℹ fail 0
```

---

## G1（结构零生成 · 同回合核对）

```bash
cd focus-tiger && npm run check:generation-gate
```

```
[generation-gate] release-no-generate=ok
[generation-gate] drift=0
```

---

## T100 关单三项（门禁 v2 §4）对照

| # | 项 | 本页证据 |
|---|---|---|
| 1 | 固定句库过 600+20 尺度闸样本（G3） | 上节 G3 单测绿 + `outputGate.test.js` 25/25 |
| 2 | 发布构建倾诉不到生成（G1） | `release-no-generate=ok` · [#1792](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1792) |
| 3 | 输出闸代码保留、觉察路径休眠 | 代码面 #1792 G1 · #1789 固定句接线；**不是**自由生成恢复 |

**仍不是**：实验室 K=3 闸验证、V-02 收口、对客四闸全绿即可无残余风险（G4 [#1799](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1799) 已绿）。
