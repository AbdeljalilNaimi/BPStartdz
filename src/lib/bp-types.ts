// Types for parsed Business Plan data
export type Num = number | null;

export interface PnL {
  ca: Num[]; // 6 years FY23..FY28
  achats: Num[];
  margeBrute: Num[];
  chargesExternes: Num[];
  salaires: Num[];
  ebitda: Num[];
  amortissements: Num[];
  reprises: Num[];
  ebit: Num[];
  chargesFin: Num[];
  resultatAvantImpots: Num[];
  impots: Num[];
  resultatNet: Num[];
  txMargeBrute: Num[];
  txEbitda: Num[];
}

export interface TFT {
  // 5 years FY24..FY28
  ebitda: Num[];
  varBfr: Num[];
  bfrExploitation: Num[];
  bfrTotal: Num[];
  ibs: Num[];
  fluxExploitation: Num[];
  capex: Num[];
  fluxInvestissement: Num[];
  freeCashFlow: Num[];
  chargesFin: Num[];
  fluxFinancement: Num[];
  netCashFlow: Num[];
  soldeInitial: Num[];
  soldeFinal: Num[];
  tauxActualisation: Num[];
  fcfActualises: Num[];
  terminalGrowth: Num; // FY28 only
  valeurTerminale: Num;
  npv: Num;
}

export interface ActifBfr {
  immobilisations: Num[];
  actifImmobilise: Num[];
  clients: Num[];
  stock: Num[];
  actifsCourants: Num[];
  fournisseurs: Num[];
  passifsCourants: Num[];
  bfrNet: Num[];
}

export interface Bilan {
  immobilisations: Num[];
  clients: Num[];
  stock: Num[];
  tresorerie: Num[];
  fournisseurs: Num[];
  actifNet: Num[];
  capitalSocial: Num[];
  resultatExercice: Num[];
  reservesLegales: Num[];
  reportsNouveau: Num[];
  capitauxPropres: Num[];
  check: Num[];
}

export interface SyntheseFin {
  // KPI block FY23..FY27
  kpiYears: (string | number | null)[];
  ca: Num[];
  ebitda: Num[];
  txEbitda: Num[];
  fcf: Num[];
  // Synthèse totals (col 11)
  investissementTotal: Num;
  masseSalarialeTotal: Num;
  achatsDirectsTotal: Num;
  chargesExternesTotal: Num;
  grandTotal: Num;
}

export interface Materiel {
  num: number;
  designation: string | null;
  fonctionnalite: string | null;
  prixUnitaire: Num;
  annees: Num[]; // 5
  total: Num;
}

export interface Investissement {
  materiels: Materiel[];
  totals: Num[]; // 5 years
}

export interface Poste {
  num: number;
  poste: string | null;
  salaireBaseMensuel: Num;
  indemniteMensuelle: Num;
  salaireChargeAnnuel: Num;
  etp: Num[]; // 6 (N-1, A01..A05)
  masseSalariale: Num[]; // 6
}

export interface MasseSalariale {
  postes: Poste[];
  totalEtp: Num[];
  totalMasse: Num[];
}

export interface ChargeItem {
  label: string;
  values: Num[]; // 6 years FY23..FY28
}

export interface ChargesExternes {
  items: ChargeItem[];
  totals: Num[]; // 6 years
}

export interface BfrDetail {
  caDso: Num[]; // 5 years (FY24..FY28)
  dso: Num;
  clientsDzd: Num[];
  consoMatieres: Num[];
  achats: Num[];
  dpo: Num;
  fournisseursDzd: Num[];
  consoStock: Num[];
  dio: Num;
  stocksDzd: Num[];
}

export interface Product {
  name: string;
  designation: string | null;
  monthly: Num[]; // 12 months Année 01
  yearly: Num[]; // FY23..FY28 (6) — index 0 = FY23
}

export interface Hypotheses {
  anneeDebut: Num;
  tauxChange: Num[]; // 6 years FY22..FY27
  inflation: Num[];
  rampUp: Num[];
  evolutionCa: Num[];
  flagEvolutionCa: Num[];
  volumesProduit1: Num[];
  volumesProduit2: Num[];
  volumesProduit3: Num[];
}

export interface ParsedBP {
  fileName: string;
  uploadedAt: Date;
  fiscalYears: string[]; // ["FY23", "FY24", ...]
  pnl: PnL | null;
  tft: TFT | null;
  actifBfr: ActifBfr | null;
  bilan: Bilan | null;
  synthese: SyntheseFin | null;
  investissement: Investissement | null;
  ca: Product[] | null;
  masseSalariale: MasseSalariale | null;
  chargesExternes: ChargesExternes | null;
  bfr: BfrDetail | null;
  hypotheses: Hypotheses | null;
  warnings: string[]; // missing-sheet warnings
}

export const FY_LABELS_6 = ['FY23', 'FY24', 'FY25', 'FY26', 'FY27', 'FY28'];
export const FY_LABELS_5 = ['FY24', 'FY25', 'FY26', 'FY27', 'FY28'];
