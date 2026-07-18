# Task Brief：Light Progression 视觉增强（视差 Dolly + DOM Rim）

日期：2026-07-18  
范围：在既有 `LightProgression` 上增强 2D 平替，不引入 GSAP / Shader / 双套 rim 序列。

## 目标

1. **三层视差 Dolly（Arrival 呼吸 beat）**
   - 背景层：`scale(1 → ~1.06)`，较慢
   - 中景 Yin（`#sprite-overlay`）：`scale(1 → ~1.12)`，略快
   - 前景 UI：不缩放
2. **呼吸光环**：周期改为 **4s**（与 DESIGN 金光呼吸一致），仅外围叠层，不染皮毛。
3. **日常 `focusLevel` → DOM Rim**：独立金晕层 opacity 随 `visualLevel`；叠加 4s 呼吸调制；叙事烧录动画播放期仍归零（复用 `shouldSuppressRuntimeGlow`）。

## 非目标

- 不引入 GSAP、feTurbulence、mix-blend 盖在角色本体上
- 不产出双套 rim PNG 序列
- 不删除 `FocusVisualizer`（3D/奖励柜占位仍可更新；2D 主线以 DOM Rim 为主观感）

## 验收

- Arrival 呼吸：背景与 Yin 缩放有可见差值；结束后回落
- FOCUSING 时 DOM 金晕随进度变亮；Celebrate / SessionComplete / MilestoneGlow 期间隐藏
- 单元测试覆盖 scale / rim opacity 纯函数
- `PRINCIPLES` / `LIGHT_PROGRESSION_DESIGN` / `PROCESS` 速览同步

## 落点

- `src/effects/LightProgression.js`（+ test）
- `src/main.js` 主循环接线
- `docs/LIGHT_PROGRESSION_DESIGN.md`、`docs/PROCESS.md`
