/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

// Tiger Reflection Moment 的纯逻辑状态机：逐题推进、每题独立可跳、
// 空白输入不计入答案。与 DOM / i18n 解耦，便于单元测试。

export const REFLECTION_QUESTION_KEYS = Object.freeze([
  'REFLECTION_Q1',
  'REFLECTION_Q2',
  'REFLECTION_Q3'
]);

export const REFLECTION_ANSWER_FIELDS = Object.freeze([
  'notice',
  'emotion',
  'nextFocus'
]);

export class ReflectionFlowState {
  constructor(questionCount = REFLECTION_QUESTION_KEYS.length) {
    this.questionCount = questionCount;
    this.stepIndex = 0;
    /** @type {(string | null)[]} */
    this.answers = new Array(questionCount).fill(null);
  }

  /** @param {string} [rawAnswer] */
  submit(rawAnswer = '') {
    if (this.isDone()) return;
    const trimmed = typeof rawAnswer === 'string' ? rawAnswer.trim() : '';
    this.answers[this.stepIndex] = trimmed || null;
    this.stepIndex += 1;
  }

  skip() {
    if (this.isDone()) return;
    this.answers[this.stepIndex] = null;
    this.stepIndex += 1;
  }

  /** 关闭面板等价于跳过剩余所有问题，已答内容保留。 */
  abandonRest() {
    this.stepIndex = this.questionCount;
  }

  isDone() {
    return this.stepIndex >= this.questionCount;
  }

  hasAnyAnswer() {
    return this.answers.some((answer) => answer !== null);
  }

  /** @returns {Record<string, string>} 只包含非空答案的字段 */
  getResult() {
    const result = {};
    REFLECTION_ANSWER_FIELDS.forEach((field, i) => {
      if (this.answers[i]) result[field] = this.answers[i];
    });
    return result;
  }
}
