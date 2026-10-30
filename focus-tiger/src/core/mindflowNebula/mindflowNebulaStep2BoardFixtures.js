/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Phase A calibration corpus (koan-adjacent imagery · not user data).
 * Lab + unit tests only; smoke output must use ids / aggregates, not these strings.
 */

/** @typedef {{ id: string, calibration: string[], paraphrase: string[] }} MindflowNebulaStep2BoardFixture */

/** @type {MindflowNebulaStep2BoardFixture[]} */
export const MINDFLOW_NEBULA_STEP2_BOARD_FIXTURES = Object.freeze([
  {
    id: 'mist-ridge',
    calibration: [
      'clouds fold over a distant ridge',
      'mist hangs on the mountain spine',
      'a peak disappears into gray air',
      'far summits drift in and out of view',
      'valley fog climbs the hillside slowly',
      'rain cloud rests on the high pass',
      'the ridge line is a soft charcoal stroke',
      'mountain shoulders vanish in haze'
    ],
    paraphrase: [
      'haze covers the high ridge today',
      'the summit hides inside the mist',
      'clouds swallow the mountain crest',
      'only a faint ridge remains visible'
    ]
  },
  {
    id: 'still-pool',
    calibration: [
      'a pond holds the sky without ripples',
      'rain rings spread and fade on water',
      'one stone settles beneath clear surface',
      'the pool mirrors a single branch',
      'still water catches a passing cloud',
      'a leaf floats on quiet green depth',
      'shallow ripples dissolve into glass',
      'the well reflects moonlight evenly'
    ],
    paraphrase: [
      'the water stays flat like a mirror',
      'tiny circles widen then disappear',
      'a smooth pond copies the sky',
      'the surface rests without a wrinkle'
    ]
  },
  {
    id: 'empty-bowl',
    calibration: [
      'an empty bowl waits on the table',
      'bare clay catches afternoon light',
      'silence sits inside the rounded rim',
      'a hollow vessel holds only air',
      'the cup shows its unmarked interior',
      'nothing fills the glazed circle yet',
      'a simple bowl rests between hands',
      'open space inside fired earth'
    ],
    paraphrase: [
      'the bowl is unfilled and quiet',
      'only light lives in the empty cup',
      'a vacant vessel on plain wood',
      'the rim circles an absence gently'
    ]
  },
  {
    id: 'night-pine',
    calibration: [
      'pine needles whisper in night wind',
      'a lamp glows beside dark branches',
      'moonlight stripes the garden path',
      'wind moves through needles like breath',
      'a single lantern steadies the dark',
      'shadows of pine cross the window',
      'cool air carries resin and stone',
      'the night garden exhales slowly'
    ],
    paraphrase: [
      'wind threads through the pine at night',
      'a small light anchors the dark trees',
      'moon washes the path between pines',
      'needles rustle in the late breeze'
    ]
  }
]);

/** @type {string[]} */
export const MINDFLOW_NEBULA_STEP2_NEGATIVE_FIXTURES = Object.freeze([
  'invoice subtotal freight random hex',
  'toggle widget database shard purple',
  'keyboard firmware checksum Tuesday',
  'synthetic polymer batch nine alpha',
  'unrelated socket latency banana chart',
  'orphan index migration zebra quota',
  'paperclip inventory delta orange',
  'quantum spreadsheet noodle protocol'
]);
