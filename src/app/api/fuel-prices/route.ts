import { NextResponse } from "next/server";

interface FuelPriceStation {
  stationid: string;
  brandid: string;
  stationname: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  prices: {
    fueltype: string;
    price: number;
    lastupdated: string;
  }[];
}

export async function GET() {
  const apiKey = process.env.NSW_FUEL_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "NSW_FUEL_API_KEY not configured", data: null },
      { status: 200 }
    );
  }

  try {
    // Fetch all current fuel prices from NSW FuelCheck API
    const res = await fetch("https://api.onegov.nsw.gov.au/FuelCheckApp/v2/fuel/prices", {
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
        transactionid: `afs-${Date.now()}`,
        requesttimestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      console.error("NSW Fuel API error:", res.status, res.statusText);
      return NextResponse.json({ error: "NSW Fuel API request failed", data: null }, { status: 200 });
    }

    const data = await res.json();

    // Calculate averages for petrol (product code E10/U91/P95/P98) and diesel (DL)
    // Common fuel type codes: E10, U91, P95, P98, DL, PDL, B20, LPG
    const petrolCodes = ["E10", "U91", "P95", "P98"];
    const dieselCodes = ["DL", "PDL"];

    let petrolSum = 0;
    let petrolCount = 0;
    let dieselSum = 0;
    let dieselCount = 0;
    let stationsWithoutFuel = 0;

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
    return NextResponse.json({ error: "Failed to fetch fuel prices", data: null }, { status: 200 });
  }
}
