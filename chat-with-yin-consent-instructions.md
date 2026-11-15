# 改动指令：Chat with Yin 改名 + 强制同意弹窗 + 条款加强

> 给实现会话的任务说明。**先探索、列 A/B/C 清单，等 PO 点头后再改运行时。**  
> 本文件已按仓库现状改过：倾诉是**本机功能**，不是云端聊天账号系统。  
> **文案审核（2026-11-15）**：PO 书面确认「无需律师，Cursor 审核就可以了」。下文英/日/中勾选句与条款追加段已由 Cursor 对照原意锁定，**不要**再留 `TODO(legal-review)`，**不要**再挡在律师环节。

## 0. 总原则（硬约束）

1. **只改用户可见文案**：把面向用户的 Confide 名称改为
   - 英文：`Chat with Yin`
   - 日文：`寅と話す`
   - 中文：**保持** `向阿寅倾诉`（本次未要求改中文名）
2. **不要改动**：代码标识符（变量、函数、类、路由）、文件名、目录名、i18n **key 名**、测试锚点（`data-testid`、选择器）。
3. 日语界面暂不开放倾诉入口（现网已按 `locale === 'ja'` 隐藏）。**合规部分（文案、条款、弹窗、同意记录、发送链守卫）三语都要实现。** 日语只继续用现有入口闸隐藏，**不要**再叠一套无关的 feature flag，除非现闸不够用。
4. 免责声明和同意机制是**加固层**，不能替代、也不能削弱现有的自伤/自杀检测、safety-01、T14 卡内帮助。那些逻辑只汇报缺口，不擅自改。
5. **不要**用新弹窗替代现有 Wellness「Not therapy or medical care」（`?` 简介卡）。那是全产品免责；本任务是 **Chat with Yin 首次使用** 的强制勾选。
6. 新弹窗用现有暖米玻璃面板；**不要**走 `#yin-support-modal` / Support FAB。新 `position: fixed` 必须先登记 [`focus-tiger/docs/Z_INDEX.md`](focus-tiger/docs/Z_INDEX.md)。受保护付款路径默认排除。
7. 新用户可见句子写 [`focus-tiger/src/locales/slices/`](focus-tiger/src/locales/slices/)（同一片里带 en、zh、ja）。**禁止**改 `en.json` / `zh.json` / `ja.json` 总字典。改名若现 key 已在总字典（如 `CONFIDE_MENU_LABEL`），按项目惯例用切片 overlay，或只改 value、不改 key。
8. 实现前对照 [`SCENARIO_TESTS.md`](focus-tiger/docs/SCENARIO_TESTS.md) 场景 AE（倾诉）与 T92 安全句。危机文案轴已拍板：**禁止**在产品句里写死各国号码。

---

## 0.1 Cursor 文案审核结论（已锁定，可直接入库）

对照原意两条：

1. 用户确认：使用本工具时，清楚知晓不能替代持证心理健康专业从业者；若有持续心理困扰、自伤想法，请主动寻求专业帮助。
2. 用户同意：情绪相关对话中，Samatia 不提供任何精神健康评估、诊断、治疗建议。

审核结果：

| 项 | 结论 |
|---|---|
| 英/日勾选句 | **通过**。第一人称 clickwrap（I understand / I agree / 理解しました / 同意します）比原句的祈使语气更适合勾选，主要意思未改。 |
| 条款追加段 | **通过**。与勾选句同义，第三人称面向所有读者。 |
| 中文勾选/条款 | **补齐**。隐私声明以中文为准，切片必须有 zh。产品名仍用「向阿寅倾诉」。 |
| 危机号码 | **否决分析师方案**。现网 T92 / 场景 AE：**禁止** 988、911、110、よりそいホットライン号码等写进产品句（会过期、也和现网安全句冲突）。弹窗危机区**复用**现网「本地求助热线 + 当地紧急电话」口径，并链到已有 T14 卡内帮助。热线号码**不上本弹窗**。 |
| 律师闸 | **取消**。按 PO 2026-11-15：Cursor 审核即可。 |

若实现时发现必须微调标点/换行，不得改掉「非替代专业人士」「持续困扰/自伤须主动求助」「不评估/不诊断/不给治疗建议」「Samatia」这几块意思。

---

## 1. 任务一：用户可见文案改名

步骤：

