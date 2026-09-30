# TEST_TRACKER · 无自动化提及行 · 三类分类

生成：2026-09-30（Composer）  
数据源：[TEST_TRACKER.md](./TEST_TRACKER.md) 功能清单表  
机器可读：[tracker-no-auto-classification.json](./tracker-no-auto-classification.json)（`node scripts/classify-tracker-no-auto.cjs` 再生）

---

## 1. 数字对齐（与你给的量级）

| 指标 | 本仓扫描 | 说明 |
|---|---:|---|
| 功能清单总行 | 637 | 含已通过 / 仅单测 / 废弃等 |
| 状态「待人工测试」 | **359** | 你记 362：差 3 行，可能含「有问题」里仍待看的行 |
| 状态「有问题」 | 22 | 缺陷待复测，未并入下表主分类 |
| 待人工 + 步骤里**已写**自动化/e2e/单测 | **223** | 你记 ~241：口径差在「步骤正文是否写 `自动化：` 块」 |
| 待人工 + 步骤里**未写**任何自动化 | **127** | 你记 ~121：同口径，差 ~6 行 |
| 其中 UI 可见/交互类待人工 | 315 | 大头仍是「看起来对不对」 |

**结论不变**：真正缺自动化标注的约 **127 行**（≈121）；已写自动化的 **223 行**里，大量仍须你眼看语气和版式，测试只锁路由/闸门/空态。

---

## 2. 分类规则（今晚用）

| 类别 | 含义 | 今晚动作 |
|---|---|---|
| **可自动化** | 路由、闸门、hidden、空态、data-source、互斥、off 开关——结果是确定的 | 最多挑 **两批** 写单测/e2e 草稿；失败才改运行时代码 |
| **必须人眼** | 版式、动画、Safari、玻璃/ dim、节日 wash、支付观感、调试面板 | 保留在 TEST_TRACKER；**不写** e2e 凑绿 |
| **依赖真实模型措辞** | 短答语气、TTS 好不好听、1.7B 卡顿、观察翼 generate 换句、Voice 听写质量 | 继续留给你；**禁止**写进断言 |
| **skip-doc** | 纯文档/RCA/进度表，无用户路径 | 今晚不碰 |

---

## 3. 127 行三分（摘要）

| 类别 | 数量 | 占无自动化行 |
|---|---:|---:|
| 可自动化 | **22** | 17% |
| 必须人眼 | **76** | 60% |
| 依赖真实模型措辞 | **20** | 16% |
| skip-doc（无路径） | **9** | 7% |

> 启发式自动打标 + 人工复核边界。有争议的已按「宁可归人眼」处理（例：背景 dim、玻璃换肤、节日四行）。

### 3.1 可自动化（22）——完整名单

| 行 | 功能 |
|---:|---|
| 411 | My Circle 同伴痕迹列表（24h） |
| 427 | Gemma4-E4B 生产 L0 接线（Mac · L3 换模） |
| 450 | P5 RitualFlow 早退回顾变轻（S09） |
| 453 | Support 结账错误内联提示（NA4/NA5） |
| 491 | 冷启动「目标」问答首卡 |
| 494 | Focus Circle Witness Idle 痕迹条玻璃换肤（二期） |
| 521 | Growth 面板背景 dim（Slice 2） |
| 525 | Quiet Line 背景 dim（Slice 1a） |
| 526 | 阿寅静帧壁纸背景 dim（Slice 1b） |
| 545 | Quiet Together ∪ Global Lanterns MVP |
| 579 | Confide E′ 规则预筛（软边界/陪伴字面/窄 OTHER） |
| 588 | Allow 后 What Yin remembers 空态文案 |
| 596 | 叠层占用三问接 registry（摸头/进睡） |
| 597 | Privacy 点空白关 sheet |
| 645 | Yin Personal Memory Slice 1a（Consent + store） |
| 647 | Yin Personal Memory Slice 1c（What Yin remembers + Forget） |
| 662 | Yin's Collections「years of sitting」文案 |
| 675 | Companion 三选一下藏 Breath 左球 |
| 777 | FocusHUD 无脉冲点宿主悬停 tip |
| 812 | RitualFlow 三进阶仪式 |
| 873 | UI 叠层玻璃泡统一 |
| 974 | 375 · How shall we sit 不得再出 Honesty dock pill |

**今晚优先两批（与 TRACKER 367/421 对齐，非上表全做）：**

