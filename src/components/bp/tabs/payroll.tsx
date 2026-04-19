import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import type { ParsedBP } from '@/lib/bp-types';
import { dzd, num, isNum } from '@/lib/bp-format';
import { EmptyState } from '../empty-state';
import { PALETTE } from '../charts/chart-theme';

const ETP_LABELS = ['N-1', 'A01', 'A02', 'A03', 'A04', 'A05'];
const YEARS = ['Année 01', 'Année 02', 'Année 03', 'Année 04', 'Année 05'];

const fmtAxis = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
};

export function PayrollTab({ bp }: { bp: ParsedBP }) {
  const ms = bp.masseSalariale;
  if (!ms) return <EmptyState />;

  const filtered = ms.postes.filter(p => isNum(p.salaireBaseMensuel) && (p.salaireBaseMensuel ?? 0) > 0);

  const totalEtpA01 = ms.totalEtp[1];
  const totalMasseA01 = ms.totalMasse[1];

  // Chart data: cols 17-22 = masse salariale par année (6 cols: N-1 + A01..A05). We only show A01..A05.
  const chartData = YEARS.map((y, i) => ({
    year: y,
    masse: ms.totalMasse[i + 1] ?? 0,
    etp: ms.totalEtp[i + 1] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Total ETP Année 01</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{num(totalEtpA01)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Masse salariale chargée Année 01</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{dzd(totalMasseA01)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Postes</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Aucun poste renseigné</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Poste</TableHead>
                  <TableHead className="text-right">Salaire base mensuel</TableHead>
                  <TableHead className="text-right">Salaire chargé annuel</TableHead>
                  {ETP_LABELS.map(l => <TableHead key={l} className="text-right">ETP {l}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.num}>
                    <TableCell>{p.poste ?? `Poste ${p.num}`}</TableCell>
                    <TableCell className="text-right tabular-nums">{dzd(p.salaireBaseMensuel)}</TableCell>
                    <TableCell className="text-right tabular-nums">{dzd(p.salaireChargeAnnuel)}</TableCell>
                    {p.etp.map((v, i) => <TableCell key={i} className="text-right tabular-nums">{num(v)}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Évolution masse salariale &amp; ETP</CardTitle></CardHeader>
        <CardContent>
          <div className="w-full h-80">
            <ResponsiveContainer>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={fmtAxis} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                  formatter={(v, n) => n === 'ETP' ? [num(v as number), n] : [dzd(v as number), n]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="masse" name="Masse salariale" fill={PALETTE[0]} />
                <Line yAxisId="right" type="monotone" dataKey="etp" name="ETP" stroke={PALETTE[5]} strokeWidth={2} dot />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
