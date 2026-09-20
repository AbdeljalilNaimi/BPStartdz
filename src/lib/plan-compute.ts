import type { PlanInputs } from './plan-types';
import type { ParsedBP, Num, Product } from './bp-types';
import { fyHorizonLabels, DEFAULT_START_YEAR } from './bp-types';
import { computePayrollLine } from './payroll';

const sum = (arr: number[]) => arr.reduce((a, v) => a + 0 + v, 0);
const safeArr = (n: number, val = 0) => Array.from({ length: n }, () => val);

/**
 * Compute a full ParsedBP from guided plan inputs.
 * Year axis: 6 years — index 0 = N-1 (2025), indices 1..5 = 2026..2030.
 */
export function computeBP(plan: PlanInputs): ParsedBP {
  const h = plan.hypotheses;
  const startYear = h.anneeDebut || DEFAULT_START_YEAR;
  const fy6 = fyHorizonLabels(startYear);

  const products: Product[] = plan.produits.map((p) => {
    const monthly = p.quantitesVenduesMois.map((q) => q * p.prixUnitaire);
    const ca2026 = sum(monthly);
    const yearlyOps = [
      ca2026,
      ...p.quantitesVenduesAnnuelles.map((q) => q * p.prixUnitaire),
    ];
    return {
      name: p.nom,
      designation: null,
      monthly: monthly as Num[],
      yearly: [null, ...yearlyOps] as Num[],
    };
  });

  const ca6: Num[] = Array.from({ length: 6 }, (_, i) => {
    if (i === 0) return 0;
    return products.reduce((acc, p) => acc + ((p.yearly[i] as number) ?? 0), 0);
  });
  const ca5 = ca6.slice(1).map((v) => (v as number) ?? 0);

  const achatsByProductYear = plan.produits.map((p) => {
    const a2026 = sum(p.quantitesAcheteesMois.map((q) => q * p.coutUnitaire));
    return [a2026, ...p.quantitesAcheteesAnnuelles.map((q) => q * p.coutUnitaire)];
  });
  const achats5 = Array.from({ length: 5 }, (_, yi) =>
    achatsByProductYear.reduce((a, arr) => a + (arr[yi] || 0), 0),
  );
  const achats6: Num[] = [0, ...achats5];

  const massePerPosteYear = plan.postes.map((p) => {
    const pay = computePayrollLine({
      salaireBaseMensuel: p.salaireBaseMensuel,
      indemniteMensuelle: p.indemniteMensuelle,
      primePanierTransport: p.primePanierTransport,
    });
    const etp6 = p.etp.length >= 6 ? p.etp.slice(0, 6) : [0, ...p.etp].slice(0, 6);
    while (etp6.length < 6) etp6.push(0);
    return {
      poste: p,
      pay,
      etp: etp6,
      masseAnnuelle: etp6.map((etp) => etp * pay.salaireChargeAnnuelUnitaire),
    };
  });
  const salaires6: Num[] = Array.from({ length: 6 }, (_, yi) =>
    massePerPosteYear.reduce((a, m) => a + m.masseAnnuelle[yi], 0),
  );
  const salaires5 = salaires6.slice(1).map((v) => (v as number) ?? 0);

  const chargesByItemYear = plan.chargesExternes.map((c) => {
    const m = [...c.montants];
    while (m.length < 6) m.push(0);
    return m.slice(0, 6);
  });
  const chargesExt6: Num[] = Array.from({ length: 6 }, (_, yi) =>
    chargesByItemYear.reduce((a, arr) => a + (arr[yi] || 0), 0),
  );
  const chargesExt5 = chargesExt6.slice(1).map((v) => (v as number) ?? 0);

  const capex5 = Array.from({ length: 5 }, (_, yi) =>
    plan.investissements.reduce((a, inv) => a + inv.prixUnitaire * (inv.quantites[yi] || 0), 0),
  );
  const cumCapex = capex5.reduce<number[]>((acc, v, i) => {
    acc.push((i === 0 ? 0 : acc[i - 1]) + v);
    return acc;
  }, []);

  const dur = Math.max(1, h.dureeAmortissement);
  const amort5 = Array.from({ length: 5 }, () => 0);
  capex5.forEach((c, ci) => {
    const yearly = c / dur;
    for (let y = ci; y < Math.min(5, ci + dur); y++) amort5[y] += yearly;
  });
  const amort6: Num[] = [0, ...amort5];
  const cumAmort = amort5.reduce<number[]>((acc, v, i) => {
    acc.push((i === 0 ? 0 : acc[i - 1]) + v);
    return acc;
  }, []);
  const immoNettes5 = cumCapex.map((c, i) => c - cumAmort[i]);

  const margeBrute6: Num[] = ca6.map((c, i) => ((c as number) ?? 0) - ((achats6[i] as number) ?? 0));
  const ebitda6: Num[] = margeBrute6.map((m, i) =>
    ((m as number) ?? 0) - ((chargesExt6[i] as number) ?? 0) - ((salaires6[i] as number) ?? 0),
  );
  const reprises6: Num[] = [0, 0, 0, 0, 0, 0];
  const ebit6: Num[] = ebitda6.map((e, i) => ((e as number) ?? 0) - ((amort6[i] as number) ?? 0));
  const chargesFin6: Num[] = [0, 0, 0, 0, 0, 0];
  const rai6: Num[] = ebit6.map((e, i) => ((e as number) ?? 0) - ((chargesFin6[i] as number) ?? 0));
  const impots6: Num[] = rai6.map((r, i) => {
    if (i === 0) return 0;
    if (h.exonerationStartup) return 0;
    return Math.max(0, (r as number) ?? 0) * h.tauxIBS;
  });
  const resNet6: Num[] = rai6.map((r, i) => ((r as number) ?? 0) - ((impots6[i] as number) ?? 0));
  const txMB6: Num[] = ca6.map((c, i) => (!c ? null : ((margeBrute6[i] as number) ?? 0) / (c as number)));
  const txEbitda6: Num[] = ca6.map((c, i) => (!c ? null : ((ebitda6[i] as number) ?? 0) / (c as number)));

  const dso = h.dso, dpo = h.dpo, dio = h.dio;
  const clients5 = ca5.map((c) => (c * dso) / 360);
  const fournisseurs5 = achats5.map((a, i) => ((a + chargesExt5[i]) * dpo) / 360);
  const stocks5 = achats5.map((a) => (a * dio) / 360);
  const bfrNet5 = clients5.map((cl, i) => cl + stocks5[i] - fournisseurs5[i]);
  const varBfr5 = bfrNet5.map((b, i) => (i === 0 ? -b : bfrNet5[i - 1] - b));

  const fluxExpl5 = ebitda6.slice(1).map((e, i) => ((e as number) ?? 0) + varBfr5[i] - ((impots6[i + 1] as number) ?? 0));
  const fluxInv5 = capex5.map((c) => -c);
  const fcf5 = fluxExpl5.map((f, i) => f + fluxInv5[i]);
  const fluxFin5 = [h.capitalSocial, 0, 0, 0, 0];
  const netCF5 = fcf5.map((v, i) => v + fluxFin5[i]);
  const soldeIni5: number[] = [];
  const soldeFin5: number[] = [];
  let prevSolde = 0;
  for (let i = 0; i < 5; i++) {
    soldeIni5.push(prevSolde);
    const fin = prevSolde + netCF5[i];
    soldeFin5.push(fin);
    prevSolde = fin;
  }

  const r = h.tauxActualisation;
  const ncfDisc5 = netCF5.map((v, i) => v / Math.pow(1 + r, i + 1));
  const g = h.terminalGrowth;
  const vtUndiscounted = netCF5[4] && r - g > 0 ? (netCF5[4] * (1 + g)) / (r - g) : 0;
  const valeurTerminale = vtUndiscounted / Math.pow(1 + r, 5);
  const npv = sum(ncfDisc5) + valeurTerminale;

  const tresorerie5 = soldeFin5;
  const autresActifs5 = safeArr(5, 0);
  const actifNet5 = immoNettes5.map(
    (immo, i) => immo + clients5[i] + stocks5[i] + tresorerie5[i] + autresActifs5[i],
  );

  let cumRes = 0;
  const cumResArr: number[] = [];
  for (let i = 0; i < 5; i++) {
    cumRes += (resNet6[i + 1] as number) ?? 0;
    cumResArr.push(cumRes);
  }
  const resultatExercice5 = resNet6.slice(1).map((v) => (v as number) ?? 0);
  const reportsNouveau5 = cumResArr.map((c, i) => c - resultatExercice5[i]);
  const capitauxPropres5 = cumResArr.map((cr) => h.capitalSocial + cr);
  const passifTotal5 = capitauxPropres5.map((cp, i) => cp + fournisseurs5[i]);
  const check5 = actifNet5.map((a, i) => a - passifTotal5[i]);

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
      fcfActualises: ncfDisc5 as Num[],
      terminalGrowth: g,
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
      resultatExercice: resultatExercice5 as Num[],
      reservesLegales: safeArr(5, 0) as Num[],
      reportsNouveau: reportsNouveau5 as Num[],
      capitauxPropres: capitauxPropres5 as Num[],
      passifTotal: passifTotal5 as Num[],
      check: check5 as Num[],
    },
    synthese: {
      kpiYears: fy6.slice(1),
      ca: ca6.slice(1),
      ebitda: ebitda6.slice(1),
      txEbitda: txEbitda6.slice(1),
      fcf: fcf5 as Num[],
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
        primePanierTransport: m.poste.primePanierTransport,
        salaireChargeAnnuel: m.pay.salaireChargeAnnuelUnitaire,
        salaireNetMensuel: m.pay.salaireNet,
        irgMensuel: m.pay.irg,
        cnasSalariale: m.pay.cnasSalariale,
        cnasPatronale: m.pay.cnasPatronale,
        etp: m.etp as Num[],
        masseSalariale: m.masseAnnuelle as Num[],
      })),
      totalEtp: Array.from({ length: 6 }, (_, yi) => massePerPosteYear.reduce((a, m) => a + m.etp[yi], 0)) as Num[],
      totalMasse: salaires6,
    },
    chargesExternes: {
      items: plan.chargesExternes.map((c, i) => ({
        label: c.label,
        values: chargesByItemYear[i] as Num[],
      })),
      totals: chargesExt6,
    },
    achatsDirects: {
      items: plan.produits.map((p, i) => ({
        label: p.nom,
        values: [0, ...achatsByProductYear[i]] as Num[],
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
