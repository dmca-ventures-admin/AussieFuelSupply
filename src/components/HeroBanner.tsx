"use client";

import type { Snapshot, OutagesData } from "@/lib/types";
import { getDaysSupplyStatus, getHormuzColor, getHormuzStatusLabel, getStatusColor, formatCentsPerLitre } from "@/lib/utils";

interface HeroBannerProps {
  snapshot: Snapshot;
  liveBrentPrice?: number | null;
  outages: OutagesData;
}

function StatusDot({ status }: { status: "green" | "amber" | "red" }) {
  const colors = getStatusColor(status);
  return (
    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.bg} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colors.dot}`} />
    </span>
  );
}

function StatusItem({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "green" | "amber" | "red";
}) {
  const colors = getStatusColor(status);
  return (
    <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5">
      <StatusDot status={status} />
      <div className="min-w-0">
        <span className="block text-[10px] text-slate-500 uppercase tracking-wider leading-tight">{label}</span>
        <span className={`block text-sm sm:text-base font-bold font-mono leading-tight ${colors.text}`}>{value}</span>
      </div>
    </div>
  );
}

export default function HeroBanner({ snapshot, liveBrentPrice, outages }: HeroBannerProps) {
  const brentPrice = liveBrentPrice ?? snapshot.global.brent_crude_usd;
  const petrolStatus = snapshot.retail.avg_petrol_price_cpl > 230 ? "red" as const : snapshot.retail.avg_petrol_price_cpl > 200 ? "amber" as const : "green" as const;
  const dieselStatus = snapshot.retail.avg_diesel_price_cpl > 250 ? "red" as const : snapshot.retail.avg_diesel_price_cpl > 220 ? "amber" as const : "green" as const;
  const petrolDaysStatus = getDaysSupplyStatus(snapshot.domestic.petrol_days_supply);
  const dieselDaysStatus = getDaysSupplyStatus(snapshot.domestic.diesel_days_supply);
  const brentStatus = brentPrice > 90 ? "red" as const : brentPrice > 75 ? "amber" as const : "green" as const;
  const hormuzColor = getHormuzColor(snapshot.global.hormuz_status) as "green" | "amber" | "red";

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Title */}
        <div className="text-center mb-8">
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
            Data as of {snapshot.snapshot_date} · Sources: DCCEEW, AIP, JODI, NSW FuelCheck, IEA
          </p>
        </div>

        {/* Compact traffic-light status bar */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 divide-y sm:divide-y-0 sm:divide-x divide-slate-700/40">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-slate-700/40">
            <StatusItem
              label="Petrol"
              value={formatCentsPerLitre(snapshot.retail.avg_petrol_price_cpl)}
              status={petrolStatus}
            />
            <StatusItem
              label="Diesel"
              value={formatCentsPerLitre(snapshot.retail.avg_diesel_price_cpl)}
              status={dieselStatus}
            />
            <StatusItem
              label="Petrol Supply"
              value={`${snapshot.domestic.petrol_days_supply}d`}
              status={petrolDaysStatus}
            />
            <StatusItem
              label="Diesel Supply"
              value={`${snapshot.domestic.diesel_days_supply}d`}
              status={dieselDaysStatus}
            />
            <StatusItem
              label="Brent Crude"
              value={`$${brentPrice.toFixed(2)}`}
              status={brentStatus}
            />
            <StatusItem
              label="Hormuz"
              value={getHormuzStatusLabel(snapshot.global.hormuz_status)}
              status={hormuzColor}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