1. 全库搜索 `confide`（大小写不敏感），结果分成三类：
   - **A. 用户可见文案**（i18n value、Help Center 正文、隐私声明、菜单标签）→ **改**（en / ja；zh 名不改）
   - **B. 代码标识符、文件名、i18n key、`data-testid`** → **不改**
   - **C. 不确定**（邮件、商店页、KB 短答、测试里断言可见字符串）→ **列出来问 PO**，不要猜
2. 只改 A 类。英文 value → `Chat with Yin`；日文 value → `寅と話す`。
3. 现网已知可见名（实现时再核对，勿当已改）：
   - `CONFIDE_MENU_LABEL` / `CONFIDE_PANEL_TITLE` / `CONFIDE_EAR_TOOLTIP`：en `Confide to Yin`，ja `寅に打ち明ける`
   - Help Center 若干 `HELP_CENTER_ARTICLE_*` 英文仍写 Confide to Yin
4. 改完跑现有测试。若断言绑在旧可见文案上：改为 `data-testid` 或 key；**不要改已有锚点本身**。必须改断言文案时列入 C 类问 PO。
5. [`SCENARIO_TESTS.md`](focus-tiger/docs/SCENARIO_TESTS.md) / GWT 里写给人看的「Confide to Yin」是否同步：列入计划，**不要**在本功能 PR 顺手大改场景字母。

---

## 2. 任务二：i18n key 清单（已锁定文案）

新增 key 用项目现有 **SCREAMING_SNAKE** 习惯，放进新切片，例如 `locales/slices/confide-consent.json`。下表「逻辑名」仅便查阅，**入库用右列 key**。

| 逻辑名 | 入库 key | EN | ZH | JA |
|---|---|---|---|---|
| title（若切片 overlay 菜单名） | 沿用 `CONFIDE_MENU_LABEL` 等 | Chat with Yin | 向阿寅倾诉 | 寅と話す |
| modal.title | `CONFIDE_CONSENT_MODAL_TITLE` | Before you start | 开始之前 | ご利用の前に |
| modal.intro | `CONFIDE_CONSENT_MODAL_INTRO` | Please read and confirm both statements below to continue. | 请阅读并勾选下面两项后继续。 | 続けるには、以下の2点をご確認のうえ、それぞれにチェックを入れてください。 |
| item1 | `CONFIDE_CONSENT_ITEM1` | I understand that Chat with Yin is not a substitute for a licensed mental health professional. If I experience ongoing psychological distress or thoughts of harming myself, I will proactively seek professional help. | 我确认：使用「向阿寅倾诉」时，清楚知晓本工具不能替代持证心理健康专业从业者。如果出现持续的心理困扰或自伤想法，我会主动寻求专业帮助。 | 「寅と話す」は、資格を有する心の健康の専門家の代わりにはならないことを理解しました。継続的な心の不調や自分を傷つけたいという気持ちがある場合は、自ら専門家に相談します。 |
| item2 | `CONFIDE_CONSENT_ITEM2` | I agree that, in emotion-related conversations, Samatia does not provide any mental health assessment, diagnosis, or treatment advice. | 我同意：对于情绪相关对话，Samatia 不提供任何精神健康评估、诊断或治疗建议。 | 気持ちや感情に関する会話において、Samatia が精神的な健康状態の評価・診断・治療に関する助言を一切行わないことに同意します。 |
| age | `CONFIDE_CONSENT_AGE` | I am 18 or older. | 我已满 18 岁。 | 18歳以上です。 |
| error | `CONFIDE_CONSENT_ERROR` | Please check all boxes to continue. | 请先勾选全部选项后再继续。 | 続けるには、すべての項目にチェックを入れてください。 |
| confirm | `CONFIDE_CONSENT_CONFIRM` | Agree and continue | 同意并继续 | 同意して続ける |
| decline | `CONFIDE_CONSENT_DECLINE` | Not now | 暂不使用 | 今はやめておく |
| termsLink | `CONFIDE_CONSENT_TERMS_LINK` | Read the Privacy Notice | 阅读隐私声明 | プライバシーポリシーを読む |
| crisis.title | `CONFIDE_CONSENT_CRISIS_TITLE` | If you need help right now | 若你此刻需要帮助 | 今すぐ助けが必要なとき |
| crisis.body | `CONFIDE_CONSENT_CRISIS_BODY` | If this feels too heavy to hold alone, please call your local crisis helpline. If you are in immediate danger, please call your local emergency number. Yin is not a substitute for professional help. | 若此刻很难独自撑住，请拨打本地求助热线。若情况紧急，请拨打当地紧急电话。寅不能代替专业帮助。 | 一人で抱えきれない時は、お近くの相談窓口へ電話してください。緊急のときは、お近くの救急電話へかけてください。寅は専門援助の代わりにはなれません。 |
| reconsent | `CONFIDE_CONSENT_RECONSENT` | We updated these terms. Please review and confirm again. | 这些说明有更新，请再确认一次。 | 内容が更新されました。再度ご確認ください。 |

