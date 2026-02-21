# 🌍 Travel Atlas

Çok dilli seyahat öneri platformu. Koyu tema, Leaflet harita entegrasyonu, JSON tabanlı CMS ve admin paneli.

**[Canlı Demo →](https://aderimo.github.io/Gazbadi/)**

## Özellikler

- 🌐 Çok dilli destek (TR / EN)
- 🗺️ Leaflet interaktif haritalar ve rota görselleştirme
- 📝 Blog, lokasyon rehberleri, arkadaş deneyimleri
- 🔒 Admin paneli (içerik yönetimi, CRUD)
- 🎨 Koyu tema glassmorphism tasarım
- ⚡ Static export — GitHub Pages uyumlu
- 📱 Tam responsive tasarım

## Kurulum

```bash
npm install
npm run dev
```

`http://localhost:3000` adresinde açılır.

## Admin Paneli

`/login` adresinden giriş yapılır. Giriş sonrası `/admin` sayfasına yönlendirilirsiniz.

## GitHub Pages Deploy

1. GitHub'da yeni repo oluştur
2. Kodu push et
3. Settings → Pages → Source: "GitHub Actions" seç
4. `main` branch'e push yapıldığında otomatik deploy edilir

## Teknolojiler

- Next.js 14 (App Router, Static Export)
- TypeScript
- Tailwind CSS
- Leaflet / React-Leaflet
- Vitest

## Lisans

MIT
