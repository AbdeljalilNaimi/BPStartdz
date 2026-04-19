import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Num } from '@/lib/bp-types';
import { isNum, dzd } from '@/lib/bp-format';

export interface WaterfallStep {
  label: string;
  value: number; // positive = increase, negative = decrease, total marker uses isTotal
  isTotal?: boolean;
}

interface Props {
  data: WaterfallStep[];
  height?: number;
}

interface ChartRow {
  label: string;
  base: number;
  delta: number;
  total: number;
  isTotal: boolean;
  raw: number;
}

export function buildWaterfall(steps: { label: string; value: Num; isTotal?: boolean }[]): WaterfallStep[] {
  return steps
    .filter(s => isNum(s.value) || s.isTotal)
    .map(s => ({ label: s.label, value: isNum(s.value) ? s.value : 0, isTotal: s.isTotal }));
}

export function Waterfall({ data, height = 320 }: Props) {
  // Compute base + delta per step. Totals reset to 0.
  let running = 0;
  const rows: ChartRow[] = data.map(step => {
    if (step.isTotal) {
      // Total bar starts at 0, height = step.value
      const r: ChartRow = {
        label: step.label,
        base: 0,
        delta: Math.abs(step.value),
        total: step.value,
        isTotal: true,
        raw: step.value,
      };
      running = step.value;
      return r;
    }
    const start = running;
    const end = running + step.value;
    const base = Math.min(start, end);
    const delta = Math.abs(step.value);
    running = end;
    return {
      label: step.label,
      base,
      delta,
      total: end,
      isTotal: false,
      raw: step.value,
    };
  });

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            angle={-30}
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={(v: number) => {
            if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
            if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
            return String(v);
          }} />
          <Tooltip
            cursor={{ fill: 'var(--accent)', opacity: 0.3 }}
            contentStyle={{
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              fontSize: 12,
            }}
            formatter={(_v, _n, item) => {
              const r = item.payload as ChartRow;
              return [dzd(r.raw), r.isTotal ? 'Total' : (r.raw >= 0 ? 'Augmentation' : 'Diminution')];
            }}
            labelFormatter={(l) => l as string}
          />
          <Bar dataKey="base" stackId="w" fill="transparent" />
          <Bar dataKey="delta" stackId="w" radius={[2, 2, 0, 0]}>
            {rows.map((r, i) => {
              const color = r.isTotal
                ? 'var(--chart-1)'
                : r.raw >= 0
                ? 'oklch(0.65 0.15 145)'
                : 'oklch(0.6 0.22 25)';
              return <Cell key={i} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
