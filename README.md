# 🇦🇺 Australia Fuel Supply Tracker

Real-time dashboard tracking Australia's fuel supply chain — from the Strait of Hormuz through Asian refineries to the bowser at your local servo.

> **Purpose:** Help everyday Australians understand the current fuel crisis by showing where we stand and why — calm, factual, and explanatory. The dashboard a good journalist would build.

---

## 🔴 Live Status (As of snapshot — see `/public/data/snapshot.json`)

| Metric | Value | Status |
|--------|-------|--------|
| Petrol Supply | 38 days | 🟡 AMBER |
| Diesel Supply | 30 days | 🟡 AMBER |
| Brent Crude | updated daily via GitHub Actions | 🔴 RED |
| Strait of Hormuz | Restricted | 🔴 RED |
| Avg Petrol Price | updated daily via GitHub Actions | — |
| Avg Diesel Price | updated daily via GitHub Actions | — |

> Brent crude and retail prices are updated automatically each day via GitHub Actions. MSO stock levels require a manual update from the DCCEEW weekly report (Fridays).

---

## 📐 Architecture

### Dashboard Layout

The dashboard uses a **4-column layer selector** as primary navigation. Users click a layer to expand its detail panel.

| Layer | Name | Key Metrics |
|-------|------|-------------|
| 1 | **Domestic Situation** | Retail prices, days of supply (gauges + sparklines), station outages, weekly demand |
| 2 | **Our Supply Chain** | Import source donut, refinery utilisation (6 countries), ship cancellations |
| 3 | **Global Picture** | Double Hop SVG map, Strait of Hormuz status, Brent crude chart, IEA emergency release |
| 4 | **Prediction Markets** | Kalshi odds for Hormuz normalisation (May/Jul 2026, Jan 2027), 30-day sparklines, scenario impacts |

Below the layer selector: a **Crisis Timeline** feed (ABC News RSS, filtered for fuel/energy keywords) and an **FAQ** section.

### Utility Pages

- `/bug` — Report a bug (submits to GitHub Issues)
- `/feedback` — Share feedback (submits to GitHub Issues)

### Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Supply Chain Map | Custom animated SVG |
| Hosting | Vercel-ready |

### Data Architecture

```
/public/data/
├── snapshot.json            # Latest key metrics (MSO: weekly manual; oil/retail: daily automated)
├── stocks-history.json      # 12-week petrol & diesel stock trends
├── oil-prices.json          # 30-day Brent crude prices + events (auto-updated daily)
├── retail-prices.json       # 30-day retail prices by fuel type (auto-updated daily)
├── suppliers.json           # Asian supplier data + domestic refineries
├── demand.json              # Weekly petrol & diesel demand (stub — AIP Weekly)
├── global-status.json       # Hormuz status, IEA release details
├── import-sources.json      # Import share by country (yearly)
├── outages.json             # Station outages by state
├── price-decomposition.json # Retail price breakdown (excise, crude, margin, etc.)
├── refinery-history.json    # Domestic refinery closures history
├── shipping.json            # Ship cancellations data
└── timeline.json            # Crisis timeline events (auto-updated daily from ABC News RSS)
```

**Live APIs:**
- `/api/oil-price` — Proxies Brent crude price from OilPriceAPI (15-min in-memory cache + CDN)
- `/api/fuel-prices` — Proxies NSW FuelCheck API for live retail prices (1-hour cache)
- `/api/kalshi` — Fetches Hormuz prediction market odds from Kalshi (1-hour cache + 30-day history)
- `/api/news` — Aggregates ABC News + Reuters RSS feeds (6-hour cache, top 20 items)
- `/api/submit-issue` — Accepts POST to create GitHub Issues (bug/feedback forms)

**Automated data updates (GitHub Actions):**
- `update-oil-price.yml` — Daily 7pm AEST: fetches Brent crude from OilPriceAPI, updates `oil-prices.json` + `snapshot.json`
- `update-retail-prices.yml` — Daily 6am AEST: fetches NSW FuelCheck averages, updates `retail-prices.json` + `snapshot.json`
- `update-timeline.yml` — Daily 8am AEST: fetches ABC News RSS, filters for fuel/energy keywords, appends to `timeline.json`
- `update-snapshot-data.yml` — Every Friday 9am AEST: runs `scripts/update-snapshot.js` *(stub — not yet implemented)*

**Manual update required:**
- MSO weekly data (DCCEEW) — copy from Friday report into `snapshot.json`
- JODI international refinery stocks (monthly)
- Station outages, shipping disruptions, import share

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NSW_FUEL_API_KEY=your_key_here       # From api.nsw.gov.au
OIL_PRICE_API_TOKEN=your_token_here  # From oilpriceapi.com
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

---

## 📊 Data Sources

| Source | What | Frequency | Access |
|--------|------|-----------|--------|
| [DCCEEW MSO Statistics](https://www.dcceew.gov.au/energy/security/australias-fuel-security/minimum-stockholding-obligation/statistics) | Days of supply, litres held, MSO headroom | Weekly (Fri) | Free download |
| [Australian Petroleum Statistics](https://data.gov.au) | Historical stocks, imports by origin, refinery throughput | Monthly | Free XLSX |
| [JODI Oil Database](https://www.jodidata.org) | S. Korea & Singapore refinery stocks | Monthly | Free CSV |
| [NSW FuelCheck API](https://api.nsw.gov.au) | Live retail prices (2,500+ stations) | Daily | Free API key |
| [WA FuelWatch](https://www.fuelwatch.wa.gov.au) | Next-day WA fuel prices | Daily | Free RSS |
| [Oil Price API](https://www.oilpriceapi.com) | Brent crude USD/bbl | Real-time | Free (100 req/mo) |
| [AIP](https://www.aip.com.au) | National average retail prices | Weekly | Free |
| [IEA](https://www.iea.org) | Emergency stockpile releases | Event-driven | Free |

---

## 🎨 Design

- **Dark theme** — `#0F172A` background, high-contrast data
- **Traffic-light colour coding** — Green (healthy) → Amber (watch) → Red (concern)
- **Typography** — DM Sans (body) + Space Mono (data/numbers)
- **Mobile-first** — Responsive at all breakpoints
- **Charts** — Gauges, sparklines, area charts, line charts via Recharts
- **Supply chain map** — Animated SVG with pulsing nodes and dashed flow lines

---

## 🗺️ Roadmap (v2)

- [ ] Tanker tracking (AIS data from MarineTraffic)
- [ ] State-level stock breakdown
- [ ] Jet fuel & LPG tracking
- [ ] Price prediction model
- [ ] Scheduled GitHub Actions to auto-update data files
- [ ] WA FuelWatch RSS integration
- [ ] EV charging load and public transport surge data

---

## 📝 License

MIT — built for public awareness.
