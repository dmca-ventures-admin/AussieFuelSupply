"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Snapshot, RetailPrices } from "@/lib/types";

interface RetailImpactProps {
  snapshot: Snapshot;
  retailPrices: RetailPrices;
}

export default function RetailImpact({ snapshot, retailPrices }: RetailImpactProps) {
  const petrolData = retailPrices.petrol_30d.map((d) => ({
    date: d.date.slice(5),
    price: d.price,
  }));

  const dieselData = retailPrices.diesel_30d.map((d) => ({
    date: d.date.slice(5),
    price: d.price,
  }));

  // Combine for the chart
  const combinedData = petrolData.map((p, i) => ({
    date: p.date,
    petrol: p.price,
    diesel: dieselData[i]?.price ?? 0,
  }));

  const outages = Object.entries(retailPrices.outages_by_state).sort(
    (a, b) => b[1].completely_dry - a[1].completely_dry
  );

  const totalNoDiesel = outages.reduce((sum, [, v]) => sum + v.no_diesel, 0);
  const totalDry = outages.reduce((sum, [, v]) => sum + v.completely_dry, 0);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">
          What does it mean at the bowser?
        </h2>
        <p className="text-slate-400 max-w-3xl">
          Retail prices respond to wholesale costs with a lag of 1–2 weeks. Station outages are
          concentrated in regional areas, even when national stock levels look adequate — distribution
          bottlenecks hit the regions hardest.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Price trend chart */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Retail Prices — 30 Day Trend
            </h3>
            <div className="flex gap-4">
              <span className="text-sm font-mono">
                <span className="text-amber-400">●</span>{" "}
                <span className="text-white">Petrol {snapshot.retail.avg_petrol_price_cpl.toFixed(1)}¢/L</span>
              </span>
              <span className="text-sm font-mono">
                <span className="text-red-400">●</span>{" "}
                <span className="text-white">Diesel {snapshot.retail.avg_diesel_price_cpl.toFixed(1)}¢/L</span>
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={combinedData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <defs>
                <linearGradient id="petrol-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="diesel-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}¢`}
                domain={["dataMin - 10", "dataMax + 10"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#e2e8f0",
                }}
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)}¢/L`,
                  name === "petrol" ? "Petrol" : "Diesel",
                ]}
              />
              <Area type="monotone" dataKey="petrol" stroke="#f59e0b" strokeWidth={2} fill="url(#petrol-gradient)" />
              <Area type="monotone" dataKey="diesel" stroke="#ef4444" strokeWidth={2} fill="url(#diesel-gradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Station outages */}
        <div className="bg-slate-800/50 rounded-xl border border-red-500/20 p-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            Station Outages by State
          </h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold font-mono text-red-400">{totalDry}</span>
            <span className="text-sm text-slate-500">completely dry</span>
          </div>
          <div className="space-y-3">
            {outages.map(([state, data]) => (
              <div key={state}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{state}</span>
                  <span className="text-xs text-slate-500">
                    {data.completely_dry} dry · {data.no_diesel} no diesel
                  </span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${Math.min((data.completely_dry / 50) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-4">
            Total: {totalNoDiesel} stations without diesel nationwide
          </p>
        </div>
      </div>

      {/* Demand spike + tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/30 rounded-xl border border-amber-500/20 p-6">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
            ⚠️ Panic Buying Makes It Worse
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-3">
            Demand has spiked by up to <span className="text-amber-400 font-bold">{snapshot.retail.demand_spike_pct_some_areas}%</span> in
            some areas as consumers rush to fill up. This means {snapshot.domestic.petrol_days_supply} days of
            supply at normal consumption could effectively shrink to{" "}
            <span className="text-red-400 font-bold">
              {Math.round(snapshot.domestic.petrol_days_supply / (1 + snapshot.retail.demand_spike_pct_some_areas / 100))} days
            </span>{" "}
            under panic conditions.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            Distribution bottlenecks mean some regional areas run dry even when national stock levels
            appear adequate. Fuel tanker trucks can only make a limited number of delivery runs per day.
          </p>
        </div>

        <div className="bg-slate-800/30 rounded-xl border border-emerald-500/20 p-6">
          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
            ✅ What You Can Do
          </h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex gap-2">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Buy normally</strong> — fill up as you usually would, don&apos;t hoard</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Check before you drive</strong> — use{" "}
                <a href="https://www.nsw.gov.au/driving-boating-and-transport/nsw-fuelcheck" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">
                  FuelCheck (NSW)
                </a> or{" "}
                <a href="https://www.fuelwatch.wa.gov.au" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">
                  FuelWatch (WA)
                </a>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Combine trips</strong> — reduce unnecessary driving where possible</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Don&apos;t fill jerry cans</strong> — hoarding creates localised shortages</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Follow official advice</strong> — check{" "}
                <a href="https://www.dcceew.gov.au/energy/security" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">
                  DCCEEW fuel security updates
                </a>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
