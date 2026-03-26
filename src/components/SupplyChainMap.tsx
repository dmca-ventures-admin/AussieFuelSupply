"use client";

import { SuppliersData } from "@/lib/types";
import { getStatusColor } from "@/lib/utils";

interface SupplyChainMapProps {
  suppliers: SuppliersData;
}

function SupplyFlowSVG() {
  return (
    <svg viewBox="0 0 900 400" className="w-full h-auto" aria-label="Fuel supply chain flow from Middle East through Asian refineries to Australia">
      {/* Background */}
      <defs>
        <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.4" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Animated dash */}
        <style>{`
          .flow-line { animation: dash 3s linear infinite; }
          @keyframes dash { to { stroke-dashoffset: -30; } }
          .pulse-node { animation: pulse-scale 2s ease-in-out infinite; }
          @keyframes pulse-scale { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        `}</style>
      </defs>

      {/* Flow paths */}
      {/* Middle East to Hormuz */}
      <path d="M 100,180 Q 170,180 200,200" fill="none" stroke="#ef4444" strokeWidth="2"
        strokeDasharray="8 6" className="flow-line" opacity="0.7" />

      {/* Hormuz to Asian refineries */}
      <path d="M 240,200 Q 350,120 450,100" fill="none" stroke="#f59e0b" strokeWidth="2"
        strokeDasharray="8 6" className="flow-line" opacity="0.7" />
      <path d="M 240,200 Q 350,170 450,170" fill="none" stroke="#f59e0b" strokeWidth="2"
        strokeDasharray="8 6" className="flow-line" opacity="0.7" />
      <path d="M 240,200 Q 350,220 450,240" fill="none" stroke="#f59e0b" strokeWidth="2"
        strokeDasharray="8 6" className="flow-line" opacity="0.7" />
      <path d="M 240,200 Q 350,260 450,300" fill="none" stroke="#f59e0b" strokeWidth="2"
        strokeDasharray="8 6" className="flow-line" opacity="0.7" />

      {/* Asian refineries to Australia */}
      <path d="M 500,100 Q 600,150 700,250" fill="none" stroke="#22c55e" strokeWidth="2"
        strokeDasharray="8 6" className="flow-line" opacity="0.7" />
      <path d="M 500,170 Q 600,200 700,260" fill="none" stroke="#22c55e" strokeWidth="2"
        strokeDasharray="8 6" className="flow-line" opacity="0.7" />
      <path d="M 500,240 Q 600,250 700,270" fill="none" stroke="#22c55e" strokeWidth="2"
        strokeDasharray="8 6" className="flow-line" opacity="0.7" />
      <path d="M 500,300 Q 600,290 700,280" fill="none" stroke="#22c55e" strokeWidth="2"
        strokeDasharray="8 6" className="flow-line" opacity="0.7" />

      {/* Nodes */}
      {/* Middle East */}
      <circle cx="100" cy="180" r="24" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
      <text x="100" y="176" textAnchor="middle" fill="#ef4444" fontSize="20">🛢️</text>
      <text x="100" y="192" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">CRUDE</text>
      <text x="100" y="220" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">Middle East</text>

      {/* Hormuz chokepoint */}
      <rect x="195" y="185" width="50" height="30" rx="6" fill="#1e293b" stroke="#ef4444" strokeWidth="2" filter="url(#glow)" />
      <text x="220" y="200" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">HORMUZ</text>
      <text x="220" y="210" textAnchor="middle" fill="#ef4444" fontSize="6">⚠ RESTRICTED</text>

      {/* South Korea */}
      <circle cx="450" cy="100" r="20" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" className="pulse-node" />
      <text x="450" y="96" textAnchor="middle" fill="white" fontSize="16">🇰🇷</text>
      <text x="450" y="108" textAnchor="middle" fill="#94a3b8" fontSize="7">30%</text>
      <text x="450" y="132" textAnchor="middle" fill="#cbd5e1" fontSize="10">S. Korea</text>

      {/* Singapore */}
      <circle cx="450" cy="170" r="20" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" className="pulse-node" />
      <text x="450" y="166" textAnchor="middle" fill="white" fontSize="16">🇸🇬</text>
      <text x="450" y="178" textAnchor="middle" fill="#94a3b8" fontSize="7">25%</text>
      <text x="510" y="172" textAnchor="start" fill="#cbd5e1" fontSize="10">Singapore</text>

      {/* Malaysia */}
      <circle cx="450" cy="240" r="20" fill="#1e293b" stroke="#22c55e" strokeWidth="2" className="pulse-node" />
      <text x="450" y="236" textAnchor="middle" fill="white" fontSize="16">🇲🇾</text>
      <text x="450" y="248" textAnchor="middle" fill="#94a3b8" fontSize="7">15%</text>
      <text x="510" y="242" textAnchor="start" fill="#cbd5e1" fontSize="10">Malaysia</text>

      {/* Taiwan */}
      <circle cx="450" cy="300" r="20" fill="#1e293b" stroke="#22c55e" strokeWidth="2" className="pulse-node" />
      <text x="450" y="296" textAnchor="middle" fill="white" fontSize="16">🇹🇼</text>
      <text x="450" y="308" textAnchor="middle" fill="#94a3b8" fontSize="7">10%</text>
      <text x="510" y="302" textAnchor="start" fill="#cbd5e1" fontSize="10">Taiwan</text>

      {/* Australia */}
      <circle cx="740" cy="265" r="32" fill="#1e293b" stroke="#3b82f6" strokeWidth="3" />
      <text x="740" y="260" textAnchor="middle" fill="white" fontSize="24">🇦🇺</text>
      <text x="740" y="278" textAnchor="middle" fill="#93c5fd" fontSize="8" fontWeight="bold">AUSTRALIA</text>
      <text x="740" y="310" textAnchor="middle" fill="#94a3b8" fontSize="9">2 refineries</text>
      <text x="740" y="322" textAnchor="middle" fill="#94a3b8" fontSize="9">~20% domestic</text>

      {/* Column labels */}
      <text x="100" y="30" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">GLOBAL SOURCE</text>
      <text x="350" y="30" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">REGIONAL REFINING</text>
      <text x="740" y="30" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">AUSTRALIA</text>

      {/* Tanker transit time */}
      <text x="620" y="210" textAnchor="middle" fill="#64748b" fontSize="9" fontStyle="italic">1–3 weeks transit</text>
      <text x="620" y="222" textAnchor="middle" fill="#64748b" fontSize="9" fontStyle="italic">by tanker ship</text>
    </svg>
  );
}

