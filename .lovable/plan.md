

## Issue Analysis: Auth-Protected Pages Redirect to Homepage

### Root Cause

There are **two separate problems** causing the redirect behavior:

#### Problem 1: Missing `/auth` Route in Router

The routing configuration in `App.tsx` does **not define an `/auth` route**. When `Admin.tsx` (line 128) or `PricingDetailed.tsx` (line 121) redirects unauthenticated users to `/auth`:

```tsx
// Admin.tsx line 128
window.location.href = "/auth";

// PricingDetailed.tsx line 121
return <Navigate to="/auth" replace />;
```

The router has no matching route for `/auth`, so it falls through to the catch-all `Route path="*"` which renders `<NotFound />`. But wait - the user says they're redirected to the **homepage**, not a 404 page...

#### Problem 2: Route Pattern Collision

Looking more carefully at the routes:

```tsx
<Route path="/:lang" element={<LanguageSync><Index /></LanguageSync>} />
```

This route pattern `/:lang` will **match `/auth`** because:
- `/auth` matches the pattern where `lang = "auth"`
- React Router treats `auth` as a valid language parameter
- This renders `<Index />` (the homepage) wrapped in `<LanguageSync>`

This is why users see the homepage with `/auth` in the URL - the router thinks "auth" is a language code!

### Solution

Add explicit `/auth` route BEFORE the `/:lang` catch-all pattern, and update the redirect in `Admin.tsx` to use `<Navigate>` instead of `window.location.href` for consistency.

---

## Implementation Plan

### 1. Add Missing Routes in `App.tsx`

Add these routes in the "CMS and special routes" section (around line 81-88):

| Route | Component | Purpose |
|-------|-----------|---------|
| `/auth` | `<Auth />` | Login page for unauthenticated users |

**Before:**
```tsx
{/* CMS and special routes (no language prefix) */}
<Route path="/cms-login" element={<Auth />} />
<Route path="/reset-password" element={<ResetPassword />} />
<Route path="/cms" element={<Admin />} />
```

**After:**
```tsx
{/* CMS and special routes (no language prefix) */}
<Route path="/auth" element={<Auth />} />
<Route path="/cms-login" element={<Auth />} />
<Route path="/reset-password" element={<ResetPassword />} />
<Route path="/cms" element={<Admin />} />
```

### 2. Fix Redirect in `Admin.tsx`

Change the redirect from `window.location.href` (causes full page reload) to React Router's `<Navigate>`:

**Line 127-130 - Before:**
```tsx
if (!authenticated) {
  window.location.href = "/auth";
  return null;
}
```

**After:**
```tsx
if (!authenticated) {
  return <Navigate to="/auth" replace />;
}
```

Also add `Navigate` to the imports at line 2.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/auth` route before `/:lang` pattern |
| `src/pages/Admin.tsx` | Use `<Navigate>` instead of `window.location.href` for auth redirect |

---

## Technical Summary

The `/auth` path was being matched by the `/:lang` route pattern, treating "auth" as a language code and rendering the homepage. Adding an explicit `/auth` route before the dynamic language pattern fixes the routing priority.

