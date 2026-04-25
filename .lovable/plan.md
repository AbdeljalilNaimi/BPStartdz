## Goal

Transform the current "upload-only Excel dashboard" into a **guided financial planning platform**. The user picks one of two paths on first load, fills minimal inputs, and the app derives every financial statement, KPI, and chart in real time — mirroring the formulas in the ASF BP Canevas Excel model. Year labels start at **2026 / FY26**. Currency stays **DZD**. Plans are saved in **localStorage**.

---

## User flow

```text
                      ┌─────────────────────────────┐
                      │   /  Landing — choose path  │
                      └──────────────┬──────────────┘
                  ┌──────────────────┴──────────────────┐
                  ▼                                     ▼
       Upload .xlsx → parse → seed             Create from scratch
                  └──────────────────┬──────────────────┘
                                     ▼
                  /plan/identification  (Step 1: project info)
                                     ▼
                  /plan/hypotheses     (base assumptions, year start = 2026)
                                     ▼
                  /plan/investissement /chiffre-affaires
                       /achats /masse-salariale /charges-externes /bfr
                                     ▼
                  /plan/etats-financiers (P&L, TFT, BFR, Bilan, Synthèse — read-only, computed)
                                     ▼
                  Export PDF (existing flow, retargeted at computed model)
```

A persistent left/top **stepper** shows progress. User can jump to any completed step. Auto-save on every change.

---

## Step 1 — Identification du Projet (matches your screenshot)

Single card with grouped fields, soft borders, green/beige palette:

- **Institution académique**
  - Établissement (default `Université de Sidi Bel Abbès`)
  - Faculté (default `Faculté des Sciences Économiques`)
  - Département (default `Département de Gestion`)
- **Porteur de projet** — Nom · Prénom
- **Projet** — Intitulé du projet
- **Année de référence** — number, default `2026`

All defaults pre-filled but editable. Validation via zod (max lengths, required). "Suivant →" advances to Hypothèses.

---

## Guided input sections (minimal forms, no giant grids)

Each section opens with **only what the user must fill in**. Yearly grids appear inline next to each item, not as 50-row spreadsheets. "Add item" buttons only when the user wants more rows.

| Section | What user enters | What the app computes |
|---|---|---|
| **Hypothèses de base** | Année début (2026), durée d'amortissement, taux change, inflation, taux IBS, taux d'actualisation, terminal growth, DSO/DPO/DIO | Year labels FY26→FY31 derived everywhere |
| **A.1 Investissement** | Add equipment row → designation, fonctionnalité, prix unitaire, qty per year (5y) | Total CAPEX, amortissements per year (linéaire) |
| **A.2 Chiffre d'affaires** | Add product row → name, monthly volumes Année 01, prix unitaire, evolution % per year | CA monthly + annual FY26..FY31 |
| **A.3 Achats directs** | Per product: cost ratio or unit cost | Achats annuels |
| **A.4 Masse salariale** | Add poste → salaire base mensuel, indemnité, ETP per year | Salaire chargé annuel × ETP per year |
| **A.5 Charges externes** | 14 preset categories with simple yearly inputs (collapsed by default, expand to edit) | Total charges externes |
| **A.6 BFR** | DSO / DPO / DIO (already in Hypothèses) | Clients, fournisseurs, stocks per year |

UX patterns:
- **Accordion per section**, expanded only for the active step.
- Each item is a **collapsed row** showing label + key total; click to expand the year grid.
- Tooltips (`?` icon) on every financial term.
- "Skip for now" allowed; section marked incomplete in stepper.

---

## Computed financial states (Step 3 — read-only)

A single `/plan/etats-financiers` route with sub-tabs reusing the existing dashboard tab components, but fed by a **new `computeBP(inputs)` selector** instead of parsed Excel data:

- **P&L** — CA, Achats, Marge brute, Charges externes, Salaires, EBITDA, Amortissements, EBIT, Charges fin., Résultat avant impôts, IBS, Résultat net + tx marge brute / tx EBITDA
- **TFT** — EBITDA, var BFR, IBS, Flux exploitation, CAPEX, FCF, Charges fin., Net cash flow, Solde initial/final, FCF actualisés, Valeur terminale, NPV
- **B.3 Actif immo & BFR** — Immobilisations nettes, Clients, Stock, Fournisseurs, BFR net
- **B.4 Bilan** — Actif net, Capitaux propres, check (=0)
- **C. Synthèse Financement** — KPI block (CA, EBITDA, tx EBITDA, FCF) + total Investissement, Masse salariale, Achats directs, Charges externes

All charts (waterfall, line, bar) update in real time from the same computed object.

