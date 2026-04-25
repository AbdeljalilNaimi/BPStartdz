import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { usePlanStore } from '@/lib/plan-store';
import { FormShell, Section } from '@/components/plan/form-shell';
import { StepNav } from './plan';
import { dzd } from '@/lib/bp-format';

export const Route = createFileRoute('/plan/achats')({
  head: () => ({ meta: [{ title: 'Achats directs — Plan financier' }] }),
  component: AchatsPage,
});

function AchatsPage() {
  const produits = usePlanStore((s) => s.plan.produits);
  const update = usePlanStore((s) => s.updateProduit);
  const markComplete = usePlanStore((s) => s.markComplete);

  return (
    <FormShell
      step={5}
      title="Achats directs"
      description="Pour chaque produit, ajustez le ratio des coûts variables directs par rapport au chiffre d'affaires. Les achats annuels sont calculés automatiquement."
    >
      <Section>
        {produits.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Ajoutez d'abord des produits dans l'étape Chiffre d'affaires.</p>
        ) : (
          <div className="space-y-3">
            {produits.map((p) => {
              const ca1 = p.volumeMensuelAnnee1 * p.prixUnitaire * 12;
              const achats1 = ca1 * p.coutDirectRatio;
              return (
                <div key={p.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-center gap-4 p-3 border rounded-md bg-card">
                  <div>
                    <p className="font-medium text-sm">{p.nom}</p>
                    <p className="text-xs text-muted-foreground">CA Année 1 : {dzd(ca1)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground whitespace-nowrap">Coût / CA</label>
                    <div className="relative w-28">
                      <Input
                        type="number"
                        step="0.5"
                        value={(p.coutDirectRatio * 100).toFixed(1)}
                        onChange={(e) => update(p.id, { coutDirectRatio: (Number(e.target.value) || 0) / 100 })}
                        className="pr-7"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium tabular-nums text-right min-w-[140px]">{dzd(achats1)}</p>
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