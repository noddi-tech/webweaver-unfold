

# Final CTA Update

## Changes in `src/components/FinalCTA.tsx`

1. **Update headline fallback**: Change `"Let's build your digital workshop"` → `"See how Navio fits your operation"`

2. **Remove subtitle**: Remove the `EditableTranslation` block for `final_cta.subtitle` (lines 221-228) — the new headline is self-sufficient and the section should be tighter.

3. **Replace secondary outline button with a text link**: Remove the outline `Button` (lines 246-258) and replace it with a subtle text link styled as an `<a>`/`LanguageLink` with `underline` and `opacity-80 hover:opacity-100` — pointing to `/features` with text "Or explore features →". Wrap in `EditableTranslation` with key `final_cta.link_secondary`.

4. **Restructure CTA area**: Stack the primary button and secondary text link vertically with the text link below the button (not side-by-side), using `flex-col items-center gap-4`.

5. **Keep**: Primary button, footer text, all spacing/styling, edit mode behavior, background system — unchanged.

## Technical detail

- The secondary link uses `LanguageLink` for i18n routing consistency
- Styled with `text-sm underline underline-offset-4` + dynamic color from `ctaData.secondaryCtaTextColor` to match the section's color scheme
- `ArrowRight` icon inline after text for the "→" feel

