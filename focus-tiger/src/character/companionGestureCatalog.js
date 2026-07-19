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
    id: 'cloakSleep',
    sequence: 'cloakSleep',
    label: '披毯入睡',
    suggestedUses:
      '进 DORMANT 过渡（已拍板：当日首次进 DORMANT 播一次→sleeping）；2c 待接线；≠ Rise'
  }),
  Object.freeze({
    id: 'riseStretchCasual',
    sequence: 'riseStretchCasual',
    label: 'Rise 伸懒腰',
    suggestedUses:
      '中途 Rise 主路径（pingpong；倒放回闭目衔接 idle）；不抢 Celebrating / SessionComplete'
  }),
  Object.freeze({
    id: 'blinkBreathe',
    sequence: 'blinkBreathe',
    label: '眨眼深呼吸',
    suggestedUses: '调试候选；Rise 主路径已改 riseStretchCasual'
  })
]);
