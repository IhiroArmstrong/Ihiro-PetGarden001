/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { matchesSafetyRedirect } from './confideSafetyKeywords.js';
import { confideClassify } from './confideClassify.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';

/**
 * Explicit crisis statements. Nothing in this file may make one of these stop
 * routing — the narrowing guards exist to cut false positives only.
 */
const MUST_ROUTE = Object.freeze([
  'I want to kill myself',
  'I am killing myself tonight',
  'I want to end my life',
  'I want to die',
  'I wanna die',
  "I don't want to live",
  'I do not want to live',
  'I am going to hurt myself',
  'thinking about suicide',
  'ending it all',
  '我想自杀',
  '我不想活了',
  '我要结束生命',
  '我想自残',
  '死にたい',
  'もう生きたくない'
]);

describe('confide safety keyword matching', () => {
  it('still routes every explicit crisis statement', () => {
    for (const text of MUST_ROUTE) {
      assert.equal(matchesSafetyRedirect(text), true, `must route: ${text}`);
    }
  });

  it('keeps negation-shaped real crisis phrasings routing (PO red case)', () => {
    // The negation guard must not reach these. The negation is *inside* the
    // crisis phrase, not applied to it: 「不想活」 means "do not want to live",
    // which is the crisis, not a denial of one.
    assert.equal(matchesSafetyRedirect('我不想活了'), true);
    assert.equal(matchesSafetyRedirect('不想活了'), true);
    assert.equal(matchesSafetyRedirect("I don't want to live"), true);
    assert.equal(matchesSafetyRedirect('I do not want to live anymore'), true);
    assert.equal(matchesSafetyRedirect('生きたくない'), true);
    assert.equal(confideClassify('我不想活了'), CONFIDE_ROUTE.SAFETY_REDIRECT);
    assert.equal(confideClassify("I don't want to live"), CONFIDE_ROUTE.SAFETY_REDIRECT);
  });

  it('does not fire on word fragments (word boundary)', () => {
    assert.equal(matchesSafetyRedirect('I finally found some self harmony today'), false);
    assert.equal(matchesSafetyRedirect('self harmonization workshop'), false);
  });

  it('does not fire when the crisis word is the topic, not the speaker', () => {
    assert.equal(
      matchesSafetyRedirect('I read an article about suicide prevention today'),
      false
    );
    assert.equal(matchesSafetyRedirect('she works for a suicide hotline'), false);
    assert.equal(matchesSafetyRedirect('a self-harm awareness campaign'), false);
    assert.equal(matchesSafetyRedirect('看了一篇自杀预防的科普'), false);
  });

  it('still routes when a real statement sits next to topic talk', () => {
    assert.equal(
      matchesSafetyRedirect('I read about suicide prevention and I want to die'),
      true
    );
    assert.equal(
      matchesSafetyRedirect('she works for a suicide hotline but I want to kill myself'),
      true
    );
  });

  it('does not fire on negated intent', () => {
    assert.equal(matchesSafetyRedirect("I don't want to hurt myself"), false);
    assert.equal(matchesSafetyRedirect('I would never hurt myself'), false);
    assert.equal(matchesSafetyRedirect("I don't want to die"), false);
  });

  it('only excuses negation that is immediately adjacent', () => {
    // "don't" is present but attached to something else — still a crisis.
    assert.equal(matchesSafetyRedirect("I don't know if I want to die"), true);
    assert.equal(matchesSafetyRedirect("I don't care anymore, I want to die"), true);
    assert.equal(matchesSafetyRedirect("I never told anyone I want to kill myself"), true);
  });

  it('leaves CJK phrasings out of the negation guard', () => {
    // Chinese/Japanese negation is not handled; documented limitation. These
    // must keep routing rather than silently slip through a half-built guard.
    assert.equal(matchesSafetyRedirect('我不会想伤害自己'), true);
    assert.equal(matchesSafetyRedirect('我绝不会自残'), true);
  });
});