---

## Upload path

Reuse `parseBPFile` from `src/lib/bp-parser.ts`. After parsing, **map parsed values into the new `PlanInputs` shape** and drop the user into `/plan/identification` with everything pre-filled. They can review/edit each step before viewing the computed states. (User confirmed: pre-fill the guided forms, not a separate read-only mode.)

Year mapping: parser currently uses `FY23..FY28`. We'll relabel based on `Hypothèses.anneeDebut` (default 2026 → `FY26..FY31`). No formula changes — only display labels move.

---

## Technical plan

**Routes (TanStack Start, file-based):**
- `src/routes/index.tsx` — landing with two cards: *Upload Excel* / *Create custom plan*
- `src/routes/plan.tsx` — layout route with stepper sidebar + `<Outlet />`
- `src/routes/plan.identification.tsx`
- `src/routes/plan.hypotheses.tsx`
- `src/routes/plan.investissement.tsx`
- `src/routes/plan.chiffre-affaires.tsx`
- `src/routes/plan.achats.tsx`
- `src/routes/plan.masse-salariale.tsx`
- `src/routes/plan.charges-externes.tsx`
- `src/routes/plan.bfr.tsx`
- `src/routes/plan.etats-financiers.tsx` (sub-tabs P&L / TFT / Bilan / Synthèse)

Each route file gets its own `head()` with route-specific title/description.

**State management:**
- New `src/lib/plan-store.ts` — Zustand store with persist middleware → localStorage key `bp-plan-v1`. Holds a single `PlanInputs` object + `setField`, `addItem`, `removeItem`, `loadFromParsedBP`, `reset`.
- New `src/lib/plan-types.ts` — `PlanInputs` (identification, hypotheses, investissements[], produits[], achats[], postes[], chargesExternes, bfr).
- New `src/lib/plan-compute.ts` — pure `computeBP(inputs): ComputedBP` that returns the same shape as `ParsedBP` so existing tab components and PDF export work unchanged.
- New `src/lib/plan-import.ts` — `parsedBPToInputs(bp: ParsedBP): PlanInputs` to seed from upload.

**Validation:** `zod` schemas per section, surfaced via `react-hook-form` (already installed via shadcn `form.tsx`). Errors inline, no toasts for field-level issues.

**Design tokens (`src/styles.css`):**
- Add a soft green/beige palette as semantic tokens (`--accent-sage`, `--surface-cream`, `--border-soft`). Keep existing dark/light scheme but tint the active scheme with these for cards, stepper, primary buttons.
- Onest font already loaded — keep.

**Components (new, under `src/components/plan/`):**
- `landing-choice.tsx` — two big cards on `/`
- `stepper.tsx` — vertical sidebar on desktop, top scroll-strip on mobile
- `identification-form.tsx`, `hypotheses-form.tsx`, ...one per section
- `dynamic-list.tsx` — generic add/remove item wrapper used by Investissement, Produits, Postes, Achats
- `year-grid.tsx` — compact 5-column input row (FY26..FY30) with auto-fill helpers ("apply to all", "+5% YoY")
- `computed-statements.tsx` — wraps existing tabs (`PnlTab`, `CashflowTab`, etc.) and feeds them `computeBP(inputs)`

**Reuse:**
- All existing `src/components/bp/tabs/*.tsx`, charts, PDF export, formatters in `bp-format.ts`, types in `bp-types.ts` — kept and reused unchanged for the computed-statements step.
- Existing `FileUploader` becomes a sub-component of the landing's "Upload" card; on parse it calls `loadFromParsedBP` then navigates to `/plan/identification`.

**Year-label refactor:** small change in `bp-types.ts` to derive `FY_LABELS_6 = (start) => [...]` and pass `anneeDebut` through to chart axes / table headers. Defaults to 2026.

**Out of scope (this round):**
- Authentication / multi-device sync (user chose localStorage)
- Multi-currency (user chose DZD only)
- Editing the computed statements directly — they remain derived, never editable
- Mid-year scenarios / sensitivity analysis (can be added later)

---

## Acceptance checklist

- `/` shows two clean cards (Upload / Create) on the green-beige palette
- Stepper visible on every `/plan/*` route with completion ticks
- Identification form matches screenshot structure with the new defaults
- All year labels start at 2026 (FY26)
- Adding a single product + a single equipment + a single poste produces a fully populated P&L, TFT, Bilan, and KPI synthèse with sensible numbers
- Reload preserves all inputs (localStorage)
- Upload .xlsx still works and lands the user in the guided flow with fields pre-filled
- PDF export still works against the computed model