1. **攻击句安全路由** — TRACKER L421/L546/L409；已有 `confideAggressionAcceptanceFixtures` / `test:confide-acceptance --suites=aggression`（30/30），缺口是 **`resolveConfideDesktopSource` 与 UI _send 路径同锚**（见下节草稿测试）。
2. **知识库未命中诚实空态** — TRACKER L367；已有 `confideProductKnowledgeSemantic.test.js`，缺口是 **ready embedding + 情绪旁白不得 honesty**、**产品问未命中必 honesty 禁 generate** 的桌面源冻结。

**刻意后置（有额度再开第三批）：** 节日四行（L476–480/L980）、坐姿/叠层挡住（L596 等）、Ritual dim（L521/L525/L526）。

### 3.2 必须人眼（76）——模块桶

| 桶 | 约行数 | 代表 |
|---|---:|---|
| Idle/Arrival/Choose 动画观感 | 12+ | L723–724 Choose pingpong、L901–903 一分钟呼吸摆尾 |
| Focus Circle / My Circle 系列 | 10+ | L429–431 Safari 卡死、L528–544 各刀 Witness |
| 节日主题 wash+文案 | 4 | L476–480、L980（四行） |
| 玻璃/ dim / 版式 | 15+ | L494–496、L521–526、L873 |
| Ambient/听感/磬声 | 6+ | L602、L673、L984 |
| 调试面板/实验室 | 10+ | L728–729、L871–877 |
| Safari/WebKit 专项 | 5+ | L430、L733 |
| 支付/Support 观感 | 5+ | L583–584、L810–815 |
| 其它 UI 手感 | 余 | 冷启动 Yin 消失 L487、PWA L977 等 |

完整 76 行见 JSON `classification.human-eye`。

### 3.3 依赖真实模型措辞（20）——完整名单

| 行 | 功能 |
|---:|---|
| 435 | #774 日语 Confide 5 句连发去重 |
| 456 | C5 Transition Moment + CAW-T whisper |
| 476–480 | 节日 Phase 4（万圣/元旦/感恩） |
| 482 | Label/Hint/Tip 机制审计清单 |
| 561 | YPE V2 秘密变换 |
| 614 | 导入覆盖确认与错误态 |
| 631 | YPE L1 本地智能 |
| 633 | YPE L2 Worker |
| 638 | 1.7B Focusing hitch（M5） |
| 646 | Personal Memory Slice 1b Remember 管道 |
| 663 | 录入叠层点空白不关 |
| 670 | Electron preload CJS |
| 730 | 14 套新抠图算法 |
| 745 | MilestoneGlow 琉璃星石 |
| 747 | MindfulAcknowledge 20 分钟确认 |
| 792 | MilestoneGlow breath-halo-hq |
| 912 | 场景 B 鹦鹉稀有彩蛋 |
| 980 | 节日 Phase 3 圣诞 |

Voice Input L346–347、Confide L2 短答、观察翼 L392 等**已在 TRACKER 步骤里写了单测名**，不计入本次 127，但仍属「你眼看措辞」。

---

## 4. 223 行「已写自动化但仍待人工」说明

这些行步骤里已有 `自动化：…` / e2e 名 / `.test.js`，但状态仍是「待人工测试」。原因：

- 自动化锁 **路由/闸门**，不锁 **语气、版式、TTS 听感**；
- Electron 全链路、Safari、Stripe 回跳等仍标待人工；
- 关单须你书面 OK + tip hash（见 TEST_TRACKER「标已通过门禁」）。

**不必再铺一层全盘 e2e**——与已列用例重复，且选择器变红会增加你早上处理量。

---

## 5. 近十天合入量（供审计对话用）

`origin/develop` 自 **2026-09-20** 起 merge commit：**141**（与你记 ~138 同量级）。

高风险主题（强模型审计 40% 额度）建议只读扫：

- Confide：#1029 `fix/confide-reply-routing`、#1022 kb-near-match、#1016 kb-reminder-functional、#919 companion work gate
- Voice：#1015–1017、#1023–1024 voice-command slices
- 叠层/可见性：#1020 visibility-undo-toast、#1018 voice-undo-toast
- Stage2：#1019 stage2-m-replay
- TTS push 旁支（若已合）：朗读/安全路由

---

## 6. 再生与维护

```bash
cd focus-tiger
node scripts/classify-tracker-no-auto.cjs
```

改 TEST_TRACKER 后重跑，JSON 与本文数字段需人工决定是否同步改。
