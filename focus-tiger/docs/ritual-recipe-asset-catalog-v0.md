# Ritual Recipe · 资源清单 v0

> **状态**：v0.1（Default 映射现网；Deep / ADHD / Evening `promptId` / `soundId` 已设计锁，A4 才可选）  
> **消费者**：客户端导入降级 + 将来 Worker POST 拒写。**先部署 Worker 副本，再发 app**（A3b）。  
> **禁止**：`user-*`、IndexedDB 自传曲。`snd.*` 与现网曲 id **只保留现网一套**。

权威字段见 [`RITUAL_RECIPE_A1_SPEC.md`](./RITUAL_RECIPE_A1_SPEC.md) §4 / §10。实现：`src/core/ritualRecipe/ritualRecipeAssets.js`。

## `promptId`

| id | 用途 | v0 状态 |
|---|---|---|
| `null` | 默认引导（现网常量/池） | **Default sitting 全段**；ADHD 全段也用 null（更少引导） |
| `arrive.soft` | spec 示例 | 占位；**未接线** → 运行时 null |
| `transition.hand` | spec 示例 | 占位；**未接线** → 运行时 null |
| `reflect.line` | spec 示例 | 占位；**未接线** → 运行时 null |
| `arrive.deep.quiet` | Deep Arrive | 设计锁；克制入座 |
| `focus.deep.hold` | Deep Focus | 设计锁 |
| `transition.deep.return` | Deep Transition | 设计锁 |
| `reflect.deep.note` | Deep Reflect | 设计锁 |
| `arrive.evening.soft` | Evening Arrive | 设计锁；收尾入座 |
| `transition.evening.rest` | Evening Transition | 设计锁 |
| `reflect.evening.close` | Evening Reflect | 设计锁 |

A1c 已接线：Deep / Evening 七段 id 见 `ritualRecipePromptBinding.js` + `ritual-recipe-a1c-prompt-bindings.json`。白名单内**未接线** id（含上表三个 spec 占位）→ 运行时 **null**，Default 现网引导不变。

## `soundId`

现网 `AMBIENT_TRACKS` id（`AmbientSoundscapeController.js`）。配方 **`null`** = 不覆盖用户全局偏好（含静音）。

| id | 备注 |
|---|---|
| `singing-bowl` | 现网默认曲目工程 id（Mer-Ka-Ba） |
| `divine-life-society` | |
| `lord-of-the-dawn` | |
| `maestro-tlakaelel` | |
| `the-inner-sound` | |
| `somnia-variation-3` | |
| `somnia-variation-10` | |
| `rain` | Meditation Impromptu |
| `dreamland` | |
| `invisible-beauty` | |
| `kiss-the-sky` | |
| `frozen-in-love` | |

### 官方模板选用

| 模板 | `soundId` |
|---|---|
| Default sitting | `null`（不覆盖全局偏好） |
| Deep work | `the-inner-sound` |
| ADHD-friendly | `rain`（稳、连续） |
| Evening close | `dreamland`（与 Default 同分，靠此 + prompt 区分） |

## `roomId`

| id | 用途 | v0 状态 |
|---|---|---|
| `room.default` | 缺省 / 无效 / 无权限降级 | **唯一已锁** |

付费房间 id 与降级文案：**会上待定**。未知 / 无权限 → `room.default`，不阻止采用。

## 官方模板 Focus（spec §10）

| 模板 | `templateId`（暂定） | Focus | 差异 |
|---|---|---|---|
| Default sitting | `official.default` | 600s / 10 分 | 全段 `promptId` null · `soundId` null · 与改造前一致 |
| Deep work | `official.deep` | 2700s / 45 分 | `the-inner-sound` + Deep 四段 prompt |
| ADHD-friendly | `official.adhd` | 900s / 15 分 | `rain`；全段 prompt null；**无**短 Arrive 秒数 |
| Evening close | `official.evening` | 600s / 10 分 | `dreamland` + evening arrive/transition/reflect |
