"use client";

import { useEffect, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import Layer1HereAndNow from "@/components/Layer1HereAndNow";
import ConnectorOneTwo from "@/components/ConnectorOneTwo";
import Layer2SupplyChain from "@/components/Layer2SupplyChain";
import ConnectorTwoThree from "@/components/ConnectorTwoThree";
import Layer3Global from "@/components/Layer3Global";
import Layer4Understanding from "@/components/Layer4Understanding";
import Footer from "@/components/Footer";
import type {
  Snapshot,
  StocksHistory,
  OilPrices,
  RetailPrices,
  SuppliersData,
  OutagesData,
  ImportSourcesData,
  ShippingData,
  TimelineData,
  PriceDecompositionData,
  RefineryHistory,
  GlobalStatusData,
} from "@/lib/types";

interface DashboardData {
  snapshot: Snapshot;
  stocksHistory: StocksHistory;
  oilPrices: OilPrices;
  retailPrices: RetailPrices;
  suppliers: SuppliersData;
  outages: OutagesData;
  importSources: ImportSourcesData;
  shipping: ShippingData;
  timeline: TimelineData;
  priceDecomposition: PriceDecompositionData;
  refineryHistory: RefineryHistory;
  globalStatus: GlobalStatusData;
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [liveBrentPrice, setLiveBrentPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const files = [
          "snapshot.json",
          "stocks-history.json",
          "oil-prices.json",
          "retail-prices.json",
          "suppliers.json",
          "outages.json",
          "import-sources.json",
          "shipping.json",
          "timeline.json",
          "price-decomposition.json",
          "refinery-history.json",
          "global-status.json",
        ];
        const responses = await Promise.all(files.map((f) => fetch(`/data/${f}`)));
        const [
          snapshot,
          stocksHistory,
          oilPrices,
          retailPrices,
          suppliers,
          outages,
          importSources,
          shipping,
          timeline,
          priceDecomposition,
          refineryHistory,
          globalStatus,
        ] = await Promise.all(responses.map((r) => r.json()));

        setData({
          snapshot,
          stocksHistory,
          oilPrices,
          retailPrices,
          suppliers,
          outages,
          importSources,
          shipping,
          timeline,
          priceDecomposition,
          refineryHistory,
          globalStatus,
        });
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchLivePrice() {
      try {
        const res = await fetch("/api/oil-price");
        const d = await res.json();
        if (d.price) setLiveBrentPrice(d.price);
      } catch (error) {
        console.error("Failed to fetch live oil price:", error);
      }
    }
    fetchLivePrice();
    const interval = setInterval(fetchLivePrice, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse [animation-delay:150ms]" />
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse [animation-delay:300ms]" />
          </div>
          <p className="mt-4 text-sm text-slate-500">Loading fuel supply data…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold">Failed to load data</p>
          <p className="text-sm text-slate-500 mt-2">Please check the data files and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <HeroBanner snapshot={data.snapshot} liveBrentPrice={liveBrentPrice} outages={data.outages} />

      <div className="border-t border-slate-800/50">
        <Layer1HereAndNow
          snapshot={data.snapshot}
          stocksHistory={data.stocksHistory}
          retailPrices={data.retailPrices}
          outages={data.outages}
          priceDecomposition={data.priceDecomposition}
        />
      </div>

      <ConnectorOneTwo refineryHistory={data.refineryHistory} />

      <div className="border-t border-slate-800/50 bg-slate-900/30">
        <Layer2SupplyChain
          snapshot={data.snapshot}
          suppliers={data.suppliers}
          importSources={data.importSources}
          shipping={data.shipping}
        />
      </div>

      <ConnectorTwoThree />

      <div className="border-t border-slate-800/50">
        <Layer3Global
          snapshot={data.snapshot}
          oilPrices={data.oilPrices}
          liveBrentPrice={liveBrentPrice}
          timeline={data.timeline}
          globalStatus={data.globalStatus}
        />
      </div>

      <div className="border-t border-slate-800/50 bg-slate-900/30">
        <Layer4Understanding
          snapshot={data.snapshot}
          priceDecomposition={data.priceDecomposition}
          retailPrices={data.retailPrices}
          refineryHistory={data.refineryHistory}
          globalStatus={data.globalStatus}
        />
      </div>

      <Footer />
    </main>
  );
}
