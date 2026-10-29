# A1 Spec v0.2 · 坐的配方（Ritual Recipe）配置结构

> **仓内副本**（便于 `docs:check` 引用）：`focus-tiger/docs/RITUAL_RECIPE_A1_SPEC.md`。  
> **仓库根原稿**仍为 `A1 Spec v0.2 · 坐的配方（Ritual Recipe）配置结构.md`。两份须同版本；实现以本副本为准。

状态：草案 v0.2（薄 schema）｜ **本文为唯一真源** ｜ 范围：Web + Mac Electron ｜ 不涉及运行时代码

**路径（仓库）：** `Zen-tiger-Pet-garden001/A1 Spec v0.2 · 坐的配方（Ritual Recipe）配置结构.md`

> 对齐会分发的 Doc / 同事副本须与本文同版本；若有出入，以本文件为准。

## 1. 目的与边界

**目的：** 把 Five Moments 中散落的常量与偏好，收成一份带 `schemaVersion` 的、可导出、可预览后采用的「坐的配方」。它是阶段 1 的地基：模板编辑（A2）、官方模板（A4）、导入导出与分享（A3）、埋点（A5）、Mac Shortcuts（B1）都读写同一份结构。

**配方是：** 一份「怎么坐」的配置数据。

**配方不是：**

- 用户音频或任意文件的载体（只能引用官方 / 嘉宾已上架的资源 id；**禁止** `user-*` 与 IndexedDB 自传曲）
- 可执行脚本（不含任何逻辑、URL 拉取、表达式）
- 商店商品（无价格字段、无排行字段）
- 练习备份的一部分（备份是覆盖式导入，配方必须预览后才采用，两者不混）

## 2. 设计原则

1. **数据，不是代码。** 配方只含数值、枚举、受限文本和资源 id。
2. **引用，不内嵌。** 音效、房间、引导语一律用 id 引用；未知 id 有明确降级策略。
3. **不锁「能坐」。** 配方引用了用户未拥有的付费房间时，降级为默认房间，练习本身照常进行。Arrive / Reflect **始终可跳过**（Quick Start、跳过钮为**流程常量**，不进配方）。
4. **向前兼容。** 对未知字段容错，对未来版本给出可读提示，而不是崩溃。
5. **预览，再采用。** 任何外来配方（导入文件、分享链接）都不得自动覆盖用户当前配方。
6. **阿寅不可替换。** `companion` 固定为 `yin`。
7. **五段语义不对称。** Focus 才是开表；Recover 是会话内冷却；Arrive / Transition / Reflect 的**步进时长**留在代码常量里（Arrive 为多步流程，单字段秒数易误解）。禁止把 Recover 做成 MicroRitual。
8. **薄 schema 可加长。** 新增可选字段不必递增 `schemaVersion`（见第 6 节）。若灰度期官方模板使用率过度偏向 Default，可再在 v1.x 增加可选 `arrive.durationSec` 等，而不必删已有导出字段。

## 3. 数据结构（v1）

`schemaVersion` 从 **1** 开始。

```json
{
  "schemaVersion": 1,
  "id": "rcp_01HZX...",
  "title": "Evening close",
  "locale": "en",
  "authorType": "official",
  "companion": "yin",
  "soundId": "snd.rain",
  "roomId": "room.default",
  "moments": {
    "arrive":     { "promptId": "arrive.soft" },
    "focus":      { "durationSec": 600, "mode": "fixed", "promptId": null },
    "recover":    { "cooldownSec": 180 },
    "transition": { "promptId": "transition.hand" },
    "reflect":    { "promptId": "reflect.line" }
  },
  "notes": "A quiet way to end the day.",
  "share": { "enabled": false, "visibility": "private" },
  "moderation": { "status": "draft" }
}
```

