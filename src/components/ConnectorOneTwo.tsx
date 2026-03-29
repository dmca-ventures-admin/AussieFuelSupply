"use client";

import { useEffect, useState } from "react";
import type { RefineryHistory } from "@/lib/types";
import { Connector } from "@/components/ui";

export default function ConnectorOneTwo({ refineryHistory }: { refineryHistory: RefineryHistory }) {
  const [count, setCount] = useState(refineryHistory.peak_count);

  useEffect(() => {
    // Animate from 8 down to 2
    if (count <= refineryHistory.current_count) return;
    const timeout = setTimeout(() => setCount((c) => c - 1), 600);
    return () => clearTimeout(timeout);
  }, [count, refineryHistory.current_count]);

  return (
    <Connector>
      <p className="text-slate-300 text-sm leading-relaxed mb-4">
        Australia imports roughly <strong className="text-white">90% of its refined petrol and diesel</strong>.
        We didn&apos;t run out of crude — we never had much. We ran out of refineries.
      </p>

      {/* Animated counter */}
      <div className="flex items-center justify-center gap-4 my-4">
        <div className="text-center">
          <div className="text-4xl font-bold font-mono text-slate-500">{refineryHistory.peak_count}</div>
          <div className="text-xs text-slate-600 mt-1">refineries (2000)</div>
        </div>
        <div className="text-2xl text-amber-400">→</div>
        <div className="text-center">
          <div className={`text-4xl font-bold font-mono transition-all duration-500 ${count <= refineryHistory.current_count ? "text-red-400" : "text-amber-400"}`}>
            {count}
          </div>
          <div className="text-xs text-slate-600 mt-1">refineries (2026)</div>
        </div>
      </div>

      {/* Closure timeline */}
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        {refineryHistory.closures.map((c) => (
          <span key={c.name} className="text-[10px] text-slate-600 bg-slate-800/80 px-2 py-1 rounded">
            {c.name}, {c.location.split(",")[1]?.trim()} — closed {c.closed}
          </span>
        ))}
      </div>

      <p className="text-slate-400 text-sm mt-4">
        The rest was cheaper to import from massive refineries in South Korea, Singapore, and Malaysia.
        That worked fine — <strong className="text-amber-400">until their crude supply got disrupted</strong>.
      </p>
    </Connector>
  );
}
