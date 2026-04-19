

## Understanding

You uploaded an Algerian Business Plan template (`ASF_BP_Canevas_v01_2024`) and want a full interactive financial dashboard that parses any `.xlsx` matching this exact structure and renders 8 tabs of KPIs, tables, and charts in French (DZD currency).

The current project is **AssetWise** (asset management). Building this BP dashboard alongside it would create two unrelated apps. I recommend **replacing** the current app with the BP Dashboard since they share no domain logic — but I'll confirm below.

## Tech adjustments from your spec

- **Frontend-only parsing** with SheetJS (`xlsx` npm package). No Python/FastAPI backend — parsing in-browser is instant, private (file never leaves the device), and avoids deploy complexity. Your spec listed this as an option.
- **Recharts** (already installed) for all charts, including a custom waterfall built from stacked bars.
- **shadcn/ui** Card/Tabs/Table already present.
- Default: **dashboard is public** (no login). I'll confirm below.

## Architecture

```text
src/
├── routes/index.tsx              → BP Dashboard entry (replaces current landing)
├── lib/bp-parser.ts              → All Excel parsing (one fn per sheet)
├── lib/bp-types.ts               → ParsedBP type
├── lib/bp-format.ts              → DZD formatter, "—", %, M toggle
└── components/bp/
    ├── file-uploader.tsx         → Drag-drop + parse + error handling
    ├── dashboard.tsx             → Tabs container + file metadata header
    ├── empty-state.tsx
    ├── tabs/
    │   ├── overview.tsx          → 6 KPI cards + 4 charts
    │   ├── pnl.tsx               → P&L table, conditional colors, DZD/M toggle
    │   ├── capex.tsx             → Materials table + CAPEX bar + budget donut
    │   ├── payroll.tsx           → ETP/salary table + dual-axis chart
    │   ├── revenue.tsx           → Monthly table + stacked bar + seasonality
    │   ├── opex.tsx              → 14-row charges table + stacked bar
    │   ├── bfr-bilan.tsx         → DSO/DPO/DIO + BFR line + Bilan check
    │   └── cashflow.tsx          → TFT table + valuation cards + NPV bar
    └── charts/
        ├── waterfall.tsx         → Reusable waterfall (stacked-bar trick)
        └── chart-theme.ts
```

## Parsing strategy

One pure function `parseBPFile(file: File): Promise<ParsedBP>`:
1. `XLSX.read(buffer, { type: 'array' })`
2. Trim sheet names — `Object.keys(wb.Sheets).find(s => s.trim() === target)` to handle trailing/double spaces
3. `sheet_to_json(ws, { header: 1, defval: null })` → 2D array
4. Pull values by exact `[row][col]` indices from your spec
5. Returns typed object with `pnl, tft, actifBfr, bilan, synthese, investissement, ca, masseSalariale, chargesExternes, bfr, hypotheses, fiscalYears, fileName, uploadedAt`
6. Throws `BPParseError(sheetName)` on missing sheets — uploader shows banner with the sheet name

Tab components handle missing sub-data via warning banners + empty states (no whole-app crash).

## Charts

- **Waterfall** (charges, cash flow): Recharts stacked `BarChart` with invisible "base" + visible "delta" segments per step
- **Dual-axis** (payroll): `ComposedChart` with two `YAxis`
- **Stacked bars / lines / areas / donut**: native Recharts

## UI

- French throughout, values formatted `1 234 567 DZD` (Intl.NumberFormat 'fr-FR')
- Light/dark toggle in header (uses existing `.dark` variant)
- Header: file name · fiscal years detected · upload time · "Charger un autre fichier"
- Pre-upload: full-screen drop zone with structure hint
- Empty cells → "—" in tables, skipped in charts; all-zero file → empty-state per chart
- Bilan Check ≠ 0 → red banner `⚠️ Bilan déséquilibré en FYxx`

## New dependency

- `xlsx` (SheetJS) — only addition

## Out of scope (ask if you want)

- Saving uploads to backend / multi-file history
- Editing values in dashboard (read-only viewer)
- Export dashboard as PDF
- Side-by-side comparison of two BP files

## Two confirmations before I build

1. **Existing AssetWise app** → I'll **replace it entirely** (cleanest). Say so if you'd rather keep AssetWise at `/` and put the BP dashboard at `/bp`.
2. **Persistence** → Default is **in-browser only** (no upload to server, no auth). Say if you want files saved per-user in Lovable Cloud instead.

If both defaults are fine, just say "go" and I'll build it.

