import { NextResponse } from "next/server";

export const revalidate = 3600;

const OAUTH_URL =
  "https://api.onegov.nsw.gov.au/oauth/client_credential/accesstoken?grant_type=client_credentials";
const PRICES_URL = "https://api.onegov.nsw.gov.au/FuelPriceCheck/v2/fuel/prices";

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(key: string, secret: string): Promise<string | null> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.token;
  }

  const basic = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(OAUTH_URL, {
    method: "GET",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("NSW OAuth token error:", res.status, res.statusText);
    return null;
  }

  const data = await res.json();
  const token: string | undefined = data?.access_token;
  const expiresIn = Number(data?.expires_in ?? 3599);
  if (!token) return null;

  tokenCache = { token, expiresAt: now + expiresIn * 1000 };
  return token;
}

function formatNswTimestamp(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

export async function GET() {
  const apiKey = process.env.NSW_FUEL_API_KEY;
  const apiSecret = process.env.NSW_FUEL_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "NSW_FUEL_API_KEY or NSW_FUEL_API_SECRET not configured", data: null },
      { status: 200 }
    );
  }

  try {
    const token = await getAccessToken(apiKey, apiSecret);
    if (!token) {
      return NextResponse.json(
        { error: "Failed to obtain NSW Fuel API access token", data: null },
        { status: 200 }
      );
    }

    const res = await fetch(PRICES_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: apiKey,
        "Content-Type": "application/json",
        transactionid: `afs-${Date.now()}`,
        requesttimestamp: formatNswTimestamp(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("NSW Fuel API error:", res.status, res.statusText);
      return NextResponse.json(
        { error: "NSW Fuel API request failed", data: null },
        { status: 200 }
      );
    }

    const data = await res.json();

    const petrolCodes = ["E10", "U91", "P95", "P98"];
    const dieselCodes = ["DL", "PDL"];

    let petrolSum = 0;
    let petrolCount = 0;
    let dieselSum = 0;
    let dieselCount = 0;

    if (Array.isArray(data?.prices)) {
      for (const entry of data.prices) {
        const fuelType = entry.fueltype?.toUpperCase() ?? "";
        const price = Number(entry.price);

        if (price > 0) {
          if (petrolCodes.some((c) => fuelType.includes(c))) {
            petrolSum += price;
            petrolCount++;
          }
          if (dieselCodes.some((c) => fuelType.includes(c))) {
            dieselSum += price;
            dieselCount++;
          }
        }
      }
    }

    return NextResponse.json({
      avg_petrol_cpl: petrolCount > 0 ? Math.round((petrolSum / petrolCount) * 10) / 10 : null,
      avg_diesel_cpl: dieselCount > 0 ? Math.round((dieselSum / dieselCount) * 10) / 10 : null,
      petrol_stations_reporting: petrolCount,
      diesel_stations_reporting: dieselCount,
      fetched_at: new Date().toISOString(),
      source: "NSW FuelCheck API",
    });
  } catch (error) {
    console.error("NSW Fuel API fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fuel prices", data: null },
      { status: 200 }
    );
  }
}
