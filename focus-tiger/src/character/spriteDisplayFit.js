/**
 * 精灵画幅归一化：1:1（如 960×960）与宽画幅（如 1056×864）在
 * object-fit:contain 下同屏时，角色视觉尺寸会差一截。
 * 用内容包围盒把非基准序列缩放到与 idle-breathing 同大、同落点。
 */

/** @typedef {{ x: number, y: number, w: number, h: number }} ContentBounds */
/** @typedef {{ width: number, height: number, content: ContentBounds }} SpriteDisplayFit */

/**
 * 主线基准画幅（idle-breathing / blink-smile 等 1056×864）。
 * content 取自 idle-breathing/frame_001 不透明包围盒（alpha>12）。
 * @type {SpriteDisplayFit}
 */
export const SPRITE_DISPLAY_REFERENCE = Object.freeze({
  width: 1056,
  height: 864,
  content: Object.freeze({ x: 212, y: 115, w: 645, h: 749 })
});

/**
 * object-fit:contain 下，图像在容器中的绘制框。
 * @param {number} naturalW
 * @param {number} naturalH
 * @param {number} containerW
 * @param {number} containerH
 */
export function containRect(naturalW, naturalH, containerW, containerH) {
  const scale = Math.min(containerW / naturalW, containerH / naturalH);
  const width = naturalW * scale;
  const height = naturalH * scale;
  return {
    scale,
    width,
    height,
    left: (containerW - width) * 0.5,
    top: (containerH - height) * 0.5
  };
}

/**
 * 内容包围盒映射到容器像素（contain 之后、transform 之前）。
 * @param {SpriteDisplayFit} fit
 * @param {number} containerW
 * @param {number} containerH
 */
export function contentScreenRect(fit, containerW, containerH) {
  const box = containRect(fit.width, fit.height, containerW, containerH);
  const { content } = fit;
  const left = box.left + content.x * box.scale;
  const top = box.top + content.y * box.scale;
  const w = content.w * box.scale;
  const h = content.h * box.scale;
  return {
    left,
    top,
    width: w,
    height: h,
    /** 底边中点：坐姿蒲团对齐用 */
    anchorX: left + w * 0.5,
    anchorY: top + h
  };
}

/**
 * 计算把 `sourceFit` 内容对齐到基准画幅所需的 CSS transform
 *（transform-origin: 0 0；顺序 translate → scale）。
 * 无 sourceFit 或已与基准同画幅时返回 identity。
 *
 * @param {SpriteDisplayFit | null | undefined} sourceFit
 * @param {{ width: number, height: number }} container
 * @param {SpriteDisplayFit} [reference]
 * @returns {{ scale: number, tx: number, ty: number }}
 */
export function computeSpriteDisplayTransform(
  sourceFit,
  container,
  reference = SPRITE_DISPLAY_REFERENCE
) {
  const cw = container.width;
  const ch = container.height;
  if (!sourceFit || cw < 1 || ch < 1) {
    return { scale: 1, tx: 0, ty: 0 };
  }
  if (
    sourceFit.width === reference.width &&
    sourceFit.height === reference.height
  ) {
    return { scale: 1, tx: 0, ty: 0 };
  }

  const ref = contentScreenRect(reference, cw, ch);
  const src = contentScreenRect(sourceFit, cw, ch);
  if (src.height < 1) return { scale: 1, tx: 0, ty: 0 };

  const scale = ref.height / src.height;
  // p' = p * scale + (tx, ty)；锚点（底边中点）对齐
  const tx = ref.anchorX - src.anchorX * scale;
  const ty = ref.anchorY - src.anchorY * scale;
  return { scale, tx, ty };
}

/**
 * @param {{ scale: number, tx: number, ty: number }} t
 * @returns {string}
 */
export function spriteDisplayTransformCss(t) {
  if (!t || (t.scale === 1 && t.tx === 0 && t.ty === 0)) return '';
  return `translate(${t.tx}px, ${t.ty}px) scale(${t.scale})`;
}
