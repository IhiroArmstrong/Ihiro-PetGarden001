# Twinsology marketing site · Slice 0 + Slice 1 + Slice 2

Static public face for **`https://twinsology.com`**. Not the Focus Tiger practice app.

Authority: `focus-tiger/docs/task-briefs/task-marketing-site.md` · Slice 1: `task-marketing-site-slice-1.md` · Slice 2: `task-marketing-site-slice-2.md`.

## Local preview

Open `marketing-site/index.html` in Safari, or from the repository root:

```bash
python3 -m http.server 4173 --directory marketing-site
```

Then `http://127.0.0.1:4173/`. Check 375px with Safari Responsive Design Mode.

Contract tests:

```bash
node --test marketing-site/slice0-contract.test.js
```

## Deploy (Cloudflare Pages · same ihiro account)

**Production** (`twinsology.com` / `www`) only updates when the deploy branch matches the Pages **production branch** (`develop` for `twinsology-marketing`). Without `--branch develop`, `wrangler` creates a **preview** deployment (e.g. `feature-….pages.dev`) and the custom domain stays on the old build.

```bash
cd /path/to/repo/marketing-site
git checkout develop && git pull origin develop
npx wrangler pages deploy . \
  --project-name twinsology-marketing \
  --branch develop \
  --commit-dirty=true
```

Verify: `curl -sI https://www.twinsology.com/` → **301** `Location: https://twinsology.com/`.

Custom domains: `twinsology.com` and `www.twinsology.com`. **www must 301 to apex** (`_worker.js` + `www-redirect.js`). Pages `_redirects` cannot do hostname redirects. Deploy the `marketing-site/` folder itself so `_worker.js` is bundled — `wrangler pages deploy marketing-site` from the repo root looks for `./functions` beside the repo, not `marketing-site/functions/`, so the old middleware never ran in production.

**Do not** edit MX / SPF / DKIM / DMARC / Resend records. Website records only.

## Slice 1 (2026-09-08)

- Hero: 2D Yin idle still + `Walking the Yin Way?`
- Primary CTA: **See the companion** → `#companion` showcase
- Secondary CTA: **Write to Yin** → mailto
- Three in-app stills under `assets/`
- Static `privacy.html` + `wellness.html`

## Slice 2 (2026-09-08)

- **Early Yin Community** section after showcase
- Five-space short journey (Newcomers → The Den)
- **Join the laboratory** → `COMMUNITY_SLACK_INVITE_URL` in `communityLink.js` (new tab). App **Join our community** → `https://twinsology.com/#community`.
- No `#the-den` deep links

## Does not

- Host the Vite practice shell
- Link `*.workers.dev`
- Change `communityLink.js` or Stay in touch
- Promise App Store / download until a real public URL exists
