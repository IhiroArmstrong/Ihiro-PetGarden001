/**
 * 2D PNG 序列帧清单 —— 主线情绪表现载体的**声明式**注册表。
 *
 * 设计意图：把「一个动作有多少帧、多少帧率、是否循环、播完是否停在末帧」
 * 全部收敛到数据里。新增一个动作 = 在此加一条，`SpriteSequencePlayer`
 * 的播放逻辑无需改动。
 *
 * 解耦约定（角色/装扮可替换预留）：清单只描述**动作本身**
 * （animation 名 + 帧数 + 播放参数），不含角色/装扮信息，也不存具体路径；
 * 帧路径由 `CharacterConfig.buildFramePaths()` 在播放器解析时按
 * 「当前生效外观」拼出。序列语义与触发规则以 `docs/EMOTION_BIBLE.md` 为准。
 */

/**
 * @typedef {object} SpriteSequenceDef
 * @property {string} animation 动作名（kebab-case，对应素材目录段，如 'wave-hello'）
 * @property {number} frameCount 帧数（frame_001 起连续编号）
 * @property {number} fps 播放帧率
 * @property {boolean} loop 是否循环播放（持续待机类为 true）
 * @property {boolean} holdLastFrame 非循环时：播完是否停在最后一帧（false = 播完隐藏让位给底层态）
 * @property {Record<number, number>} [frameHolds] 单帧停留时长覆盖：键为 **1 基帧号**
 *   （与帧文件名序号一致，如 8 对应 `frame_008.png`），值为该帧在 fps 基础间隔之上
 *   **额外**停留的毫秒数。未设置的帧按 fps 均匀播放。
 */

/**
 * wave-hello 抬手最高点（第 8 帧 `frame_008.png`：掌心完全张开、位置最高）
 * 的额外停留时长（ms）。观感调整建议范围 300–600。
 */
export const WAVE_HELLO_PEAK_HOLD_MS = 400;

/** @type {Record<string, SpriteSequenceDef>} */
export const SPRITE_SEQUENCES = {
  // 挥手欢迎（EMOTION_BIBLE: WelcomeBack / welcomeBack）——首组真实 2D 序列。
  // 一次性反馈动作：播完不停留，隐藏 overlay 回落到当前基底态（Idle）。
  waveHello: {
    animation: 'wave-hello',
    frameCount: 14,
    fps: 12,
    loop: false,
    holdLastFrame: false,
    // 抬手顶点定格：让「打招呼」的招牌瞬间被看清，再继续回摆
    frameHolds: { 8: WAVE_HELLO_PEAK_HOLD_MS }
  }
};
