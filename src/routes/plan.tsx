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
import { BrandHeader } from '@/components/brand/brand-header';
import { cn } from '@/lib/utils';

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
  const completedCount = STEPS.filter((s) => completed[s.key]).length;

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-border/60">
        <SidebarHeader className="border-b border-border/60 p-3 group-data-[collapsible=icon]:p-2">
          <div className="group-data-[collapsible=icon]:hidden">
            <BrandHeader variant="compact" />
          </div>
          <div className="hidden group-data-[collapsible=icon]:flex justify-center">
            <BrandHeader variant="compact" hideText />
          </div>
        </SidebarHeader>
        <SidebarContent>
          {groups.map((g) => (
            <SidebarGroup key={g}>
              <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider">
                {g}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {STEPS.filter((s) => s.group === g).map((s) => {
                    const active = location.pathname === s.to;
                    const done = !!completed[s.key];
                    const Icon = s.icon;
                    return (
                      <SidebarMenuItem key={s.key}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={s.label}
                          className={cn(done && !active && 'text-foreground')}
                        >
                          <Link to={s.to}>
                            <Icon className="h-4 w-4" />
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
          ))}
        </SidebarContent>
        <SidebarFooter className="border-t border-border/60 p-3 group-data-[collapsible=icon]:hidden">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium tabular-nums">{completedCount} / {STEPS.length}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(completedCount / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background">
        {/* Top header */}
        <header className="border-b border-border/60 bg-card/60 backdrop-blur sticky top-0 z-20">
          <div className="px-4 py-3 flex items-center gap-3 justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <SidebarTrigger className="shrink-0" />
              <div className="hidden md:block min-w-0">
                <BrandHeader variant="compact" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Accueil</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 min-w-0">
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
