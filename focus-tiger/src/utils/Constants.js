/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

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
  /** Primary CTA (Sit / Rise) — cushion orange; was vermillion #8b2e2e */
  accentRed: '#b5623a',
  textInk: '#2c1f14'
};

export const FOCUS_SESSION_DEFAULT_MINUTES = 25;
/** @deprecated 2026-07-16 Honesty Check-in：DORMANT 改为「当日零完成」，不再用连续天数。 */
export const DORMANT_TRIGGER_DAYS = 3;

/** 距最近一次专注会话结束超过该小时数 → 惰性判定进入 DORMANT（滚动窗口，非自然日）。 */
export const DORMANT_IDLE_HOURS = 2;
export const DORMANT_IDLE_MS = DORMANT_IDLE_HOURS * 60 * 60 * 1000;
/** @deprecated 2026-07-16：Honesty Check-in 使用约 10 秒呼吸引导，见 HonestyCheckInUI。 */
export const WAKE_UP_RITUAL_MINUTES = 1;

/**
 * 老虎视觉调参：压低曝光/环境反射，略提饱和，减轻 3D 发白发淡。
 * 作用于全部姿态 GLB 材质（TigerCharacter._applyShadersToRoot）。
 */
export const TIGER_BRIGHTNESS_BOOST = 0.85;
export const TIGER_SATURATION_BOOST = 1.2;
/** 环境反射强度（RoomEnvironment 易洗白毛色） */
export const TIGER_ENV_MAP_INTENSITY = 0.28;
/** 粗糙度向 1.0 推进比例，削弱镜面高光 */
export const TIGER_ROUGHNESS_HIGHLIGHT_REDUCTION = 0.28;
/** MeshPhysicalMaterial 高光上限 */
export const TIGER_SPECULAR_INTENSITY_MAX = 0.25;
/** 场景级环境贴图强度（three r163+ scene.environmentIntensity） */
export const SCENE_ENVIRONMENT_INTENSITY = 0.35;

/**
 * 场景曝光与灯光：优先保住固有色层次，避免高光过曝。
 */
export const SCENE_TONE_MAPPING_EXPOSURE = 0.75;
export const SCENE_LIGHT_HEMISPHERE = 0.35;
export const SCENE_LIGHT_AMBIENT = 0.15;
export const SCENE_LIGHT_MAIN = 1.0;
export const SCENE_LIGHT_FILL = 0.4;