注意：

- 危机区 **禁止** 写 988 / 911 / 110 / 0120-279-338 等具体号码（T92）。
- T14 卡内帮助链继续用现网入口；弹窗危机区可再放一条「打开倾诉卡内帮助」的链（新 `data-testid`），**不要**新造各国号码表。
- **年龄勾选默认保留为第三项**（见 §9）。文案去掉「或监护人同意」，避免假装已做监护人流程。未满 18 岁：点确认须失败并显示错误；点「暂不使用」离开。不做单独监护人产品流（本任务范围外）。

---

## 3. 任务三：隐私政策追加条款

权威用户页：[`focus-tiger/docs/PRIVACY_NOTICE.md`](focus-tiger/docs/PRIVACY_NOTICE.md)（中英日；出入以中文为准）。应用内 Privacy 摘录对齐该页（`privacyNoticeCopy.js` + 切片）。仓内**没有**独立 Terms of Service 文件 → **追加到隐私声明**，并在应用内 Privacy sheet **同步一节**。不要删改现有条款。

放在「服务说明 / Wellness 非诊疗」附近，新建一节即可，例如 **§ Chat with Yin / 向阿寅倾诉 / 寅と話す**。

**EN**

> **Not a Substitute for Professional Care.** Chat with Yin is not a substitute for a licensed mental health professional. If you experience ongoing psychological distress or thoughts of self-harm, you should proactively seek professional help.
>
> **No Mental Health Assessment, Diagnosis, or Treatment.** In emotion-related conversations, Samatia does not provide any mental health assessment, diagnosis, or treatment advice. By using Chat with Yin, you acknowledge and agree to these terms.

**ZH**

> **不能替代专业照护。** 「向阿寅倾诉」不能替代持证心理健康专业从业者。如果出现持续的心理困扰或自伤想法，请主动寻求专业帮助。
>
> **不提供精神健康评估、诊断或治疗。** 对于情绪相关对话，Samatia 不提供任何精神健康评估、诊断或治疗建议。使用「向阿寅倾诉」即表示你知晓并同意上述内容。

**JA**

> **専門的ケアの代替ではありません。** 「寅と話す」は、資格を有する心の健康の専門家の代わりにはなりません。継続的な心の不調や自傷の考えがある場合は、自ら専門家にご相談ください。
>
> **精神的健康に関する評価・診断・治療は行いません。** 気持ちや感情に関する会話において、Samatia は精神的な健康状態の評価、診断、治療に関する助言を一切行いません。「寅と話す」をご利用になることにより、これらの内容を理解し、同意したものとみなされます。

要求：

- 三语都上线（日语入口仍隐藏）。
- 「最后更新日期」改为实现当日。
- 弹窗 `CONFIDE_CONSENT_TERMS_LINK` 打开对应语言 Privacy，并锚到这一节（例如 `#confide-consent`）。
- 应用内 Privacy sheet 增一节时走现有 `PRIVACY_SHEET_SECTIONS` 模式，**禁止**硬编码长句进 JS。

---

## 4. 任务四：首次使用强制同意弹窗（前端）

行为：

