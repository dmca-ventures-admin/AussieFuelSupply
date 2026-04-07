// Types for the AussieFuelSupply dashboard — V2

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
    brent_source: string;
    brent_as_of: string;
    hormuz_status: "open" | "restricted" | "closed";
    hormuz_source: string;
    hormuz_as_of: string;
    iea_release_mbl: number;
    iea_committed_mbl: number;
    iea_source: string;
    iea_as_of: string;
    australia_iea_contribution_litres: number;
    australia_iea_source: string;
  };
  retail: {
    avg_petrol_price_cpl: number;
    avg_diesel_price_cpl: number;
    petrol_price_source: string;
    petrol_price_as_of: string;
    diesel_price_source: string;
    diesel_price_as_of: string;
    demand_spike_pct_some_areas: number;
  };
  upstream_suppliers: {
    note: string;
    top_sources: string[];
    ships_cancelled: number;
    ships_normal_monthly: number;
    ships_cancelled_pct: number;
    ships_source: string;
    ships_as_of: string;
    ships_monthly_breakdown: {
      diesel: number;
      petrol: number;
      jet_fuel: number;
      other: number;
    };
    ships_breakdown_source: string;
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
}

export interface OutagesData {
  as_of: string;
  source: string;
  national: { affected: number; total: number; pct: number };
  by_state: {
    state: string;
    affected: number;
    total: number;
    pct: number;
    estimated_total: boolean;
  }[];
}

export interface ImportSource {
  country: string;
  flag: string;
  share_pct: number;
  products: string[];
}

export interface ImportSourcesData {
  import_share_source: string;
  import_share_as_of: string;
  sources: ImportSource[];
}

export interface ShippingData {
  as_of: string;
  source: string;
  ships_cancelled: number;
  ships_normal_monthly: number;
  ships_cancelled_pct: number;
  ships_replaced_note: string;
  monthly_breakdown: {
    diesel: number;
    petrol: number;
    jet_fuel: number;
    other: number;
  };
  breakdown_source: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  source: string;
}

export interface TimelineData {
  events: TimelineEvent[];
}

export interface PriceComponent {
  label: string;
  cpl: number;
  color: string;
}

export interface PriceDecompositionData {
  as_of: string;
  source: string;
  total_cpl: number;
  components: PriceComponent[];
  tax_share_pct: number;
  notes: {
    excise_rate: string;
    gst_rate: string;
    benchmark: string;
    lag: string;
    rockets_and_feathers: string;
  };
}

export interface RefineryHistory {
  peak_count: number;
  current_count: number;
  closures: {
    name: string;
    location: string;
    closed: number;
    operator: string;
  }[];
  remaining: {
    name: string;
    location: string;
    capacity_bpd: number;
  }[];
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

export interface DemandWeek {
  week: string;
  demand_ml: number;
}

export interface DemandData {
  note: string;
  petrol_weekly_ml: DemandWeek[];
  diesel_weekly_ml: DemandWeek[];
  source: string;
  as_of: string;
}

export interface GlobalStatusData {
  hormuz: {
    status: string;
    summary: string;
    source: string;
    as_of: string;
  };
  iea_release: {
    requested_mbl: number;
    committed_mbl: number;
    member_nations: number;
    source: string;
    as_of: string;
  };
  australia_contribution: {
    litres: number;
    barrels_approx: number;
    source: string;
    as_of: string;
  };
}
