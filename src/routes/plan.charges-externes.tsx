import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { usePlanStore } from '@/lib/plan-store';
import { FormShell, Section } from '@/components/plan/form-shell';
import { StepNav } from './plan';
import { fyHorizonLabels } from '@/lib/bp-types';

export const Route = createFileRoute('/plan/charges-externes')({
  head: () => ({ meta: [{ title: 'Charges externes — Plan financier' }] }),
  component: ChargesPage,
});

function ChargesPage() {
  const items = usePlanStore((s) => s.plan.chargesExternes);
  const update = usePlanStore((s) => s.updateChargeExterne);
  const markComplete = usePlanStore((s) => s.markComplete);
  const years = fyHorizonLabels();

  return (
    <FormShell
      wide
      step={7}
      title="Charges externes"
      description="Nomenclature SCF du canevas ASF : 14 postes, montants en DZD pour N-1 (2025) et 2026–2030."
    >
      <Section>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[720px]">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left font-medium pb-2 pr-3">Poste SCF</th>
                {years.map((y, i) => (
                  <th key={y} className="text-right font-medium pb-2 px-1">
                    {y}{i === 0 ? ' N-1' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="py-2 pr-3 font-medium">{c.label}</td>
                  {years.map((y, yi) => (
                    <td key={y} className="py-1 px-1">
                      <Input
                        type="number"
                        value={c.montants[yi] ?? 0}
                        onChange={(e) => {
                          const next = [...c.montants];
                          next[yi] = Number(e.target.value) || 0;
                          update(c.id, { montants: next });
                        }}
                        className="h-8 text-right"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <StepNav prev="/plan/masse-salariale" next="/plan/commentaires" onNext={() => markComplete('charges-externes', true)} />
    </FormShell>
  );
}
