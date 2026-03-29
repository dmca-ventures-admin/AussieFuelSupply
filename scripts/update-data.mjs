#!/usr/bin/env node

/**
 * Manual data update helper for event-driven data files.
 * 
 * Usage:
 *   node scripts/update-data.mjs outages --state NSW --affected 320 --total 2417
 *   node scripts/update-data.mjs timeline --date 2026-03-29 --event "New IEA release announced" --source "IEA"
 *   node scripts/update-data.mjs hormuz --status restricted|open|closed --summary "Status text"
 *   node scripts/update-data.mjs ships --cancelled 8 --normal 81
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'public', 'data');

function readJSON(filename) {
  return JSON.parse(readFileSync(join(dataDir, filename), 'utf-8'));
}

function writeJSON(filename, data) {
  writeFileSync(join(dataDir, filename), JSON.stringify(data, null, 2) + '\n');
  console.log(`✅ Updated ${filename}`);
}

const [,, command, ...args] = process.argv;

function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    parsed[key] = args[i + 1];
  }
  return parsed;
}

const opts = parseArgs(args);
const today = new Date().toISOString().slice(0, 10);

switch (command) {
  case 'outages': {
    if (!opts.state || !opts.affected || !opts.total) {
      console.log('Usage: update-data.mjs outages --state NSW --affected 320 --total 2417');
      process.exit(1);
    }
    const data = readJSON('outages.json');
    const stateEntry = data.by_state.find(s => s.state === opts.state);
    if (stateEntry) {
      stateEntry.affected = Number(opts.affected);
      stateEntry.total = Number(opts.total);
      stateEntry.pct = Math.round((stateEntry.affected / stateEntry.total) * 1000) / 10;
    }
    // Recalculate national
    data.national.affected = data.by_state.reduce((s, st) => s + st.affected, 0);
    data.national.total = data.by_state.reduce((s, st) => s + st.total, 0);
    data.national.pct = Math.round((data.national.affected / data.national.total) * 1000) / 10;
    data.as_of = opts.date || today;
    writeJSON('outages.json', data);
    break;
  }

  case 'timeline': {
    if (!opts.date || !opts.event || !opts.source) {
      console.log('Usage: update-data.mjs timeline --date 2026-03-29 --event "Event text" --source "Source"');
      process.exit(1);
    }
    const data = readJSON('timeline.json');
    data.events.push({ date: opts.date, event: opts.event, source: opts.source });
    data.events.sort((a, b) => a.date.localeCompare(b.date));
    writeJSON('timeline.json', data);
    break;
  }

  case 'hormuz': {
    if (!opts.status) {
      console.log('Usage: update-data.mjs hormuz --status restricted|open|closed [--summary "text"]');
      process.exit(1);
    }
    const snapshot = readJSON('snapshot.json');
    const globalStatus = readJSON('global-status.json');
    snapshot.global.hormuz_status = opts.status;
    snapshot.global.hormuz_as_of = today;
    globalStatus.hormuz.status = opts.status;
    globalStatus.hormuz.as_of = today;
    if (opts.summary) globalStatus.hormuz.summary = opts.summary;
    writeJSON('snapshot.json', snapshot);
    writeJSON('global-status.json', globalStatus);
    break;
  }

  case 'ships': {
    if (!opts.cancelled) {
      console.log('Usage: update-data.mjs ships --cancelled 8 [--normal 81]');
      process.exit(1);
    }
    const snapshot = readJSON('snapshot.json');
    const shipping = readJSON('shipping.json');
    const cancelled = Number(opts.cancelled);
    const normal = Number(opts.normal || shipping.ships_normal_monthly);
    snapshot.upstream_suppliers.ships_cancelled = cancelled;
    snapshot.upstream_suppliers.ships_normal_monthly = normal;
    snapshot.upstream_suppliers.ships_cancelled_pct = Math.round((cancelled / normal) * 1000) / 10;
    snapshot.upstream_suppliers.ships_as_of = today;
    shipping.ships_cancelled = cancelled;
    shipping.ships_normal_monthly = normal;
    shipping.ships_cancelled_pct = Math.round((cancelled / normal) * 1000) / 10;
    shipping.as_of = today;
    writeJSON('snapshot.json', snapshot);
    writeJSON('shipping.json', shipping);
    break;
  }

  case 'mso': {
    if (!opts.petrol_days || !opts.diesel_days) {
      console.log('Usage: update-data.mjs mso --petrol_days 37 --diesel_days 29 [--petrol_headroom 75 --diesel_headroom 16]');
      process.exit(1);
    }
    const snapshot = readJSON('snapshot.json');
    const history = readJSON('stocks-history.json');
    snapshot.domestic.petrol_days_supply = Number(opts.petrol_days);
    snapshot.domestic.diesel_days_supply = Number(opts.diesel_days);
    if (opts.petrol_headroom) snapshot.domestic.petrol_pct_above_mso = Number(opts.petrol_headroom);
    if (opts.diesel_headroom) snapshot.domestic.diesel_pct_above_mso = Number(opts.diesel_headroom);
    // Append to history
    history.petrol.push({ week: today, days: Number(opts.petrol_days), litres: snapshot.domestic.petrol_litres_held });
    history.diesel.push({ week: today, days: Number(opts.diesel_days), litres: snapshot.domestic.diesel_litres_held });
    // Keep last 12 weeks
    history.petrol = history.petrol.slice(-12);
    history.diesel = history.diesel.slice(-12);
    writeJSON('snapshot.json', snapshot);
    writeJSON('stocks-history.json', history);
    break;
  }

  default:
    console.log(`
Australia Fuel Supply — Data Update Helper

Commands:
  outages   --state NSW --affected 320 --total 2417 [--date 2026-03-29]
  timeline  --date 2026-03-29 --event "Event text" --source "Source"
  hormuz    --status restricted|open|closed [--summary "text"]
  ships     --cancelled 8 [--normal 81]
  mso       --petrol_days 37 --diesel_days 29 [--petrol_headroom 75 --diesel_headroom 16]
    `);
}
