"use client";

import { Connector } from "@/components/ui";

export default function ConnectorTwoThree() {
  return (
    <Connector>
      <p className="text-slate-300 text-sm leading-relaxed">
        Australia&apos;s Asian suppliers need crude oil to make the petrol and diesel we import.
        About <strong className="text-white">60–70% of their crude</strong> arrives via the Strait of Hormuz —
        the narrow waterway between Iran and the Arabian Peninsula.
      </p>
      <p className="text-slate-400 text-sm leading-relaxed mt-3">
        When the US-Israel strikes on Iran began in late February 2026, Iran restricted passage.
        Roughly <strong className="text-red-400">20% of the world&apos;s seaborne oil</strong> was suddenly at risk.
      </p>
    </Connector>
  );
}
