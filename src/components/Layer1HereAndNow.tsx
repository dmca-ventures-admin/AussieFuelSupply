"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import type { Snapshot, StocksHistory, RetailPrices, OutagesData, PriceDecompositionData } from "@/lib/types";
import { getDaysSupplyStatus, getStatusColor, formatLitres } from "@/lib/utils";
import { DataMeta, Explainer, SectionHeading, SeverityBadge } from "@/components/ui";

interface Layer1Props {
  snapshot: Snapshot;
  stocksHistory: StocksHistory;
  retailPrices: RetailPrices;
  outages: OutagesData;
  priceDecomposition: PriceDecompositionData;
}

/* ─── Gauge Chart ─── */
function GaugeChart({
  value,
  msoMin,
  ieaTarget,
  label,
  headroomPct,
  fuelType,
}: {
  value: number;
  msoMin: number;
  ieaTarget: number;
  label: string;
  headroomPct: number;
  fuelType: "petrol" | "diesel";
}) {
  const max = ieaTarget + 10;
  const pct = Math.min((value / max) * 100, 100);
  const msoPct = (msoMin / max) * 100;
  const ieaPct = (ieaTarget / max) * 100;
  const status = getDaysSupplyStatus(value);
  const colors = getStatusColor(status);
  const headroomColor =
    headroomPct < 10 ? "text-red-400 bg-red-500/20" : headroomPct < 30 ? "text-amber-400 bg-amber-500/20" : "text-emerald-400 bg-emerald-500/20";

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-white">{label}</h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${headroomColor}`}>
            {headroomPct}% above MSO
          </span>
          <span className={`text-3xl font-bold font-mono ${colors.text}`}>{value}</span>
        </div>
      </div>
      <DataMeta source="DCCEEW MSO weekly" asOf="2026-03-17" refresh="Weekly (Fridays)" />

      {/* Gauge bar */}
      <div className="relative h-6 bg-slate-700/50 rounded-full overflow-hidden mt-4 mb-3">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${colors.bg} transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
        <div className="absolute inset-y-0 w-0.5 bg-yellow-400/80" style={{ left: `${msoPct}%` }} />
        <div className="absolute inset-y-0 w-0.5 bg-blue-400/80" style={{ left: `${ieaPct}%` }} />
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-yellow-400 rounded" />
          <span>MSO min ({msoMin}d)</span>
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

      {/* Inline explainer */}
      <Explainer trigger="What does this number mean?">
        <p>
          <strong className="text-white">&quot;Days of supply&quot;</strong> measures how long current stocks would last at normal consumption rates.
          But this isn&apos;t a stockpile — it&apos;s a <strong className="text-amber-400">flow system</strong>. It only works because imports arrive continuously.
        </p>
        <p>
          This figure includes fuel on ships within Australia&apos;s Exclusive Economic Zone and crude at refineries converted to product equivalent — not all of it is physically at terminals ready to pump.
        </p>
        <p>
          <strong className="text-red-400">Panic buying shrinks effective days.</strong> If demand spikes 50%, {value} days becomes ~{Math.round(value / 1.5)} days.
        </p>
      </Explainer>
      {fuelType === "diesel" && (
        <Explainer trigger="Why diesel matters more than petrol">
          <p>
            Diesel powers <strong className="text-white">84% of on-farm energy</strong>, 100% of road freight (where fuel = 25–35% of operating costs),
            most mining equipment, and backup power generation. It has only <strong className="text-red-400">{headroomPct}% headroom</strong> above the MSO minimum vs 78% for petrol.
          </p>
          <p>
            The National Farmers&apos; Federation warned that a prolonged diesel shortage could drive food prices up <strong className="text-red-400">50%</strong>.
            A diesel shortage doesn&apos;t just mean expensive fill-ups — it means empty supermarket shelves.
          </p>
        </Explainer>
      )}
    </div>
  );
}

