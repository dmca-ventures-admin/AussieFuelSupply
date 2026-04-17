"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Footer from "@/components/Footer";
import { DataMeta, SeverityBadge } from "@/components/ui";
import { getDaysSupplyStatus, getStatusColor, formatCentsPerLitre, getRefineryUtilisationStatus } from "@/lib/utils";
import type {
  Snapshot,
  StocksHistory,
  OilPrices,
  RetailPrices,
  SuppliersData,
  OutagesData,
  ImportSourcesData,
  ShippingData,
  TimelineData,
  PriceDecompositionData,

  GlobalStatusData,
  DemandData,
} from "@/lib/types";

/* ════════════════════════════════════════════════════════════════════
   DATA TYPES
   ════════════════════════════════════════════════════════════════════ */

interface DashboardData {
  snapshot: Snapshot;
  stocksHistory: StocksHistory;
  oilPrices: OilPrices;
  retailPrices: RetailPrices;
  suppliers: SuppliersData;
  outages: OutagesData;
  importSources: ImportSourcesData;
  shipping: ShippingData;
  timeline: TimelineData;
  priceDecomposition: PriceDecompositionData;

  globalStatus: GlobalStatusData;
  demand: DemandData;
}

/* ════════════════════════════════════════════════════════════════════
   SHARED SMALL COMPONENTS
   ════════════════════════════════════════════════════════════════════ */

