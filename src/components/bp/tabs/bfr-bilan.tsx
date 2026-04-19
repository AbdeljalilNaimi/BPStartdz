import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import type { ParsedBP } from '@/lib/bp-types';
import { FY_LABELS_5 } from '@/lib/bp-types';
import { dzd, num, isNum } from '@/lib/bp-format';
import { EmptyState } from '../empty-state';
import { PALETTE } from '../charts/chart-theme';

const fmtAxis = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
};

export function BfrBilanTab({ bp }: { bp: ParsedBP }) {
  const bfr = bp.bfr;
  const bilan = bp.bilan;
  const actifBfr = bp.actifBfr;

  if (!bfr && !bilan) return <EmptyState />;

  const bfrEvolution = actifBfr
    ? FY_LABELS_5.map((y, i) => ({ year: y, BFR: actifBfr.bfrNet[i] ?? 0 }))
    : [];

  const actifComposition = bilan
    ? FY_LABELS_5.map((y, i) => ({
        year: y,
        Immobilisations: bilan.immobilisations[i] ?? 0,
        Clients: bilan.clients[i] ?? 0,
        Stock: bilan.stock[i] ?? 0,
        Trésorerie: bilan.tresorerie[i] ?? 0,
      }))
    : [];

  const bilanRows = bilan ? [
    { label: 'Immobilisations', values: bilan.immobilisations },
    { label: 'Clients', values: bilan.clients },
    { label: 'Stock', values: bilan.stock },
    { label: 'Trésorerie', values: bilan.tresorerie },
    { label: 'Fournisseurs', values: bilan.fournisseurs },
    { label: 'Actif Net', values: bilan.actifNet, isTotal: true },
    { label: 'Capital social', values: bilan.capitalSocial },
    { label: "Résultat de l'exercice", values: bilan.resultatExercice },
    { label: 'Réserves légales', values: bilan.reservesLegales },
    { label: 'Reports à nouveau', values: bilan.reportsNouveau },
    { label: 'Capitaux propres', values: bilan.capitauxPropres, isTotal: true },
  ] : [];

  return (
    <div className="space-y-6">
      {bfr && (
        <>
          <h2 className="text-lg font-semibold">Besoin en fonds de roulement</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">DSO (Délai clients)</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{num(bfr.dso)} <span className="text-sm font-normal text-muted-foreground">jours</span></div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">DPO (Délai fournisseurs)</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{num(bfr.dpo)} <span className="text-sm font-normal text-muted-foreground">jours</span></div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">DIO (Délai stock)</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{num(bfr.dio)} <span className="text-sm font-normal text-muted-foreground">jours</span></div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Postes BFR (DZD)</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Poste</TableHead>
                    {FY_LABELS_5.map(y => <TableHead key={y} className="text-right">{y}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Clients</TableCell>{bfr.clientsDzd.map((v, i) => <TableCell key={i} className="text-right tabular-nums">{dzd(v)}</TableCell>)}</TableRow>
                  <TableRow><TableCell>Fournisseurs</TableCell>{bfr.fournisseursDzd.map((v, i) => <TableCell key={i} className="text-right tabular-nums">{dzd(v)}</TableCell>)}</TableRow>
                  <TableRow><TableCell>Stocks</TableCell>{bfr.stocksDzd.map((v, i) => <TableCell key={i} className="text-right tabular-nums">{dzd(v)}</TableCell>)}</TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {actifBfr && (
            <Card>
              <CardHeader><CardTitle className="text-base">Évolution BFR net</CardTitle></CardHeader>
              <CardContent>
                <div className="w-full h-72">
                  <ResponsiveContainer>
                    <LineChart data={bfrEvolution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={fmtAxis} />
                      <Tooltip
                        contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                        formatter={(v) => [dzd(v as number), 'BFR net']}
                      />
                      <Line type="monotone" dataKey="BFR" stroke={PALETTE[0]} strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {bilan && (
        <>
          <h2 className="text-lg font-semibold pt-4">Bilan</h2>

          {bilan.check.map((v, i) =>
            isNum(v) && Math.abs(v) > 1 ? (
              <Card key={i} className="border-destructive bg-destructive/5">
                <CardContent className="py-3 flex gap-2 items-center">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">⚠️ Bilan déséquilibré en {FY_LABELS_5[i]} (écart : {dzd(v)})</span>
                </CardContent>
              </Card>
            ) : null
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Bilan (DZD)</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Poste</TableHead>
                    {FY_LABELS_5.map(y => <TableHead key={y} className="text-right">{y}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bilanRows.map(r => (
                    <TableRow key={r.label} className={r.isTotal ? 'font-semibold bg-muted/30' : ''}>
                      <TableCell>{r.label}</TableCell>
                      {r.values.map((v, i) => <TableCell key={i} className="text-right tabular-nums">{dzd(v)}</TableCell>)}
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="text-muted-foreground italic">Check</TableCell>
                    {bilan.check.map((v, i) => (
                      <TableCell key={i} className={`text-right tabular-nums ${isNum(v) && Math.abs(v) > 1 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        {dzd(v)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Composition de l'actif</CardTitle></CardHeader>
            <CardContent>
              <div className="w-full h-80">
                <ResponsiveContainer>
                  <BarChart data={actifComposition} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={fmtAxis} />
                    <Tooltip
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                      formatter={(v, n) => [dzd(v as number), n]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Immobilisations" stackId="a" fill={PALETTE[0]} />
                    <Bar dataKey="Clients" stackId="a" fill={PALETTE[1]} />
                    <Bar dataKey="Stock" stackId="a" fill={PALETTE[2]} />
                    <Bar dataKey="Trésorerie" stackId="a" fill={PALETTE[3]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
