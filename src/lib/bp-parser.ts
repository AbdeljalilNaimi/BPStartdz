import * as XLSX from 'xlsx';
import type {
  ParsedBP, PnL, TFT, ActifBfr, Bilan, SyntheseFin,
  Investissement, Materiel, MasseSalariale, Poste,
  ChargesExternes, AchatsDirects, ChargeItem, BfrDetail, Product, Hypotheses, Num,
} from './bp-types';
import { FY_LABELS_6 } from './bp-types';

export class BPParseError extends Error {
  constructor(public sheetName: string, message: string) {
    super(message);
    this.name = 'BPParseError';
  }
}

type Grid = (string | number | boolean | null)[][];

function findSheet(wb: XLSX.WorkBook, target: string): string | null {
  const t = target.trim().toLowerCase();
  return Object.keys(wb.Sheets).find(s => s.trim().toLowerCase() === t) ?? null;
}

function toGrid(wb: XLSX.WorkBook, sheetName: string): Grid {
  const ws = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, blankrows: true }) as Grid;
}

function n(v: unknown): Num {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const cleaned = v.replace(/\s/g, '').replace(',', '.');
    const x = Number(cleaned);
    return Number.isFinite(x) ? x : null;
  }
  return null;
}

function s(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  return String(v).trim() || null;
}

function row(g: Grid, r: number): (string | number | boolean | null)[] {
  return g[r] ?? [];
}

function range(g: Grid, r: number, c0: number, c1: number): Num[] {
  const out: Num[] = [];
  const rr = row(g, r);
  for (let c = c0; c <= c1; c++) out.push(n(rr[c]));
  return out;
}

// ---- Parsers per sheet ----

function parsePnL(g: Grid): PnL {
  // cols 2..7 => FY23..FY28
  return {
    ca: range(g, 11, 2, 7),
    achats: range(g, 12, 2, 7),
    margeBrute: range(g, 13, 2, 7),
    chargesExternes: range(g, 14, 2, 7),
    salaires: range(g, 15, 2, 7),
    ebitda: range(g, 16, 2, 7),
    amortissements: range(g, 17, 2, 7),
    reprises: range(g, 18, 2, 7),
    ebit: range(g, 19, 2, 7),
    chargesFin: range(g, 20, 2, 7),
    resultatAvantImpots: range(g, 21, 2, 7),
    impots: range(g, 22, 2, 7),
    resultatNet: range(g, 23, 2, 7),
    txMargeBrute: range(g, 28, 2, 7),
    txEbitda: range(g, 29, 2, 7),
  };
}

function parseTFT(g: Grid): TFT {
  // cols 2..6 => FY24..FY28
  return {
    ebitda: range(g, 11, 2, 6),
    varBfr: range(g, 12, 2, 6),
    bfrExploitation: range(g, 13, 2, 6),
    bfrTotal: range(g, 15, 2, 6),
    ibs: range(g, 16, 2, 6),
    fluxExploitation: range(g, 17, 2, 6),
    capex: range(g, 18, 2, 6),
    fluxInvestissement: range(g, 19, 2, 6),
    freeCashFlow: range(g, 20, 2, 6),
    chargesFin: range(g, 23, 2, 6),
    fluxFinancement: range(g, 25, 2, 6),
    netCashFlow: range(g, 26, 2, 6),
    soldeInitial: range(g, 28, 2, 6),
    soldeFinal: range(g, 29, 2, 6),
    tauxActualisation: range(g, 32, 2, 6),
    fcfActualises: range(g, 33, 2, 6),
    terminalGrowth: n(row(g, 34)[6]),
    valeurTerminale: n(row(g, 35)[6]),
    npv: n(row(g, 36)[6]),
  };
}

function parseActifBfr(g: Grid): ActifBfr {
  return {
    immobilisations: range(g, 11, 2, 6),
    actifImmobilise: range(g, 12, 2, 6),
    clients: range(g, 14, 2, 6),
    stock: range(g, 15, 2, 6),
    actifsCourants: range(g, 16, 2, 6),
    fournisseurs: range(g, 17, 2, 6),
    passifsCourants: range(g, 19, 2, 6),
    bfrNet: range(g, 20, 2, 6),
  };
}

