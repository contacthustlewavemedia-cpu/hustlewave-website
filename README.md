# HustleWave Marketing Site

The HustleWave marketing website at hustlewave.net.

## Stack
- Plain HTML, CSS, JS
- Cloudflare Worker with static assets
- Editor-compatible architecture (see SKILL.md in HustleWave operations workspace)

## Editing content

All editable content lives in `content/site.json`. The `content-loader.js` script hydrates HTML from this file at page load.

To edit content:
- **Via the HustleWave client portal** (preferred, when available): log in and edit through the UI.
- **Direct edit on GitHub**: edit `content/site.json` and commit. Cloudflare auto-deploys in 1 to 2 minutes.

## Architecture
- `content/site.json` — single source of truth for editable content
- `content-loader.js` — hydrates HTML from JSON at page load
- HTML files have `data-content="path.to.field"` attributes on editable elements
- Default HTML content matches site.json so the site renders fine without JS

## Local dev
Serve the folder with any static server. Example:
```
python3 -m http.server 8080
```

## Deploy
Auto-deploys on push to `main` via Cloudflare Workers Git integration.
