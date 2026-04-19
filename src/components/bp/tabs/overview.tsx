import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, AreaChart, Area, BarChart,
} from 'recharts';
import type { ParsedBP } from '@/lib/bp-types';
import { FY_LABELS_6, FY_LABELS_5 } from '@/lib/bp-types';
import { dzd, pct, isNum } from '@/lib/bp-format';
import { Waterfall, buildWaterfall } from '../charts/waterfall';
import { EmptyState } from '../empty-state';
import { PALETTE } from '../charts/chart-theme';

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold tabular-nums">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

const fmtAxis = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
};

export function OverviewTab({ bp }: { bp: ParsedBP }) {
  const pnl = bp.pnl;
  const tft = bp.tft;

  const kpis = [
    { label: 'CA Année 01 (FY24)', value: dzd(pnl?.ca[1] ?? null) },
    { label: 'EBITDA Année 01', value: dzd(pnl?.ebitda[1] ?? null) },
    { label: "Tx d'EBITDA", value: pct(pnl?.txEbitda[1] ?? null) },
    { label: 'Résultat net Année 01', value: dzd(pnl?.resultatNet[1] ?? null) },
    { label: 'FCF Année 01', value: dzd(tft?.freeCashFlow[0] ?? null) },
    { label: 'NPV', value: dzd(tft?.npv ?? null) },
  ];

  const pnlChart = pnl
    ? FY_LABELS_6.map((y, i) => ({
        year: y,
        CA: pnl.ca[i] ?? 0,
        'Marge brute': pnl.margeBrute[i] ?? 0,
        EBITDA: pnl.ebitda[i] ?? 0,
        'Résultat net': pnl.resultatNet[i] ?? 0,
        'Tx EBITDA %': isNum(pnl.txEbitda[i]) ? (pnl.txEbitda[i] as number) * 100 : null,
      }))
    : [];

  const waterfallSteps = pnl
    ? buildWaterfall([
        { label: 'CA', value: pnl.ca[1], isTotal: true },
        { label: 'Achats consommés', value: -(pnl.achats[1] ?? 0) },
        { label: 'Marge brute', value: pnl.margeBrute[1], isTotal: true },
        { label: 'Charges externes', value: -(pnl.chargesExternes[1] ?? 0) },
        { label: 'Salaires', value: -(pnl.salaires[1] ?? 0) },
        { label: 'EBITDA', value: pnl.ebitda[1], isTotal: true },
        { label: 'Amortissements', value: -(pnl.amortissements[1] ?? 0) },
        { label: 'EBIT', value: pnl.ebit[1], isTotal: true },
        { label: 'Charges fin.', value: -(pnl.chargesFin[1] ?? 0) },
        { label: 'Résultat net', value: pnl.resultatNet[1], isTotal: true },
      ])
    : [];

  const cashFlowData = tft
    ? FY_LABELS_5.map((y, i) => ({
        year: y,
        Exploitation: tft.fluxExploitation[i] ?? 0,
        Investissement: tft.fluxInvestissement[i] ?? 0,
        Financement: tft.fluxFinancement[i] ?? 0,
        'Net Cash Flow': tft.netCashFlow[i] ?? 0,
      }))
    : [];

  const soldeData = tft
    ? FY_LABELS_5.map((y, i) => ({ year: y, solde: tft.soldeFinal[i] ?? 0 }))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(k => <Kpi key={k.label} {...k} />)}
      </div>

      {pnl ? (
        <Card>
          <CardHeader><CardTitle className="text-base">Évolution P&amp;L</CardTitle></CardHeader>
          <CardContent>
            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer>
                <ComposedChart data={pnlChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={fmtAxis} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                    formatter={(v, name) => name === 'Tx EBITDA %' ? [`${(v as number).toFixed(1)}%`, name] : [dzd(v as number), name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="CA" fill={PALETTE[0]} />
                  <Bar yAxisId="left" dataKey="Marge brute" fill={PALETTE[1]} />
                  <Bar yAxisId="left" dataKey="EBITDA" fill={PALETTE[2]} />
                  <Bar yAxisId="left" dataKey="Résultat net" fill={PALETTE[3]} />
                  <Line yAxisId="right" type="monotone" dataKey="Tx EBITDA %" stroke={PALETTE[5]} strokeWidth={2} dot />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : <EmptyState />}

      <div className="grid lg:grid-cols-2 gap-6">
        {pnl && waterfallSteps.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Cascade des charges — Année 01</CardTitle></CardHeader>
            <CardContent><Waterfall data={waterfallSteps} height={320} /></CardContent>
          </Card>
        )}

        {tft && (
          <Card>
            <CardHeader><CardTitle className="text-base">Flux de trésorerie par année</CardTitle></CardHeader>
            <CardContent>
              <div className="w-full h-80">
                <ResponsiveContainer>
                  <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={fmtAxis} />
                    <Tooltip
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                      formatter={(v, n) => [dzd(v as number), n]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Exploitation" fill={PALETTE[0]} />
                    <Bar dataKey="Investissement" fill={PALETTE[1]} />
                    <Bar dataKey="Financement" fill={PALETTE[2]} />
                    <Bar dataKey="Net Cash Flow" fill={PALETTE[3]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {tft && (
        <Card>
          <CardHeader><CardTitle className="text-base">Solde de trésorerie cumulé</CardTitle></CardHeader>
          <CardContent>
            <div className="w-full h-72">
              <ResponsiveContainer>
                <AreaChart data={soldeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="solde" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PALETTE[0]} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={PALETTE[0]} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={fmtAxis} />
                  <Tooltip
                    contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                    formatter={(v) => [dzd(v as number), 'Solde']}
                  />
                  <Area type="monotone" dataKey="solde" stroke={PALETTE[0]} fill="url(#solde)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