1. **触发**：用户经**任何**入口进入 Chat with Yin（菜单、耳朵、快捷键、`?confide=1`、深链）时，若无**当前版本**的有效同意，先弹窗，**不**进入聊天（输入框不可用、不可发送）。
2. **三个独立勾选框**（item1、item2、age），**默认不勾**，禁止合并成一个「我已阅读并同意」。
3. **不可绕过**：点遮罩、Esc、浏览器返回都不能关掉弹窗并进入聊天。Esc 仍须遵守菜单逃生舱：只关最上层；若弹窗是最上层，Esc = 等同「暂不使用」（离开倾诉，不写入同意），**不是**进入聊天。
4. **未勾全**：点「同意并继续」不关闭；行内红字 `CONFIDE_CONSENT_ERROR`；焦点到第一个未勾项。按钮保持可点，不要置灰。
5. **勾全**：写入本机同意记录（§5）**成功后**才关弹窗并允许聊天。写盘失败：可见错误，可重试（持久化三态：挂起 / 成功 / 失败都要看得见）。
6. **出口**：「暂不使用」→ 关闭倾诉面板、回到 Idle，**不写**同意记录。
7. **危机区**：弹窗常驻 `CONFIDE_CONSENT_CRISIS_*`（无具体号码）。倾诉卡内 T14 帮助链保持现网行为。
8. **无障碍**：`role="dialog"` + `aria-modal`、焦点陷阱、label 关联、错误 `aria-live`。
9. **语言**：跟当前 locale。切到日语：现网会关面板；同意组件仍要能单测日语文案。
10. **日语入口**：继续走现闸（`locale === 'ja'` 隐藏）。同意代码三语都在，测试覆盖 ja 文案与守卫，不必真的给日语用户露出入口。
11. 新锚点（**只增不改旧锚点**）：`confide-consent-modal`、`confide-consent-item1`、`confide-consent-item2`、`confide-consent-age`、`confide-consent-confirm`、`confide-consent-decline`、`confide-consent-error`、`confide-consent-crisis`。
12. 点击反馈（0–1 秒）：打开入口 → 先见同意框，不见可发送的聊天框；勾全确认 → 同意框关、聊天可用；未勾全确认 → 红字、仍停在框内；暂不使用 → 倾诉关闭。

---

## 5. 任务五：同意记录（本机，不是 Postgres）

倾诉对话与推理在**本机**（隐私声明 §1）。第一份安装包**没有**倾诉云端账号表。分析师的 `confide_consents` Postgres **本任务不做**。有朝一日若上云端聊天，再单开任务做服务端表；不要为同意去新建用户库。

对齐现网其它同意键（如 `focus-tiger.t54-research-consent.v1`）：

```text
localStorage / 本机偏好键：
  focus-tiger.confide-consent.v1

当前版本常量（代码里，不要散写）：
  CONFIDE_CONSENT_VERSION = "confide_consent_v1"
```

建议 JSON（可追加字段，**不要存 IP / User-Agent**）：

```json
{
  "consentVersion": "confide_consent_v1",
  "item1Accepted": true,
  "item2Accepted": true,
  "ageConfirmed": true,
  "locale": "en",
  "textHash": "<sha256 of canonical item1+item2+age text for that locale+version>",
  "appVersion": "…",
  "platform": "electron" ,
  "acceptedAt": "2026-11-15T04:00:00.000Z",
  "revokedAt": null
}
```

要求：

- **本机追加/覆盖当前版本一条即可**（换版本用新 `consentVersion`；旧版本可留在 `history[]` 可选，非必须）。撤回：`revokedAt` 非空，或删键。
- `textHash` 由**本机**按版本+语言的规范文案计算，不信任 UI 临时改过的 DOM 文本。
- **不存 IP、不存 User-Agent**（隐私声明未覆盖此项；倾诉本机、无账号）。
- 计入 `localStateKeys` 白名单；DEV 重置要清；**不要**进练习云备份（与倾诉原文同样排除）。本地 Backup 导出：默认排除（与 Memory / 倾诉原文同类）；列入实现计划即可。
- 用户「删除本机数据 / 应用内重置」：本记录一起删。下次打开倾诉重新弹窗。这就是本产品的删除权口径（无云端副本可删）。
- 文案或条款变更：把 `CONFIDE_CONSENT_VERSION` 改为 `confide_consent_v2`，旧同意自动失效，再弹一次（显示 `CONFIDE_CONSENT_RECONSENT`）。

---

## 6. 任务六：发送链守卫（本机强校验；不是 403 API）

**所有会让 Yin 接话的路径**都必须先查有效同意：打开面板、Share、Enter 发送、语音转写后发送、桌面 L2 generate、Web corpus。不依赖「弹窗曾经关过」。

伪代码（JS，对应当前架构）：

