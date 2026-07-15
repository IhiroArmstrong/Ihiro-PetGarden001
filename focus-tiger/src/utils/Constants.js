// 直接复制 TASKS.md v5.0 "原则三：视觉风格规范" 的色板，
// 以及关键阈值参数，方便所有模块统一引用，不允许颜色值/阈值散落在各文件里硬编码。

export const COLORS = {
  // TODO(奖励柜任务): idleGray* / focusGold* 命名源自旧"灰→金材质渐变"方案，
  // 与 2026-07-15 视觉原则（本体固有色恒定，金色仅用于光环/环境光）不符。
  // 3D 重构时改名为环境光/光环语义（如 haloGold*），本阶段保留不动。
  idleGrayStart: '#cdd0d3',
  idleGrayEnd: '#a8adb3',
  focusGoldMid: '#e0b979',
  focusGoldFull: '#f0c060',
  stripeColor: '#8b6914',
  ambienceFog: '#e8e6e1',
  accentRed: '#8b2e2e',
  textInk: '#2c1f14'
};

export const FOCUS_SESSION_DEFAULT_MINUTES = 25;
export const DORMANT_TRIGGER_DAYS = 3;
export const WAKE_UP_RITUAL_MINUTES = 1;

/**
 * 老虎视觉调参（相对原始默认值整体压低 15%，削弱发白/过曝感）。
 * 作用于全部姿态 GLB 材质（TigerCharacter._applyShadersToRoot）。
 */
export const TIGER_BRIGHTNESS_BOOST = 0.935; // 原 1.1 × 0.85
export const TIGER_SATURATION_BOOST = 0.935; // 原 1.1 × 0.85
/** 环境反射强度（原 1.0 × 0.85） */
export const TIGER_ENV_MAP_INTENSITY = 0.85;
/** 粗糙度向 1.0 推进比例，削弱镜面高光（原 0.1 → 0.15） */
export const TIGER_ROUGHNESS_HIGHLIGHT_REDUCTION = 0.15;

/**
 * 场景曝光与灯光（原值 × 0.85），影响老虎及整体画面亮度。
 */
export const SCENE_TONE_MAPPING_EXPOSURE = 0.978; // 原 1.15 × 0.85
export const SCENE_LIGHT_HEMISPHERE = 0.553; // 原 0.65 × 0.85
export const SCENE_LIGHT_AMBIENT = 0.298; // 原 0.35 × 0.85
export const SCENE_LIGHT_MAIN = 1.87; // 原 2.2 × 0.85
export const SCENE_LIGHT_FILL = 0.765; // 原 0.9 × 0.85