**Recover 段 v1：** 仅 `cooldownSec`（恒 180）。`promptId` **预留**（将来可映射 `ACTIVE_RECOVER` 观察句池），v1 JSON **省略**该键；编辑器不展示 Recover 文案。导入若带 `moments.recover.promptId`，按未知字段丢弃。

**v1 不含：** `moments.*.durationSec`（Arrive / Transition）、`skippable`、按段 `soundId` / `roomId`。

### 3.1 顶层字段

| 字段 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- |
| `schemaVersion` | integer | 是 | 当前为 1 |
| `id` | string | 是 | 本地生成；导入时**一律重新生成** |
| `title` | string | 是 | 1–40 字符，纯文本 |
| `locale` | enum | 是 | `en` \| `ja` |
| `authorType` | enum | 是 | `official` \| `guest` \| `user`；导入时一律降为 `user` |
| `companion` | enum | 是 | 仅 `yin` |
| `soundId` | string \| null | 否 | v1 整场一个音效。**null** = 不覆盖用户全局偏好（含用户自选静音）。非 null 时本场按 id 播，**不写回** `ambient-pref.enabled` |
| `roomId` | string | 否 | v1 整场一个房间；缺省 / 无效 → `room.default` |
| `moments` | object | 是 | 五段齐全，见 3.2 |
| `notes` | string | 否 | 0–200 字符 |
| `share` | object | 否 | 阶段 1 导入时重置 `enabled: false` |
| `moderation` | object | 否 | 阶段 1 只用 `draft` |

若外来 JSON 带 `moments.*.soundId` / `roomId` 或已废弃的 `durationSec` / `skippable`：**丢弃**，不因之拒绝；必要时在预览提示「已忽略旧版字段」。

### 3.2 五段字段（v1 薄 schema）

| 段 | 现网（常量不在配方里） | v1 可配字段 |
| --- | --- | --- |
| **Arrive** | 欢迎 ~2s + Notice + 呼吸 ~5s + Choose；全程可跳过 | `promptId` \| null |
| **Focus** | chip 10 / 15 / 25 / 45 分；或 **open**；`?sessionMinutes=` 仅 e2e | `mode`: `fixed` \| `open`；`fixed` 时 `durationSec` ∈ {600, 900, 1500, 2700}；`promptId` \| null |
| **Recover** | 轻触阿寅；toast ~3s；**180s 冷却**；零 MicroRitual | **`cooldownSec` 恒 180**（编辑器不可改） |
| **Transition** | Idle 微入口 ~10s overlay | `promptId` \| null |
| **Reflect** | 三问，可 Skip，无计时 | `promptId` \| null |

### 3.3 Focus 与 Recover 取值

| 项 | 规则 |
| --- | --- |
| Focus `mode=fixed` | `durationSec` 只允许 **600 / 900 / 1500 / 2700**（10 / 15 / 25 / 45 分）。其它整数 → 夹到最近 chip 并提示 |
| Focus `mode=open` | 忽略 `durationSec`；硬顶沿用现网 open-ended cap |
| Recover `cooldownSec` | 导入非 180 → 夹成 180 并提示「冷却不可自定义」 |

**开表 chip vs 配方（待决 3 · 建议锁）：** 配方 = 默认开坐；Sit 时 chip = **本场覆盖**，不写回配方。`?sessionMinutes=` 不进配方。

### 3.4 音效与房间（v1 整场）

- 只认顶层 `soundId`、`roomId`。
- 按段切换 = v2。
- 白名单不含 `user-*`。实现时 `snd.*` 与现网曲 id **二选一**映射，禁止两套并存。

## 4. 资源 id 与白名单

- 应用内置只读清单 + Worker 写入副本（**先部署 Worker，再发 app**）。
- 客户端导入：未知 id 降级（见下表）。**POST 短链：未知 id 拒绝落库。**

| 情况 | 客户端预览 |
| --- | --- |
| 未知 `promptId` | null → 默认引导 |
| 未知 / 不可用 `soundId` | null → 不覆盖偏好 |
| 未知 / 无权限 `roomId` | `room.default`，不阻止采用 |

