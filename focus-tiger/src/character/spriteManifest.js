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
 * @property {number} frameCount 帧数（frame_001 起连续编号；有 frameIndices 时仍表示素材目录最大帧号，供预加载）
 * @property {number} [startFrame] 可选起始帧号；用于从同一素材目录注册子序列
 * @property {number[]} [frameIndices] 可选自定义播放顺序（1 基帧号，可重复/跳过）；缺省为 startFrame 起连续 frameCount 帧
 * @property {number} fps 播放帧率
 * @property {boolean} [preload] 是否纳入启动预加载；未绑定候选素材应设为 false
 * @property {boolean} loop 是否循环播放（持续待机类为 true）
 * @property {'none'|'forward'|'pingpong'} [loopMode] 循环方向模式
 * @property {boolean} holdLastFrame 非循环时：播完是否停在最后一帧（false = 播完隐藏让位给底层态）
 * @property {Record<number, number>} [frameHolds] 单帧停留时长覆盖：键为 **播放列表中的 1 基序号**
 *   （与帧文件名序号在无 frameIndices 时一致），值为该帧在 fps 基础间隔之上
 *   **额外**停留的毫秒数。未设置的帧按 fps 均匀播放。
 * @property {import('./spriteDisplayFit.js').SpriteDisplayFit} [displayFit]
 *   非基准画幅（如 960×960 相对 1056×864）时，用内容包围盒把角色缩放到与 idle 同大同落点。
 */

/**
 * wave-hello 顶点摇摆段（素材 008–012）：抬手到位后的左右摇摆。
 * 播放时该段播两遍，再放手；不再对单帧做额外 hold（避免最高点「完全重复一帧」）。
 */
export const WAVE_HELLO_SWAY_FRAMES = Object.freeze([8, 9, 10, 11, 12]);

/**
 * 一次性情绪目标时长带（秒）。
 * 舒适参考：`dormantWake` ≈5.3s、`nodGreeting` ≈3.8s、`milestoneGlow` 叙事段 ≈6.8s。
 * 帧数不够时三选一：放慢 fps / 重复可循环段 / 正倒放或连贯其它序列。
 * 持续循环（Idle / Sleeping）不按此带。
 */
export const ONE_SHOT_DURATION_SEC = Object.freeze({
  /** 确认 / 仪式类（IntentionSet、nodGreeting、dormantWake、MindfulAcknowledge…） */
  ackMin: 3.5,
  ackTarget: 5.5,
  ackMax: 7,
  /** 轻量完成确认（SessionComplete）；应短于 Celebrating */
  lightMin: 2.5,
  lightMax: 4
});

