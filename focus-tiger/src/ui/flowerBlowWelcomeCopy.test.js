import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FLOWER_BLOW_WELCOME_COPY_KEYS,
  pickFlowerBlowWelcomeCopyKey,
  resolveFlowerBlowWelcomeMessage,
  splitFlowerBlowBubbleSentences
} from './flowerBlowWelcomeCopy.js';

const DICT = {
  en: {
    FLOWER_BLOW_WELCOME_1: 'EN1',
    FLOWER_BLOW_WELCOME_2: 'EN2',
    FLOWER_BLOW_WELCOME_3: 'EN3'
  },
  ja: {
    FLOWER_BLOW_WELCOME_1: 'JA1',
    FLOWER_BLOW_WELCOME_2: 'JA2',
    FLOWER_BLOW_WELCOME_3: 'JA3'
  }
};

function tInLocale(locale, key) {
  return DICT[locale]?.[key] || key;
}

describe('flowerBlowWelcomeCopy', () => {
  it('picks within the observer B pool', () => {
    assert.equal(FLOWER_BLOW_WELCOME_COPY_KEYS.length, 3);
    assert.equal(pickFlowerBlowWelcomeCopyKey(() => 0), 'FLOWER_BLOW_WELCOME_1');
    assert.equal(pickFlowerBlowWelcomeCopyKey(() => 0.99), 'FLOWER_BLOW_WELCOME_3');
  });

  it('bilingual: current locale is primary, other is secondary (en)', () => {
    const msg = resolveFlowerBlowWelcomeMessage({
      bilingual: true,
      locale: 'en',
      copyKey: 'FLOWER_BLOW_WELCOME_2',
      tInLocale
    });
    assert.equal(msg.bilingual, true);
    assert.equal(msg.primaryLocale, 'en');
    assert.deepEqual(msg.lines, [
      { text: 'EN2', role: 'primary' },
      { text: 'JA2', role: 'secondary' }
    ]);
  });

  it('bilingual: current locale is primary, other is secondary (ja)', () => {
    const msg = resolveFlowerBlowWelcomeMessage({
      bilingual: true,
      locale: 'ja',
      copyKey: 'FLOWER_BLOW_WELCOME_2',
      tInLocale
    });
    assert.equal(msg.primaryLocale, 'ja');
    assert.deepEqual(msg.lines, [
      { text: 'JA2', role: 'primary' },
      { text: 'EN2', role: 'secondary' }
    ]);
  });

  it('follows locale when not bilingual', () => {
    const en = resolveFlowerBlowWelcomeMessage({
      bilingual: false,
      locale: 'en',
      copyKey: 'FLOWER_BLOW_WELCOME_1',
      tInLocale
    });
    assert.deepEqual(en.lines, [{ text: 'EN1', role: 'primary' }]);
    const ja = resolveFlowerBlowWelcomeMessage({
      bilingual: false,
      locale: 'ja',
      copyKey: 'FLOWER_BLOW_WELCOME_1',
      tInLocale
    });
    assert.deepEqual(ja.lines, [{ text: 'JA1', role: 'primary' }]);
  });

  it('splits bubble copy after each sentence (EN / JA)', () => {
    assert.deepEqual(
      splitFlowerBlowBubbleSentences(
        'Welcome back. Your mind deserves this moment of quiet.'
      ),
      ['Welcome back.', 'Your mind deserves this moment of quiet.']
    );
    assert.deepEqual(
      splitFlowerBlowBubbleSentences(
        '急がなくていい。飾らなくていい。ただ、ここにいるだけで。'
      ),
      ['急がなくていい。', '飾らなくていい。', 'ただ、ここにいるだけで。']
    );
    assert.deepEqual(
      splitFlowerBlowBubbleSentences(
        'Whatever kind of day it is, Yin is right here with you.'
      ),
      ['Whatever kind of day it is, Yin is right here with you.']
    );
  });
});
