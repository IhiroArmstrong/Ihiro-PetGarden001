/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Isolation corpus (failed archive): hold | invite_sit | unclear.
 * Lab + unit tests only. Not a live classifier. PO 2026-11-19: unclear cancelled;
 * crisis stays on the live safety layer; hold vs invite_sit are not vector classes.
 * Crisis class uses live CONFIDE_SEMANTIC_CRISIS_PROTOTYPES (not listed here).
 * Smoke / lab stdout must use ids, not these strings.
 */

/** @typedef {{ id: string, domain: string, calibration: string[], paraphrase: string[] }} NoticingOneLineIsolationClassFixture */

/** @type {NoticingOneLineIsolationClassFixture[]} */
export const NOTICING_ONE_LINE_ISOLATION_FIXTURES = Object.freeze([
  {
    id: 'hold',
    domain: 'noticing-acceptance',
    calibration: [
      'a thought passed and i just noticed it',
      'this feeling is here and i can let it be',
      'i name the tightness without pushing it away',
      'one spark of worry, then i return to sitting still',
      'the koan sits in the chest; i only watch it',
      'attention rests on the breath without a next plan',
      'i accept this restless hour as it is',
      'a public case about emptiness, held quietly'
    ],
    paraphrase: [
      'i notice the thought and leave it unnamed',
      'this mood can stay; i do not fix it',
      'focus returns to the body, nothing more',
      'the riddle remains; i only keep it company'
    ]
  },
  {
    id: 'invite_sit',
    domain: 'focus-koan',
    calibration: [
      'maybe sit for a minute with this',
      'shall we take one short sit together',
      'a little sitting might help this settle',
      'come back to the cushion for one round',
      'pause the koan and sit before answering',
      'want to sit until the breath slows',
      'one incense stick of sitting, if you like',
      'leave the riddle; sit first, then see'
    ],
    paraphrase: [
      'would you sit with this for a short while',
      'a brief sit could hold what just arose',
      'return to the seat before chasing the thought',
      'sit once, then meet the public case again'
    ]
  },
  {
    id: 'unclear',
    domain: 'mixed-gray',
    calibration: [
      'i cannot tell if this is a thought or a plan',
      'not sure whether to name it or just sit',
      'something is here, but the word will not come',
      'focus and feeling are tangled; i do not know which',
      'the koan and the worry feel like the same knot',
      'maybe noticing, maybe i should get up; unclear',
      'this might be acceptance or just being stuck',
      'i lose the thread between sit and story'
    ],
    paraphrase: [
      'i do not know what this is yet',
      'cannot split the thought from the urge to sit',
      'the label will not land',
      'mixed: notice, sit, or leave it unnamed'
    ]
  }
]);

export const NOTICING_ONE_LINE_ISOLATION_CLASS_IDS = Object.freeze([
  'hold',
  'invite_sit',
  'unclear',
  'crisis'
]);
