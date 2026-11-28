/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

const INNER_MIRROR_STORAGE_KEY = 'focus-tiger.inner-mirror.v1';

const memoryCache = { entries: [] };
const appLog = [];
let diagnosticBody = '';
const yinMemoryTexts = [];
let backupSnapshot = { stores: {} };

export function getInnerMirrorCache() {
  return memoryCache;
}

export function setInnerMirrorCache(entries) {
  memoryCache.entries = Array.isArray(entries) ? [...entries] : [];
}

export function appendInnerMirrorLog(line) {
  appLog.push(String(line || ''));
}

export function getInnerMirrorLog() {
  return appLog;
}

export function setInnerMirrorDiagnosticBody(body) {
  diagnosticBody = String(body || '');
}

export function exportInnerMirrorDiagnostics() {
  return diagnosticBody;
}

export function rememberInnerMirrorYinSummary(text) {
  const t = String(text || '').trim();
  if (t) yinMemoryTexts.push(t);
}

export function getInnerMirrorYinSummaries() {
  return yinMemoryTexts;
}

export function setInnerMirrorBackupSnapshot(snapshot) {
  backupSnapshot = snapshot && typeof snapshot === 'object' ? snapshot : { stores: {} };
}

export function getInnerMirrorBackupSnapshot() {
  return backupSnapshot;
}

function stripTextFromList(list, texts) {
  const banned = new Set(texts.map((t) => String(t)));
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (banned.has(String(list[i]))) list.splice(i, 1);
  }
}

/**
 * True-delete of app-held copies of left / replacement sentences.
 * @param {string[]} texts
 */
export function purgeInnerMirrorDerivatives(texts) {
  const banned = (Array.isArray(texts) ? texts : []).map((t) => String(t)).filter(Boolean);
  memoryCache.entries = [];
  for (let i = appLog.length - 1; i >= 0; i -= 1) {
    if (banned.some((t) => t && appLog[i].includes(t))) appLog.splice(i, 1);
  }
  if (banned.some((t) => t && diagnosticBody.includes(t))) diagnosticBody = '';
  stripTextFromList(yinMemoryTexts, banned);
  const stores = backupSnapshot?.stores;
  if (stores && typeof stores === 'object') {
    delete stores[INNER_MIRROR_STORAGE_KEY];
  }
}
