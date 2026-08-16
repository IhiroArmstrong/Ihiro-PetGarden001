/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 候选陪伴手势 / 一次性情绪序列目录（非 Idle 随机池）。
 *
 * 这些素材已入库，可经 EmotionController 调试面板或未来 playEmotion 接线到
 * Rise / Recover / 互动等场景；**禁止**挂进 IdleOrchestrator 自动调度
 * （正式 Idle 仅呼吸×5→眨眼，见 PRINCIPLES / EMOTION_BIBLE）。
 */

/**
 * @typedef {{id:string,label:string,sequences:ReadonlyArray<string>,notes?:string}} CompanionGestureChain
 */

/**
 * 多段衔接试播（张望整段）。单段素材见 SPRITE_SEQUENCES。
 * @type {ReadonlyArray<CompanionGestureChain>}
 */
export const COMPANION_GESTURE_CHAINS = Object.freeze([
  Object.freeze({
    id: 'gazeLookAround',
    label: '张望 (p1→p2→p3→p4)',
    sequences: Object.freeze([
      'gazeP1CenterBlinkLeft',
      'gazeP2LeftToUp',
      'gazeP3TowardRight',
      'gazeP4RightToDown'
    ]),
    notes: '中→眨→左→上→右→下；整段看向某处。若将来要循环，末帧与首帧衔接可能需再调'
  })
]);

/**
 * 单段候选手势（调试情绪入口旁注 + 文档清单）。
 * @type {ReadonlyArray<{id:string,sequence:string,label:string,suggestedUses:string}>}
 */
export const COMPANION_GESTURE_ONESHOTS = Object.freeze([
  Object.freeze({
    id: 'teaDrinking',
    sequence: 'teaDrinking',
    label: '喝茶',
    suggestedUses:
      '空闲陪伴、会话间隙温馨确认、中途 Rise 加权池 ~25%（非完成庆祝）；English 切语'
  }),
  Object.freeze({
    id: 'yawnStretch',
    sequence: 'yawnStretch',
    label: '犯困哈欠',
    suggestedUses: '长时间无互动后的轻提示；≠ stretchReminder / dormantWake；勿进 Rise 池'
  }),
  Object.freeze({
    id: 'earWiggleHeadTouch',
    sequence: 'earWiggleHeadTouch',
    label: '摇耳摸头',
    suggestedUses:
      'Idle 轻点阿寅（产品壳 2D hit）/ 好奇池偶发；正+倒一次 + CapCut Idle'
  }),
  Object.freeze({
    id: 'cloakSleep',
    sequence: 'cloakSleep',
    label: '披毯入睡',
    suggestedUses:
      '进 DORMANT 过渡（非 DORMANT→DORMANT 状态转换时播 cloakSleep→sleeping）；≠ Rise'
  }),
  Object.freeze({
    id: 'riseStretchCasual',
    sequence: 'riseStretchCasual',
    label: 'Rise 伸懒腰',
    suggestedUses:
      '中途 Rise 加权池主项 ~60%（正放一次→末帧 holdPose；Reflection 后回 idle）；不抢 Celebrating / SessionComplete'
  }),
  Object.freeze({
    id: 'blinkBreathe',
    sequence: 'blinkBreathe',
    label: '眨眼深呼吸',
    suggestedUses: '调试候选；勿回 Rise 主路径（已改加权池）'
  }),
  Object.freeze({
    id: 'magicBookReading',
    sequence: 'magicBookReading',
    label: '魔法书阅读',
    suggestedUses:
      '开场欢迎池试验（同日 1 次加权）；已烘焙 pingpong；回落 ~1s CapCut Idle（2026-08-05）；**勿**进 Rise 池（过长）'
  }),
  Object.freeze({
    id: 'conjureFlowersBlowAway',
    sequence: 'conjureFlowersBlowAway',
    label: '变花吹散',
    suggestedUses:
      'Day1 / 久别鼓励（策略 C）；Phase 2b 已接 WELCOME_APP；正放 → CapCut Idle + 气泡；同日 XOR 欢迎池'
  }),
  Object.freeze({
    id: 'bookReading',
    sequence: 'bookReading',
    label: '单程看书',
    suggestedUses:
      '日语切语问候；中途 Rise 加权池 ~15%；正放一次 → holdPose / CapCut Idle；≠ magic-book-reading'
  }),
  Object.freeze({
    id: 'goldenHaloPalms',
    sequence: 'goldenHaloPalms',
    label: '金环合掌',
    suggestedUses: 'Honesty≥30 长补登试验；已烘焙 pingpong；≠ breathHaloHq 调试备选'
  })
]);
