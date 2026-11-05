#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 *
 * Upload guided-meditation delivery files to R2 with long-lived Cache-Control.
 *
 * Requires: wrangler logged in, bucket `focus-tiger-guided-media` (or FT_GUIDED_MEDIA_BUCKET).
 *
 * Example:
 *   node scripts/guided-meditation-r2-upload.mjs \
 *     --lesson concepts-habits-intro \
 *     --hash 94b8f05596d5654f \
 *     --video ./out/delivery-video.mp4 \
 *     --audio ./out/delivery-audio.m4a
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CACHE_CONTROL = 'public, max-age=31536000, immutable';
const PREFIX = 'guided-meditation/v1';

function usage() {
  console.error(`Usage: node scripts/guided-meditation-r2-upload.mjs \\
  --lesson <lessonId> [--video <path.mp4>] [--audio <path.m4a>] [--hash <optional canonical key>]`);
  process.exit(1);
}

function parseArgs(argv) {
  /** @type {Record<string, string>} */
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith('--')) continue;
    const val = argv[i + 1];
    if (!val || val.startsWith('--')) usage();
    out[key.slice(2)] = val;
    i += 1;
  }
  return out;
}

function sha256File(filePath) {
  const hash = createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function putObject(bucket, key, filePath, contentType) {
  const cloudDir = path.join(dirname(fileURLToPath(import.meta.url)), '../cloud');
  const res = spawnSync(
    'npx',
    [
      'wrangler',
      'r2',
      'object',
      'put',
      `${bucket}/${key}`,
      `--file=${filePath}`,
      `--content-type=${contentType}`,
      `--cache-control=${CACHE_CONTROL}`,
      '--remote'
    ],
    { stdio: 'inherit', env: process.env, cwd: cloudDir }
  );
  if (res.status !== 0) {
    throw new Error(`r2_put_failed:${key}`);
  }
}

const args = parseArgs(process.argv);
const lesson = String(args.lesson || '').trim();
const hash = String(args.hash || '').trim();
const videoPath = args.video ? path.resolve(args.video) : '';
const audioPath = args.audio ? path.resolve(args.audio) : '';
const bucket = String(process.env.FT_GUIDED_MEDIA_BUCKET || 'focus-tiger-guided-media');

if (!lesson) usage();
if (!videoPath && !audioPath) usage();

if (videoPath) {
  if (!fs.existsSync(videoPath)) {
    console.error('missing video file', videoPath);
    process.exit(1);
  }
  const videoKey = `v1/${lesson}.mp4`;
  putObject(bucket, videoKey, videoPath, 'video/mp4');
  console.log('video', videoKey, 'sha256', sha256File(videoPath));
  if (hash) {
    const hashed = `${PREFIX}/${lesson}/${hash}.mp4`;
    putObject(bucket, hashed, videoPath, 'video/mp4');
    console.log('video-canonical', hashed);
  }
}

if (audioPath) {
  if (!fs.existsSync(audioPath)) {
    console.error('missing audio file', audioPath);
    process.exit(1);
  }
  const audioKey = `v1/${lesson}.m4a`;
  putObject(bucket, audioKey, audioPath, 'audio/mp4');
  console.log('audio', audioKey, 'sha256', sha256File(audioPath), 'bytes', fs.statSync(audioPath).size);
}

console.log('Cache-Control', CACHE_CONTROL);
console.log('Done. Update DELIVERY sha256/bytes in guidedMeditationLessons.js');
