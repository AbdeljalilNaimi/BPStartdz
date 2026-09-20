import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { defaultPlan, makeId, zeros, type PlanInputs, type PlanCommentaires } from './plan-types';
import type { ParsedBP } from './bp-types';
import { DEFAULT_START_YEAR } from './bp-types';
import { MAX_POSTES } from './payroll';

interface PlanState {
  plan: PlanInputs;
  setIdentification: <K extends keyof PlanInputs['identification']>(key: K, value: PlanInputs['identification'][K]) => void;
  setHypothese: <K extends keyof PlanInputs['hypotheses']>(key: K, value: PlanInputs['hypotheses'][K]) => void;
  setCommentaire: (key: keyof PlanCommentaires, value: string) => void;
  addInvestissement: () => void;
  updateInvestissement: (id: string, patch: Partial<PlanInputs['investissements'][number]>) => void;
  removeInvestissement: (id: string) => void;
  addProduit: () => void;
  updateProduit: (id: string, patch: Partial<PlanInputs['produits'][number]>) => void;
  removeProduit: (id: string) => void;
  addPoste: () => void;
  updatePoste: (id: string, patch: Partial<PlanInputs['postes'][number]>) => void;
  removePoste: (id: string) => void;
  updateChargeExterne: (id: string, patch: Partial<PlanInputs['chargesExternes'][number]>) => void;
  markComplete: (step: string, done: boolean) => void;
  reset: () => void;
  loadFromParsedBP: (bp: ParsedBP) => void;
}

