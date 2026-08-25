/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Arrival Practice —— Sit 之后、计时之前的轻量仪式状态机（纯逻辑，无 DOM）。
 *
 * 步骤：welcome → notice → breath → choose → ready
 * Notice 点选写入 presence-signals（arrival_notice）；Choose 由调用方写入 intentions.v1。
 */

export const ARRIVAL_STEPS = Object.freeze({
  WELCOME: 'welcome',
  NOTICE: 'notice',
  BREATH: 'breath',
  CHOOSE: 'choose',
  READY: 'ready'
});

export const ARRIVAL_WELCOME_MS = 2000;
export const ARRIVAL_BREATH_MS = 5000;
/** Notice 点选后：仅展示观察式短句的停留（须够读完；勿继续展示整屏图标区）。 */
export const ARRIVAL_NOTICE_REPLY_MS = 2400;

/** Notice：身心状态图标（点选入账 presence-signals） */
export const NOTICE_OPTIONS = Object.freeze([
  { id: 'calm', emoji: '🧘', labelKey: 'ARRIVAL_NOTICE_CALM', replyKey: 'ARRIVAL_NOTICE_REPLY_CALM' },
  { id: 'okay', emoji: '🌤️', labelKey: 'ARRIVAL_NOTICE_OKAY', replyKey: 'ARRIVAL_NOTICE_REPLY_OKAY' },
  { id: 'busyMind', emoji: '🌊', labelKey: 'ARRIVAL_NOTICE_BUSY', replyKey: 'ARRIVAL_NOTICE_REPLY_BUSY' },
  { id: 'stressed', emoji: '🔥', labelKey: 'ARRIVAL_NOTICE_STRESSED', replyKey: 'ARRIVAL_NOTICE_REPLY_STRESSED' },
  { id: 'lowEnergy', emoji: '🌧️', labelKey: 'ARRIVAL_NOTICE_LOW', replyKey: 'ARRIVAL_NOTICE_REPLY_LOW' },
  { id: 'notSure', emoji: '😶', labelKey: 'ARRIVAL_NOTICE_UNSURE', replyKey: 'ARRIVAL_NOTICE_REPLY_UNSURE' }
]);

/** Choose：活动方向（可落库 + Reflection 回显） */
export const CHOOSE_OPTIONS = Object.freeze([
  { id: 'reading', emoji: '📖', labelKey: 'ARRIVAL_CHOOSE_READING' },
  { id: 'deepWork', emoji: '💻', labelKey: 'ARRIVAL_CHOOSE_DEEP_WORK' },
  { id: 'creative', emoji: '🎨', labelKey: 'ARRIVAL_CHOOSE_CREATIVE' },
  { id: 'meditation', emoji: '🧘', labelKey: 'ARRIVAL_CHOOSE_MEDITATION' },
  { id: 'writing', emoji: '📝', labelKey: 'ARRIVAL_CHOOSE_WRITING' },
  { id: 'smallStep', emoji: '☕', labelKey: 'ARRIVAL_CHOOSE_SMALL_STEP' }
]);

/**
 * @typedef {'icon' | 'typed' | null} ChooseSource
 * @typedef {{
 *   step: string,
 *   noticeId: string | null,
 *   chooseText: string,
 *   chooseSource: ChooseSource,
 *   skippedAll: boolean
 * }} ArrivalPracticeState
 */

export function createArrivalPracticeState() {
  return {
    step: ARRIVAL_STEPS.WELCOME,
    noticeId: null,
    chooseText: '',
    chooseSource: null,
    skippedAll: false
  };
}

/**
 * @param {ArrivalPracticeState} state
 * @returns {ArrivalPracticeState}
 */
export function advanceArrivalStep(state) {
  const next = { ...state };
  if (next.step === ARRIVAL_STEPS.WELCOME) next.step = ARRIVAL_STEPS.NOTICE;
  else if (next.step === ARRIVAL_STEPS.NOTICE) next.step = ARRIVAL_STEPS.BREATH;
  else if (next.step === ARRIVAL_STEPS.BREATH) next.step = ARRIVAL_STEPS.CHOOSE;
  else if (next.step === ARRIVAL_STEPS.CHOOSE) next.step = ARRIVAL_STEPS.READY;
  return next;
}

/**
 * 整体跳过：清空当次 Notice/Choose，直接 ready。
 * @param {ArrivalPracticeState} state
 */
export function skipArrivalPracticeEntirely(state) {
  return {
    ...state,
    step: ARRIVAL_STEPS.READY,
    noticeId: null,
    chooseText: '',
    chooseSource: null,
    skippedAll: true
  };
}

/**
 * @param {ArrivalPracticeState} state
 * @param {string} noticeId
 */
export function selectArrivalNotice(state, noticeId) {
  const valid = NOTICE_OPTIONS.some((opt) => opt.id === noticeId);
  return {
    ...state,
    noticeId: valid ? noticeId : null
  };
}

/**
 * @param {ArrivalPracticeState} state
 * @param {{ text: string, source: 'icon' | 'typed' }} choice
 */
export function selectArrivalChoose(state, { text, source }) {
  const trimmed = String(text ?? '').trim();
  return {
    ...state,
    chooseText: trimmed,
    chooseSource: trimmed ? source : null,
    step: ARRIVAL_STEPS.READY
  };
}

export function skipArrivalChoose(state) {
  return {
    ...state,
    chooseText: '',
    chooseSource: null,
    step: ARRIVAL_STEPS.READY
  };
}

export function getNoticeOption(noticeId) {
  return NOTICE_OPTIONS.find((opt) => opt.id === noticeId) ?? null;
}

export function getChooseOption(chooseId) {
  return CHOOSE_OPTIONS.find((opt) => opt.id === chooseId) ?? null;
}
