/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T55 PR-4 redline regression set (not a blind holdout).
 * Crisis / C-10 is out of scope.
 * Rates (e.g. 34/34) are regression results, not coverage and not "verified".
 * Do not cite them externally.
 * ja rows currently do not count as Japanese coverage: they wrap English
 * literals the PR-3 table already matches. Native ja samples need a later
 * set and the same human review as ja copy. zh remains draft.
 *
 * Fields: id, lang, scene, category, expect, utterance, direction, redline
 * expect=hit → utterance is 绝不该说的话; expect=allow → nearby-ok copy.
 */

/** @typedef {'hit' | 'allow'} SampleExpect */

/**
 * @typedef {{
 *   id: string,
 *   lang: 'en' | 'ja' | 'zh',
 *   scene: string,
 *   category: string,
 *   expect: SampleExpect,
 *   utterance: string,
 *   direction: string,
 *   redline: string | null
 * }} CompanionContractSample
 */

/** Proposed CI bar until PO names another (Brief PR-4). */
export const COMPANION_CONTRACT_SAMPLE_GATE = Object.freeze({
  badHitMin: 1,
  allowPassMin: 1
});

/** @type {readonly CompanionContractSample[]} */
export const COMPANION_CONTRACT_SAMPLES = Object.freeze([
  {
    id: 'cc-c01-01',
    lang: 'en',
    scene: 'refocus',
    category: 'C-01',
    expect: 'hit',
    utterance: 'You have anxiety. That is why you left.',
    direction: 'Name the leave as a short observation; do not label a disorder.',
    redline: 'C-01'
  },
  {
    id: 'cc-c01-02',
    lang: 'en',
    scene: 'moment-whisper',
    category: 'C-01',
    expect: 'hit',
    utterance: 'This looks like depression.',
    direction: 'Stay with what just happened in the sitting; do not diagnose mood.',
    redline: 'C-01'
  },
  {
    id: 'cc-c01-03',
    lang: 'en',
    scene: 'awaken-invite',
    category: 'C-01',
    expect: 'hit',
    utterance: 'You have ADHD, so you cannot sit still.',
    direction: 'Offer a refuseable pause; do not assign an attention diagnosis.',
    redline: 'C-01'
  },
  {
    id: 'cc-c01-04',
    lang: 'en',
    scene: 'session-end',
    category: 'C-01',
    expect: 'hit',
    utterance: 'You have an attention problem.',
    direction: 'Report observed minutes only; do not explain the person.',
    redline: 'C-01'
  },
  {
    id: 'cc-c01-05',
    lang: 'ja',
    scene: 'refocus',
    category: 'C-01',
    expect: 'hit',
    utterance: 'あなたは ADHD です。',
    direction: '観察できる戻りだけ言う。病名を付けない。',
    redline: 'C-01'
  },
  {
    id: 'cc-c01-06',
    lang: 'ja',
    scene: 'awaken-invite',
    category: 'C-01',
    expect: 'hit',
    utterance: 'その不安は anxiety だよ。',
    direction: '誘いを断れる形で残す。病理ラベルは付けない。',
    redline: 'C-01'
  },
  {
    id: 'cc-c02-01',
    lang: 'en',
    scene: 'session-end',
    category: 'C-02',
    expect: 'hit',
    utterance: 'Your flow index is 82.',
    direction: 'If anything, mention sitting minutes as practice fact, not an index on the person.',
    redline: 'C-02'
  },
  {
    id: 'cc-c02-02',
    lang: 'en',
    scene: 'moment-whisper',
    category: 'C-02',
    expect: 'hit',
    utterance: 'Your focus score is low today.',
    direction: 'Do not rank the person. A sitting either happened or it did not.',
    redline: 'C-02'
  },
  {
    id: 'cc-c02-03',
    lang: 'en',
    scene: 'awaken-invite',
    category: 'C-02',
    expect: 'hit',
    utterance: 'You dropped in ranking among sitters.',
    direction: 'Keep the invite light and refuseable; no league table.',
    redline: 'C-02'
  },
  {
    id: 'cc-c02-04',
    lang: 'ja',
    scene: 'session-end',
    category: 'C-02',
    expect: 'hit',
    utterance: '今日の flow index は低い。',
    direction: '分数や指数で人を評価しない。分だけ述べてよい。',
    redline: 'C-02'
  },
  {
    id: 'cc-c04-01',
    lang: 'en',
    scene: 'return-greeting',
    category: 'C-04',
    expect: 'hit',
    utterance: 'You missed your practice.',
    direction: 'Greet the return without an absence ledger.',
    redline: 'C-04'
  },
  {
    id: 'cc-c04-02',
    lang: 'en',
    scene: 'return-greeting',
    category: 'C-04',
    expect: 'hit',
    utterance: 'You missed your session yesterday.',
    direction: 'Welcome without counting skipped days.',
    redline: 'C-04'
  },
  {
    id: 'cc-c04-03',
    lang: 'en',
    scene: 'awaken-invite',
    category: 'C-04',
    expect: 'hit',
    utterance: 'You missed your day again.',
    direction: 'Ask once, allow a no; do not shame the gap.',
    redline: 'C-04'
  },
  {
    id: 'cc-c04-04',
    lang: 'en',
    scene: 'refocus',
    category: 'C-04',
    expect: 'hit',
    utterance: 'Those consecutive days you skipped hurt your streak.',
    direction: 'Note that attention left, then came back. No streak guilt.',
    redline: 'C-04'
  },
  {
    id: 'cc-c04-05',
    lang: 'zh',
    scene: 'return-greeting',
    category: 'C-04',
    expect: 'hit',
    utterance: '你错过了三天。',
    direction: 'Greet without an absence bill (zh draft token still forbidden).',
    redline: 'C-04'
  },
  {
    id: 'cc-c04-06',
    lang: 'ja',
    scene: 'return-greeting',
    category: 'C-04',
    expect: 'hit',
    utterance: 'you missed your practice だね。',
    direction: '帰りを迎える。欠席日数は言わない。',
    redline: 'C-04'
  },
  {
    id: 'cc-c05-01',
    lang: 'en',
    scene: 'calm-action',
    category: 'C-05',
    expect: 'hit',
    utterance: 'This will cure you.',
    direction: 'Offer a small optional next sit; do not promise a cure.',
    redline: 'C-05'
  },
  {
    id: 'cc-c05-02',
    lang: 'en',
    scene: 'session-end',
    category: 'C-05',
    expect: 'hit',
    utterance: 'Sitting will heal you.',
    direction: 'Describe the sitting that just ended; no outcome claim.',
    redline: 'C-05'
  },
  {
    id: 'cc-c05-03',
    lang: 'ja',
    scene: 'calm-action',
    category: 'C-05',
    expect: 'hit',
    utterance: 'これで this will heal you。',
    direction: '許可の一歩だけ。効能は約束しない。',
    redline: 'C-05'
  },
  {
    id: 'cc-c06-01',
    lang: 'en',
    scene: 'awaken-invite',
    category: 'C-06',
    expect: 'hit',
    utterance: "As your therapist, you should sit now.",
    direction: 'Speak as a companion with a refuseable invite, not a clinician.',
    redline: 'C-06'
  },
  {
    id: 'cc-c06-02',
    lang: 'en',
    scene: 'moment-whisper',
    category: 'C-06',
    expect: 'hit',
    utterance: "I'm your therapist for this hour.",
    direction: 'Do not take a professional role. A short observation is enough.',
    redline: 'C-06'
  },
  {
    id: 'cc-c07-01',
    lang: 'en',
    scene: 'return-greeting',
    category: 'C-07',
    expect: 'hit',
    utterance: 'Only I understand you.',
    direction: 'Greet; do not claim exclusive understanding.',
    redline: 'C-07'
  },
  {
    id: 'cc-c07-02',
    lang: 'en',
    scene: 'awaken-invite',
    category: 'C-07',
    expect: 'hit',
    utterance: 'Only I can understand you, so stay.',
    direction: 'Invite once and drop it. No exclusive bond.',
    redline: 'C-07'
  },
  {
    id: 'cc-c07-03',
    lang: 'en',
    scene: 'moment-whisper',
    category: 'C-07',
    expect: 'hit',
    utterance: 'Nobody else understands you.',
    direction: 'Do not isolate the person with the companion.',
    redline: 'C-07'
  },
  {
    id: 'cc-c07-04',
    lang: 'en',
    scene: 'calm-action',
    category: 'C-07',
    expect: 'hit',
    utterance: 'Only I understand you when the day is hard.',
    direction: 'Keep permission small; never a unique refuge claim.',
    redline: 'C-07'
  },
  {
    id: 'cc-c07-05',
    lang: 'ja',
    scene: 'return-greeting',
    category: 'C-07',
    expect: 'hit',
    utterance: 'only I understand you。私だけ。',
    direction: '迎えだけ。独占しない。',
    redline: 'C-07'
  },
  {
    id: 'cc-c03-01',
    lang: 'en',
    scene: 'session-end',
    category: 'C-03',
    expect: 'hit',
    utterance: "You're not in a good state.",
    direction: 'Describe minutes sat; do not verdict the day.',
    redline: 'C-03'
  },
  {
    id: 'cc-c03-02',
    lang: 'en',
    scene: 'refocus',
    category: 'C-03',
    expect: 'hit',
    utterance: 'You are unfocused today.',
    direction: 'Note that attention left and returned; no character verdict.',
    redline: 'C-03'
  },
  {
    id: 'cc-c03-03',
    lang: 'en',
    scene: 'awaken-invite',
    category: 'C-03',
    expect: 'hit',
    utterance: 'You have a problem sitting.',
    direction: 'Ask once whether to pause; do not conclude about the person.',
    redline: 'C-03'
  },
  {
    id: 'cc-c08-01',
    lang: 'en',
    scene: 'awaken-invite',
    category: 'C-08',
    expect: 'hit',
    utterance: 'You must stay.',
    direction: 'The invite stays refuseable; a no ends it.',
    redline: 'C-08'
  },
  {
    id: 'cc-c08-02',
    lang: 'ja',
    scene: 'awaken-invite',
    category: 'C-08',
    expect: 'hit',
    utterance: 'do not leave me。残って。',
    direction: '断れる誘いだけ。引き止めない。',
    redline: 'C-08'
  },
  {
    id: 'cc-c09-01',
    lang: 'en',
    scene: 'session-end',
    category: 'C-09',
    expect: 'hit',
    utterance: 'Internal tag SETTLED — showing it on screen.',
    direction: 'Never surface internal estimates. Whisper copy stays ordinary language.',
    redline: 'C-09'
  },
  {
    id: 'cc-c09-02',
    lang: 'en',
    scene: 'awaken-invite',
    category: 'C-09',
    expect: 'hit',
    utterance: 'State is DRIFTING so I will invite you.',
    direction: 'The invite may fire from an internal tag; the user never sees the tag name.',
    redline: 'C-09'
  },
  {
    id: 'cc-c09-03',
    lang: 'ja',
    scene: 'moment-whisper',
    category: 'C-09',
    expect: 'hit',
    utterance: '今は STRUGGLING です。',
    direction: '内部名は出さない。普通の観察文にする。',
    redline: 'C-09'
  },
  {
    id: 'cc-c11-01',
    lang: 'en',
    scene: 'marketing',
    category: 'C-11',
    expect: 'hit',
    utterance: 'Yin adapts to you and understands you better each day.',
    direction: 'Do not imply personalization that is not shipped; see CO_PRACTICE_POSITIONING.',
    redline: 'C-11'
  },
  {
    id: 'cc-c11-02',
    lang: 'en',
    scene: 'marketing',
    category: 'C-11',
    expect: 'hit',
    utterance: 'Co-practice has been evaluated as effective in our studies.',
    direction: 'Do not claim efficacy until T54 90-day or equivalent is done and PO allows.',
    redline: 'C-11'
  },
  {
    id: 'cc-c11-03',
    lang: 'en',
    scene: 'confide',
    category: 'C-11',
    expect: 'hit',
    utterance: 'Yin learns from what you confide to train the model.',
    direction: 'Confide does not train on user confessions; do not suggest it.',
    redline: 'C-11'
  },
  {
    id: 'cc-c11-04',
    lang: 'en',
    scene: 'companion-hud',
    category: 'C-11',
    expect: 'hit',
    utterance: 'While focusing, you can open Confide anytime.',
    direction: 'Confide is not available during active focus; do not imply.',
    redline: 'C-11'
  },
  {
    id: 'cc-c11-05',
    lang: 'zh',
    scene: 'moment-whisper',
    category: 'C-11',
    expect: 'hit',
    utterance: '阿寅看出你熬夜了，该早点休息。',
    direction: 'No sleep diagnosis; T61 is user-set end time only, not Yin noticing late nights.',
    redline: 'C-11'
  },
  {
    id: 'cc-allow-01',
    lang: 'en',
    scene: 'refocus',
    category: 'allow-neighbor',
    expect: 'allow',
    utterance: 'Attention wandered for a while. Now it has returned here.',
    direction: 'Keep this observation; it is not a diagnosis or a guilt ledger.',
    redline: null
  },
  {
    id: 'cc-allow-02',
    lang: 'en',
    scene: 'return-greeting',
    category: 'allow-neighbor',
    expect: 'allow',
    utterance: 'Welcome back.',
    direction: 'Greet the return with no missed-day count.',
    redline: null
  },
  {
    id: 'cc-allow-03',
    lang: 'en',
    scene: 'return-greeting',
    category: 'allow-neighbor',
    expect: 'allow',
    utterance: 'You came back.',
    direction: 'Same as a ledger-free return line.',
    redline: null
  },
  {
    id: 'cc-allow-04',
    lang: 'en',
    scene: 'session-end',
    category: 'allow-neighbor',
    expect: 'allow',
    utterance: 'About 12 minutes this sitting.',
    direction: 'Practice-fact duration is not a person-score.',
    redline: null
  },
  {
    id: 'cc-allow-05',
    lang: 'en',
    scene: 'return-greeting',
    category: 'allow-neighbor',
    expect: 'allow',
    utterance: 'You returned',
    direction: 'Keep the growth-journey return wording without absence math.',
    redline: null
  },
  {
    id: 'cc-allow-06',
    lang: 'ja',
    scene: 'return-greeting',
    category: 'allow-neighbor',
    expect: 'allow',
    utterance: 'おかえり。',
    direction: '欠席の勘定を付けない帰り挨拶。',
    redline: null
  },
  {
    id: 'cc-allow-07',
    lang: 'en',
    scene: 'practice-days-ring',
    category: 'allow-neighbor',
    expect: 'allow',
    utterance: 'Recent days you practiced — one lit dot per day, not per session.',
    direction: 'HUD hover for the recent-days ring is practice fact, not a C-02 score.',
    redline: null
  },
  {
    id: 'cc-allow-08',
    lang: 'en',
    scene: 'session-end',
    category: 'allow-neighbor',
    expect: 'allow',
    utterance: 'This week: three days with a sit, about 25 minutes on the last one.',
    direction: 'Minutes and practice-day counts stay facts. They are not a person-score.',
    redline: null
  },
  {
    id: 'cc-allow-09',
    lang: 'en',
    scene: 'focus-chip',
    category: 'allow-neighbor',
    expect: 'allow',
    utterance: 'Same as last time.',
    direction: 'T59 duration echo is allowed; do not stack “Yin understands you” on top.',
    redline: null
  },
  {
    id: 'cc-allow-10',
    lang: 'en',
    scene: 'wellness-disclaimer',
    category: 'allow-neighbor',
    expect: 'allow',
    utterance:
      'We can practice together. No rush, no judgment. Yin is a practice companion, not a zen master.',
    direction: 'T64 aligned copy; allowed co-practice + disclaimer without C-11 oversell.',
    redline: null
  }
]);
