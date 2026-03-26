

# Fix: Booking Emails Should Send From noreply@info.naviosolutions.com

## Problem
The `getFromAddress('hello')` helper sends from `hello@info.naviosolutions.com`. Booking confirmation emails should come from `noreply@info.naviosolutions.com` instead.

## Solution
Add a `'noreply'` department to the shared email-domain helper, then use it in `create-booking`.

### Changes

**`supabase/functions/_shared/email-domain.ts`**
- Add `'noreply'` to the `EmailDepartment` type
- Add `noreply: 'noreply'` to `DEPARTMENT_EMAILS`
- Add `noreply: 'Navio'` to `DEPARTMENT_NAMES`

**`supabase/functions/create-booking/index.ts`**
- Change `getFromAddress(resendKey, 'hello')` → `getFromAddress(resendKey, 'noreply')`

Result: booking emails send from `Navio <noreply@info.naviosolutions.com>`.

Two files, ~3 lines changed. Redeploy after.

