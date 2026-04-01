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
import type { Snapshot, OilPrices, TimelineData, GlobalStatusData } from "@/lib/types";
import { getStatusColor } from "@/lib/utils";
import { DataMeta, SectionHeading } from "@/components/ui";

interface Layer3Props {
  snapshot: Snapshot;
  oilPrices: OilPrices;
  liveBrentPrice?: number | null;
  timeline: TimelineData;
  globalStatus: GlobalStatusData;
}

export default function Layer3Global({ snapshot, oilPrices, liveBrentPrice, timeline, globalStatus }: Layer3Props) {
  const chartData = oilPrices.brent_30d.map((d) => ({
    date: d.date.slice(5),
    price: d.price,
  }));

  if (liveBrentPrice) {
    const today = new Date().toISOString().slice(5, 10);
    chartData.push({ date: today, price: liveBrentPrice });
  }

  const hormuzColors = getStatusColor(snapshot.global.hormuz_status === "open" ? "green" : "red");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading
        layer={3}
        title="What's driving the current crisis?"
        subtitle="The Strait of Hormuz handles ~20% of global seaborne oil. When transit is disrupted, crude prices spike and downstream refining is affected — flowing through to Australian fuel supplies within weeks."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Brent crude chart */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Brent Crude — 30 Day Trend</h3>
            <span className="text-2xl font-bold font-mono text-red-400">
              ${(liveBrentPrice ?? snapshot.global.brent_crude_usd).toFixed(2)}
            </span>
          </div>
          <DataMeta source={snapshot.global.brent_source} asOf={snapshot.global.brent_as_of} refresh="Near real-time" />

          <div className="mt-4">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#334155" }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} domain={["dataMin - 2", "dataMax + 2"]} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#e2e8f0" }}
                  formatter={(value) => [`$${Number(value).toFixed(2)} USD/bbl`, "Brent Crude"]}
                />
                {oilPrices.events.map((e) => (
                  <ReferenceLine key={e.date} x={e.date.slice(5)} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />
                ))}
                <Line type="monotone" dataKey="price" stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#ef4444" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
          {/* Hormuz */}
          <div className={`bg-slate-800/50 rounded-xl border ${hormuzColors.border} p-5 flex-1`}>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Strait of Hormuz</h3>
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-4 h-4 rounded-full ${hormuzColors.dot}`} />
              <span className={`text-2xl font-bold ${hormuzColors.text}`}>
                {snapshot.global.hormuz_status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{globalStatus.hormuz.summary}</p>
            <DataMeta source={globalStatus.hormuz.source} asOf={globalStatus.hormuz.as_of} />
          </div>

          {/* IEA release */}
          <div className="bg-slate-800/50 rounded-xl border border-blue-500/20 p-5 flex-1">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">IEA Emergency Release</h3>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold font-mono text-blue-400">{globalStatus.iea_release.committed_mbl}M</span>
              <span className="text-sm text-slate-500">barrels committed</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              {globalStatus.iea_release.member_nations} IEA member nations. Requested: {globalStatus.iea_release.requested_mbl}M bbl.
            </p>
            <div className="bg-blue-500/10 rounded-lg px-3 py-2 mt-2">
              <p className="text-xs text-blue-400">
                <strong>Australia&apos;s share:</strong> ~{(globalStatus.australia_contribution.barrels_approx / 1e6).toFixed(1)}M barrels
                ({(globalStatus.australia_contribution.litres / 1e6).toFixed(0)}M litres)
              </p>
            </div>
            <DataMeta source={globalStatus.iea_release.source} asOf={globalStatus.iea_release.as_of} />
          </div>


        </div>
      </div>

      {/* Crisis timeline from JSON */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-6">
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">📅 Crisis Timeline</h3>
        <div className="space-y-3">
          {timeline.events.map((item) => (
            <div key={item.date} className="flex gap-4 items-start">
              <span className="text-xs font-mono text-slate-500 whitespace-nowrap mt-0.5 w-24 flex-shrink-0">
                {item.date.slice(5)}
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
              <div>
                <span className="text-sm text-slate-300">{item.event}</span>
                <span className="text-[10px] text-slate-600 ml-2">({item.source})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
