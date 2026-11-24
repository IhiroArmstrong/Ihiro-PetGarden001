/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Preferences Center information architecture.
 * Grouping + interaction kind live here so wide ⋯ and the narrow drawer
 * cannot drift. Presentation stays in the shells.
 */

/** @typedef {'page' | 'toggle' | 'action'} PrefCenterKind */

/**
 * @typedef {object} PrefCenterRowSpec
 * @property {string} proxy
 * @property {string} labelKey
 * @property {string} [testId]
 * @property {string} hintKey
 * @property {PrefCenterKind} kind
 * @property {string} [icon]
 */

/**
 * @typedef {object} PrefCenterSubgroupSpec
 * @property {string} labelKey
 * @property {PrefCenterRowSpec[]} rows
 */

export const PREF_CENTER_SUBGROUP_KEYS = Object.freeze([
  'PREF_CENTER_GROUP_EXPERIENCE',
  'PREF_CENTER_GROUP_PRACTICE',
  'PREF_CENTER_GROUP_SPACE',
  'PREF_CENTER_GROUP_DEVICES',
  'PREF_CENTER_GROUP_ACCOUNT'
]);

/**
 * @param {object} visibility
 * @param {{
 *   shouldOfferLanguagePicker?: () => boolean,
 *   accountRow?: PrefCenterRowSpec,
 *   membershipTestId?: string
 * }} [deps]
 * @returns {PrefCenterSubgroupSpec[]}
 */
