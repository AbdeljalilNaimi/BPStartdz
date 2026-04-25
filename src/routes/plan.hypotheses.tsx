import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { usePlanStore } from '@/lib/plan-store';
import { FormShell, Section, Field } from '@/components/plan/form-shell';
import { StepNav } from './plan';

export const Route = createFileRoute('/plan/hypotheses')({
  head: () => ({ meta: [{ title: 'Hypothèses — Plan financier' }] }),
  component: HypothesesPage,
});

function PctInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="relative max-w-[160px]">
      <Input
        type="number"
        step="0.1"
        value={(value * 100).toFixed(1)}
        onChange={(e) => onChange((Number(e.target.value) || 0) / 100)}
        className="pr-8"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
    </div>
  );
}

function NumInput({ value, onChange, suffix, max }: { value: number; onChange: (v: number) => void; suffix?: string; max?: string }) {
  return (
    <div className="relative" style={{ maxWidth: max ?? '180px' }}>
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className={suffix ? 'pr-12' : ''} />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
    </div>
  );
}

function HypothesesPage() {
  const h = usePlanStore((s) => s.plan.hypotheses);
  const set = usePlanStore((s) => s.setHypothese);
  const id = usePlanStore((s) => s.plan.identification);
  const setId = usePlanStore((s) => s.setIdentification);
  const markComplete = usePlanStore((s) => s.markComplete);

  return (
    <FormShell
      step={2}
      title="Hypothèses de base"
      description="Ces paramètres alimentent l'ensemble des calculs : amortissement, fiscalité, BFR, valorisation."
    >
      <Section title="Période">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Année de début" hint="Tous les libellés FY26, FY27… sont dérivés de cette année.">
            <NumInput
              value={h.anneeDebut}
              onChange={(v) => {
                set('anneeDebut', v);
                setId('anneeReference', v);
              }}
            />
          </Field>
          <Field label="Durée d'amortissement (années)">
            <NumInput value={h.dureeAmortissement} onChange={(v) => set('dureeAmortissement', v)} suffix="ans" />
          </Field>
        </div>
        <p className="text-xs text-muted-foreground">Année de référence du projet : <span className="font-medium text-foreground">{id.anneeReference}</span></p>
      </Section>

      <Section title="Fiscalité & valorisation">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Taux IBS (impôt sur les sociétés)"><PctInput value={h.tauxIBS} onChange={(v) => set('tauxIBS', v)} /></Field>
          <Field label="Taux d'actualisation (WACC)"><PctInput value={h.tauxActualisation} onChange={(v) => set('tauxActualisation', v)} /></Field>
          <Field label="Croissance terminale"><PctInput value={h.terminalGrowth} onChange={(v) => set('terminalGrowth', v)} /></Field>
          <Field label="Inflation"><PctInput value={h.inflation} onChange={(v) => set('inflation', v)} /></Field>
        </div>
      </Section>

      <Section title="Besoin en fonds de roulement (BFR)">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="DSO" hint="Délai client (jours)"><NumInput value={h.dso} onChange={(v) => set('dso', v)} suffix="j" /></Field>
          <Field label="DPO" hint="Délai fournisseur (jours)"><NumInput value={h.dpo} onChange={(v) => set('dpo', v)} suffix="j" /></Field>
          <Field label="DIO" hint="Couverture stock (jours)"><NumInput value={h.dio} onChange={(v) => set('dio', v)} suffix="j" /></Field>
        </div>
      </Section>

      <Section title="Capital initial">
        <Field label="Capital social (DZD)" hint="Trésorerie de départ injectée par les fondateurs.">
          <NumInput value={h.capitalSocial} onChange={(v) => set('capitalSocial', v)} suffix="DZD" max="240px" />
        </Field>
      </Section>

      <StepNav prev="/plan/identification" next="/plan/investissement" onNext={() => markComplete('hypotheses', true)} />
    </FormShell>
  );
}