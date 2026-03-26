"use client";

import { useEffect, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import DomesticStocks from "@/components/DomesticStocks";
import SupplyChainMap from "@/components/SupplyChainMap";
import GlobalDrivers from "@/components/GlobalDrivers";
import RetailImpact from "@/components/RetailImpact";
import Scenarios from "@/components/Scenarios";
import Footer from "@/components/Footer";
import type { Snapshot, StocksHistory, OilPrices, RetailPrices, SuppliersData } from "@/lib/types";

export default function Home() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [stocksHistory, setStocksHistory] = useState<StocksHistory | null>(null);
  const [oilPrices, setOilPrices] = useState<OilPrices | null>(null);
  const [retailPrices, setRetailPrices] = useState<RetailPrices | null>(null);
  const [suppliers, setSuppliers] = useState<SuppliersData | null>(null);
  const [liveBrentPrice, setLiveBrentPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all static data in parallel
        const [snapshotRes, stocksRes, oilRes, retailRes, suppliersRes] = await Promise.all([
          fetch("/data/snapshot.json"),
          fetch("/data/stocks-history.json"),
          fetch("/data/oil-prices.json"),
          fetch("/data/retail-prices.json"),
          fetch("/data/suppliers.json"),
        ]);

        const [snapshotData, stocksData, oilData, retailData, suppliersData] = await Promise.all([
          snapshotRes.json(),
          stocksRes.json(),
          oilRes.json(),
          retailRes.json(),
          suppliersRes.json(),
        ]);

        setSnapshot(snapshotData);
        setStocksHistory(stocksData);
        setOilPrices(oilData);
        setRetailPrices(retailData);
        setSuppliers(suppliersData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Fetch live oil price from our API route
  useEffect(() => {
    async function fetchLivePrice() {
      try {
        const res = await fetch("/api/oil-price");
        const data = await res.json();
        if (data.price) {
          setLiveBrentPrice(data.price);
        }
      } catch (error) {
        console.error("Failed to fetch live oil price:", error);
      }
    }

    fetchLivePrice();
    // Refresh every 15 minutes
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

  if (!snapshot || !stocksHistory || !oilPrices || !retailPrices || !suppliers) {
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
      <HeroBanner snapshot={snapshot} liveBrentPrice={liveBrentPrice} />

      <div className="border-t border-slate-800/50">
        <DomesticStocks snapshot={snapshot} history={stocksHistory} />
      </div>

      <div className="border-t border-slate-800/50 bg-slate-900/30">
        <SupplyChainMap suppliers={suppliers} />
      </div>

      <div className="border-t border-slate-800/50">
        <GlobalDrivers snapshot={snapshot} oilPrices={oilPrices} liveBrentPrice={liveBrentPrice} />
      </div>

      <div className="border-t border-slate-800/50 bg-slate-900/30">
        <RetailImpact snapshot={snapshot} retailPrices={retailPrices} />
      </div>

      <div className="border-t border-slate-800/50">
        <Scenarios />
      </div>

      <Footer />
    </main>
  );
}
