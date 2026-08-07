#!/usr/bin/env node
/**
 * Rules-authority alignment check.
 *
 * Detects:
 *  1. SSOT file missing required canonical claims
 *  2. Non-SSOT files restating a topic in full (fingerprint threshold)
 *  3. Non-SSOT files mentioning a topic without citing the SSOT
 *  4. Forbidden contradictory phrases outside the SSOT
 *  5. RULES_INDEX.md machine block drift from the registry
 *
 *   npm run rules:doc-check
 *   npm run rules:doc-sync   — rewrite RULES_INDEX machine block
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RULE_AUTHORITY_PRINCIPLE,
  RULE_AUTHORITY_SCAN_FILES,
  RULE_AUTHORITY_TOPICS
} from './rules-authority-registry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOCUS_TIGER = join(__dirname, '..');
const REPO_ROOT = join(FOCUS_TIGER, '..');
const INDEX_PATH = join(FOCUS_TIGER, 'docs/RULES_INDEX.md');

const BEGIN = '<!-- rules-authority-index:begin -->';
const END = '<!-- rules-authority-index:end -->';
const INSERT_AFTER = '## 规则主题 → 权威来源';

/**
 * Changelog / history / anti-pattern tables that quote deprecated phrases
 * are allowed when clearly marked 废止 / 禁止列 / 曾出现, etc.
 * Per-rule `exemptIfLineMatches` (optional): after a `pattern` hit, if that
 * regex matches the ≤120 characters *before* the「全部 push/flush」token on
 * the same line, the hit is skipped (negation restatements like
 * 「禁止把下班前的 Git 同步做成全部 push」).
 * @param {string} text
 * @param {RegExp} pattern
 * @param {RegExp} [lineExempt]
 * @returns {boolean}
 */
export function hasForbiddenOutsideHistory(text, pattern, lineExempt = null) {
  const lines = text.split('\n');
  for (const line of lines) {
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    const re = new RegExp(pattern.source, flags);
    /** @type {RegExpExecArray | null} */
    let m;
    let found = false;
    while ((m = re.exec(line)) !== null) {
      if (lineExempt) {
        const allRel = m[0].search(/全部\s*(?:`?push`?|推送|flush)/);
        const absAll = allRel >= 0 ? m.index + allRel : m.index;
        const windowBefore = line.slice(Math.max(0, absAll - 120), absAll);
        if (lineExempt.test(windowBefore)) continue;
      }
      found = true;
      break;
    }
    if (!found) continue;
    if (
      /废止|已废止|曾出现|已改为|不再使用|deprecated|矛盾|禁止列|Anti-pattern|主张「/i.test(
        line
      )
    ) {
      continue;
    }
    // Markdown table "禁止" column describing what NOT to write
    if (/^\|[^|]+\|[^|]+\|[^|]*禁止/.test(line) || /\|\s*禁止\s*\|/.test(line)) {
      continue;
    }
    if (/\|[^|\n]*禁止[^|\n]*\|/.test(line) && /SSOT|regression-lock|WORKFLOW/.test(line)) {
      continue;
    }
    return true;
  }
  return false;
}

/**
 * @returns {string}
 */
export function renderRulesAuthorityMarkdownBlock() {
  const lines = [
    BEGIN,
    '',
    '> **机器块 · 勿手改**。真源：`scripts/rules-authority-registry.js`。刷新：`npm run rules:doc-sync`。',
    '',
    `| 原则 | ${RULE_AUTHORITY_PRINCIPLE.summary} |`,
    `| 检测 | \`${RULE_AUTHORITY_PRINCIPLE.checkCommand}\`（含本检查） |`,
    '',
    '| topicId | 主题 | 权威文档 (SSOT) | 权威章节 |',
    '|---|---|---|---|'
  ];

  for (const t of RULE_AUTHORITY_TOPICS) {
    lines.push(
      `| \`${t.id}\` | ${t.title} | \`${t.ssotPath}\` | ${t.ssotSection} |`
    );
  }

  lines.push('', END);
  return `${lines.join('\n')}\n\n`;
}

/**
 * @param {string} md
 * @returns {string}
 */
export function replaceRulesAuthorityBlock(md) {
  const block = renderRulesAuthorityMarkdownBlock();
  const start = md.indexOf(BEGIN);
  const end = md.indexOf(END);

  if (start !== -1 && end !== -1 && end >= start) {
    const afterEnd = end + END.length;
    const before = md.slice(0, start).replace(/\n+$/, '');
    const after = md.slice(afterEnd).replace(/^\n+/, '');
    const normalizedBlock = block.replace(/\n+$/, '\n');
    return after
      ? `${before}\n\n${normalizedBlock}\n${after}`
      : `${before}\n\n${normalizedBlock}\n`;
  }

  const anchor = md.indexOf(INSERT_AFTER);
  if (anchor === -1) {
    throw new Error(
      `RULES_INDEX.md missing ${BEGIN} markers and bootstrap anchor "${INSERT_AFTER}"`
    );
  }
  const lineEnd = md.indexOf('\n', anchor);
  const insertAt = lineEnd === -1 ? md.length : lineEnd + 1;
  return md.slice(0, insertAt) + '\n' + block + md.slice(insertAt);
}

