import { NextResponse } from "next/server";

// Cache the result in-memory on the serverless function instance
let cachedPrice: { price: number | null; fetched_at: string } | null = null;
let cacheExpiry = 0;

const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function GET() {
  // Return cached result if still valid
  const now = Date.now();
  if (cachedPrice && now < cacheExpiry) {
    return NextResponse.json({
      ...cachedPrice,
      cached: true,
      cache_expires_in_s: Math.round((cacheExpiry - now) / 1000),
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  }

  const token = process.env.OIL_PRICE_API_TOKEN;

  if (!token) {
    // Fall back to seed data from snapshot
    return NextResponse.json(
      { error: "OIL_PRICE_API_TOKEN not configured", price: null, cached: false },
      {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=3600" },
      }
    );
  }

  try {
    const res = await fetch("https://api.oilpriceapi.com/v1/prices/latest", {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error("Oil Price API error:", res.status, res.statusText);

      // If rate limited, return cached data if we have it, even if expired
      if (res.status === 429 && cachedPrice) {
        return NextResponse.json({
          ...cachedPrice,
          cached: true,
          rate_limited: true,
        }, {
          headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" },
        });
      }

      return NextResponse.json(
        { error: "API request failed", price: null, cached: false },
        {
          status: 200,
          headers: { "Cache-Control": "public, s-maxage=300" },
        }
      );
    }

    const data = await res.json();
    const brentPrice = data?.data?.price?.value ?? data?.data?.prices?.[0]?.value ?? null;

    // Update cache
    cachedPrice = {
      price: brentPrice,
      fetched_at: new Date().toISOString(),
    };
    cacheExpiry = now + CACHE_DURATION_MS;

    return NextResponse.json({
      price: brentPrice,
      currency: "USD",
      unit: "bbl",
      fetched_at: cachedPrice.fetched_at,
      cached: false,
    }, {
      headers: {
        // Tell Vercel edge to cache for 15 min, serve stale for 30 min while revalidating
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    console.error("Oil Price API fetch error:", error);

    // Return stale cache if available
    if (cachedPrice) {
      return NextResponse.json({
        ...cachedPrice,
        cached: true,
        error: "Fetch failed, returning cached data",
      }, {
        headers: { "Cache-Control": "public, s-maxage=300" },
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch oil price", price: null, cached: false },
      {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=300" },
      }
    );
  }
}
