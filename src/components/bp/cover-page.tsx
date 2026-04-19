import type { ParsedBP } from '@/lib/bp-types';
import { dzd, pct, isNum } from '@/lib/bp-format';

interface Props {
  bp: ParsedBP;
  sectionsIncluded: number;
  totalSections: number;
}

export function CoverPage({ bp, sectionsIncluded, totalSections }: Props) {
  const projectName = bp.fileName.replace(/\.xlsx$/i, '');
  const years = bp.fiscalYears;
  const yearRange = years.length > 0 ? `${years[0]} — ${years[years.length - 1]}` : '—';
  const generatedAt = new Date().toLocaleString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const ca = bp.pnl?.ca ?? [];
  const ebitda = bp.pnl?.ebitda ?? [];
  const txEbitda = bp.pnl?.txEbitda ?? [];
  const fcf = bp.tft?.freeCashFlow ?? []; // 5 years FY24..FY28

  const cellTd: React.CSSProperties = {
    padding: '8px 10px',
    fontSize: 11,
    borderBottom: '1px solid #e5e5e5',
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  };
  const cellTh: React.CSSProperties = {
    padding: '8px 10px',
    fontSize: 11,
    fontWeight: 600,
    borderBottom: '2px solid #333',
    textAlign: 'right',
    background: '#f5f5f4',
  };
  const labelCell: React.CSSProperties = {
    ...cellTd,
    textAlign: 'left',
    fontWeight: 500,
  };
  const labelHead: React.CSSProperties = {
    ...cellTh,
    textAlign: 'left',
  };

  // Map FCF (5 years FY24..FY28) to the 6-year fiscalYears array, FY23 → null
  const fcfByYear = years.map((y, i) => {
    if (i === 0) return null; // FY23
    return fcf[i - 1] ?? null;
  });

  return (
    <div
      data-pdf-section
      style={{
        minHeight: '1500px',
        padding: '60px 48px',
        background: '#ffffff',
        color: '#111111',
        fontFamily: 'Onest, system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ borderTop: '4px solid #111', paddingTop: 16, marginBottom: 48 }}>
        <p style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#666', margin: 0 }}>
          Business Plan
        </p>
      </div>

      <div style={{ flex: '0 0 auto', marginBottom: 56 }}>
        <h1 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.15, margin: 0, color: '#111' }}>
          {projectName}
        </h1>
        <p style={{ fontSize: 18, color: '#444', marginTop: 16, marginBottom: 0 }}>
          Exercices {yearRange}
        </p>
        <p style={{ fontSize: 13, color: '#777', marginTop: 6, marginBottom: 0 }}>
          Généré le {generatedAt}
        </p>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#666', margin: '0 0 12px 0' }}>
          Indicateurs clés
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr>
              <th style={labelHead}>Indicateur</th>
              {years.map(y => (
                <th key={y} style={cellTh}>{y}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={labelCell}>Chiffre d'affaires</td>
              {years.map((y, i) => (
                <td key={y} style={cellTd}>{dzd(ca[i] ?? null, { millions: true })}</td>
              ))}
            </tr>
            <tr style={{ background: '#fafaf9' }}>
              <td style={labelCell}>EBITDA</td>
              {years.map((y, i) => (
                <td key={y} style={cellTd}>{dzd(ebitda[i] ?? null, { millions: true })}</td>
              ))}
            </tr>
            <tr>
              <td style={labelCell}>Taux EBITDA</td>
              {years.map((y, i) => (
                <td key={y} style={cellTd}>{isNum(txEbitda[i]) ? pct(txEbitda[i]) : '—'}</td>
              ))}
            </tr>
            <tr style={{ background: '#fafaf9' }}>
              <td style={labelCell}>Free Cash Flow</td>
              {years.map((y, i) => (
                <td key={y} style={cellTd}>{dzd(fcfByYear[i], { millions: true })}</td>
              ))}
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: 10, color: '#888', marginTop: 8, marginBottom: 0 }}>
          Montants exprimés en millions de dinars algériens (M DZD).
        </p>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: 12, marginTop: 32 }}>
        <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
          Sections incluses : {sectionsIncluded} / {totalSections}
        </p>
      </div>
    </div>
  );
}