/**
 * @param {string} relPath
 * @returns {string}
 */
function readRepoFile(relPath) {
  const abs = join(REPO_ROOT, relPath);
  if (!existsSync(abs)) {
    throw new Error(`[rules:doc-check] missing file: ${relPath}`);
  }
  return readFileSync(abs, 'utf8');
}

/**
 * @param {string} fileText
 * @param {RegExp[]} patterns
 * @returns {number}
 */
function countMatches(fileText, patterns) {
  let n = 0;
  for (const p of patterns) {
    if (p.test(fileText)) n += 1;
  }
  return n;
}

/**
 * @param {{ write?: boolean }} [opts]
 * @returns {boolean}
 */
export function runRulesAuthorityDocCheck({ write = false } = {}) {
  /** @type {string[]} */
  const errors = [];

  // --- Machine block sync ---
  if (!existsSync(INDEX_PATH)) {
    errors.push(`RULES_INDEX.md missing at ${INDEX_PATH}`);
  } else {
    const md = readFileSync(INDEX_PATH, 'utf8');
    const next = replaceRulesAuthorityBlock(md);
    if (write) {
      writeFileSync(INDEX_PATH, next, 'utf8');
      console.log(`[rules:doc-sync] updated ${INDEX_PATH}`);
    } else if (next !== md) {
      errors.push(
        'RULES_INDEX.md machine block is out of sync with rules-authority-registry.js. Run: npm run rules:doc-sync'
      );
    }
  }

  /** @type {Map<string, string>} */
  const fileCache = new Map();
  for (const rel of RULE_AUTHORITY_SCAN_FILES) {
    try {
      fileCache.set(rel, readRepoFile(rel));
    } catch (e) {
      errors.push(String(e.message || e));
    }
  }

  for (const topic of RULE_AUTHORITY_TOPICS) {
    const ssotText = fileCache.get(topic.ssotPath);
    if (!ssotText) {
      errors.push(`[${topic.id}] SSOT file not in scan set or unreadable: ${topic.ssotPath}`);
      continue;
    }

    for (const claim of topic.ssotMustContain) {
      if (!claim.test(ssotText)) {
        errors.push(
          `[${topic.id}] SSOT \`${topic.ssotPath}\` (§ ${topic.ssotSection}) missing required claim: ${claim}`
        );
      }
    }

    for (const [rel, text] of fileCache) {
      if (rel === topic.ssotPath) continue;
      if (topic.citeExemptFiles?.includes(rel)) continue;

      const signalsHit = topic.topicSignals.some((p) => p.test(text));
      if (signalsHit) {
        const cites = topic.mustCite.some((p) => p.test(text));
        if (!cites) {
          errors.push(
            `[${topic.id}] \`${rel}\` mentions this topic but does not cite SSOT \`${topic.ssotPath}\` (need one of: ${topic.mustCite.map((r) => r.source).join(' | ')})`
          );
        }
      }

      const skipRestatement = topic.restatementExemptFiles?.includes(rel);
      if (!skipRestatement) {
        const fp = countMatches(text, topic.restatementFingerprints);
        if (fp >= topic.restatementThreshold) {
          errors.push(
            `[${topic.id}] \`${rel}\` appears to fully restate the policy (${fp}/${topic.restatementFingerprints.length} fingerprints; threshold ${topic.restatementThreshold}). Keep the full text only in \`${topic.ssotPath}\`; elsewhere use a one-line cite + link.`
          );
        }
      }

      for (const bad of topic.forbiddenOutsideSsot) {
        if (hasForbiddenOutsideHistory(text, bad.pattern, bad.exemptIfLineMatches)) {
          errors.push(
            `[${topic.id}] \`${rel}\` contains contradictory claim \`${bad.id}\`: ${bad.note}`
          );
        }
      }
    }
  }

  if (errors.length) {
    console.error('\n[rules:doc-check] FAILED — rules authority drift / contradiction:\n');
    for (const e of errors) console.error(`  • ${e}`);
    console.error(
      '\nFix: edit non-SSOT docs to cite the authority listed in focus-tiger/docs/RULES_INDEX.md; do not restate or invent parallel rules.\n'
    );
    return false;
  }

  console.log(
    `[rules:doc-check] OK — ${RULE_AUTHORITY_TOPICS.length} topics; SSOT claims present; no forbidden restatements/contradictions in scan set.`
  );
  return true;
}

const isCli =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isCli) {
  const write = process.argv.includes('--write');
  const ok = runRulesAuthorityDocCheck({ write });
  if (!ok && !write) process.exitCode = 1;
}
