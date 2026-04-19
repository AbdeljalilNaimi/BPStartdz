import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import type { ParsedBP } from '@/lib/bp-types';
import { dzd, isNum } from '@/lib/bp-format';
import { EmptyState } from '../empty-state';
import { PALETTE } from '../charts/chart-theme';

const ANNEES = ['Année 01', 'Année 02', 'Année 03', 'Année 04', 'Année 05'];

const fmtAxis = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
};

export function CapexTab({ bp }: { bp: ParsedBP }) {
  const inv = bp.investissement;
  const syn = bp.synthese;
  if (!inv) return <EmptyState />;

  const filteredMaterials = inv.materiels.filter(m =>
    m.annees.some(v => isNum(v) && v !== 0) || isNum(m.prixUnitaire)
  );

  const capexData = ANNEES.map((y, i) => ({ year: y, CAPEX: inv.totals[i] ?? 0 }));

  const budgetData = syn ? [
    { name: 'Investissement', value: syn.investissementTotal ?? 0 },
    { name: 'Masse salariale', value: syn.masseSalarialeTotal ?? 0 },
    { name: 'Achats directs', value: syn.achatsDirectsTotal ?? 0 },
    { name: 'Charges externes', value: syn.chargesExternesTotal ?? 0 },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Matériels d'investissement</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {filteredMaterials.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Aucun matériel renseigné</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Désignation</TableHead>
                  <TableHead>Fonctionnalité</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  {ANNEES.map(y => <TableHead key={y} className="text-right">{y}</TableHead>)}
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map(m => (
                  <TableRow key={m.num}>
                    <TableCell>{m.num}</TableCell>
                    <TableCell>{m.designation ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{m.fonctionnalite ?? '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">{dzd(m.prixUnitaire)}</TableCell>
                    {m.annees.map((v, i) => <TableCell key={i} className="text-right tabular-nums">{dzd(v)}</TableCell>)}
                    <TableCell className="text-right tabular-nums font-medium">{dzd(m.total)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold bg-muted/30">
                  <TableCell colSpan={4}>Total</TableCell>
                  {inv.totals.map((v, i) => <TableCell key={i} className="text-right tabular-nums">{dzd(v)}</TableCell>)}
                  <TableCell className="text-right tabular-nums">
                    {dzd(inv.totals.reduce((a, v) => a + (isNum(v) ? v : 0), 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">CAPEX par année</CardTitle></CardHeader>
          <CardContent>
            <div className="w-full h-72">
              <ResponsiveContainer>
                <BarChart data={capexData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={fmtAxis} />
                  <Tooltip
                    contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                    formatter={(v) => [dzd(v as number), 'CAPEX']}
                  />
                  <Bar dataKey="CAPEX" fill={PALETTE[0]} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Répartition du budget total</CardTitle></CardHeader>
          <CardContent>
            {budgetData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">Aucune donnée de synthèse</p>
            ) : (
              <div className="w-full h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={budgetData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {budgetData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                      formatter={(v, n) => [dzd(v as number), n]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
