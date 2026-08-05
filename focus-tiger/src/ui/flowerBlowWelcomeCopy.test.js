import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FLOWER_BLOW_WELCOME_COPY_KEYS,
  pickFlowerBlowWelcomeCopyKey,
  resolveFlowerBlowWelcomeMessage
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

  it('stacks EN then JA when bilingual', () => {
    const msg = resolveFlowerBlowWelcomeMessage({
      bilingual: true,
      copyKey: 'FLOWER_BLOW_WELCOME_2',
      tInLocale
    });
    assert.deepEqual(msg.lines, ['EN2', 'JA2']);
    assert.equal(msg.bilingual, true);
  });

  it('follows locale when not bilingual', () => {
    const en = resolveFlowerBlowWelcomeMessage({
      bilingual: false,
      locale: 'en',
      copyKey: 'FLOWER_BLOW_WELCOME_1',
      tInLocale
    });
    assert.deepEqual(en.lines, ['EN1']);
    const ja = resolveFlowerBlowWelcomeMessage({
      bilingual: false,
      locale: 'ja',
      copyKey: 'FLOWER_BLOW_WELCOME_1',
      tInLocale
    });
    assert.deepEqual(ja.lines, ['JA1']);
  });
});