```javascript
const CONFIDE_CONSENT_VERSION = 'confide_consent_v1';

function hasValidConfideConsent(store) {
  const row = store.read(); // focus-tiger.confide-consent.v1
  return Boolean(
    row &&
      row.consentVersion === CONFIDE_CONSENT_VERSION &&
      row.item1Accepted === true &&
      row.item2Accepted === true &&
      row.ageConfirmed === true &&
      !row.revokedAt
  );
}

function requireConfideConsentOrOpenModal() {
  if (hasValidConfideConsent(store)) return { ok: true };
  openConsentModal();
  return { ok: false, code: 'CONSENT_REQUIRED' };
}

// ConfideToYinUI.open() 开头：
//   if (!requireConfideConsentOrOpenModal().ok) { 只露同意框，不启用输入; return; }

// 发送 / generate 开头：
//   if (!hasValidConfideConsent(store)) {
//     openConsentModal();
//     不调用路由 / 不写 turns；可见提示 CONSENT_REQUIRED
//     return;
//   }
```

若发现**会把倾诉原文打到 Worker** 的接口：同样守卫，未同意则 **403 `CONSENT_REQUIRED`**，前端再弹窗。当前隐私口径是倾诉原文不上云——实现前先搜现网接口；**没有这种接口就不要新造云端同意 API**。

撤回（可选、非本刀必做 UI）：Preferences 不强制做「撤回同意」按钮。应用内重置已等于撤回。若顺手加函数 `revokeConfideConsent()` 便于测试即可。

---

## 7. 测试要求

本机逻辑：

- 无记录 → 打不开聊天；发送被拦
- 只勾一项或缺年龄 → 确认失败、不写有效记录
- 旧 `consentVersion` → 再拦
- 撤回/重置后 → 再拦
- 日语 locale：入口仍隐藏；同意模块日文渲染与守卫可单测

前端：

- 首次进入出弹窗；点遮罩不进入聊天
- Esc = 暂不使用（关倾诉），不是同意
- 没勾全点确认 → 红字、不关
- 勾全确认 → 写盘成功后可聊
- 暂不使用 → 离开、无记录
- en / zh / ja 文案（ja 可用测试夹具打开组件，不必打开日语入口）
- 守卫失败码 `CONSENT_REQUIRED` 时再出弹窗

回归：

- 现有倾诉 / T14 / T92 / Wellness `?` 卡测试绿
- **不改**已有 `data-testid`
- 触及 overlay 时跑 `npm run test:payment-contract`（确认没伤 Support）
- 新切片走 `locales/slices` 契约

---

## 8. 交付与注意事项

1. 先输出：改动计划 + A/B/C 清单 + 将新增/修改的文件列表，等 PO 确认。这是 **B 类**用户可见改动，无点头 Brief **不得**改 `focus-tiger/src` 运行时。本文件视为 Brief 草稿。
2. 建议提交切分：① 改名 ② 同意切片 + 隐私声明 ③ 本机同意模块 + 弹窗 ④ 发送链守卫 ⑤ 测试。能合成一个小 PR 也可以，但不要顺手改安全检测。
3. 不要改自伤检测、safety-01、T14、Wellness 首卡策略。
4. **不要** `TODO(legal-review)`。**不要**把具体热线号码写进产品。
5. 不确定（导出白名单是否包含同意键、弹窗 z-index 填哪一档）→ 列问题问 PO，不要猜。
6. 文档：`PRIVACY_NOTICE.md`、切片、`SHARED_RESOURCES.md` 新 key、`localStateKeys`、tracker 碎片。**不要**在功能 PR 改 `GLOSSARY.md` / `TASKS.md` 已有段。

---

## 9. 已拍板（Cursor 默认 + PO 已示）

| 项 | 决定 |
|---|---|
| 律师 | **不需要**。Cursor 已审文案。 |
| 危机号码 | **不写进产品**。复用 T92 当地热线口径。 |
| 年龄 | **第三勾选「已满 18 岁」**。不做监护人流程。 |
| IP / UA | **不存**。 |
| 同意存储 | **只本机**。无 Postgres。重置即删。 |
| 日语 | 合规代码全做；入口继续隐藏。 |
| 中文产品名 | 仍「向阿寅倾诉」。 |

---

## 10. 实现前仍须向 PO 确认的仅剩项

1. A/B/C 改名清单（尤其 Help Center / KB 是否把「Confide to Yin」改成 Chat with Yin）。
2. 同意键要不要进**本地** Backup 导出（建议：**不进**，与倾诉原文同类）。
3. 本文件作为 Brief 是否点头开工（未点头不得改运行时）。
