# Task Brief · YPE L2 Cloud Personalization Identity

> **状态（2026-08-26）**：产品会已拍 **YPE V1 Identity Contract**（设计师书面；本切片入库）。Consent 文案附录 **有条件通过**（见 `task-l2-personalization-consent.md`）。  
> **本切片禁止**：写入 `src/locales/*.json`、Privacy 现网开关、Worker、ingest、DB schema 代码、改 `l0Config.js`、改 L1/桌面 generate runtime、改生产行为。  
> **权威**：`YIN_PERSONALIZATION_ENGINE.md` §H.5 · §I · 文首不变量。本 Brief 是身份键 **执行层** SSOT。  
> **下一刀（仍文档）**：Cloud algorithm contract。locale 须口令「开工 L2 UI」。运行时须口令「开工 L2」。

---

## 冲突扫描

对照 `SCENARIO_TESTS.md` 场景 AG（Memory Consent）/ Z 练习备份 OTP / Privacy 漏斗 / AE Confide / Membership `deviceToken`。

| 轴 | 判断 |
|---|---|
| **a. 强度** | 无新 UI。V1 不开邮箱墙。关开关只停发 + 删本 profile 的 YPE 云行，不比 Sit 更重。 |
| **b. 人设** | 用户句仍讲「与这次选择绑定」；不说账号、不说匿名、不说硬件指纹。 |
| **c. 职责** | **禁止**把练习备份 OTP / Membership email / 漏斗 `clientId` / Memory store 当 YPE 主键。YPE 删除 **不连带** 备份 / Memory / Confide / 漏斗。 |

后台网络：本 Brief 不接线。将来 ingest / delete 须另答 `BACKGROUND_NETWORK.md` 三问。

点击反馈：本 Brief **不涉及可点击交互**。开工 L2 UI 后：本地关开关须 0–1s 看见已关；**禁止**在服务端删除未确认时显示「云端已删除」。

**无新冲突。** 身份 primitive 写清，是为了避免工程把「设备维」做成硬件指纹或偷偷复用 OTP。

---

## 会下四问（已拍）

| 问 | 拍板 |
|---|---|
| **1. V1 云记录绑在什么上？** | **C**：先本机安装 / 本地 profile 维；账户身份以后另拍。工程定义 **不是** physical device。 |
| **2. 设备 2 打开同一功能？** | **新档案。** 同一用户 ≠ 同一个 YPE cloud identity。 |
| **3. 关即删范围？** | **只**删 YPE personalization signals + personalization state/Pack（含本机缓存 Pack）。**禁止**删练习备份 / Memory / Confide / 漏斗 / 其他本地功能数据。此条是 **backend invariant**。 |
| **4. 工程删除窗口？** | **用户文案不写天数。** 内部 SLA 另进 privacy/backend。本会不锁 30 / 90 / 365。 |

已锁、请勿再议（除非推翻）：默认关；关即删（用户可见）；独立第四条同意；邮箱 **不是** YPE 默认主键；V1 UI **禁止**写成「删你账号下全部设备」。

---

## YPE V1 Identity Contract（六条 · 不可再争议）

### 1. Identity primitive

```text
YPE V1 identity = locally stored random opaque installation/profile identifier
                ≠ hardware identity
                ≠ account identity (email / OTP)
                ≠ advertising ID / MAC / device fingerprint
```

概念：

```text
Yin installation / local profile
      ↓
random YPE profile ID  (ype_profile_id)
      ↓
cloud YPE record  { ype_profile_id, signals, personalization_pack }
```

云端 **不得**以邮箱、姓名、电话、硬件指纹为 YPE 行主键。

逻辑名：`ype_profile_id`。实现时存本机（Web：该 origin 的存储分区；Electron：该 userData profile）。**禁止**写入练习备份 6 key。开工 L2 前不锁具体 localStorage 字符串。

### 2. Cross-device

不同设备 / 不同本地安装 / 不同浏览器存储分区 → **默认不同** YPE profile。

| 场景 | V1 |
|---|---|
| Device 1 开启 | Profile A |
| Device 2 开启 | Profile B（新档案） |
| Device 1 关闭 | 删除云端 A；B 不受影响 |
| Device 1 再开启 | **新的** opaque ID（不复活已删的 A） |
| 邮箱 / 备份 OTP | **不参与** YPE identity |

清站点数据、卸装、换浏览器、同一设备多个 profile：各产生新 ID。本切片 **不**逐条规定恢复策略；只锁 primitive，禁止用硬件指纹「把它们拼回去」。

### 3. Opt-out（关即删的主语）

关闭 YPE：

```text
consent=false
  → no further ingest
  → delete cloud personalization signals + personalization state/pack
       bound to this local ype_profile_id
  → discard local cached Pack
  → discard / rotate local ype_profile_id after delete is queued
  → local Yin / Focus / Confide / Memory continue
```

用户可见句仍可说「与这次选择绑定的云端个人化数据」——V1 即 **本机这份 profile**，不是全账号。

### 4. Isolation（绝对互不连带）

`DELETE YPE` **只**触及：

- YPE signals
- YPE personalization state / Pack
- 本机 YPE Pack 缓存

**不得**触及：Focus practice backup、Confide、Memory、Funnel、其它本地功能/数据。

验收（开工 L2 时）：关 YPE 后备份快照仍在、Memory 文件仍在、漏斗 opt-in 不变。

### 5. Offline delete honesty

关闭时若离线：

1. **立刻**本地 `consent=false`，停止新 signal。  
2. **排队**云端删除，联网后执行。  
3. UI **不得**在服务端确认删除成功前声称「云端个人化数据已删除」。允许显示已关闭 / 已停止发送。

```text
DELETE request → queue → database deletion → cache/index cleanup → verification
```

天数与重试属内部 SLA，**禁止**写入 locale。

### 6. Future account identity

账户级 / 跨设备同一人的 YPE identity **不属于 V1**。不得提前写进 UI（含「删你账号下全部设备」）。将来另会。

---

## 用户文案对齐（不写 locale）

Consent 附录已按过稿改两处（日文 LABEL；三语 DETAIL 的「干预偏好」→ 互动 / interaction preferences）。工程键仍可叫 `intervention_preference`；**用户句禁止** intervention。

---

## 不做

- 本 Brief ≠ 已开工 L2 / 已上 Privacy 开关  
- 写入 locale / Worker / 真实 KV schema  
- 用备份 OTP「先绑着方便以后」  
- 把 `ype_profile_id` 做成可跨安装拼接的 device fingerprint  
- 未确认删除就在 UI 写「已删除」
