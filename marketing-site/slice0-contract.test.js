/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(dir, '..');
const html = readFileSync(join(dir, 'index.html'), 'utf8');
const css = readFileSync(join(dir, 'styles.css'), 'utf8');
const redirects = readFileSync(join(dir, '_redirects'), 'utf8');
const privacy = readFileSync(join(dir, 'privacy.html'), 'utf8');
const wellness = readFileSync(join(dir, 'wellness.html'), 'utf8');
const headers = readFileSync(join(dir, '_headers'), 'utf8');
const communityLink = readFileSync(
  join(repoRoot, 'focus-tiger/src/core/communityLink.js'),
  'utf8'
);
const sharedInviteMatch = communityLink.match(
  /COMMUNITY_SLACK_INVITE_URL\s*=\s*\n\s*'([^']+)'/
);
const sharedInviteUrl = sharedInviteMatch?.[1] ?? '';

describe('marketing-site Slice 0 contract', () => {
  it('uses the locked public hostname', () => {
    assert.match(html, /rel="canonical" href="https:\/\/twinsology\.com\/"/);
    assert.match(html, /mailto:hello@twinsology\.com/);
  });

  it('names the product and studio without a practice-app CTA', () => {
    assert.match(html, /Focus Tiger™/);
    assert.match(html, /Yin/);
    assert.match(html, /Twinsology/);
    assert.doesNotMatch(html, /workers\.dev/i);
    assert.doesNotMatch(html, /focustiger\.app/i);
  });

  it('keeps www → apex in Pages _worker.js, not domain-level _redirects', () => {
    assert.doesNotMatch(
      redirects,
      /https:\/\/www\.twinsology\.com\/\* https:\/\/twinsology\.com\/:splat 301/
    );
    const workerSource = readFileSync(join(dir, '_worker.js'), 'utf8');
    const redirectSource = readFileSync(join(dir, 'www-redirect.js'), 'utf8');
    assert.match(redirectSource, /www\.twinsology\.com/);
    assert.match(redirectSource, /url\.hostname = 'twinsology\.com'/);
    assert.match(redirectSource, /Response\.redirect\([^,]+,\s*301\)/);
    assert.match(workerSource, /env\.ASSETS\.fetch/);
  });

  it('uses the product wash, not an arcade palette', () => {
    assert.match(css, /--color-bg: #e8e6e1/);
    assert.match(css, /--color-accent: #b5623a/);
  });
});

describe('marketing-site Slice 1 contract', () => {
  it('shows Yin hero, brand tagline, and honest primary CTA', () => {
    assert.match(html, /Walking the Yin Way\?/);
    assert.match(html, /hero-yin-idle\.png/);
    assert.match(html, /href="#companion"[^>]*>See the companion</);
    assert.match(html, /class="cta-secondary"[^>]*href="mailto:hello@twinsology\.com"[^>]*>Write to Yin</);
  });

  it('includes three showcase panels for existing capabilities', () => {
    assert.match(html, /showcase-companion\.png/);
    assert.match(html, /showcase-ambience\.png/);
    assert.match(html, /showcase-quiet-line\.png/);
    assert.match(html, /Gentle companion/);
    assert.match(html, /Mindful rituals/);
    assert.match(html, /Quiet Line/);
  });

  it('links static privacy and medical disclaimer pages', () => {
    assert.match(html, /href="\.\/privacy\.html"/);
    assert.match(html, /href="\.\/wellness\.html"/);
    assert.match(privacy, /Privacy/);
    assert.match(wellness, /prevent any disease/i);
  });

  it('does not promise download or fake navigation', () => {
    assert.doesNotMatch(html, /Download App/i);
    assert.doesNotMatch(html, /\[ Practice \]/);
  });
});

describe('marketing-site Slice 2 contract', () => {
  it('uses the same Slack shared invite as communityLink.js', () => {
    assert.ok(sharedInviteUrl, 'communityLink.js must export COMMUNITY_SLACK_INVITE_URL');
    assert.match(sharedInviteUrl, /shared_invite/);
    assert.match(html, new RegExp(sharedInviteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.doesNotMatch(html, /#the-den/i);
  });

  it('describes the five-space journey without deep-linking channels', () => {
    assert.match(html, /Early Yin Community/);
    assert.match(html, /culture laboratory/i);
    assert.match(html, /Newcomers/);
    assert.match(html, /Journey/);
    assert.match(html, /Focus &amp; Flow/);
    assert.match(html, /Quiet Room/);
    assert.match(html, /The Den/);
    assert.match(html, />Join the laboratory</);
    assert.match(html, /rel="noopener noreferrer"/);
  });

  it('keeps calm tone without FOMO or download promises', () => {
    const communitySection = html.match(
      /<section id="community"[\s\S]*?<\/section>/
    )?.[0] ?? '';
    assert.ok(communitySection, 'community section must exist');
    assert.doesNotMatch(communitySection, /Download App/i);
    assert.doesNotMatch(communitySection, /limited time/i);
    assert.doesNotMatch(communitySection, /workers\.dev/i);
    assert.doesNotMatch(communitySection, /hurry/i);
  });

  it('centers the Slack note and keeps Yin square for WebKit', () => {
    assert.match(css, /\.community-note[\s\S]*?margin:\s*0\.85rem auto 0/);
    assert.match(css, /\.hero-yin[\s\S]*?aspect-ratio:\s*1\s*\/\s*1/);
    assert.doesNotMatch(css, /Iowan Old Style/);
    assert.match(headers, /\*\.css[\s\S]*Content-Type:\s*text\/css/);
  });
});
