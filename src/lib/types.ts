// Types for the AussieFuelSupply dashboard
export interface Snapshot {
  snapshot_date: string;
  domestic: {
    petrol_days_supply: number;
    petrol_litres_held: number;
    petrol_pct_above_mso: number;
    diesel_days_supply: number;
    diesel_litres_held: number;
    diesel_pct_above_mso: number;
    emergency_release_authorised_litres: number;
    emergency_release_drawn_petrol_days: number;
    emergency_release_drawn_diesel_days: number;
    domestic_refineries: number;
    domestic_refinery_share_pct: number;
    iea_obligation_days: number;
    iea_actual_days: number;
  };
  global: {
    brent_crude_usd: number;
    hormuz_status: "open" | "restricted" | "closed";
    iea_release_mbl: number;
    iea_committed_mbl: number;
  };
  retail: {
    avg_petrol_price_cpl: number;
    avg_diesel_price_cpl: number;
    nsw_stations_no_diesel: number;
    nsw_stations_completely_dry: number;
    demand_spike_pct_some_areas: number;
  };
  upstream_suppliers: {
    note: string;
    top_sources: string[];
    ships_cancelled_april: number;
  };
}

export interface StocksHistory {
  petrol: { week: string; days: number; litres: number }[];
  diesel: { week: string; days: number; litres: number }[];
}

export interface OilPrices {
  brent_30d: { date: string; price: number }[];
  events: { date: string; label: string }[];
}

export interface RetailPrices {
  petrol_30d: { date: string; price: number }[];
  diesel_30d: { date: string; price: number }[];
  outages_by_state: Record<string, { no_diesel: number; completely_dry: number }>;
}

export interface Supplier {
  country: string;
  flag: string;
  share_pct: number;
  role: string;
  gasoline_stocks_ml: number | null;
  diesel_stocks_ml: number | null;
  refinery_utilisation_pct: number;
  status: "green" | "amber" | "red";
  note: string;
}

export interface DomesticRefinery {
  name: string;
  location: string;
  capacity_bpd: number;
  status: string;
  note: string;
}

export interface SuppliersData {
  suppliers: Supplier[];
  jodi_last_updated: string;
  domestic_refineries: DomesticRefinery[];
}