/* ─── Sparkline ─── */
function SparklineChart({ data, color }: { data: { week: string; days: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <defs>
          <linearGradient id={`gradient-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
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
        <Area type="monotone" dataKey="days" stroke={color} strokeWidth={2} fill={`url(#gradient-${color.replace("#", "")})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─── Station Outages ─── */
function StationOutages({ outages }: { outages: OutagesData }) {
  const sorted = [...outages.by_state].sort((a, b) => b.pct - a.pct);
  const barColor = (pct: number) => (pct >= 10 ? "#ef4444" : pct >= 5 ? "#f59e0b" : "#22c55e");

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-white">Station Outages by State</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-mono text-red-400">{outages.national.affected.toLocaleString()}</span>
          <span className="text-sm text-slate-500">of {outages.national.total.toLocaleString()}</span>
        </div>
      </div>
      <DataMeta source={outages.source} asOf={outages.as_of} refresh="Daily (event-driven)" />

      <div className="mt-4 space-y-2.5">
        {sorted.map((s) => (
          <div key={s.state}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white w-8">{s.state}</span>
                <SeverityBadge pct={s.pct} />
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {s.affected} / {s.total.toLocaleString()}{s.estimated_total ? "*" : ""}
              </span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(s.pct * 3, 100)}%`, backgroundColor: barColor(s.pct) }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-600 mt-3">* Station totals are estimates for TAS, NT, ACT</p>

      <Explainer trigger="Why is my servo dry when national supply is adequate?">
        <p>
          Australia&apos;s fuel distribution is <strong className="text-white">just-in-time</strong>. A tanker truck carries ~36,000 litres
          and takes ~45 minutes to load. A busy servo can sell 50,000+ litres on a panic-buying day.
        </p>
        <p>
          The truck fleet and terminal loading bays <strong className="text-amber-400">physically cannot keep up</strong> with 200–400% demand spikes,
          even when the tanks at the port are full.
        </p>
        <p>
          Independent retailers are hit hardest: they buy fuel on spot markets, while branded stations (Ampol, BP, Shell)
          have standing contracts that get filled first.
        </p>
      </Explainer>
    </div>
  );
}

/* ─── Retail Prices with sparklines ─── */
function RetailPriceCards({
  snapshot,
  retailPrices,
  priceDecomposition,
}: {
  snapshot: Snapshot;
  retailPrices: RetailPrices;
  priceDecomposition: PriceDecompositionData;
}) {
  const petrolData = retailPrices.petrol_30d.map((d) => ({ date: d.date.slice(5), price: d.price }));
  const dieselData = retailPrices.diesel_30d.map((d) => ({ date: d.date.slice(5), price: d.price }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Petrol */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Retail Petrol</h3>
          <span className="text-2xl font-bold font-mono text-amber-400">{snapshot.retail.avg_petrol_price_cpl.toFixed(1)}¢/L</span>
        </div>
        <DataMeta source={snapshot.retail.petrol_price_source} asOf={snapshot.retail.petrol_price_as_of} refresh="Daily" />
        <div className="mt-3">
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={petrolData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="petrol-spark-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={2} fill="url(#petrol-spark-grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Explainer trigger="What's in this price?">
          <p className="mb-2">The ~{snapshot.retail.avg_petrol_price_cpl.toFixed(0)}¢/L breaks down roughly as:</p>
          <div className="space-y-1.5">
            {priceDecomposition.components.map((c) => (
              <div key={c.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: c.color }} />
                <span className="text-white text-xs flex-1">{c.label}</span>
                <span className="text-xs font-mono text-slate-300">{c.cpl}¢</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs">
            <strong className="text-white">~{priceDecomposition.tax_share_pct}% of the bowser price is tax</strong> (excise {priceDecomposition.notes.excise_rate} + GST).
            The retail margin is a small slice. Major cost drivers are the crude price and Singapore refining margin.
          </p>
          <p className="text-xs">
            Prices are set by the Singapore Mogas 95 benchmark with a <strong className="text-amber-400">~2-week lag</strong>.
          </p>
        </Explainer>
      </div>

      {/* Diesel */}
      <div className="bg-slate-800/50 rounded-xl border border-red-500/30 p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Retail Diesel</h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">CRITICAL</span>
          </div>
          <span className="text-2xl font-bold font-mono text-red-400">{snapshot.retail.avg_diesel_price_cpl.toFixed(1)}¢/L</span>
        </div>
        <DataMeta source={snapshot.retail.diesel_price_source} asOf={snapshot.retail.diesel_price_as_of} refresh="Daily" />
        <div className="mt-3">
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={dieselData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="diesel-spark-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="price" stroke="#ef4444" strokeWidth={2} fill="url(#diesel-spark-grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Layer 1 ─── */
export default function Layer1HereAndNow({ snapshot, stocksHistory, retailPrices, outages, priceDecomposition }: Layer1Props) {
  const { domestic } = snapshot;
  const petrolMsoMin = Math.round(domestic.petrol_days_supply / (1 + domestic.petrol_pct_above_mso / 100));
  const dieselMsoMin = Math.round(domestic.diesel_days_supply / (1 + domestic.diesel_pct_above_mso / 100));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading
        layer={1}
        title="What's happening right now?"
        subtitle="Retail prices, station outages, and national fuel stock levels — updated from government and industry data."
      />

      {/* Prices */}
      <RetailPriceCards snapshot={snapshot} retailPrices={retailPrices} priceDecomposition={priceDecomposition} />

      {/* Outages + Gauges row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <StationOutages outages={outages} />
        <div className="space-y-6">
          <GaugeChart
            value={domestic.petrol_days_supply}
            msoMin={petrolMsoMin}
            ieaTarget={domestic.iea_obligation_days}
            label="Petrol — Days of Supply"
            headroomPct={domestic.petrol_pct_above_mso}
            fuelType="petrol"
          />
          <GaugeChart
            value={domestic.diesel_days_supply}
            msoMin={dieselMsoMin}
            ieaTarget={domestic.iea_obligation_days}
            label="Diesel — Days of Supply"
            headroomPct={domestic.diesel_pct_above_mso}
            fuelType="diesel"
          />
        </div>
      </div>

      {/* Trend sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Petrol — 12 Week Trend</h3>
          <SparklineChart data={stocksHistory.petrol} color="#f59e0b" />
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Diesel — 12 Week Trend</h3>
          <SparklineChart data={stocksHistory.diesel} color="#ef4444" />
        </div>
      </div>

      {/* Key stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
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
    </section>
  );
}
