# 隐私声明 / Privacy Notice / プライバシーポリシー

> **产品 SSOT**：应用内 **?** → Privacy 摘录对齐本页。工程清单：`MVP_PRODUCT_DEFINITION.md` §六。  
> 三种语言版本内容保持一致；如有出入，以中文版为准。  
> This is the user-facing privacy notice. All three language versions are intended to be equivalent; the Chinese version governs in case of discrepancy.  
> 本ドキュメントはユーザー向けプライバシーポリシーです。3言語版の内容は同一を意図しますが、相違がある場合は中国語版を優先します。

最后更新 / Last updated / 最終更新日: 2026-11-14

本页描述**当前邀请制第一份安装包**。该版本不收款、不提供邮箱云端找回。代码里可能仍有后续版本才会打开的入口；以本页与安装包实际行为为准。

---

## 中文版

### 1. AI 推理如何处理你的输入

本应用中与习惯、打卡、练习陪伴相关的 AI 对话功能，使用**设备端（本地）模型**进行推理。你输入的相关内容仅在你的设备上完成计算，**不会发送给第三方大模型服务商**。

Mac 版「向阿寅倾诉」中的 **Speak to type** 仅使用本机语音识别把你说的话转成文字；**不是语音消息**，录音**不会上传**。第一份安装包里，倾诉入口默认关闭。

可选的「专注节奏」（仅 Mac 电脑版，**默认关闭**）：打开且系统允许输入监控后，本机只看按键**间隔**和是否退格，用来稍微调整邀请时机。**不保存**你打的字、**不读**窗口标题、**不上传**、不显示分数。关掉或未授权则退回只看出没离开窗口、坐了多久。

### 2. 默认数据存储

除非你使用下文第 3 节的导出/导入自行迁移，你的习惯打卡、练习记录等数据默认**仅保存在你的设备本地**，本应用**不会自动将其上传到开发者服务器**作为个人备份。

**安静同坐 / 灯火（默认开，可在 Privacy 关闭）**：你坐下时，本应用只向自有服务器发送一个**随机会话 id**，用于维持诚实的同坐人数。不含姓名、邮箱、练习日志或聊天。关闭后既不出现在计数里，也看不见别人的灯火。该请求可能经 **Cloudflare** 到达我们托管的接口。

**电脑版检查更新（空闲时）**：安装包可能会向我们托管的更新地址 `https://updates.twinsology.com/` 询问是否有新版本。该请求会带上应用版本，更新服务器因此能看到你的 **IP** 和版本号；不含练习内容、聊天或姓名。没有新版本、或你选择暂不安装时，不会下载安装包。

**启动时的公开配置**：打开应用时，本机可能向自有服务器拉取公开配置与已购权益状态（例如功能是否对该渠道开放）。这不是把你的练习记录上传。

**可选的练习效果计数（研究，默认关）**：只有你在 Privacy 打开开关后，我们才会收到计时专注的去身份计数（例如有没有坐完、后来有没有回来）和一个重装即作废的本机研究代号。没有倾诉原文、邮箱或付款信息。随时可关。

**研究共修：本版本暂不提供。** 菜单里不应出现「研究共修」入口，也不会按周上送研究数据包。下文仅作日后开放时的说明，不代表本安装包已提供该功能。

第 0 层永不收集：你输入的任何文字、Yin 的回复、Memory 摘要、情绪词、安全路由命中、精确时间、位置、付款、邮箱、账号。日后若开放：年满 18 岁并自愿打开后，第 1 层每周只上传数字；第 2 层问卷第一版不上线。本项与 Privacy 里「可选练习效果计数」相互独立。

**可选的晚间练习结束时刻（练习观察纸，默认关）**：只有你在成长旅程的练习观察纸里开启后，本机才会按日记录计时专注在本地凌晨 1 点到 6 点之间**结束**的日期和时刻。**不是**睡眠监测、**不上传**、**不进**研究分享。可随时关闭（关闭会清空已记录）或一键清除记录。

**付款：** 本应用日后可能通过 **Stripe** 处理订阅或请茶。**当前邀请制第一份安装包不开启正式收款**，不会向你收取费用。

### 3. 本地导出 / 导入

本应用提供**本地导出/导入**功能（Privacy 页内，以及设置里的备份与恢复），你可以：

- 将本机练习相关数据导出为本地 JSON 文件，自行保存（网盘、U 盘、邮件附件等）；
- 在同一设备或更换设备后，通过导入该文件恢复数据。换机**现在就可以**用这份文件，不必等邮箱云端找回。

