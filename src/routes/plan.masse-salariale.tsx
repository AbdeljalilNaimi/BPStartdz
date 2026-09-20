import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { usePlanStore } from '@/lib/plan-store';
import { FormShell, Section } from '@/components/plan/form-shell';
import { StepNav } from './plan';
import { fyHorizonLabels } from '@/lib/bp-types';
import { dzd } from '@/lib/bp-format';
import { MAX_POSTES, computePayrollLine } from '@/lib/payroll';

export const Route = createFileRoute('/plan/masse-salariale')({
  head: () => ({ meta: [{ title: 'Masse salariale — Plan financier' }] }),
  component: PayrollPage,
});

function PayrollPage() {
  const postes = usePlanStore((s) => s.plan.postes);
  const add = usePlanStore((s) => s.addPoste);
  const update = usePlanStore((s) => s.updatePoste);
  const remove = usePlanStore((s) => s.removePoste);
  const markComplete = usePlanStore((s) => s.markComplete);
  const labels = fyHorizonLabels();

  return (
    <FormShell
      wide
      step={6}
      title="Masse salariale"
      description="Formule légale ASF : CNAS salariale 9 %, CNAS patronale 26 %, IRG au barème progressif. Aucun taux forfaitaire. Jusqu'à 27 postes."
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
              const pay = computePayrollLine(p);
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
                      <label className="text-muted-foreground">Indemnités mensuelles</label>
                      <Input type="number" value={p.indemniteMensuelle} onChange={(e) => update(p.id, { indemniteMensuelle: Number(e.target.value) || 0 })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-muted-foreground">Prime panier / transport</label>
                      <Input type="number" value={p.primePanierTransport} onChange={(e) => update(p.id, { primePanierTransport: Number(e.target.value) || 0 })} className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-muted/40 rounded-md p-3">
                    <p>CNAS salariale (9 %) : <span className="font-medium">{dzd(pay.cnasSalariale)}</span></p>
                    <p>CNAS patronale (26 %) : <span className="font-medium">{dzd(pay.cnasPatronale)}</span></p>
                    <p>IRG : <span className="font-medium">{dzd(pay.irg)}</span></p>
                    <p>Net mensuel : <span className="font-medium">{dzd(pay.salaireNet)}</span></p>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                    {labels.map((y, yi) => (
                      <div key={y}>
                        <label className="text-muted-foreground">ETP {y}{yi === 0 ? ' (N-1)' : ''}</label>
                        <Input type="number" step="0.5" value={p.etp[yi] ?? 0} onChange={(e) => {
                          const next = [...p.etp];
                          next[yi] = Number(e.target.value) || 0;
                          update(p.id, { etp: next });
                        }} className="mt-1" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Salaire chargé annuel par ETP : <span className="font-medium text-foreground">{dzd(pay.salaireChargeAnnuelUnitaire)}</span>
                  </p>
                </div>
              );
            })}
            {postes.length < MAX_POSTES ? (
              <Button variant="outline" onClick={add} className="w-full"><Plus className="h-4 w-4 mr-2" />Ajouter un poste ({postes.length}/{MAX_POSTES})</Button>
            ) : (
              <p className="text-xs text-muted-foreground text-center">Plafond ASF atteint : {MAX_POSTES} postes.</p>
            )}
          </div>
        )}
      </Section>

      <StepNav prev="/plan/achats" next="/plan/charges-externes" onNext={() => markComplete('masse-salariale', postes.length > 0)} />
    </FormShell>
  );
}