## 5. 导入校验规则

1. 体积 ≤ 8 KB，否则拒绝。
2. 合法 JSON 对象。
3. `schemaVersion`：过高拒绝；过低链式迁移（第 6 节）。
4. 五段齐全；Focus / Recover 类型正确；Recover 可读 `cooldownSec`（旧草稿 Recover `durationSec` → 迁移为 `cooldownSec`）。
5. **未知字段丢弃**（含 `skippable`、`moments.arrive.durationSec`、`moments.transition.durationSec`、`moments.recover.promptId` 等）。
6. `title` / `notes` 纯文本、转义渲染。
7. Focus / Recover 按 3.3 夹取。
8. 资源 id 降级（客户端）或拒写（服务端 POST）。
9. 规范化：`id` 重生；`authorType` → `user`；`moderation` → `draft`；`share.enabled` → false。
10. → **预览**，不直接写入。

## 6. schemaVersion 迁移策略

- 收紧语义 / 删字段 → **必须**递增版本。
- **新增可选**字段（例如将来 `arrive.durationSec`）→ **不必**递增；旧客户端忽略即可。
- 配方独立版本序列与存储键，不复用练习备份白名单。
- 草稿兼容：Recover 的 `durationSec` → `cooldownSec`；Focus 秒 → chip；**丢弃** Arrive/Transition 时长与一切 `skippable`。

## 7. 预览、采用与恢复默认

**预览：** 标题、Focus（分或 open）、各段引导名、整场音效/房间、`notes`、校验提示。**Recover 冷却不可调**（预览是否展示 180 固定值：会上可定，不做滑杆）。

**采用：** 新条目进「我的配方」，不覆盖当前默认；不改付费状态。

**恢复默认：** **逐段**「恢复该段默认」+ **整份**「恢复整份默认」。官方模板不可原地改，须复制为用户配方后再改。

## 8. 导出与分享链接（A3）

| 项 | 约束 |
| --- | --- |
| 写入 | `POST /api/recipes`：同第 5 节；未知 id **拒写 KV** |
| 发布顺序 | **先 Worker 白名单，再 app** |
| 标识 | 随机 base62 ≥ 10 |
| 体积 | ≤ 8 KB |
| 速率 | **POST 10/min/IP**；**GET 60/min/IP**；429 |
| 过期 | TTL 90 天，打开续期 |
| 读取 | `GET /api/recipes/:id` 仅 JSON |
| 撤销 | `editToken`（服务端存哈希） |
| IP | 限速仅用内存，**不写 KV、不进埋点、不进分析库**（隐私声明须写清） |

**非作者打开：** 带作者 `editToken` 不计数；否则计一次（近似，服务端，不依赖埋点 opt-in）。

## 9. 埋点事件（A5，先锁名字）

**默认关闭** · 无用户标识 · 无配方正文 · 无 `title` / `notes`。

**判读（看板必写）：** opt-in 偏差；旋钮偏薄（Arrive/Transition 时长不可配 → ADHD「短 Arrive」只能靠 prompt/音效/Focus 15）；Shortcuts 仅参考；非作者打开为近似计数。灰度期看四官方模板 `source` 占比，若极度偏向 Default → 信号考虑加回可选 `arrive.durationSec`。

| 事件名 | 触发 | 属性 |
| --- | --- | --- |
| `recipe_session_started` | 开始一轮坐 | 见下表 |
| `recipe_edited` | 保存修改 | `fields_changed`: `focus_duration` \| `prompt` \| `sound` \| `room`（集合） |
| `recipe_reset_default` | 恢复默认 | `scope`: `moment` \| `all` |
| `recipe_exported` | 导出 | — |
| `recipe_import_previewed` | 导入预览 | `origin`: `file` \| `link`；`warnings`: 0–N |
| `recipe_adopted` | 采用 | `origin`: `file` \| `link` |
| `recipe_import_rejected` | 校验失败 | `reason`: `size` \| `parse` \| `version` \| `structure` \| `asset` |
| `recipe_share_created` | 创建分享 | — |
| `recipe_share_opened` | 服务端非作者 GET | 聚合 only |
| `shortcut_session_started` | URL scheme 开坐 | `has_template`: boolean |

