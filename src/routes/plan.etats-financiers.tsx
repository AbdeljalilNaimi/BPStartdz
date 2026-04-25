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
import { exportProfessionalPDF } from '@/lib/bp-pdf-export-pro';
import { PdfExportDialog } from '@/components/plan/pdf-export-dialog';
import type { ParsedBP } from '@/lib/bp-types';

export const Route = createFileRoute('/plan/etats-financiers')({
  head: () => ({ meta: [{ title: 'États financiers — BPstartdz' }] }),
  component: EtatsPage,
});

const SECTIONS: { key: string; label: string; render: (bp: ParsedBP) => React.ReactNode }[] = [
  { key: 'overview', label: "Vue d'ensemble", render: (bp) => <OverviewTab bp={bp} /> },
  { key: 'pnl', label: 'Compte de résultat (P&L)', render: (bp) => <PnlTab bp={bp} /> },
  { key: 'cashflow', label: 'Tableau des flux & Valorisation', render: (bp) => <CashflowTab bp={bp} /> },
  { key: 'bfr', label: 'BFR & Bilan', render: (bp) => <BfrBilanTab bp={bp} /> },
  { key: 'revenue', label: "Chiffre d'affaires", render: (bp) => <RevenueTab bp={bp} /> },
  { key: 'capex', label: 'Investissements', render: (bp) => <CapexTab bp={bp} /> },
  { key: 'payroll', label: 'Masse salariale', render: (bp) => <PayrollTab bp={bp} /> },
  { key: 'achats', label: 'Achats directs', render: (bp) => <AchatsDirectsTab bp={bp} /> },
  { key: 'opex', label: 'Charges externes', render: (bp) => <OpexTab bp={bp} /> },
];

function EtatsPage() {
  const plan = usePlanStore((s) => s.plan);
  const navigate = useNavigate();
  const computed = useMemo(() => computeBP(plan), [plan]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [renderKeys, setRenderKeys] = useState<string[]>([]);
  const exportRef = useRef<HTMLDivElement>(null);

  const hasData = plan.produits.length > 0 || plan.investissements.length > 0;

  const handleConfirm = async (selectedKeys: string[], fileName: string) => {
    if (exporting) return;
    setExporting(true);
    setRenderKeys(selectedKeys);
    try {
      toast.loading('Génération du PDF en cours…', { id: 'pdf-export' });
      // wait for the hidden export container (re-rendered with selected sections) to mount
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      await new Promise((r) => setTimeout(r, 200));
      if (!exportRef.current) throw new Error("Conteneur d'export introuvable");
      await exportProfessionalPDF({
        bp: computed,
        plan,
        fileName: fileName || plan.identification.intituleProjet || 'plan-financier',
        container: exportRef.current,
      });
      toast.success('PDF exporté avec succès', { id: 'pdf-export' });
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Échec de l'export PDF", { id: 'pdf-export' });
    } finally {
      setExporting(false);
      setRenderKeys([]);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Étape finale</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">États financiers</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Tous les états sont calculés automatiquement à partir de vos saisies. Modifiez n'importe quelle étape pour mettre à jour ces résultats en temps réel.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} disabled={!hasData}>
          <Download className="h-4 w-4 mr-2" />
          Exporter en PDF
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

      <PdfExportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sections={SECTIONS.map(({ key, label }) => ({ key, label }))}
        defaultFileName={plan.identification.intituleProjet || 'plan-financier'}
        exporting={exporting}
        onConfirm={handleConfirm}
      />

      {/* Hidden export container */}
      {exporting && renderKeys.length > 0 && (
        <div
          ref={exportRef}
          aria-hidden
          style={{
            position: 'fixed',
            left: '-10000px',
            top: 0,
            width: '1100px',
            background: '#ffffff',
            color: '#000000',
            padding: '0',
          }}
        >
          {SECTIONS.filter((s) => renderKeys.includes(s.key)).map((s) => (
            <div
              key={s.key}
              data-pdf-section
              data-pdf-label={s.label}
              style={{ background: '#ffffff', padding: '8px 16px' }}
            >
              {s.render(computed)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
