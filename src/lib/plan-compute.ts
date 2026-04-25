import type { PlanInputs } from './plan-types';
import type { ParsedBP, Num, Product } from './bp-types';
import { fyLabels } from './bp-types';

const sum = (arr: number[]) => arr.reduce((a, v) => a + v, 0);
const safeArr = (n: number, val = 0) => Array.from({ length: n }, () => val);

/**
 * Compute a full ParsedBP-shaped object from guided plan inputs.
 * Year axis: 6 years starting at hypotheses.anneeDebut (Année 0 = before-launch reference,
 * Années 1..5 = operating years). For tabs that show 5 years (TFT, BFR, Bilan), we use indices 1..5.
 */
export function computeBP(plan: PlanInputs): ParsedBP {
  const h = plan.hypotheses;
  const startYear = h.anneeDebut || 2026;
  const fy6 = fyLabels(startYear, 6); // FY26..FY31
  // Number of operating years
  const N = 5;

  // ---- Revenue (CA) per year (5 years) ----
  // Année 1 monthly volumes are flat across 12 months (simple model)
  const products: Product[] = plan.produits.map((p) => {
    const annee1Monthly = Array.from({ length: 12 }, () => p.volumeMensuelAnnee1 * p.prixUnitaire);
    const yearlyOps: number[] = [];
    let prev = sum(annee1Monthly);
    yearlyOps.push(prev);
    for (let y = 0; y < 4; y++) {
      prev = prev * (1 + (p.croissance[y] || 0));
      yearlyOps.push(prev);
    }
    return {
      name: p.nom,
      designation: null,
      monthly: annee1Monthly as Num[],
      // index 0 = Année 0 (reference / pre-launch) → null; indices 1..5 = operations
      yearly: [null, ...yearlyOps] as Num[],
    };
  });

  // CA totals per year (6-year array; index 0 = null)
  const ca6: Num[] = Array.from({ length: 6 }, (_, i) => {
    if (i === 0) return null;
    const total = products.reduce((acc, p) => acc + ((p.yearly[i] as number) ?? 0), 0);
    return total;
  });
  const ca5 = ca6.slice(1).map((v) => (v as number) ?? 0);

  // ---- Achats directs (5 years, applied via product cost ratios) ----
  const achatsByProductYear = plan.produits.map((p) => {
    return Array.from({ length: 5 }, (_, yi) => {
      const ca = (products.find((pp) => pp.name === p.nom)?.yearly[yi + 1] as number) ?? 0;
      return ca * p.coutDirectRatio;
    });
  });
  const achats5 = Array.from({ length: 5 }, (_, yi) => achatsByProductYear.reduce((a, arr) => a + arr[yi], 0));
  const achats6: Num[] = [null, ...achats5];

  // ---- Masse salariale ----
  const massePerPosteYear = plan.postes.map((p) => {
    const salaireChargeMensuel = (p.salaireBaseMensuel + p.indemniteMensuelle) * (1 + p.chargesSocialesRatio);
    const salaireChargeAnnuel = salaireChargeMensuel * 12;
    return {
      poste: p,
      salaireChargeAnnuel,
      etp: p.etp,
      masseAnnuelle: p.etp.map((etp) => etp * salaireChargeAnnuel),
    };
  });
  const salaires5 = Array.from({ length: 5 }, (_, yi) => massePerPosteYear.reduce((a, m) => a + m.masseAnnuelle[yi], 0));
  const salaires6: Num[] = [null, ...salaires5];

  // ---- Charges externes (5 years) ----
  const chargesByItemYear = plan.chargesExternes.map((c) => {
    return Array.from({ length: 5 }, (_, yi) => c.montantAnnuelAnnee1 * Math.pow(1 + c.croissanceAnnuelle, yi));
  });
  const chargesExt5 = Array.from({ length: 5 }, (_, yi) => chargesByItemYear.reduce((a, arr) => a + arr[yi], 0));
  const chargesExt6: Num[] = [null, ...chargesExt5];

  // ---- CAPEX per year ----
  const capex5 = Array.from({ length: 5 }, (_, yi) =>
    plan.investissements.reduce((a, inv) => a + inv.prixUnitaire * (inv.quantites[yi] || 0), 0)
  );
  // Cumulative gross immobilisations
  const cumCapex = capex5.reduce<number[]>((acc, v, i) => {
    acc.push((i === 0 ? 0 : acc[i - 1]) + v);
    return acc;
  }, []);

  // Linear amortization on each year's capex over h.dureeAmortissement years (starting same year)
  const dur = Math.max(1, h.dureeAmortissement);
  const amort5 = Array.from({ length: 5 }, () => 0);
  capex5.forEach((c, ci) => {
    const yearly = c / dur;
    for (let y = ci; y < Math.min(5, ci + dur); y++) amort5[y] += yearly;
  });
  const amort6: Num[] = [null, ...amort5];
  const cumAmort = amort5.reduce<number[]>((acc, v, i) => {
    acc.push((i === 0 ? 0 : acc[i - 1]) + v);
    return acc;
  }, []);
  const immoNettes5 = cumCapex.map((c, i) => c - cumAmort[i]);

  // ---- P&L ----
  const margeBrute6: Num[] = ca6.map((c, i) => (i === 0 ? null : ((c as number) ?? 0) - ((achats6[i] as number) ?? 0)));
  const ebitda6: Num[] = margeBrute6.map((m, i) =>
    i === 0 ? null : ((m as number) ?? 0) - ((chargesExt6[i] as number) ?? 0) - ((salaires6[i] as number) ?? 0)
  );
  const reprises6: Num[] = [null, 0, 0, 0, 0, 0];
  const ebit6: Num[] = ebitda6.map((e, i) => (i === 0 ? null : ((e as number) ?? 0) - ((amort6[i] as number) ?? 0)));
  const chargesFin6: Num[] = [null, 0, 0, 0, 0, 0];
  const rai6: Num[] = ebit6.map((e, i) => (i === 0 ? null : ((e as number) ?? 0) - ((chargesFin6[i] as number) ?? 0)));
  const impots6: Num[] = rai6.map((r, i) => (i === 0 ? null : Math.max(0, ((r as number) ?? 0)) * h.tauxIBS));
  const resNet6: Num[] = rai6.map((r, i) => (i === 0 ? null : ((r as number) ?? 0) - ((impots6[i] as number) ?? 0)));
  const txMB6: Num[] = ca6.map((c, i) => (i === 0 || !c ? null : ((margeBrute6[i] as number) ?? 0) / (c as number)));
  const txEbitda6: Num[] = ca6.map((c, i) => (i === 0 || !c ? null : ((ebitda6[i] as number) ?? 0) / (c as number)));

  // ---- BFR (5 years) ----
  const dso = h.dso, dpo = h.dpo, dio = h.dio;
  const clients5 = ca5.map((c) => (c * dso) / 360);
  const fournisseurs5 = achats5.map((a) => (a * dpo) / 360);
  const stocks5 = achats5.map((a) => (a * dio) / 360); // approx: cost of goods × DIO
  const bfrNet5 = clients5.map((cl, i) => cl + stocks5[i] - fournisseurs5[i]);
  const varBfr5 = bfrNet5.map((b, i) => (i === 0 ? b : b - bfrNet5[i - 1]));

  // ---- TFT (5 years) ----
  const fluxExpl5 = ebitda6.slice(1).map((e, i) => ((e as number) ?? 0) - varBfr5[i] - ((impots6[i + 1] as number) ?? 0));
  const fluxInv5 = capex5.map((c) => -c);
  const fcf5 = fluxExpl5.map((f, i) => f + fluxInv5[i]);
  const fluxFin5 = safeArr(5, 0);
  const netCF5 = fcf5.map((v, i) => v + fluxFin5[i]);
  const soldeIni5: number[] = [];
  const soldeFin5: number[] = [];
  let prevSolde = h.capitalSocial;
  for (let i = 0; i < 5; i++) {
    soldeIni5.push(prevSolde);
    const fin = prevSolde + netCF5[i];
    soldeFin5.push(fin);
    prevSolde = fin;
  }
  // Discounted FCF & NPV
  const r = h.tauxActualisation;
  const fcfDisc5 = fcf5.map((v, i) => v / Math.pow(1 + r, i + 1));
  const valeurTerminale =
    fcf5[4] && r - h.terminalGrowth > 0
      ? (fcf5[4] * (1 + h.terminalGrowth)) / (r - h.terminalGrowth) / Math.pow(1 + r, 5)
      : 0;
  const npv = sum(fcfDisc5) + valeurTerminale;

  // ---- Bilan (5 years) ----
  const tresorerie5 = soldeFin5;
  const actifNet5 = immoNettes5.map((immo, i) => immo + clients5[i] + stocks5[i] + tresorerie5[i] - fournisseurs5[i]);
  // Capitaux propres: capital + cumulative résultat net
  let cumRes = 0;
  const cumResArr: number[] = [];
  for (let i = 0; i < 5; i++) {
    cumRes += (resNet6[i + 1] as number) ?? 0;
    cumResArr.push(cumRes);
  }
  const capitauxPropres5 = cumResArr.map((cr) => h.capitalSocial + cr);
  const check5 = actifNet5.map((a, i) => a - capitauxPropres5[i]);

  // ---- Synthèse Financement ----
  const investissementTotal = sum(capex5);
  const masseSalarialeTotal = sum(salaires5);
  const achatsDirectsTotal = sum(achats5);
  const chargesExternesTotal = sum(chargesExt5);

  return {
    fileName: plan.identification.intituleProjet || 'Plan financier',
    uploadedAt: new Date(),
    fiscalYears: fy6,
    pnl: {
      ca: ca6, achats: achats6, margeBrute: margeBrute6, chargesExternes: chargesExt6, salaires: salaires6,
      ebitda: ebitda6, amortissements: amort6, reprises: reprises6, ebit: ebit6,
      chargesFin: chargesFin6, resultatAvantImpots: rai6, impots: impots6, resultatNet: resNet6,
      txMargeBrute: txMB6, txEbitda: txEbitda6,
    },
    tft: {
      ebitda: ebitda6.slice(1) as Num[],
      varBfr: varBfr5 as Num[],
      bfrExploitation: bfrNet5 as Num[],
      bfrTotal: bfrNet5 as Num[],
      ibs: impots6.slice(1) as Num[],
      fluxExploitation: fluxExpl5 as Num[],
      capex: capex5.map((v) => -v) as Num[],
      fluxInvestissement: fluxInv5 as Num[],
      freeCashFlow: fcf5 as Num[],
      chargesFin: safeArr(5, 0) as Num[],
      fluxFinancement: fluxFin5 as Num[],
      netCashFlow: netCF5 as Num[],
      soldeInitial: soldeIni5 as Num[],
      soldeFinal: soldeFin5 as Num[],
      tauxActualisation: safeArr(5, r) as Num[],
      fcfActualises: fcfDisc5 as Num[],
      terminalGrowth: h.terminalGrowth,
      valeurTerminale,
      npv,
    },
    actifBfr: {
      immobilisations: immoNettes5 as Num[],
      actifImmobilise: immoNettes5 as Num[],
      clients: clients5 as Num[],
      stock: stocks5 as Num[],
      actifsCourants: clients5.map((c, i) => c + stocks5[i]) as Num[],
      fournisseurs: fournisseurs5 as Num[],
      passifsCourants: fournisseurs5 as Num[],
      bfrNet: bfrNet5 as Num[],
    },
    bilan: {
      immobilisations: immoNettes5 as Num[],
      clients: clients5 as Num[],
      stock: stocks5 as Num[],
      tresorerie: tresorerie5 as Num[],
      fournisseurs: fournisseurs5 as Num[],
      actifNet: actifNet5 as Num[],
      capitalSocial: safeArr(5, h.capitalSocial) as Num[],
      resultatExercice: resNet6.slice(1) as Num[],
      reservesLegales: safeArr(5, 0) as Num[],
      reportsNouveau: cumResArr.map((c, i) => c - ((resNet6[i + 1] as number) ?? 0)) as Num[],
      capitauxPropres: capitauxPropres5 as Num[],
      check: check5 as Num[],
    },
    synthese: {
      kpiYears: fy6.slice(0, 5),
      ca: ca6.slice(0, 5),
      ebitda: ebitda6.slice(0, 5),
      txEbitda: txEbitda6.slice(0, 5),
      fcf: [null, ...fcf5.slice(0, 4)] as Num[],
      investissementTotal,
      masseSalarialeTotal,
      achatsDirectsTotal,
      chargesExternesTotal,
      grandTotal: investissementTotal + masseSalarialeTotal + achatsDirectsTotal + chargesExternesTotal,
    },
    investissement: {
      materiels: plan.investissements.map((inv, i) => ({
        num: i + 1,
        designation: inv.designation,
        fonctionnalite: inv.fonctionnalite,
        prixUnitaire: inv.prixUnitaire,
        annees: inv.quantites.map((q) => q * inv.prixUnitaire) as Num[],
        total: inv.quantites.reduce((a, q) => a + q * inv.prixUnitaire, 0),
      })),
      totals: capex5 as Num[],
    },
    ca: products,
    masseSalariale: {
      postes: massePerPosteYear.map((m, i) => ({
        num: i + 1,
        poste: m.poste.poste,
        salaireBaseMensuel: m.poste.salaireBaseMensuel,
        indemniteMensuelle: m.poste.indemniteMensuelle,
        salaireChargeAnnuel: m.salaireChargeAnnuel,
        etp: [null, ...m.etp] as Num[],
        masseSalariale: [null, ...m.masseAnnuelle] as Num[],
      })),
      totalEtp: [null, ...Array.from({ length: 5 }, (_, yi) => massePerPosteYear.reduce((a, m) => a + m.etp[yi], 0))] as Num[],
      totalMasse: [null, ...salaires5] as Num[],
    },
    chargesExternes: {
      items: plan.chargesExternes.map((c, i) => ({
        label: c.label,
        values: [null, ...chargesByItemYear[i]] as Num[],
      })),
      totals: chargesExt6,
    },
    achatsDirects: {
      items: plan.produits.map((p, i) => ({
        label: p.nom,
        values: [null, ...achatsByProductYear[i]] as Num[],
      })),
      totals: achats6,
    },
    bfr: {
      caDso: ca5 as Num[],
      dso, clientsDzd: clients5 as Num[],
      consoMatieres: achats5 as Num[], achats: achats5 as Num[], dpo,
      fournisseursDzd: fournisseurs5 as Num[],
      consoStock: achats5 as Num[], dio, stocksDzd: stocks5 as Num[],
    },
    hypotheses: {
      anneeDebut: h.anneeDebut,
      tauxChange: safeArr(6, 1) as Num[],
      inflation: safeArr(6, h.inflation) as Num[],
      rampUp: safeArr(6, 1) as Num[],
      evolutionCa: safeArr(6, 0) as Num[],
      flagEvolutionCa: safeArr(6, 0) as Num[],
      volumesProduit1: safeArr(6, 0) as Num[],
      volumesProduit2: safeArr(6, 0) as Num[],
      volumesProduit3: safeArr(6, 0) as Num[],
    },
    warnings: [],
  };
}