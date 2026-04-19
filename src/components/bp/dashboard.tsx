import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Moon, Sun, FileSpreadsheet, Upload, AlertCircle, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ParsedBP } from '@/lib/bp-types';
import { OverviewTab } from './tabs/overview';
import { PnlTab } from './tabs/pnl';
import { CapexTab } from './tabs/capex';
import { PayrollTab } from './tabs/payroll';
import { RevenueTab } from './tabs/revenue';
import { OpexTab } from './tabs/opex';
import { BfrBilanTab } from './tabs/bfr-bilan';
import { CashflowTab } from './tabs/cashflow';
import { AchatsDirectsTab } from './tabs/achats-directs';
import { HypothesesTab } from './tabs/hypotheses';
import { exportDashboardToPDF } from '@/lib/bp-pdf-export';

interface Props {
  bp: ParsedBP;
  onReset: () => void;
}

const SECTIONS: { key: string; label: string; render: (bp: ParsedBP) => React.ReactNode }[] = [
  { key: 'overview', label: "Vue d'ensemble", render: (bp) => <OverviewTab bp={bp} /> },
  { key: 'pnl', label: 'P&L', render: (bp) => <PnlTab bp={bp} /> },
  { key: 'capex', label: 'Investissements', render: (bp) => <CapexTab bp={bp} /> },
  { key: 'payroll', label: 'Masse salariale', render: (bp) => <PayrollTab bp={bp} /> },
  { key: 'revenue', label: "Chiffre d'affaires", render: (bp) => <RevenueTab bp={bp} /> },
  { key: 'achats', label: 'Achats directs', render: (bp) => <AchatsDirectsTab bp={bp} /> },
  { key: 'opex', label: 'Charges externes', render: (bp) => <OpexTab bp={bp} /> },
  { key: 'bfr', label: 'BFR & Bilan', render: (bp) => <BfrBilanTab bp={bp} /> },
  { key: 'cashflow', label: 'TFT & Valorisation', render: (bp) => <CashflowTab bp={bp} /> },
  { key: 'hypotheses', label: 'Hypothèses', render: (bp) => <HypothesesTab bp={bp} /> },
];

export function Dashboard({ bp, onReset }: Props) {
  const [dark, setDark] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    return () => document.documentElement.classList.remove('dark');
  }, [dark]);

  const uploadedAt = bp.uploadedAt.toLocaleString('fr-FR', {
    dateStyle: 'short', timeStyle: 'short',
  });

  const handleExport = async () => {
    if (!exportRef.current || exporting) return;
    setExporting(true);
    const wasDark = document.documentElement.classList.contains('dark');
    if (wasDark) document.documentElement.classList.remove('dark');
    try {
      toast.loading('Génération du PDF en cours…', { id: 'pdf-export' });
      await exportDashboardToPDF(exportRef.current, bp.fileName);
      toast.success('PDF exporté avec succès', { id: 'pdf-export' });
    } catch (err) {
      console.error(err);
      toast.error("Échec de l'export PDF", { id: 'pdf-export' });
    } finally {
      if (wasDark) document.documentElement.classList.add('dark');
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <FileSpreadsheet className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h1 className="font-semibold truncate text-sm sm:text-base">{bp.fileName}</h1>
              <p className="text-xs text-muted-foreground">
                {bp.fiscalYears.join(' · ')} · Chargé le {uploadedAt}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Exporter PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDark(d => !d)} aria-label="Basculer thème">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={onReset}>
              <Upload className="h-4 w-4 mr-2" />
              Charger un autre fichier
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {bp.warnings.length > 0 && (
          <div className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 flex gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Feuilles manquantes ou illisibles :</p>
              <p className="text-amber-700 dark:text-amber-300">{bp.warnings.join(' · ')}</p>
            </div>
          </div>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <div className="overflow-x-auto -mx-4 px-4">
            <TabsList className="w-max">
              {SECTIONS.map(s => (
                <TabsTrigger key={s.key} value={s.key}>{s.label}</TabsTrigger>
              ))}
            </TabsList>
          </div>
          {SECTIONS.map(s => (
            <TabsContent key={s.key} value={s.key} className="mt-6">{s.render(bp)}</TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Hidden export container — renders all tabs stacked for PDF capture */}
      {exporting && (
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
            padding: '24px',
          }}
        >
          <div data-pdf-section style={{ marginBottom: 16, padding: 16, background: '#ffffff' }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{bp.fileName}</h1>
            <p style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
              {bp.fiscalYears.join(' · ')} · Exporté le {new Date().toLocaleString('fr-FR')}
            </p>
          </div>
          {SECTIONS.map(s => (
            <div key={s.key} data-pdf-section style={{ marginBottom: 24, background: '#ffffff' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, paddingBottom: 6, borderBottom: '2px solid #ddd' }}>
                {s.label}
              </h2>
              {s.render(bp)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
