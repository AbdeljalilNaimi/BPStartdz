import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FY_LABELS_6 } from '@/lib/bp-types';
import type { ParsedBP, Num } from '@/lib/bp-types';
import { dzd, pct, isNum } from '@/lib/bp-format';
import { EmptyState } from '../empty-state';

interface PnLRow { label: string; values: Num[]; isPct?: boolean; isTotal?: boolean; isSub?: boolean; }

export function PnlTab({ bp }: { bp: ParsedBP }) {
  const [millions, setMillions] = useState(false);
  const pnl = bp.pnl;
  if (!pnl) return <EmptyState />;

  const rows: PnLRow[] = [
    { label: "Chiffre d'affaires", values: pnl.ca, isTotal: true },
    { label: 'Achats consommés', values: pnl.achats },
    { label: 'Marge brute', values: pnl.margeBrute, isSub: true },
    { label: 'Charges externes', values: pnl.chargesExternes },
    { label: 'Salaires et charges sociales', values: pnl.salaires },
    { label: 'EBITDA', values: pnl.ebitda, isSub: true },
    { label: 'Amortissements et provisions', values: pnl.amortissements },
    { label: 'Reprise sur provisions', values: pnl.reprises },
    { label: 'EBIT', values: pnl.ebit, isSub: true },
    { label: 'Charges financières', values: pnl.chargesFin },
    { label: 'Résultat avant impôts', values: pnl.resultatAvantImpots, isSub: true },
    { label: 'Impôts sur les sociétés', values: pnl.impots },
    { label: 'Résultat net', values: pnl.resultatNet, isTotal: true },
    { label: 'Tx de marge brute', values: pnl.txMargeBrute, isPct: true },
    { label: "Tx d'EBITDA", values: pnl.txEbitda, isPct: true },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Label htmlFor="millions" className="text-sm">Afficher en millions</Label>
        <Switch id="millions" checked={millions} onCheckedChange={setMillions} />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Compte de résultat (DZD)</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Ligne</TableHead>
                {FY_LABELS_6.map(y => <TableHead key={y} className="text-right">{y}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.label} className={r.isTotal ? 'font-semibold bg-muted/30' : r.isSub ? 'font-medium' : ''}>
                  <TableCell className={r.isPct ? 'text-muted-foreground italic' : ''}>{r.label}</TableCell>
                  {r.values.map((v, i) => {
                    let cls = 'text-right tabular-nums';
                    if (r.isPct) cls += ' text-primary';
                    else if (isNum(v) && v < 0) cls += ' text-destructive';
                    else if (isNum(v) && v > 0 && r.isTotal) cls += ' text-emerald-600 dark:text-emerald-400';
                    return (
                      <TableCell key={i} className={cls}>
                        {r.isPct ? pct(v) : dzd(v, { millions })}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
