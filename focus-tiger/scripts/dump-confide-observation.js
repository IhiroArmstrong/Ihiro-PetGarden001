#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Read Confide observation telemetry from Electron jsonl (default path) or stdin JSON.
 *
 * Usage:
 *   node scripts/dump-confide-observation.js
 *   node scripts/dump-confide-observation.js --file /path/to/confide-observation.jsonl
 *   cat exported-events.json | node scripts/dump-confide-observation.js --stdin
 */

import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { summarizeConfideObservationEvents } from '../src/core/confide/confideObservationTelemetry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function defaultElectronLogPath() {
  const home = homedir();
  if (process.platform === 'darwin') {
    return path.join(
      home,
      'Library/Application Support/Focus Tiger/companion-l2/confide-observation.jsonl'
    );
  }
  if (process.platform === 'win32') {
    return path.join(
      home,
      'AppData/Roaming/Focus Tiger/companion-l2/confide-observation.jsonl'
    );
  }
  return path.join(home, '.config/Focus Tiger/companion-l2/confide-observation.jsonl');
}

/**
 * @param {string} raw
 * @returns {object[]}
 */
function parseEvents(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [];
  }
  return trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function readStdin() {
  const rl = createInterface({ input: process.stdin });
  /** @type {string[]} */
  const lines = [];
  for await (const line of rl) lines.push(line);
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  let raw = '';
  if (args.includes('--stdin')) {
    raw = await readStdin();
  } else {
    const fileIndex = args.indexOf('--file');
    const filePath =
      fileIndex >= 0 && args[fileIndex + 1]
        ? path.resolve(args[fileIndex + 1])
        : defaultElectronLogPath();
    try {
      raw = await readFile(filePath, 'utf8');
      console.log(`# source: ${filePath}`);
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? error.code : '';
      if (code === 'ENOENT') {
        console.error(`No log file at ${filePath}`);
        console.error(
          'Export localStorage instead: JSON.parse(localStorage.getItem("focus-tiger.confide-observation.v1"))'
        );
        process.exit(1);
      }
      throw error;
    }
  }

  const events = parseEvents(raw);
  const summary = summarizeConfideObservationEvents(events);
  console.log(JSON.stringify({ eventCount: events.length, summary }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