function parseBilan(g: Grid): Bilan {
  // headers row 3, cols 2..6 = FY24..FY28
  return {
    immobilisations: range(g, 5, 2, 6),
    clients: range(g, 6, 2, 6),
    stock: range(g, 7, 2, 6),
    tresorerie: range(g, 10, 2, 6),
    fournisseurs: range(g, 12, 2, 6),
    actifNet: range(g, 13, 2, 6),
    capitalSocial: range(g, 15, 2, 6),
    resultatExercice: range(g, 16, 2, 6),
    reservesLegales: range(g, 17, 2, 6),
    reportsNouveau: range(g, 18, 2, 6),
    capitauxPropres: range(g, 19, 2, 6),
    check: range(g, 22, 2, 6),
  };
}

function parseSynthese(g: Grid): SyntheseFin {
  // KPI block rows 60..64, cols 4..8 = FY23..FY27
  const kpiYears = (row(g, 60).slice(4, 9) as (string | number | null)[]);
  return {
    kpiYears,
    ca: range(g, 61, 4, 8),
    ebitda: range(g, 62, 4, 8),
    txEbitda: range(g, 63, 4, 8),
    fcf: range(g, 64, 4, 8),
    investissementTotal: n(row(g, 48)[11]),
    masseSalarialeTotal: n(row(g, 49)[11]),
    achatsDirectsTotal: n(row(g, 50)[11]),
    chargesExternesTotal: n(row(g, 51)[11]),
    grandTotal: n(row(g, 52)[11]),
  };
}

function parseInvestissement(g: Grid): Investissement {
  const materiels: Materiel[] = [];
  for (let i = 0; i < 30; i++) {
    const r = 7 + i;
    const rr = row(g, r);
    const annees = range(g, r, 5, 9);
    const prix = n(rr[4]);
    const total = annees.reduce((acc: number, v) => acc + (typeof v === 'number' ? v : 0), 0);
    materiels.push({
      num: i + 1,
      designation: s(rr[2]),
      fonctionnalite: s(rr[3]),
      prixUnitaire: prix,
      annees,
      total: total > 0 ? total : null,
    });
  }
  const totals = range(g, 37, 5, 9);
  return { materiels, totals };
}

function parseMasseSalariale(g: Grid): MasseSalariale {
  const postes: Poste[] = [];
  for (let i = 0; i < 27; i++) {
    const r = 7 + i;
    const rr = row(g, r);
    postes.push({
      num: i + 1,
      poste: s(rr[0]),
      salaireBaseMensuel: n(rr[2]),
      indemniteMensuelle: n(rr[3]),
      salaireChargeAnnuel: n(rr[10]),
      etp: range(g, r, 11, 16),
      masseSalariale: range(g, r, 17, 22),
    });
  }
  const totalEtp = range(g, 34, 11, 16);
  const totalMasse = range(g, 34, 17, 22);
  return { postes, totalEtp, totalMasse };
}

function parseChargesExternes(g: Grid): ChargesExternes {
  const labels = [
    'Sous-traitance', 'Loyers', 'Energie/eau/gaz', 'Frais Marketing',
    "Honoraires d'avocat", 'Honoraires du Notaire', "Honoraires d'expert-comptable",
    'Honoraires Commissaire aux Comptes', 'Frais du transit', 'Frais télécom',
    'Divers fournitures', 'Frais de formation', 'R&D', 'Autre 1',
  ];
  const items = labels.map((label, i) => {
    const r = 13 + i;
    return { label, values: range(g, r, 2, 7) };
  });
  const totals = range(g, 27, 2, 7);
  return { items, totals };
}

function parseAchatsDirects(g: Grid): AchatsDirects {
  // Same product-block layout as A.2, but starting at row 6 (no top "Chiffre d'affaires" header).
  // Block step = 9 rows. Sous-Total at base+6. Cols: 5..16 mois, 17 = N-1/FY23, 18..22 = FY24..FY28.
  const products = parseProductBlocks(g, 6, 9);
  const items: ChargeItem[] = products.map(p => ({ label: p.name, values: p.yearly }));
  // Try to detect a TOTAL row after the last block
  let totals: Num[] = [null, null, null, null, null, null];
  for (let r = 6 + products.length * 9; r < Math.min(g.length, 6 + 30 * 9 + 5); r++) {
    const rr = row(g, r);
    if (typeof rr[1] === 'string' && /total/i.test(rr[1])) {
      totals = [n(rr[17]), ...range(g, r, 18, 22)];
      break;
    }
  }
  return { items, totals };
}

