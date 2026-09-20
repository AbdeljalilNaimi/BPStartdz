/** Official ASF A.4 payroll: CNAS rates + progressive IRG (no lump-sum social charge). */

export const CNAS_SALARIALE_TAUX = 0.09;
export const CNAS_PATRONALE_TAUX = 0.26;
export const MAX_POSTES = 27;

export function calculateIRG(baseSalary: number): number {
  const S = baseSalary;
  if (S < 30000) return 0;

  if (S < 35000) {
    let abattement = (S - 20000) * 0.092;
    if (abattement < 1000) abattement = 1000;
    if (abattement > 1500) abattement = 1500;
    const irgBrut = (S - 20000) * 0.23 - abattement;
    return Math.max(0, irgBrut * (137 / 51) - 27925 / 8);
  }

  if (S < 40000) {
    let abattement = (S - 20000) * 0.092;
    if (abattement < 1000) abattement = 1000;
    if (abattement > 1500) abattement = 1500;
    return Math.max(0, (S - 20000) * 0.23 - abattement);
  }

  if (S < 80000) return (S - 40000) * 0.27 + 3100;
  if (S < 160000) return (S - 80000) * 0.3 + 13900;
  if (S < 320000) return (S - 160000) * 0.33 + 37900;
  return (S - 320000) * 0.35 + 90700;
}

export interface PayrollBreakdown {
  brutGlobal: number;
  cnasSalariale: number;
  cnasPatronale: number;
  salaireImposableIRG: number;
  irg: number;
  salaireNet: number;
  salaireChargeAnnuelUnitaire: number;
}

export function computePayrollLine(input: {
  salaireBaseMensuel: number;
  indemniteMensuelle: number;
  primePanierTransport: number;
}): PayrollBreakdown {
  const base = input.salaireBaseMensuel + input.indemniteMensuelle;
  const prime = input.primePanierTransport;
  const brutGlobal = base + prime;
  const cnasSalariale = base * CNAS_SALARIALE_TAUX;
  const cnasPatronale = base * CNAS_PATRONALE_TAUX;
  const salaireImposableIRG = brutGlobal - cnasSalariale;
  const irg = calculateIRG(salaireImposableIRG);
  const salaireNet = brutGlobal - (cnasSalariale + irg);
  const salaireChargeAnnuelUnitaire = (brutGlobal + cnasPatronale) * 12;
  return {
    brutGlobal,
    cnasSalariale,
    cnasPatronale,
    salaireImposableIRG,
    irg,
    salaireNet,
    salaireChargeAnnuelUnitaire,
  };
}