export function listPreferenceCenterSubgroups(visibility, deps = {}) {
  const languageOk =
    typeof deps.shouldOfferLanguagePicker === 'function'
      ? deps.shouldOfferLanguagePicker()
      : true;
  const membershipTestId = deps.membershipTestId;

  return [
    {
      labelKey: 'PREF_CENTER_GROUP_EXPERIENCE',
      rows: [
        {
          proxy: 'co-practice-contract',
          labelKey: 'CO_PRACTICE_CONTRACT_MENU_LABEL',
          testId: 'idle-co-practice-contract',
          hintKey: 'PREF_CENTER_HINT_YIN_SPEAK',
          kind: 'page',
          icon: '◌'
        },
        visibility.reminderAvailable
          ? {
              proxy: 'reminder',
              labelKey: 'reminder.setting_title',
              hintKey: 'PREF_CENTER_HINT_REMINDER',
              kind: 'page',
              icon: '◷'
            }
          : null,
        visibility.workEndAvailable
          ? {
              proxy: 'work-end',
              labelKey: 'WORK_END_MENU_LABEL',
              testId: 'idle-work-end',
              hintKey: 'PREF_CENTER_HINT_WRAP_UP',
              kind: 'page',
              icon: '◔'
            }
          : null
      ].filter(Boolean)
    },
    {
      labelKey: 'PREF_CENTER_GROUP_PRACTICE',
      rows: [
        visibility.inputRhythmAvailable
          ? {
              proxy: 'input-rhythm',
              labelKey: 'INPUT_RHYTHM_MENU_LABEL',
              testId: 'idle-input-rhythm',
              hintKey: 'PREF_CENTER_HINT_FOCUS_RHYTHM',
              kind: 'page',
              icon: '◎'
            }
          : null,
        {
          proxy: 'today-direction',
          labelKey: 'TODAY_DIRECTION_MENU_LABEL',
          testId: 'idle-today-direction',
          hintKey: 'PREF_CENTER_HINT_TODAY_DIRECTION',
          kind: 'action',
          icon: '☀'
        }
      ].filter(Boolean)
    },
    {
      labelKey: 'PREF_CENTER_GROUP_SPACE',
      rows: [
        {
          proxy: 'mindflow-nebula',
          labelKey: 'MINDFLOW_NEBULA_MENU_LABEL',
          testId: 'idle-mindflow-nebula',
          hintKey: 'PREF_CENTER_HINT_MINDFLOW',
          kind: 'page',
          icon: '✧'
        },
        {
          proxy: 'presence-field',
          labelKey: 'PRESENCE_FIELD_MENU_LABEL',
          testId: 'idle-presence-field',
          hintKey: 'PREF_CENTER_HINT_PRESENCE',
          kind: 'page',
          icon: '✦'
        }
      ]
    },
    {
      labelKey: 'PREF_CENTER_GROUP_DEVICES',
      rows: [
        languageOk
          ? {
              proxy: 'language',
              labelKey: 'LANGUAGE_MENU_LABEL',
              hintKey: 'PREF_CENTER_HINT_LANGUAGE',
              kind: 'page',
              icon: '文'
            }
          : null,
        {
          proxy: 'sound',
          labelKey: 'SOUND_MENU_LABEL',
          testId: 'idle-sound',
          hintKey: 'PREF_CENTER_HINT_SOUND',
          kind: 'page',
          icon: '♪'
        },
        visibility.alwaysOnTopAvailable
          ? {
              proxy: 'always-on-top',
              labelKey: 'ALWAYS_ON_TOP_MENU_LABEL',
              testId: 'idle-always-on-top',
              hintKey: 'PREF_CENTER_HINT_KEEP_FRONT',
              kind: 'toggle',
              icon: '📌'
            }
          : null,
        visibility.windowLayoutAvailable
          ? {
              proxy: 'window-layout',
              labelKey: 'WINDOW_LAYOUT_MENU_LABEL',
              testId: 'idle-window-layout',
              hintKey: 'PREF_CENTER_HINT_WINDOW',
              kind: 'page',
              icon: '▢'
            }
          : null,
        visibility.globalSitHotkeyAvailable
          ? {
              proxy: 'global-sit-hotkey',
              labelKey: 'GLOBAL_SIT_HOTKEY_MENU_LABEL',
              testId: 'idle-global-sit-hotkey',
              hintKey: 'PREF_CENTER_HINT_GLOBAL_SIT',
              kind: 'page',
              icon: '⌘'
            }
          : null,
        {
          proxy: 'health-shortcut-log',
          labelKey: 'HEALTH_SHORTCUT_MENU_LABEL',
          testId: 'idle-health-shortcut-log',
          hintKey: 'PREF_CENTER_HINT_HEALTH',
          kind: 'page',
          icon: '♡'
        }
      ].filter(Boolean)
    },
    {
      labelKey: 'PREF_CENTER_GROUP_ACCOUNT',
      rows: [
        visibility.newsletterSubmitted
          ? {
              proxy: 'newsletter',
              labelKey: 'NEWSLETTER_MENU_CONFIRMED',
              hintKey: 'PREF_CENTER_HINT_STAY_IN_TOUCH',
              kind: 'page',
              interactive: false
            }
          : {
              proxy: 'newsletter',
              labelKey: 'NEWSLETTER_MENU_LABEL',
              hintKey: 'PREF_CENTER_HINT_STAY_IN_TOUCH',
              kind: 'action',
              icon: '✉'
            },
        deps.accountRow
          ? {
              ...deps.accountRow,
              hintKey:
                deps.accountRow.hintKey || 'PREF_CENTER_HINT_EMAIL_RESTORE',
              kind: deps.accountRow.kind || 'action',
              icon: deps.accountRow.icon || '☁'
            }
          : null,
        {
          proxy: 'help-center',
          labelKey: 'HELP_CENTER_MENU_LABEL',
          testId: 'idle-help-center',
          hintKey: 'PREF_CENTER_HINT_HELP',
          kind: 'page',
          icon: '？'
        },
        {
          proxy: 'local-backup',
          labelKey: 'LOCAL_BACKUP_MENU_LABEL',
          hintKey: 'PREF_CENTER_HINT_BACKUP',
          kind: 'page',
          icon: '▭'
        },
        {
          proxy: 'practice-study',
          labelKey: 'PRACTICE_STUDY_MENU_LABEL',
          testId: 'idle-practice-study',
          hintKey: 'PREF_CENTER_HINT_STUDY',
          kind: 'page',
          icon: '⌘'
        },
        {
          proxy: 'membership',
          labelKey: 'MENU_SUBSCRIPTION_ROW',
          testId: membershipTestId,
          hintKey: 'PREF_CENTER_HINT_SUBSCRIPTION',
          kind: 'page',
          icon: '◇'
        }
      ].filter((row) => row && typeof row === 'object')
    }
  ].filter((group) => group.rows.length > 0);
}

/**
 * Flatten subgroups into chrome entries (parent Preferences group already pushed).
 *
 * @param {PrefCenterSubgroupSpec[]} subgroups
 * @returns {Array<{ kind?: string, labelKey?: string, proxy?: string }>}
 */
export function flattenPreferenceCenterEntries(subgroups) {
  /** @type {Array<{ kind?: string, labelKey?: string, proxy?: string }>} */
  const out = [];
  for (const group of subgroups) {
    if (!group?.rows?.length) continue;
    out.push({ kind: 'sub-group-label', labelKey: group.labelKey });
    for (const row of group.rows) {
      const { kind, hintKey, icon, ...rest } = row;
      out.push({
        ...rest,
        prefKind: kind,
        prefHintKey: hintKey,
        prefIcon: icon
      });
    }
  }
  return out;
}
