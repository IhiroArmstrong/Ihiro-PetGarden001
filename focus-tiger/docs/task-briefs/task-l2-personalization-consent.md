# Task Brief · YPE L2 Cloud Personalization Consent

> **状态（2026-08-26）**：产品会已拍 **H.3 V1 五键 + Pack 契约 + 异步不变量**（#454）。**关即删** + HINT/DETAIL 结构已锁。三语附录 **有条件通过**（设计师书面：改日文 LABEL + 三语 DETAIL「干预偏好」）。身份键 **已拍**（`task-l2-personalization-identity.md`）。算法契约 **已拍**（`task-l2-personalization-algorithm.md`）。  
> **本切片禁止**：写入 `src/locales/*.json`、Privacy 现网开关、Worker、ingest、改 `l0Config.js`、改 L1/桌面 generate runtime、改生产行为。  
> **权威**：`YIN_PERSONALIZATION_ENGINE.md` §H · §G · §I · §H.5。用户句以**本 Brief 附录**为准；locale 须口令「开工 L2 UI」。  
> **下一刀**：locale 须口令「开工 L2 UI」；运行时须口令「开工 L2」。算法契约见 `task-l2-personalization-algorithm.md`。

---

## 冲突扫描

对照 `SCENARIO_TESTS.md` 场景 AG（Memory Consent）/ Z 练习备份 / Privacy 漏斗 / AE Confide；契约对照 `YIN_PERSONALIZATION_ENGINE.md` Pack / H.3 / §I。

| 轴 | 判断 |
|---|---|
| **a. 强度** | 默认关；拒绝后体验不变。Privacy 上 LABEL+短 HINT；DETAIL 默认折叠。不得做成比 Sit 更重的强制墙。 |
| **b. 人设** | 不说 training / 云端大脑 / 诊断。讲「陪伴方式逐渐更适合你」，不讲神秘运算。 |
| **c. 职责** | **第四条独立同意**，禁止借用 Memory / 备份 OTP / 漏斗 opt-in。 |

后台网络：本 Brief 不接线。将来拉 Pack 须另答 `BACKGROUND_NETWORK.md` 三问。

点击反馈：本 Brief **不涉及可点击交互**（无 UI）。开工 L2 UI 后开关须 0–1s 看见选中/关闭；离线关闭不得在服务端确认前显示「云端已删除」（见身份 Brief §5）。

**与 Pack / Privacy 架构（无新冲突）**

- Pack **无** `rankHint` / `memoryHints` / 行为分数 / `intervention_probability`。用户文案禁止出现 ranking、scoring、behavioral profile、intervention probability。
- H.3 V1 **仅五键**。用户句不扩大成「派生的安静/温暖偏好」或未白名单字段。
- §I 已写：关同意 → 服务端特征与 Pack **删除**。本 Brief 把用户可见语义锁成 **关即删**，并补本机 Pack 缓存作废（见下「OFF 工程契约」）。
- `PRIVACY_NOTICE.md` 仍是 v1.0.0 本地优先稿；**禁止**本切片把 YPE 开关句写进 locale。漏斗现网可用「anonymous counts」口径——**仅漏斗**；YPE **禁止**抄 anonymous / 匿名。
- YPE 身份键 **已拍**（`task-l2-personalization-identity.md`）：V1 = 本机随机 `ype_profile_id`；第二设备 = 新档案；删除不连带备份 / Memory / Confide / 漏斗。用户句仍写「与这次选择绑定」，**禁止**升级成全账号 / 全设备。

---

## 四条同意（不得合并）

| 开关 | 现网 key / 位置 | 用户须理解的事 | 不是 |
|---|---|---|---|
| **Memory（本机）** | `YIN_MEMORY_CONSENT_*` · Confide | 阿寅可以在**这台设备**记住一些帮助陪伴的信息 | 上云 |
| **YPE 云个人化** | （新）· Privacy | 允许发送 **少量结构化使用信号**（无原文），用于逐步个人化阿寅的陪伴方式；结果以小型个人化状态返回本机 | Memory；备份；漏斗 |
| **练习备份** | `JOURNEY_LOG_BACKUP_*` · Journey | 把练习留痕快照备份到云（OTP）；关 = 删云端快照 | 个人化算法 |
| **意愿漏斗** | `PRIVACY_SHEET_FUNNEL_OPT_IN_*` · Privacy | 现网支持意愿计数（沿用漏斗既有口径） | 个人化 |

