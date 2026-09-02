# Twinsology marketing site · Slice 0

Static public face for **`https://twinsology.com`**. Not the Focus Tiger practice app.

Authority: `focus-tiger/docs/task-briefs/task-marketing-site.md`.

## Local preview

Open `marketing-site/index.html` in Safari, or from the repository root:

```bash
python3 -m http.server 4173 --directory marketing-site
```

Then `http://127.0.0.1:4173/`. Check 375px with Safari Responsive Design Mode.

## Deploy (Cloudflare Pages · same ihiro account)

Cloud Agents cannot log into Cloudflare. On a machine that already deploys `focus-tiger-cloud`:

```bash
cd /path/to/repo
npx wrangler pages project create twinsology-marketing --production-branch develop
npx wrangler pages deploy marketing-site --project-name twinsology-marketing
```

Then in the dashboard: **Custom domains** → `twinsology.com` and `www.twinsology.com` (www redirects to apex).

**Live (2026-09-03)**: `https://twinsology.com` · Pages project `twinsology-marketing`.

**Do not** edit MX / SPF / DKIM / DMARC / Resend records. Website records only.

## Slice 0 does not

- Host the Vite practice shell
- Link `*.workers.dev`
- Change `communityLink.js` or Stay in touch
- Bind DNS by itself (needs your Cloudflare login)
