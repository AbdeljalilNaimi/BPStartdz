import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { ParsedBP, Num } from '@/lib/bp-types';
import { dash, isNum, isAllZero, pct, num } from '@/lib/bp-format';
import { EmptyState } from '../empty-state';
import { PALETTE } from '../charts/chart-theme';

const FY_HYP = ['FY22', 'FY23', 'FY24', 'FY25', 'FY26', 'FY27'];

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}

function asPctRow(values: Num[]): string[] {
  // Excel often stores percent as 0.05 or 5 — accept both: > 1.5 in absolute → divide by 100.
  return values.map(v => isNum(v) ? pct(Math.abs(v) > 1.5 ? v / 100 : v) : '—');
}

export function HypothesesTab({ bp }: { bp: ParsedBP }) {
  const h = bp.hypotheses;
  if (!h) return <EmptyState />;

  const rows: { label: string; values: Num[]; format: 'num' | 'pct' | 'rate' }[] = [
    { label: 'Taux de change DA/€', values: h.tauxChange, format: 'rate' },
    { label: 'Inflation', values: h.inflation, format: 'pct' },
    { label: 'Ramp up', values: h.rampUp, format: 'pct' },
    { label: 'Évolution du CA', values: h.evolutionCa, format: 'pct' },
    { label: 'Volumes Produit 1', values: h.volumesProduit1, format: 'num' },
    { label: 'Volumes Produit 2', values: h.volumesProduit2, format: 'num' },
    { label: 'Volumes Produit 3', values: h.volumesProduit3, format: 'num' },
  ];

  const fmtCell = (v: Num, format: 'num' | 'pct' | 'rate'): string => {
    if (!isNum(v)) return '—';
    if (format === 'pct') return pct(Math.abs(v) > 1.5 ? v / 100 : v);
    if (format === 'rate') return v.toFixed(2);
    return num(v);
  };

  // Chart: macro rates over time
  const ratesData = FY_HYP.map((y, i) => ({
    year: y,
    Inflation: isNum(h.inflation[i]) ? (Math.abs(h.inflation[i]!) > 1.5 ? h.inflation[i]! : h.inflation[i]! * 100) : null,
    'Ramp up': isNum(h.rampUp[i]) ? (Math.abs(h.rampUp[i]!) > 1.5 ? h.rampUp[i]! : h.rampUp[i]! * 100) : null,
    'Évolution CA': isNum(h.evolutionCa[i]) ? (Math.abs(h.evolutionCa[i]!) > 1.5 ? h.evolutionCa[i]! : h.evolutionCa[i]! * 100) : null,
  }));

  const volumesData = FY_HYP.map((y, i) => ({
    year: y,
    'Produit 1': h.volumesProduit1[i] ?? null,
    'Produit 2': h.volumesProduit2[i] ?? null,
    'Produit 3': h.volumesProduit3[i] ?? null,
  }));

  const ratesEmpty = isAllZero([...h.inflation, ...h.rampUp, ...h.evolutionCa]);
  const volumesEmpty = isAllZero([...h.volumesProduit1, ...h.volumesProduit2, ...h.volumesProduit3]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="Année de début" value={dash(h.anneeDebut)} />
        <Kpi label="Taux de change initial (DA/€)" value={isNum(h.tauxChange[0]) ? h.tauxChange[0]!.toFixed(2) : '—'} />
        <Kpi label="Inflation moyenne" value={asPctRow(h.inflation).find(v => v !== '—') ?? '—'} />
        <Kpi label="Ramp up initial" value={asPctRow(h.rampUp).find(v => v !== '—') ?? '—'} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Hypothèses de base</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Désignation</TableHead>
                {FY_HYP.map(y => <TableHead key={y} className="text-right">{y}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => {
                const hasValue = r.values.some(v => isNum(v) && v !== 0);
                return (
                  <TableRow key={r.label} className={hasValue ? '' : 'text-muted-foreground'}>
                    <TableCell className="font-medium">{r.label}</TableCell>
                    {r.values.map((v, i) => <TableCell key={i} className="text-right tabular-nums">{fmtCell(v, r.format)}</TableCell>)}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Taux macroéconomiques (%)</CardTitle></CardHeader>
          <CardContent>
            {ratesEmpty ? <EmptyState /> : (
              <div className="w-full h-72">
                <ResponsiveContainer>
                  <LineChart data={ratesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
                    <Tooltip
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                      formatter={(v, n) => [`${(v as number).toFixed(1)}%`, n]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="Inflation" stroke={PALETTE[0]} strokeWidth={2} dot connectNulls />
                    <Line type="monotone" dataKey="Ramp up" stroke={PALETTE[1]} strokeWidth={2} dot connectNulls />
                    <Line type="monotone" dataKey="Évolution CA" stroke={PALETTE[2]} strokeWidth={2} dot connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Volumes de production</CardTitle></CardHeader>
          <CardContent>
            {volumesEmpty ? <EmptyState /> : (
              <div className="w-full h-72">
                <ResponsiveContainer>
                  <LineChart data={volumesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={(v: number) => num(v)} />
                    <Tooltip
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                      formatter={(v, n) => [num(v as number), n]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="Produit 1" stroke={PALETTE[0]} strokeWidth={2} dot connectNulls />
                    <Line type="monotone" dataKey="Produit 2" stroke={PALETTE[1]} strokeWidth={2} dot connectNulls />
                    <Line type="monotone" dataKey="Produit 3" stroke={PALETTE[2]} strokeWidth={2} dot connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
