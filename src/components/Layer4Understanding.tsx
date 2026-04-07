"use client";

import { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import type { Snapshot, PriceDecompositionData, RetailPrices, RefineryHistory, GlobalStatusData } from "@/lib/types";
import { formatLitres } from "@/lib/utils";
import { SectionHeading, DataMeta } from "@/components/ui";

interface Layer4Props {
  snapshot: Snapshot;
  priceDecomposition: PriceDecompositionData;
  retailPrices: RetailPrices;
  refineryHistory: RefineryHistory;
  globalStatus: GlobalStatusData;
}

/* ─── Expandable Section ─── */
function ExpandableSection({
  id,
  title,
  icon,
  children,
  defaultOpen,
}: {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-800/80 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <span className="text-base font-semibold text-white">{title}</span>
        </div>
        <span className="text-slate-500 text-lg">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-6 pb-6 border-t border-slate-700/30">{children}</div>}
    </div>
  );
}

/* ─── 4.1: Days of Supply explainer with bathtub ─── */
function DaysOfSupplyExplainer({ snapshot }: { snapshot: Snapshot }) {
  return (
    <div className="mt-4 space-y-4">
      {/* Bathtub visual */}
      <div className="bg-slate-700/30 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-3">The bathtub model — fuel is a flow, not a stockpile</h4>
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-3xl mb-1">🚢</div>
            <div className="text-xs text-blue-400 font-semibold">IMPORTS IN</div>
            <div className="text-[10px] text-slate-500">(the tap)</div>
          </div>
          <div className="relative w-32 h-24 border-2 border-slate-500 rounded-b-xl">
            <div className="absolute bottom-0 left-0 right-0 bg-blue-500/30 rounded-b-lg transition-all" style={{ height: "55%" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-mono text-white font-bold">Buffer</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">⛽</div>
            <div className="text-xs text-red-400 font-semibold">CONSUMPTION OUT</div>
            <div className="text-[10px] text-slate-500">(the drain)</div>
          </div>
        </div>
        <p className="text-xs text-slate-500 text-center mt-3">
          When the tap slows (import disruption), the level drops. When the drain opens wider (panic buying), it drops faster.
        </p>
      </div>

      {/* Three measures comparison */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold font-mono text-amber-400">~38</div>
          <div className="text-xs text-white mt-1">MSO Days (Petrol)</div>
          <div className="text-[10px] text-slate-500">Regulatory minimum buffer</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold font-mono text-blue-400">{snapshot.domestic.iea_actual_days}</div>
          <div className="text-xs text-white mt-1">IEA Days</div>
          <div className="text-[10px] text-slate-500">Total stocks vs net imports</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold font-mono text-slate-400">{snapshot.domestic.iea_obligation_days}</div>
          <div className="text-xs text-white mt-1">IEA Target</div>
          <div className="text-[10px] text-slate-500">Not met since 2012</div>
        </div>
      </div>

      <p className="text-sm text-slate-400 leading-relaxed">
        These three numbers cause confusion because they measure different things. MSO days are the regulatory minimum
        private companies must hold — they include fuel on ships and crude at refineries. IEA days compare total
        oil stocks against net imports. The key insight: <strong className="text-white">these numbers only work because imports
        arrive continuously</strong>. If the flow stops, the &quot;days&quot; shrink fast.
      </p>
    </div>
  );
}

/* ─── 4.2: Price Decomposition ─── */
function PriceDecompositionChart({ data }: { data: PriceDecompositionData }) {
  return (
    <div className="mt-4 space-y-4">
      {/* Stacked bar visual */}
      <div className="bg-slate-700/30 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-3">What&apos;s in ~{data.total_cpl.toFixed(0)}¢/L at the bowser?</h4>
        <div className="flex h-10 rounded-lg overflow-hidden mb-3">
          {data.components.map((c) => (
            <div
              key={c.label}
              className="flex items-center justify-center text-[9px] font-bold text-white transition-all hover:opacity-80"
              style={{ width: `${(c.cpl / data.total_cpl) * 100}%`, backgroundColor: c.color }}
              title={`${c.label}: ${c.cpl}¢`}
            >
              {c.cpl >= 20 ? `${c.cpl}¢` : ""}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data.components.map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: c.color }} />
              <span className="text-xs text-slate-400">{c.label}</span>
              <span className="text-xs font-mono text-white ml-auto">{c.cpl}¢</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-400 leading-relaxed">
        <p>
          <strong className="text-white">~{data.tax_share_pct}% of the bowser price is tax</strong> (excise {data.notes.excise_rate} + GST {data.notes.gst_rate}).
          The retail margin (~20¢) is a small slice — the major cost drivers are crude price and the Singapore refining margin.
        </p>
        <p>
          Australian prices are set by the <strong className="text-amber-400">{data.notes.benchmark}</strong> benchmark, not crude oil directly.
          There&apos;s a {data.notes.lag} between international price moves and bowser changes.
        </p>
        <p>
          The &quot;rockets and feathers&quot; pattern (prices rise fast, fall slow) is real but partly reflects replacement-cost pricing —
          retailers price based on what their next delivery will cost, not what they paid for fuel already in their tanks.
        </p>
      </div>
      <DataMeta source={data.source} asOf={data.as_of} refresh="Quarterly (ACCC)" />
    </div>
  );
}

/* ─── 4.3: Diesel Iceberg ─── */
function DieselIceberg() {
  return (
    <div className="mt-4 space-y-4">
      {/* Iceberg visual */}
      <div className="bg-slate-700/30 rounded-lg p-4">
        <div className="relative">
          {/* Water line */}
          <div className="border-b-2 border-blue-400/40 pb-4 mb-4">
            <div className="text-center">
              <span className="text-xs text-blue-400 font-semibold absolute right-2 top-1/2 -translate-y-1/2">― water line ―</span>
              <div className="bg-amber-500/20 rounded-lg px-4 py-3 inline-block">
                <div className="text-lg">⛽</div>
                <div className="text-sm font-semibold text-white">Petrol at the bowser</div>
                <div className="text-xs text-slate-400">What consumers see</div>
              </div>
            </div>
          </div>
          {/* Below waterline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "🚜", label: "Agriculture", detail: "84% of on-farm energy" },
              { icon: "🚛", label: "Road Freight", detail: "Fuel = 25–35% of costs" },
              { icon: "⛏️", label: "Mining", detail: "All heavy equipment" },
              { icon: "🔌", label: "Backup Power", detail: "Diesel generators" },
            ].map((item) => (
              <div key={item.label} className="bg-slate-600/30 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs font-semibold text-white">{item.label}</div>
                <div className="text-[10px] text-slate-400">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-400 leading-relaxed">
        <p>
          Public discourse fixates on petrol because that&apos;s what consumers see. But diesel is the fuel that runs the economy.
          It powers <strong className="text-white">84% of on-farm energy</strong>, 100% of road freight, most mining equipment, and backup power generation.
        </p>
        <p>
          Diesel stocks have only <strong className="text-red-400">18% headroom</strong> above MSO minimum vs 78% for petrol.
          The NFF warned diesel shortages could drive food prices up <strong className="text-red-400">50%</strong>.
          A prolonged diesel shortage doesn&apos;t just mean expensive fill-ups — it means empty supermarket shelves.
        </p>
      </div>
    </div>
  );
}

/* ─── 4.4: Scenarios ─── */
function ScenariosSection() {
  const scenarios = [
    {
      title: "Hormuz reopens within 2 weeks",
      likelihood: "Possible",
      color: "emerald" as const,
      impact: [
        "Crude oil prices begin normalising within days",
        "Australian retail prices normalise in 4–6 weeks (shipping lag + price transmission)",
        "Emergency reserves returned to pre-crisis levels within 3 months",
        "No rationing required",
      ],
      indicator: "Watch for: diplomatic breakthrough, Iran lifting restrictions",
    },
    {
      title: "Disruption continues 1–3 months",
      likelihood: "Most likely",
      color: "amber" as const,
      impact: [
        "Continued drawdown of emergency reserves",
        "Further IEA coordinated releases",
        "Retail prices remain elevated ($2.40–$2.80/L)",
        "Regional fuel rationing becomes possible",
        "US and other emergency supply routes become structural",
      ],
      indicator: "Watch for: sustained oil above $95, further ship cancellations",
    },
    {
      title: "Prolonged disruption (3+ months)",
      likelihood: "Worst case",
      color: "red" as const,
      impact: [
        "Emergency reserves approach depletion",
        "Formal rationing under Liquid Fuel Emergency Act 1984",
        "Priority sectors (agriculture, defence, health, freight) get allocations",
        "Civilian driving restrictions possible",
        "Severe economic impact — food prices spike",
      ],
      indicator: "Watch for: Hormuz fully closed, allied military escalation",
    },
  ];

  const colorMap = {
    emerald: { border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-400" },
    amber: { border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-400" },
    red: { border: "border-red-500/30", text: "text-red-400", badge: "bg-red-500/20 text-red-400" },
  };

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {scenarios.map((s) => {
          const c = colorMap[s.color];
          return (
            <div key={s.title} className={`bg-slate-700/30 rounded-xl border ${c.border} p-5 flex flex-col`}>
              <h4 className={`text-base font-bold ${c.text} mb-2`}>{s.title}</h4>
              <span className={`inline-block self-start text-xs font-medium px-2.5 py-1 rounded-full ${c.badge} mb-3`}>
                {s.likelihood}
              </span>
              <ul className="space-y-2 flex-1 list-disc list-inside">
                {s.impact.map((item, i) => (
                  <li key={i} className="text-sm text-slate-400">
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-600 mt-3 pt-2 border-t border-slate-700/30 italic">{s.indicator}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── 4.5: Emergency Reserve Drawdown ─── */
function EmergencyDrawdown({ snapshot, globalStatus }: { snapshot: Snapshot; globalStatus: GlobalStatusData }) {
  const totalAuth = snapshot.domestic.emergency_release_authorised_litres;
  const petrolDays = snapshot.domestic.emergency_release_drawn_petrol_days;
  const dieselDays = snapshot.domestic.emergency_release_drawn_diesel_days;

  return (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold font-mono text-red-400">{formatLitres(totalAuth)}</div>
          <div className="text-xs text-slate-400 mt-1">Authorised for release</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold font-mono text-amber-400">{petrolDays}d</div>
          <div className="text-xs text-slate-400 mt-1">Petrol drawn so far</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold font-mono text-amber-400">{dieselDays}d</div>
          <div className="text-xs text-slate-400 mt-1">Diesel drawn so far</div>
        </div>
      </div>
      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
        <p className="text-xs text-red-400">
          ✅ <strong>Fact:</strong> This is NOT drawing from a government reserve. The government reduced the MSO minimum,
          allowing private companies to sell stock they were previously required to hold. The companies still own the fuel.
        </p>
      </div>
      <DataMeta source={globalStatus.australia_contribution.source} asOf={globalStatus.australia_contribution.as_of} />
    </div>
  );
}

/* ─── 4.6: IEA 90-Day Gap ─── */
function IEAGapChart({ snapshot }: { snapshot: Snapshot }) {
  const countries = [
    { name: "Japan", days: 175 },
    { name: "Germany", days: 160 },
    { name: "USA", days: 155 },
    { name: "S. Korea", days: 145 },
    { name: "France", days: 140 },
    { name: "UK", days: 130 },
    { name: "Australia", days: snapshot.domestic.iea_actual_days },
  ];

  return (
    <div className="mt-4">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={countries} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}d`} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#e2e8f0" }}
            formatter={(value) => [`${value} days`, "IEA Stock"]}
          />
          <Bar dataKey="days" radius={[4, 4, 0, 0]}>
            {countries.map((c) => (
              <Cell key={c.name} fill={c.name === "Australia" ? "#ef4444" : "#3b82f6"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm text-slate-400 mt-2">
        Australia holds only <strong className="text-red-400">{snapshot.domestic.iea_actual_days} IEA days</strong> vs the 90-day obligation —
        Australia holds fewer IEA days than most member nations, and has been below the 90-day obligation since 2012. Most IEA members hold 140+ days.
      </p>
    </div>
  );
}

/* ─── 4.7: Market Structure ─── */
function MarketStructure() {
  return (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold font-mono text-amber-400">~85%</div>
          <div className="text-xs text-slate-400 mt-1">Supply controlled by top 4</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold font-mono text-amber-400">50 / 55</div>
          <div className="text-xs text-slate-400 mt-1">Import terminals owned by top 4</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {["Ampol", "Viva Energy", "BP", "ExxonMobil"].map((co) => (
          <span key={co} className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-lg border border-amber-500/20 font-medium">
            {co}
          </span>
        ))}
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">
        Independent retailers (representing ~45% of service stations) must access terminals owned by their competitors.
        During shortages, supply allocation follows contracts, not need — so branded stations with standing contracts
        get filled first.
      </p>
      <p className="text-sm text-slate-400 leading-relaxed">
        The ACCC has authorised fuel majors to coordinate supply during the crisis (with conditions), and
        is monitoring supply allocation practices, including access for independent retailers.
      </p>
      <DataMeta source="ACCC / AIP" refresh="Event-driven" />
    </div>
  );
}

/* ─── 4.8: Cost Calculator ─── */
function CostCalculator({ snapshot, retailPrices }: { snapshot: Snapshot; retailPrices: RetailPrices }) {
  const [km, setKm] = useState(300);
  const [fuelType, setFuelType] = useState<"petrol" | "diesel">("petrol");
  const [economy, setEconomy] = useState(8.5);

  const presets = [
    { name: "Toyota Corolla", economy: 6.8 },
    { name: "Toyota RAV4", economy: 8.1 },
    { name: "Ford Ranger", economy: 10.2 },
    { name: "Mazda CX-5", economy: 7.5 },
    { name: "Isuzu D-Max", economy: 7.9 },
  ];

  const currentPrice = fuelType === "petrol" ? snapshot.retail.avg_petrol_price_cpl : snapshot.retail.avg_diesel_price_cpl;
  const priceHistory = fuelType === "petrol" ? retailPrices.petrol_30d : retailPrices.diesel_30d;
  const oldPrice = priceHistory[0]?.price ?? currentPrice * 0.8;

  const weeklyLitres = (km / 100) * economy;
  const weeklyCostNow = (weeklyLitres * currentPrice) / 100;
  const weeklyCostOld = (weeklyLitres * oldPrice) / 100;
  const weeklyDiff = weeklyCostNow - weeklyCostOld;
  const annualDiff = weeklyDiff * 52;

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Weekly km driven</label>
          <input
            type="range"
            min={50}
            max={1000}
            step={50}
            value={km}
            onChange={(e) => setKm(Number(e.target.value))}
            className="w-full accent-amber-400"
          />
          <span className="text-sm font-mono text-white">{km} km/week</span>
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Fuel type</label>
          <div className="flex gap-2">
            <button
              onClick={() => setFuelType("petrol")}
              className={`flex-1 text-xs px-3 py-2 rounded-lg border transition ${fuelType === "petrol" ? "bg-amber-500/20 border-amber-500/40 text-amber-400" : "border-slate-700 text-slate-500"}`}
            >
              Petrol
            </button>
            <button
              onClick={() => setFuelType("diesel")}
              className={`flex-1 text-xs px-3 py-2 rounded-lg border transition ${fuelType === "diesel" ? "bg-red-500/20 border-red-500/40 text-red-400" : "border-slate-700 text-slate-500"}`}
            >
              Diesel
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Economy (L/100km)</label>
          <input
            type="number"
            value={economy}
            onChange={(e) => setEconomy(Number(e.target.value))}
            min={4}
            max={20}
            step={0.1}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm font-mono text-white"
          />
          <div className="flex flex-wrap gap-1 mt-1">
            {presets.map((p) => (
              <button key={p.name} onClick={() => setEconomy(p.economy)} className="text-[10px] text-blue-400 hover:text-blue-300 underline">
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-500">Weekly now</div>
          <div className="text-lg font-bold font-mono text-red-400">${weeklyCostNow.toFixed(2)}</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-500">Weekly 1 month ago</div>
          <div className="text-lg font-bold font-mono text-emerald-400">${weeklyCostOld.toFixed(2)}</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-500">Extra per year</div>
          <div className="text-lg font-bold font-mono text-amber-400">+${annualDiff.toFixed(0)}</div>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        That&apos;s equivalent to ~{Math.round(annualDiff / 15)} Netflix subscriptions or ~{Math.round(annualDiff / 5)} coffees per year.
      </p>
    </div>
  );
}

/* ─── 4.9: What-If Slider ─── */
function WhatIfSlider({ priceDecomposition }: { priceDecomposition: PriceDecompositionData }) {
  const [crudePrice, setCrudePrice] = useState(97);
  const [disruption, setDisruption] = useState(30);

  // Simple model: crude component scales with price, refinery margin scales with disruption
  const baseCrude = priceDecomposition.components[0].cpl; // ~88
  const baseRefinery = priceDecomposition.components[1].cpl; // ~36
  const fixedCosts = priceDecomposition.components.slice(2).reduce((s, c) => s + c.cpl, 0);

  const crudeFactor = crudePrice / 82; // base $82
  const disruptionFactor = 1 + (disruption / 100) * 0.8;
  const estimatedBowser = baseCrude * crudeFactor + baseRefinery * disruptionFactor + fixedCosts;

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Brent Crude Price (USD/bbl)</label>
          <input type="range" min={60} max={150} value={crudePrice} onChange={(e) => setCrudePrice(Number(e.target.value))} className="w-full accent-amber-400" />
          <span className="text-sm font-mono text-white">${crudePrice}/bbl</span>
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Shipping Disruption Level</label>
          <input type="range" min={0} max={100} value={disruption} onChange={(e) => setDisruption(Number(e.target.value))} className="w-full accent-red-400" />
          <span className="text-sm font-mono text-white">{disruption}%</span>
        </div>
      </div>
      <div className="bg-slate-700/30 rounded-lg p-4 text-center">
        <div className="text-xs text-slate-500 mb-1">Estimated bowser price impact</div>
        <div className="text-4xl font-bold font-mono text-amber-400">~{estimatedBowser.toFixed(0)}¢/L</div>
        <div className="text-xs text-slate-500 mt-1">
          {estimatedBowser > priceDecomposition.total_cpl
            ? `+${(estimatedBowser - priceDecomposition.total_cpl).toFixed(0)}¢ from current`
            : `${(estimatedBowser - priceDecomposition.total_cpl).toFixed(0)}¢ from current`
          }
        </div>
      </div>
      <p className="text-xs text-slate-600 italic">
        ⚠ This is a simplified model for illustration. Actual prices depend on exchange rates, refinery margins, competition, and government policy.
      </p>
    </div>
  );
}

/* ─── Main Layer 4 ─── */
export default function Layer4Understanding({ snapshot, priceDecomposition, retailPrices, refineryHistory, globalStatus }: Layer4Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading
        layer={4}
        title="Understanding the crisis"
        subtitle="Deeper explanations for visitors who want to learn more. Each section expands to reveal detailed analysis and interactive tools."
      />

      <div className="space-y-4">
        <ExpandableSection id="days-of-supply" title="What does 'days of supply' actually mean?" icon="📊">
          <DaysOfSupplyExplainer snapshot={snapshot} />
        </ExpandableSection>

        <ExpandableSection id="price-decomposition" title="What's in the price at the bowser?" icon="⛽">
          <PriceDecompositionChart data={priceDecomposition} />
        </ExpandableSection>

        <ExpandableSection id="diesel-iceberg" title="The Diesel Iceberg — Why diesel matters more than petrol" icon="🧊">
          <DieselIceberg />
        </ExpandableSection>

        <ExpandableSection id="scenarios" title="What happens next? — Three scenarios" icon="🔮">
          <ScenariosSection />
        </ExpandableSection>

        <ExpandableSection id="emergency-drawdown" title="Emergency reserve drawdown tracker" icon="🚨">
          <EmergencyDrawdown snapshot={snapshot} globalStatus={globalStatus} />
        </ExpandableSection>

        <ExpandableSection id="iea-gap" title="IEA 90-day obligation gap — How Australia compares" icon="📉">
          <IEAGapChart snapshot={snapshot} />
        </ExpandableSection>

        <ExpandableSection id="market-structure" title="Who controls Australia's fuel?" icon="🏢">
          <MarketStructure />
        </ExpandableSection>

        <ExpandableSection id="cost-calculator" title="How much is this costing you? — Personal calculator" icon="🧮">
          <CostCalculator snapshot={snapshot} retailPrices={retailPrices} />
        </ExpandableSection>

        <ExpandableSection id="what-if" title="What if? — Scenario slider" icon="🎚️">
          <WhatIfSlider priceDecomposition={priceDecomposition} />
        </ExpandableSection>
      </div>

      {/* Government links */}
      <div className="mt-8 bg-slate-800/30 rounded-xl border border-slate-700/30 p-6 text-center">
        <p className="text-sm text-slate-400 mb-3">For the latest official updates:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { label: "DCCEEW Fuel Security", url: "https://www.dcceew.gov.au/energy/security" },
            { label: "MSO Statistics", url: "https://www.dcceew.gov.au/energy/security/australias-fuel-security/minimum-stockholding-obligation/statistics" },
            { label: "IEA Emergency Response", url: "https://www.iea.org" },
          ].map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20 transition">
              {link.label} →
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
