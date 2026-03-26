import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.OIL_PRICE_API_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "OIL_PRICE_API_TOKEN not configured", price: null },
      { status: 200 }
    );
  }

  try {
    const res = await fetch("https://api.oilpriceapi.com/v1/prices/latest", {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 900 }, // Cache for 15 minutes
    });

    if (!res.ok) {
      console.error("Oil Price API error:", res.status, res.statusText);
      return NextResponse.json({ error: "API request failed", price: null }, { status: 200 });
    }

    const data = await res.json();

    // The API returns: { status: "success", data: { price: { ... }, prices: [...] } }
    // We want the Brent crude price
    const brentPrice = data?.data?.price?.value ?? data?.data?.prices?.[0]?.value ?? null;

    return NextResponse.json({
      price: brentPrice,
      currency: "USD",
      unit: "bbl",
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Oil Price API fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch oil price", price: null }, { status: 200 });
  }
}
