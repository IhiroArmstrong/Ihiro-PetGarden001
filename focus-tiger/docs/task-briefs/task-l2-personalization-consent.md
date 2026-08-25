# Task Brief · YPE L2 Cloud Personalization Consent（文案需求）

> **状态（2026-08-26）**：产品会已拍 **H.3 V1 五键 + Pack 契约 + 异步不变量**。本 Brief **只定同意文案必须解释什么**。  
> **本切片禁止**：最终 UI 字句定稿（en/zh/ja）、Worker、ingest、改 `l0Config.js`、改 L1/桌面 generate runtime、改生产行为。  
> **权威**：`YIN_PERSONALIZATION_ENGINE.md` §H · §G · 文首不变量。  
> **下一会**：Consent 文案会（审 locale 草稿）。再下一刀才是 Cloud algorithm contract → Worker → 口令「开工 L2」。

---

## 冲突扫描

对照 `SCENARIO_TESTS.md` 场景 AG（Memory Consent）/ Z 练习备份 / Privacy 漏斗 / AE Confide。

| 轴 | 判断 |
|---|---|
| **a. 强度** | 默认关；拒绝后体验不变。不得做成比 Sit 更重的强制墙。 |
| **b. 人设** | 不说 training / 云端大脑在分析你。不诊断。 |
| **c. 职责** | **第四条独立同意**，禁止借用 Memory / 备份 OTP / 漏斗 opt-in。 |

后台网络：本 Brief 不接线。将来拉 Pack 须另答 `BACKGROUND_NETWORK.md` 三问。

点击反馈：本 Brief **不涉及可点击交互**（无 UI）。文案会之后的开关须 0–1s 看见选中/关闭。

---

## 四条同意（不得合并）

| 开关 | 用户须理解的事 | 不是 |
|---|---|---|
| **Memory** | 阿寅可以在**这台设备**记住一些帮助陪伴的信息 | 上云 |
| **YPE 云个人化** | 允许发送 **少量结构化使用信号**（无原文），用于改进长期陪伴政策；结果以 State Pack 增强本机阿寅 | Memory；备份；漏斗 |
| **练习备份** | 把练习留痕快照备份到云（OTP） | 个人化算法 |
| **意愿漏斗** | 匿名计数类支持意愿（现网 Privacy 开关） | 个人化 |

分析师示意里的三开关漏了漏斗——契约以**四条**为准。

---

## 必须解释的内容（文案会用 · 非最终句子）

1. **发送什么**：仅 H.3 V1 五键：`focus_return_rate`、`reflection_frequency`、`companion_style_preference`、`intervention_preference`（由陪伴档派生，不是第二套 UI）、`practice_day_count_window`。**无** Confide / Memory 摘要 / 情绪标签计数 / Whisper 已见掩码。  
2. **为什么**：云端做长期 pattern / 政策计算，把结果做成 State Pack，**异步**增强本机阿寅。  
3. **没网**：Sit / Confide / 桌面 generate **照常**。Cloud 不是 runtime 依赖。  
4. **多久 / 撤回 / 删除**：产品文案必须写清保留窗口、如何关掉、关掉后服务端特征与 Pack 删除；不得只写「我们会处理」。具体天数 **本 Brief 不锁**——文案会拍。  
5. **默认关**。拒绝或关掉后 L0/L1 / 本机 Memory **照常**。  
6. **用词**：未满足严格匿名化定义时，**禁止** anonymous / 匿名数据。使用 **limited structured signals** / 少量结构化使用信号。若将来身份键绑定账户，须如实写「与你的个人化档案关联」，不得装作匿名。  
7. **禁止对用户说**：training、你的数据在教模型、云端大脑正在分析你、现在阿寅要等服务器才说话。

---

## 不做

- 把本 Brief 理解成已开工 L2  
- 在 Privacy 现网稿里直接上开关（须文案会 + 开工口令）  
- 与 Newsletter / 漏斗 / 备份文案混写一个 checkbox  
