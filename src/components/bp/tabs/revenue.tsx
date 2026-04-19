import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import type { ParsedBP } from '@/lib/bp-types';
import { FY_LABELS_5 } from '@/lib/bp-types';
import { dzd, isNum } from '@/lib/bp-format';
import { EmptyState } from '../empty-state';
import { PALETTE } from '../charts/chart-theme';

const MOIS = Array.from({ length: 12 }, (_, i) => `Mois ${String(i + 1).padStart(2, '0')}`);

const fmtAxis = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
};

export function RevenueTab({ bp }: { bp: ParsedBP }) {
  const products = bp.ca;
  if (!products || products.length === 0) return <EmptyState />;

  // Monthly table
  const monthlyData = products.map(p => ({
    name: p.name,
    months: p.monthly,
    total: p.monthly.reduce<number>((a, v) => a + (isNum(v) ? v : 0), 0),
  }));

  // Stacked bar: yearly per product (FY24..FY28 = indices 1..5)
  const stackedData = FY_LABELS_5.map((y, yi) => {
    const row: Record<string, string | number> = { year: y };
    products.forEach(p => {
      row[p.name] = p.yearly[yi + 1] ?? 0;
    });
    return row;
  });

  // Seasonality
  const seasonalData = MOIS.map((m, i) => {
    const row: Record<string, string | number> = { month: m };
    products.forEach(p => {
      row[p.name] = p.monthly[i] ?? 0;
    });
    return row;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">CA mensuel par produit — Année 01</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                {MOIS.map(m => <TableHead key={m} className="text-right">{m.replace('Mois ', 'M')}</TableHead>)}
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map(p => (
                <TableRow key={p.name}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  {p.months.map((v, i) => <TableCell key={i} className="text-right tabular-nums text-xs">{dzd(v)}</TableCell>)}
                  <TableCell className="text-right tabular-nums font-medium">{dzd(p.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">CA par produit × année</CardTitle></CardHeader>
          <CardContent>
            <div className="w-full h-80">
              <ResponsiveContainer>
                <BarChart data={stackedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={fmtAxis} />
                  <Tooltip
                    contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                    formatter={(v, n) => [dzd(v as number), n]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {products.map((p, i) => (
                    <Bar key={p.name} dataKey={p.name} stackId="a" fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Saisonnalité — Année 01</CardTitle></CardHeader>
          <CardContent>
            <div className="w-full h-80">
              <ResponsiveContainer>
                <LineChart data={seasonalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={fmtAxis} />
                  <Tooltip
                    contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                    formatter={(v, n) => [dzd(v as number), n]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {products.map((p, i) => (
                    <Line key={p.name} type="monotone" dataKey={p.name} stroke={PALETTE[i % PALETTE.length]} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
