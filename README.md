<div align="center">

# Travel Atlas

**A multilingual travel guide you actually own — maps, routes and stories, static-deployed.**

[![Live Demo](https://img.shields.io/badge/live%20demo-aderimo.github.io%2FGazbadi-5B7CFF)](https://aderimo.github.io/Gazbadi/)
[![License](https://img.shields.io/badge/license-MIT-4ADE80)](LICENSE)
[![Stack](https://img.shields.io/badge/Next.js_14_%2B_Leaflet_%2B_Tailwind-6B7280)](#tech-stack)

A multilingual travel recommendation platform: dark glassmorphism design, interactive
Leaflet maps, route visualization and a JSON-based CMS with an admin panel —
statically exported, so it deploys to GitHub Pages for free.

**English** · [Türkçe](README.tr.md)

</div>

---

## Why

Travel content usually lives on platforms you don't control. Travel Atlas is a
self-owned atlas: your routes, your photos, your friends' experiences — published as
a static site with no server to maintain.

## Features

- 🌐 **Multilingual** — TR / EN content
- 🗺️ **Interactive Leaflet maps** with route visualization
- 📝 **Blog, location guides and friend experiences**
- 🔒 **Admin panel** — content management, CRUD (`/login` → `/admin`)
- 🎨 **Dark-theme glassmorphism design**
- ⚡ **Static export** — GitHub Pages compatible
- 📱 **Fully responsive**

## Setup

```bash
git clone https://github.com/Aderimo/Gazbadi.git
cd Gazbadi
npm install
npm run dev
```

Opens at `http://localhost:3000`.

## Admin panel

Log in at `/login`; you are redirected to `/admin` afterwards.

## Deploy to GitHub Pages

1. Push the code to your repository
2. Settings → Pages → Source: **GitHub Actions**
3. Every push to `main` deploys automatically

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router, static export) |
| Language | TypeScript |
| UI | Tailwind CSS |
| Maps | Leaflet / React-Leaflet |
| Tests | Vitest |

## License

[MIT](LICENSE)

---

<div align="center">

Made by [Aderimo](https://gitgit.me/aderimo)

</div>
