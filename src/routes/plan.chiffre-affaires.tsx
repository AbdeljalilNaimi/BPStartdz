import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { usePlanStore } from '@/lib/plan-store';
import { FormShell, Section } from '@/components/plan/form-shell';
import { StepNav } from './plan';
import { fyLabels } from '@/lib/bp-types';
import { dzd } from '@/lib/bp-format';

export const Route = createFileRoute('/plan/chiffre-affaires')({
  head: () => ({ meta: [{ title: "Chiffre d'affaires — Plan financier" }] }),
  component: CAPage,
});

function CAPage() {
  const produits = usePlanStore((s) => s.plan.produits);
  const startYear = usePlanStore((s) => s.plan.hypotheses.anneeDebut);
  const add = usePlanStore((s) => s.addProduit);
  const update = usePlanStore((s) => s.updateProduit);
  const remove = usePlanStore((s) => s.removeProduit);
  const markComplete = usePlanStore((s) => s.markComplete);

  const labels = fyLabels(startYear, 5);

  return (
    <FormShell
      step={4}
      title="Chiffre d'affaires"
      description="Listez vos produits ou services. Pour chacun, indiquez le volume mensuel de la 1re année, le prix unitaire et la croissance annuelle."
    >
      <Section>
        {produits.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">Aucun produit renseigné</p>
            <Button onClick={add}><Plus className="h-4 w-4 mr-2" />Ajouter un produit</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {produits.map((p) => {
              const ca1 = p.volumeMensuelAnnee1 * p.prixUnitaire * 12;
              return (
                <div key={p.id} className="p-4 border border-border rounded-lg space-y-3 bg-card">
                  <div className="flex items-start gap-3">
                    <Input
                      placeholder="Nom du produit"
                      value={p.nom}
                      onChange={(e) => update(p.id, { nom: e.target.value })}
                      className="flex-1 font-medium"
                    />
                    <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-muted-foreground">Volume mensuel ({labels[0]})</label>
                      <Input type="number" value={p.volumeMensuelAnnee1} onChange={(e) => update(p.id, { volumeMensuelAnnee1: Number(e.target.value) || 0 })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-muted-foreground">Prix unitaire (DZD)</label>
                      <Input type="number" value={p.prixUnitaire} onChange={(e) => update(p.id, { prixUnitaire: Number(e.target.value) || 0 })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-muted-foreground">% coût direct / CA</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={(p.coutDirectRatio * 100).toFixed(1)}
                        onChange={(e) => update(p.id, { coutDirectRatio: (Number(e.target.value) || 0) / 100 })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {[1, 2, 3, 4].map((yi) => (
                      <div key={yi}>
                        <label className="text-muted-foreground">Croissance {labels[yi]}</label>
                        <div className="relative mt-1">
                          <Input
                            type="number"
                            step="0.5"
                            value={(p.croissance[yi - 1] * 100).toFixed(1)}
                            onChange={(e) => {
                              const next = [...p.croissance];
                              next[yi - 1] = (Number(e.target.value) || 0) / 100;
                              update(p.id, { croissance: next });
                            }}
                            className="pr-7"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">CA {labels[0]} : <span className="font-medium text-foreground">{dzd(ca1)}</span></p>
                </div>
              );
            })}
            <Button variant="outline" onClick={add} className="w-full"><Plus className="h-4 w-4 mr-2" />Ajouter un produit</Button>
          </div>
        )}
      </Section>

      <StepNav prev="/plan/investissement" next="/plan/achats" onNext={() => markComplete('chiffre-affaires', produits.length > 0)} />
    </FormShell>
  );
}