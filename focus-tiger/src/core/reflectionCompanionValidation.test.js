/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canOfferReflectionCompanionValidation,
  formatReflectionCompanionAnswers,
  isReflectionCompanionLabEnabled,
  reflectionAnswersHaveContent,
  reflectionCompanionGenerateReady
} from './reflectionCompanionValidation.js';

describe('reflectionCompanionValidation', () => {
  it('lab flag requires ?reflectionCompanion=1', () => {
    assert.equal(isReflectionCompanionLabEnabled(''), false);
    assert.equal(isReflectionCompanionLabEnabled('?product=1'), false);
    assert.equal(isReflectionCompanionLabEnabled('?reflectionCompanion=1'), true);
  });

  it('formatReflectionCompanionAnswers keeps only non-empty fields', () => {
    const text = formatReflectionCompanionAnswers({
      notice: 'wind',
      emotion: '',
      nextFocus: 'breath'
    });
    assert.match(text, /notice: wind/);
    assert.match(text, /nextFocus: breath/);
    assert.doesNotMatch(text, /emotion:/);
  });

  it('reflectionAnswersHaveContent detects any answer', () => {
    assert.equal(reflectionAnswersHaveContent({}), false);
    assert.equal(reflectionAnswersHaveContent({ emotion: 'tired' }), true);
  });

  it('canOfferReflectionCompanionValidation needs lab flag and wide desktop bridge', () => {
    const globalObj = {
      desktopShell: {
        isDesktop: true,
        companion: { generate: () => {} }
      },
      innerWidth: 800
    };
    assert.equal(
      canOfferReflectionCompanionValidation(
        { search: '?reflectionCompanion=1', widthPx: 800 },
        globalObj
      ),
      true
    );
    assert.equal(
      canOfferReflectionCompanionValidation(
        { search: '?product=1', widthPx: 800 },
        globalObj
      ),
      false
    );
    assert.equal(
      canOfferReflectionCompanionValidation(
        { search: '?reflectionCompanion=1', widthPx: 400 },
        globalObj
      ),
      false
    );
  });

  it('reflectionCompanionGenerateReady requires companion ready', () => {
    const globalObj = {
      desktopShell: {
        isDesktop: true,
        companion: { generate: () => {} }
      }
    };
    assert.equal(
      reflectionCompanionGenerateReady(
        { phase: 'ready', focusing: false },
        { search: '?reflectionCompanion=1', widthPx: 800 },
        globalObj
      ),
      true
    );
    assert.equal(
      reflectionCompanionGenerateReady(
        { phase: 'loading', focusing: false },
        { search: '?reflectionCompanion=1', widthPx: 800 },
        globalObj
      ),
      false
    );
  });
});
