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
 * 多段衔接试播（张望 A/B）。单段素材见 SPRITE_SEQUENCES。
 * @type {ReadonlyArray<CompanionGestureChain>}
 */
export const COMPANION_GESTURE_CHAINS = Object.freeze([
  Object.freeze({
    id: 'gazeLookA',
    label: '张望A (p1→p2)',
    sequences: Object.freeze(['gazeP1CenterBlinkLeft', 'gazeP2LeftToUp']),
    notes: '中→眨→左→上；候选看向某处 / 生命感'
  }),
  Object.freeze({
    id: 'gazeLookB',
    label: '张望B (p3→p4)',
    sequences: Object.freeze(['gazeP3TowardRight', 'gazeP4RightToDown']),
    notes: '右→下；候选看向某处 / 生命感'
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
    suggestedUses: '空闲陪伴、会话间隙温馨确认（非完成庆祝）'
  }),
  Object.freeze({
    id: 'yawnStretch',
    sequence: 'yawnStretch',
    label: '犯困哈欠',
    suggestedUses: '长时间无互动后的轻提示；≠ stretchReminder / dormantWake'
  }),
  Object.freeze({
    id: 'earWiggleHeadTouch',
    sequence: 'earWiggleHeadTouch',
    label: '摇耳摸头',
    suggestedUses: '亲密互动回应 / 偶发俏皮（幅度大，宜少用）'
  }),
  Object.freeze({
    id: 'blinkBreathe',
    sequence: 'blinkBreathe',
    label: '眨眼深呼吸',
    suggestedUses: 'Rise 后轻量过渡、仍像坐禅；不抢 Celebrating / SessionComplete'
  })
]);
