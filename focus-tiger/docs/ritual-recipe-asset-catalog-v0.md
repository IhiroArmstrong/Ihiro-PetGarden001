# Ritual Recipe · 资源清单 v0

> **状态**：v0（Default 映射现网；Deep / ADHD / Evening 待设计填 id）  
> **消费者**：客户端导入降级 + 将来 Worker POST 拒写。**先部署 Worker 副本，再发 app**（A3b）。  
> **禁止**：`user-*`、IndexedDB 自传曲。`snd.*` 与现网曲 id **只保留现网一套**。

权威字段见 [`RITUAL_RECIPE_A1_SPEC.md`](./RITUAL_RECIPE_A1_SPEC.md) §4 / §10。实现：`src/core/ritualRecipe/ritualRecipeAssets.js`。

## `promptId`

| id | 用途 | v0 状态 |
|---|---|---|
| `null` | 默认引导（现网常量/池） | **Default sitting 全段** |
| `arrive.soft` | spec 示例 | 占位；未知于运行时 → null（A1c） |
| `transition.hand` | spec 示例 | 占位 |
| `reflect.line` | spec 示例 | 占位 |

Deep / ADHD / Evening 的各段 id：**待设计填表**。白名单可先含上列占位，未接线前一律当未知 → null。

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

Default sitting：`soundId: null`（与改造前「不因配方改偏好」一致）。Deep / ADHD / Evening：**待设计**从本表挑，Evening 须与 Default **可区分**。

## `roomId`

| id | 用途 | v0 状态 |
|---|---|---|
| `room.default` | 缺省 / 无效 / 无权限降级 | **唯一已锁** |

付费房间 id 与降级文案：**会上待定**。未知 / 无权限 → `room.default`，不阻止采用。

## 官方模板 Focus（spec §10）

| 模板 | `templateId`（暂定） | Focus | 差异 |
|---|---|---|---|
| Default sitting | `official.default` | 600s / 10 分 | 与改造前一致 |
| Deep work | `official.deep` | 2700s / 45 分 | 音效 + 引导，待填 |
| ADHD-friendly | `official.adhd` | 900s / 15 分 | 更少引导 + 稳音效；**无**短 Arrive 秒数 |
| Evening close | `official.evening` | 600s / 10 分 | 须靠 sound + prompt 与 Default 区分 |
