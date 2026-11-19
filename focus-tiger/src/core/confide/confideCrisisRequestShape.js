/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T100 knife 1 · English speech-act check on the current send only.
 * Not a paraphrase list of the round-3 items. Hits when this line asks
 * Yin to endorse the speaker's own leaving or dying, or to ghostwrite
 * that farewell. Ordinary endings stay off this path.
 */

const CJK_OR_KANA = /[\u3040-\u30ff\u4e00-\u9fff]/;

const ORDINARY_ENDING =
  /\b(subscription|unsubscribe|membership|colleague|coworker|co-worker|resign|resignation|retirement|retiring|eulogy|funeral|dentist|dental)\b|\b(leaving|left) the (job|company|office)\b|\bquit(?:ting)? (?:my |the )?job\b|\b(?:end|ending) (?:this |the |our )?(?:relationship|marriage)\b|\b(?:break up|breakup|divorce)\b|\bpassed away\b|\bwho died\b/;

const ENDORSEMENT_ASK =
  /\b(?:agree that|agree with me that|say (?:that )?it(?:'s| is) okay|tell me (?:that )?it(?:'s| is) okay|give me (?:one |a )?reason)\b/;

const SELF_EXIT =
  /\b(?:kill myself|killing myself|end my life|ending my life|take my own life|suicide|suicidal|want to die|wanting to die|wanted to die|don't want to live|do not want to live|not want to live|leave this world|leave this life|stop living|stop trying to live)\b/;

const WANT_TO_LEAVE = /\b(?:want to leave|wanting to leave)\b/;

const MUNDANE_LEAVE =
  /\b(?:want to leave|wanting to leave)\s+(?:the|my|this|our)\s+(?:company|job|office|meeting|city|town|country|house|home|room)\b/;

const FAREWELL_ASK =
  /\b(?:write|draft|compose)\b[\s\S]{0,48}\b(?:farewell|goodbye|good-bye|suicide note)\b|\b(?:farewell|goodbye|good-bye|suicide note)\b[\s\S]{0,48}\b(?:write|draft|compose)\b/;

const OWN_FAREWELL =
  /\b(?:suicide note|my final farewell|my last goodbye|final farewell|last goodbye)\b/;

/**
 * @param {string} text
 * @returns {string}
 */
function normalize(text) {
  return String(text || '')
    .replace(/\u2019/g, "'")
    .toLowerCase();
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function matchesEnglishCrisisEndorsementOrFarewell(text) {
  const raw = typeof text === 'string' ? text : '';
  if (!raw.trim()) return false;
  if (CJK_OR_KANA.test(raw)) return false;
  const line = normalize(raw);
  const selfExit = SELF_EXIT.test(line);
  if (ORDINARY_ENDING.test(line) && !selfExit) return false;
  const endorsesLeaving =
    WANT_TO_LEAVE.test(line) && !MUNDANE_LEAVE.test(line);
  if (ENDORSEMENT_ASK.test(line) && (selfExit || endorsesLeaving)) return true;
  if (FAREWELL_ASK.test(line) && (OWN_FAREWELL.test(line) || selfExit)) {
    return true;
  }
  return false;
}