请注意：

- 导出文件**未加密**；**请自行妥善保管**。文件离开你的设备后，其安全性由你自行负责。
- 导入会**覆盖**目标设备上对应的本机数据；本机已有数据时须勾选确认后再继续。
- **导出范围（与工程白名单一致，当前 31 项键）**，主要包括：旅程记录、练习日历、里程碑标记、永久拥有标记、进阶仪式、芥子印、莲花池、部分偏好（语言、提醒、陪伴模式、氛围、语音等）、练习观察相关记录、部分已购标记与寅币账本、稳定偏好。名单以设置里「备份与恢复」实际勾选的键为准。
- **不包含**：倾诉（Confide）对话原文、阿寅个人记忆、研究共修编号与周包、云端登录令牌、派生缓存。反思日记键在导出白名单内；若你从未写过日记，导出文件里对应项为空。

### 4. 云端备份 / 邮箱找回

**本版本当前未提供云端备份，也不提供「填邮箱就能找回」。** 换机请使用第 3 节的本地导出/导入。

代码里已有可选的邮箱练习快照能力（约 8 类：旅程记录、练习日历、里程碑、永久拥有、进阶仪式、芥子印、莲花池、成长阶段下限；不含倾诉原文、个人记忆、研究编号）。**第一份安装包关闭该入口**；生产云端探测仍应表现为关闭。若日后打开，我们会先更新本声明，说明存什么、是否加密、如何删除，并征得你的同意。

### 5. 你的权利

- **删除本机数据**：请用应用内重置。在 Mac 上把应用拖进废纸篓，**通常不会**删掉 `~/Library/Application Support/` 里本应用留下的数据文件。若要连文件一起去掉，请在应用内重置后，再删除该目录中与 Focus Tiger / 坐禅小老虎对应的文件夹，或联系 **hello@twinsology.com** 询问当前路径。
- 你可随时导出练习备份文件，用于自行备份或迁移。
- 本邀请包仅支持 **Apple 芯片（arm64）的 Mac**。
- 如对本声明有疑问，请联系：**hello@twinsology.com**

---

## English

### 1. How AI Inference Handles Your Input

AI companion features related to habits, check-ins, and practice guidance run **on your device (on-device model)**. Your related inputs are processed entirely on your device and are **never sent to a third-party large language model provider**.

On the Mac app, **Speak to type** in Confide uses **on-device speech recognition** only to turn speech into text. It is **not a voice message**; audio is **not uploaded**. In this first invite build, Confide stays off by default.

Optional **Focus rhythm** (Mac app only, **off by default**): when you turn it on and the system allows Input Monitoring, this device may notice key **timing** and backspaces to time a quiet invite. It does **not** store what you type, window titles, or a score, and it is **never uploaded**. If it is off or not permitted, invites again use leaving the window and how long you have sat.

### 2. Default Data Storage

Unless you use local export/import (Section 3), your habit check-ins, practice records, and similar data are stored **only on your local device by default**. This app **does not automatically upload this data to our servers** as a personal backup.

**Quiet Together / lanterns (on by default; off in Privacy):** while you sit, this app sends only a **random session id** to our server so a shared sit-count can stay honest. No name, email, practice log, or chat. If you turn it off, you neither appear in the count nor see others' lanterns. That request may reach our API via **Cloudflare**.

**Desktop update check (when idle):** the Mac app may ask our update host `https://updates.twinsology.com/` whether a newer version exists. That check includes the app version, so the host can see your **IP** address and version. It does not include practice content, chat, or your name. If nothing is new, or you skip, no installer is downloaded.

**Public config at launch:** the app may fetch public configuration and entitlement status from our servers. That is not an upload of your practice log.

**Optional practice-effect counts (research, off by default):** only if you turn this on in Privacy do we receive de-identified counts about timed sits plus a random research id that resets if you reinstall. No chat text, email, or payment details. You can turn it off anytime.

**Practice Study: not offered in this version.** The menu must not show a Practice Study row, and this build does not send a weekly research packet. Text below is for a later opt-in, not a feature of this installer.

We never collect Layer 0: anything you type, anything Yin says, Memory summaries, emotion words, safety-route hits, precise timestamps, location, payment, email, or account identifiers. If offered later: Layer 1 is weekly numbers after age-18 opt-in; Layer 2 is not in the first release. Independent of the Privacy timed-sit research switch.