**`recipe_session_started` 属性（定稿）：**

| 属性 | 类型 | 取值与含义 |
| --- | --- | --- |
| `source` | enum | `default`：内置 Default sitting，未选其它官方/用户配方 · `official`：官方非 Default 模板 · `custom`：用户自建 · `imported`：自文件/链接采用 |
| `focus_mode` | enum | `fixed` \| `open` — **本场**实际开表模式（chip 或配方默认） |
| `chip_override` | boolean | `true`：用户在本场 Sit 通过时长/open **chip** 选了与「当前默认开坐配方」的 `mode` + `durationSec` **不一致**的组合 · `false`：未出 chip、或 chip 与配方默认一致、或 Shortcut/直达开坐且与配方一致 |

**阶段 1 主判断：** 自定义率（`recipe_edited` ÷ 周活）；非默认模板（`source ≠ default`）；分享（`recipe_share_opened` + `recipe_adopted` origin=link）。**参考：** Shortcuts 与集成用户回流。

## 10. 官方模板首批 4 个

Focus 仅 10 / 15 / 45 / 10 分。Evening 与 Default 同分，**必须**靠 `soundId` + `promptId` 区分。

| 模板 | Focus | `soundId` | `promptId` |
| --- | --- | --- | --- |
| Default sitting | 10 分 (600s) | `null` | 全段 `null`（与改造前一致） |
| Deep work | 45 分 (2700s) | `the-inner-sound` | `arrive.deep.quiet` / `focus.deep.hold` / `transition.deep.return` / `reflect.deep.note` |
| ADHD-friendly | 15 分 (900s) | `rain` | 全段 `null`（更少引导；**无**短 Arrive 秒数） |
| Evening close | 10 分 (600s) | `dreamland` | `arrive.evening.soft` / Focus `null` / `transition.evening.rest` / `reflect.evening.close` |

## 11. 待决与隐私

**已锁（本刀设计）：** Deep / ADHD / Evening 的 `promptId` / `soundId`（见上表 + 资源清单 v0.1）。

**会上仍待点头：** chip 覆盖不写回配方（A1b 现网仍写 `focus-duration-pref`，**不**写配方）；付费房间降级文案。

**隐私（阶段 1 同发 `PRIVACY_NOTICE.md`）：** 分享 KV 内容/TTL/撤销；限速 IP 仅内存；埋点 opt-in；Health 不在本阶段。

## 12. 明确不做

- 配方内 Arrive/Transition 时长、`skippable`、Recover 文案编辑、按段音效/房间
- 绕过 chip、Health、备份 JSON、UGC 广场、Slack/Raycast

## 13. 验收清单（A1）

- [ ] Web + Mac 读写一致；Default sitting 与改造前一致（Arrive/Transition/Reflect 时序仍走代码常量）——A1b 已接线待验；A4 模板入口未开
- [ ] 第 5 节单测 + 夹具（含废弃字段丢弃、Recover 迁移）
- [ ] 埋点与看板判读；Worker 先于 app；隐私更新

---

## 附录 · 版本

**v0.2 薄 schema（本稿）：** 去掉 Arrive/Transition `durationSec` 与全部 `skippable`；Recover 仅 `cooldownSec`；`soundId` optional；埋点 `focus_mode` / `chip_override` 定稿；单文件真源 `A1 Spec v0.2 · …`。

**Recover `promptId`：** v1 省略；不进编辑器；将来版本可加可选键映射观察 toast 池，不碰冷却。
