import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { defaultPlan, makeId, type PlanInputs } from './plan-types';
import type { ParsedBP } from './bp-types';

interface PlanState {
  plan: PlanInputs;
  setIdentification: <K extends keyof PlanInputs['identification']>(key: K, value: PlanInputs['identification'][K]) => void;
  setHypothese: <K extends keyof PlanInputs['hypotheses']>(key: K, value: PlanInputs['hypotheses'][K]) => void;
  // generic list helpers
  addInvestissement: () => void;
  updateInvestissement: (id: string, patch: Partial<PlanInputs['investissements'][number]>) => void;
  removeInvestissement: (id: string) => void;
  addProduit: () => void;
  updateProduit: (id: string, patch: Partial<PlanInputs['produits'][number]>) => void;
  removeProduit: (id: string) => void;
  addPoste: () => void;
  updatePoste: (id: string, patch: Partial<PlanInputs['postes'][number]>) => void;
  removePoste: (id: string) => void;
  addChargeExterne: (label?: string) => void;
  updateChargeExterne: (id: string, patch: Partial<PlanInputs['chargesExternes'][number]>) => void;
  removeChargeExterne: (id: string) => void;
  markComplete: (step: string, done: boolean) => void;
  reset: () => void;
  loadFromParsedBP: (bp: ParsedBP) => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      plan: defaultPlan(),
      setIdentification: (key, value) =>
        set((s) => ({ plan: { ...s.plan, identification: { ...s.plan.identification, [key]: value } } })),
      setHypothese: (key, value) =>
        set((s) => ({ plan: { ...s.plan, hypotheses: { ...s.plan.hypotheses, [key]: value } } })),
      addInvestissement: () =>
        set((s) => ({
          plan: {
            ...s.plan,
            investissements: [
              ...s.plan.investissements,
              { id: makeId(), designation: '', fonctionnalite: '', prixUnitaire: 0, quantites: [0, 0, 0, 0, 0] },
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
            produits: [
              ...s.plan.produits,
              { id: makeId(), nom: `Produit ${s.plan.produits.length + 1}`, prixUnitaire: 0, volumeMensuelAnnee1: 0, croissance: [0.1, 0.1, 0.1, 0.1], coutDirectRatio: 0.4 },
            ],
          },
        })),
      updateProduit: (id, patch) =>
        set((s) => ({ plan: { ...s.plan, produits: s.plan.produits.map((p) => (p.id === id ? { ...p, ...patch } : p)) } })),
      removeProduit: (id) => set((s) => ({ plan: { ...s.plan, produits: s.plan.produits.filter((p) => p.id !== id) } })),
      addPoste: () =>
        set((s) => ({
          plan: {
            ...s.plan,
            postes: [
              ...s.plan.postes,
              { id: makeId(), poste: '', salaireBaseMensuel: 0, indemniteMensuelle: 0, chargesSocialesRatio: 0.26, etp: [1, 1, 1, 1, 1] },
            ],
          },
        })),
      updatePoste: (id, patch) =>
        set((s) => ({ plan: { ...s.plan, postes: s.plan.postes.map((p) => (p.id === id ? { ...p, ...patch } : p)) } })),
      removePoste: (id) => set((s) => ({ plan: { ...s.plan, postes: s.plan.postes.filter((p) => p.id !== id) } })),
      addChargeExterne: (label) =>
        set((s) => ({
          plan: {
            ...s.plan,
            chargesExternes: [
              ...s.plan.chargesExternes,
              { id: makeId(), label: label ?? 'Nouvelle charge', montantAnnuelAnnee1: 0, croissanceAnnuelle: 0.04 },
            ],
          },
        })),
      updateChargeExterne: (id, patch) =>
        set((s) => ({
          plan: { ...s.plan, chargesExternes: s.plan.chargesExternes.map((c) => (c.id === id ? { ...c, ...patch } : c)) },
        })),
      removeChargeExterne: (id) =>
        set((s) => ({ plan: { ...s.plan, chargesExternes: s.plan.chargesExternes.filter((c) => c.id !== id) } })),
      markComplete: (step, done) =>
        set((s) => ({ plan: { ...s.plan, completed: { ...s.plan.completed, [step]: done } } })),
      reset: () => set({ plan: defaultPlan() }),
      loadFromParsedBP: (bp) => {
        // Best-effort seeding from a parsed Excel file
        const base = defaultPlan();
        if (bp.investissement) {
          base.investissements = bp.investissement.materiels
            .filter((m) => m.designation || (m.prixUnitaire ?? 0) > 0)
            .slice(0, 30)
            .map((m) => ({
              id: makeId(),
              designation: m.designation ?? '',
              fonctionnalite: m.fonctionnalite ?? '',
              prixUnitaire: m.prixUnitaire ?? 0,
              quantites: m.annees.slice(0, 5).map((v) => (typeof v === 'number' && (m.prixUnitaire ?? 0) > 0 ? Math.round((v as number) / (m.prixUnitaire as number)) : 0)),
            }));
        }
        if (bp.ca) {
          base.produits = bp.ca.slice(0, 10).map((p) => {
            const totalAnnee1 = p.monthly.reduce<number>((a, v) => a + (typeof v === 'number' ? v : 0), 0);
            return {
              id: makeId(),
              nom: p.name,
              prixUnitaire: 1,
              volumeMensuelAnnee1: Math.round(totalAnnee1 / 12),
              croissance: [0.1, 0.1, 0.1, 0.1],
              coutDirectRatio: 0.4,
            };
          });
        }
        if (bp.masseSalariale) {
          base.postes = bp.masseSalariale.postes
            .filter((p) => p.poste && (p.salaireBaseMensuel ?? 0) > 0)
            .slice(0, 27)
            .map((p) => ({
              id: makeId(),
              poste: p.poste ?? '',
              salaireBaseMensuel: p.salaireBaseMensuel ?? 0,
              indemniteMensuelle: p.indemniteMensuelle ?? 0,
              chargesSocialesRatio: 0.26,
              etp: p.etp.slice(1, 6).map((v) => (typeof v === 'number' ? v : 1)),
            }));
        }
        if (bp.chargesExternes) {
          base.chargesExternes = bp.chargesExternes.items
            .filter((c) => c.values.some((v) => typeof v === 'number' && v !== 0))
            .map((c) => ({
              id: makeId(),
              label: c.label,
              montantAnnuelAnnee1: (typeof c.values[1] === 'number' ? (c.values[1] as number) : 0) || (typeof c.values[0] === 'number' ? (c.values[0] as number) : 0),
              croissanceAnnuelle: 0.04,
            }));
        }
        set({ plan: base });
      },
    }),
    {
      name: 'bp-plan-v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : undefined as unknown as Storage)),
    }
  )
);