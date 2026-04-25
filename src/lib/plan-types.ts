import type { Num } from './bp-types';

export interface Identification {
  etablissement: string;
  faculte: string;
  departement: string;
  porteurNom: string;
  porteurPrenom: string;
  intituleProjet: string;
  anneeReference: number;
}

export interface PlanHypotheses {
  anneeDebut: number;
  dureeAmortissement: number; // years
  tauxIBS: number; // 0..1
  tauxActualisation: number; // 0..1
  terminalGrowth: number; // 0..1
  inflation: number; // 0..1
  dso: number; // jours
  dpo: number;
  dio: number;
  capitalSocial: number; // initial equity (DZD)
}

export interface PlanInvestissement {
  id: string;
  designation: string;
  fonctionnalite: string;
  prixUnitaire: number;
  quantites: number[]; // 5 years (Année 1..5)
}

export interface PlanProduit {
  id: string;
  nom: string;
  prixUnitaire: number;
  volumeMensuelAnnee1: number; // assume flat across months (simple)
  croissance: number[]; // 4 yearly growth rates from year 2..5 (decimals e.g. 0.10)
  coutDirectRatio: number; // 0..1 — % of revenue going to direct purchases
}

export interface PlanPoste {
  id: string;
  poste: string;
  salaireBaseMensuel: number;
  indemniteMensuelle: number;
  chargesSocialesRatio: number; // 0..1 default 0.26
  etp: number[]; // 5 years
}

export interface PlanChargeExterne {
  id: string;
  label: string;
  montantAnnuelAnnee1: number;
  croissanceAnnuelle: number; // decimal
}

export interface PlanInputs {
  identification: Identification;
  hypotheses: PlanHypotheses;
  investissements: PlanInvestissement[];
  produits: PlanProduit[];
  postes: PlanPoste[];
  chargesExternes: PlanChargeExterne[];
  // tracks completion per step
  completed: Record<string, boolean>;
}

export const DEFAULT_CHARGES_LABELS = [
  'Sous-traitance',
  'Loyers',
  'Energie/eau/gaz',
  'Frais Marketing',
  "Honoraires d'avocat",
  'Honoraires du Notaire',
  "Honoraires d'expert-comptable",
  'Honoraires Commissaire aux Comptes',
  'Frais du transit',
  'Frais télécom',
  'Divers fournitures',
  'Frais de formation',
  'R&D',
  'Autre',
];

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function defaultPlan(): PlanInputs {
  return {
    identification: {
      etablissement: 'Université de Sidi Bel Abbès',
      faculte: 'Faculté des Sciences Économiques',
      departement: 'Département de Gestion',
      porteurNom: '',
      porteurPrenom: '',
      intituleProjet: '',
      anneeReference: 2026,
    },
    hypotheses: {
      anneeDebut: 2026,
      dureeAmortissement: 5,
      tauxIBS: 0.26,
      tauxActualisation: 0.10,
      terminalGrowth: 0.02,
      inflation: 0.04,
      dso: 60,
      dpo: 45,
      dio: 30,
      capitalSocial: 5_000_000,
    },
    investissements: [],
    produits: [],
    postes: [],
    chargesExternes: [],
    completed: {},
  };
}

// Re-export Num for convenience
export type { Num };