function emptyProduit(index: number): PlanInputs['produits'][number] {
  return {
    id: makeId(),
    nom: `Produit ${index}`,
    prixUnitaire: 0,
    coutUnitaire: 0,
    quantitesVenduesMois: zeros(12),
    quantitesVenduesAnnuelles: zeros(4),
    quantitesAcheteesMois: zeros(12),
    quantitesAcheteesAnnuelles: zeros(4),
  };
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      plan: defaultPlan(),
      setIdentification: (key, value) =>
        set((s) => ({ plan: { ...s.plan, identification: { ...s.plan.identification, [key]: value } } })),
      setHypothese: (key, value) =>
        set((s) => ({ plan: { ...s.plan, hypotheses: { ...s.plan.hypotheses, [key]: value } } })),
      setCommentaire: (key, value) =>
        set((s) => ({ plan: { ...s.plan, commentaires: { ...s.plan.commentaires, [key]: value } } })),
      addInvestissement: () =>
        set((s) => ({
          plan: {
            ...s.plan,
            investissements: [
              ...s.plan.investissements,
              { id: makeId(), designation: '', fonctionnalite: '', prixUnitaire: 0, quantites: zeros(5) },
            ],
          },
        })),
      updateInvestissement: (id, patch) =>
        set((s) => ({
          plan: {
            ...s.plan,
            investissements: s.plan.investissements.map((i) => (i.id === id ? { ...i, ...patch } : i)),
          },
        })),
      removeInvestissement: (id) =>
        set((s) => ({ plan: { ...s.plan, investissements: s.plan.investissements.filter((i) => i.id !== id) } })),
      addProduit: () =>
        set((s) => ({
          plan: {
            ...s.plan,
            produits: [...s.plan.produits, emptyProduit(s.plan.produits.length + 1)],
          },
        })),
      updateProduit: (id, patch) =>
        set((s) => ({ plan: { ...s.plan, produits: s.plan.produits.map((p) => (p.id === id ? { ...p, ...patch } : p)) } })),
      removeProduit: (id) => set((s) => ({ plan: { ...s.plan, produits: s.plan.produits.filter((p) => p.id !== id) } })),
      addPoste: () =>
        set((s) => {
          if (s.plan.postes.length >= MAX_POSTES) return s;
          return {
            plan: {
              ...s.plan,
              postes: [
                ...s.plan.postes,
                {
                  id: makeId(),
                  poste: '',
                  salaireBaseMensuel: 0,
                  indemniteMensuelle: 0,
                  primePanierTransport: 0,
                  etp: [0, 1, 1, 1, 1, 1],
                },
              ],
            },
          };
        }),
      updatePoste: (id, patch) =>
        set((s) => ({ plan: { ...s.plan, postes: s.plan.postes.map((p) => (p.id === id ? { ...p, ...patch } : p)) } })),
      removePoste: (id) => set((s) => ({ plan: { ...s.plan, postes: s.plan.postes.filter((p) => p.id !== id) } })),
      updateChargeExterne: (id, patch) =>
        set((s) => ({
          plan: { ...s.plan, chargesExternes: s.plan.chargesExternes.map((c) => (c.id === id ? { ...c, ...patch } : c)) },
        })),
      markComplete: (step, done) =>
        set((s) => ({ plan: { ...s.plan, completed: { ...s.plan.completed, [step]: done } } })),
      reset: () => set({ plan: defaultPlan() }),
      loadFromParsedBP: (bp) => {
        const base = defaultPlan();
        base.identification.anneeReference = DEFAULT_START_YEAR;
        base.hypotheses.anneeDebut = DEFAULT_START_YEAR;
        if (bp.hypotheses?.anneeDebut) {
          // Horizon is locked to 2026–2030; keep Excel start year only if it is 2026.
          if (bp.hypotheses.anneeDebut === DEFAULT_START_YEAR) {
            base.hypotheses.anneeDebut = DEFAULT_START_YEAR;
          }
        }
        if (bp.investissement) {
          base.investissements = bp.investissement.materiels
            .filter((m) => m.designation || (m.prixUnitaire ?? 0) > 0)
            .slice(0, 30)
            .map((m) => ({
              id: makeId(),
              designation: m.designation ?? '',
              fonctionnalite: m.fonctionnalite ?? '',
              prixUnitaire: m.prixUnitaire ?? 0,
              quantites: m.annees.slice(0, 5).map((v) =>
                typeof v === 'number' && (m.prixUnitaire ?? 0) > 0
                  ? Math.round((v as number) / (m.prixUnitaire as number))
                  : 0,
              ),
            }));
        }
        if (bp.ca) {
          base.produits = bp.ca.slice(0, 10).map((p, idx) => {
            const monthly = p.monthly.map((v) => (typeof v === 'number' ? v : 0));
            while (monthly.length < 12) monthly.push(0);
            const yearly = p.yearly.map((v) => (typeof v === 'number' ? v : 0));
            return {
              id: makeId(),
              nom: p.name || `Produit ${idx + 1}`,
              prixUnitaire: 1,
              coutUnitaire: 0,
              quantitesVenduesMois: monthly.slice(0, 12),
              quantitesVenduesAnnuelles: [yearly[2] ?? 0, yearly[3] ?? 0, yearly[4] ?? 0, yearly[5] ?? 0],
              quantitesAcheteesMois: zeros(12),
              quantitesAcheteesAnnuelles: zeros(4),
            };
          });
          if (bp.achatsDirects) {
            base.produits = base.produits.map((prod) => {
              const row = bp.achatsDirects?.items.find((it) => it.label === prod.nom);
              if (!row) return prod;
              const vals = row.values.map((v) => (typeof v === 'number' ? v : 0));
              return {
                ...prod,
                coutUnitaire: 1,
                quantitesAcheteesMois: zeros(12).map((_, i) => (i === 0 ? (vals[1] ?? 0) / 12 : (vals[1] ?? 0) / 12)),
                quantitesAcheteesAnnuelles: [vals[2] ?? 0, vals[3] ?? 0, vals[4] ?? 0, vals[5] ?? 0],
              };
            });
          }
        }
        if (bp.masseSalariale) {
          base.postes = bp.masseSalariale.postes
            .filter((p) => p.poste && (p.salaireBaseMensuel ?? 0) > 0)
            .slice(0, MAX_POSTES)
            .map((p) => {
              const etp = p.etp.map((v) => (typeof v === 'number' ? v : 0));
              while (etp.length < 6) etp.push(0);
              return {
                id: makeId(),
                poste: p.poste ?? '',
                salaireBaseMensuel: p.salaireBaseMensuel ?? 0,
                indemniteMensuelle: p.indemniteMensuelle ?? 0,
                primePanierTransport: p.primePanierTransport ?? 0,
                etp: etp.slice(0, 6),
              };
            });
        }
        if (bp.chargesExternes) {
          base.chargesExternes = base.chargesExternes.map((c) => {
            const match = bp.chargesExternes?.items.find(
              (it) => it.label.toLowerCase().includes(c.label.slice(0, 8).toLowerCase()) || c.label.toLowerCase().includes(it.label.slice(0, 8).toLowerCase()),
            );
            if (!match) return c;
            const montants = match.values.map((v) => (typeof v === 'number' ? v : 0));
            while (montants.length < 6) montants.push(0);
            return { ...c, montants: montants.slice(0, 6) };
          });
        }
        set({ plan: base });
      },
    }),
    {
      name: 'bp-plan-v2',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : (undefined as unknown as Storage))),
    },
  ),
);
