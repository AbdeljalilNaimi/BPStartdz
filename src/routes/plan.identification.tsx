import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { usePlanStore } from '@/lib/plan-store';
import { FormShell, Section, Field } from '@/components/plan/form-shell';
import { StepNav } from './plan';
import { DEFAULT_START_YEAR, N_MINUS_1_YEAR } from '@/lib/bp-types';

export const Route = createFileRoute('/plan/identification')({
  head: () => ({ meta: [{ title: 'Identification du projet — Plan financier' }] }),
  component: IdentificationPage,
});

function IdentificationPage() {
  const id = usePlanStore((s) => s.plan.identification);
  const set = usePlanStore((s) => s.setIdentification);
  const setH = usePlanStore((s) => s.setHypothese);
  const markComplete = usePlanStore((s) => s.markComplete);

  const handleNext = () => {
    set('anneeReference', DEFAULT_START_YEAR);
    setH('anneeDebut', DEFAULT_START_YEAR);
    const valid =
      id.etablissement.trim() &&
      id.faculte.trim() &&
      id.departement.trim() &&
      id.intituleProjet.trim();
    markComplete('identification', !!valid);
  };

  return (
    <FormShell
      step={1}
      title="Identification du Projet"
      description="Renseignez les informations de base sur l'institution, l'incubateur, le porteur et l'intitulé du projet."
    >
      <Section title="Institution académique">
        <Field label="Établissement">
          <Input value={id.etablissement} onChange={(e) => set('etablissement', e.target.value)} />
        </Field>
        <Field label="Faculté">
          <Input value={id.faculte} onChange={(e) => set('faculte', e.target.value)} />
        </Field>
        <Field label="Département">
          <Input value={id.departement} onChange={(e) => set('departement', e.target.value)} />
        </Field>
        <Field label="Incubateur" hint="Structure d'accompagnement / incubateur du projet (page de garde ASF).">
          <Input
            value={id.incubateur}
            onChange={(e) => set('incubateur', e.target.value)}
            placeholder="Ex. Incubateur universitaire"
          />
        </Field>
      </Section>

      <Section title="Porteur de projet">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nom">
            <Input value={id.porteurNom} onChange={(e) => set('porteurNom', e.target.value)} placeholder="Ex. Naimi" />
          </Field>
          <Field label="Prénom">
            <Input value={id.porteurPrenom} onChange={(e) => set('porteurPrenom', e.target.value)} placeholder="Ex. Abdeldjalil" />
          </Field>
        </div>
      </Section>

      <Section title="Projet">
        <Field label="Intitulé du projet">
          <Input value={id.intituleProjet} onChange={(e) => set('intituleProjet', e.target.value)} placeholder="Ex. Plateforme e-learning régionale" />
        </Field>
        <Field
          label="Horizon officiel ASF"
          hint={`Historique N-1 : ${N_MINUS_1_YEAR}. Années d'exploitation : ${DEFAULT_START_YEAR}–2030.`}
        >
          <Input type="number" value={DEFAULT_START_YEAR} readOnly className="max-w-[180px] bg-muted" />
        </Field>
      </Section>

      <StepNav next="/plan/hypotheses" onNext={handleNext} />
    </FormShell>
  );
}