/** @type {Record<string, SpriteSequenceDef>} */
export const SPRITE_SEQUENCES = {
  // 基础观照者坐姿：素材为半程呼吸，正放后倒放组成完整循环。
  // IdleOrchestrator：完整 pingpong ×5 → 单次 idle-eye-glance → 再 ×5…（偶尔看看）。
  // 勿用 blink-smile：其首末为睁眼微笑，与闭目呼吸叠化会闪。
  idleBreathing: {
    animation: 'idle-breathing',
    frameCount: 21,
    // 2026-07-19：相对原 5fps 放慢 2×
    fps: 2.5,
    loop: true,
    loopMode: 'pingpong',
    holdLastFrame: false
  },

  // 基础闲置的自发变体：闭眼 → 睁眼一瞥 → 闭眼；由 IdleOrchestrator 插入。
  idleEyeGlance: {
    animation: 'idle-eye-glance',
    frameCount: 8,
    fps: 8,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // Idle 张望组合 A 的前半：中心 → 眨眼 → 看向左（末帧停在「左」）。
  gazeP1CenterBlinkLeft: {
    animation: 'gaze-p1-center-blink-left',
    frameCount: 15,
    fps: 12,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // Idle 张望组合 A 的后半：由左转向上看（与 p1 末帧方向衔接）。
  gazeP2LeftToUp: {
    animation: 'gaze-p2-left-to-up',
    frameCount: 13,
    fps: 12,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // Idle 张望组合 B 的前半：转向右看。
  gazeP3TowardRight: {
    animation: 'gaze-p3-toward-right',
    frameCount: 13,
    fps: 12,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // Idle 张望组合 B 的后半：由右转向下（与 p3 衔接；不与「回中」强拼）。
  gazeP4RightToDown: {
    animation: 'gaze-p4-right-to-down',
    frameCount: 25,
    fps: 12,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // Idle「犯困」候选手势：无聊打哈欠伸展；勿与 stretchReminder / dormantWake 混用。
  // 不进 IdleOrchestrator；见 companionGestureCatalog。
  yawnStretch: {
    animation: 'yawn-stretch',
    frameCount: 16,
    fps: 10,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // 候选陪伴手势：坐禅 → 变出茶杯 → 喝茶 → 放低。
  teaDrinking: {
    animation: 'tea-drinking',
    frameCount: 24,
    fps: 8,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // 候选陪伴手势：耳摇 → 双手摸头顶（大幅度）。
  earWiggleHeadTouch: {
    animation: 'ear-wiggle-head-touch',
    frameCount: 54,
    fps: 10,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // 候选轻量手势：睁眼微笑坐禅下边眨眼边深呼吸（调试保留；Rise 主路径已改 riseStretchCasual）。
  // 正放末帧不完整 → pingpong 倒放回首帧，可无缝循环。
  // 深吸顶点（末帧）额外停约 2 拍，避免到顶立刻倒放像跳动。
  blinkBreathe: {
    animation: 'blink-breathe',
    frameCount: 13,
    fps: 8,
    loop: true,
    loopMode: 'pingpong',
    holdLastFrame: false,
    frameHolds: { 13: Math.round((1000 / 8) * 2) }
  },

  // Rise 主路径：闭目坐禅 → 伸懒腰 → 随意日常坐姿；pingpong 倒放回闭目首帧衔接 idle。
  // 单程 39 帧 @ 8fps ≈ 4.9s；完整 pingpong ≈ 9.6s（+末帧 2 拍停留）。
  // 随意坐姿顶点（末帧）停约 2 拍，避免到顶立刻倒放像跳动。
  riseStretchCasual: {
    animation: 'rise-stretch-casual',
    frameCount: 39,
    fps: 8,
    loop: true,
    loopMode: 'pingpong',
    holdLastFrame: false,
    frameHolds: { 39: Math.round((1000 / 8) * 2) }
  },

  // 挥手欢迎（EMOTION_BIBLE: WelcomeBack / welcomeBack）——新服装正式版序列。
  // 抬手 → 顶点左右摇摆×2 → 放手；去掉最高点单帧 hold（观感上的完全重复帧）。
  // 约 29 拍 @ 8fps ≈ 3.6s（ONE_SHOT ack 带下限）。
  waveHello: {
    animation: 'wave-hello',
    frameCount: 19,
    frameIndices: [
      1, 2, 3, 4, 5, 6, 7,
      ...WAVE_HELLO_SWAY_FRAMES,
      ...WAVE_HELLO_SWAY_FRAMES,
      13, 14, 15, 16, 17, 18, 19
    ],
    fps: 8,
    loop: false,
    holdLastFrame: false
  },

  // 完整庆祝（EMOTION_BIBLE: Celebrating）——起身 → 小金光伴随慢速舞 → 结尾施礼。
  // 一次性叙事弧线：不循环；播完由 EmotionController 回归 idle-breathing。
  // 与 celebrateDanceV2 为同 emotion 的 50/50 随机变体（见 EmotionController）。
  celebrateDance: {
    animation: 'celebrate-dance',
    frameCount: 57,
    fps: 12,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // Celebrating 第二变体（dance-v2）：不新建 emotion key；触发时与 celebrateDance 各 50%。
  celebrateDanceV2: {
    animation: 'celebrate-dance-v2',
    frameCount: 60,
    fps: 12,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // 里程碑金辉时刻（EMOTION_BIBLE: MilestoneGlow）——闭目呼吸 + 金光 + 蝴蝶的完整叙事弧线
  // （特效已烧录，无独立 DOM 叠加层）。当前仅供调试预览，约 24MB 不进启动预加载；
  // 末帧由 EmotionController 固定停留后再 onComplete 回落 idle。
  // 备选素材见 breathHaloHq（更简化、无蝴蝶）；选用哪个等里程碑逻辑排期再定。
  // 2026-07-19：金光蝴蝶叙事至少放慢 2×（原 8fps → 4）。
  milestoneGlow: {
    animation: 'milestone-glow',
    frameCount: 27,
    fps: 4,
    preload: false,
    loop: false,
    loopMode: 'none',
    holdLastFrame: true
  },

  // MilestoneGlow 备选（breath-halo-hq）：闭目呼吸 + 脑后金环扩展，无蝴蝶/莲花。
  // 2026-07-20：以 16 帧 HQ 替换旧 breath-halo-expand（17 帧）；不绑定 emotion key / 业务触发。
  // 正放仅「扩展」半拍不完整 → pingpong 倒放收回，完整一吸一呼并可循环。
  // 倒放起始（扩展顶点末帧）额外停约 6 拍（~0.75s），避免到顶立刻收回像跳动。
  breathHaloHq: {
    animation: 'breath-halo-hq',
    frameCount: 16,
    fps: 8,
    preload: false,
    loop: true,
    loopMode: 'pingpong',
    holdLastFrame: false,
    frameHolds: { 16: Math.round((1000 / 8) * 6) }
  },

  // Arrival Choose 确认：16:9 轻量点头（nod-bow）；不再用 1:1 palms-together（画幅/衔接易跳）。
  // 素材与 MindfulAcknowledge 同源，但 emotion key 仍为 intentionSet（触发点不同）。
  // 13 拍 @ 3.5fps ≈ 3.7s；无 displayFit，可直接接 idle。
  // palms-together 仅保留调试试播（历史合十素材）。
  palmsTogether: {
    animation: 'palms-together',
    frameCount: 14,
    frameIndices: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
      13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1
    ],
    fps: 4,
    loop: false,
    loopMode: 'none',
    holdLastFrame: true,
    // 闭目末帧多停一拍，再 cross-fade 回 idle
    frameHolds: { 27: 400 },
    // frame_001 内容包围盒（alpha>12）；与 idle-breathing 同屏对齐
    displayFit: {
      width: 960,
      height: 960,
      content: { x: 45, y: 163, w: 913, h: 734 }
    }
  },

  // IntentionSet 正式序列（Choose 确认）—— 16:9 nod-bow pingpong：
  // 正放鞠躬 → 倒放回坐姿，才能衔接后续 idle / Companion。
  // 一次完整 pingpong ≈ 2×13 拍 @ 3.5fps；转场用 1s CapCut 叠化（见 EmotionController）。
  intentionNod: {
    animation: 'nod-bow',
    frameCount: 13,
    fps: 3.5,
    loop: true,
    loopMode: 'pingpong',
    holdLastFrame: false
  },

  // 环境细节解锁·莲花池首朵（Backlog 纪念奖励）——仅入库，无触发逻辑。
  lotusFrontRising: {
    animation: 'lotus-front-rising',
    frameCount: 7,
    fps: 8,
    preload: false,
    loop: false,
    loopMode: 'none',
    holdLastFrame: true
  },

  // Grow Together 纪念物解锁视觉候选（胸口莲花+脑后金光）——仅入库，无触发逻辑。
  lotusChestHalo: {
    animation: 'lotus-chest-halo',
    frameCount: 10,
    fps: 10,
    preload: false,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // 每次专注完成的轻量确认（EMOTION_BIBLE: SessionComplete）——温和摆尾 + 烧录光环/粒子。
  // 当日首次达标由 Celebrating 替代；同日后续完成播放一次后回归 idle-breathing。
  // 播放期关闭 FocusVisualizer / Rim Light 实时金光，避免与帧内光效叠加。
  // 28 拍 @ 8fps ≈ 3.5s（ONE_SHOT light 带；短于 Celebrating ≈5s）。
  sessionComplete: {
    animation: 'session-complete',
    frameCount: 28,
    fps: 8,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // 阶段性 / 回归专注确认（MindfulAcknowledge，含 subtype: refocus）。
  // 小幅点头鞠躬，一次性播放；强度刻意低于 sessionComplete 与 Celebrating。
  // 13 拍 @ 3.5fps ≈ 3.7s（ONE_SHOT ack 带下限）。
  nodBow: {
    animation: 'nod-bow',
    frameCount: 13,
    fps: 3.5,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // 活跃专注累计 2 小时的温和舒展提醒；与 sleeping → awake 的 dormant-wake 不同源。
  // 17 拍 @ 4fps ≈ 4.3s（ONE_SHOT ack 带）。
  stretchReminder: {
    animation: 'stretch-reminder',
    frameCount: 17,
    fps: 4,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },

  // 调试 / 历史 WakeUp：伸懒腰式清醒（同源 stretch-reminder 素材，独立情绪键）。
  // 与 Honesty 的 dormant-wake（侧卧深睡→坐姿）刻意区分；勿再共用 dormant-wake。
  wakeUp: {
    animation: 'stretch-reminder',
    frameCount: 17,
    fps: 8,
    loop: false,
    loopMode: 'none',
    holdLastFrame: true,
    frameHolds: { 17: 280 }
  },

  // 打瞌睡 / DORMANT（EMOTION_BIBLE: Sleeping）——持续睡态循环。
  // 首尾帧衔接经抽样确认可直接 forward 接回；若试播有跳帧感再改 pingpong。
  // 2026-07-19：至少放慢 3×（原 4fps → 1），睡态宜极缓。
  sleeping: {
    animation: 'sleeping',
    frameCount: 8,
    fps: 1,
    loop: true,
    loopMode: 'forward',
    holdLastFrame: false
  },

  // Honesty Check-in / DORMANT 唤醒：深睡 → 完全清醒坐姿，一次性正放。
  // 末帧定格；2026-07-19：再放慢 2×（6 → 3 fps），暂不接闭眼呼吸 / 金光 / halo。
  dormantWake: {
    animation: 'dormant-wake',
    frameCount: 16,
    fps: 3,
    loop: false,
    loopMode: 'none',
    holdLastFrame: true,
    frameHolds: { 16: 320 }
  },

  // halo-breathing 方案 A：先播 001–006 引入，再接 007–030 pingpong 循环。
  // Honesty Check-in 唤醒后作为奖励呼吸；也可由调试面板直接触发。
  haloBreathingIntro: {
    animation: 'halo-breathing',
    startFrame: 1,
    frameCount: 6,
    // 2026-07-19：至少放慢 2×（原 10 → 5）
    fps: 5,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  },
  haloBreathingLoop: {
    animation: 'halo-breathing',
    startFrame: 7,
    frameCount: 24,
    fps: 4,
    loop: true,
    loopMode: 'pingpong',
    holdLastFrame: false
  },

  // halo-breathing 候选方案 B：001–030 正放后倒放（调试备用）。
  haloBreathingPingpong: {
    animation: 'halo-breathing',
    startFrame: 1,
    frameCount: 30,
    fps: 4,
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
  // 点头致意（鼠标靠近）：放慢以免像打瞌睡点头；末帧额外停留约 2 帧时长。
  nodGreeting: {
    animation: 'nod-greeting',
    frameCount: 23,
    fps: 6,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false,
    // 末帧 = 基础间隔 + 2×间隔 → 共约 3 倍停留（「多重复 2 次」）
    frameHolds: { 23: Math.round((1000 / 6) * 2) }
  },

  // 歪头思考（鼠标在老虎附近静止触发）：一次性正放，播完回归 idle-breathing。
  tiltThink: {
    animation: 'tilt-think',
    frameCount: 20,
    fps: 12,
    loop: false,
    loopMode: 'none',
    holdLastFrame: false
  }
};
