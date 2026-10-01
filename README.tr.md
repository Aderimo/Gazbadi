<div align="center">

# Travel Atlas

**Gerçekten sizin olan çok dilli bir seyahat rehberi — haritalar, rotalar ve hikâyeler.**

[![Canlı Demo](https://img.shields.io/badge/canlı%20demo-aderimo.github.io%2FGazbadi-5B7CFF)](https://aderimo.github.io/Gazbadi/)
[![Lisans](https://img.shields.io/badge/lisans-MIT-4ADE80)](LICENSE)
[![Altyapı](https://img.shields.io/badge/Next.js_14_%2B_Leaflet_%2B_Tailwind-6B7280)](#teknolojiler)

Çok dilli seyahat öneri platformu: koyu glassmorphism tasarım, interaktif Leaflet
haritalar, rota görselleştirme ve admin panelli JSON tabanlı CMS — statik export
edilir, GitHub Pages'e ücretsiz dağıtılır.

[Türkçe](README.tr.md) · [English](README.md)

</div>

---

## Neden?

Seyahat içerikleri genelde kontrolünüzde olmayan platformlarda yaşar. Travel Atlas
kendi mülkünüzde bir atlas: rotalarınız, fotoğraflarınız, arkadaşlarınızın
deneyimleri — bakım gerektiren bir sunucu olmadan statik site olarak yayında.

## Özellikler

- 🌐 **Çok dilli destek** — TR / EN içerik
- 🗺️ **Leaflet interaktif haritalar** ve rota görselleştirme
- 📝 **Blog, lokasyon rehberleri, arkadaş deneyimleri**
- 🔒 **Admin paneli** — içerik yönetimi, CRUD (`/login` → `/admin`)
- 🎨 **Koyu tema glassmorphism tasarım**
- ⚡ **Static export** — GitHub Pages uyumlu
- 📱 **Tam responsive tasarım**

## Kurulum

```bash
npm install
npm run dev
```

`http://localhost:3000` adresinde açılır.

## Admin paneli

`/login` adresinden giriş yapılır. Giriş sonrası `/admin` sayfasına yönlendirilirsiniz.

## GitHub Pages deploy

1. Kodu repoya push et
2. Settings → Pages → Source: **GitHub Actions** seç
3. `main` branch'e her push'ta otomatik deploy edilir

## Teknolojiler

| Katman | Seçim |
| --- | --- |
| Framework | Next.js 14 (App Router, static export) |
| Dil | TypeScript |
| Arayüz | Tailwind CSS |
| Haritalar | Leaflet / React-Leaflet |
| Testler | Vitest |

## Lisans

[MIT](LICENSE)
