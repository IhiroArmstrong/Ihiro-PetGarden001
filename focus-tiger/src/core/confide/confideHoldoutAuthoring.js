/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Seal / score gates for handwritten prompt ids, and sample ingest vs voided files.
 * Research on already-voided files must not copy utterances into production banks.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function authoringError(message, code) {
  const err = new Error(message);
  err.code = code;
  err.holdoutSafe = true;
  return err;
}

export function extractHoldoutAuthorPromptId(data) {
  if (!data || typeof data !== 'object') return '';
  return String(data.author_prompt_id || data.authorPromptId || '').trim();
}

export function requireHoldoutAuthorPromptId(data) {
  const id = extractHoldoutAuthorPromptId(data);
  if (!id) {
    throw authoringError('封存/打分须带手写出题编号 author_prompt_id', 'NO_AUTHOR_PROMPT_ID');
  }
  return id;
}

/**
 * Same handwritten prompt id may not be reused on a different file.
 * @param {object} bag run-log JSON
 * @param {string} authorPromptId
 * @param {string} filePath
 */
export function assertAuthorPromptIdUnused(bag, authorPromptId, filePath) {
  const id = String(authorPromptId || '').trim();
  const resolved = path.resolve(String(filePath || ''));
  if (!id) {
    throw authoringError('封存/打分须带手写出题编号 author_prompt_id', 'NO_AUTHOR_PROMPT_ID');
  }
  const versions = bag?.byHoldoutSetVersion;
  if (!versions || typeof versions !== 'object') return;
  for (const slot of Object.values(versions)) {
    const files = slot?.files;
    if (!files || typeof files !== 'object') continue;
    for (const [storedPath, rec] of Object.entries(files)) {
      if (!rec || typeof rec !== 'object') continue;
      const storedId = String(rec.author_prompt_id || rec.authorPromptId || '').trim();
      if (storedId && storedId === id && path.resolve(storedPath) !== resolved) {
        throw authoringError('手写出题编号已用过', 'AUTHOR_PROMPT_ID_REUSED');
      }
    }
  }
}

export function normalizeHoldoutUtterance(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

export function hashHoldoutUtterance(text) {
  return createHash('sha256').update(normalizeHoldoutUtterance(text), 'utf8').digest('hex');
}

function itemText(item) {
  if (!item || typeof item !== 'object') return '';
  return String(item.text || item.utterance || '');
}

/**
 * Load utterance hashes from already-voided holdout JSON files. Never returns text.
 * @param {string[]} filePaths
 * @returns {Set<string>}
 */
export function collectVoidedUtteranceHashes(filePaths) {
  const hashes = new Set();
  for (const filePath of filePaths || []) {
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(filePath, 'utf8'));
    } catch {
      continue;
    }
    const items = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.items)
        ? parsed.items
        : Object.values(parsed || {}).filter((row) => row && typeof row === 'object' && itemText(row));
    for (const item of items) {
      const text = itemText(item);
      if (text) hashes.add(hashHoldoutUtterance(text));
    }
  }
  return hashes;
}

/**
 * Sample ingest: refuse any sentence that appears in a voided holdout file.
 * @param {string} text
 * @param {Set<string>} voidedHashes
 */
export function assertSampleNotFromVoidedHoldouts(text, voidedHashes) {
  const hash = hashHoldoutUtterance(text);
  if (hash && voidedHashes && voidedHashes.has(hash)) {
    throw authoringError('补样本不得使用已作废封存文件中的句子', 'VOIDED_UTTERANCE');
  }
}
