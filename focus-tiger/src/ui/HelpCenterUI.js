/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Help Center — browsable user topics (menu entry only; ? stays purpose card).
 * Brief: docs/task-briefs/task-user-help-center.md
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  HELP_CENTER_SECTIONS,
  findHelpCenterArticle,
  listHelpCenterArticlesForSection
} from '../core/helpCenterCatalog.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import {
  OVERLAY_BACKDROP_FADE_MS,
  createOverlayBackdrop,
  hideOverlayBackdrop,
  showOverlayBackdrop
} from './overlayBackdrop.js';

const STYLE_ID = 'help-center-ui-styles-v1';
const FADE_MS = OVERLAY_BACKDROP_FADE_MS;

export class HelpCenterUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    /** @type {string | null} */
    this._activeArticleId = null;

    this.backdrop = createOverlayBackdrop(mountRoot, {
      id: 'help-center-backdrop',
      testId: 'help-center-backdrop',
      zIndex: 17,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this.close()
    });

    this.root = document.createElement('div');
    this.root.id = 'help-center';
    this.root.className = 'help-center';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'help-center-title');
    this.root.dataset.testid = 'help-center';

    this.header = document.createElement('div');
    this.header.className = 'help-center__header';

    this.backBtn = document.createElement('button');
    this.backBtn.type = 'button';
    this.backBtn.className = 'help-center__back';
    this.backBtn.dataset.testid = 'help-center-back';
    this.backBtn.hidden = true;
    this.backBtn.addEventListener('click', () => this._showIndex());

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'help-center-title';
    this.titleEl.className = 'help-center__title';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'help-center__close';
    this.closeBtn.dataset.testid = 'help-center-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.header.append(this.backBtn, this.titleEl, this.closeBtn);

    this.introEl = document.createElement('p');
    this.introEl.className = 'help-center__intro';
    this.introEl.dataset.testid = 'help-center-intro';

    this.confideNoteEl = document.createElement('p');
    this.confideNoteEl.className = 'help-center__confide-note';
    this.confideNoteEl.dataset.testid = 'help-center-confide-note';

    this.indexEl = document.createElement('div');
    this.indexEl.className = 'help-center__index';
    this.indexEl.dataset.testid = 'help-center-index';

    this.articleEl = document.createElement('article');
    this.articleEl.className = 'help-center__article';
    this.articleEl.hidden = true;
    this.articleEl.dataset.testid = 'help-center-article';

    this.articleTitleEl = document.createElement('h2');
    this.articleTitleEl.className = 'help-center__article-title';

    this.articleBodyEl = document.createElement('div');
    this.articleBodyEl.className = 'help-center__article-body';

    this.articleEl.append(this.articleTitleEl, this.articleBodyEl);

    this.root.append(
      this.header,
      this.introEl,
      this.indexEl,
      this.articleEl,
      this.confideNoteEl
    );

    mountRoot.append(this.backdrop.element, this.root);
    this._localeOff = onLocaleChange(() => {
      if (this._open) this._render();
    });
    this._injectStyles();
  }

  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) {
      this._showIndex();
      return;
    }
    this._open = true;
    this._activeArticleId = null;
    this.root.hidden = false;
    showOverlayBackdrop(this.backdrop);
    this._showIndex();
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this._activeArticleId = null;
    hideOverlayBackdrop(this.backdrop, FADE_MS, () => {
      this.root.hidden = true;
    });
    this.handlers.onClose?.();
  }

  _showIndex() {
    this._activeArticleId = null;
    this.backBtn.hidden = true;
    this.indexEl.hidden = false;
    this.articleEl.hidden = true;
    this.confideNoteEl.hidden = false;
    this._render();
  }

  /**
   * @param {string} articleId
   */
  _openArticle(articleId) {
    const row = findHelpCenterArticle(articleId);
    if (!row) return;
    this._activeArticleId = articleId;
    this.backBtn.hidden = false;
    this.indexEl.hidden = true;
    this.articleEl.hidden = false;
    this.confideNoteEl.hidden = true;
    this._render();
  }

  _render() {
    if (this._activeArticleId) {
      const row = findHelpCenterArticle(this._activeArticleId);
      if (!row) {
        this._showIndex();
        return;
      }
      this.titleEl.textContent = t('help_center.title');
      this.backBtn.textContent = t('help_center.back_to_topics');
      this.closeBtn.textContent = t('help_center.close');
      this.introEl.hidden = true;
      this.articleTitleEl.textContent = t(row.titleKey);
      this.articleBodyEl.textContent = t(row.bodyKey);
      return;
    }

    this.titleEl.textContent = t('help_center.title');
    this.closeBtn.textContent = t('help_center.close');
    this.introEl.hidden = false;
    this.introEl.textContent = t('help_center.intro');
    this.confideNoteEl.textContent = t('help_center.confide_note');

    this.indexEl.replaceChildren();
    for (const section of HELP_CENTER_SECTIONS) {
      const articles = listHelpCenterArticlesForSection(section.id);
      if (!articles.length) continue;

      const sectionEl = document.createElement('section');
      sectionEl.className = 'help-center__section';

      const heading = document.createElement('h2');
      heading.className = 'help-center__section-title';
      heading.textContent = t(section.labelKey);
      sectionEl.append(heading);

      const list = document.createElement('ul');
      list.className = 'help-center__list';

      for (const article of articles) {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'help-center__topic';
        btn.dataset.testid = `help-center-topic-${article.id}`;
        btn.textContent = t(article.titleKey);
        btn.addEventListener('click', () => this._openArticle(article.id));
        li.append(btn);
        list.append(li);
      }

      sectionEl.append(list);
      this.indexEl.append(sectionEl);
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #help-center {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 18;
        pointer-events: auto;
        width: min(420px, calc(100vw - 32px));
        max-height: min(78vh, 640px);
        overflow: auto;
        padding: 20px 18px 16px;
        border-radius: ${GLASS_RADIUS};
        background: ${GLASS_FILL};
        border: ${GLASS_BORDER};
        box-shadow: ${GLASS_SHADOW};
        backdrop-filter: ${GLASS_BLUR_CSS};
        -webkit-backdrop-filter: ${GLASS_BLUR_CSS};
        color: var(--ft-ink-primary, #2a2520);
        font-family: var(--ft-font-ui, system-ui, sans-serif);
      }
      .help-center__header {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
      }
      .help-center__title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 600;
        text-align: center;
      }
      .help-center__back,
      .help-center__close {
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
        padding: 4px 6px;
        border-radius: 8px;
      }
      .help-center__back:hover,
      .help-center__close:hover {
        background: ${GLASS_FILL_STRONG};
      }
      .help-center__back:active,
      .help-center__close:active {
        transform: scale(0.98);
      }
      .help-center__intro,
      .help-center__confide-note {
        margin: 0 0 12px;
        font-size: 0.88rem;
        line-height: 1.45;
        opacity: 0.92;
      }
      .help-center__confide-note {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid rgba(42, 37, 32, 0.12);
        font-size: 0.82rem;
      }
      .help-center__section-title {
        margin: 14px 0 6px;
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        opacity: 0.75;
      }
      .help-center__list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .help-center__topic {
        display: block;
        width: 100%;
        text-align: left;
        border: none;
        background: transparent;
        padding: 10px 8px;
        margin: 0;
        border-radius: 10px;
        font: inherit;
        font-size: 0.92rem;
        cursor: pointer;
        color: inherit;
      }
      .help-center__topic:hover {
        background: ${GLASS_FILL_STRONG};
      }
      .help-center__topic:active {
        transform: scale(0.99);
      }
      .help-center__article-title {
        margin: 0 0 10px;
        font-size: 1rem;
        font-weight: 600;
      }
      .help-center__article-body {
        font-size: 0.9rem;
        line-height: 1.55;
        white-space: pre-wrap;
      }
    `;
    document.head.append(style);
  }

  destroy() {
    this._localeOff?.();
    this.close();
    this.root.remove();
    this.backdrop.element?.remove();
  }
}
