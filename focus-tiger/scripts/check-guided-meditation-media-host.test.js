/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  GUIDED_MEDITATION_LESSONS_PATH,
  evaluateGuidedMediaHostGate,
  mediaHostLooksLikeR2Dev,
  parseGuidedMeditationMediaHosts,
  parseMusicLicenseFields,
  evaluateMusicLicenseGate,
  runGuidedMediaHostCheck
} from './check-guided-meditation-media-host.js';

describe('mediaHostLooksLikeR2Dev', () => {
  it('matches pub r2.dev hosts', () => {
    assert.equal(
      mediaHostLooksLikeR2Dev('https://pub-abc.r2.dev'),
      true
    );
  });

  it('allows a custom media subdomain', () => {
    assert.equal(
      mediaHostLooksLikeR2Dev('https://media.example.com'),
      false
    );
  });
});

describe('evaluateGuidedMediaHostGate', () => {
  it('inventory mode warns but stays green on r2.dev', () => {
    const r = evaluateGuidedMediaHostGate({
      host: 'https://pub-x.r2.dev',
      mode: 'inventory'
    });
    assert.equal(r.ok, true);
    assert.equal(r.r2, true);
  });

  it('release mode fails on r2.dev', () => {
    const r = evaluateGuidedMediaHostGate({
      host: 'https://pub-x.r2.dev',
      mode: 'release'
    });
    assert.equal(r.ok, false);
    assert.match(r.message, /RELEASE GATE FAIL/);
  });

  it('release mode fails if a lesson URL still points at r2.dev', () => {
    const r = evaluateGuidedMediaHostGate({
      host: 'https://media.example.com',
      urls: ['https://pub-x.r2.dev/v1/short.mp4'],
      mode: 'release'
    });
    assert.equal(r.ok, false);
  });

  it('passes release mode on a custom host', () => {
    const r = evaluateGuidedMediaHostGate({
      host: 'https://media.example.com',
      urls: ['https://media.example.com/v1/short.mp4'],
      mode: 'release'
    });
    assert.equal(r.ok, true);
    assert.equal(r.r2, false);
  });
});

describe('runGuidedMediaHostCheck against catalog source', () => {
  it('parses the live host constant', () => {
    const source = readFileSync(GUIDED_MEDITATION_LESSONS_PATH, 'utf8');
    const parsed = parseGuidedMeditationMediaHosts(source);
    assert.match(parsed.host, /^https?:\/\//);
  });

  it('this knife would have failed --release-gate while host is still r2.dev', () => {
    const live = runGuidedMediaHostCheck({ releaseGate: true });
    const inventory = runGuidedMediaHostCheck({ releaseGate: false });
    if (live.r2) {
      assert.equal(live.ok, false);
      assert.equal(inventory.ok, true);
    } else {
      assert.equal(live.ok, true);
      assert.equal(inventory.ok, true);
    }
  });
});

describe('music license release gate', () => {
  const filled = `## 配乐授权

| 字段 | 值 |
|---|---|
| 来源 | 成片合轨配乐 |
| 授权范围 | App 内播放 |
| 核实日期 | 2026-11-05 |

## 空行模板

| 字段 | 值 |
|---|---|
| lessonId | |
`;

  it('ignores the empty-row template and accepts a filled license table', () => {
    const parsed = parseMusicLicenseFields(filled);
    assert.equal(parsed.emptyKeys.length, 0);
    const r = evaluateMusicLicenseGate({ markdown: filled, mode: 'release' });
    assert.equal(r.ok, true);
    assert.equal(r.empty, false);
  });

  it('fails --release-gate on an empty license cell, but inventory stays green', () => {
    const empty = `## 配乐授权

| 字段 | 值 |
|---|---|
| 来源 | |
| 授权范围 | App 内播放 |
| 核实日期 | 2026-11-05 |
`;
    const release = evaluateMusicLicenseGate({ markdown: empty, mode: 'release' });
    const inventory = evaluateMusicLicenseGate({
      markdown: empty,
      mode: 'inventory'
    });
    assert.equal(release.ok, false);
    assert.equal(inventory.ok, true);
    assert.match(release.message, /empty cell/);
  });

  it('live inventory has the three license cells filled', () => {
    const live = runGuidedMediaHostCheck({ releaseGate: false });
    assert.equal(live.licenseEmpty, false);
  });
});
