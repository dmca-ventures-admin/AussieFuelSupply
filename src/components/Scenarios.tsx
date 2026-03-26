"use client";

export default function Scenarios() {
  const scenarios = [
    {
      title: "Hormuz reopens within 2 weeks",
      likelihood: "Possible",
      color: "emerald",
      impact: [
        "Crude oil prices begin normalising within days",
        "Asian refinery output returns to full capacity in 2–3 weeks",
        "Australian retail prices normalise in 4–6 weeks",
        "Emergency reserves returned to pre-crisis levels within 3 months",
        "No rationing required",
      ],
    },
    {
      title: "Disruption continues 1–3 months",
      likelihood: "Most likely",
      color: "amber",
      impact: [
        "Continued drawdown of emergency reserves",
        "Further IEA coordinated releases",
        "Brent crude sustained above $90–100/bbl",
        "Retail prices remain elevated ($2.40–$2.80/L)",
        "Regional fuel rationing becomes possible",
        "Government may activate additional emergency powers",
      ],
    },
    {
      title: "Prolonged disruption (3+ months)",
      likelihood: "Worst case",
      color: "red",
      impact: [
        "Emergency reserves approach depletion",
        "Formal fuel rationing likely — priority access for emergency services, freight, agriculture",
        "Severe economic impact — mining, agriculture, freight sectors disrupted",
        "Government emergency powers fully activated under Liquid Fuel Emergency Act",
        "Domestic refineries unable to compensate (only 20% of demand)",
        "Potential for rolling regional blackouts if diesel generators can't be fuelled",
      ],
    },
  ];

  const colorMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
    emerald: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-400",
    },
    amber: {
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      badge: "bg-amber-500/20 text-amber-400",
    },
    red: {
      border: "border-red-500/30",
      bg: "bg-red-500/10",
      text: "text-red-400",
      badge: "bg-red-500/20 text-red-400",
    },
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">
          What happens next?
        </h2>
        <p className="text-slate-400 max-w-3xl">
          The outlook depends on how long the Strait of Hormuz disruption lasts. Here are three
          scenarios — from best case to worst case — and what each means for Australian fuel supply.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => {
          const c = colorMap[scenario.color];
          return (
            <div
              key={scenario.title}
              className={`bg-slate-800/50 rounded-xl border ${c.border} p-6 flex flex-col`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className={`text-lg font-bold ${c.text}`}>{scenario.title}</h3>
              </div>
              <span className={`inline-block self-start text-xs font-medium px-2.5 py-1 rounded-full ${c.badge} mb-4`}>
                {scenario.likelihood}
              </span>
              <ul className="space-y-2.5 flex-1">
                {scenario.impact.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-400">
                    <span className={`${c.text} mt-0.5 flex-shrink-0`}>→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Government links */}
      <div className="mt-8 bg-slate-800/30 rounded-xl border border-slate-700/30 p-6 text-center">
        <p className="text-sm text-slate-400 mb-3">
          For the latest official updates:
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://www.dcceew.gov.au/energy/security"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20 transition"
          >
            DCCEEW Fuel Security →
          </a>
          <a
            href="https://www.dcceew.gov.au/energy/security/australias-fuel-security/minimum-stockholding-obligation/statistics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20 transition"
          >
            MSO Statistics →
          </a>
          <a
            href="https://www.iea.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20 transition"
          >
            IEA Emergency Response →
          </a>
        </div>
      </div>
    </section>
  );
}