function StatusDot({ status }: { status: "green" | "amber" | "red" }) {
  const colors = getStatusColor(status);
  return (
    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.bg} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colors.dot}`} />
    </span>
  );
}

function DemandSparkCard({
  title,
  data,
  color,
  gradId,
}: {
  title: string;
  data: { week: string; demand_ml: number }[];
  color: string;
  gradId: string;
}) {
  // Show last 12 weeks
  const recent = data.slice(-12);
  const current = recent[recent.length - 1];
  const chartData = recent.map((d) => ({ week: d.week.slice(5), ml: d.demand_ml }));

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">STUB DATA</span>
          <span className="text-2xl font-bold font-mono text-white">{current?.demand_ml ?? "—"}<span className="text-sm font-normal text-slate-500"> ML</span></span>
        </div>
      </div>
      <DataMeta source="Stub — AIP Weekly Oil Statistics" asOf="2026-03-23" refresh="Weekly (pending)" />
      <div className="mt-3">
        <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">12-week trend</h4>
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" hide />
            <YAxis hide domain={["dataMin - 20", "dataMax + 20"]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#e2e8f0" }}
              formatter={(v) => [`${v} ML`, "Demand"]}
              labelFormatter={(l) => `Week of ${l}`}
            />
            <Area type="monotone" dataKey="ml" stroke={color} strokeWidth={2} fill={`url(#${gradId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   LAYER 1 — DOMESTIC SITUATION
   ════════════════════════════════════════════════════════════════════ */

function Layer1Detail({
  snapshot,
  stocksHistory,
  retailPrices,
  outages,
  demand,
}: {
  snapshot: Snapshot;
  stocksHistory: StocksHistory;
  retailPrices: RetailPrices;
  outages: OutagesData;
  demand: DemandData;
}) {
  const { domestic } = snapshot;
  const petrolMsoMin = Math.round(domestic.petrol_days_supply / (1 + domestic.petrol_pct_above_mso / 100));
  const dieselMsoMin = Math.round(domestic.diesel_days_supply / (1 + domestic.diesel_pct_above_mso / 100));

  const petrolPriceData = retailPrices.petrol_30d.map((d) => ({ date: d.date.slice(5), price: d.price }));
  const dieselPriceData = retailPrices.diesel_30d.map((d) => ({ date: d.date.slice(5), price: d.price }));

  return (
    <div className="space-y-6 animate-in">
      {/* Row 1: Prices — current value + 12-week trend sparkline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Petrol price card */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Retail Petrol</h3>
            <span className="text-2xl font-bold font-mono text-amber-400">{formatCentsPerLitre(snapshot.retail.avg_petrol_price_cpl)}</span>
          </div>
          <DataMeta source={snapshot.retail.petrol_price_source} asOf={snapshot.retail.petrol_price_as_of} refresh="Daily" />
          <div className="mt-3">
            <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">12-week trend</h4>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={petrolPriceData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="petrol-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={2} fill="url(#petrol-grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diesel price card */}
        <div className="bg-slate-800/50 rounded-xl border border-red-500/30 p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Retail Diesel</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">CRITICAL</span>
            </div>
            <span className="text-2xl font-bold font-mono text-red-400">{formatCentsPerLitre(snapshot.retail.avg_diesel_price_cpl)}</span>
          </div>
          <DataMeta source={snapshot.retail.diesel_price_source} asOf={snapshot.retail.diesel_price_as_of} refresh="Daily" />
          <div className="mt-3">
            <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">12-week trend</h4>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={dieselPriceData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="diesel-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="price" stroke="#ef4444" strokeWidth={2} fill="url(#diesel-grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Days of Supply — gauge + 12-week sparkline in same card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DaysOfSupplyCard value={domestic.petrol_days_supply} msoMin={petrolMsoMin} ieaTarget={domestic.iea_obligation_days} label="Petrol — Days of Supply" headroomPct={domestic.petrol_pct_above_mso} trendData={stocksHistory.petrol} color="#f59e0b" gradId="petrol-supply-grad" />
        <DaysOfSupplyCard value={domestic.diesel_days_supply} msoMin={dieselMsoMin} ieaTarget={domestic.iea_obligation_days} label="Diesel — Days of Supply" headroomPct={domestic.diesel_pct_above_mso} trendData={stocksHistory.diesel} color="#ef4444" gradId="diesel-supply-grad" />
      </div>

      {/* Row 3: Weekly demand sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DemandSparkCard title="Weekly Petrol Demand" data={demand.petrol_weekly_ml} color="#f59e0b" gradId="petrol-demand-grad" />
        <DemandSparkCard title="Weekly Diesel Demand" data={demand.diesel_weekly_ml} color="#ef4444" gradId="diesel-demand-grad" />
      </div>

      {/* Row 4: Station outages — full width */}
      <StationOutages outages={outages} />
    </div>
  );
}

function DaysOfSupplyCard({
  value,
  msoMin,
  ieaTarget,
  label,
  headroomPct,
  trendData,
  color,
  gradId,
}: {
  value: number;
  msoMin: number;
  ieaTarget: number;
  label: string;
  headroomPct: number;
  trendData: { week: string; days: number }[];
  color: string;
  gradId: string;
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
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${headroomColor}`}>{headroomPct}% above MSO</span>
          <span className={`text-3xl font-bold font-mono ${colors.text}`}>{value}</span>
        </div>
      </div>
      <DataMeta source="DCCEEW MSO weekly" asOf="2026-03-17" refresh="Weekly (Fridays)" />

      {/* Gauge bar */}
      <div className="relative h-6 bg-slate-700/50 rounded-full overflow-hidden mt-4 mb-3">
        <div className={`absolute inset-y-0 left-0 rounded-full ${colors.bg} transition-all duration-1000`} style={{ width: `${pct}%` }} />
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

      {/* 12-week trend sparkline */}
      <div className="mt-4">
        <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">12-week trend</h4>
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" hide />
            <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#e2e8f0" }}
              formatter={(v) => [`${v} days`, "Supply"]}
              labelFormatter={(l) => `Week of ${l}`}
            />
            <Area type="monotone" dataKey="days" stroke={color} strokeWidth={2} fill={`url(#${gradId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

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
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(s.pct * 3, 100)}%`, backgroundColor: barColor(s.pct) }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-600 mt-3">* Station totals are estimates for TAS, NT, ACT</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   LAYER 2 — OUR SUPPLY CHAIN
   ════════════════════════════════════════════════════════════════════ */

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#a855f7", "#ef4444", "#06b6d4", "#64748b"];

function Layer2Detail({
  suppliers,
  importSources,
  shipping,
}: {
  suppliers: SuppliersData;
  importSources: ImportSourcesData;
  shipping: ShippingData;
}) {
  // Build the 6 refinery utilisation cards: 5 source markets + Australia last
  const sourceCountries = ["South Korea", "Singapore", "Malaysia", "Taiwan", "India"];
  const refineryCards: { flag: string; country: string; utilisation: number; status: "green" | "amber" | "red"; note: string; capacity?: string }[] = [];

  // Source markets first — calculate RAG status from utilisation_pct consistently
  for (const name of sourceCountries) {
    const s = suppliers.suppliers.find((sup) => sup.country === name);
    if (s) {
      refineryCards.push({
        flag: s.flag,
        country: s.country,
        utilisation: s.refinery_utilisation_pct,
        status: getRefineryUtilisationStatus(s.refinery_utilisation_pct),
        note: s.note,
      });
    }
  }

  // Australia last — amber (operating refineries at ~85% but only 20% domestic coverage)
  refineryCards.push({
    flag: "🇦🇺",
    country: "Australia",
    utilisation: 85,
    status: "amber",
    note: "Two refineries remain operational — Ampol Lytton (Brisbane, 109,000 bbl/day) and Viva Geelong (120,000 bbl/day) — supplying ~20% of domestic demand. Six refineries closed between 2003–2014 as cheaper Asian imports made local refining unviable.",
    capacity: "229,000 bbl/day",
  });

  return (
    <div className="space-y-6 animate-in">
      {/* 1. Import donut — full width */}
      <ImportDonut importSources={importSources} />

      {/* 2. Refinery utilisation grid — 6 cards, responsive 3→2→1 columns */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Refinery Utilisation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {refineryCards.map((card) => {
            const colors = getStatusColor(card.status);
            return (
              <div key={card.country} className={`bg-slate-800/50 rounded-xl border ${colors.border} p-5`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{card.flag}</span>
                  <h4 className="text-white font-semibold">{card.country}</h4>
                  <span className={`ml-auto w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                </div>
                <div className="mb-2">
                  <span className="text-xs text-slate-500">Refinery utilisation</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${colors.bg} rounded-full`} style={{ width: `${card.utilisation}%` }} />
                    </div>
                    <span className="text-xs font-mono text-slate-300">{card.utilisation}%</span>
                  </div>
                </div>
                {card.capacity && (
                  <div className="mb-2">
                    <span className="text-xs text-slate-500">Domestic capacity: </span>
                    <span className="text-xs font-mono text-slate-300 font-semibold">{card.capacity}</span>
                  </div>
                )}
                <p className="text-xs text-slate-500 italic">{card.note}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Ship cancellations — full width */}
      <ShipCancellations shipping={shipping} />
    </div>
  );
}

function ImportDonut({ importSources }: { importSources: ImportSourcesData }) {
  const data = importSources.sources.map((s) => ({ name: `${s.flag} ${s.country}`, value: s.share_pct }));

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-1">Where our fuel comes from</h3>
      <DataMeta source={importSources.import_share_source} asOf={importSources.import_share_as_of} refresh="Yearly" />
      <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
        <div className="w-56 h-56 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} strokeWidth={0}>
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#e2e8f0" }} formatter={(value) => [`${value}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 flex-1">
          {importSources.sources.map((s, i) => (
            <div key={s.country} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
              <span className="text-sm text-white flex-1">{s.flag} {s.country}</span>
              <span className="text-sm font-mono text-slate-300 font-bold">{s.share_pct}%</span>
            </div>
          ))}
          <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700/30">
            Australia imports ~90% of its refined fuel from just 5 countries.
          </p>
        </div>
      </div>
    </div>
  );
}

function ShipCancellations({ shipping }: { shipping: ShippingData }) {
  const total = shipping.ships_normal_monthly;
  const cancelled = shipping.ships_cancelled;
  const active = total - cancelled;

  return (
    <div className="bg-slate-800/50 rounded-xl border border-red-500/20 p-6">
      <h3 className="text-lg font-semibold text-white mb-1">Ship Cancellations</h3>
      <DataMeta source={shipping.source} asOf={shipping.as_of} refresh="Event-driven" />
      <div className="flex items-baseline gap-2 mt-4 mb-4">
        <span className="text-3xl font-bold font-mono text-red-400">{cancelled}</span>
        <span className="text-sm text-slate-500">of ~{total} monthly ships cancelled ({shipping.ships_cancelled_pct}%)</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-4">
        {Array.from({ length: Math.min(total, 81) }).map((_, i) => (
          <span key={i} className={`text-sm ${i < active ? "opacity-30" : "opacity-100"}`} title={i < active ? "Active" : "Cancelled"}>
            {i < active ? "🚢" : "❌"}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {Object.entries(shipping.monthly_breakdown).map(([fuel, count]) => (
          <div key={fuel} className="bg-slate-700/30 rounded-lg p-2 text-center">
            <span className="text-lg font-bold font-mono text-white">{count}</span>
            <p className="text-[10px] text-slate-500 capitalize">{fuel.replace("_", " ")}/mo</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 italic">{shipping.ships_replaced_note}</p>
    </div>
  );
}

function DoubleHopMapSVGInline() {
  return (
    <svg viewBox="0 0 920 400" className="w-full h-auto" aria-label="The Double Hop supply chain from Middle East through Asian refineries to Australia">
      <defs>
        <style>{`
          .hop-flow { animation: hop-dash 3s linear infinite; }
          @keyframes hop-dash { to { stroke-dashoffset: -30; } }
          .hop-pulse { animation: hop-p 2s ease-in-out infinite; }
          @keyframes hop-p { 0%,100% { opacity:0.6 } 50% { opacity:1 } }
        `}</style>
      </defs>

      <path d="M 131,170 Q 165,175 195,191" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="8 6" className="hop-flow" opacity="0.8" />
      <path d="M 250,191 Q 340,80 428,70" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
      <path d="M 250,191 Q 340,130 428,130" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
      <path d="M 250,191 Q 340,195 428,195" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
      <path d="M 250,191 Q 340,250 428,260" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
      <path d="M 250,191 Q 340,300 428,320" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
      <path d="M 472,70 Q 590,140 716,240" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
      <path d="M 472,130 Q 590,175 716,243" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
      <path d="M 472,195 Q 590,220 716,248" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
      <path d="M 472,260 Q 590,260 716,252" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
      <path d="M 472,320 Q 590,290 716,258" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />

      <text x="105" y="25" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700">CRUDE SOURCE</text>
      <text x="350" y="25" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700">TOP 5 REFINERIES</text>
      <text x="750" y="25" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700">AUSTRALIA</text>

      <circle cx="105" cy="170" r="26" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
      <text x="105" y="167" textAnchor="middle" fill="#ef4444" fontSize="20">🛢️</text>
      <text x="105" y="183" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold">CRUDE</text>
      <text x="105" y="210" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">Middle East</text>

      <rect x="195" y="175" width="55" height="32" rx="6" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
      <text x="222" y="190" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="bold">HORMUZ</text>
      <text x="222" y="201" textAnchor="middle" fill="#ef4444" fontSize="7">⚠ RESTRICTED</text>
      <text x="222" y="222" textAnchor="middle" fill="#94a3b8" fontSize="8">20% global oil</text>

      <circle cx="450" cy="70" r="22" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" className="hop-pulse" />
      <text x="450" y="67" textAnchor="middle" fill="white" fontSize="16">🇰🇷</text>
      <text x="450" y="80" textAnchor="middle" fill="#94a3b8" fontSize="7">30%</text>
      <text x="450" y="103" textAnchor="middle" fill="#cbd5e1" fontSize="9">S. Korea</text>

      <circle cx="450" cy="130" r="22" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" className="hop-pulse" />
      <text x="450" y="127" textAnchor="middle" fill="white" fontSize="16">🇸🇬</text>
      <text x="450" y="140" textAnchor="middle" fill="#94a3b8" fontSize="7">25%</text>
      <text x="510" y="133" textAnchor="start" fill="#cbd5e1" fontSize="9">Singapore</text>

      <circle cx="450" cy="195" r="22" fill="#1e293b" stroke="#22c55e" strokeWidth="2" className="hop-pulse" />
      <text x="450" y="192" textAnchor="middle" fill="white" fontSize="16">🇲🇾</text>
      <text x="450" y="205" textAnchor="middle" fill="#94a3b8" fontSize="7">15%</text>
      <text x="510" y="198" textAnchor="start" fill="#cbd5e1" fontSize="9">Malaysia</text>

      <circle cx="450" cy="260" r="22" fill="#1e293b" stroke="#22c55e" strokeWidth="2" className="hop-pulse" />
      <text x="450" y="257" textAnchor="middle" fill="white" fontSize="16">🇹🇼</text>
      <text x="450" y="270" textAnchor="middle" fill="#94a3b8" fontSize="7">10%</text>
      <text x="510" y="263" textAnchor="start" fill="#cbd5e1" fontSize="9">Taiwan</text>

      <circle cx="450" cy="320" r="22" fill="#1e293b" stroke="#22c55e" strokeWidth="2" className="hop-pulse" />
      <text x="450" y="317" textAnchor="middle" fill="white" fontSize="16">🇮🇳</text>
      <text x="450" y="330" textAnchor="middle" fill="#94a3b8" fontSize="7">5%</text>
      <text x="510" y="323" textAnchor="start" fill="#cbd5e1" fontSize="9">India</text>

      <text x="590" y="95" textAnchor="middle" fill="#94a3b8" fontSize="11" fontStyle="italic" fontWeight="500">~15 days</text>
      <text x="600" y="175" textAnchor="middle" fill="#94a3b8" fontSize="11" fontStyle="italic" fontWeight="500">8–14 days</text>
      <text x="600" y="275" textAnchor="middle" fill="#94a3b8" fontSize="11" fontStyle="italic" fontWeight="500">~7 days</text>

      <circle cx="750" cy="250" r="34" fill="#1e293b" stroke="#3b82f6" strokeWidth="3" />
      <text x="750" y="245" textAnchor="middle" fill="white" fontSize="24">🇦🇺</text>
      <text x="750" y="264" textAnchor="middle" fill="#93c5fd" fontSize="8" fontWeight="bold">AUSTRALIA</text>

      <path d="M 784,250 L 840,250" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="845" y="243" textAnchor="start" fill="white" fontSize="12">🚛</text>
      <text x="845" y="258" textAnchor="start" fill="#64748b" fontSize="8">hours</text>
      <path d="M 870,250 L 905,250" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="903" y="243" textAnchor="start" fill="white" fontSize="11">⛽</text>
      <text x="897" y="258" textAnchor="start" fill="#64748b" fontSize="7">servo</text>

      <text x="750" y="330" textAnchor="middle" fill="#64748b" fontSize="8">Emergency: US → Aus: 55–60 days</text>
    </svg>
  );
}

function DoubleHopMap() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div className="bg-slate-800/50 rounded-xl border border-amber-500/20 p-6 relative">
        <h3 className="text-lg font-semibold text-amber-400 mb-1">
          🗺️ &quot;The Double Hop&quot; — Why a war in Iran empties Australian servos
        </h3>
        <p className="text-xs text-slate-500 mb-2">
          Australia&apos;s fuel doesn&apos;t come from the Middle East directly. It comes from Asian refineries that get 60–70% of their crude through Hormuz.
        </p>
        <div className="bg-red-500/10 rounded-lg px-3 py-2 mb-4 border border-red-500/20">
          <p className="text-xs text-red-400 font-medium">
            ⚠️ Top 5 refining countries (South Korea, Singapore, Malaysia, Taiwan, India) source 60–70% of their crude oil through the Strait of Hormuz.
          </p>
        </div>

        {/* Fullscreen button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 transition-colors cursor-pointer"
          title="View fullscreen"
          aria-label="View Double Hop map fullscreen"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-400">
            <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <DoubleHopMapSVGInline />

        <p className="text-sm text-slate-400 mt-4 leading-relaxed">
          <strong className="text-white">Key insight:</strong> When Hormuz is restricted, it doesn&apos;t matter that Australia has no direct oil trade with Iran.
          Our suppliers&apos; suppliers are affected. This is why a conflict 12,000km away can empty a servo in rural NSW within weeks.
        </p>
      </div>

      {/* Fullscreen modal overlay */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-3 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors cursor-pointer z-10"
            aria-label="Close fullscreen"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-amber-400 mb-4 text-center">
              🗺️ &quot;The Double Hop&quot; — Why a war in Iran empties Australian servos
            </h3>
            <DoubleHopMapSVGInline />
            <p className="text-sm text-slate-400 mt-4 leading-relaxed text-center max-w-3xl mx-auto">
              <strong className="text-white">Key insight:</strong> When Hormuz is restricted, it doesn&apos;t matter that Australia has no direct oil trade with Iran.
              Our suppliers&apos; suppliers are affected. This is why a conflict 12,000km away can empty a servo in rural NSW within weeks.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════
   LAYER 3 — GLOBAL PICTURE
   ════════════════════════════════════════════════════════════════════ */

function Layer3Detail({
  snapshot,
  oilPrices,
  liveBrentPrice,
  globalStatus,
}: {
  snapshot: Snapshot;
  oilPrices: OilPrices;
  liveBrentPrice: number | null;
  globalStatus: GlobalStatusData;
}) {
  const brentSparkData = oilPrices.brent_30d.map((d) => ({ date: d.date.slice(5), price: d.price }));
  if (liveBrentPrice) {
    const today = new Date().toISOString().slice(5, 10);
    brentSparkData.push({ date: today, price: liveBrentPrice });
  }

  const hormuzColors = getStatusColor(snapshot.global.hormuz_status === "open" ? "green" : "red");

  return (
    <div className="space-y-6 animate-in">
      {/* 1. Double Hop SVG — moved from Section 2 */}
      <DoubleHopMap />

      {/* 2–4. Hormuz status, Brent crude, IEA release — responsive 3-panel grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Hormuz status */}
        <div className={`bg-slate-800/50 rounded-xl border ${hormuzColors.border} p-6`}>
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Strait of Hormuz</h3>
          <div className="flex items-center gap-3 mb-3">
            <span className={`w-4 h-4 rounded-full ${hormuzColors.dot}`} />
            <span className={`text-2xl font-bold ${hormuzColors.text}`}>{snapshot.global.hormuz_status.toUpperCase()}</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{globalStatus.hormuz.summary}</p>
          <DataMeta source={globalStatus.hormuz.source} asOf={globalStatus.hormuz.as_of} />
        </div>

        {/* Brent crude — 12-week sparkline */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Brent Crude</h3>
            <span className="text-2xl font-bold font-mono text-red-400">${(liveBrentPrice ?? snapshot.global.brent_crude_usd).toFixed(2)} <span className="text-sm font-normal text-slate-500">USD/bbl</span></span>
          </div>
          <DataMeta source={snapshot.global.brent_source} asOf={snapshot.global.brent_as_of} refresh="Near real-time" />
          <div className="mt-3">
            <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">12-week trend</h4>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={brentSparkData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="brent-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#e2e8f0" }}
                  formatter={(value) => [`$${Number(value).toFixed(2)} USD/bbl`, "Brent Crude"]}
                />
                <Area type="monotone" dataKey="price" stroke="#ef4444" strokeWidth={2} fill="url(#brent-grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* IEA release */}
        <div className="bg-slate-800/50 rounded-xl border border-blue-500/20 p-6">
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
              <strong>Australia&apos;s share:</strong> ~{(globalStatus.australia_contribution.barrels_approx / 1e6).toFixed(1)}M barrels ({(globalStatus.australia_contribution.litres / 1e6).toFixed(0)}M litres)
            </p>
          </div>
          <DataMeta source={globalStatus.iea_release.source} asOf={globalStatus.iea_release.as_of} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   LAYER 4 — PREDICTION MARKETS
   ════════════════════════════════════════════════════════════════════ */

interface KalshiOdds {
  date: string;
  probability: number;
  title: string;
  volume: number;
  status: string;
  ticker: string;
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M traded`;
  if (vol >= 1_000) return `$${Math.round(vol / 1_000)}K traded`;
  return `$${vol} traded`;
}

function getOddsColor(pct: number): { text: string; bg: string; border: string } {
  if (pct >= 65) return { text: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" };
  if (pct >= 35) return { text: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30" };
  return { text: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" };
}

interface KalshiHistoryPoint {
  yes_price: number;
  ts: string;
}

function Sparkline({ data, color }: { data: KalshiHistoryPoint[]; color: string }) {
  if (!data || data.length < 2) return null;
  const prices = data.map((d) => d.yes_price * 100);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const points = prices
    .map((p, i) => `${(i / (prices.length - 1)) * w},${h - ((p - min) / range) * h}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8 mt-2" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Layer4Detail({ kalshiMarkets, kalshiHistory }: { kalshiMarkets: KalshiOdds[] | null; kalshiHistory: Record<string, KalshiHistoryPoint[]> | null }) {
  const hasData = kalshiMarkets && kalshiMarkets.length > 0;

  // Scenario data mapped to each prediction card by index
  const scenarios = [
    {
      title: "Hormuz reopens within 2 weeks",
      impact: [
        "Crude oil prices begin normalising within days",
        "Australian retail prices normalise in 4–6 weeks (shipping lag + price transmission)",
        "Emergency reserves returned to pre-crisis levels within 3 months",
        "No rationing required",
      ],
    },
    {
      title: "Disruption continues 1–3 months",
      impact: [
        "Continued drawdown of emergency reserves",
        "Further IEA coordinated releases",
        "Retail prices remain elevated ($2.40–$2.80/L)",
        "Regional fuel rationing becomes possible",
        "US and other emergency supply routes become structural",
      ],
    },
    {
      title: "Prolonged disruption 3+ months",
      impact: [
        "Emergency reserves approach depletion",
        "Formal rationing under Liquid Fuel Emergency Act 1984",
        "Priority sectors (agriculture, defence, health, freight) get allocations",
        "Civilian driving restrictions possible",
        "Severe economic impact — food prices spike",
      ],
    },
  ];

  const colorForIndex = (i: number) => {
    if (i === 0) return { scenarioTitle: "text-red-400", sparkline: "#ef4444" };
    if (i === 1) return { scenarioTitle: "text-amber-400", sparkline: "#f59e0b" };
    return { scenarioTitle: "text-emerald-400", sparkline: "#22c55e" };
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Explanation */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-3">What are prediction markets?</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-3">
          Prediction markets let people bet real money on the outcome of future events. Unlike polls or pundit forecasts, participants have financial skin in the game — which tends to produce more accurate probability estimates.
        </p>
        <p className="text-sm text-slate-400 leading-relaxed">
          <strong className="text-white">Kalshi</strong> is a regulated prediction market platform (CFTC-regulated in the US) where traders buy and sell contracts on geopolitical, economic, and policy events. The prices reflect the market&apos;s consensus probability of each outcome.
        </p>
      </div>

      {/* Probability cards with inline scenarios and sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hasData ? (
          kalshiMarkets.map((m, i) => {
            const colors = getOddsColor(m.probability);
            const scenario = scenarios[i];
            const indexColors = colorForIndex(i);
            const history = kalshiHistory?.[m.ticker] ?? [];
            return (
              <div key={m.ticker} className={`bg-slate-800/50 rounded-xl border ${colors.border} p-6 flex flex-col`}>
                {/* Odds header */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <p className="text-sm text-slate-400">Hormuz normal {m.date}</p>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                      </span>
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
                    </span>
                  </div>
                  <div className={`text-5xl font-bold font-mono ${colors.text} mb-2`}>
                    {m.probability}%
                  </div>
                  <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden mt-3">
                    <div className={`h-full ${colors.bg} rounded-full transition-all duration-1000`} style={{ width: `${m.probability}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3 font-mono">{formatVolume(m.volume)}</p>
                </div>

                {/* 30-day sparkline */}
                {history.length >= 2 && (
                  <div className="mt-3 px-1">
                    <p className="text-[9px] text-slate-600 uppercase tracking-wider mb-1">30-day trend</p>
                    <Sparkline data={history} color={indexColors.sparkline} />
                  </div>
                )}

                {/* Inline scenario */}
                {scenario && (
                  <div className="mt-4 pt-4 border-t border-slate-700/30 flex-1">
                    <h4 className={`text-xs font-bold ${indexColors.scenarioTitle} mb-2`}>{scenario.title}</h4>
                    <ul className="space-y-1.5">
                      {scenario.impact.map((item, j) => (
                        <li key={j} className="flex gap-2 text-xs text-slate-400">
                          <span className="text-slate-600 mt-0.5 flex-shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Fallback: data unavailable with inline scenarios
          [
            { label: "Hormuz normal Before May 1, 2026", border: "border-red-500/30", scenarioIdx: 0 },
            { label: "Hormuz normal Before Jul 1, 2026", border: "border-amber-500/30", scenarioIdx: 1 },
            { label: "Hormuz normal Before Jan 1, 2027", border: "border-emerald-500/30", scenarioIdx: 2 },
          ].map((f) => {
            const scenario = scenarios[f.scenarioIdx];
            const indexColors = colorForIndex(f.scenarioIdx);
            return (
              <div key={f.label} className={`bg-slate-800/50 rounded-xl border ${f.border} p-6 flex flex-col`}>
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-4">{f.label}</p>
                  <div className="text-5xl font-bold font-mono text-slate-600 mb-2">—%</div>
                  <p className="text-[10px] text-slate-600 mt-3">Data unavailable</p>
                </div>
                {scenario && (
                  <div className="mt-4 pt-4 border-t border-slate-700/30 flex-1">
                    <h4 className={`text-xs font-bold ${indexColors.scenarioTitle} mb-2`}>{scenario.title}</h4>
                    <ul className="space-y-1.5">
                      {scenario.impact.map((item, j) => (
                        <li key={j} className="flex gap-2 text-xs text-slate-400">
                          <span className="text-slate-600 mt-0.5 flex-shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Source attribution */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl px-6 py-4">
        <p className="text-xs text-slate-500">
          {hasData ? (
            <>
              Odds sourced from{" "}
              <a href="https://kalshi.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Kalshi.com</a>
              {" "}— a CFTC-regulated prediction market. Prices reflect real-money consensus probabilities. Updated hourly.
            </>
          ) : (
            <>
              Prediction market odds from{" "}
              <a href="https://kalshi.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Kalshi.com</a>
              {" "}are temporarily unavailable. Please check back shortly.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   NEWS / TIMELINE FEED (static from timeline.json)
   ════════════════════════════════════════════════════════════════════ */

function TimelineFeed({ timeline }: { timeline: TimelineData }) {
  const events = [...timeline.events]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20);

  if (events.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
        <p className="text-slate-500">No timeline events available.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-6">
      <div className="space-y-3">
        {events.map((item, i) => (
          <div key={`${item.date}-${i}`} className="flex gap-4 items-start">
            <span className="text-xs font-mono text-slate-500 whitespace-nowrap mt-0.5 w-20 flex-shrink-0 text-right">
              {item.date.slice(5)}
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-sm text-slate-300">{item.event}</span>
              <span className="text-[10px] text-slate-600 ml-2">({item.source})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   FAQ SECTION
   ════════════════════════════════════════════════════════════════════ */

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "What are prediction markets?",
      a: `Prediction markets are real-money markets where participants bet on the outcome of future events. The prices reflect the collective probability estimate — if a contract trades at 71c, the market implies a 71% chance of that outcome. Kalshi is a US-regulated prediction market exchange. These are not financial advice.`,
    },
    {
      q: "What does \"days of supply\" actually mean?",
      a: `"Days of supply" measures how long current fuel stocks would last if consumption continued at normal rates and no new fuel arrived. But this number is misleading if taken literally — Australia's fuel system is a flow system, not a stockpile. It only works because new imports arrive continuously by ship, typically every 1–3 weeks.\n\nThe figure includes fuel at terminals, in depots, and on ships within Australia's Exclusive Economic Zone (EEZ). It also counts crude oil at the two remaining domestic refineries, converted to product equivalent.\n\nCritically, panic buying shrinks effective days rapidly. If demand spikes 50%, 38 days of petrol supply effectively becomes ~25 days. During the 2026 crisis, some areas saw demand surge 200%, draining local stations in hours even though national aggregate stocks looked adequate.`,
    },
    {
      q: "Why does a conflict in the Middle East affect my petrol price in Australia?",
      a: `Australia doesn't import oil directly from the Middle East — but our fuel suppliers do. This is "the double hop".\n\nAustralia imports ~90% of its refined fuel from five Asian countries: South Korea (30%), Singapore (25%), Malaysia (15%), Taiwan (10%), and India (5%). These refineries get 60–70% of their crude oil shipments through the Strait of Hormuz.\n\nWhen Hormuz is disrupted, crude oil prices spike globally, Asian refineries receive less crude and slow output, refining margins increase as supply tightens, and shipping insurance and rerouting costs add further premiums.\n\nAll of these costs flow through to Australian fuel prices within 2–6 weeks, depending on existing contracts and the lag in the pricing benchmark (Singapore Mogas 95).`,
    },
    {
      q: "Why is my servo dry if national supply looks adequate?",
      a: `National aggregate stock numbers can be misleading. Australia uses a "just-in-time" fuel distribution system, similar to supermarket logistics. Fuel is shipped from ~55 import terminals to ~7,800 service stations by a fleet of tanker trucks, each carrying ~36,000 litres.\n\nWhen demand at a station surges — as happens during panic buying — the bottleneck isn't how much fuel exists nationally. It's how fast trucks can deliver it. Each truck takes ~45 minutes to load, drives to the station, and returns. The fleet size is fixed.\n\nIndependent stations are hit hardest because they buy fuel on spot markets. Branded stations (BP, Ampol, etc.) have standing supply contracts that get filled first. During shortages, major fuel companies prioritise their own branded outlets.`,
    },
    {
      q: "Why does diesel matter more than petrol?",
      a: `While petrol gets the headlines because that's what most consumers buy, diesel is the fuel that runs the economy. Diesel powers 84% of on-farm energy (tractors, harvesters, irrigation pumps), 100% of heavy road freight (the trucks that stock supermarkets), most mining equipment, rail freight, and backup power generators for hospitals, data centres, and critical infrastructure.\n\nDiesel stocks currently sit at only 18% above the regulatory minimum (MSO), compared to 78% for petrol — much thinner headroom. The National Farmers' Federation has warned that a prolonged diesel shortage could drive food prices up 50% as transport and farming costs surge.\n\nA diesel shortage doesn't just mean expensive fill-ups — it means empty supermarket shelves, halted construction, and paralysed supply chains.`,
    },
    {
      q: "What is the MSO and why does it matter?",
      a: `The MSO (Minimum Stockholding Obligation) is a regulatory requirement introduced in 2012 that compels fuel importers and refiners to hold a minimum number of days of fuel stock at all times.\n\nImportantly, the MSO is held by private companies, not the government. Australia — unlike the US, Japan, and most other IEA members — has no government-owned strategic fuel reserve. The MSO is the closest thing we have.\n\nDuring the 2026 crisis, the government temporarily reduced the MSO minimum to allow companies to sell stocks they were previously required to hold. This was described as "releasing emergency reserves," but it's more accurate to say the government lowered the regulatory floor. The fuel was always owned by private companies.`,
    },
    {
      q: "What is the IEA 90-day obligation and does Australia meet it?",
      a: `As a member of the International Energy Agency (IEA), Australia is obligated to hold oil stocks equivalent to at least 90 days of net imports. This obligation was designed as a collective insurance policy after the 1973 oil crisis.\n\nAustralia has been below the 90-day target since 2012. Current holdings sit at roughly 55 IEA days — the lowest among all 32 member nations. Most other IEA members hold 130–175 days.\n\nThe gap exists because Australia chose to meet its IEA obligation through "tickets" — essentially futures contracts where other countries agreed to release oil on Australia's behalf. As the crisis has shown, these tickets are less reliable than physical reserves when everyone needs oil simultaneously.`,
    },
    {
      q: "What happens if the disruption lasts months?",
      a: `If the Hormuz disruption continues beyond 2–3 months, the government has several escalation levers:\n\n1. Further MSO reductions — the regulatory minimum can be lowered further, though this burns through remaining buffer.\n2. IEA coordinated releases — member nations release oil collectively, but with 32 nations all drawing simultaneously, the pool is finite.\n3. Formal rationing under the Liquid Fuel Emergency Act 1984 — the government can direct fuel allocation to priority sectors.\n4. Priority sector allocations — agriculture, defence, health, emergency services, and freight get fuel first. Civilian driving may be restricted.\n5. Alternative supply routes — emergency shipments from the US Strategic Petroleum Reserve take 55–60 days to reach Australia.\n\nThe worst-case scenario (full Hormuz closure for 6+ months) would likely trigger all of these simultaneously, with severe economic consequences including potential food price spikes of 30–50%.`,
    },
  ];

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
            <span className="text-slate-500 text-lg flex-shrink-0">{openIndex === i ? "−" : "+"}</span>
          </button>
          {openIndex === i && (
            <div className="px-6 pb-6 border-t border-slate-700/30 animate-in">
              <div className="mt-4 text-sm text-slate-400 leading-relaxed whitespace-pre-line">{faq.a}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   LAYER COLUMN SELECTOR
   ════════════════════════════════════════════════════════════════════ */

interface LayerConfig {
  id: number;
  name: string;
  indicators: { label: string; value: string; status: "green" | "amber" | "red" }[];
  aggregateStatus: "green" | "amber" | "red";
}

function buildLayerConfigs(data: DashboardData, liveBrentPrice: number | null, kalshiMarkets: KalshiOdds[] | null): LayerConfig[] {
  const snap = data.snapshot;
  const brentPrice = liveBrentPrice ?? snap.global.brent_crude_usd;

  const petrolPriceStatus: "green" | "amber" | "red" = snap.retail.avg_petrol_price_cpl > 230 ? "red" : snap.retail.avg_petrol_price_cpl > 200 ? "amber" : "green";
  const dieselPriceStatus: "green" | "amber" | "red" = snap.retail.avg_diesel_price_cpl > 250 ? "red" : snap.retail.avg_diesel_price_cpl > 220 ? "amber" : "green";
  const petrolDaysStatus = getDaysSupplyStatus(snap.domestic.petrol_days_supply);
  const dieselDaysStatus = getDaysSupplyStatus(snap.domestic.diesel_days_supply);

  // Aggregate: worst of child indicators
  const worstOf = (...statuses: ("green" | "amber" | "red")[]): "green" | "amber" | "red" => {
    if (statuses.includes("red")) return "red";
    if (statuses.includes("amber")) return "amber";
    return "green";
  };

  // Supplier statuses
  const supplierEntries = data.suppliers.suppliers;
  const korea = supplierEntries.find((s) => s.country === "South Korea");
  const singapore = supplierEntries.find((s) => s.country === "Singapore");
  const malaysia = supplierEntries.find((s) => s.country === "Malaysia");
  const taiwan = supplierEntries.find((s) => s.country === "Taiwan");

  const koreaStatus = korea ? getRefineryUtilisationStatus(korea.refinery_utilisation_pct) : "amber";
  const singaporeStatus = singapore ? getRefineryUtilisationStatus(singapore.refinery_utilisation_pct) : "amber";
  const malaysiaStatus = malaysia ? getRefineryUtilisationStatus(malaysia.refinery_utilisation_pct) : "green";
  const domesticStatus: "green" | "amber" | "red" = "amber"; // both refineries operational but only ~20% domestic coverage

  const hormuzColor = (snap.global.hormuz_status === "open" ? "green" : "red") as "green" | "amber" | "red";
  const brentStatus: "green" | "amber" | "red" = brentPrice > 90 ? "red" : brentPrice > 75 ? "amber" : "green";
  const ieaStatus: "green" | "amber" | "red" = data.globalStatus.iea_release.committed_mbl >= data.globalStatus.iea_release.requested_mbl ? "green" : "amber";

  return [
    {
      id: 1,
      name: "Domestic Situation",
      aggregateStatus: worstOf(petrolPriceStatus, dieselPriceStatus, petrolDaysStatus, dieselDaysStatus),
      indicators: [
        { label: "Petrol price", value: formatCentsPerLitre(snap.retail.avg_petrol_price_cpl), status: petrolPriceStatus },
        { label: "Diesel price", value: formatCentsPerLitre(snap.retail.avg_diesel_price_cpl), status: dieselPriceStatus },
        { label: "Petrol supply", value: `${snap.domestic.petrol_days_supply} days`, status: petrolDaysStatus },
        { label: "Diesel supply", value: `${snap.domestic.diesel_days_supply} days`, status: dieselDaysStatus },
      ],
    },
    {
      id: 2,
      name: "Our Supply Chain",
      aggregateStatus: worstOf(koreaStatus as "green" | "amber" | "red", singaporeStatus as "green" | "amber" | "red", malaysiaStatus as "green" | "amber" | "red", domesticStatus),
      indicators: [
        { label: "S. Korea refineries", value: `${korea?.refinery_utilisation_pct ?? 0}%`, status: koreaStatus as "green" | "amber" | "red" },
        { label: "Singapore refineries", value: `${singapore?.refinery_utilisation_pct ?? 0}%`, status: singaporeStatus as "green" | "amber" | "red" },
        { label: "Malaysia refineries", value: `${malaysia?.refinery_utilisation_pct ?? 0}%`, status: malaysiaStatus as "green" | "amber" | "red" },
        { label: "Australia refineries", value: "85%", status: domesticStatus },
      ],
    },
    {
      id: 3,
      name: "Global Picture",
      aggregateStatus: worstOf(hormuzColor, brentStatus, ieaStatus),
      indicators: [
        { label: "Strait of Hormuz", value: snap.global.hormuz_status.charAt(0).toUpperCase() + snap.global.hormuz_status.slice(1), status: hormuzColor },
        { label: "Brent crude", value: `$${brentPrice.toFixed(2)}/bbl`, status: brentStatus },
        { label: "IEA release", value: `${data.globalStatus.iea_release.committed_mbl}M bbl`, status: ieaStatus },
      ],
    },
    (() => {
      // Build Layer 4 from live Kalshi data or fallback
      const pctToStatus = (p: number): "green" | "amber" | "red" =>
        p >= 65 ? "green" : p >= 35 ? "amber" : "red";

      if (kalshiMarkets && kalshiMarkets.length >= 3) {
        const indicators = kalshiMarkets.map((m) => ({
          label: m.date,
          value: `${m.probability}%`,
          status: pctToStatus(m.probability),
        }));
        return {
          id: 4,
          name: "Prediction Markets",
          aggregateStatus: worstOf(...indicators.map((i) => i.status)),
          indicators,
        };
      }

      return {
        id: 4,
        name: "Prediction Markets",
        aggregateStatus: "amber" as const,
        indicators: [
          { label: "Hormuz normal by May", value: "—%", status: "amber" as const },
          { label: "Hormuz normal by Jul", value: "—%", status: "amber" as const },
          { label: "Hormuz normal by Jan '27", value: "—%", status: "amber" as const },
        ],
      };
    })(),
  ];
}

function LayerColumnSelector({
  layers,
  activeLayer,
  onSelect,
}: {
  layers: LayerConfig[];
  activeLayer: number;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {layers.map((layer) => {
        const isActive = activeLayer === layer.id;
        const aggColors = getStatusColor(layer.aggregateStatus);

        return (
          <button
            key={layer.id}
            onClick={() => onSelect(layer.id)}
            className={`
              relative rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer
              ${isActive
                ? `bg-slate-800/80 ${aggColors.border} border-2 ring-1 ring-${layer.aggregateStatus === "red" ? "red" : layer.aggregateStatus === "amber" ? "amber" : "emerald"}-500/20`
                : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600/50"
              }
            `}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <StatusDot status={layer.aggregateStatus} />
              <h3 className="text-sm font-semibold text-white">{layer.name}</h3>
            </div>

            {/* Indicators */}
            <div className="space-y-2">
              {layer.indicators.map((ind) => (
                <div key={ind.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getStatusColor(ind.status).dot}`} />
                    <span className="text-[11px] text-slate-400 truncate">{ind.label}</span>
                  </div>
                  <span className={`text-[11px] font-mono font-bold flex-shrink-0 ${getStatusColor(ind.status).text}`}>{ind.value}</span>
                </div>
              ))}
            </div>

            {/* Active indicator */}
            {isActive && <div className={`absolute bottom-0 left-4 right-4 h-0.5 ${aggColors.bg} rounded-t`} />}
          </button>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════════ */

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [liveBrentPrice, setLiveBrentPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState(1);
  const [kalshiMarkets, setKalshiMarkets] = useState<KalshiOdds[] | null>(null);
  const [kalshiHistory, setKalshiHistory] = useState<Record<string, KalshiHistoryPoint[]> | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const files = [
          "snapshot.json", "stocks-history.json", "oil-prices.json", "retail-prices.json",
          "suppliers.json", "outages.json", "import-sources.json", "shipping.json",
          "timeline.json", "price-decomposition.json", "global-status.json",
          "demand.json",
        ];
        const responses = await Promise.all(files.map((f) => fetch(`/data/${f}`)));
        const [
          snapshot, stocksHistory, oilPrices, retailPrices, suppliers, outages,
          importSources, shipping, timeline, priceDecomposition, globalStatus,
          demand,
        ] = await Promise.all(responses.map((r) => r.json()));

        setData({
          snapshot, stocksHistory, oilPrices, retailPrices, suppliers, outages,
          importSources, shipping, timeline, priceDecomposition, globalStatus,
          demand,
        });
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Fetch live oil price
  useEffect(() => {
    async function fetchLivePrice() {
      try {
        const res = await fetch("/api/oil-price");
        const d = await res.json();
        if (d.price) setLiveBrentPrice(d.price);
      } catch (error) {
        console.error("Failed to fetch live oil price:", error);
      }
    }
    fetchLivePrice();
    const interval = setInterval(fetchLivePrice, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Kalshi prediction market odds
  useEffect(() => {
    async function fetchKalshi() {
      try {
        const res = await fetch("/api/kalshi");
        const d = await res.json();
        if (d.markets) {
          setKalshiMarkets(d.markets);
        }
        if (d.history) {
          setKalshiHistory(d.history);
        }
      } catch (error) {
        console.error("Failed to fetch Kalshi odds:", error);
      }
    }
    fetchKalshi();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse [animation-delay:150ms]" />
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse [animation-delay:300ms]" />
          </div>
          <p className="mt-4 text-sm text-slate-500">Loading fuel supply data…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold">Failed to load data</p>
          <p className="text-sm text-slate-500 mt-2">Please check the data files and try again.</p>
        </div>
      </div>
    );
  }

  const layers = buildLayerConfigs(data, liveBrentPrice, kalshiMarkets);

  return (
    <main className="min-h-screen bg-slate-950">
      {/* ─── Hero / Header ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              </span>
              <span className="text-xs font-medium text-amber-400 uppercase tracking-widest">Live Monitoring</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              Australia Fuel Supply
            </h1>
            <p className="mt-3 text-lg text-slate-400 max-w-2xl mx-auto">
              Tracking the supply chain from the Strait of Hormuz to the bowser at your local servo.
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Data as of {data.snapshot.snapshot_date} · Sources: DCCEEW, AIP, JODI, NSW FuelCheck, IEA
            </p>
          </div>
        </div>
      </section>

      {/* ─── Four-Column Layer Selector ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pb-6">
        <LayerColumnSelector layers={layers} activeLayer={activeLayer} onSelect={setActiveLayer} />
      </section>

      {/* ─── Expanded Layer Detail Panel ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="border-t border-slate-800/50 pt-8">
          {/* Section header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/40 mb-3">
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                {layers.find((l) => l.id === activeLayer)?.name}
              </span>
            </div>
          </div>

          {/* Layer content */}
          {activeLayer === 1 && (
            <Layer1Detail
              snapshot={data.snapshot}
              stocksHistory={data.stocksHistory}
              retailPrices={data.retailPrices}
              outages={data.outages}
              demand={data.demand}
            />
          )}
          {activeLayer === 2 && (
            <Layer2Detail
              suppliers={data.suppliers}
              importSources={data.importSources}
              shipping={data.shipping}
            />
          )}
          {activeLayer === 3 && (
            <Layer3Detail
              snapshot={data.snapshot}
              oilPrices={data.oilPrices}
              liveBrentPrice={liveBrentPrice}
              globalStatus={data.globalStatus}
            />
          )}
          {activeLayer === 4 && <Layer4Detail kalshiMarkets={kalshiMarkets} kalshiHistory={kalshiHistory} />}
        </div>
      </section>

      {/* ─── News / Timeline Feed ─── */}
      <section className="border-t border-slate-800/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/40 mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Feed</span>
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">News &amp; Events</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Crisis Timeline</h2>
            <p className="text-slate-400 text-sm">Key events in the 2026 fuel supply crisis, sourced from government and media reports.</p>
          </div>
          <TimelineFeed timeline={data.timeline} />
        </div>
      </section>

      {/* ─── FAQs ─── */}
      <section className="border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/40 mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Help</span>
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Understanding the Data</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-sm">Common questions about Australia&apos;s fuel supply situation.</p>
          </div>
          <FAQSection />
        </div>
      </section>

      {/* ─── Footer ─── */}
      <Footer />
    </main>
  );
}
