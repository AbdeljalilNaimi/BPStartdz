

## Audit: spec vs current implementation

I went through every requirement in your spec against the existing code. Here's what's already done vs what's missing.

### ✅ Already implemented (no changes needed)
- File upload: drag-drop + click, file name shown, loading state, graceful errors, `.xlsx` validation
- All 12 sheet parsers with trimmed sheet-name matching (handles trailing/double spaces)
- All 8 tabs (Overview, P&L, CAPEX, Payroll, Revenue, Opex, BFR/Bilan, TFT) with the required tables and charts
- 6 KPI cards on Overview, P&L Waterfall, Cash Flow grouped bars, Solde area chart
- P&L conditional colors (red/green), Tx margin distinct color, DZD/Millions toggle
- CAPEX donut, Payroll dual-axis, Revenue stacked bar + seasonality, Opex stacked bar
- BFR DSO/DPO/DIO cards, Bilan Check banner per FY (`⚠️ Bilan déséquilibré en FYxx`)
- TFT table + valuation cards + NPV bar chart
- Dark/light toggle, French throughout, DZD `1 234 567` formatting (Intl `fr-FR`), `—` for nulls
- File metadata header (name · fiscal years · upload time · "Charger un autre fichier")
- Per-sheet missing-sheet warnings

### ❌ Gaps to fix

1. **Overview Cash Flow chart is grouped bars, spec says waterfall.** Replace with a true cascade per year using the existing `Waterfall` component.

2. **Opex tab missing "highlight rows with non-zero values"** — currently dims zero rows; spec wants the inverse (highlight non-zero). Quick class swap.

3. **Empty-state message doesn't match spec exactly.** Spec wants: *"Aucune donnée — veuillez charger un fichier BP complété"*. Update `empty-state.tsx`.

4. **All-zero detection per chart isn't enforced.** When parsed values exist but are all 0 (template not filled), charts render flat. Add an `isAllZero` check before rendering each chart and show the empty state instead.

5. **Revenue tab uses `yearly[yi+1]` for FY24..FY28.** Verify mapping: parser pushes `[FY23, FY24, FY25, FY26, FY27, FY28]` so index 1..5 is correct ✅ — no change.

6. **Bilan Check threshold is `Math.abs(v) > 1`.** Spec says "≠ 0". With float rounding from Excel, `> 1` is sensible but I'll lower to `> 0.5` DZD to be stricter while avoiding floating-point noise.

7. **Synthèse `kpiYears` is parsed but never displayed.** Optional — not required by any tab in the spec, so skip.

8. **`A.3. Achats directs` and `Hypothèses` sheets are referenced in spec but no tab consumes them.** Spec doesn't define a tab for them either — leave parsed but unused (already the case). No change.

### Files to modify

- `src/components/bp/tabs/overview.tsx` — swap Cash Flow grouped bars for per-year waterfall using existing `Waterfall` component; add `isAllZero` guards on each chart
- `src/components/bp/tabs/opex.tsx` — invert highlighting (bold non-zero rows instead of dimming zero rows); add chart all-zero guard
- `src/components/bp/empty-state.tsx` — update message text to match spec exactly
- `src/components/bp/tabs/bfr-bilan.tsx` — tighten Check threshold to `> 0.5`
- `src/lib/bp-format.ts` — already has `isAllZero`, just use it

No new files, no new dependencies. ~5 small edits.

### Out of scope (confirm if you want any)
- Adding tabs for `A.3. Achats directs` or `Hypothèses` (spec doesn't define them)
- Saving uploads to Lovable Cloud (you chose in-browser only)
- PDF export of the dashboard

