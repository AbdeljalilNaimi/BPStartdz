import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePlanStore } from '@/lib/plan-store';
import { computeBP } from '@/lib/plan-compute';
import { OverviewTab } from '@/components/bp/tabs/overview';
import { PnlTab } from '@/components/bp/tabs/pnl';
import { CashflowTab } from '@/components/bp/tabs/cashflow';
import { BfrBilanTab } from '@/components/bp/tabs/bfr-bilan';
import { RevenueTab } from '@/components/bp/tabs/revenue';
import { CapexTab } from '@/components/bp/tabs/capex';
import { PayrollTab } from '@/components/bp/tabs/payroll';
import { OpexTab } from '@/components/bp/tabs/opex';
import { AchatsDirectsTab } from '@/components/bp/tabs/achats-directs';
import { CoverPage } from '@/components/bp/cover-page';
import { exportDashboardToPDF } from '@/lib/bp-pdf-export';

export const Route = createFileRoute('/plan/etats-financiers')({
  head: () => ({ meta: [{ title: 'États financiers — Plan financier' }] }),
  component: EtatsPage,
});

const SECTIONS = [
  { key: 'overview', label: "Vue d'ensemble", render: (bp: any) => <OverviewTab bp={bp} /> },
  { key: 'pnl', label: 'P&L', render: (bp: any) => <PnlTab bp={bp} /> },
  { key: 'cashflow', label: 'TFT & Valorisation', render: (bp: any) => <CashflowTab bp={bp} /> },
  { key: 'bfr', label: 'BFR & Bilan', render: (bp: any) => <BfrBilanTab bp={bp} /> },
  { key: 'revenue', label: "Chiffre d'affaires", render: (bp: any) => <RevenueTab bp={bp} /> },
  { key: 'capex', label: 'Investissements', render: (bp: any) => <CapexTab bp={bp} /> },
  { key: 'payroll', label: 'Masse salariale', render: (bp: any) => <PayrollTab bp={bp} /> },
  { key: 'achats', label: 'Achats directs', render: (bp: any) => <AchatsDirectsTab bp={bp} /> },
  { key: 'opex', label: 'Charges externes', render: (bp: any) => <OpexTab bp={bp} /> },
] as const;

function EtatsPage() {
  const plan = usePlanStore((s) => s.plan);
  const navigate = useNavigate();
  const computed = useMemo(() => computeBP(plan), [plan]);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const hasData = plan.produits.length > 0 || plan.investissements.length > 0;

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      toast.loading('Génération du PDF en cours…', { id: 'pdf-export' });
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      if (!exportRef.current) throw new Error("Conteneur d'export introuvable");
      await exportDashboardToPDF(exportRef.current, plan.identification.intituleProjet || 'plan-financier');
      toast.success('PDF exporté avec succès', { id: 'pdf-export' });
    } catch (err) {
      console.error(err);
      toast.error("Échec de l'export PDF", { id: 'pdf-export' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Étape finale</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">États financiers</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Tous les états sont calculés automatiquement à partir de vos saisies. Modifiez n'importe quelle étape pour mettre à jour ces résultats en temps réel.
          </p>
        </div>
        <Button onClick={handleExport} disabled={exporting || !hasData}>
          {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          Exporter PDF
        </Button>
      </div>

      {!hasData ? (
        <div className="rounded-lg border border-dashed p-10 text-center bg-card">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">Vous n'avez pas encore saisi de données opérationnelles.</p>
          <Button onClick={() => navigate({ to: '/plan/investissement' })}>
            Commencer par les investissements
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <div className="overflow-x-auto -mx-4 px-4">
            <TabsList className="w-max">
              {SECTIONS.map((s) => (
                <TabsTrigger key={s.key} value={s.key}>{s.label}</TabsTrigger>
              ))}
            </TabsList>
          </div>
          {SECTIONS.map((s) => (
            <TabsContent key={s.key} value={s.key} className="mt-6">
              {s.render(computed)}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <div className="flex justify-between pt-6 border-t">
        <Button variant="ghost" onClick={() => navigate({ to: '/plan/charges-externes' })}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Précédent
        </Button>
      </div>

      {exporting && (
        <div
          ref={exportRef}
          aria-hidden
          style={{ position: 'fixed', left: '-10000px', top: 0, width: '1100px', background: '#ffffff', color: '#000000', padding: '24px' }}
        >
          <CoverPage bp={computed} sectionsIncluded={SECTIONS.length} totalSections={SECTIONS.length} />
          {SECTIONS.map((s) => (
            <div key={s.key} data-pdf-section style={{ marginBottom: 24, background: '#ffffff' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, paddingBottom: 6, borderBottom: '2px solid #ddd' }}>
                {s.label}
              </h2>
              {s.render(computed)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}