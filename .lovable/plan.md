
## Plan: PDF export of the dashboard

Add a "Exporter PDF" button in the dashboard header that captures the current view (all visible tabs' content rendered sequentially) as a multi-page A4 PDF.

### Approach
Use `html2canvas-pro` + `jspdf` (client-side, works in browser, no server needed). On click:
1. Temporarily render all 10 tab panels stacked (not just the active one) into a hidden export container.
2. For each tab section, snapshot with `html2canvas-pro` at 2x scale.
3. Slice each canvas into A4-sized pages and append to a `jsPDF` doc.
4. Save as `<fileName>-dashboard.pdf`.

### Files to change
- **`package.json`** — add `jspdf` and `html2canvas-pro` (pro fork supports `oklch` colors used by Tailwind v4).
- **`src/lib/bp-pdf-export.ts`** (new) — `exportDashboardToPDF(bp, fileName)` orchestration: renders an off-screen React tree of all tabs via `createRoot`, waits for charts to settle (Recharts needs a tick + ResizeObserver flush), captures, paginates, saves.
- **`src/components/bp/dashboard.tsx`** — add `Download` icon button next to the theme toggle; manages `isExporting` loading state; calls the export helper passing the `bp` and a ref to a hidden container that renders all tabs sequentially with section headings (Vue d'ensemble, P&L, etc.).

### Technical notes
- Render export container with `position: fixed; left: -10000px; width: 1100px` so layout matches desktop and Recharts has a real width to measure.
- Force light theme + white background during export for print legibility regardless of dark mode.
- Wait ~600ms after mount + `requestAnimationFrame` x2 before snapshot so Recharts animations finish.
- Page-slice algorithm: render full canvas, then for each A4 page draw a clipped portion (`addImage` with negative Y offset).
- Button shows `Loader2` spinner + disabled state during export; toast on success/error via existing `sonner`.

### Out of scope
- Server-side PDF rendering, custom cover page, watermarks, or per-tab export selection.
