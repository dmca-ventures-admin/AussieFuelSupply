"use client";

import { useState } from "react";

/** Consistent data metadata display — source, refresh, "as of" */
export function DataMeta({
  source,
  asOf,
  refresh,
}: {
  source: string;
  asOf?: string;
  refresh?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-600 mt-1.5 leading-tight">
      <span>Source: {source}</span>
      {refresh && (
        <>
          <span className="text-slate-700">·</span>
          <span>Updates: {refresh}</span>
        </>
      )}
      {asOf && (
        <>
          <span className="text-slate-700">·</span>
          <span>Data as of {asOf}</span>
        </>
      )}
    </div>
  );
}

/** Expandable "ℹ️ Learn more" explainer panel */
export function Explainer({
  trigger,
  children,
}: {
  trigger?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
      >
        <span>{open ? "▾" : "▸"}</span>
        <span>ℹ️ {trigger || "Learn more"}</span>
      </button>
      {open && (
        <div className="mt-2 p-4 bg-slate-800/60 rounded-lg border border-slate-700/40 text-sm text-slate-400 leading-relaxed space-y-2 animate-in">
          {children}
        </div>
      )}
    </div>
  );
}

/** Section heading badge */
export function SectionHeading({
  layer,
  title,
  subtitle,
}: {
  layer: number;
  title: string;
  subtitle: string;
}) {
  const sectionLabels = ["", "RIGHT NOW", "OUR SUPPLY CHAIN", "THE GLOBAL PICTURE", "UNDERSTANDING THE CRISIS"];
  return (
    <div className="mb-10">
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/40 mb-3">
        <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
          {sectionLabels[layer]}
        </span>
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>
      <p className="text-slate-400 max-w-3xl">{subtitle}</p>
    </div>
  );
}

/** Connector block between layers */
export function Connector({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="relative">
        <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-700/0 via-amber-500/30 to-slate-700/0" />
        <div className="relative bg-slate-800/60 backdrop-blur-sm rounded-xl border border-amber-500/20 px-6 py-6 text-center">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Severity colour badge for outage percentages */
export function SeverityBadge({ pct }: { pct: number }) {
  const color =
    pct >= 10
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : pct >= 5
        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {pct.toFixed(1)}%
    </span>
  );
}
