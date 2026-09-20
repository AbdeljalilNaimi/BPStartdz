// Types for parsed Business Plan data
export type Num = number | null;

export interface PnL {
  ca: Num[]; // 6 years FY25..FY30 (N-1 + A01..A05)
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
  // 5 years FY26..FY30 (A01..A05)
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
  terminalGrowth: Num;
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
  passifTotal: Num[];
  check: Num[];
}

export interface SyntheseFin {
  kpiYears: (string | number | null)[];
  ca: Num[];
  ebitda: Num[];
  txEbitda: Num[];
  fcf: Num[];
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
  annees: Num[]; // 5 operating years
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
  primePanierTransport: Num;
  salaireChargeAnnuel: Num;
  salaireNetMensuel: Num;
  irgMensuel: Num;
  cnasSalariale: Num;
  cnasPatronale: Num;
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
  values: Num[]; // 6 years FY25..FY30
}

export interface ChargesExternes {
  items: ChargeItem[];
  totals: Num[]; // 6 years
}

export interface AchatsDirects {
  items: ChargeItem[];
  totals: Num[];
}

export interface BfrDetail {
  caDso: Num[]; // 5 years FY26..FY30
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
  monthly: Num[]; // 12 months Année 01 (2026)
  yearly: Num[]; // FY25..FY30 (6) — index 0 = N-1
}

export interface Hypotheses {
  anneeDebut: Num;
  tauxChange: Num[];
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
  fiscalYears: string[]; // ["FY25", "FY26", ..., "FY30"]
  pnl: PnL | null;
  tft: TFT | null;
  actifBfr: ActifBfr | null;
  bilan: Bilan | null;
  synthese: SyntheseFin | null;
  investissement: Investissement | null;
  ca: Product[] | null;
  masseSalariale: MasseSalariale | null;
  chargesExternes: ChargesExternes | null;
  achatsDirects: AchatsDirects | null;
  bfr: BfrDetail | null;
  hypotheses: Hypotheses | null;
  warnings: string[];
}

/** Année 01 (N) of the official ASF horizon. */
export const DEFAULT_START_YEAR = 2026;
/** Historique N-1. */
export const N_MINUS_1_YEAR = 2025;

export function fyLabels(startYear: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `FY${String((startYear + i) % 100).padStart(2, '0')}`);
}

/** Six-year canevas labels: N-1 then A01..A05 (FY25..FY30 when start is 2026). */
export function fyHorizonLabels(startYear: number = DEFAULT_START_YEAR): string[] {
  return fyLabels(startYear - 1, 6);
}

/** Operating years A01..A05 (FY26..FY30). */
export function fyOperatingLabels(startYear: number = DEFAULT_START_YEAR): string[] {
  return fyLabels(startYear, 5);
}

export function operatingYears(fiscalYears: string[]): string[] {
  return fiscalYears.slice(1, 6);
}

/** Default labels used when no explicit start year is available (FY25..FY30). */
export const FY_LABELS_6 = fyHorizonLabels(DEFAULT_START_YEAR);
/** Default 5-year operating labels (FY26..FY30). */
export const FY_LABELS_5 = fyOperatingLabels(DEFAULT_START_YEAR);
