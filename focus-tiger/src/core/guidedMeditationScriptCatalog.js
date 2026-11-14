/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Script-driven guided meditation catalog (P1).
 * English sentences are the runtime SSOT; video lessons stay in
 * guidedMeditationLessons.js and are not listed here.
 */

const EYES_PERMISSION =
  'If you feel comfortable, softly close your eyes; if you prefer to keep them open, simply lower your gaze toward the floor ahead.';

/**
 * @typedef {object} GuidedMeditationScriptStep
 * @property {string} id
 * @property {readonly string[]} sentences
 * @property {number} pauseSec
 *
 * @typedef {object} GuidedMeditationScriptLesson
 * @property {string} id
 * @property {'script'} delivery
 * @property {readonly string[]} locales
 * @property {string} titleKey
 * @property {string} blurbKey
 * @property {number} nominalMinutes
 * @property {readonly GuidedMeditationScriptStep[]} steps
 */

/** @type {readonly GuidedMeditationScriptLesson[]} */
export const GUIDED_MEDITATION_SCRIPT_LESSONS = Object.freeze([
  Object.freeze({
    id: 'breath-anchor-beginner',
    delivery: 'script',
    locales: Object.freeze(['en']),
    titleKey: 'GUIDED_MEDITATION_SCRIPT_BREATH_TITLE',
    blurbKey: 'GUIDED_MEDITATION_SCRIPT_BREATH_BLURB',
    nominalMinutes: 3,
    steps: Object.freeze([
      Object.freeze({
        id: 'settle',
        pauseSec: 5,
        sentences: Object.freeze([
          'Find a comfortable, stable position to sit. Keep your back naturally straight without being rigid. Let your shoulders drop, and rest your hands gently on your knees or thighs.',
          EYES_PERMISSION
        ])
      }),
      Object.freeze({
        id: 'notice-breath',
        pauseSec: 15,
        sentences: Object.freeze([
          'Now, gently bring your attention to your breath. There is no need to force or change its rhythm—simply observe it. Notice the coolness of the air entering through your nostrils as you inhale, and the warmth as you slowly exhale.'
        ])
      }),
      Object.freeze({
        id: 'anchor',
        pauseSec: 20,
        sentences: Object.freeze([
          'With every inhale, imagine bringing fresh, clear energy into your body; with every exhale, feel your body softening. If your mind wanders along the way, that is completely normal. Gently and kindly guide your attention back to your breath.'
        ])
      }),
      Object.freeze({
        id: 'return',
        pauseSec: 0,
        sentences: Object.freeze([
          'Wonderful. Carrying this quiet sense of stillness with you, slowly bring your awareness back to the room around you. Gently wiggle your fingers and toes, and whenever you feel ready, softly open your eyes to complete this brief practice.'
        ])
      })
    ])
  }),
  Object.freeze({
    id: 'body-scan-relaxation',
    delivery: 'script',
    locales: Object.freeze(['en']),
    titleKey: 'GUIDED_MEDITATION_SCRIPT_BODY_TITLE',
    blurbKey: 'GUIDED_MEDITATION_SCRIPT_BODY_BLURB',
    nominalMinutes: 5,
    steps: Object.freeze([
      Object.freeze({
        id: 'grounding',
        pauseSec: 10,
        sentences: Object.freeze([
          'Sit or lie down in a comfortable position.',
          EYES_PERMISSION,
          'Let’s take three deep breaths together: inhale deeply, letting your belly and chest expand... and exhale slowly and completely, letting any physical tension melt away with your breath.'
        ])
      }),
      Object.freeze({
        id: 'head-face',
        pauseSec: 15,
        sentences: Object.freeze([
          'Bring your awareness to the crown of your head, feeling your scalp soften. Unclench your jaw, relax the muscles in your face, smooth out your brow, and let your shoulders drop naturally, releasing all weight and guard.'
        ])
      }),
      Object.freeze({
        id: 'torso-limbs',
        pauseSec: 20,
        sentences: Object.freeze([
          'Guide your attention down through your neck into your chest and abdomen, noticing the gentle rise and fall with each breath. Next, feel your arms, hands, legs, and all the way down to the soles of your feet. Imagine your feet resting solidly on the ground, your entire body safely supported by the earth.'
        ])
      }),
      Object.freeze({
        id: 'whole-body',
        pauseSec: 20,
        sentences: Object.freeze([
          'In this present moment, allow your body to rest completely. There is nothing you need to do, and nowhere you need to go.'
        ])
      }),
      Object.freeze({
        id: 'close',
        pauseSec: 0,
        sentences: Object.freeze([
          'Holding onto this sense of lightness and ease, take a moment to notice how you feel right now. When you are ready, take one deep breath in, and slowly open your eyes.'
        ])
      })
    ])
  }),
  Object.freeze({
    id: 'thoughts-letting-go',
    delivery: 'script',
    locales: Object.freeze(['en']),
    titleKey: 'GUIDED_MEDITATION_SCRIPT_THOUGHTS_TITLE',
    blurbKey: 'GUIDED_MEDITATION_SCRIPT_THOUGHTS_BLURB',
    nominalMinutes: 6,
    steps: Object.freeze([
      Object.freeze({
        id: 'inner-space',
        pauseSec: 5,
        sentences: Object.freeze([
          'Take a few seconds to settle into a comfortable posture. Place your hands gently on your lap or over your heart, feeling the physical contact between your body and the surface beneath you.',
          EYES_PERMISSION
        ])
      }),
      Object.freeze({
        id: 'observe-thoughts',
        pauseSec: 15,
        sentences: Object.freeze([
          'Once you settle, you may notice thoughts, to-do lists, or random memories drifting through your mind like clouds. That’s okay—thinking is simply what the mind does. When it happens, don’t judge yourself; just silently acknowledge it by saying, “Ah, I notice I am thinking.”'
        ])
      }),
      Object.freeze({
        id: 'watch-scenery',
        pauseSec: 20,
        sentences: Object.freeze([
          'Imagine these thoughts as clouds passing across the sky, or leaves floating down a stream. You are simply standing on the bank, quietly watching them come and go without getting swept away.'
        ])
      }),
      Object.freeze({
        id: 'return-present',
        pauseSec: 20,
        sentences: Object.freeze([
          'Whenever you realize your mind has wandered off with a thought, gently invite it back to the rhythm of your breathing right here, right now. Each time you notice and return, you are quietly training your focus.'
        ])
      }),
      Object.freeze({
        id: 'complete',
        pauseSec: 0,
        sentences: Object.freeze([
          'Carrying this calm awareness and acceptance with you, slowly transition back to your surroundings. Move your body gently, and step into the rest of your day with a quiet smile.'
        ])
      })
    ])
  })
]);

/**
 * Menu + playback gate for script lessons: catalog non-empty.
 * Does not depend on R2 SHA / media host.
 * @returns {boolean}
 */
export function isGuidedMeditationAvailable() {
  return GUIDED_MEDITATION_SCRIPT_LESSONS.length > 0;
}

/**
 * @param {string} id
 * @returns {GuidedMeditationScriptLesson | null}
 */
export function findGuidedMeditationScriptLesson(id) {
  return GUIDED_MEDITATION_SCRIPT_LESSONS.find((row) => row.id === id) || null;
}
