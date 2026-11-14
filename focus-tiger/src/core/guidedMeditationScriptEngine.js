/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** Extra wait after estimated speak duration before forcing the next sentence. */
export const GUIDED_MEDITATION_TTS_TIMEOUT_PAD_MS = 8000;

/** ~120 words/minute → 500ms per word. */
export const GUIDED_MEDITATION_SPEAK_MS_PER_WORD = 500;

/**
 * @param {string} text
 * @returns {number}
 */
export function estimateSpeakMs(text) {
  const words = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1500, words * GUIDED_MEDITATION_SPEAK_MS_PER_WORD);
}

/**
 * @param {object} opts
 * @param {import('./guidedMeditationScriptCatalog.js').GuidedMeditationScriptLesson} opts.lesson
 * @param {number} [opts.pauseMultiplier]
 * @param {boolean} [opts.voiceEnabled]
 * @param {() => number} [opts.now]
 * @param {(text: string, hooks: { onFinished: () => void }) => boolean} [opts.speak]
 * @param {() => void} [opts.stopSpeak]
 * @param {(snap: object) => void} [opts.onState]
 * @param {typeof setTimeout} [opts.setTimeoutFn]
 * @param {typeof clearTimeout} [opts.clearTimeoutFn]
 * @param {number} [opts.timeoutPadMs]
 */