**Optional late-evening end times (Practice Paper, off by default):** only if you turn this on in Practice Paper does this device store local date and end time of timed sits that finish between 1:00 and 6:00 a.m. This is **not** sleep monitoring, **not uploaded**, and **not** research sharing. Turning it off clears stored rows.

**Payments:** we may later use **Stripe** for subscriptions or tips. **This invite build does not take live payment.**

### 3. Local Export / Import

This app provides **local export/import** on the Privacy sheet and in Preferences → Backup & restore. You can:

- Export on-device practice data to a local JSON file you keep yourself;
- Restore that file on the same or a new device. Device-to-device restore works today; it does not wait on email cloud restore.

Please note:

- Exported files are **not encrypted**; **you are responsible for keeping them safe**.
- Import **overwrites** matching on-device records; confirm if data already exists.
- **Export scope (engineering whitelist, currently 31 keys)** includes Journey Log, practice calendar, milestone markers, ownership marks, ritual completions, the Mustard Seed seal, lotus pond, some preferences (locale, reminders, companion mode, ambient, TTS, and similar), practice-paper related rows, some entitlement marks and Focus Coins, and stable prefs. The live list is the Backup & restore registry.
- **Not included:** Confide conversation text, Yin personal memory, research-study IDs and weekly packets, cloud login tokens, derived caches. The reflections key is on the export whitelist; if you never wrote a journal, that field is empty.

### 4. Cloud backup / email restore

**This version does not currently offer cloud backup, and does not promise “enter email to restore.”** Use Section 3 local export/import to move devices.

The product codebase already contains an optional email snapshot of about **8** practice-memory classes (Journey Log, practice calendar, milestones, ownership, rituals, Mustard Seed seal, lotus pond, growth-stage floor — not Confide words, personal memory, or research IDs). **This first installer keeps that entry closed**; production probes should still see it closed. If we open it later, we will update this notice first, explain what is stored, whether it is encrypted, how to delete, and ask for consent.

### 5. Your Rights

- **Deleting local data:** use in-app reset. On a Mac, dragging the app to Trash **usually does not** delete files under `~/Library/Application Support/`. After an in-app reset, remove this app’s folder there, or ask **hello@twinsology.com** for the current path.
- You may export your practice backup file anytime.
- This invite build is **Apple silicon (arm64) Mac only**.
- Questions: **hello@twinsology.com**

---

## 日本語版

### 1. AI推論による入力の取り扱い

習慣、チェックイン、練習サポートに関連するAI対話機能は、**端末上（オンデバイス）のモデル**で推論を行います。関連する入力内容はすべてお使いの端末上で処理され、**第三者の大規模言語モデル提供事業者へ送信されることはありません**。

Mac版「寅に打ち明ける」の **Speak to type** は、端末内の音声認識のみで話した内容を文字にします。**音声メッセージではありません**。音声は**アップロードされません**。この招待版では打ち明け入口は既定オフです。

任意の「集中のリズム」（Macアプリのみ、**既定オフ**）：オンにし、入力モニタリングが許可されたとき、この端末はキーの**間隔**とバックスペースの有無だけを見て誘いのタイミングを少しずらします。打った文字・窓の題名・点数は保存せず、送信もしません。

### 2. デフォルトのデータ保存

第3節のエクスポート/インポートを使わない限り、習慣のチェックインや練習記録などは、デフォルトで**お使いの端末内にのみ保存**され、本アプリが**個人バックアップとして開発者のサーバーへ自動アップロードすることはありません**。

**静かな同席 / 灯（初期オン、Privacy でオフ可）**：座っているあいだ、正直な人数のために**ランダムなセッション id** だけを自社サーバーへ送ります。名前・メール・練習ログ・チャットは含みません。この通信は **Cloudflare** 経由のことがあります。

**デスクトップの更新確認（待ち時間中）**：インストール済みのアプリは、更新用ホスト `https://updates.twinsology.com/` に新しい版があるか尋ねることがあります。この確認にはアプリの版番号が含まれ、ホストは **IP** アドレスと版番号を知り得ます。練習内容・チャット・氏名は含みません。新しい版がない、または見送る場合、インストーラはダウンロードしません。

**起動時の公開設定**：アプリ起動時、公開設定や購入状態を自社サーバーから取得することがあります。練習ログのアップロードではありません。

