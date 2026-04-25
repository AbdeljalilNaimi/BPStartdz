import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { usePlanStore } from '@/lib/plan-store';
import { FormShell, Section } from '@/components/plan/form-shell';
import { StepNav } from './plan';
import { DEFAULT_CHARGES_LABELS } from '@/lib/plan-types';

export const Route = createFileRoute('/plan/charges-externes')({
  head: () => ({ meta: [{ title: 'Charges externes — Plan financier' }] }),
  component: ChargesPage,
});

function ChargesPage() {
  const items = usePlanStore((s) => s.plan.chargesExternes);
  const add = usePlanStore((s) => s.addChargeExterne);
  const update = usePlanStore((s) => s.updateChargeExterne);
  const remove = usePlanStore((s) => s.removeChargeExterne);
  const markComplete = usePlanStore((s) => s.markComplete);

  const usedLabels = new Set(items.map((i) => i.label));
  const presets = DEFAULT_CHARGES_LABELS.filter((l) => !usedLabels.has(l));

  return (
    <FormShell
      step={7}
      title="Charges externes"
      description="Loyers, marketing, honoraires, télécom… Ajoutez uniquement les postes pertinents avec leur montant Année 1 et leur croissance annuelle."
    >
      <Section>
        {items.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">Aucune charge renseignée</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((c) => (
              <div key={c.id} className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_120px_auto] items-center gap-3 p-3 border rounded-md bg-card">
                <Input value={c.label} onChange={(e) => update(c.id, { label: e.target.value })} className="font-medium" />
                <div className="relative">
                  <Input
                    type="number"
                    value={c.montantAnnuelAnnee1}
                    onChange={(e) => update(c.id, { montantAnnuelAnnee1: Number(e.target.value) || 0 })}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">DZD/an</span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.5"
                    value={(c.croissanceAnnuelle * 100).toFixed(1)}
                    onChange={(e) => update(c.id, { croissanceAnnuelle: (Number(e.target.value) || 0) / 100 })}
                    className="pr-7"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%/an</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((label) => (
              <Button key={label} variant="outline" size="sm" onClick={() => add(label)}>
                <Plus className="h-3 w-3 mr-1" /> {label}
              </Button>
            ))}
            <Button size="sm" onClick={() => add('Nouvelle charge')}>
              <Plus className="h-3 w-3 mr-1" /> Charge personnalisée
            </Button>
          </div>
        </div>
      </Section>

      <StepNav prev="/plan/masse-salariale" next="/plan/etats-financiers" onNext={() => markComplete('charges-externes', true)} />
    </FormShell>
  );
}