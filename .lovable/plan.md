

# Audit: IntegrationStrip CMS Editing Compatibility

## Findings

### Working correctly
- **Eyebrow, headline, description, CTA link**: All wrapped in `EditableTranslation` without `disableStyling` — text and color edits will persist and render.
- **SVG text**: Uses `t()` calls, editable via Translation Manager CMS page. Cannot have inline edit buttons (SVG limitation) but translations work.
- **Save flow**: `RichTextEditModal` correctly upserts to `translations` table with style settings (color, font size, weight, italic, underline).

### Broken — needs fixing

| Element | Problem | Fix |
|---|---|---|
| **"Eontyre"** (line 60) | `disableStyling` prevents CMS color from applying; hardcoded `text-foreground` class overrides any inline style | Remove `disableStyling`, remove `text-foreground` from className |
| **"+ more coming"** (line 65) | `disableStyling` prevents CMS color from applying; hardcoded `text-muted-foreground/60` class overrides any inline style | Remove `disableStyling`, remove `text-muted-foreground/60` from className |
| **Tech badges** (lines 73-78) | Use `t()` for translation but not wrapped in `EditableTranslation` — no inline edit button, no CMS color/style control | Wrap each badge in `EditableTranslation` with individual keys |

### Root cause for user's issue
The user set "Eontyre" to white text in the CMS editor. The `disableStyling` prop explicitly tells `EditableTranslation` to skip all inline styles (including color). Additionally, the hardcoded `text-foreground` Tailwind class would override any inline color even if styling were enabled. Both must be removed.

## Changes — `src/components/IntegrationStrip.tsx`

1. **Eontyre wrapper**: Remove `disableStyling`, remove `text-foreground` from inner div
2. **"+ more coming" wrapper**: Remove `disableStyling`, remove `text-muted-foreground/60` from inner span
3. **Tech badges**: Wrap each badge individually in `EditableTranslation` with its own translation key, so inline editing works for each badge

