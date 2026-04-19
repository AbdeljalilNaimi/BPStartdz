# Business Plan Dashboard

Upload an Excel business plan (`.xlsx`) and instantly explore it as an interactive multi-tab dashboard with branded PDF export.

## Features

-  **10 themed tabs** — Overview, P&L, CAPEX, Payroll, Revenue, Direct Purchases, OPEX, BFR & Balance Sheet, Cash Flow & Valuation, Assumptions
-  **Rich visualizations** — KPI cards, waterfall charts, and detailed tables
-  **Branded PDF export** — Cover page with project name, fiscal year range, generation date, and summary KPIs. Pick which sections to include.
-  **Light / dark theme**
- 🇫🇷 French UI with DZD (Algerian Dinar) currency formatting
-  Files are parsed entirely in your browser — nothing leaves your device

## Tech Stack

- **React 19** + **TanStack Start** (SSR) + **TanStack Router**
- **Tailwind CSS 4** with semantic design tokens
- **Recharts** for charts
- **html2canvas-pro** + **jsPDF** for PDF export
- **Lovable Cloud** (Supabase) backend available for future features

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── routes/              # File-based routing (TanStack Router)
├── components/bp/       # Dashboard tabs, cover page, file uploader
├── lib/
│   ├── bp-parser.ts     # Excel → structured data
│   ├── bp-format.ts     # DZD / percent formatters
│   └── bp-pdf-export.ts # PDF generation
└── styles.css           # Design tokens
```

## Expected Excel Format

The parser reads a structured BP workbook with sheets covering P&L, CAPEX, payroll, revenue, OPEX, BFR / balance sheet, cash flow, direct purchases, and assumptions across multiple fiscal years (e.g. FY23 → FY28).
