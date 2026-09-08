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

```bash
cd /path/to/repo
npx wrangler pages deploy marketing-site --project-name twinsology-marketing
```

Custom domains: `twinsology.com` and `www.twinsology.com` (www redirects to apex).

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
- **Join the laboratory** → same shared invite as `communityLink.js` (new tab)
- No `#the-den` deep links

## Does not

- Host the Vite practice shell
- Link `*.workers.dev`
- Change `communityLink.js` or Stay in touch
- Promise App Store / download until a real public URL exists
