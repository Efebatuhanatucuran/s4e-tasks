# S4E Task — Playwright Test Suite

Bu proje, S4E platformunun sign-in, forgot password, FAQ ve contact sayfalarını kapsayan otomatik UI testlerini içerir.

## Gereksinimler

- [Node.js](https://nodejs.org/) v18+
- npm

## Kurulum

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Playwright browser'larını yükle
npx playwright install
```

## Ortam Değişkenleri

Testler çalışmadan önce `.env` dosyası oluşturulmalıdır:

```bash
cp .env.example .env
```

Ardından `.env` dosyasını kendi ortamınıza göre düzenleyin:

| Değişken        | Açıklama                                      | Varsayılan              |
|-----------------|-----------------------------------------------|-------------------------|
| `BASE_URL`      | Ana uygulama URL'i (sign-in, dashboard vb.)   | `http://localhost:3000` |
| `MARKETING_URL` | Marketing sitesi URL'i (faq, contact vb.)     | `http://localhost:3001` |

> `.env` dosyası oluşturulmasa da testler varsayılan `localhost` değerleriyle çalışmaya çalışır.

## Testleri Çalıştırma

```bash
# Tüm testleri çalıştır (headless)
npx playwright test

# Belirli bir browser ile çalıştır
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# UI modunda çalıştır (görsel)
npx playwright test --ui

# Test raporunu görüntüle
npx playwright show-report
```

## Test Kapsamı

| Bölüm | Test Sayısı | Konu |
|-------|-------------|------|
| Bölüm 1 | TC-001 – TC-011 | Sign-In sayfası |
| Bölüm 2 | TC-012 – TC-017 | Forgot Password |
| Bölüm 3 | TC-018 – TC-023 | URL Parametre Manipülasyonu |
| Bölüm 4 | TC-024 – TC-032 | FAQ Arama |
| Bölüm 5 | TC-033 – TC-041 | Contact Formu |

## Notlar

- Testler gerçek ortama bağlı olduğundan uygulamaların ayakta olması gerekir.
- CI ortamında `CI=true` env değişkeni set edilirse testler sıralı çalışır ve 2 kez retry yapar.