**任意の練習効果カウント（研究、初期オフ）**：Privacy でオンにしたときだけ、時間を決めた坐の回数などと、再インストールで消える研究用の番号が届きます。会話の原文、メール、支払い情報は送りません。

**研究共修：本バージョンでは提供しません。** メニューに「研究共修」は出さず、週次の研究パケットも送りません。以下は将来の任意機能の説明であり、本インストーラの機能ではありません。

第 0 層は収集しません。将来開放する場合の第 1 層は週次の数字、第 2 層の質問は初版には含みません。Privacy の練習効果カウントとは独立です。

**任意の夜遅い終了時刻（練習の観察紙、初期オフ）**：観察紙でオンにした場合のみ、午前 1 時から 6 時までに終わったタイマー座りについて、日付と終了時刻を端末内に記録します。睡眠モニタリングではなく、アップロードも研究共有もしません。

**支払い：** 将来 **Stripe** で購読やチップを扱う可能性があります。**この招待版では正式な課金を開きません。**

### 3. ローカルでのエクスポート / インポート

本アプリはプライバシー画面および設定のバックアップから**ローカルエクスポート/インポート**を提供します。機種変更は、メールによるクラウド復元を待たずに、このファイルで行えます。

ご注意：

- エクスポートファイルは**暗号化されていません**。**ご自身の責任で保管してください**。
- インポートは該当する端末データを**上書き**します。
- **対象範囲（現在 31 キー）**：旅の記録、練習カレンダー、節目、所有印、儀式、芥子の印、蓮の池、一部の設定（言語・リマインダー・同伴モードなど）、観察紙関連、一部の権利印と寅コイン、安定した好み。実リストは設定のバックアップ画面に従います。
- **対象外**：打ち明け原文、寅の個人記憶、研究共修の番号と週次パケット、クラウドログイントークン、派生キャッシュ。振り返り日記のキーはエクスポート対象に含まれます。書いていなければ空です。

### 4. クラウドバックアップ / メール復元

**本バージョンは現在、クラウドバックアップを提供せず、「メールを入れれば戻せる」とも約束しません。** 機種変更は第3節のローカルエクスポート/インポートを使ってください。

コード上は約 8 類の任意メール控えがありますが、**最初のインストーラでは入口を閉じます**。本番の疎通確認でも閉じている必要があります。将来開く場合は、保存内容・暗号化・削除方法を先に本ポリシーで示し、同意を得ます。

### 5. お客様の権利

- **端末内データの削除**：アプリ内リセットを使ってください。Mac でアプリをゴミ箱に入れても、通常は `~/Library/Application Support/` 内のファイルは消えません。リセット後に該当フォルダを削除するか、**hello@twinsology.com** へ現在のパスを尋ねてください。
- いつでも練習バックアップファイルをエクスポートできます。
- この招待版は **Apple シリコン（arm64）の Mac のみ**です。
- お問い合わせ：**hello@twinsology.com**

---

## In-app placement

| Entry | Behavior |
|---|---|
| Primary | **?** → purpose card → **Privacy** → `#onboarding-privacy-sheet`（**完整隐私声明** §1–§5；i18n 对齐本页） |
| Export / import | Privacy sheet §3 · `#privacy-local-data-mount` |
| Cloud backup UI | **第一份安装包关闭。** 设置里「用邮箱保存或找回」不得作为对客入口。本地导出/导入仍可用。 |

## Engineering notes (not user-facing)

- Local export/import SSOT = `PRACTICE_BACKUP_EXPORT_KEYS` in `localBackupStorageRegistry.js` (**31 keys** as of schema v7). Legacy cloud snapshot was 6 keys; live Worker schema is **8** `PRACTICE_BACKUP_CLOUD_V2_STORE_KEYS`. Do not tell users “export is 6 keys” or “export excludes all preferences.”
- First-invite ship: `practiceBackupCloudEnabled` must be **false** in the packed dist (release-flag assert). D1–D4 runtime remains in source for a later public open. Production probes should still look closed.
- Practice Study / T81 weekly upload / Hugging Face model fetch: first-package capture list must show none of these as live customer traffic unless the user opened Confide semantics download.
- Packaged Mac update checks may hit `https://updates.twinsology.com/` (IP + app version only). Capture allowlists must list that host; it is not a practice-content upload.
- Opt-in key `focus-tiger.practice-backup.v1` must not silent-flush while the client gate is off.

## Questions

Use in-app **?** → **Privacy**. Engineering checklist: `MVP_PRODUCT_DEFINITION.md` §六.
