
## Plan: Tab selection for PDF export

Replace the single "Exporter PDF" button with a popover that lists all 10 sections as checkboxes, lets the user pick which to include, then generates the PDF with only the selected sections.

### Files to change

- **`src/components/bp/dashboard.tsx`**
  - Lift the `SECTIONS` array (already defined) and add a `selectedKeys` state initialized to all keys.
  - Replace the `Exporter PDF` button with a `Popover` containing:
    - A header "Sections à inclure"
    - "Tout sélectionner / Tout désélectionner" toggle link
    - One `Checkbox` + label per section (using existing `@/components/ui/checkbox`)
    - A primary "Générer le PDF" button (disabled when 0 selected, shows `Loader2` while exporting)
  - Filter `SECTIONS` by `selectedKeys` when rendering the hidden `exportRef` container, so only chosen tabs are captured.

### Technical notes
- Reuse existing `Popover`, `Checkbox`, `Label` components — no new deps.
- Keep the existing `exportDashboardToPDF` helper unchanged (it already iterates over whatever `[data-pdf-section]` nodes exist in the container).
- Persist selection in component state only (resets on reload — matches in-browser-only data model).
- Cover page (file name + fiscal years) stays always-included regardless of selection.

### Out of scope
- Reordering sections, saving preferences, per-section page breaks customization.
