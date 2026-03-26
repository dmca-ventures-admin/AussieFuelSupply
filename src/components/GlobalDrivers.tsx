"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { Snapshot, OilPrices } from "@/lib/types";
import { getStatusColor } from "@/lib/utils";

interface GlobalDriversProps {
  snapshot: Snapshot;
  oilPrices: OilPrices;
  liveBrentPrice?: number | null;
}

export default function GlobalDrivers({ snapshot, oilPrices, liveBrentPrice }: GlobalDriversProps) {
  const chartData = oilPrices.brent_30d.map((d) => ({
    date: d.date.slice(5), // MM-DD
    price: d.price,
  }));

  // If we have a live price, append it
  if (liveBrentPrice) {
    const today = new Date().toISOString().slice(5, 10);
    chartData.push({ date: today, price: liveBrentPrice });
  }

  const hormuzColors = getStatusColor(snapshot.global.hormuz_status === "open" ? "green" : "red");

  const crisisTimeline = [
    { date: "Late Feb 2026", event: "Iran–US tensions escalate; naval movements near Hormuz" },
    { date: "28 Feb 2026", event: "Strait of Hormuz transit restrictions imposed; tanker traffic slows" },
    { date: "5 Mar 2026", event: "IEA announces coordinated 400M barrel emergency stockpile release" },
    { date: "10 Mar 2026", event: "Australian fuel companies report supply disruptions; MSO reporting moves to weekly" },
    { date: "14 Mar 2026", event: "Australia activates emergency fuel reserves (762M litres authorised)" },
    { date: "22 Mar 2026", event: "6 scheduled tanker shipments to Australia cancelled for April" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">
          What&apos;s driving the current crisis?
        </h2>
        <p className="text-slate-400 max-w-3xl">
          The Strait of Hormuz handles ~20% of global seaborne oil. When transit is disrupted,
          crude prices spike and downstream refining is affected — flowing through to Australian
          fuel supplies within weeks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Brent crude chart */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Brent Crude — 30 Day Trend
            </h3>
            <span className="text-2xl font-bold font-mono text-red-400">
              ${(liveBrentPrice ?? snapshot.global.brent_crude_usd).toFixed(2)}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
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
                domain={["dataMin - 2", "dataMax + 2"]}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#e2e8f0",
                }}
                formatter={(value) => [`$${Number(value).toFixed(2)} USD/bbl`, "Brent Crude"]}
              />
              {/* Event reference lines */}
              {oilPrices.events.map((e) => (
                <ReferenceLine
                  key={e.date}
                  x={e.date.slice(5)}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                  label={{ value: "", fill: "#f59e0b", fontSize: 9 }}
                />
              ))}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "#ef4444" }}
              />
            </LineChart>
          </ResponsiveContainer>
          {/* Event annotations */}
          <div className="mt-3 flex flex-wrap gap-2">
            {oilPrices.events.map((e) => (
              <span key={e.date} className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-md">
                {e.date.slice(5)}: {e.label}
              </span>
            ))}
          </div>
        </div>

        {/* Status cards */}
        <div className="flex flex-col gap-4">
          {/* Hormuz status */}
          <div className={`bg-slate-800/50 rounded-xl border ${hormuzColors.border} p-5 flex-1`}>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
              Strait of Hormuz
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-4 h-4 rounded-full ${hormuzColors.dot}`} />
              <span className={`text-2xl font-bold ${hormuzColors.text}`}>
                {snapshot.global.hormuz_status === "restricted" ? "RESTRICTED" : snapshot.global.hormuz_status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              ~20% of the world&apos;s seaborne oil passes through this narrow strait between Iran and Oman.
              Restrictions here directly impact crude supply to Asian refineries that Australia depends on.
            </p>
          </div>

          {/* IEA release */}
          <div className="bg-slate-800/50 rounded-xl border border-blue-500/20 p-5 flex-1">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
              IEA Emergency Release
            </h3>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold font-mono text-blue-400">
                {snapshot.global.iea_release_mbl}M
              </span>
              <span className="text-sm text-slate-500">barrels released</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              The International Energy Agency has coordinated a collective release of
              {" "}{snapshot.global.iea_committed_mbl}M barrels from member nations&apos; strategic reserves
              to stabilise global markets.
            </p>
          </div>

          {/* Ships cancelled */}
          <div className="bg-slate-800/50 rounded-xl border border-red-500/20 p-5 flex-1">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
              Supply Disruption
            </h3>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold font-mono text-red-400">
                {snapshot.upstream_suppliers.ships_cancelled_april}
              </span>
              <span className="text-sm text-slate-500">tankers cancelled (April)</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Scheduled fuel shipments to Australia have been cancelled as shipping companies
              reroute around the Strait of Hormuz, adding time and cost.
            </p>
          </div>
        </div>
      </div>

      {/* Crisis timeline */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-6">
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
          📅 Crisis Timeline
        </h3>
        <div className="space-y-3">
          {crisisTimeline.map((item) => (
            <div key={item.date} className="flex gap-4 items-start">
              <span className="text-xs font-mono text-slate-500 whitespace-nowrap mt-0.5 w-24 flex-shrink-0">
                {item.date}
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
              <span className="text-sm text-slate-300">{item.event}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
