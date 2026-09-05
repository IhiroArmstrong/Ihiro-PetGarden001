/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  downloadPracticeExport,
  validatePracticeImportPayload,
  summarizePracticeSnapshot,
  hasLocalPracticeData,
  comparePracticeImportCounts,
  importPracticeSnapshotAtomic,
  importHasDataLossRisk,
  importHasDataGain,
  formatPracticeImportSavedAt,
  PRACTICE_DATA_CATEGORY_DEFS
} from '../core/practiceBackup/practiceBackupLocalIo.js';

const STYLE_ID = 'local-practice-data-ui-v1';

/**
 * Privacy sheet · local export/import controls.
 * Export and import each get an independent sub-card so import confirmation
 * never appears beside export status.
 */
export class LocalPracticeDataUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [opts]
   * @param {Storage | null} [opts.storage]
   * @param {() => void} [opts.onImported]
   */
  constructor(mountRoot, opts = {}) {
    this._storage =
      opts.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    this._onImported = opts.onImported;

    this.root = document.createElement('div');
    this.root.className = 'local-practice-data';
    this.root.dataset.testid = 'local-practice-data';

    this.actions = document.createElement('div');
    this.actions.className = 'local-practice-data__actions';

    this.exportBtn = document.createElement('button');
    this.exportBtn.type = 'button';
    this.exportBtn.className = 'local-practice-data__btn';
    this.exportBtn.dataset.testid = 'local-practice-data-export';
    this.exportBtn.addEventListener('click', () => this._onExport());

    this.importBtn = document.createElement('button');
    this.importBtn.type = 'button';
    this.importBtn.className = 'local-practice-data__btn';
    this.importBtn.dataset.testid = 'local-practice-data-import';
    this.importBtn.addEventListener('click', () => this._onPickFile());

    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = 'application/json,.json';
    this.fileInput.hidden = true;
    this.fileInput.dataset.testid = 'local-practice-data-file';
    this.fileInput.addEventListener('change', () => void this._onFileSelected());

    this.actions.append(this.exportBtn, this.importBtn, this.fileInput);

    this.exportCard = document.createElement('div');
    this.exportCard.className = 'local-practice-data__card local-practice-data__card--export';
    this.exportCard.hidden = true;
    this.exportCard.dataset.testid = 'local-practice-data-export-card';

    this.exportStatusEl = document.createElement('p');
    this.exportStatusEl.className = 'local-practice-data__status';
    this.exportStatusEl.dataset.testid = 'local-practice-data-export-status';
    this.exportCard.append(this.exportStatusEl);

    this.importCard = document.createElement('div');
    this.importCard.className = 'local-practice-data__card local-practice-data__card--import';
    this.importCard.hidden = true;
    this.importCard.dataset.testid = 'local-practice-data-import-card';

    this.headingEl = document.createElement('p');
    this.headingEl.className = 'local-practice-data__heading';
    this.headingEl.hidden = true;
    this.headingEl.dataset.testid = 'local-practice-data-overwrite-heading';
    this.headingIcon = document.createElement('span');
    this.headingIcon.className = 'local-practice-data__heading-icon';
    this.headingIcon.setAttribute('aria-hidden', 'true');
    this.headingIcon.textContent = '⚠';
    this.headingText = document.createElement('span');
    this.headingEl.append(this.headingIcon, this.headingText);

    this.leadEl = document.createElement('p');
    this.leadEl.className = 'local-practice-data__lead';
    this.leadEl.hidden = true;
    this.leadEl.dataset.testid = 'local-practice-data-overwrite-lead';

    this.previewEl = document.createElement('div');
    this.previewEl.className = 'local-practice-data__preview';
    this.previewEl.hidden = true;

    this.warningEl = document.createElement('p');
    this.warningEl.className = 'local-practice-data__warning';
    this.warningEl.hidden = true;

    this.infoEl = document.createElement('p');
    this.infoEl.className = 'local-practice-data__info';
    this.infoEl.hidden = true;
    this.infoEl.dataset.testid = 'local-practice-data-gain-info';

    this.confirmRow = document.createElement('label');
    this.confirmRow.className = 'local-practice-data__confirm';
    this.confirmRow.hidden = true;
    this.confirmCheck = document.createElement('input');
    this.confirmCheck.type = 'checkbox';
    this.confirmCheck.dataset.testid = 'local-practice-data-confirm-check';
    this.confirmCheck.addEventListener('change', () => this._syncConfirmBtn());
    this.confirmText = document.createElement('span');
    this.confirmRow.append(this.confirmCheck, this.confirmText);

    this.confirmActions = document.createElement('div');
    this.confirmActions.className = 'local-practice-data__confirm-actions';
    this.confirmActions.hidden = true;

    this.cancelBtn = document.createElement('button');
    this.cancelBtn.type = 'button';
    this.cancelBtn.className = 'local-practice-data__btn local-practice-data__btn--ghost';
    this.cancelBtn.dataset.testid = 'local-practice-data-cancel';
    this.cancelBtn.addEventListener('click', () => this._resetImportCard());

    this.confirmBtn = document.createElement('button');
    this.confirmBtn.type = 'button';
    this.confirmBtn.className =
      'local-practice-data__btn local-practice-data__btn--danger';
    this.confirmBtn.dataset.testid = 'local-practice-data-confirm';
    this.confirmBtn.disabled = true;
    this.confirmBtn.addEventListener('click', () => void this._onConfirmImport());

    this.retryBtn = document.createElement('button');
    this.retryBtn.type = 'button';
    this.retryBtn.className = 'local-practice-data__btn local-practice-data__btn--ghost';
    this.retryBtn.dataset.testid = 'local-practice-data-retry';
    this.retryBtn.hidden = true;
    this.retryBtn.addEventListener('click', () => this._onPickFile());

    this.importStatusEl = document.createElement('p');
    this.importStatusEl.className = 'local-practice-data__status';
    this.importStatusEl.dataset.testid = 'local-practice-data-import-status';
    this.importStatusEl.hidden = true;

    this.confirmActions.append(this.cancelBtn, this.confirmBtn);
    this.importCard.append(
      this.importStatusEl,
      this.headingEl,
      this.leadEl,
      this.previewEl,
      this.warningEl,
      this.infoEl,
      this.confirmRow,
      this.confirmActions,
      this.retryBtn
    );

    this.root.append(this.actions, this.exportCard, this.importCard);
    mountRoot.appendChild(this.root);

    /** @type {import('../core/practiceBackup/practiceBackupSnapshot.js').PracticeBackupSnapshot | null} */
    this._pendingSnapshot = null;
    this._needsOverwriteConfirm = false;

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._refreshStaticCopy());
    this._refreshStaticCopy();
  }

  destroy() {
    this._unsubLocale?.();
    this.root.remove();
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .local-practice-data { margin: 12px 0 4px; }
      .local-practice-data__actions { display: flex; flex-wrap: wrap; gap: 8px; }
      .local-practice-data__btn {
        font: inherit; font-size: 13px; padding: 8px 12px; border-radius: 12px;
        border: 1px solid rgba(139,115,85,.22); background: rgba(255,252,245,.85);
        color: #4a3a28; cursor: pointer;
      }
      .local-practice-data__btn:hover { background: rgba(255,252,245,1); }
      .local-practice-data__btn--ghost { background: transparent; }
      .local-practice-data__btn--danger {
        border-color: rgba(160,64,48,.35); background: rgba(160,64,48,.12); color: #6b2e24;
      }
      .local-practice-data__btn--danger:disabled { opacity: .45; cursor: not-allowed; }
      .local-practice-data__card {
        margin-top: 10px; padding: 10px 12px; border-radius: 12px;
        border: 1px solid rgba(139,115,85,.14); background: rgba(255,252,245,.55);
        font-size: 13px; line-height: 1.45; color: #4a3a28;
      }
      .local-practice-data__status[data-kind="error"] { color: #6b2e24; }
      .local-practice-data__heading {
        display: flex; gap: 8px; align-items: flex-start;
        margin: 0 0 6px; font-weight: 650; color: #6b2e24;
      }
      .local-practice-data__heading-icon { flex: none; }
      .local-practice-data__lead { margin: 0 0 8px; }
      .local-practice-data__warning {
        margin: 8px 0; padding: 8px 10px; border-radius: 10px;
        background: rgba(200,140,40,.12); border: 1px solid rgba(200,140,40,.25);
      }
      .local-practice-data__info {
        margin: 8px 0; padding: 8px 10px; border-radius: 10px;
        background: rgba(90,120,150,.08); border: 1px solid rgba(90,120,150,.18);
      }
      .local-practice-data__preview table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 12px; }
      .local-practice-data__preview th, .local-practice-data__preview td {
        text-align: left; padding: 4px 6px; border-bottom: 1px solid rgba(139,115,85,.12);
      }
      .local-practice-data__preview td.import-accent { font-weight: 600; color: #5a4028; }
      .local-practice-data__confirm { display: flex; gap: 8px; align-items: flex-start; margin: 10px 0; }
      .local-practice-data__confirm-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    `;
    document.head.appendChild(style);
  }

  _refreshStaticCopy() {
    this.exportBtn.textContent = t('LOCAL_DATA_EXPORT_BTN');
    this.importBtn.textContent = t('LOCAL_DATA_IMPORT_BTN');
    this.cancelBtn.textContent = t('LOCAL_DATA_IMPORT_CANCEL');
    this.confirmBtn.textContent = this._needsOverwriteConfirm
      ? t('LOCAL_DATA_IMPORT_CONFIRM_OVERWRITE')
      : t('LOCAL_DATA_IMPORT_CONFIRM');
    this.confirmText.textContent = t('LOCAL_DATA_IMPORT_ACK');
    this.headingText.textContent = t('LOCAL_DATA_IMPORT_OVERWRITE_TITLE');
    this.leadEl.textContent = t('LOCAL_DATA_IMPORT_OVERWRITE_LEAD');
    this.retryBtn.textContent = t('LOCAL_DATA_IMPORT_RETRY');
  }

  _hideExportCard() {
    this.exportCard.hidden = true;
    this.exportStatusEl.textContent = '';
    this.exportStatusEl.dataset.kind = '';
  }

  _showExportStatus(message, kind = 'ok') {
    this._resetImportCard();
    this.exportCard.hidden = false;
    this.exportStatusEl.dataset.kind = kind;
    this.exportStatusEl.textContent = message;
  }

  _onExport() {
    void (async () => {
      try {
        await downloadPracticeExport(this._storage);
        this._showExportStatus(t('LOCAL_DATA_EXPORT_DONE'));
      } catch {
        this._showExportStatus(t('LOCAL_DATA_EXPORT_ERR'), 'error');
      }
    })();
  }

  _onPickFile() {
    this._hideExportCard();
    this.fileInput.value = '';
    this.fileInput.click();
  }

  async _onFileSelected() {
    const file = this.fileInput.files?.[0];
    if (!file) return;
    this._hideExportCard();
    let text = '';
    try {
      text = await file.text();
    } catch {
      this._showImportError(t('LOCAL_DATA_IMPORT_ERR_READ'));
      return;
    }
    const validated = validatePracticeImportPayload(text);
    if (!validated.ok) {
      this._showImportError(t(validated.messageKey));
      return;
    }
    this._pendingSnapshot = validated.snapshot;
    this._needsOverwriteConfirm = hasLocalPracticeData(this._storage);
    this._showPreview(validated.snapshot);
  }

  /**
   * @param {import('../core/practiceBackup/practiceBackupSnapshot.js').PracticeBackupSnapshot} snapshot
   */
  _showPreview(snapshot) {
    this.importCard.hidden = false;
    this.importStatusEl.hidden = true;
    this.retryBtn.hidden = true;
    this.previewEl.hidden = false;
    this.previewEl.replaceChildren();

    const overwrite = this._needsOverwriteConfirm;
    this.headingEl.hidden = !overwrite;
    this.leadEl.hidden = !overwrite;

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    for (const label of [
      t('LOCAL_DATA_IMPORT_COL_CATEGORY'),
      ...(this._needsOverwriteConfirm
        ? [t('LOCAL_DATA_IMPORT_COL_LOCAL'), t('LOCAL_DATA_IMPORT_COL_FILE')]
        : [t('LOCAL_DATA_IMPORT_COL_COUNT')])
    ]) {
      const th = document.createElement('th');
      th.textContent = label;
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const summary = summarizePracticeSnapshot(snapshot);
    const compare = this._needsOverwriteConfirm
      ? comparePracticeImportCounts(this._storage, snapshot)
      : null;

    summary.forEach((row, i) => {
      const tr = document.createElement('tr');
      const name = document.createElement('td');
      name.textContent = t(`LOCAL_DATA_CAT_${row.id.toUpperCase()}`);
      tr.appendChild(name);

      if (compare) {
        const localTd = document.createElement('td');
        localTd.textContent = this._formatCount(compare[i].localCount);
        tr.appendChild(localTd);
        const importTd = document.createElement('td');
        importTd.className = 'import-accent';
        importTd.textContent = this._formatCount(compare[i].importCount);
        tr.appendChild(importTd);
      } else {
        const countTd = document.createElement('td');
        countTd.textContent = this._formatCount(row.count);
        tr.appendChild(countTd);
      }
      tbody.appendChild(tr);
    });
    const savedTr = document.createElement('tr');
    const savedName = document.createElement('td');
    savedName.textContent = t('LOCAL_DATA_IMPORT_COL_SAVED_AT');
    savedTr.appendChild(savedName);
    const savedValue = document.createElement('td');
    savedValue.colSpan = compare ? 2 : 1;
    savedValue.className = 'import-accent';
    savedValue.textContent = formatPracticeImportSavedAt(
      snapshot.savedAt,
      () => new Date(),
      t
    );
    savedTr.appendChild(savedValue);
    tbody.appendChild(savedTr);
    table.appendChild(tbody);
    this.previewEl.appendChild(table);

    const lossRisk = importHasDataLossRisk(this._storage, snapshot);
    this.warningEl.hidden = !lossRisk;
    if (lossRisk) {
      this.warningEl.textContent = t('LOCAL_DATA_IMPORT_LOSS_WARNING');
    }
    const gain = importHasDataGain(this._storage, snapshot);
    this.infoEl.hidden = !gain;
    if (gain) {
      this.infoEl.textContent = t('LOCAL_DATA_IMPORT_GAIN_INFO');
    }

    this.confirmRow.hidden = !this._needsOverwriteConfirm;
    this.confirmCheck.checked = false;
    this.confirmActions.hidden = false;
    this.confirmBtn.disabled = this._needsOverwriteConfirm;
    this._refreshStaticCopy();
  }

  /**
   * @param {number | null} count
   */
  _formatCount(count) {
    if (count == null) return t('LOCAL_DATA_COUNT_INCLUDED');
    return String(count);
  }

  _showImportError(message) {
    this.importCard.hidden = false;
    this.previewEl.hidden = true;
    this.headingEl.hidden = true;
    this.leadEl.hidden = true;
    this.warningEl.hidden = true;
    this.infoEl.hidden = true;
    this.confirmRow.hidden = true;
    this.confirmActions.hidden = true;
    this.importStatusEl.hidden = false;
    this.importStatusEl.dataset.kind = 'error';
    this.importStatusEl.textContent = message;
    this.retryBtn.hidden = false;
    this._pendingSnapshot = null;
  }

  _resetImportCard() {
    this.importCard.hidden = true;
    this._pendingSnapshot = null;
    this._needsOverwriteConfirm = false;
    this.confirmCheck.checked = false;
    this.confirmBtn.disabled = true;
    this.previewEl.replaceChildren();
    this.headingEl.hidden = true;
    this.leadEl.hidden = true;
    this.warningEl.hidden = true;
    this.infoEl.hidden = true;
    this.importStatusEl.hidden = true;
    this.retryBtn.hidden = true;
    this.confirmActions.hidden = true;
    this.confirmRow.hidden = true;
  }

  _syncConfirmBtn() {
    if (!this._needsOverwriteConfirm) {
      this.confirmBtn.disabled = false;
      return;
    }
    this.confirmBtn.disabled = !this.confirmCheck.checked;
  }

  async _onConfirmImport() {
    if (!this._pendingSnapshot) return;
    const result = await importPracticeSnapshotAtomic(
      this._storage,
      this._pendingSnapshot
    );
    if (!result.ok) {
      this._showImportError(t('LOCAL_DATA_IMPORT_ERR_WRITE'));
      return;
    }
    this._resetImportCard();
    this.importCard.hidden = false;
    this.importStatusEl.hidden = false;
    this.importStatusEl.dataset.kind = 'ok';
    this.importStatusEl.textContent = t('LOCAL_DATA_IMPORT_DONE');
    this._onImported?.();
  }
}

export { PRACTICE_DATA_CATEGORY_DEFS };
