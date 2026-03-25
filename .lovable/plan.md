

# Replace Integration Card Grid with Integration Confidence Strip

## What changes
Remove the existing 3-card integration grid (`Integrations.tsx`) and replace it with a two-column confidence strip featuring text content on the left and an inline SVG diagram on the right.

## Files

### 1. `src/components/IntegrationStrip.tsx` (new file)
New component with the following structure:

**Layout**: `bg-muted/30` background (subtly different from adjacent sections). Two-column grid on desktop (`lg:grid-cols-2`), stacked on mobile. Columns vertically centered.

**Left column**:
- Eyebrow: `text-xs font-medium uppercase tracking-wider text-muted-foreground` -- "Integrations"
- Headline: `text-3xl md:text-4xl font-bold` -- "Works with the systems you already use"
- Paragraph: `text-muted-foreground` -- condensed integration pitch
- Partner logo row: bordered container with "Eontyre" text placeholder + muted "+ more coming" text
- Tech badge row: 4 `Badge variant="outline"` pills (REST API, Webhooks, Custom integrations, CSV / JSON export)
- CTA text link (not a button): `LanguageLink` to `/architecture` or `/contact` with arrow, styled as `text-primary font-medium hover:underline`

**Right column**:
- Inline SVG diagram with two rounded boxes connected by bidirectional arrows
  - Left box: "Your system" / "Eontyre, ERP, CRM..." -- `stroke-border fill-card` (light/white)
  - Right box: "Navio" / "Booking . Routing . Capacity" -- `fill-primary text-primary-foreground`
  - Two horizontal arrows with data labels: "Bookings . Customers" (top), "Services . Reports" (bottom)
  - Centered circular sync icon (RefreshCw from lucide or SVG circle with arrows)
- All SVG colors use CSS variables via `currentColor`, `hsl(var(--primary))`, `hsl(var(--border))`, etc.

**CMS pattern**: Uses `EditableTranslation` wrappers for all text with `integrations_strip.*` translation keys, `useAppTranslation` hook, and `useScrollAnimation` for entrance animation.

### 2. `src/pages/Index.tsx` (edit)
- Replace `import Integrations` with `import IntegrationStrip`
- Replace `<Integrations />` with `<IntegrationStrip />`

### 3. `src/components/Integrations.tsx` (keep file, no longer imported on homepage)
The old component stays in the codebase in case it's used elsewhere (e.g. architecture page), but is removed from the homepage render.

## Mobile behavior
Text block first, SVG diagram below, then logos/badges at the bottom -- natural stacking from the grid layout.

