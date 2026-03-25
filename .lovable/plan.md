

# Fix Final CTA: Update Database Translations

## Problem
The code fallbacks were updated correctly, but the CMS translations in the `translations` table still contain the old values. Since the CMS values take precedence over code fallbacks, the old text still displays.

## Solution
Run SQL updates against the `translations` table to update the English values for:

1. `final_cta.title` → "See how Navio fits your operation"
2. `final_cta.footer_text` → "No credit card required · Free consultation · See results in 30 days"
3. Insert `final_cta.link_secondary` → "Or explore features" (new key, likely doesn't exist yet)

Also delete the `final_cta.subtitle` row if it exists (since we removed that block).

## Technical Detail
Use `supabase--read_query` to check current values, then create a migration to update/insert the translation rows for `language_code = 'en'`.

## Files
| Target | Change |
|---|---|
| `translations` table | Update `final_cta.title`, `final_cta.footer_text`; insert `final_cta.link_secondary`; delete `final_cta.subtitle` |
| New migration file | SQL migration with the updates |

