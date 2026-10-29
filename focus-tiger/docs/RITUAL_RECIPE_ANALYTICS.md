# Ritual Recipe · 埋点看板判读（A5）

> Spec：[`RITUAL_RECIPE_A1_SPEC.md`](./RITUAL_RECIPE_A1_SPEC.md) §9。实现：`src/core/ritualRecipe/recipeAnalytics.js`。  
> **默认关闭。** 无用户标识、无配方正文、无 `title` / `notes`。IP 限速不进本埋点。

## 事件名

| 事件 | 触发 | 属性 |
|---|---|---|
| `recipe_session_started` | 开始一轮坐 | `source` · `focus_mode` · `chip_override` |
| `recipe_edited` | 保存修改 | `fields_changed`：`focus_duration` \| `prompt` \| `sound` \| `room`（集合） |
| `recipe_reset_default` | 恢复默认 | `scope`：`moment` \| `all` |
| `recipe_exported` | 导出 | — |
| `recipe_import_previewed` | 导入预览 | `origin`：`file` \| `link`；`warnings`：0–N |
| `recipe_adopted` | 采用 | `origin`：`file` \| `link` |
| `recipe_import_rejected` | 校验失败 | `reason`：`size` \| `parse` \| `version` \| `structure` \| `asset` |
| `recipe_share_created` | 创建分享 | — |
| `recipe_share_opened` | 服务端非作者 GET | 聚合 only（**不**走客户端 opt-in） |
| `shortcut_session_started` | URL scheme 开坐 | `has_template`：boolean |

`recipe_session_started.source`：`default` \| `official` \| `custom` \| `imported`。  
`focus_mode`：本场实际 `fixed` \| `open`。  
`chip_override`：本场 chip 与当前默认开坐配方的 `mode`+`durationSec` 是否不一致。

## 看板必写偏差

1. **opt-in 偏差**：打开统计的人偏爱折腾；自定义率（`recipe_edited` ÷ 周活）高估全体用户。未打开则事件为 0，不能当成「没人用模板」。  
2. **旋钮偏薄**：Arrive / Transition 时长不可配。ADHD「短 Arrive」只能靠 prompt / 音效 / Focus 15 分表达。灰度若四模板 `source` 极度偏向 `default`，才考虑 v1.x 可选 `arrive.durationSec`。  
3. **Shortcuts 仅参考**：`shortcut_session_started` 只说明集成用户回流，不代表模板好坏。  
4. **分享打开是近似计数**：`recipe_share_opened` 在服务端、带作者 `editToken` 的 GET 不计；与埋点开关无关。

## 阶段 1 主判断

- 自定义率：`recipe_edited` ÷ 周活（仅 opt-in 分母）  
- 非默认模板：`recipe_session_started` 且 `source ≠ default`  
- 分享：`recipe_share_opened` + `recipe_adopted` 且 `origin=link`
