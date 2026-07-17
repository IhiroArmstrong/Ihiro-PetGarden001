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
 * @property {number} [startFrame] 可选起始帧号；用于从同一素材目录注册子序列
 * @property {number} fps 播放帧率
 * @property {boolean} [preload] 是否纳入启动预加载；未绑定候选素材应设为 false
 * @property {boolean} loop 是否循环播放（持续待机类为 true）
 * @property {'none'|'forward'|'pingpong'} [loopMode] 循环方向模式
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
  // 基础观照者坐姿：素材为半程呼吸，正放后倒放组成完整循环。
  idleBreathing: {
    animation: 'idle-breathing',
    frameCount: 21,
    // 半程呼吸 + pingpong；帧率偏低以免持续态看起来抖
    fps: 5,
    loop: true,
    loopMode: 'pingpong',
    holdLastFrame: false
  },

  // 基础闲置的自发变体：闭眼 → 睁眼一瞥 → 闭眼；由 IdleOrchestrator 插入。
  idleEyeGlance: {
    animation: 'idle-eye-glance',
    frameCount: 8,
    fps: 12,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // 挥手欢迎（EMOTION_BIBLE: WelcomeBack / welcomeBack）——新服装正式版序列。
  // 一次性反馈动作：播完不停留，隐藏 overlay 回落到当前基底态（Idle）。
  waveHello: {
    animation: 'wave-hello',
    frameCount: 19,
    fps: 12,
    loop: false,
    holdLastFrame: false,
    // 抬手顶点定格：让「打招呼」的招牌瞬间被看清，再继续回摆
    frameHolds: { 8: WAVE_HELLO_PEAK_HOLD_MS }
  },

  // 完整庆祝（EMOTION_BIBLE: Celebrating）——起身 → 小金光伴随慢速舞 → 结尾施礼。
  // 一次性叙事弧线：不循环；播完由 EmotionController 回归 idle-breathing。
  celebrateDance: {
    animation: 'celebrate-dance',
    frameCount: 57,
    fps: 12,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // 打瞌睡 / DORMANT（EMOTION_BIBLE: Sleeping）——持续睡态循环。
  // 首尾帧衔接经抽样确认可直接 forward 接回；若试播有跳帧感再改 pingpong。
  sleeping: {
    animation: 'sleeping',
    frameCount: 8,
    // 持续睡态宜慢；过快会像抖动
    fps: 4,
    loop: true,
    loopMode: 'forward',
    holdLastFrame: false
  },

  // Honesty Check-in / DORMANT 唤醒：深睡 → 完全清醒坐姿，一次性正放。
  // 末帧短暂停留并保留至 onComplete，由 EmotionController 交叉淡入 idle-breathing。
  dormantWake: {
    animation: 'dormant-wake',
    frameCount: 16,
    fps: 12,
    loop: false,
    loopMode: 'none',
    holdLastFrame: true,
    frameHolds: { 16: 160 }
  },

  // halo-breathing 方案 A：先播 001–006 引入，再接 007–030 pingpong 循环。
  // Honesty Check-in 唤醒后作为奖励呼吸；也可由调试面板直接触发。
  haloBreathingIntro: {
    animation: 'halo-breathing',
    startFrame: 1,
    frameCount: 6,
    fps: 10,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },
  haloBreathingLoop: {
    animation: 'halo-breathing',
    startFrame: 7,
    frameCount: 24,
    fps: 8,
    loop: true,
    loopMode: 'pingpong',
    holdLastFrame: false
  },

  // halo-breathing 候选方案 B：001–030 正放后倒放（调试备用）。
  haloBreathingPingpong: {
    animation: 'halo-breathing',
    startFrame: 1,
    frameCount: 30,
    fps: 8,
    preload: false,
    loop: true,
    loopMode: 'pingpong',
    holdLastFrame: false
  },

  // 坐禅微笑 / 眨眼微表情：pingpong 作 Smiling 基底；Idle 变体与 blink 键以 loop:false 单次插入。
  blinkSmile: {
    animation: 'blink-smile',
    frameCount: 12,
    fps: 8,
    loop: true,
    loopMode: 'pingpong',
    holdLastFrame: false
  },

  // 点头致意（鼠标靠近触发）：一次性正放，播完由 EmotionController 回归 idle-breathing。
  nodGreeting: {
    animation: 'nod-greeting',
    frameCount: 23,
    fps: 12,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  }
};
