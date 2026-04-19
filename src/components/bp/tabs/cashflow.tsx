import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { ParsedBP, Num } from '@/lib/bp-types';
import { FY_LABELS_5 } from '@/lib/bp-types';
import { dzd, pct, isNum } from '@/lib/bp-format';
import { EmptyState } from '../empty-state';
import { PALETTE } from '../charts/chart-theme';

const fmtAxis = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
};

interface TftRow { label: string; values: Num[]; isTotal?: boolean; isPct?: boolean; }

export function CashflowTab({ bp }: { bp: ParsedBP }) {
  const tft = bp.tft;
  if (!tft) return <EmptyState />;

  const rows: TftRow[] = [
    { label: 'EBITDA', values: tft.ebitda },
    { label: 'Variation BFR', values: tft.varBfr },
    { label: "BFR d'exploitation", values: tft.bfrExploitation },
    { label: 'BFR (total)', values: tft.bfrTotal },
    { label: 'IBS', values: tft.ibs },
    { label: 'Flux trésorerie exploitation', values: tft.fluxExploitation, isTotal: true },
    { label: 'CAPEX', values: tft.capex },
    { label: 'Flux trésorerie investissement', values: tft.fluxInvestissement, isTotal: true },
    { label: 'Free Cash Flow', values: tft.freeCashFlow, isTotal: true },
    { label: 'Charges financières', values: tft.chargesFin },
    { label: 'Flux trésorerie financement', values: tft.fluxFinancement, isTotal: true },
    { label: 'Net Cash Flow', values: tft.netCashFlow, isTotal: true },
    { label: 'Solde initial', values: tft.soldeInitial },
    { label: 'Solde final', values: tft.soldeFinal, isTotal: true },
    { label: "Taux d'actualisation", values: tft.tauxActualisation, isPct: true },
    { label: 'FCF actualisés', values: tft.fcfActualises },
  ];

  const npvData = FY_LABELS_5.map((y, i) => ({ year: y, FCF: tft.fcfActualises[i] ?? 0 }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Tableau des flux de trésorerie</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ligne</TableHead>
                {FY_LABELS_5.map(y => <TableHead key={y} className="text-right">{y}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.label} className={r.isTotal ? 'font-semibold bg-muted/30' : ''}>
                  <TableCell className={r.isPct ? 'text-muted-foreground italic' : ''}>{r.label}</TableCell>
                  {r.values.map((v, i) => {
                    let cls = 'text-right tabular-nums';
                    if (r.isPct) cls += ' text-primary';
                    else if (isNum(v) && v < 0) cls += ' text-destructive';
                    return (
                      <TableCell key={i} className={cls}>
                        {r.isPct ? pct(v) : dzd(v)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Valorisation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Taux d'actualisation</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{pct(tft.tauxActualisation[0])}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Terminal growth rate</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{pct(tft.terminalGrowth)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Valeur terminale</CardTitle></CardHeader>
            <CardContent><div className="text-xl font-bold">{dzd(tft.valeurTerminale)}</div></CardContent>
          </Card>
          <Card className="border-primary/40">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">NPV</CardTitle></CardHeader>
            <CardContent><div className="text-xl font-bold text-primary">{dzd(tft.npv)}</div></CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Net Cash Flows actualisés</CardTitle></CardHeader>
        <CardContent>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <BarChart data={npvData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={fmtAxis} />
                <Tooltip
                  contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                  formatter={(v) => [dzd(v as number), 'FCF actualisé']}
                />
                <Bar dataKey="FCF" fill={PALETTE[0]} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
