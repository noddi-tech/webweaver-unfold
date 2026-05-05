## Goal

Reorganize the AI Draft panel's 3-column layout so the live preview gets full width on top, with "Nåværende" and "AI-forslag — redigerbar" sitting side-by-side beneath it. This gives the preview much more room and makes the slide easier to evaluate.

## Change

**File:** `src/components/portal-cms/PortalSlides.tsx` (lines ~549–597)

Replace the current 3-column grid:
```
[ Nåværende | AI-forslag (editable) | Live preview ]
```

With a stacked layout:
```
Row 1:  [ Live forhåndsvisning — full width ]
Row 2:  [ Nåværende | AI-forslag — redigerbar ]
```

### Implementation details

- Outer wrapper becomes a vertical stack (`space-y-4`).
- Row 1: a single block containing the section label ("Live forhåndsvisning"), `<LivePreviewPanel>`, and the existing 200ms note. Because it's full width, `LivePreviewPanel`'s internal scaling will automatically render the slide much larger (the `PreviewScaleObserver` uses container width to set `--preview-scale`).
- Row 2: `grid grid-cols-1 gap-4 lg:grid-cols-2` containing the existing "Nåværende" read-only column and the existing "AI-forslag — redigerbar" editable column. No internal markup changes — same fields, badges, validation, character counters.
- Conversation log ("Samtale") and the action buttons below remain unchanged.

### Out of scope

- No changes to `LivePreviewPanel` itself — it already scales to its container width.
- No changes to the external Preview card hide/show behavior added in the previous fix.
- No changes to edge functions or data flow.
