import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePlanStore } from '@/lib/plan-store';
import { FormShell, Section, Field } from '@/components/plan/form-shell';
import { StepNav } from './plan';
import { DEFAULT_START_YEAR, N_MINUS_1_YEAR } from '@/lib/bp-types';

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

function NumInput({ value, onChange, suffix, max, readOnly }: { value: number; onChange?: (v: number) => void; suffix?: string; max?: string; readOnly?: boolean }) {
  return (
    <div className="relative" style={{ maxWidth: max ?? '180px' }}>
      <Input
        type="number"
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(Number(e.target.value) || 0)}
        className={`${suffix ? 'pr-12' : ''} ${readOnly ? 'bg-muted' : ''}`}
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
    </div>
  );
}

function HypothesesPage() {
  const h = usePlanStore((s) => s.plan.hypotheses);
  const set = usePlanStore((s) => s.setHypothese);
  const setId = usePlanStore((s) => s.setIdentification);
  const markComplete = usePlanStore((s) => s.markComplete);

  return (
    <FormShell
      step={2}
      title="Hypothèses de base"
      description="Ces paramètres alimentent l'ensemble des calculs : amortissement, fiscalité, BFR, valorisation DCF."
    >
      <Section title="Période">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Année 01 (N)" hint={`Canevas ASF verrouillé : N-1 = ${N_MINUS_1_YEAR}, horizon ${DEFAULT_START_YEAR}–2030.`}>
            <NumInput value={DEFAULT_START_YEAR} readOnly />
          </Field>
          <Field label="Durée d'amortissement (années)">
            <NumInput value={h.dureeAmortissement} onChange={(v) => set('dureeAmortissement', v)} suffix="ans" />
          </Field>
        </div>
      </Section>

      <Section title="Fiscalité & valorisation">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Taux IBS (impôt sur les sociétés)"><PctInput value={h.tauxIBS} onChange={(v) => set('tauxIBS', v)} /></Field>
          <Field label="Taux d'actualisation (r)" hint="Défaut ASF : 15 %.">
            <PctInput value={h.tauxActualisation} onChange={(v) => set('tauxActualisation', v)} />
          </Field>
          <Field label="Croissance perpétuelle (g)" hint="Défaut ASF : 2,5 %.">
            <PctInput value={h.terminalGrowth} onChange={(v) => set('terminalGrowth', v)} />
          </Field>
          <Field label="Inflation"><PctInput value={h.inflation} onChange={(v) => set('inflation', v)} /></Field>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Switch
            id="exo"
            checked={h.exonerationStartup}
            onCheckedChange={(v) => set('exonerationStartup', v)}
          />
          <Label htmlFor="exo">Exonération IBS startup (IBS = 0 sur 2026–2030)</Label>
        </div>
      </Section>

      <Section title="Besoin en fonds de roulement (BFR) — base 360 jours">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="DSO" hint="Délai client (jours)"><NumInput value={h.dso} onChange={(v) => set('dso', v)} suffix="j" /></Field>
          <Field label="DPO" hint="Délai fournisseur (jours)"><NumInput value={h.dpo} onChange={(v) => set('dpo', v)} suffix="j" /></Field>
          <Field label="DIO" hint="Rotation stocks (jours)"><NumInput value={h.dio} onChange={(v) => set('dio', v)} suffix="j" /></Field>
        </div>
      </Section>

      <Section title="Capital initial">
        <Field label="Capital social (DZD)" hint="Apport en numéraire de l'année 01 (flux de financement).">
          <NumInput value={h.capitalSocial} onChange={(v) => set('capitalSocial', v)} suffix="DZD" max="240px" />
        </Field>
      </Section>

      <StepNav
        prev="/plan/identification"
        next="/plan/investissement"
        onNext={() => {
          set('anneeDebut', DEFAULT_START_YEAR);
          setId('anneeReference', DEFAULT_START_YEAR);
          markComplete('hypotheses', true);
        }}
      />
    </FormShell>
  );
}
