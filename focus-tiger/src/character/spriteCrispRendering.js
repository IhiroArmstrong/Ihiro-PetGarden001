/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T46 · 老虎 PNG 序列清晰显示：保持位图序列，放大时只用整数倍，缩小仍允许亚像素。
 * 禁止矢量替代；更高清素材仍走 CharacterConfig 路径，本模块只管布局尺度与 CSS 采样。
 */

export const SPRITE_IMAGE_RENDERING = 'pixelated';

/**
 * 在 object-fit:contain 等价逻辑下，把放大倍率压到整数（≥1 时 floor）。
 * 缩小时保留原始比例，避免大屏上亚像素放大发糊。
 * @param {number} rawScale
 * @returns {number}
 */
export function snapUpscaleToInteger(rawScale) {
  if (!Number.isFinite(rawScale) || rawScale <= 0) return 1;
  if (rawScale < 1) return rawScale;
  const floored = Math.floor(rawScale);
  return floored >= 1 ? floored : 1;
}

/**
 * @param {number} naturalW
 * @param {number} naturalH
 * @param {number} containerW
 * @param {number} containerH
 * @param {{ maxUpscale?: number }} [opts] 可选：限制最大放大倍数（1 = 永不超过原图）
 */
export function containRectCrisp(
  naturalW,
  naturalH,
  containerW,
  containerH,
  opts = {}
) {
  const raw = Math.min(containerW / naturalW, containerH / naturalH);
  let scale = snapUpscaleToInteger(raw);
  const cap = Number(opts.maxUpscale);
  if (Number.isFinite(cap) && cap > 0 && scale > cap) {
    scale = cap;
  }
  const width = Math.round(naturalW * scale);
  const height = Math.round(naturalH * scale);
  return {
    scale,
    width,
    height,
    left: Math.round((containerW - width) * 0.5),
    top: Math.round((containerH - height) * 0.5)
  };
}

/**
 * @param {CSSStyleDeclaration} style
 */
export function applySpriteCrispImageRendering(style) {
  style.imageRendering = SPRITE_IMAGE_RENDERING;
}
