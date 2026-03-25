

# Change Linen Background to Bright Snow (#F8F7F4)

## Change

In `src/index.css`, update the `--background` CSS variable from the current "Soft Linen" value (`36 12% 90%` = `#EAE7E1`) to "Bright Snow" (`#F8F7F4`).

`#F8F7F4` in HSL is approximately `40 18% 96%`.

### File: `src/index.css` (line 58)

```css
/* Before */
--background: 36 12% 90%;                   /* Soft Linen #EAE7E1 */

/* After */
--background: 40 18% 96%;                   /* Bright Snow #F8F7F4 */
```

This single token change propagates everywhere `bg-background` is used across the site.

