#!/usr/bin/env node

// Scrapes DCCEEW MSO statistics page and updates snapshot.json + stocks-history.json

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../public/data");

const MSO_URL =
  "https://www.dcceew.gov.au/energy/security/australias-fuel-security/minimum-stockholding-obligation/statistics";

function parseNumber(str) {
  if (!str) return null;
  // Remove commas, whitespace, % signs and parse
  const cleaned = str.replace(/[,\s%]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function currentWeekISO() {
  // Return the Monday of the current week (ISO week start)
  const d = new Date();
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

async function scrape() {
  console.log(`Fetching: ${MSO_URL}`);
  const res = await fetch(MSO_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; AussieFuelSupply/1.0; +https://aussiefuelsupply.com.au)",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} fetching MSO page`);
  }

  const html = await res.text();

  // Find the MSO statistics table rows
  // The table contains columns like: Week ending | Petrol days | Petrol litres | Petrol % above | Diesel days | Diesel litres | Diesel % above
  // We want the most recent (last) data row

  // Extract all <tr> rows that contain <td> cells
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  const stripTags = (s) => s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();

  const rows = [];
  let trMatch;
  while ((trMatch = trRegex.exec(html)) !== null) {
    const rowHtml = trMatch[1];
    const cells = [];
    let tdMatch;
    const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    while ((tdMatch = tdRe.exec(rowHtml)) !== null) {
      cells.push(stripTags(tdMatch[1]));
    }
    if (cells.length >= 7) {
      rows.push(cells);
    }
  }

  if (rows.length === 0) {
    throw new Error("No data rows found in MSO statistics table — page structure may have changed");
  }

  // Take the last row (most recent week)
  const row = rows[rows.length - 1];
  console.log(`Most recent row (${row.length} cells):`, row.slice(0, 7));

  // Expected column order: week_ending | petrol_days | petrol_litres | petrol_pct | diesel_days | diesel_litres | diesel_pct
  // (some tables may have additional columns — use positional)
  const petrol_days_supply = parseNumber(row[1]);
  const petrol_litres_held = parseNumber(row[2]);
  const petrol_pct_above_mso = parseNumber(row[3]);
  const diesel_days_supply = parseNumber(row[4]);
  const diesel_litres_held = parseNumber(row[5]);
  const diesel_pct_above_mso = parseNumber(row[6]);

  const missing = [];
  if (petrol_days_supply === null) missing.push("petrol_days_supply");
  if (petrol_litres_held === null) missing.push("petrol_litres_held");
  if (petrol_pct_above_mso === null) missing.push("petrol_pct_above_mso");
  if (diesel_days_supply === null) missing.push("diesel_days_supply");
  if (diesel_litres_held === null) missing.push("diesel_litres_held");
  if (diesel_pct_above_mso === null) missing.push("diesel_pct_above_mso");

  if (missing.length > 0) {
    throw new Error(`Failed to parse fields: ${missing.join(", ")} — raw row: ${JSON.stringify(row)}`);
  }

  return {
    petrol_days_supply,
    petrol_litres_held,
    petrol_pct_above_mso,
    diesel_days_supply,
    diesel_litres_held,
    diesel_pct_above_mso,
  };
}

async function main() {
  let scraped;
  try {
    scraped = await scrape();
  } catch (err) {
    console.error("Scrape failed:", err.message);
    process.exit(1);
  }

  console.log("Scraped:", scraped);

  // Update snapshot.json
  const snapshotPath = join(DATA_DIR, "snapshot.json");
  const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));

  snapshot.snapshot_date = todayISO();
  snapshot.domestic.petrol_days_supply = scraped.petrol_days_supply;
  snapshot.domestic.petrol_litres_held = scraped.petrol_litres_held;
  snapshot.domestic.petrol_pct_above_mso = scraped.petrol_pct_above_mso;
  snapshot.domestic.diesel_days_supply = scraped.diesel_days_supply;
  snapshot.domestic.diesel_litres_held = scraped.diesel_litres_held;
  snapshot.domestic.diesel_pct_above_mso = scraped.diesel_pct_above_mso;

  writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`Updated snapshot.json (date: ${snapshot.snapshot_date})`);

  // Update stocks-history.json
  const historyPath = join(DATA_DIR, "stocks-history.json");
  const history = JSON.parse(readFileSync(historyPath, "utf8"));

  const week = currentWeekISO();

  // Dedup by week date — replace if exists, else append
  const petrolEntry = { week, days: scraped.petrol_days_supply, litres: scraped.petrol_litres_held };
  const dieselEntry = { week, days: scraped.diesel_days_supply, litres: scraped.diesel_litres_held };

  const petrolIdx = history.petrol.findIndex((e) => e.week === week);
  if (petrolIdx >= 0) {
    history.petrol[petrolIdx] = petrolEntry;
    console.log(`Updated existing petrol entry for ${week}`);
  } else {
    history.petrol.push(petrolEntry);
    console.log(`Appended new petrol entry for ${week}`);
  }

  const dieselIdx = history.diesel.findIndex((e) => e.week === week);
  if (dieselIdx >= 0) {
    history.diesel[dieselIdx] = dieselEntry;
    console.log(`Updated existing diesel entry for ${week}`);
  } else {
    history.diesel.push(dieselEntry);
    console.log(`Appended new diesel entry for ${week}`);
  }

  writeFileSync(historyPath, JSON.stringify(history, null, 2) + "\n");
  console.log(`Updated stocks-history.json (week: ${week})`);
}

main();
