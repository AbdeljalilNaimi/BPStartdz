import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { usePlanStore } from '@/lib/plan-store';
import { FormShell, Section } from '@/components/plan/form-shell';
import { StepNav } from './plan';
import { fyOperatingLabels } from '@/lib/bp-types';
import { dzd } from '@/lib/bp-format';

export const Route = createFileRoute('/plan/chiffre-affaires')({
  head: () => ({ meta: [{ title: "Chiffre d'affaires — Plan financier" }] }),
  component: CAPage,
});

const MOIS = Array.from({ length: 12 }, (_, i) => `M${String(i + 1).padStart(2, '0')}`);

function CAPage() {
  const produits = usePlanStore((s) => s.plan.produits);
  const add = usePlanStore((s) => s.addProduit);
  const update = usePlanStore((s) => s.updateProduit);
  const remove = usePlanStore((s) => s.removeProduit);
  const markComplete = usePlanStore((s) => s.markComplete);
  const ops = fyOperatingLabels();

  return (
    <FormShell
      wide
      step={4}
      title="Chiffre d'affaires"
      description="Saisie mensuelle obligatoire pour 2026 (quantité × prix). Les années 2027–2030 sont des volumes annuels consolidés. La somme des 12 mois alimente l'Année 01 du P&L."
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
              const caMois = p.quantitesVenduesMois.map((q) => q * p.prixUnitaire);
              const ca1 = caMois.reduce((a, v) => a + v, 0);
              return (
                <div key={p.id} className="p-4 border border-border rounded-lg space-y-3 bg-card">
                  <div className="flex items-start gap-3">
                    <Input
                      placeholder="Nom du produit / service"
                      value={p.nom}
                      onChange={(e) => update(p.id, { nom: e.target.value })}
                      className="flex-1 font-medium"
                    />
                    <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs max-w-md">
                    <div>
                      <label className="text-muted-foreground">Prix unitaire (DZD)</label>
                      <Input type="number" value={p.prixUnitaire} onChange={(e) => update(p.id, { prixUnitaire: Number(e.target.value) || 0 })} className="mt-1" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantités vendues — 2026 (mensuel)</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 text-xs">
                    {MOIS.map((m, i) => (
                      <div key={m}>
                        <label className="text-muted-foreground">{m}</label>
                        <Input
                          type="number"
                          value={p.quantitesVenduesMois[i] ?? 0}
                          onChange={(e) => {
                            const next = [...p.quantitesVenduesMois];
                            next[i] = Number(e.target.value) || 0;
                            update(p.id, { quantitesVenduesMois: next });
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
                          value={p.quantitesVenduesAnnuelles[yi] ?? 0}
                          onChange={(e) => {
                            const next = [...p.quantitesVenduesAnnuelles];
                            next[yi] = Number(e.target.value) || 0;
                            update(p.id, { quantitesVenduesAnnuelles: next });
                          }}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    CA 2026 (somme 12 mois) : <span className="font-medium text-foreground">{dzd(ca1)}</span>
                  </p>
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
