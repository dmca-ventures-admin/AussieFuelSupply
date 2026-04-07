// Status colour helpers
export function getStatusColor(status: "green" | "amber" | "red" | string) {
  switch (status) {
    case "green":
      return { bg: "bg-emerald-500", text: "text-emerald-400", dot: "bg-emerald-400", border: "border-emerald-500/30" };
    case "amber":
      return { bg: "bg-amber-500", text: "text-amber-400", dot: "bg-amber-400", border: "border-amber-500/30" };
    case "red":
      return { bg: "bg-red-500", text: "text-red-400", dot: "bg-red-400", border: "border-red-500/30" };
    default:
      return { bg: "bg-slate-500", text: "text-slate-400", dot: "bg-slate-400", border: "border-slate-500/30" };
  }
}

export function getHormuzStatusLabel(status: string) {
  switch (status) {
    case "open":
      return "Open";
    case "restricted":
      return "Restricted";
    case "closed":
      return "Closed";
    default:
      return "Unknown";
  }
}

export function getHormuzColor(status: string) {
  switch (status) {
    case "open":
      return "green";
    case "restricted":
      return "red";
    case "closed":
      return "red";
    default:
      return "amber";
  }
}

export function getDaysSupplyStatus(days: number): "green" | "amber" | "red" {
  if (days >= 50) return "green";
  if (days >= 30) return "amber";
  return "red";
}

export function formatLitres(litres: number): string {
  if (litres >= 1_000_000_000) {
    return `${(litres / 1_000_000_000).toFixed(2)}B L`;
  }
  if (litres >= 1_000_000) {
    return `${(litres / 1_000_000).toFixed(0)}M L`;
  }
  return `${litres.toLocaleString()} L`;
}

export function getRefineryUtilisationStatus(pct: number): "green" | "amber" | "red" {
  if (pct >= 85) return "green";
  if (pct >= 70) return "amber";
  return "red";
}

export function formatPrice(cpl: number): string {
  return `$${(cpl / 100).toFixed(2)}`;
}

export function formatCentsPerLitre(cpl: number): string {
  return `${cpl.toFixed(1)}¢/L`;
}
