"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { Snapshot, SuppliersData, ImportSourcesData, ShippingData } from "@/lib/types";
import { getStatusColor } from "@/lib/utils";
import { DataMeta, Explainer, SectionHeading } from "@/components/ui";

interface Layer2Props {
  snapshot: Snapshot;
  suppliers: SuppliersData;
  importSources: ImportSourcesData;
  shipping: ShippingData;
}

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#a855f7", "#ef4444", "#06b6d4", "#64748b"];

/* ─── Import Source Donut ─── */
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
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#e2e8f0" }}
                formatter={(value) => [`${value}%`, "Share"]}
              />
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

/* ─── Ship Cancellations ─── */
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

      {/* Ship icons grid */}
      <div className="flex flex-wrap gap-1 mb-4">
        {Array.from({ length: Math.min(total, 81) }).map((_, i) => (
          <span
            key={i}
            className={`text-sm ${i < active ? "opacity-30" : "opacity-100"}`}
            title={i < active ? "Active" : "Cancelled"}
          >
            {i < active ? "🚢" : "❌"}
          </span>
        ))}
      </div>

      {/* Monthly breakdown */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {Object.entries(shipping.monthly_breakdown).map(([fuel, count]) => (
          <div key={fuel} className="bg-slate-700/30 rounded-lg p-2 text-center">
            <span className="text-lg font-bold font-mono text-white">{count}</span>
            <p className="text-[10px] text-slate-500 capitalize">{fuel.replace("_", " ")}/mo</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 italic">{shipping.ships_replaced_note}</p>
      <DataMeta source={shipping.breakdown_source} />
    </div>
  );
}

/* ─── Adequate but Unavailable funnel ─── */
function DistributionFunnel() {
  const stages = [
    { label: "National Stock", detail: "1.6 billion litres petrol (38 days at normal rates)", note: "Looks adequate", width: "100%", color: "bg-emerald-500/30 border-emerald-500/30" },
    { label: "~55 Import Terminals", detail: "Only so many berths to unload ships", note: "", width: "70%", color: "bg-blue-500/30 border-blue-500/30" },
    { label: "Tanker Truck Fleet", detail: "~36,000L per truck · ~45 min to load", note: "Fixed fleet size", width: "45%", color: "bg-amber-500/30 border-amber-500/30" },
    { label: "7,798 Servos", detail: "Demand spike +200% = pumps run dry", note: "⚠ BOTTLENECK", width: "25%", color: "bg-red-500/30 border-red-500/30" },
  ];

  return (
    <div className="bg-slate-800/50 rounded-xl border border-amber-500/20 p-6">
      <h3 className="text-lg font-semibold text-amber-400 mb-1">
        🔻 &quot;Adequate but Unavailable&quot; — The distribution bottleneck
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        The problem isn&apos;t how much fuel Australia has. It&apos;s how fast we can move it.
      </p>
      <div className="flex flex-col items-center gap-2">
        {stages.map((s, i) => (
          <div key={i} className={`border rounded-lg px-4 py-3 text-center transition-all ${s.color}`} style={{ width: s.width, minWidth: "180px" }}>
            <div className="text-sm font-semibold text-white">{s.label}</div>
            <div className="text-xs text-slate-400">{s.detail}</div>
            {s.note && <div className="text-xs font-bold text-amber-400 mt-1">{s.note}</div>}
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-400 mt-4 leading-relaxed">
        When demand spikes 200% at individual stations, the trucks and terminals can&apos;t keep up —
        even though the tanks at the port are full. <strong className="text-white">Independent stations are hit hardest:</strong> they buy on spot markets,
        while big chains have standing contracts that get filled first.
      </p>
    </div>
  );
}

/* ─── Main Layer 2 ─── */
export default function Layer2SupplyChain({ snapshot, suppliers, importSources, shipping }: Layer2Props) {
  // Build 6 refinery utilisation cards: Australia + 5 source markets
  const sourceCountries = ["South Korea", "Singapore", "Malaysia", "Taiwan", "India"];
  const refineryCards: { flag: string; country: string; utilisation: number; status: string; note: string }[] = [];

  // Australia first
  refineryCards.push({ flag: "🇦🇺", country: "Australia", utilisation: 100, status: "green", note: "2 of 8 refineries remain (Lytton, Geelong)" });

  // Then source markets
  for (const name of sourceCountries) {
    const s = suppliers.suppliers.find((sup) => sup.country === name);
    if (s) {
      refineryCards.push({ flag: s.flag, country: s.country, utilisation: s.refinery_utilisation_pct, status: s.status, note: s.note });
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading
        layer={2}
        title="Where does our fuel come from?"
        subtitle="Australia imports ~90% of its refined fuel. Only two refineries remain domestically — supplying less than 20% of demand. The rest arrives from Asian refineries, taking 1–3 weeks by tanker ship."
      />

      {/* 1. Import donut — full width */}
      <div className="mb-8">
        <ImportDonut importSources={importSources} />
      </div>

      {/* 2. Refinery utilisation grid — 6 cards, responsive 3→2→1 */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Refinery Utilisation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {refineryCards.map((card) => {
            const colors = getStatusColor(card.status as "green" | "amber" | "red");
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
                <p className="text-xs text-slate-500 italic">{card.note}</p>
              </div>
            );
          })}
        </div>
        <DataMeta source="JODI Oil World Database" asOf={suppliers.jodi_last_updated} refresh="Monthly (~20th)" />
      </div>

      {/* 3. Ship cancellations — full width */}
      <div className="mb-8">
        <ShipCancellations shipping={shipping} />
      </div>

      {/* Distribution funnel */}
      <div className="mb-8">
        <DistributionFunnel />
      </div>
    </section>
  );
}
