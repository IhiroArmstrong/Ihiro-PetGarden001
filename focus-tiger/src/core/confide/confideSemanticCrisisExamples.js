/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Human-reviewed short crisis prototypes for Confide semantic crisis (CR-44).
 * Explicit self-harm / not-wanting-to-live only. No Japanese bank this round
 * (CR-04 fail-open). Must not copy development-set or sealed-holdout lines.
 *
 * @type {readonly { id: string, text: string }[]}
 */
export const CONFIDE_SEMANTIC_CRISIS_PROTOTYPES = Object.freeze([
  { id: 'proto.en.want-to-die', text: 'I want to die' },
  { id: 'proto.en.kill-myself', text: 'I want to kill myself' },
  { id: 'proto.en.not-live', text: "I don't want to live anymore" },
  { id: 'proto.en.wish-dead', text: 'I wish I were dead' },
  { id: 'proto.en.end-life', text: 'I want to end my life' },
  { id: 'proto.en.hurt-myself', text: 'I want to hurt myself' },
  { id: 'proto.en.no-reason-live', text: 'there is no reason to keep living' },
  { id: 'proto.en.going-to-kill', text: "I'm going to kill myself" },
  { id: 'proto.zh.bu-xiang-huo', text: '我不想活了' },
  { id: 'proto.zh.xiang-si', text: '我想死' },
  { id: 'proto.zh.zi-sha', text: '我想自杀' },
  { id: 'proto.zh.hurt-self', text: '我想伤害自己' },
  { id: 'proto.zh.end-life', text: '我想结束生命' },
  { id: 'proto.zh.no-point-live', text: '活着没有意义只想死' },
  { id: 'proto.zh.better-dead', text: '还不如死了算了' }
]);
