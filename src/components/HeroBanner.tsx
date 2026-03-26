"use client";

import { Snapshot } from "@/lib/types";
import { getStatusColor, getDaysSupplyStatus, getHormuzColor, getHormuzStatusLabel, formatCentsPerLitre } from "@/lib/utils";

interface HeroBannerProps {
  snapshot: Snapshot;
  liveBrentPrice?: number | null;
}

function StatusDot({ status }: { status: string }) {
  const colors = getStatusColor(status);
  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.bg} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${colors.dot}`} />
    </span>
  );
}

function MetricCard({
  label,
  value,
  unit,
  status,
  subtext,
}: {
  label: string;
  value: string | number;
  unit: string;
  status: "green" | "amber" | "red";
  subtext?: string;
}) {
  const colors = getStatusColor(status);
  return (
    <div className={`rounded-xl border ${colors.border} bg-slate-800/50 backdrop-blur-sm p-5 flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <StatusDot status={status} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold font-mono ${colors.text}`}>{value}</span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>
      {subtext && <span className="text-xs text-slate-500">{subtext}</span>}
    </div>
  );
}

export default function HeroBanner({ snapshot, liveBrentPrice }: HeroBannerProps) {
  const brentPrice = liveBrentPrice ?? snapshot.global.brent_crude_usd;
  const petrolStatus = getDaysSupplyStatus(snapshot.domestic.petrol_days_supply);
  const dieselStatus = getDaysSupplyStatus(snapshot.domestic.diesel_days_supply);
  const hormuzColor = getHormuzColor(snapshot.global.hormuz_status);

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        {/* Title */}
        <div className="text-center mb-10">
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
            Last updated: {snapshot.snapshot_date} · Data from DCCEEW, ABS, JODI, AIP
          </p>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Petrol Supply"
            value={snapshot.domestic.petrol_days_supply}
            unit="days"
            status={petrolStatus}
            subtext={`${formatCentsPerLitre(snapshot.retail.avg_petrol_price_cpl)} avg price`}
          />
          <MetricCard
            label="Diesel Supply"
            value={snapshot.domestic.diesel_days_supply}
            unit="days"
            status={dieselStatus}
            subtext={`${formatCentsPerLitre(snapshot.retail.avg_diesel_price_cpl)} avg price`}
          />
          <MetricCard
            label="Brent Crude"
            value={`$${brentPrice.toFixed(2)}`}
            unit="USD/bbl"
            status={brentPrice > 90 ? "red" : brentPrice > 75 ? "amber" : "green"}
            subtext={liveBrentPrice ? "Live" : "Seed data"}
          />
          <MetricCard
            label="Strait of Hormuz"
            value={getHormuzStatusLabel(snapshot.global.hormuz_status)}
            unit=""
            status={hormuzColor as "green" | "amber" | "red"}
            subtext="~20% of global seaborne oil"
          />
        </div>
      </div>
    </section>
  );
}
