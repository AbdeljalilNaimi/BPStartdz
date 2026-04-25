import { createFileRoute, Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  BarChart3,
  Building2,
  Home,
  IdCard,
  Receipt,
  Settings2,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePlanStore } from '@/lib/plan-store';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import logoStartDz from '@/assets/start-dz-logo.png';
import logoUdl from '@/assets/udl-logo.png';
import logoNccfiue from '@/assets/nccfiue-logo.png';

export const Route = createFileRoute('/plan')({
  head: () => ({
    meta: [
      { title: 'Construire un plan financier — BPstartdz' },
      { name: 'description', content: 'Parcours guidé pour construire un Business Plan financier complet.' },
    ],
  }),
  component: PlanLayout,
});

interface Step {
  key: string;
  to: string;
  label: string;
  group: string;
  icon: LucideIcon;
}

export const STEPS: Step[] = [
  { key: 'identification', to: '/plan/identification', label: 'Identification du projet', group: 'Informations', icon: IdCard },
  { key: 'hypotheses', to: '/plan/hypotheses', label: 'Hypothèses de base', group: 'Informations', icon: Settings2 },
  { key: 'investissement', to: '/plan/investissement', label: 'Investissements', group: 'Données opérationnelles', icon: Building2 },
  { key: 'chiffre-affaires', to: '/plan/chiffre-affaires', label: "Chiffre d'affaires", group: 'Données opérationnelles', icon: TrendingUp },
  { key: 'achats', to: '/plan/achats', label: 'Achats directs', group: 'Données opérationnelles', icon: ShoppingCart },
  { key: 'masse-salariale', to: '/plan/masse-salariale', label: 'Masse salariale', group: 'Données opérationnelles', icon: Users },
  { key: 'charges-externes', to: '/plan/charges-externes', label: 'Charges externes', group: 'Données opérationnelles', icon: Receipt },
  { key: 'etats-financiers', to: '/plan/etats-financiers', label: 'États financiers', group: 'Résultats', icon: BarChart3 },
];

function PlanLayout() {
  const location = useLocation();
  const completed = usePlanStore((s) => s.plan.completed);
  const navigate = useNavigate();

  const groups = Array.from(new Set(STEPS.map((s) => s.group)));

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-border/60">
        <SidebarHeader className="border-b border-border/60 p-3 group-data-[collapsible=icon]:p-2">
          <div className="flex items-center justify-center group-data-[collapsible=icon]:py-1">
            <p className="text-xs font-bold tracking-widest text-primary group-data-[collapsible=icon]:hidden">
              ÉTAPES
            </p>
            <span className="hidden group-data-[collapsible=icon]:inline text-[10px] font-bold text-primary">
              {STEPS.length}
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {groups.map((g) => {
            const groupSteps = STEPS.filter((s) => s.group === g);
            return (
              <SidebarGroup key={g}>
                <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider">
                  {g}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {groupSteps.map((s, idxInGroup) => {
                      const globalIdx = STEPS.findIndex((x) => x.key === s.key);
                      const stepNumber = globalIdx + 1;
                      const active = location.pathname === s.to;
                      const done = !!completed[s.key];
                      const Icon = s.icon;
                      const isFirstInGroup = idxInGroup === 0;
                      const isLastInGroup = idxInGroup === groupSteps.length - 1;
                      const isLastOverall = globalIdx === STEPS.length - 1;
                      return (
                        <SidebarMenuItem key={s.key}>
                          <SidebarMenuButton
                            asChild
                            isActive={active}
                            tooltip={s.label}
                            className={cn(
                              'relative pl-1 group-data-[collapsible=icon]:pl-2',
                              done && !active && 'text-foreground',
                            )}
                          >
                            <Link to={s.to}>
                              {/* Numbered scale on the left */}
                              <span
                                className={cn(
                                  'relative flex items-center justify-center shrink-0',
                                  'h-6 w-6 rounded-full border text-[11px] font-semibold tabular-nums',
                                  'group-data-[collapsible=icon]:hidden',
                                  active
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : done
                                    ? 'bg-primary/15 text-primary border-primary/40'
                                    : 'bg-background text-muted-foreground border-border',
                                )}
                              >
                                {stepNumber}
                                {/* connector line above */}
                                {!isFirstInGroup && (
                                  <span
                                    aria-hidden
                                    className={cn(
                                      'absolute left-1/2 -translate-x-1/2 -top-3 h-3 w-px',
                                      done || active ? 'bg-primary/40' : 'bg-border',
                                    )}
                                  />
                                )}
                                {/* connector line below */}
                                {!isLastInGroup && !isLastOverall && (
                                  <span
                                    aria-hidden
                                    className={cn(
                                      'absolute left-1/2 -translate-x-1/2 -bottom-3 h-3 w-px',
                                      done ? 'bg-primary/40' : 'bg-border',
                                    )}
                                  />
                                )}
                              </span>
                              {/* Icon visible only when collapsed */}
                              <Icon className="hidden group-data-[collapsible=icon]:block h-4 w-4" />
                              <span>{s.label}</span>
                              {done && !active && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary group-data-[collapsible=icon]:hidden" />
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarContent>
        <SidebarFooter className="border-t border-border/60 p-3 group-data-[collapsible=icon]:hidden">
          <p className="text-[11px] text-muted-foreground text-center">
            BPstartdz · Modèle Financier
          </p>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background min-w-0">
        {/* Top header */}
        <header className="border-b border-border/60 bg-card/60 backdrop-blur sticky top-0 z-20">
          <div className="px-3 sm:px-4 py-2.5 flex items-center gap-3 justify-between">
            {/* Left: trigger + textual brand */}
            <div className="flex items-center gap-2 min-w-0">
              <SidebarTrigger className="shrink-0" />
              <div className="min-w-0 leading-tight hidden sm:block">
                <p className="text-sm font-bold tracking-tight truncate">BPstartdz</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  University Djilali Liabes · Modèle Financier
                </p>
              </div>
            </div>

            {/* Right: Accueil + partner logos + Start'Dz logo */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate({ to: '/' })}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="hidden md:inline">Accueil</span>
              </button>
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-border/60 opacity-80">
                <img
                  src={logoUdl}
                  alt="Université Djilali Liabes"
                  className="h-7 w-auto object-contain"
                  title="Université Djilali Liabes — Sidi Bel Abbès"
                />
                <img
                  src={logoNccfiue}
                  alt="NCCFIUE"
                  className="h-7 w-auto object-contain"
                  title="National Coordination Committee for Innovation"
                />
              </div>
              <img
                src={logoStartDz}
                alt="Start'Dz"
                className="h-9 w-auto object-contain pl-2 border-l border-border/60"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 min-w-0 w-full">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
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
