

## Plan: fix build error and prep app for launch

### The bug
`src/routes/__root.tsx` has meta description strings broken across two lines (lines 37-38, 41-42, 43-44). JS string literals can't span raw newlines, which is why the build fails with `Unterminated string constant (37:38)`.

### Changes

**1. Fix `src/routes/__root.tsx` (unblocks the build)**
- Collapse each multi-line description into a single line with `" — "` between the title and tagline:
  - `"Business Plan Dashboard — Upload an Excel business plan (.xlsx) and instantly explore it as an interactive multi-tab dashboard with branded PDF export."`
- Apply to `description`, `og:description`, and `twitter:description`.

**2. Launch-prep polish (same file)**
- Set a proper site title: `"Business Plan Dashboard"` instead of the generic `"Tableau de bord"` for `title`, `og:title`, and `twitter:title`.
- Replace the stale `og:image` / `twitter:image` (it points to an unrelated "AssetWise" social image) — remove them for now since we have no project-specific share image. Per the TanStack Start guidance, no image is better than a wrong one at the root level.

**3. Launch checklist (no code, just confirmation)**
- Confirm the preview reloads cleanly after the fix (build passes, route renders).
- Remind the user that to go live they click **Publish** (top-right), which creates the `.lovable.app` URL; a custom domain can be added after the first publish via Project Settings → Domains.
- Frontend changes require clicking **Update** in the publish dialog to redeploy; backend (edge functions / migrations) deploys automatically.

### Out of scope
- Adding a custom social share image (can be generated later once branding assets exist).
- SEO/meta per-route (the app is a single-route dashboard, so root meta is sufficient).

