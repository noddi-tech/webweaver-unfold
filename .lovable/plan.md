

# User Role Management UI

## Overview
Create a new admin-only page at `/cms?tab=users` for managing user roles, and add a link to it from the Internal Hub.

## Changes

### 1. New component: `src/components/design-system/UserRolesManager.tsx`

A table-based UI that:
- Fetches all users from `auth.users` via `supabase.auth.admin.listUsers()` — but since we're using the anon key, we can't do this. Instead, query `user_roles` table to show users with roles, and provide an "Add user" form where an admin enters a user's email.
- **Approach**: Use an edge function (`list-users`) that uses the service role key to list auth users, returning `id` and `email`. The UI then joins this with `user_roles` data.
- Displays a table: Email | Role | Actions (change role / remove role)
- "Add role" form: select a user (from the list) + pick a role (admin/editor/viewer) → insert into `user_roles`
- "Change role" dropdown on each row → update `user_roles`
- "Remove role" button → delete from `user_roles`

### 2. New edge function: `supabase/functions/list-users/index.ts`

A simple edge function that:
- Validates the caller is an admin (via JWT + `is_admin()` RPC)
- Uses the Supabase service role client to call `auth.admin.listUsers()`
- Returns `[{ id, email, created_at }]`

### 3. Update `src/pages/Admin.tsx`

- Import `UserRolesManager`
- Add a "Users" tab under the "Admin & Settings" or as a new main tab
- Add `?tab=users` mapping in `getDefaultTabs()`

### 4. Update `src/pages/Internal.tsx`

- Add a "User Roles" card to the "Admin & Settings" category linking to `/cms?tab=users`
- Icon: `Users` (already imported)

## Technical details

| File | Change |
|------|--------|
| `supabase/functions/list-users/index.ts` | New edge function to list auth users (admin-only) |
| `src/components/design-system/UserRolesManager.tsx` | New component: user roles table + add/edit/remove |
| `src/pages/Admin.tsx` | Add Users tab + deep-link mapping |
| `src/pages/Internal.tsx` | Add "User Roles" card to Admin & Settings |

