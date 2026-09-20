import type { Num } from './bp-types';
import { DEFAULT_START_YEAR } from './bp-types';

export interface Identification {
  etablissement: string;
  faculte: string;
  departement: string;
  incubateur: string;
  porteurNom: string;
  porteurPrenom: string;
  intituleProjet: string;
  anneeReference: number;
}

export interface PlanHypotheses {
  anneeDebut: number;
  dureeAmortissement: number;
  tauxIBS: number;
  exonerationStartup: boolean;
  tauxActualisation: number;
  terminalGrowth: number;
  inflation: number;
  dso: number;
  dpo: number;
  dio: number;
  capitalSocial: number;
}

export interface PlanInvestissement {
  id: string;
  designation: string;
  fonctionnalite: string;
  prixUnitaire: number;
  quantites: number[]; // 5 operating years 2026–2030
}

export interface PlanProduit {
  id: string;
  nom: string;
  prixUnitaire: number;
  coutUnitaire: number;
  quantitesVenduesMois: number[]; // 12 months of 2026
  quantitesVenduesAnnuelles: number[]; // 4 years 2027–2030
  quantitesAcheteesMois: number[];
  quantitesAcheteesAnnuelles: number[];
}

export interface PlanPoste {
  id: string;
  poste: string;
  salaireBaseMensuel: number;
  indemniteMensuelle: number;
  primePanierTransport: number;
  etp: number[]; // 6: N-1 then A01..A05
}

export interface PlanChargeExterne {
  id: string;
  label: string;
  montants: number[]; // 6 years 2025–2030
}

export interface PlanCommentaires {
  investissements: string;
  chiffreAffaires: string;
  coutsDirects: string;
  masseSalariale: string;
  fraisGeneraux: string;
}

export interface PlanInputs {
  identification: Identification;
  hypotheses: PlanHypotheses;
  investissements: PlanInvestissement[];
  produits: PlanProduit[];
  postes: PlanPoste[];
  chargesExternes: PlanChargeExterne[];
  commentaires: PlanCommentaires;
  completed: Record<string, boolean>;
}

export const DEFAULT_CHARGES_LABELS = [
  'Sous-traitance',
  'Loyers',
  'Énergie / eau / gaz',
  'Frais Marketing & Communication',
  "Honoraires d'avocat",
  'Honoraires du Notaire',
  "Honoraires d'expert-comptable",
  'Honoraires Commissaire aux Comptes (CAC)',
  'Frais de transit / douane',
  'Frais télécom & hébergement internet',
  'Diverses fournitures',
  'Frais de formation',
  'Recherche & Développement (R&D)',
  'Autre (charges spécifiques)',
];

export const COMMENTAIRE_RUBRIQUES: { key: keyof PlanCommentaires; title: string; hint: string }[] = [
  {
    key: 'investissements',
    title: '1. Investissements',
    hint: 'Capacités de production et taux d’utilisation à horizon 2030',
  },
  {
    key: 'chiffreAffaires',
    title: '2. Chiffre d’affaires',
    hint: 'Drivers de marché et part de marché visée en 2030',
  },
  {
    key: 'coutsDirects',
    title: '3. Coûts directs',
    hint: 'Fournisseurs et part des intrants importés vs locaux',
  },
  {
    key: 'masseSalariale',
    title: '4. Masse salariale',
    hint: 'Justification de la grille des postes et montée en charge',
  },
  {
    key: 'fraisGeneraux',
    title: '5. Autres frais généraux',
    hint: 'Justification des frais marketing, R&D et honoraires',
  },
];

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function zeros(n: number): number[] {
  return Array.from({ length: n }, () => 0);
}

export function defaultPlan(): PlanInputs {
  return {
    identification: {
      etablissement: 'Université de Sidi Bel Abbès',
      faculte: 'Faculté des Sciences Économiques',
      departement: 'Département de Gestion',
      incubateur: '',
      porteurNom: '',
      porteurPrenom: '',
      intituleProjet: '',
      anneeReference: DEFAULT_START_YEAR,
    },
    hypotheses: {
      anneeDebut: DEFAULT_START_YEAR,
      dureeAmortissement: 5,
      tauxIBS: 0.26,
      exonerationStartup: false,
      tauxActualisation: 0.15,
      terminalGrowth: 0.025,
      inflation: 0.04,
      dso: 60,
      dpo: 45,
      dio: 30,
      capitalSocial: 5_000_000,
    },
    investissements: [],
    produits: [],
    postes: [],
    chargesExternes: DEFAULT_CHARGES_LABELS.map((label) => ({
      id: makeId(),
      label,
      montants: zeros(6),
    })),
    commentaires: {
      investissements: '',
      chiffreAffaires: '',
      coutsDirects: '',
      masseSalariale: '',
      fraisGeneraux: '',
    },
    completed: {},
  };
}

export type { Num };
