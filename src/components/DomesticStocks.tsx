"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Snapshot, StocksHistory } from "@/lib/types";
import { getDaysSupplyStatus, getStatusColor, formatLitres } from "@/lib/utils";

interface DomesticStocksProps {
  snapshot: Snapshot;
  history: StocksHistory;
}

function GaugeChart({
  value,
  msoMin,
  ieaTarget,
  label,
  fuelType,
}: {
  value: number;
  msoMin: number;
  ieaTarget: number;
  label: string;
  fuelType: "petrol" | "diesel";
}) {
  const max = ieaTarget + 10;
  const pct = Math.min((value / max) * 100, 100);
  const msoPct = (msoMin / max) * 100;
  const ieaPct = (ieaTarget / max) * 100;
  const status = getDaysSupplyStatus(value);
  const colors = getStatusColor(status);

  // Calculate MSO minimum from percentage above
  const pctAboveMso = fuelType === "petrol" ? 78 : 18;
  const msoActual = Math.round(value / (1 + pctAboveMso / 100));

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{label}</h3>
        <span className={`text-3xl font-bold font-mono ${colors.text}`}>{value}</span>
      </div>

      {/* Gauge bar */}
      <div className="relative h-6 bg-slate-700/50 rounded-full overflow-hidden mb-3">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${colors.bg} transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
        {/* MSO marker */}
        <div
          className="absolute inset-y-0 w-0.5 bg-yellow-400/80"
          style={{ left: `${msoPct}%` }}
          title={`MSO minimum: ${msoMin} days`}
        />
        {/* IEA marker */}
        <div
          className="absolute inset-y-0 w-0.5 bg-blue-400/80"
          style={{ left: `${ieaPct}%` }}
          title={`IEA target: ${ieaTarget} days`}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-yellow-400 rounded" />
          <span>MSO min ({msoActual}d)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-blue-400 rounded" />
          <span>IEA target ({ieaTarget}d)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-3 h-0.5 ${colors.bg} rounded`} />
          <span>Current ({value}d)</span>
        </div>
      </div>
    </div>
  );
}

function SparklineChart({ data, color }: { data: { week: string; days: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="week" hide />
        <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#e2e8f0",
          }}
          formatter={(value) => [`${value} days`, "Supply"]}
          labelFormatter={(label) => `Week of ${label}`}
        />
        <Area
          type="monotone"
          dataKey="days"
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${color})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function DomesticStocks({ snapshot, history }: DomesticStocksProps) {
  const { domestic } = snapshot;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">
          How much fuel does Australia have right now?
        </h2>
        <p className="text-slate-400 max-w-3xl">
          The Minimum Stockholding Obligation (MSO) requires fuel companies to hold a baseline level of
          stock. &quot;Days of supply&quot; measures how long stocks would last at normal consumption — but
          panic buying can halve that effective cover.
        </p>
      </div>

      {/* Gauge charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GaugeChart
          value={domestic.petrol_days_supply}
          msoMin={Math.round(domestic.petrol_days_supply / (1 + domestic.petrol_pct_above_mso / 100))}
          ieaTarget={domestic.iea_obligation_days}
          label="Petrol — Days of Supply"
          fuelType="petrol"
        />
        <GaugeChart
          value={domestic.diesel_days_supply}
          msoMin={Math.round(domestic.diesel_days_supply / (1 + domestic.diesel_pct_above_mso / 100))}
          ieaTarget={domestic.iea_obligation_days}
          label="Diesel — Days of Supply"
          fuelType="diesel"
        />
      </div>

      {/* Trend sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
            Petrol — 12 Week Trend
          </h3>
          <SparklineChart data={history.petrol} color="#f59e0b" />
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
            Diesel — 12 Week Trend
          </h3>
          <SparklineChart data={history.diesel} color="#ef4444" />
        </div>
      </div>

      {/* Key stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Petrol Held</span>
          <p className="text-xl font-bold font-mono text-white mt-1">{formatLitres(domestic.petrol_litres_held)}</p>
        </div>
        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Diesel Held</span>
          <p className="text-xl font-bold font-mono text-white mt-1">{formatLitres(domestic.diesel_litres_held)}</p>
        </div>
        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
          <span className="text-xs text-slate-500 uppercase tracking-wider">IEA Gap</span>
          <p className="text-xl font-bold font-mono text-amber-400 mt-1">
            {domestic.iea_actual_days} / {domestic.iea_obligation_days} days
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Emergency Released</span>
          <p className="text-xl font-bold font-mono text-red-400 mt-1">
            {formatLitres(domestic.emergency_release_authorised_litres)}
          </p>
        </div>
      </div>

      {/* Explainer */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-6">
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">
          📊 Understanding &quot;Days of Supply&quot;
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          &quot;Days of supply&quot; is calculated by dividing current stockholdings by average daily consumption.
          It includes fuel held in terminals, depots, and tankers within Australia&apos;s Exclusive Economic Zone.
          The MSO sets a legal minimum that fuel companies must hold. Australia&apos;s IEA obligation is 90 days,
          but we currently hold only {domestic.iea_actual_days} days — one of the lowest in the developed world.
          The government has authorised the release of {formatLitres(domestic.emergency_release_authorised_litres)} from
          emergency reserves ({domestic.emergency_release_drawn_petrol_days} days petrol,{" "}
          {domestic.emergency_release_drawn_diesel_days} days diesel drawn so far).
        </p>
      </div>

      {/* Connector text */}
      <div className="mt-10 text-center">
        <div className="inline-block bg-slate-800/50 rounded-lg px-6 py-3 border border-slate-700/30">
          <p className="text-sm text-slate-400 italic">
            ↓ About 90% of Australia&apos;s petrol and diesel arrives as already-refined product on tanker ships
            from Asia. A typical shipment takes 1–3 weeks. ↓
          </p>
        </div>
      </div>
    </section>
  );
}
