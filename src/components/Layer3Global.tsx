"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
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

export default function Layer3Global({ snapshot, oilPrices, liveBrentPrice, timeline, globalStatus }: Layer3Props) {
  const brentSparkData = oilPrices.brent_30d.map((d) => ({
    date: d.date.slice(5),
    price: d.price,
  }));

  if (liveBrentPrice) {
    const today = new Date().toISOString().slice(5, 10);
    brentSparkData.push({ date: today, price: liveBrentPrice });
  }

  const hormuzColors = getStatusColor(snapshot.global.hormuz_status === "open" ? "green" : "red");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading
        layer={3}
        title="What's driving the current crisis?"
        subtitle="The Strait of Hormuz handles ~20% of global seaborne oil. When transit is disrupted, crude prices spike and downstream refining is affected — flowing through to Australian fuel supplies within weeks."
      />

      {/* 1. Double Hop SVG — top of section, full width */}
      <div className="mb-8">
        <DoubleHopMap />
      </div>

      {/* 2. Hormuz status */}
      <div className={`bg-slate-800/50 rounded-xl border ${hormuzColors.border} p-6 mb-6`}>
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

      {/* 3. Brent crude — 12-week sparkline */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Brent Crude</h3>
          <span className="text-2xl font-bold font-mono text-red-400">
            ${(liveBrentPrice ?? snapshot.global.brent_crude_usd).toFixed(2)}{" "}
            <span className="text-sm font-normal text-slate-500">USD/bbl</span>
          </span>
        </div>
        <DataMeta source={snapshot.global.brent_source} asOf={snapshot.global.brent_as_of} refresh="Near real-time" />
        <div className="mt-3">
          <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">12-week trend</h4>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={brentSparkData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="brent-grad-l3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#e2e8f0" }}
                formatter={(value) => [`$${Number(value).toFixed(2)} USD/bbl`, "Brent Crude"]}
              />
              <Area type="monotone" dataKey="price" stroke="#ef4444" strokeWidth={2} fill="url(#brent-grad-l3)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. IEA release */}
      <div className="bg-slate-800/50 rounded-xl border border-blue-500/20 p-6 mb-8">
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