---

## 产品拍板（2026-08-26 · 用户确认分析师收口）

### 保留期（用户可见）

**关即删。** 不采用 90 天或 12 个月作为开关下的长期保留期。

产品语义：

```text
OFF → 停止新上传 → 删除与这次同意绑定的云端个人化数据
    → 作废当前 State Pack（含本机缓存） → Local Yin 继续
```

工程删除处理窗口（replication / job）可以存在，**禁止**自行把具体天数写入用户 HINT/DETAIL。内部天数属 backend / `PRIVACY_NOTICE` 日后补丁，须另会。运维日志 ≠ 用户个人化记录；用户句不得承诺「立即从所有日志与备份介质消失」。

V1 删除主语：**与这次同意绑定的那份云端个人化记录** = 本机 `ype_profile_id` 对应的 YPE 行。不暗示全账号、全设备（身份契约 `task-l2-personalization-identity.md`）。

### 默认与离线

默认 **关闭**。没有网络时 Yin / Focus / Confide / 本机 Memory **照常**。关闭此功能 **不会**关闭阿寅、专注、倾诉、记忆或其他本地功能。

### LABEL（保留）

| 语 | LABEL |
|---|---|
| en | Improve how Yin keeps you company over time (optional) |
| zh | 让阿寅慢慢更懂怎样陪你（可选） |
| ja | 寅の寄り添い方を、少しずつあなたに合わせる（任意） |

禁止改成技术名 Cloud Personalization / 云端大脑。英文不用 learn（易被读成训练模型）。

### DETAIL 结构

**保留可展开 DETAIL**（了解更多）。开关下只放 LABEL + 短 HINT。DETAIL 只答四问，外加一句「关闭不影响本地功能」。

### V1 上传白名单（工程五键 · 用户披露口径）

工程仍仅允许：

- `focus_return_rate`
- `reflection_frequency`
- `companion_style_preference`
- `intervention_preference`（由用户所选陪伴档 **派生**，不是第二套 UI）
- `practice_day_count_window`

用户 DETAIL：可举例完成情况、反思频率、**你选择的陪伴方式**、练习日计数。若点名由陪伴档派生的那一键，写成 **互动偏好 / interaction preferences**（中：与之对应的互动偏好；日：それに対応するインタラクションの好み）。工程键仍可 `intervention_preference`。**禁止**对用户说 intervention / 干预；**禁止**写成系统另外推断的安静/温暖人格。

不上云（须在 HINT/DETAIL 点名否定）：Confide 原文、阿寅个人记忆摘要、你对阿寅说的正文。

### 禁止词（用户可见文案）

禁止词仍含：training / train the model / 教模型 / 云端大脑 / cloud brain / anonymous / 匿名 / 诊断句 / personality profile / behavioral score / ranking / scoring / intervention probability。用户句另禁 **intervention / 干预**（工程键名除外）。

使用 **limited structured signals** / 少量结构化信号。未满足严格匿名化时不得装作匿名。

---

## 必须解释的内容（已锁语义 · 句子见附录）

1. **发送什么**：仅上列五键；用户举例不得扩大白名单。  
2. **为什么**：逐步个人化阿寅的陪伴方式；云端算出一份小的个人化状态，异步送回本机。不向用户解释 Secret Algorithm Layer。  
3. **没网 / 关闭本地功能**：Sit / Confide / 桌面 generate / 本机 Memory **照常**。Cloud 不是 runtime 依赖。  
4. **多久 / 撤回 / 删除**：关即删（上节）。不得只写「我们会处理」。  
5. **默认关**。  
6. **用词**：limited structured signals；身份绑定后须如实，不得匿名。  
7. **禁止对用户说**：training、教模型、等服务器才许阿寅说话。

---

## OFF 工程契约（须进 L2 Worker · 本切片不实现）

YPE OFF 必须实现，**禁止**只停发送、云端仍留 Pack：

```text
consent=false
  → no further ingest
  → delete cloud personalization data bound to this ype_profile_id
  → invalidate current personalization state / Pack
  → discard local cached Pack
  → local Yin / Focus / Confide / Memory continue
```

验收（开工 L2 时）：关开关后云记录不在、本机不读旧 Pack、Sit/Confide 仍可用。不能只测停上传。

