# CryptoHorizon

Kripto para ve döviz kurlarını tek bir sayfada takip etmek için yaptığım basit bir panel. Sadece HTML/CSS/JS ile yazıldı. Hiçbir build aracı, framework ya da backend yok.

## Özellikler

- Popüler kripto paraların anlık fiyatları ve 24 saatlik değişimleri
- Fiyat grafiği (Chart.js) — coin ve zaman aralığı seçilebilir
- Döviz kuru geçmişi grafiği (USD/TRY, EUR/TRY, GBP/TRY, EUR/USD)
- Döviz çevirici — kur değişince otomatik güncellenir
- Korku & Açgözlülük Endeksi göstergesi
- Trend olan coinler
- En çok kazandıran/kaybettiren coinler tablosu
- Altta kayan canlı fiyat şeridi
- Tüm bölümler açılır/kapanır (accordion)

## Kullanılan API'ler

| Veri | Kaynak |
|---|---|
| Kripto fiyatları, global piyasa verisi, trend coinler | [CoinGecko](https://www.coingecko.com/en/api) (anahtarsız, public) |
| Döviz kurları (çevirici) | [open.er-api.com](https://www.exchangerate-api.com/) |
| Döviz kuru geçmişi | [Frankfurter](https://frankfurter.dev) |
| Korku & Açgözlülük Endeksi | [alternative.me](https://alternative.me/crypto/fear-and-greed-index/) |

Hepsi ücretsiz ve API key gerektirmiyor. Public API'ler zaman zaman rate-limit atabiliyor, bu yüzden istekler kısa bir retry mantığıyla sarmalandı (`fetchJSON` helper'ı, `js/app.js` içinde).

## Yenilemeler
- Kripto fiyatları ve şerit: 30 saniyede bir yenileniyor
- Döviz kurları / çevirici: 30 saniyede bir yenileniyor
- Global piyasa istatistikleri: 90 saniyede bir
- Korku & Açgözlülük Endeksi: 5 dakikada bir
- Trend coinler: 5 dakikada bir

## Yerelde çalıştırma

Build adımı yok. `index.html`'i tarayıcıda açman yeterli. İstersen basit bir local server ile de açabilirsin:

```bash
python3 -m http.server 8000
```

sonra `http://localhost:8000` adresine git.

## Notlar

- Fiyatlar bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.
- Bazı public API'ler tarayıcıdan yapılan sık isteklerde rate limit uygulayabilir; bu durumda ilgili kart "veri alınamadı" mesajı gösterir ve bir sonraki periyodik yenilemede tekrar dener.

---
Made by **Fahoz**
