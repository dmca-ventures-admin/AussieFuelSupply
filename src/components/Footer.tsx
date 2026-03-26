"use client";

export default function Footer() {
  const dataSources = [
    {
      name: "DCCEEW MSO Statistics",
      url: "https://www.dcceew.gov.au/energy/security/australias-fuel-security/minimum-stockholding-obligation/statistics",
      frequency: "Weekly (Fridays)",
      description: "Petrol & diesel days of supply, litres held, % above MSO",
    },
    {
      name: "Australian Petroleum Statistics",
      url: "https://data.gov.au/dataset/ds-dga-d889484e-fb65-4190-a2e3-1739517cbf9b",
      frequency: "Monthly",
      description: "Historical stock levels, imports by origin, refinery throughput",
    },
    {
      name: "JODI Oil Database",
      url: "https://www.jodidata.org/oil/database/data-downloads.aspx",
      frequency: "Monthly",
      description: "South Korea & Singapore refinery stocks, utilisation rates",
    },
    {
      name: "NSW FuelCheck API",
      url: "https://api.nsw.gov.au",
      frequency: "Daily",
      description: "Live retail fuel prices for 2,500+ NSW stations",
    },
    {
      name: "WA FuelWatch",
      url: "https://www.fuelwatch.wa.gov.au",
      frequency: "Daily",
      description: "Next-day fuel prices for all WA stations",
    },
    {
      name: "Oil Price API",
      url: "https://www.oilpriceapi.com",
      frequency: "Near real-time",
      description: "Brent crude oil price (USD/bbl)",
    },
    {
      name: "Australian Institute of Petroleum",
      url: "https://www.aip.com.au",
      frequency: "Weekly",
      description: "National average retail fuel prices",
    },
    {
      name: "IEA",
      url: "https://www.iea.org",
      frequency: "Event-driven",
      description: "Emergency stockpile release coordination",
    },
  ];

  return (
    <footer className="border-t border-slate-800 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Data sources */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-white mb-6">Data Sources</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataSources.map((source) => (
              <div key={source.name} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition"
                >
                  {source.name} ↗
                </a>
                <p className="text-xs text-slate-500 mt-1">{source.description}</p>
                <span className="text-xs text-slate-600 mt-2 inline-block">
                  Updated: {source.frequency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology */}
        <div className="mb-10 bg-slate-800/20 rounded-lg p-6 border border-slate-700/20">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Methodology & Limitations
          </h3>
          <div className="text-xs text-slate-500 space-y-2 leading-relaxed">
            <p>
              <strong className="text-slate-400">Days of supply</strong> is calculated by dividing current
              stockholdings by average daily consumption. This figure includes fuel held in terminals, depots,
              and tankers within Australia&apos;s Exclusive Economic Zone (EEZ).
            </p>
            <p>
              <strong className="text-slate-400">Data lag:</strong> MSO data is published weekly (Fridays).
              JODI international data has a ~20-day lag. Australian Petroleum Statistics has a ~6-week lag.
              Oil prices are near real-time. Retail fuel prices are updated daily.
            </p>
            <p>
              <strong className="text-slate-400">Station outages</strong> are compiled from government
              reports and crowd-sourced data. These may not capture all outages, particularly in remote areas.
            </p>
            <p>
              For a detailed explanation of different stock measures (MSO days, IEA days, consumption cover days),
              see the{" "}
              <a
                href="https://www.dcceew.gov.au/energy/security/australias-fuel-security/measures-of-liquid-fuel-stocks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                DCCEEW Measures of Liquid Fuel Stocks
              </a>{" "}
              explainer.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
          <div className="text-xs text-slate-600">
            Australia Fuel Supply Tracker · Built for public awareness · Not financial advice
          </div>
          <div className="text-xs text-slate-600">
            Open source ·{" "}
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-400 transition">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
