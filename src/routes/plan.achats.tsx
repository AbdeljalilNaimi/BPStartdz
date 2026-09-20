import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { usePlanStore } from '@/lib/plan-store';
import { FormShell, Section } from '@/components/plan/form-shell';
import { StepNav } from './plan';
import { fyOperatingLabels } from '@/lib/bp-types';
import { dzd } from '@/lib/bp-format';

export const Route = createFileRoute('/plan/achats')({
  head: () => ({ meta: [{ title: 'Achats directs — Plan financier' }] }),
  component: AchatsPage,
});

const MOIS = Array.from({ length: 12 }, (_, i) => `M${String(i + 1).padStart(2, '0')}`);

function AchatsPage() {
  const produits = usePlanStore((s) => s.plan.produits);
  const update = usePlanStore((s) => s.updateProduit);
  const markComplete = usePlanStore((s) => s.markComplete);
  const ops = fyOperatingLabels();

  return (
    <FormShell
      wide
      step={5}
      title="Achats directs"
      description="Quantité achetée × coût unitaire : saisie mensuelle pour 2026, volumes annuels pour 2027–2030. La somme des 12 mois alimente l'Année 01 du P&L."
    >
      <Section>
        {produits.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Ajoutez d'abord des produits dans l'étape Chiffre d'affaires.</p>
        ) : (
          <div className="space-y-4">
            {produits.map((p) => {
              const a1 = p.quantitesAcheteesMois.reduce((a, q) => a + q * p.coutUnitaire, 0);
              return (
                <div key={p.id} className="p-4 border rounded-lg bg-card space-y-3">
                  <p className="font-medium text-sm">{p.nom}</p>
                  <div className="max-w-xs text-xs">
                    <label className="text-muted-foreground">Coût unitaire (DZD)</label>
                    <Input type="number" value={p.coutUnitaire} onChange={(e) => update(p.id, { coutUnitaire: Number(e.target.value) || 0 })} className="mt-1" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantités achetées — 2026 (mensuel)</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 text-xs">
                    {MOIS.map((m, i) => (
                      <div key={m}>
                        <label className="text-muted-foreground">{m}</label>
                        <Input
                          type="number"
                          value={p.quantitesAcheteesMois[i] ?? 0}
                          onChange={(e) => {
                            const next = [...p.quantitesAcheteesMois];
                            next[i] = Number(e.target.value) || 0;
                            update(p.id, { quantitesAcheteesMois: next });
                          }}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Volumes annuels 2027–2030</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {ops.slice(1).map((y, yi) => (
                      <div key={y}>
                        <label className="text-muted-foreground">Qté {y}</label>
                        <Input
                          type="number"
                          value={p.quantitesAcheteesAnnuelles[yi] ?? 0}
                          onChange={(e) => {
                            const next = [...p.quantitesAcheteesAnnuelles];
                            next[yi] = Number(e.target.value) || 0;
                            update(p.id, { quantitesAcheteesAnnuelles: next });
                          }}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Achats 2026 : <span className="font-medium text-foreground">{dzd(a1)}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <StepNav prev="/plan/chiffre-affaires" next="/plan/masse-salariale" onNext={() => markComplete('achats', true)} />
    </FormShell>
  );
}
