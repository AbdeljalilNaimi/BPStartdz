import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { usePlanStore } from '@/lib/plan-store';
import { FormShell, Section, Field } from '@/components/plan/form-shell';
import { StepNav } from './plan';

export const Route = createFileRoute('/plan/identification')({
  head: () => ({ meta: [{ title: 'Identification du projet — Plan financier' }] }),
  component: IdentificationPage,
});

function IdentificationPage() {
  const id = usePlanStore((s) => s.plan.identification);
  const set = usePlanStore((s) => s.setIdentification);
  const markComplete = usePlanStore((s) => s.markComplete);

  const handleNext = () => {
    const valid =
      id.etablissement.trim() &&
      id.faculte.trim() &&
      id.departement.trim() &&
      id.intituleProjet.trim() &&
      id.anneeReference > 1900;
    markComplete('identification', !!valid);
  };

  return (
    <FormShell
      step={1}
      title="Identification du Projet"
      description="Renseignez les informations de base sur l'institution, le porteur et l'intitulé du projet."
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
      </Section>

      <Section title="Porteur de projet">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nom">
            <Input value={id.porteurNom} onChange={(e) => set('porteurNom', e.target.value)} placeholder="Ex. Benali" />
          </Field>
          <Field label="Prénom">
            <Input value={id.porteurPrenom} onChange={(e) => set('porteurPrenom', e.target.value)} placeholder="Ex. Amira" />
          </Field>
        </div>
      </Section>

      <Section title="Projet">
        <Field label="Intitulé du projet">
          <Input value={id.intituleProjet} onChange={(e) => set('intituleProjet', e.target.value)} placeholder="Ex. Plateforme e-learning régionale" />
        </Field>
        <Field label="Année de référence" hint="Première année d'opération du business plan.">
          <Input
            type="number"
            value={id.anneeReference}
            onChange={(e) => set('anneeReference', Number(e.target.value) || 2026)}
            className="max-w-[180px]"
          />
        </Field>
      </Section>

      <StepNav next="/plan/hypotheses" onNext={handleNext} />
    </FormShell>
  );
}