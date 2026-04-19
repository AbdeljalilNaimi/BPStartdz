
## Plan: Branded cover page for PDF export

Replace the current minimal first-page header with a proper full-page cover that introduces the report.

### What goes on the cover
- **Title block**: "Business Plan" + filename (without `.xlsx`) as the company/project name
- **Fiscal year range**: e.g. "Exercices FY23 — FY28"
- **Generation date**: "Généré le 19 avril 2026 à 14:32"
- **Summary KPI table**: 4 key metrics pulled from the parsed BP, one row per fiscal year:
  - Chiffre d'affaires (from `pnl.ca`)
  - EBITDA (from `pnl.ebitda`)
  - Taux EBITDA % (from `pnl.txEbitda`)
  - Free Cash Flow (from `tft.freeCashFlow`, FY24+ only — "—" for FY23)
- **Footer line**: small muted text "Sections incluses : N / 10"

Values formatted with the existing `bp-format` helpers (DZD short form like "1,2 Md DZD", "—" for null).

### Files to change
- **`src/components/bp/dashboard.tsx`** — replace the existing inline cover `<div data-pdf-section>` with a new `<CoverPage />` component (defined in the same file or a new file). Pass `bp` + `selectedKeys.length`. Keep it as the first `[data-pdf-section]` so the existing `exportDashboardToPDF` paginates it correctly (single A4 page, no slicing needed since content fits).

### Technical notes
- Pure inline-styled JSX (no Tailwind classes that depend on dark mode) so html2canvas-pro renders it identically regardless of theme.
- Use a simple HTML `<table>` for the KPI grid with thin borders, right-aligned numbers, and zebra rows.
- Cover always rendered, never affected by section checkboxes.
- Reuse `formatDzdShort` / `formatPercent` from `src/lib/bp-format.ts` (already used elsewhere).

### Out of scope
- Logo upload, custom color theming, multi-language toggles.
