# Task Brief · 生成路径诊断（T33 · 只读）

> **状态（2026-10-21）**：**PO 已点头开工**（口令「立刻开工」T33；只读）。本文件是诊断结论，**无运行时**。  
> **类别**：**A 类**（不改变用户看到的路由 / 回复 / 等待）。  
> **代号**：**T33**。不是 T30（认知 how-to）、不是 T32（复述护栏）。  
> **探针**：`origin/develop` tip `09f11959`（含 T31 #1365；**不含**未合的 T30 #1364）。  
> **方法**：对田野形状走现网纯函数（`confideClassify` → meta bucket → desktop source → chat 翼 / 操作闸）。不发模型、不改 `src/`。

---

## 0. 大白话

「麦克风冥想」和「为什么冥想」答非所问，**不是走错安全或徽章**。前者进了观察翼生成，失败后容易掉进茶句；后者已经在问答翼生成，跑题是模型没接住，不是跳转开关。

## 一、田野三句走了哪条路

| 形状（机制，不是词表） | classify | 桌面上的桶 | 可见 source | chat 翼？ | 结论 |
|---|---|---|---|---|---|
| 两实词碎片、无问号（如 microphone + meditation） | `fallback` | `generate_skip_classify` | `generate` | **否**（观察翼） | 不进产品问。观察翼空话/套势被 sanitize 拒收后，现网 corpus 含茶句（`fallback-03`）。**茶句 = 观察翼失败回落，不是分类成茶。** |
| 以 why 起头的短活动问（如 Why meditation） | `fallback` | `generate_skip_classify` | `generate` | **是** | 不是产品问、不跳转。跑题发生在 **问答翼 generate 质量**，路由已对。 |
| 黄金脚本 `Why should I do some meditation?` | 同上 | 同上 | `generate` | **是** | 与上同一条路。通道期望本来就是情绪或生成。 |
| 对照：`How can I meditate?` | `fallback` | `product_knowledge_honesty` | 诚实空态/跳转链 | 是 | 操作 how-to，**不是** T33 那两句。 |
| 对照：`How to understand zen practice` | `fallback` | `product_knowledge_honesty` | 诚实空态/跳转链 | 是 | 现网仍当操作 how-to。收紧归 **T30**（#1364 未合），本诊断不改。 |

安全 / 个人事实 / 问候：上列形状均为 `false`。Help Center 在 `gateAction=skip` 时不跳转。

## 二、不做（本刀）

- 不改发送链、prompt、sanitize、corpus。  
- 不把 microphone / Why meditation 写进关键词表。  
- 不在本 PR 叠 T30 / T32。

## 三、若以后要修（须另 Brief · 不自动开工）

我认为最合理的是：**先不要动 Why 问句的路由**（已经在问答翼）；麦克风类无问号碎片若仍掉茶句，再单开 B 类 Brief，讨论「无问号的两实词碎片是否改走问答翼」，用形状而不是词表。Why 跑题若仍在，是 chat 翼 prompt / 模型，不是 T23 跳转。

较弱：把碎片改成产品问——会误伤闲聊名词并列。把 Why 改跳 Help Center——与 gs-h03 通道期望冲突。

## 四、变体矩阵 / 点击 / 边缘 / 共用机制

本次不新增练习种类、商品类型、宽窄视口分叉或多语言入口差异，变体矩阵跳过。  
本次无可点击交互改动，点击反馈节跳过。  
本次无付款/已购/练习结束/窄屏专属分支，边缘状态节跳过。  
本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

## 五、冲突扫描

无用户路径改动（只读）。邻接：场景 AE generate、T30 认知 how-to、T32 复述护栏——本文件不改它们。
