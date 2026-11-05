# Twinsology marketing site · Slice 0–3 + T87-C Samatia

Static public face. Product canonical is **`https://samatia.net/`**. Studio mail stays **`hello@twinsology.com`**. Not the practice app.

Until Cloudflare env `SAMATIA_CANONICAL_LIVE=1`, `https://twinsology.com` still serves this folder (same Pages project). Do not announce samatia.net or flip that flag before the T87-C trademark checklist.

Authority: `focus-tiger/docs/task-briefs/task-samatia-user-facing-rename.md` · `task-marketing-site.md` · Slice 1: `task-marketing-site-slice-1.md` · Slice 2: `task-marketing-site-slice-2.md`.

DNS / SPF / DMARC paste: `samatia-dns-cutover.txt`. Store-listing drafts: `store-listing-en.txt` · `store-listing-ja.txt`. Japanese first screen: `ja.html`.

## Local preview

Open `marketing-site/index.html` in Safari, or from the repository root:

```bash
python3 -m http.server 4173 --directory marketing-site
```

Then `http://127.0.0.1:4173/` (English) and `http://127.0.0.1:4173/ja.html` (Japanese first screen). Check 375px with Safari Responsive Design Mode.

Contract tests:

```bash
node --test marketing-site/slice0-contract.test.js marketing-site/www-redirect.test.js
```

## Deploy (Cloudflare Pages · same ihiro account)

**Production** (`twinsology.com` / `www`, later `samatia.net`) only updates when the deploy branch matches the Pages **production branch** (`develop` for `twinsology-marketing`). Without `--branch develop`, `wrangler` creates a **preview** deployment and the custom domain stays on the old build.

```bash
cd /path/to/repo/marketing-site
git checkout develop && git pull origin develop
npx wrangler pages deploy . \
  --project-name twinsology-marketing \
  --branch develop \
  --commit-dirty=true
```

Verify (before live flag): `curl -sI https://www.twinsology.com/` → **301** `Location: https://twinsology.com/`.

After `SAMATIA_CANONICAL_LIVE=1` and custom domains Active: `curl -sI https://twinsology.com/` → **301** `https://samatia.net/`.

Custom domains: attach `samatia.net` + `www.samatia.net` when the trademark checklist is done. **www.samatia.net must 301 to apex** (`_worker.js` + `www-redirect.js`). Pages `_redirects` cannot do hostname redirects. Deploy the `marketing-site/` folder itself so `_worker.js` is bundled.

**Do not** edit twinsology.com MX / SPF / DKIM / DMARC / Resend records. samatia.net mail uses reject SPF + DMARC only (see `samatia-dns-cutover.txt`).

## Slice 1 (2026-09-08)

- Hero: 2D Yin idle still + `Walking the Yin Way?`
- Trust line under the hero: `Your practice and what you tell Yin stay on this device.`
- Primary CTA: **See the companion** → `#companion` showcase
- Secondary CTA: **Write to Yin** → mailto
- Three in-app stills under `assets/`
- Static `privacy.html` + `wellness.html`

## Slice 2 (2026-09-08)

- **Early Yin Community** section after showcase
- Five-space short journey (Newcomers → The Den)
- **Join the laboratory** → `COMMUNITY_SLACK_INVITE_URL` in `communityLink.js` (new tab). App **Join our community** → `https://twinsology.com/#community` until the live flag; then samatia.net.
- No `#the-den` deep links

## T87-C (2026-11-06)

- Page product name **Samatia™**; English pronunciation line; Japanese first screen `Samatia（サマティア）`
- Canonical / OG → `https://samatia.net/`
- mailto still `hello@twinsology.com`
- twinsology.com → samatia.net 301 is **gated** on `SAMATIA_CANONICAL_LIVE`

## Does not

- Host the Vite practice shell
- Link `*.workers.dev`
- Change `communityLink.js` or Stay in touch
- Promise App Store / download until a real public URL exists
- Announce samatia.net or flip the live 301 without the trademark checklist
