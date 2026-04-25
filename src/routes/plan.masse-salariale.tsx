import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { usePlanStore } from '@/lib/plan-store';
import { FormShell, Section } from '@/components/plan/form-shell';
import { StepNav } from './plan';
import { fyLabels } from '@/lib/bp-types';
import { dzd } from '@/lib/bp-format';

export const Route = createFileRoute('/plan/masse-salariale')({
  head: () => ({ meta: [{ title: 'Masse salariale — Plan financier' }] }),
  component: PayrollPage,
});

function PayrollPage() {
  const postes = usePlanStore((s) => s.plan.postes);
  const startYear = usePlanStore((s) => s.plan.hypotheses.anneeDebut);
  const add = usePlanStore((s) => s.addPoste);
  const update = usePlanStore((s) => s.updatePoste);
  const remove = usePlanStore((s) => s.removePoste);
  const markComplete = usePlanStore((s) => s.markComplete);
  const labels = fyLabels(startYear, 5);

  return (
    <FormShell
      step={6}
      title="Masse salariale"
      description="Décrivez chaque poste : salaire de base, indemnité, charges sociales et nombre d'ETP par année."
    >
      <Section>
        {postes.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">Aucun poste renseigné</p>
            <Button onClick={add}><Plus className="h-4 w-4 mr-2" />Ajouter un poste</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {postes.map((p) => {
              const annuelChargé = (p.salaireBaseMensuel + p.indemniteMensuelle) * (1 + p.chargesSocialesRatio) * 12;
              return (
                <div key={p.id} className="p-4 border rounded-lg bg-card space-y-3">
                  <div className="flex items-start gap-3">
                    <Input
                      placeholder="Intitulé du poste"
                      value={p.poste}
                      onChange={(e) => update(p.id, { poste: e.target.value })}
                      className="flex-1 font-medium"
                    />
                    <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-muted-foreground">Salaire base mensuel (DZD)</label>
                      <Input type="number" value={p.salaireBaseMensuel} onChange={(e) => update(p.id, { salaireBaseMensuel: Number(e.target.value) || 0 })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-muted-foreground">Indemnité mensuelle</label>
                      <Input type="number" value={p.indemniteMensuelle} onChange={(e) => update(p.id, { indemniteMensuelle: Number(e.target.value) || 0 })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-muted-foreground">Charges sociales %</label>
                      <div className="relative mt-1">
                        <Input type="number" step="0.5" value={(p.chargesSocialesRatio * 100).toFixed(1)} onChange={(e) => update(p.id, { chargesSocialesRatio: (Number(e.target.value) || 0) / 100 })} className="pr-7" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    {labels.map((y, yi) => (
                      <div key={y}>
                        <label className="text-muted-foreground">ETP {y}</label>
                        <Input type="number" step="0.5" value={p.etp[yi]} onChange={(e) => {
                          const next = [...p.etp];
                          next[yi] = Number(e.target.value) || 0;
                          update(p.id, { etp: next });
                        }} className="mt-1" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Salaire chargé annuel par ETP : <span className="font-medium text-foreground">{dzd(annuelChargé)}</span></p>
                </div>
              );
            })}
            <Button variant="outline" onClick={add} className="w-full"><Plus className="h-4 w-4 mr-2" />Ajouter un poste</Button>
          </div>
        )}
      </Section>

      <StepNav prev="/plan/achats" next="/plan/charges-externes" onNext={() => markComplete('masse-salariale', postes.length > 0)} />
    </FormShell>
  );
}