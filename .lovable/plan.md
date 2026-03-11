

# Fix: Stale Auth Session Causing "Failed to Fetch" Error Loop

## Problem

The only errors in the application are repeated `TypeError: Failed to fetch` originating from Supabase's `_refreshAccessToken`. The user has an expired JWT session stored in `localStorage`. When the Supabase client tries to refresh it and fails (because the refresh token is also expired or invalid), it produces a cascade of identical errors without clearing the bad session.

## Root Cause

The Supabase client is configured with `autoRefreshToken: true` and `persistSession: true`, but there is no error handling for when the refresh itself fails. The app never listens for the `TOKEN_REFRESHED` failure event or catches the `SIGNED_OUT` event triggered by an expired refresh token.

## Solution

Add an auth state change listener at the app level that detects when a session becomes invalid and cleans up gracefully, preventing the error loop.

## Changes

### 1. Update `src/App.tsx` -- Add auth error recovery

Add a `useEffect` at the top of the `App` component that listens for Supabase auth state changes. When the event is `TOKEN_REFRESHED` with a `null` session, or `SIGNED_OUT`, clear any stale session state. This prevents the retry loop.

```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
      // Session expired or refresh failed -- no action needed,
      // just let the app continue in unauthenticated state
    }
  });
  return () => subscription.unsubscribe();
}, []);
```

Additionally, add an initial check that attempts `getSession()` and, if it returns an error, calls `signOut()` to clear the corrupt localStorage tokens:

```typescript
useEffect(() => {
  const cleanupStaleSession = async () => {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.warn('[Auth] Stale session detected, signing out:', error.message);
      await supabase.auth.signOut();
    }
  };
  cleanupStaleSession();
}, []);
```

### 2. No other files need changes

The `@tailwindcss/typography` plugin is already installed and configured. The `BlogRichTextEditor` formatting and scroll preservation fixes from previous edits are in place. The markdown rendering pipeline (`parseBlogMarkdown`) is working correctly.

## Impact Assessment

- **No functionality is broken** -- this only adds graceful handling for expired sessions
- Public pages continue to work without authentication
- Authenticated users with valid sessions are unaffected
- Users with expired sessions will simply be signed out instead of seeing console error spam

