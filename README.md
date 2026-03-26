# 🇦🇺 Australia Fuel Supply Tracker

Real-time dashboard tracking Australia's fuel supply chain — from the Strait of Hormuz through Asian refineries to the bowser at your local servo.

> **Purpose:** Help everyday Australians understand the current fuel crisis by showing where we stand and why — calm, factual, and explanatory. The dashboard a good journalist would build.

---

## 🔴 Live Status (Seed Data — March 2026)

| Metric | Value | Status |
|--------|-------|--------|
| Petrol Supply | 38 days | 🟡 AMBER |
| Diesel Supply | 30 days | 🟡 AMBER |
| Brent Crude | $96.68 USD/bbl | 🔴 RED |
| Strait of Hormuz | Restricted | 🔴 RED |
| Avg Petrol Price | 243.4¢/L | — |
| Avg Diesel Price | 260.0¢/L | — |

---

## 📐 Architecture

### Dashboard Sections (Supply Chain Left → Right)

1. **Hero Status Banner** — Traffic-light summary of key metrics
2. **Domestic Stocks** — Gauge charts for petrol & diesel days of supply, trend sparklines, MSO explainer
3. **Supply Chain Map** — Animated SVG: Middle East → Hormuz → South Korea/Singapore/Malaysia → Australia
4. **Global Drivers** — Brent crude price chart, Hormuz status, IEA release, crisis timeline
5. **Retail Impact** — Price trend charts, station outages by state, panic buying context, tips
6. **Scenarios** — What-if analysis: 2 weeks / 1–3 months / 3+ months disruption
7. **Footer** — Data sources, methodology, timestamps

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
├── snapshot.json          # Latest key metrics (weekly update)
├── stocks-history.json    # 12-week petrol & diesel stock trends
├── oil-prices.json        # 30-day Brent crude prices + events
├── retail-prices.json     # 30-day retail prices + outages by state
└── suppliers.json         # Asian supplier data + domestic refineries
```

**Live APIs:**
- `/api/oil-price` — Proxies Brent crude price from OilPriceAPI (15-min cache)
- `/api/fuel-prices` — Proxies NSW FuelCheck API for live retail prices (1-hour cache)

**Static data** (updated via GitHub commits):
- MSO weekly data (DCCEEW)
- JODI international refinery stocks (monthly)
- Australian Petroleum Statistics (monthly)

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