实现不得用「anonymous id」当隐私文案。存储主键 = 本机随机 `ype_profile_id`（**不是**硬件指纹、**不是**备份 OTP）。用户句：**limited structured signals bound to this consent**。跨设备 = 新档案。详见身份 Brief。

---

## 不做

- 把本 Brief 理解成已开工 L2 或已上 Privacy 开关  
- 写入 locale / 创建 UI / Worker / ingest / 改 runtime  
- 与 Newsletter / 漏斗 / 备份文案混写一个 checkbox  
- 新建 `L2_PERSONALIZATION_CONSENT_BRIEF.md`（本文件即 SSOT；kebab-case）  
- 在用户文案里承诺全账号 / 全设备删除（V1 未建立账户身份）

---

## 附录 · 三语文案（产品会有条件通过 · 非 locale）

> 2026-08-26 设计师书面：整体通过；改日文 LABEL；三语 DETAIL 去掉「干预 / intervention」。过稿仍须「开工 L2 UI」才接线。

### English

**LABEL**  
Improve how Yin keeps you company over time (optional)

**HINT**  
Off by default. If you turn this on, we send a small set of structured signals from this device—such as focus completion, reflection frequency, your chosen companion style, and practice-day counts. We never send your Confide words or Yin's memory summaries. These signals are used to personalize how Yin keeps you company over time. Yin still works offline, and you can turn this off anytime.

**DETAIL**（了解更多）

- **What leaves this device?** Limited structured signals such as focus completion, reflection frequency, your chosen companion style and the interaction preferences associated with it, and practice-day counts.  
- **What stays on this device?** Your Confide conversations, Yin's personal memories, and the text of what you say to Yin.  
- **Why is it used?** To calculate long-term personalization patterns and send a small personalization state back to this device.  
- **What happens if I turn it off?** No new signals are sent. The cloud personalization data tied to this choice is deleted. Any personalization pack cached on this device is discarded. Yin continues to work locally.  
- Turning this off does not disable Yin, Focus, Confide, Memory, or other local features.

### 中文

**LABEL**  
让阿寅慢慢更懂怎样陪你（可选）

**HINT**  
默认关闭。开启后，我们会从这台设备发送少量结构化信号，例如专注完成情况、反思频率、你选择的陪伴方式和练习日计数。我们不会发送你的倾诉原文或阿寅的记忆摘要。这些信号只用于逐步个人化阿寅的陪伴方式。没有网络，阿寅也能照常工作；你可以随时关闭。

**DETAIL**（了解更多）

- **可能离开本机的？** 少量结构化信号，例如专注完成情况、反思频率、你选择的陪伴方式以及与之对应的互动偏好，还有练习日计数。  
- **留在本机的？** 倾诉对话、阿寅的个人记忆、你对阿寅说的正文。  
- **为什么？** 用于计算长期个人化模式，并把一份小的个人化状态送回这台设备。  
- **关闭之后？** 不再发送新信号。与这次选择绑定的云端个人化数据会被删除。本机缓存的个人化包也会丢弃。阿寅继续在本地工作。  
- 关闭此功能不会关闭阿寅、专注、倾诉、记忆或其他本地功能。

### 日本語

**LABEL**  
寅の寄り添い方を、少しずつあなたに合わせる（任意）

**HINT**  
初期設定はオフです。オンにすると、この端末から少量の構造化シグナル（集中の完了状況、振り返りの頻度、あなたが選んだ寄り添い方、練習日の回数など）を送ります。打ち明けの原文や、寅の記憶の要約は送りません。これらのシグナルは、寅があなたに寄り添う方法を少しずつ合わせるためだけに使われます。ネットがなくても寅は普段どおり動きます。いつでもオフにできます。

**DETAIL**（詳しく）

- **この端末から出るものは？** 集中の完了状況、振り返りの頻度、あなたが選んだ寄り添い方と、それに対応するインタラクションの好み、練習日の回数などの、限られた構造化シグナル。  
- **この端末に残るものは？** 打ち明けの会話、寅の個人的な記憶、寅に話した本文。  
- **なぜ？** 長い目で寄り添い方を合わせるためのパターンを計算し、小さな個人化の状態をこの端末へ戻すため。  
- **オフにすると？** 新しいシグナルは送りません。この選択に結びつくクラウド上の個人化データは削除されます。この端末にキャッシュされた個人化パックも破棄されます。寅はローカルで動き続けます。  
- オフにしても、寅・集中・打ち明け・記憶などのローカル機能はオフになりません。
