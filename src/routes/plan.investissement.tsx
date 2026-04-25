import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { usePlanStore } from '@/lib/plan-store';
import { FormShell, Section } from '@/components/plan/form-shell';
import { StepNav } from './plan';
import { fyLabels } from '@/lib/bp-types';
import { dzd } from '@/lib/bp-format';

export const Route = createFileRoute('/plan/investissement')({
  head: () => ({ meta: [{ title: 'Investissements — Plan financier' }] }),
  component: InvestissementPage,
});

function InvestissementPage() {
  const items = usePlanStore((s) => s.plan.investissements);
  const startYear = usePlanStore((s) => s.plan.hypotheses.anneeDebut);
  const add = usePlanStore((s) => s.addInvestissement);
  const update = usePlanStore((s) => s.updateInvestissement);
  const remove = usePlanStore((s) => s.removeInvestissement);
  const markComplete = usePlanStore((s) => s.markComplete);

  const labels = fyLabels(startYear, 5);
  const totalCapex = items.reduce(
    (acc, it) => acc + it.prixUnitaire * it.quantites.reduce((a, q) => a + q, 0),
    0
  );

  return (
    <FormShell
      step={3}
      title="Investissements"
      description="Listez les équipements et matériels nécessaires sur 5 ans. Indiquez le prix unitaire et la quantité achetée chaque année."
    >
      <Section>
        {items.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">Aucun investissement renseigné</p>
            <Button onClick={add}><Plus className="h-4 w-4 mr-2" />Ajouter un équipement</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((it, idx) => {
              const total = it.prixUnitaire * it.quantites.reduce((a, q) => a + q, 0);
              return (
                <div key={it.id} className="p-4 border border-border rounded-lg space-y-3 bg-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 grid sm:grid-cols-2 gap-3">
                      <Input
                        placeholder={`Désignation #${idx + 1}`}
                        value={it.designation}
                        onChange={(e) => update(it.id, { designation: e.target.value })}
                      />
                      <Input
                        placeholder="Fonctionnalité"
                        value={it.fonctionnalite}
                        onChange={(e) => update(it.id, { fonctionnalite: e.target.value })}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => remove(it.id)} aria-label="Supprimer">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-[1fr_repeat(5,1fr)] gap-2 items-end text-xs">
                    <div>
                      <label className="text-muted-foreground">Prix unitaire (DZD)</label>
                      <Input
                        type="number"
                        value={it.prixUnitaire}
                        onChange={(e) => update(it.id, { prixUnitaire: Number(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                    {labels.map((y, yi) => (
                      <div key={y}>
                        <label className="text-muted-foreground">Qté {y}</label>
                        <Input
                          type="number"
                          value={it.quantites[yi]}
                          onChange={(e) => {
                            const next = [...it.quantites];
                            next[yi] = Number(e.target.value) || 0;
                            update(it.id, { quantites: next });
                          }}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Total équipement : <span className="font-medium text-foreground">{dzd(total)}</span></p>
                </div>
              );
            })}
            <Button variant="outline" onClick={add} className="w-full"><Plus className="h-4 w-4 mr-2" />Ajouter un équipement</Button>
          </div>
        )}
      </Section>

      <div className="flex justify-end">
        <p className="text-sm">CAPEX total sur 5 ans : <span className="font-semibold text-primary">{dzd(totalCapex)}</span></p>
      </div>

      <StepNav prev="/plan/hypotheses" next="/plan/chiffre-affaires" onNext={() => markComplete('investissement', items.length > 0)} />
    </FormShell>
  );
}