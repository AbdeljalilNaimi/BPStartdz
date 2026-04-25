## Plan : sidebar rétractable, branding institutionnel et export PDF premium

### 1. Assets & branding

- Copier les 3 logos uploadés dans `src/assets/` :
  - `start-dz-logo.png` (logo principal Start'Dz)
  - `udl-logo.png` (Université Djilali Liabes)
  - `nccfiue-logo.png` (Comité National)
- Créer `src/components/brand/brand-header.tsx` : composant réutilisable affichant le logo Start'Dz + bloc texte 3 lignes :
  - **BPstartdz** (gros, gras)
  - *University Djilali Liabes Sidi Bel Abbes* (petit, muted)
  - *Modèle Financier* (petit, muted, italique)
- Variantes : `compact` (sidebar header), `full` (page d'accueil), `pdf` (page de couverture).

### 2. Sidebar rétractable (`src/routes/plan.tsx`)

Refactoriser le layout pour utiliser le composant shadcn `Sidebar` existant (`@/components/ui/sidebar`) :

- Wrapper l'app dans `<SidebarProvider defaultOpen>` avec largeur CSS variable.
- Remplacer la `<aside>` desktop actuelle par `<Sidebar collapsible="icon">` :
  - `SidebarHeader` → `<BrandHeader variant="compact" />`
  - `SidebarContent` → groupes (Informations / Données / Résultats) avec `SidebarMenuButton` (icône Lucide par étape : `IdCard`, `Settings2`, `Building2`, `TrendingUp`, `ShoppingCart`, `Users`, `Receipt`, `BarChart3`)
  - `SidebarFooter` → progression (X/8 étapes complétées)
- Ajouter `<SidebarTrigger />` dans le top header pour basculer ouvert/fermé (animation fluide native shadcn ~200ms).
- Mode replié : seules les icônes restent, tooltip Radix sur hover affichant le label complet.
- Le contenu principal s'élargit automatiquement (gestion native de `SidebarInset`).
- Conserver la barre horizontale mobile actuelle (déjà responsive).

### 3. Header global

Top bar de `/plan/*` :
- Gauche : `<SidebarTrigger />` + `<BrandHeader variant="compact" />`
- Droite : bouton "Accueil" (icône Home)
- Bordure + backdrop-blur conservés.

Page d'accueil (`src/routes/index.tsx`) :
- Remplacer le bloc "Plan Financier / Outil de planification académique" par `<BrandHeader variant="full" />` avec logo Start'Dz à gauche et les 3 lignes de branding.
- Footer : ajouter discrètement les logos UDL + NCCFIUE (petits, en niveaux de gris/opacity réduite) à côté de la mention année/devise.

### 4. Export PDF professionnel

#### Modale de sélection (nouveau composant `src/components/plan/pdf-export-dialog.tsx`)

Dialog shadcn déclenché par "Exporter PDF" depuis `/plan/etats-financiers` :
- Titre : "Personnaliser l'export PDF"
- Liste de cases à cocher pour chaque section (Identification, Hypothèses, Investissements, Chiffre d'Affaires, Achats Directs, Masse Salariale, Charges Externes, BFR & Bilan, Résultats P&L, TFT & Valorisation, Vue d'ensemble)
- Boutons "Tout sélectionner" / "Tout désélectionner"
- Compteur dynamique : "5 sections sélectionnées · ~12 pages estimées"
- Champ optionnel : nom du fichier
- Bouton primaire "Générer le PDF" avec loader

#### Refonte de `src/lib/bp-pdf-export.ts` → `src/lib/bp-pdf-export-pro.ts`

Nouveau pipeline construit avec **jsPDF natif** (déjà installé) plutôt que html2canvas seul, pour un rendu vectoriel net :

**Page de couverture (vectorielle)** :
- Bandeau coloré haut (primary) avec logo Start'Dz centré
- Titre : nom du projet (gros, serif)
- Sous-titre : "BPstartdz — University Djilali Liabes Sidi Bel Abbes — Modèle Financier"
- Bloc identification : porteur, secteur, localisation, devise, horizon
- Bandeau bas : date de génération + logos UDL & NCCFIUE en pied

**Page de résumé exécutif (auto-générée)** :
- KPIs clés en cartes : CA total, EBE moyen, Résultat net cumulé, VAN, TRI, Cash-flow final
- Tableau condensé P&L sur 5 ans

**Pages de sections** :
- Header répété sur chaque page : mini logo + "BPstartdz — [Projet]" + numéro de page (ex. "3 / 24")
- Footer : date génération + URL/marque
- Marges : 15mm
- Titre de section avec accent de couleur primary
- Contenu capturé via html2canvas pour les graphiques + tableaux (rendu identique à l'app)
- Saut de page propre entre sections (jamais de coupure au milieu d'un bloc si évitable)

**Typographie & couleurs** :
- jsPDF avec police Helvetica par défaut + tailles cohérentes (titre 24, section 16, corps 10)
- Couleurs extraites des tokens CSS (primary sage, accent, muted)

**Pagination** : numérotation automatique sur toutes les pages sauf couverture.

### 5. Petits ajustements UX français

- Vérifier que tous les libellés sont en français (déjà majoritairement le cas).
- Ajouter tooltips français sur les icônes du sidebar replié.
- Transitions Tailwind `transition-[width]` 200ms sur le contenu principal.

### Fichiers créés
- `src/assets/start-dz-logo.png` (copié depuis upload)
- `src/assets/udl-logo.png`
- `src/assets/nccfiue-logo.png`
- `src/components/brand/brand-header.tsx`
- `src/components/plan/pdf-export-dialog.tsx`
- `src/lib/bp-pdf-export-pro.ts`

### Fichiers modifiés
- `src/routes/plan.tsx` — refonte avec `Sidebar` shadcn rétractable + `SidebarTrigger`
- `src/routes/plan.etats-financiers.tsx` — branchement de la modale d'export
- `src/routes/index.tsx` — utilisation de `BrandHeader` + footer logos
- `src/styles.css` — variables `--sidebar-width` (16rem) et `--sidebar-width-icon` (3.5rem)

### Hors scope
- Modification du moteur de calcul (`plan-compute.ts`).
- Ajout de nouvelles étapes (BFR séparé, etc.).
- Persistance multi-projets ou backend (reste localStorage).
