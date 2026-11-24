#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Scan a git diff for quiet test weakening: fewer assertions, new skip/only,
 * deleted test files, looser matchers, or disabled type/lint checks.
 *
 *   node scripts/check-test-weakening.mjs --staged
 *   node scripts/check-test-weakening.mjs --base origin/develop
 *   node scripts/check-test-weakening.mjs --diff-file x.diff
 *
 * Exit: 0 pass or acked · 1 weakening without ack · 2 script error
 *
 * Ack (≥6 chars): TEST_WEAKEN_ACK="reason"  or  PR body  Test-Weakening-Ack: reason
 *
 * Policy SSOT: docs/COMPLIANCE.md §5. Adding tests/assertions is allowed.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

export const CONFIG = {
  testPathPatterns: [
    /(^|\/)e2e\//i,
    /(^|\/)__tests__\//i,
    /(^|\/)tests?\//i,
    /\.(test|spec)\.[cm]?[jt]sx?$/i
  ],
  selfPathPattern: /(^|\/)check-test-weakening\.(mjs|test\.js)$/,

  assertionPatterns: [
    /\bexpect\s*\(/,
    /\bassert(?:\.\w+)?\s*\(/,
    /\bassert\.\w+/,
    /\bt\.(?:is|not|true|false|truthy|falsy|deepEqual|equal|ok|throws|regex)\s*\(/
  ],

  testCasePattern: /^\s*(?:test|it)(?:\.\w+)?\s*\(/,

  skipMarkerPatterns: [
    /\b(?:it|test|describe|context)\.(?:skip|fixme|only|todo)\b/,
    /\b(?:xit|xtest|xdescribe)\s*\(/,
    /\bt\.skip\b/,
    /\.only\s*\(/
  ],

  strongMatcherPattern:
    /\.(?:toBe|toEqual|toStrictEqual|toHaveText|toHaveValue|toHaveCount|toHaveAttribute)\s*\(/,
  weakMatcherPattern:
    /\.(?:toBeTruthy|toBeFalsy|toBeDefined|toContain|toMatch|toBeGreaterThan(?:OrEqual)?|toBeLessThan(?:OrEqual)?)\s*\(|\.not\.toBe\w*\s*\(/,

  disableCheckPatterns: [
    /@ts-ignore|@ts-nocheck|@ts-expect-error/,
    /eslint-disable/,
    /"strict"\s*:\s*false|"noImplicitAny"\s*:\s*false/
  ],
  disableCheckFileFilter: /\.(?:[cm]?[jt]sx?|json)$/i,
  disableCheckFileExclude: /(^|\/)package-lock\.json$/,

  swallowFailurePattern: /\|\|\s*true\b/,

  minAckLength: 6
};

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : undefined;
};

function gitRoot() {
  return execFileSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8'
  }).trim();
}

function git(gitArgs) {
  return execFileSync('git', gitArgs, {
    encoding: 'utf8',
    cwd: gitRoot(),
    maxBuffer: 256 * 1024 * 1024
  });
}

export function getDiff() {
  const diffFile = opt('--diff-file');
  if (diffFile) return readFileSync(diffFile, 'utf8');

  const common = ['diff', '-U0', '-M', '--no-color'];
  if (flag('--staged')) return git([...common, '--cached']);

  const base =
    opt('--base') ||
    (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'origin/develop');
  return git([...common, `${base}...HEAD`]);
}

export function parseDiff(diff) {
  const files = [];
  let cur = null;
  let inHunk = false;

  for (const line of diff.split('\n')) {
    if (line.startsWith('diff --git ')) {
      const m = line.match(/^diff --git a\/(.+) b\/(.+)$/);
      cur = { path: m ? m[2] : line, deleted: false, added: [], removed: [] };
      files.push(cur);
      inHunk = false;
      continue;
    }
    if (!cur) continue;
    if (line.startsWith('@@')) {
      inHunk = true;
      continue;
    }
    if (!inHunk) {
      if (line.startsWith('deleted file mode')) cur.deleted = true;
      continue;
    }
    if (line.startsWith('+')) cur.added.push(line.slice(1));
    else if (line.startsWith('-')) cur.removed.push(line.slice(1));
  }
  return files;
}

const isComment = (l) => /^\s*(?:\/\/|\/\*|\*)/.test(l);
const code = (lines) => lines.filter((l) => !isComment(l));
const count = (lines, patterns) =>
  code(lines).filter((l) => patterns.some((p) => p.test(l))).length;
const countOne = (lines, pattern) => code(lines).filter((l) => pattern.test(l)).length;
const matches = (lines, patterns) =>
  code(lines).filter((l) => patterns.some((p) => p.test(l)));
const matchesRaw = (lines, patterns) => lines.filter((l) => patterns.some((p) => p.test(l)));

export function analyze(files) {
  const failures = [];
  const warnings = [];

  for (const f of files) {
    if (CONFIG.selfPathPattern.test(f.path)) continue;
    const isTest = CONFIG.testPathPatterns.some((p) => p.test(f.path));

    if (isTest) {
      if (f.deleted) {
        failures.push(`${f.path}\n    删除了整个测试文件`);
        continue;
      }

      const aAdd = count(f.added, CONFIG.assertionPatterns);
      const aDel = count(f.removed, CONFIG.assertionPatterns);
      if (aDel > aAdd) {
        failures.push(
          `${f.path}\n    断言净减少：删 ${aDel} 条，增 ${aAdd} 条（净 -${aDel - aAdd}）`
        );
      }

      const cAdd = countOne(f.added, CONFIG.testCasePattern);
      const cDel = countOne(f.removed, CONFIG.testCasePattern);
      if (cDel > cAdd) {
        failures.push(
          `${f.path}\n    测试用例净减少：删 ${cDel} 个，增 ${cAdd} 个（净 -${cDel - cAdd}）`
        );
      }

      const skips = matches(f.added, CONFIG.skipMarkerPatterns);
      if (skips.length) {
        failures.push(
          `${f.path}\n    新增 ${skips.length} 处跳过/只跑标记：\n` +
            skips.map((s) => `      + ${s.trim()}`).join('\n')
        );
      }

      const strongDel = countOne(f.removed, CONFIG.strongMatcherPattern);
      const weakAdd = countOne(f.added, CONFIG.weakMatcherPattern);
      if (strongDel > 0 && weakAdd > 0) {
        warnings.push(
          `${f.path}\n    疑似放宽匹配：删 ${strongDel} 处精确匹配，增 ${weakAdd} 处宽松匹配（请人工看 diff）`
        );
      }
    }

    if (
      CONFIG.disableCheckFileFilter.test(f.path) &&
      !CONFIG.disableCheckFileExclude.test(f.path)
    ) {
      const off = matchesRaw(f.added, CONFIG.disableCheckPatterns);
      if (off.length) {
        warnings.push(
          `${f.path}\n    新增 ${off.length} 处关闭类型/lint 检查：\n` +
            off.map((s) => `      + ${s.trim()}`).join('\n')
        );
      }
    }

    if (/(^|\/)package\.json$/.test(f.path)) {
      const swallow = f.added.filter((l) => CONFIG.swallowFailurePattern.test(l));
      if (swallow.length) {
        warnings.push(
          `${f.path}\n    新增 \`|| true\`，可能让失败的命令也算成功：\n` +
            swallow.map((s) => `      + ${s.trim()}`).join('\n')
        );
      }
    }
  }
  return { failures, warnings };
}

export function findAck(env = process.env) {
  const fromEnv = (env.TEST_WEAKEN_ACK || '').trim();
  if (fromEnv.length >= CONFIG.minAckLength) return fromEnv;

  const m = (env.PR_BODY || '').match(/^\s*Test-Weakening-Ack:\s*(\S.*)$/im);
  if (m && m[1].trim().length >= CONFIG.minAckLength) return m[1].trim();
  return null;
}

export function decideExit({ failures, warnings, strict, ack }) {
  const blocking = failures.length + (strict ? warnings.length : 0);
  if (!blocking) return 0;
  if (ack) return 0;
  return 1;
}

export function main() {
  const files = parseDiff(getDiff());
  const { failures, warnings } = analyze(files);

  if (!failures.length && !warnings.length) {
    console.log('✓ 未发现测试弱化迹象。');
    return 0;
  }

  if (failures.length) {
    console.log(`\n✗ 发现 ${failures.length} 处需要确认的测试弱化：\n`);
    failures.forEach((f) => console.log(`  • ${f}\n`));
  }
  if (warnings.length) {
    console.log(`\n⚠ ${warnings.length} 条提示（请人工看一眼）：\n`);
    warnings.forEach((w) => console.log(`  • ${w}\n`));
  }

  const ack = findAck();
  const code = decideExit({
    failures,
    warnings,
    strict: flag('--strict'),
    ack
  });
  if (code === 0 && ack && (failures.length || (flag('--strict') && warnings.length))) {
    console.log(`已确认（原因：${ack}）。放行，但请在评审时核对这些改动。`);
    return 0;
  }
  if (code === 0) return 0;

  console.log(
    [
      '如果这些改动是有意的，请显式说明原因后再提交：',
      '  本地：  TEST_WEAKEN_ACK="原因" git commit ...',
      '  PR：    在 PR 描述里加一行  Test-Weakening-Ack: <原因>',
      '新增测试、新增断言不会触发本检查。',
      '政策：focus-tiger/docs/COMPLIANCE.md §5'
    ].join('\n')
  );
  return 1;
}

const isCli = process.argv[1] && process.argv[1].endsWith('check-test-weakening.mjs');
if (isCli) {
  try {
    process.exit(main());
  } catch (err) {
    console.error('check-test-weakening 运行出错：', err.message);
    process.exit(2);
  }
}
