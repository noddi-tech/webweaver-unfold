

# Fix Integration Strip: Text Contrast and CMS Integration

## Problems (from screenshots)
1. **Left box "Your system"** -- `fill-card` resolves to dark, making dark text invisible. Need light/white background or white text.
2. **All SVG text is hardcoded** -- "Your system", "Eontyre, ERP, CRM...", "Navio", "Booking . Routing . Capacity", "Bookings . Customers", "Services . Reports", "TWO-WAY SYNC", "Eontyre" partner placeholder, and "+ more coming" are not in the translation system.

## Changes to `src/components/IntegrationStrip.tsx`

### 1. Fix left box contrast
Change the left box from `fill-card` (dark) to `fill-background` with a clear border, so text is readable. Use `stroke-border` for visible border.

### 2. Make all text CMS-editable
Wrap every hardcoded string in `EditableTranslation` with translation keys:

| Text | Translation key |
|---|---|
| "Your system" | `integrations_strip.diagram_your_system` |
| "Eontyre, ERP, CRM..." | `integrations_strip.diagram_your_system_subtitle` |
| "Navio" | `integrations_strip.diagram_navio` |
| "Booking . Routing . Capacity" | `integrations_strip.diagram_navio_subtitle` |
| "Bookings . Customers" | `integrations_strip.diagram_data_outbound` |
| "Services . Reports" | `integrations_strip.diagram_data_inbound` |
| "TWO-WAY SYNC" | `integrations_strip.diagram_sync_label` |
| "Eontyre" (partner) | `integrations_strip.partner_eontyre` |
| "+ more coming" | `integrations_strip.partner_more` |

**SVG text limitation**: SVG `<text>` elements cannot be wrapped in React components directly. Solution: use `t()` calls for the SVG text content (making them translatable via CMS), and place separate `EditableTranslation` wrappers outside the SVG as invisible edit triggers, or simply use `t()` with fallbacks inside SVG (which already makes them editable via the Translation Manager CMS page, even without inline edit buttons).

For the partner name and "+ more coming" text (HTML, not SVG), wrap with `EditableTranslation` directly.

### 3. Tech badges from translations
Replace hardcoded `techItems` array with individual `t()` calls so each badge text is translatable.

## Files

| File | Change |
|---|---|
| `src/components/IntegrationStrip.tsx` | Fix left box fill to `fill-background`, replace all hardcoded strings with `t()` calls, wrap HTML text in `EditableTranslation` |

