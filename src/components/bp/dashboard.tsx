import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Moon, Sun, FileSpreadsheet, Upload, AlertCircle } from 'lucide-react';
import type { ParsedBP } from '@/lib/bp-types';
import { OverviewTab } from './tabs/overview';
import { PnlTab } from './tabs/pnl';
import { CapexTab } from './tabs/capex';
import { PayrollTab } from './tabs/payroll';
import { RevenueTab } from './tabs/revenue';
import { OpexTab } from './tabs/opex';
import { BfrBilanTab } from './tabs/bfr-bilan';
import { CashflowTab } from './tabs/cashflow';

interface Props {
  bp: ParsedBP;
  onReset: () => void;
}

export function Dashboard({ bp, onReset }: Props) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    return () => document.documentElement.classList.remove('dark');
  }, [dark]);

  const uploadedAt = bp.uploadedAt.toLocaleString('fr-FR', {
    dateStyle: 'short', timeStyle: 'short',
  });

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
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="pnl">P&amp;L</TabsTrigger>
              <TabsTrigger value="capex">Investissements</TabsTrigger>
              <TabsTrigger value="payroll">Masse salariale</TabsTrigger>
              <TabsTrigger value="revenue">Chiffre d'affaires</TabsTrigger>
              <TabsTrigger value="opex">Charges externes</TabsTrigger>
              <TabsTrigger value="bfr">BFR &amp; Bilan</TabsTrigger>
              <TabsTrigger value="cashflow">TFT &amp; Valorisation</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="mt-6"><OverviewTab bp={bp} /></TabsContent>
          <TabsContent value="pnl" className="mt-6"><PnlTab bp={bp} /></TabsContent>
          <TabsContent value="capex" className="mt-6"><CapexTab bp={bp} /></TabsContent>
          <TabsContent value="payroll" className="mt-6"><PayrollTab bp={bp} /></TabsContent>
          <TabsContent value="revenue" className="mt-6"><RevenueTab bp={bp} /></TabsContent>
          <TabsContent value="opex" className="mt-6"><OpexTab bp={bp} /></TabsContent>
          <TabsContent value="bfr" className="mt-6"><BfrBilanTab bp={bp} /></TabsContent>
          <TabsContent value="cashflow" className="mt-6"><CashflowTab bp={bp} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