function parseProductBlocks(g: Grid, startRow: number, step: number): Product[] {
  const products: Product[] = [];
  for (let i = 0; i < 30; i++) {
    const baseRow = startRow + i * step;
    if (baseRow >= g.length) break;
    const headerRow = row(g, baseRow);
    const name = s(headerRow[0]); // col 0 = name
    if (!name || /^total/i.test(name)) continue;
    const designation = s(headerRow[2]); // col 2 = designation value
    const subTotalRow = baseRow + 6;
    const monthly = range(g, subTotalRow, 5, 16); // Mois01..Mois12
    const yearly: Num[] = [n(row(g, subTotalRow)[17])]; // FY23 col 17
    yearly.push(...range(g, subTotalRow, 18, 22)); // FY24..FY28
    products.push({ name, designation, monthly, yearly });
  }
  return products;
}

function parseBfr(g: Grid): BfrDetail {
  return {
    caDso: range(g, 10, 4, 8),
    dso: n(row(g, 11)[2]),
    clientsDzd: range(g, 13, 4, 8),
    consoMatieres: range(g, 18, 4, 8),
    achats: range(g, 19, 4, 8),
    dpo: n(row(g, 20)[2]),
    fournisseursDzd: range(g, 22, 4, 8),
    consoStock: range(g, 27, 4, 8),
    dio: n(row(g, 28)[2]),
    stocksDzd: range(g, 30, 4, 8),
  };
}

function parseCa(g: Grid): Product[] {
  // Products start at row 12, repeat every 9 rows. Sous-Total at +6.
  // Cols: 0=name, 5..16=Mois01..12, 17=FY23 (N-1), 18..22=FY24..FY28.
  return parseProductBlocks(g, 12, 9);
}

function parseHypotheses(g: Grid): Hypotheses {
  return {
    anneeDebut: n(row(g, 6)[5]),
    tauxChange: range(g, 7, 5, 10),
    inflation: range(g, 8, 5, 10),
    rampUp: range(g, 9, 5, 10),
    evolutionCa: range(g, 10, 5, 10),
    flagEvolutionCa: range(g, 14, 5, 10),
    volumesProduit1: range(g, 16, 5, 10),
    volumesProduit2: range(g, 17, 5, 10),
    volumesProduit3: range(g, 18, 5, 10),
  };
}

// ---- Main entry ----

export async function parseBPFile(file: File): Promise<ParsedBP> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false });

  const warnings: string[] = [];
  const tryParse = <T>(sheetTarget: string, fn: (g: Grid) => T): T | null => {
    const sheet = findSheet(wb, sheetTarget);
    if (!sheet) {
      warnings.push(sheetTarget);
      return null;
    }
    try {
      return fn(toGrid(wb, sheet));
    } catch (e) {
      warnings.push(`${sheetTarget} (parse error: ${e instanceof Error ? e.message : String(e)})`);
      return null;
    }
  };

  // Required: at least one of P&L must be present
  const pnlSheet = findSheet(wb, 'B.1. P&L');
  if (!pnlSheet) {
    throw new BPParseError('B.1. P&L', 'Feuille B.1. P&L introuvable. Vérifiez que le fichier suit la structure ASF BP Canevas.');
  }

  return {
    fileName: file.name,
    uploadedAt: new Date(),
    fiscalYears: FY_LABELS_6,
    pnl: tryParse('B.1. P&L', parsePnL),
    tft: tryParse('B.2. TFT', parseTFT),
    actifBfr: tryParse('B.3 Actif immo & BFR', parseActifBfr),
    bilan: tryParse('B.4 Bilan', parseBilan),
    synthese: tryParse('C. Synthèse Financement', parseSynthese),
    investissement: tryParse('A.1. Investissement', parseInvestissement),
    ca: tryParse("A.2. Chiffre d'Affaires", parseCa),
    masseSalariale: tryParse('A.4. Masse Salariale', parseMasseSalariale),
    chargesExternes: tryParse('A.5. Charges  externes', parseChargesExternes),
    achatsDirects: tryParse('A.3. Achats directs', parseAchatsDirects),
    bfr: tryParse('A.6. BFR', parseBfr),
    hypotheses: tryParse('Hypothèses de base', parseHypotheses),
    warnings,
  };
}
