# CryptoHorizon
🌐 English | **[Türkçe](README.tr.md)**

A simple dashboard built to track cryptocurrency and foreign exchange rates on single page. It is written with HTML/CSS/JS. No build tools, frameworks, or backend.

## Features

- Real-time prices and 24-hour changes of popular cryptocurrencies
- Price Chart (Chart.js) — coin and time range selectable
- Historical exchange rate chart (USD/TRY, EUR/TRY, GBP/TRY, EUR/USD)
- Currency Converter — automatically updates when the exchange rate changes
- Fear & Greed Index indicator
- Trending coins
- Top gainers/losers coins table
- Ticker bar at the bottom with live rolling prices
- All sections are collapsible/expandable

## APIs Used

| Data | Source |
|---|---|
| Crypto prices, global market data, trending coins | [CoinGecko](https://www.coingecko.com/en/api) (no key, public) |
| Exchange rates (converter) | [open.er-api.com](https://www.exchangerate-api.com/) |
| Historical exchange rates | [Frankfurter](https://frankfurter.dev) |
| Fear & Greed Index | [alternative.me](https://alternative.me/crypto/fear-and-greed-index/) |

All APIs are free and do not require any API keys. Since public APIs may occasionally trigger rate limits, requests are wrapped with a brief retry logic (using the `fetchJSON` helper inside `js/app.js`).

## Data Refresh Intervals
- Crypto prices and ticker bar: Refreshes every 30 seconds
- Exchange rates / converter: Refreshes every 30 seconds
- Global market statistics: Refreshes every 90 seconds
- Fear & Greed Index: Refreshes every 5 minutes
- Trending coins: Refreshes every 5 minutes

## Running Locally

There is no build step. Simply open `index.html` in your browser. Alternatively, you can run it using a simple local server:

```bash
python3 -m http.server 8000
```

Then head to `http://localhost:8000` address.

## Notes

- All prices are for information, They are not investment advice.
- Some public APIs may apply rate limits for frequent requests made directly from the browser; in such cases, the relevant card will display a "data could not be retrieved" message and retry during the next periodic refresh.

---
Made by **Fahoz**