export function createGuidedMeditationScriptEngine(opts) {
  const lesson = opts.lesson;
  const pauseMultiplier =
    Number.isFinite(opts.pauseMultiplier) && opts.pauseMultiplier > 0
      ? opts.pauseMultiplier
      : 1;
  let voiceEnabled = opts.voiceEnabled !== false;
  const now = typeof opts.now === 'function' ? opts.now : () => Date.now();
  const speak = opts.speak;
  const stopSpeak = opts.stopSpeak;
  const onState = opts.onState;
  const setTimeoutFn =
    typeof opts.setTimeoutFn === 'function' ? opts.setTimeoutFn : setTimeout;
  const clearTimeoutFn =
    typeof opts.clearTimeoutFn === 'function' ? opts.clearTimeoutFn : clearTimeout;
  const timeoutPadMs = Number.isFinite(opts.timeoutPadMs)
    ? opts.timeoutPadMs
    : GUIDED_MEDITATION_TTS_TIMEOUT_PAD_MS;

  let phase = 'idle';
  let stepIndex = 0;
  let sentenceIndex = 0;
  let effectiveMs = 0;
  let segmentStartedAt = 0;
  let silenceRemainingMs = 0;
  let speakTimeoutId = null;
  let silenceTimeoutId = null;
  let generation = 0;
  let pausedFrom = null;
  let timedOutSpeak = false;

  function currentSentence() {
    const step = lesson.steps[stepIndex];
    return step?.sentences[sentenceIndex] || '';
  }

  function snapshot() {
    const step = lesson.steps[stepIndex] || null;
    return {
      phase,
      stepIndex,
      sentenceIndex,
      sentence: currentSentence(),
      stepId: step?.id || null,
      effectiveSec: effectiveMs / 1000,
      voiceEnabled,
      timedOutSpeak,
      completed: phase === 'done'
    };
  }

  function emit() {
    onState?.(snapshot());
  }

  function addElapsed() {
    if (phase !== 'speaking' && phase !== 'silence') return;
    const t = now();
    effectiveMs += Math.max(0, t - segmentStartedAt);
    segmentStartedAt = t;
  }

  function clearTimers() {
    if (speakTimeoutId != null) clearTimeoutFn(speakTimeoutId);
    if (silenceTimeoutId != null) clearTimeoutFn(silenceTimeoutId);
    speakTimeoutId = null;
    silenceTimeoutId = null;
  }

  function finishSpeakOnce(gen) {
    if (gen !== generation) return;
    generation += 1;
    clearTimers();
    addElapsed();
    const step = lesson.steps[stepIndex];
    const nextSentence = sentenceIndex + 1;
    if (step && nextSentence < step.sentences.length) {
      sentenceIndex = nextSentence;
      beginSentence();
      return;
    }
    beginSilence();
  }

  function beginSentence() {
    const text = currentSentence();
    phase = 'speaking';
    segmentStartedAt = now();
    emit();
    const gen = generation;
    const timeoutMs = estimateSpeakMs(text) + timeoutPadMs;

    const onFinished = () => finishSpeakOnce(gen);

    if (!voiceEnabled || typeof speak !== 'function') {
      speakTimeoutId = setTimeoutFn(onFinished, 0);
      return;
    }

    const dispatched = speak(text, { onFinished });
    speakTimeoutId = setTimeoutFn(() => {
      if (gen !== generation) return;
      timedOutSpeak = true;
      stopSpeak?.();
      finishSpeakOnce(gen);
    }, timeoutMs);
    if (!dispatched) {
      clearTimeoutFn(speakTimeoutId);
      speakTimeoutId = setTimeoutFn(onFinished, 0);
    }
  }

  function beginSilence() {
    const step = lesson.steps[stepIndex];
    const pauseMs =
      Math.max(0, Number(step?.pauseSec) || 0) * 1000 * pauseMultiplier;
    phase = 'silence';
    silenceRemainingMs = pauseMs;
    segmentStartedAt = now();
    emit();
    if (pauseMs <= 0) {
      advanceStep();
      return;
    }
    const gen = generation;
    silenceTimeoutId = setTimeoutFn(() => {
      if (gen !== generation) return;
      generation += 1;
      addElapsed();
      advanceStep();
    }, pauseMs);
  }

  function advanceStep() {
    const next = stepIndex + 1;
    if (next >= lesson.steps.length) {
      phase = 'done';
      emit();
      return;
    }
    stepIndex = next;
    sentenceIndex = 0;
    beginSentence();
  }

  return {
    start() {
      if (phase !== 'idle' && phase !== 'aborted' && phase !== 'done') return;
      stopSpeak?.();
      clearTimers();
      generation += 1;
      stepIndex = 0;
      sentenceIndex = 0;
      effectiveMs = 0;
      timedOutSpeak = false;
      pausedFrom = null;
      beginSentence();
    },
    pause() {
      if (phase !== 'speaking' && phase !== 'silence') return;
      addElapsed();
      pausedFrom = phase;
      if (phase === 'silence') {
        silenceRemainingMs = Math.max(
          0,
          silenceRemainingMs - (now() - segmentStartedAt)
        );
      }
      stopSpeak?.();
      clearTimers();
      generation += 1;
      phase = 'paused';
      emit();
    },
    resume() {
      if (phase !== 'paused') return;
      if (pausedFrom === 'silence') {
        phase = 'silence';
        segmentStartedAt = now();
        emit();
        const gen = generation;
        silenceTimeoutId = setTimeoutFn(() => {
          if (gen !== generation) return;
          generation += 1;
          addElapsed();
          advanceStep();
        }, silenceRemainingMs);
        return;
      }
      beginSentence();
    },
    skip(delta) {
      const shift = Number(delta) || 0;
      if (!shift) return;
      if (phase === 'speaking' || phase === 'silence') addElapsed();
      stopSpeak?.();
      clearTimers();
      generation += 1;
      const next = stepIndex + shift;
      if (shift > 0 && next >= lesson.steps.length) {
        phase = 'done';
        emit();
        return;
      }
      stepIndex = Math.max(0, Math.min(lesson.steps.length - 1, next));
      sentenceIndex = 0;
      beginSentence();
    },
    abort() {
      if (phase === 'speaking' || phase === 'silence') addElapsed();
      stopSpeak?.();
      clearTimers();
      generation += 1;
      phase = 'aborted';
      emit();
    },
    setVoiceEnabled(next) {
      voiceEnabled = Boolean(next);
      if (!voiceEnabled) stopSpeak?.();
    },
    getSnapshot: snapshot
  };
}
