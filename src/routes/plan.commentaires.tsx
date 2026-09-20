import { createFileRoute } from '@tanstack/react-router';
import { Textarea } from '@/components/ui/textarea';
import { usePlanStore } from '@/lib/plan-store';
import { COMMENTAIRE_RUBRIQUES } from '@/lib/plan-types';
import { FormShell, Section, Field } from '@/components/plan/form-shell';
import { StepNav } from './plan';

export const Route = createFileRoute('/plan/commentaires')({
  head: () => ({ meta: [{ title: 'Commentaires ASF — Plan financier' }] }),
  component: CommentairesPage,
});

function CommentairesPage() {
  const commentaires = usePlanStore((s) => s.plan.commentaires);
  const setCommentaire = usePlanStore((s) => s.setCommentaire);
  const markComplete = usePlanStore((s) => s.markComplete);

  const filled = COMMENTAIRE_RUBRIQUES.every((r) => commentaires[r.key].trim().length > 0);

  return (
    <FormShell
      step={8}
      title="Commentaires et explications"
      description="Cinq rubriques qualitatives obligatoires du comité ASF. Elles figurent dans l'export PDF institutionnel."
    >
      {COMMENTAIRE_RUBRIQUES.map((r) => (
        <Section key={r.key} title={r.title}>
          <Field label={r.hint}>
            <Textarea
              rows={5}
              value={commentaires[r.key]}
              onChange={(e) => setCommentaire(r.key, e.target.value)}
              placeholder={r.hint}
            />
          </Field>
        </Section>
      ))}

      <StepNav
        prev="/plan/charges-externes"
        next="/plan/etats-financiers"
        onNext={() => markComplete('commentaires', filled)}
      />
    </FormShell>
  );
}
