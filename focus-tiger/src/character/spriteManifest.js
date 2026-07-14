/**
 * 2D PNG 序列帧清单 —— 主线情绪表现载体的**声明式**注册表。
 *
 * 设计意图：把「一个动作由哪些帧、多少帧率、是否循环、播完是否停在末帧」
 * 全部收敛到数据里。新增一个动作 = 在此加一条，`SpriteSequencePlayer`
 * 的播放逻辑无需改动。
 *
 * 帧路径均为 Vite `public/` 下的运行时 URL（以 `/` 开头，原样提供）。
 * 序列语义与触发规则以 `docs/EMOTION_BIBLE.md` 为准；此处只描述「怎么播」。
 */

/**
 * 构造零填充、有序的帧路径数组。
 * @param {string} prefix 帧文件前缀（含目录），如 '/sprites/wave-hello/wave_hello_'
 * @param {number} from 起始序号（含）
 * @param {number} to 结束序号（含）
 * @param {number} pad 序号零填充位数，如 3 → 001
 * @param {string} [ext] 扩展名，默认 '.png'
 * @returns {string[]}
 */
export function buildFrames(prefix, from, to, pad, ext = '.png') {
  const frames = [];
  for (let i = from; i <= to; i++) {
    frames.push(`${prefix}${String(i).padStart(pad, '0')}${ext}`);
  }
  return frames;
}

/**
 * @typedef {object} SpriteSequenceDef
 * @property {string[]} frames 有序帧路径
 * @property {number} fps 播放帧率
 * @property {boolean} loop 是否循环播放（持续待机类为 true）
 * @property {boolean} holdLastFrame 非循环时：播完是否停在最后一帧（false = 播完隐藏让位给底层态）
 */

/** @type {Record<string, SpriteSequenceDef>} */
export const SPRITE_SEQUENCES = {
  // 挥手欢迎（EMOTION_BIBLE: WelcomeBack / welcomeBack）——首组真实 2D 序列。
  // 一次性反馈动作：播完不停留，隐藏 overlay 回落到当前基底态（Idle）。
  waveHello: {
    frames: buildFrames('/sprites/wave-hello/wave_hello_', 1, 14, 3),
    fps: 12,
    loop: false,
    holdLastFrame: false
  }
};
