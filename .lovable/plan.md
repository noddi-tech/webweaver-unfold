

# Make Logo Marquee Logos Clickable

## What
Logos in the trust bar become clickable links. Each logo links to the URL stored in the CMS `images.link_url` field. Logos without a `link_url` remain as plain images.

## Changes

### `src/components/LogoMarquee.tsx`

1. **Add `link` to the `Logo` interface**: Include the `link_url` from the CMS query.
2. **Update the CMS query**: Already fetches `file_url, alt, title` — just needs to also select `link_url`.
3. **Map `link_url` into logo data**: `link: img.link_url || null`.
4. **Wrap `<img>` in `<a>` when `link` exists**: In both the `Strip` component (marquee) and the static display, wrap the image in an anchor tag with `target="_blank"` and `rel="noopener noreferrer"`. When no link, render the `<img>` directly.

No new dependencies. The `link_url` field already exists on the `images` table — just populate it in the CMS Image Manager for each logo.

### Files
| File | Change |
|---|---|
| `src/components/LogoMarquee.tsx` | Fetch `link_url`, wrap logos in `<a>` when URL exists |

