import { NextResponse } from "next/server";

const KALSHI_URL =
  "https://api.elections.kalshi.com/trade-api/v2/markets?series_ticker=KXHORMUZNORM";

// Target cap_strike values — closest to May 2026, Jul 2026, Jan 2027
const TARGET_STRIKES = [20260501, 20260701, 20270101];

interface KalshiMarket {
  ticker: string;
  title: string;
  yes_sub_title: string;
  yes_bid_dollars: string;
  close_time: string;
  cap_strike: number;
  volume_fp: string;
  status: string;
}

export interface KalshiOdds {
  date: string; // e.g. "Before May 1, 2026"
  probability: number; // 0-100
  title: string;
  volume: number;
  status: string;
  ticker: string;
}

interface KalshiHistoryPoint {
  yes_price: number;
  ts: string;
}

// In-memory cache for serverless resilience
let cachedData: { markets: KalshiOdds[]; history: Record<string, KalshiHistoryPoint[]>; fetched_at: string } | null = null;
let cacheExpiry = 0;
const CACHE_MS = 3600 * 1000; // 1 hour

async function fetchHistory(ticker: string): Promise<KalshiHistoryPoint[]> {
  try {
    const res = await fetch(
      `https://api.elections.kalshi.com/trade-api/v2/markets/${ticker}/history?limit=30`,
      {
        next: { revalidate: 3600 },
        headers: { Accept: "application/json" },
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.history ?? []).map((h: { yes_price: number; ts: string }) => ({
      yes_price: h.yes_price,
      ts: h.ts,
    }));
  } catch {
    return [];
  }
}

export async function GET() {
  const now = Date.now();

  // Serve from cache if still fresh
  if (cachedData && now < cacheExpiry) {
    return NextResponse.json(
      { ...cachedData, cached: true },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  }

  try {
    const res = await fetch(KALSHI_URL, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error("Kalshi API error:", res.status, res.statusText);
      return fallbackOrError("Kalshi API returned " + res.status);
    }

    const json = await res.json();
    const allMarkets: KalshiMarket[] = json.markets ?? [];

    // Pick the best market for each target cap_strike.
    const selected: KalshiOdds[] = TARGET_STRIKES.map((target) => {
      let match = allMarkets.find(
        (m) => m.cap_strike === target && m.status !== "finalized"
      );

      if (!match) {
        const active = allMarkets.filter((m) => m.status === "active");
        if (active.length > 0) {
          active.sort(
            (a, b) =>
              Math.abs(a.cap_strike - target) -
              Math.abs(b.cap_strike - target)
          );
          match = active[0];
        }
      }

      if (!match && allMarkets.length > 0) {
        const sorted = [...allMarkets].sort(
          (a, b) =>
            Math.abs(a.cap_strike - target) - Math.abs(b.cap_strike - target)
        );
        match = sorted[0];
      }

      if (!match) {
        return {
          date: `Target ${target}`,
          probability: 0,
          title: "Market not found",
          volume: 0,
          status: "unavailable",
          ticker: "",
        };
      }

      const probability = Math.round(
        parseFloat(match.yes_bid_dollars) * 100
      );
      const volume = Math.round(parseFloat(match.volume_fp));

      return {
        date: match.yes_sub_title || match.close_time,
        probability,
        title: match.title,
        volume,
        status: match.status,
        ticker: match.ticker,
      };
    });

    // Fetch 30-day history for each selected market in parallel
    const tickers = selected.filter((m) => m.ticker).map((m) => m.ticker);
    const historyResults = await Promise.all(
      tickers.map(async (ticker) => ({
        ticker,
        history: await fetchHistory(ticker),
      }))
    );
    const history: Record<string, KalshiHistoryPoint[]> = {};
    for (const h of historyResults) {
      history[h.ticker] = h.history;
    }

    // Update cache
    cachedData = {
      markets: selected,
      history,
      fetched_at: new Date().toISOString(),
    };
    cacheExpiry = now + CACHE_MS;

    return NextResponse.json(cachedData, {
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Kalshi fetch error:", error);
    return fallbackOrError("Fetch failed");
  }
}

function fallbackOrError(reason: string) {
  if (cachedData) {
    return NextResponse.json(
      { ...cachedData, cached: true, stale: true, error: reason },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      }
    );
  }

  return NextResponse.json(
    { markets: null, history: null, error: reason },
    {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=300" },
    }
  );
}