function SupplierCard({ supplier }: { supplier: SuppliersData["suppliers"][0] }) {
  const colors = getStatusColor(supplier.status);
  return (
    <div className={`bg-slate-800/50 rounded-xl border ${colors.border} p-5`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{supplier.flag}</span>
        <div>
          <h4 className="text-white font-semibold">{supplier.country}</h4>
          <p className="text-xs text-slate-500">{supplier.share_pct}% of imports</p>
        </div>
        <span className={`ml-auto w-2.5 h-2.5 rounded-full ${colors.dot}`} />
      </div>
      <p className="text-xs text-slate-400 mb-3">{supplier.role}</p>
      {supplier.gasoline_stocks_ml && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <span className="text-xs text-slate-500">Gasoline stocks</span>
            <p className="text-sm font-mono text-white">{supplier.gasoline_stocks_ml} ML</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Diesel stocks</span>
            <p className="text-sm font-mono text-white">{supplier.diesel_stocks_ml} ML</p>
          </div>
        </div>
      )}
      <div className="mb-2">
        <span className="text-xs text-slate-500">Refinery utilisation</span>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.bg} rounded-full`}
              style={{ width: `${supplier.refinery_utilisation_pct}%` }}
            />
          </div>
          <span className="text-xs font-mono text-slate-300">{supplier.refinery_utilisation_pct}%</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 italic">{supplier.note}</p>
    </div>
  );
}

export default function SupplyChainMap({ suppliers }: SupplyChainMapProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">
          Where does our fuel come from?
        </h2>
        <p className="text-slate-400 max-w-3xl">
          Australia imports ~90% of its refined fuel. Only two refineries remain domestically — Ampol Lytton (QLD)
          and Viva Geelong (VIC) — supplying less than 20% of demand. The rest arrives from Asian refineries,
          taking 1–3 weeks by tanker ship.
        </p>
      </div>

      {/* Animated flow diagram */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-6 mb-8 overflow-x-auto">
        <SupplyFlowSVG />
      </div>

      {/* Supplier cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {suppliers.suppliers.map((s) => (
          <SupplierCard key={s.country} supplier={s} />
        ))}
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
        <p className="text-xs text-slate-600 mt-4">
          JODI data last updated: {suppliers.jodi_last_updated}
        </p>
      </div>

      {/* Connector */}
      <div className="mt-10 text-center">
        <div className="inline-block bg-slate-800/50 rounded-lg px-6 py-3 border border-slate-700/30">
          <p className="text-sm text-slate-400 italic">
            ↓ When crude prices spike or shipping routes are disrupted, it directly affects these refineries — and
            flows through to Australian stocks within weeks. ↓
          </p>
        </div>
      </div>
    </section>
  );
}
