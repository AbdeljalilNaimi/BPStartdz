import { createFileRoute, Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Check, Home } from 'lucide-react';
import { usePlanStore } from '@/lib/plan-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/plan')({
  head: () => ({
    meta: [
      { title: 'Construire un plan financier' },
      { name: 'description', content: 'Parcours guidé pour construire un Business Plan financier complet.' },
    ],
  }),
  component: PlanLayout,
});

export const STEPS: { key: string; to: string; label: string; group: string }[] = [
  { key: 'identification', to: '/plan/identification', label: 'Identification du projet', group: 'Informations' },
  { key: 'hypotheses', to: '/plan/hypotheses', label: 'Hypothèses de base', group: 'Informations' },
  { key: 'investissement', to: '/plan/investissement', label: 'Investissements', group: 'Données opérationnelles' },
  { key: 'chiffre-affaires', to: '/plan/chiffre-affaires', label: "Chiffre d'affaires", group: 'Données opérationnelles' },
  { key: 'achats', to: '/plan/achats', label: 'Achats directs', group: 'Données opérationnelles' },
  { key: 'masse-salariale', to: '/plan/masse-salariale', label: 'Masse salariale', group: 'Données opérationnelles' },
  { key: 'charges-externes', to: '/plan/charges-externes', label: 'Charges externes', group: 'Données opérationnelles' },
  { key: 'etats-financiers', to: '/plan/etats-financiers', label: 'États financiers', group: 'Résultats' },
];

function PlanLayout() {
  const location = useLocation();
  const completed = usePlanStore((s) => s.plan.completed);
  const navigate = useNavigate();

  const groups = Array.from(new Set(STEPS.map((s) => s.group)));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border/60 bg-card/60 backdrop-blur sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3 justify-between">
          <button
            type="button"
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Accueil</span>
          </button>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-muted-foreground">Plan financier</span>
          </div>
          <div className="w-20" />
        </div>

        {/* Mobile horizontal stepper */}
        <div className="lg:hidden border-t border-border/60 overflow-x-auto">
          <div className="flex gap-1 px-2 py-2 min-w-max">
            {STEPS.map((s, i) => {
              const active = location.pathname === s.to;
              const done = !!completed[s.key];
              return (
                <Link
                  key={s.key}
                  to={s.to}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-full whitespace-nowrap border transition-colors',
                    active ? 'bg-primary text-primary-foreground border-primary' : done ? 'bg-accent border-border' : 'bg-card border-border text-muted-foreground'
                  )}
                >
                  {i + 1}. {s.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-6 grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 space-y-6">
            {groups.map((g) => (
              <div key={g}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">{g}</p>
                <ul className="space-y-0.5">
                  {STEPS.filter((s) => s.group === g).map((s) => {
                    const active = location.pathname === s.to;
                    const done = !!completed[s.key];
                    return (
                      <li key={s.key}>
                        <Link
                          to={s.to}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                            active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-foreground'
                          )}
                        >
                          <span
                            className={cn(
                              'h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0 border',
                              active ? 'border-primary-foreground/50 bg-primary-foreground/20' : done ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card text-muted-foreground'
                            )}
                          >
                            {done && !active ? <Check className="h-3 w-3" /> : <span>•</span>}
                          </span>
                          <span className="truncate">{s.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function StepNav({ prev, next, onNext }: { prev?: string; next?: string; onNext?: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between items-center pt-6 mt-8 border-t border-border/60">
      {prev ? (
        <Button variant="ghost" onClick={() => navigate({ to: prev })}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Précédent
        </Button>
      ) : <div />}
      {next && (
        <Button
          onClick={() => {
            onNext?.();
            navigate({ to: next });
          }}
        >
          Suivant →
        </Button>
      )}
    </div>
  );
}