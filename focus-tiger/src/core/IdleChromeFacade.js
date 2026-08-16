/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import {
  NARROW_STAGE_CLASS,
  WIDE_STAGE_CLASS
} from './idleChromeOrchestration.js';

const NARROW_MQ = '(max-width: 479px)';

/**
 * Idle chrome facade (responsive Task 3 · phase 2).
 * One registration surface for handlers + breakpoint cleanup; presentation
 * stays in NarrowIdleShell (drawer) / WideIdleMoreMenu (⋯) adapters.
 *
 * Prefer {@link createIdleChromeFacade} from `createIdleChromeFacade.js` in
 * product code so this module stays free of shell/i18n imports (unit-testable).
 *
 * @see docs/task-briefs/task-responsive-single-chrome-line.md
 */
export class IdleChromeFacade {
  /**
   * @param {{
   *   narrow: {
   *     setHandlers: (h: object) => void,
   *     setIdle: (v: boolean) => void,
   *     setSuppressed: (v: boolean, opts?: object) => void,
   *     syncMuteVisual?: (s?: object) => void,
   *     isSheetOpen?: () => boolean,
   *     releaseInactivePresentation?: () => void,
   *     destroy?: () => void
   *   },
   *   wide: {
   *     setHandlers: (h: object) => void,
   *     setIdle: (v: boolean) => void,
   *     setSuppressed: (v: boolean, opts?: object) => void,
   *     releaseInactivePresentation?: () => void,
   *     destroy?: () => void
   *   },
   *   matchMedia?: ((query: string) => MediaQueryList) | null
   * }} options
   */
  constructor(options) {
    if (!options?.narrow || !options?.wide) {
      throw new Error(
        'IdleChromeFacade requires { narrow, wide } adapters (use createIdleChromeFacade)'
      );
    }
    this.narrow = options.narrow;
    this.wide = options.wide;

    this._handlers = {};
    const mqFactory =
      options.matchMedia ??
      (typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia.bind(window)
        : null);
    this._mq = mqFactory ? mqFactory(NARROW_MQ) : null;
    this._wasNarrow = this.isNarrow();
    this._onMqChange = () => this._handleBreakpointChange();
    this._mq?.addEventListener?.('change', this._onMqChange);
  }

  /** @returns {boolean} */
  isNarrow() {
    if (this._mq) return Boolean(this._mq.matches);
    return typeof window !== 'undefined' && window.innerWidth <= 479;
  }

  /**
   * Register shared chrome handlers once; fans out to both adapters.
   * @param {Record<string, Function | undefined>} handlers
   * @returns {void}
   */
  setHandlers(handlers) {
    this._handlers = { ...this._handlers, ...handlers };
    const h = this._handlers;
    this.narrow.setHandlers({
      onSound: h.onSound,
      onSoundHover: h.onSoundHover,
      onCompanion: h.onCompanion,
      onReminder: h.onReminder,
      onLanguage: h.onLanguage,
      onFiveMoments: h.onFiveMoments,
      onJourneyLog: h.onJourneyLog,
      onConfide: h.onConfide,
      onZenCinema: h.onZenCinema,
      onDailyQuote: h.onDailyQuote,
      onMustardSeedSeal: h.onMustardSeedSeal,
      onWallpapers: h.onWallpapers,
      onSanctuary: h.onSanctuary,
      onMembership: h.onMembership,
      onTipJar: h.onTipJar,
      onNewsletter: h.onNewsletter,
      onCommunity: h.onCommunity,
      onRitualFlow: h.onRitualFlow,
      onHonesty: h.onHonesty,
      onQuickStart: h.onQuickStart,
      onClearStage: h.onClearStage,
      onSheetChange: h.onSheetChange,
      isHintUnread: h.isHintUnread
    });
    this.wide.setHandlers({
      onSound: h.onSound,
      onCompanion: h.onCompanion,
      onClearCompanion: h.onClearCompanion,
      onReminder: h.onReminder,
      onLanguage: h.onLanguage,
      onFiveMoments: h.onFiveMoments,
      onJourneyLog: h.onJourneyLog,
      onConfide: h.onConfide,
      onZenCinema: h.onZenCinema,
      onDailyQuote: h.onDailyQuote,
      onMustardSeedSeal: h.onMustardSeedSeal,
      onWallpapers: h.onWallpapers,
      onSanctuary: h.onSanctuary,
      onMembership: h.onMembership,
      onTipJar: h.onTipJar,
      onNewsletter: h.onNewsletter,
      onCommunity: h.onCommunity,
      onRitualFlow: h.onRitualFlow,
      onHonesty: h.onHonesty,
      onQuickStart: h.onQuickStart,
      onClearStage: h.onClearStage,
      onMenuChange: h.onMenuChange,
      isHintUnread: h.isHintUnread
    });
  }

  /**
   * @param {{
   *   narrow: { idle: boolean, suppressed: boolean, keepQuickStart?: boolean },
   *   wide: { idle: boolean, suppressed: boolean, keepQuickStart?: boolean }
   * }} projection
   * @returns {void}
   */
  applyShellProjection(projection) {
    const { narrow, wide } = projection;
    this.narrow.setIdle(narrow.idle);
    this.narrow.setSuppressed(narrow.suppressed, {
      keepQuickStart: Boolean(narrow.keepQuickStart)
    });
    this.wide.setIdle(wide.idle);
    this.wide.setSuppressed(wide.suppressed, {
      keepQuickStart: Boolean(wide.keepQuickStart)
    });
  }

  /**
   * @param {{ musicOn?: boolean }} [state]
   * @returns {void}
   */
  syncMuteVisual(state) {
    this.narrow.syncMuteVisual?.(state);
  }

  /** @returns {boolean} */
  isSheetOpen() {
    return this.narrow.isSheetOpen?.() === true;
  }

  /**
   * Clear narrow + wide stage body classes without firing onClearStage.
   * @returns {void}
   */
  clearAllStageClasses() {
    if (typeof document === 'undefined') return;
    document.body.classList.remove(
      NARROW_STAGE_CLASS.companion,
      NARROW_STAGE_CLASS.reminder,
      NARROW_STAGE_CLASS.sound,
      NARROW_STAGE_CLASS.language,
      WIDE_STAGE_CLASS.companion,
      WIDE_STAGE_CLASS.reminder,
      WIDE_STAGE_CLASS.sound,
      WIDE_STAGE_CLASS.language
    );
  }

  /** @returns {void} */
  destroy() {
    this._mq?.removeEventListener?.('change', this._onMqChange);
    this.narrow.destroy?.();
    this.wide.destroy?.();
  }

  /**
   * When crossing 479px: close inactive presentation chrome and drop its
   * stage classes **without** calling onClearStage (must not hide Companion
   * just because the user resized).
   * @returns {void}
   */
  _handleBreakpointChange() {
    const nowNarrow = this.isNarrow();
    if (nowNarrow === this._wasNarrow) return;
    this._wasNarrow = nowNarrow;
    if (nowNarrow) {
      this.wide.releaseInactivePresentation?.();
    } else {
      this.narrow.releaseInactivePresentation?.();
    }
  }
}
