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

/* ─── The Double Hop — animated SVG ─── */
function DoubleHopMap() {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-amber-500/20 p-6">
      <h3 className="text-lg font-semibold text-amber-400 mb-1">
        🗺️ &quot;The Double Hop&quot; — Why a war in Iran empties Australian servos
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Australia&apos;s fuel doesn&apos;t come from the Middle East directly. It comes from Asian refineries that get 60–70% of their crude through Hormuz.
      </p>

      <svg viewBox="0 0 920 380" className="w-full h-auto" aria-label="The Double Hop supply chain from Middle East through Asian refineries to Australia">
        <defs>
          <style>{`
            .hop-flow { animation: hop-dash 3s linear infinite; }
            @keyframes hop-dash { to { stroke-dashoffset: -30; } }
            .hop-pulse { animation: hop-p 2s ease-in-out infinite; }
            @keyframes hop-p { 0%,100% { opacity:0.6 } 50% { opacity:1 } }
          `}</style>
        </defs>

        {/* Flow paths */}
        <path d="M 105,170 Q 170,170 210,190" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="8 6" className="hop-flow" opacity="0.8" />
        <path d="M 250,190 Q 340,100 450,85" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
        <path d="M 250,190 Q 340,160 450,155" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
        <path d="M 250,190 Q 340,220 450,230" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
        <path d="M 250,190 Q 340,270 450,290" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
        <path d="M 500,85 Q 610,140 730,235" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
        <path d="M 500,155 Q 610,190 730,245" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
        <path d="M 500,230 Q 610,240 730,255" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />
        <path d="M 500,290 Q 610,280 730,260" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="8 6" className="hop-flow" opacity="0.7" />

        {/* Labels */}
        <text x="105" y="25" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700">CRUDE SOURCE</text>
        <text x="350" y="25" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700">ASIAN REFINERIES</text>
        <text x="750" y="25" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700">AUSTRALIA</text>

        {/* Middle East */}
        <circle cx="105" cy="170" r="26" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
        <text x="105" y="167" textAnchor="middle" fill="#ef4444" fontSize="20">🛢️</text>
        <text x="105" y="183" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold">CRUDE</text>
        <text x="105" y="210" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">Middle East</text>

        {/* Hormuz */}
        <rect x="195" y="175" width="55" height="32" rx="6" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
        <text x="222" y="190" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="bold">HORMUZ</text>
        <text x="222" y="201" textAnchor="middle" fill="#ef4444" fontSize="7">⚠ RESTRICTED</text>
        <text x="222" y="222" textAnchor="middle" fill="#94a3b8" fontSize="8">20% global oil</text>

        {/* Refinery nodes */}
        <circle cx="450" cy="85" r="22" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" className="hop-pulse" />
        <text x="450" y="82" textAnchor="middle" fill="white" fontSize="16">🇰🇷</text>
        <text x="450" y="95" textAnchor="middle" fill="#94a3b8" fontSize="7">26%</text>
        <text x="450" y="118" textAnchor="middle" fill="#cbd5e1" fontSize="9">S. Korea</text>

        <circle cx="450" cy="155" r="22" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" className="hop-pulse" />
        <text x="450" y="152" textAnchor="middle" fill="white" fontSize="16">🇸🇬</text>
        <text x="450" y="165" textAnchor="middle" fill="#94a3b8" fontSize="7">25%</text>
        <text x="510" y="158" textAnchor="start" fill="#cbd5e1" fontSize="9">Singapore</text>

        <circle cx="450" cy="230" r="22" fill="#1e293b" stroke="#22c55e" strokeWidth="2" className="hop-pulse" />
        <text x="450" y="227" textAnchor="middle" fill="white" fontSize="16">🇲🇾</text>
        <text x="450" y="240" textAnchor="middle" fill="#94a3b8" fontSize="7">13%</text>
        <text x="510" y="233" textAnchor="start" fill="#cbd5e1" fontSize="9">Malaysia</text>

        <circle cx="450" cy="290" r="22" fill="#1e293b" stroke="#22c55e" strokeWidth="2" className="hop-pulse" />
        <text x="450" y="287" textAnchor="middle" fill="white" fontSize="16">🇮🇳</text>
        <text x="450" y="300" textAnchor="middle" fill="#94a3b8" fontSize="7">8%</text>
        <text x="510" y="293" textAnchor="start" fill="#cbd5e1" fontSize="9">India</text>

        {/* Transit times */}
        <text x="580" y="120" textAnchor="middle" fill="#64748b" fontSize="8" fontStyle="italic">~15 days</text>
        <text x="620" y="190" textAnchor="middle" fill="#64748b" fontSize="8" fontStyle="italic">8–14 days</text>
        <text x="620" y="250" textAnchor="middle" fill="#64748b" fontSize="8" fontStyle="italic">~7 days</text>

        {/* Australia */}
        <circle cx="750" cy="250" r="34" fill="#1e293b" stroke="#3b82f6" strokeWidth="3" />
        <text x="750" y="245" textAnchor="middle" fill="white" fontSize="24">🇦🇺</text>
        <text x="750" y="264" textAnchor="middle" fill="#93c5fd" fontSize="8" fontWeight="bold">AUSTRALIA</text>

        {/* Final mile */}
        <path d="M 785,250 L 840,250" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="845" y="243" textAnchor="start" fill="white" fontSize="12">🚛</text>
        <text x="845" y="258" textAnchor="start" fill="#64748b" fontSize="8">hours</text>
        <path d="M 870,250 L 905,250" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="903" y="243" textAnchor="start" fill="white" fontSize="11">⛽</text>
        <text x="897" y="258" textAnchor="start" fill="#64748b" fontSize="7">servo</text>

        {/* Emergency US route */}
        <text x="750" y="315" textAnchor="middle" fill="#64748b" fontSize="8">Emergency: US → Aus: 55–60 days</text>
      </svg>

      <p className="text-sm text-slate-400 mt-4 leading-relaxed">
        <strong className="text-white">Key insight:</strong> When Hormuz is restricted, it doesn&apos;t matter that Australia has no direct oil trade with Iran.
        Our suppliers&apos; suppliers are affected. This is why a conflict 12,000km away can empty a servo in rural NSW within weeks.
      </p>
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

/* ─── Supplier Detail Cards ─── */
function SupplierCards({ suppliers }: { suppliers: SuppliersData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {suppliers.suppliers.map((s) => {
        const colors = getStatusColor(s.status);
        return (
          <div key={s.country} className={`bg-slate-800/50 rounded-xl border ${colors.border} p-5`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{s.flag}</span>
              <div>
                <h4 className="text-white font-semibold">{s.country}</h4>
                <p className="text-xs text-slate-500">{s.share_pct}% of imports</p>
              </div>
              <span className={`ml-auto w-2.5 h-2.5 rounded-full ${colors.dot}`} />
            </div>
            <p className="text-xs text-slate-400 mb-3">{s.role}</p>
            {s.gasoline_stocks_ml && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <span className="text-xs text-slate-500">Gasoline stocks</span>
                  <p className="text-sm font-mono text-white">{s.gasoline_stocks_ml} ML</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Diesel stocks</span>
                  <p className="text-sm font-mono text-white">{s.diesel_stocks_ml} ML</p>
                </div>
              </div>
            )}
            <div className="mb-2">
              <span className="text-xs text-slate-500">Refinery utilisation</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${colors.bg} rounded-full`} style={{ width: `${s.refinery_utilisation_pct}%` }} />
                </div>
                <span className="text-xs font-mono text-slate-300">{s.refinery_utilisation_pct}%</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">{s.note}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Layer 2 ─── */
export default function Layer2SupplyChain({ snapshot, suppliers, importSources, shipping }: Layer2Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading
        layer={2}
        title="Where does our fuel come from?"
        subtitle="Australia imports ~90% of its refined fuel. Only two refineries remain domestically — supplying less than 20% of demand. The rest arrives from Asian refineries, taking 1–3 weeks by tanker ship."
      />

      {/* Import sources + Ship cancellations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ImportDonut importSources={importSources} />
        <ShipCancellations shipping={shipping} />
      </div>

      {/* The Double Hop */}
      <div className="mb-8">
        <DoubleHopMap />
      </div>

      {/* Distribution funnel */}
      <div className="mb-8">
        <DistributionFunnel />
      </div>

      {/* Supplier detail cards */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Top Supplier Countries (JODI data)</h3>
        <SupplierCards suppliers={suppliers} />
        <DataMeta source="JODI Oil World Database" asOf={suppliers.jodi_last_updated} refresh="Monthly (~20th)" />
      </div>

      {/* Domestic refineries */}
      <div className="bg-slate-800/30 rounded-xl border border-amber-500/20 p-6">
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
          🏭 Australia&apos;s Remaining Refineries (2 of originally 8)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {suppliers.domestic_refineries.map((r) => (
            <div key={r.name} className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">●</span>
              <div>
                <p className="text-white font-medium">{r.name}</p>
                <p className="text-xs text-slate-400">{r.location} · {r.capacity_bpd.toLocaleString()} bbl/day</p>
                <p className="text-xs text-slate-500 italic">{r.note}</p>
              </div>
            </div>
          ))}
        </div>
        <DataMeta source="DCCEEW" refresh="Static (event-driven)" />
      </div>
    </section>
  );
}
