import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { ParsedBP } from '@/lib/bp-types';
import { FY_LABELS_6 } from '@/lib/bp-types';
import { dzd, isNum } from '@/lib/bp-format';
import { EmptyState } from '../empty-state';
import { PALETTE } from '../charts/chart-theme';

const fmtAxis = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
};

export function OpexTab({ bp }: { bp: ParsedBP }) {
  const ce = bp.chargesExternes;
  if (!ce) return <EmptyState />;

  const stackedData = FY_LABELS_6.map((y, yi) => {
    const row: Record<string, string | number> = { year: y };
    ce.items.forEach(item => {
      row[item.label] = item.values[yi] ?? 0;
    });
    return row;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Charges externes (DZD)</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Catégorie</TableHead>
                {FY_LABELS_6.map(y => <TableHead key={y} className="text-right">{y}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ce.items.map(item => {
                const hasValue = item.values.some(v => isNum(v) && v !== 0);
                return (
                  <TableRow key={item.label} className={hasValue ? '' : 'text-muted-foreground'}>
                    <TableCell>{item.label}</TableCell>
                    {item.values.map((v, i) => <TableCell key={i} className="text-right tabular-nums">{dzd(v)}</TableCell>)}
                  </TableRow>
                );
              })}
              <TableRow className="font-semibold bg-muted/30">
                <TableCell>Total</TableCell>
                {ce.totals.map((v, i) => <TableCell key={i} className="text-right tabular-nums">{dzd(v)}</TableCell>)}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Composition des charges externes</CardTitle></CardHeader>
        <CardContent>
          <div className="w-full h-96">
            <ResponsiveContainer>
              <BarChart data={stackedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={fmtAxis} />
                <Tooltip
                  contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                  formatter={(v, n) => [dzd(v as number), n]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {ce.items.map((item, i) => (
                  <Bar key={item.label} dataKey={item.label} stackId="a" fill={PALETTE[i % PALETTE.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
