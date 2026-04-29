# Build `/investor/nda` NDA Acceptance Gate

## Overview
Create the second step of the investor entry flow: a protected NDA acceptance page where investors must read to the bottom, check the confirmation box, and accept before being sent to `/portal`.

This will use the existing `InvestorSessionContext`, existing Supabase tables, and the deployed `accept-nda` Edge Function.

## Files to create

### `src/hooks/useScrolledToBottom.ts`
Add the reusable IntersectionObserver hook exactly matching the requested sticky behavior:

- Accepts a `RefObject<HTMLElement>` sentinel ref.
- Returns `false` initially.
- Flips to `true` once the sentinel is at least 95% visible.
- Stays `true` even if the user scrolls back up.

### `src/components/RequireInvestorSession.tsx`
Add the route guard for investor-only routes:

- Reads `sessionId` and `isLoaded` from `useInvestorSession()`.
- Renders nothing while not loaded.
- Redirects to `/investor` when there is no session.
- Renders children when a session exists.

### `src/components/RequireNdaAccepted.tsx`
Add the future portal guard:

- Composes `RequireInvestorSession`.
- Reads `hasAcceptedNda`.
- Redirects to `/investor/nda` if the NDA is not accepted.
- Renders children if accepted.

### `src/components/NdaScrollGate.tsx`
Add the reusable NDA reader and acceptance control component:

- shadcn `Card` using `glass-card rounded-2xl p-6 sm:p-8`.
- Eyebrow, heading, and subheading with the exact text and classes requested.
- Scrollable, focusable legal reader with `tabIndex={0}` and markdown rendered via `react-markdown`.
- Sentinel div at the bottom of the rendered NDA connected to `useScrolledToBottom`.
- Disabled checkbox before scrolling completes.
- Helper text shown only while disabled.
- Accept button disabled until checkbox is checked or while saving.
- Loading state: `Loader2` icon plus `Saving…`.
- Error region above buttons with `role="alert"` and the exact message.
- Decline flow: `signOut()` then navigate to `/investor`.
- Accept flow: call `supabase.functions.invoke('accept-nda', { body: { session_id: sessionId } })`, then `markNdaAccepted()`, then navigate to `/portal` on success.

### `src/pages/InvestorNda.tsx`
Add the page shell and data loading:

- Match `/investor` top bar and footer treatment.
- Reuse `BrandLogo` and the same brand-settings fetch/realtime update pattern used by `src/pages/Investor.tsx` for exact visual continuity.
- Top bar: `h-16`, sticky on mobile, static desktop, logo left, “Series A · Closing 30 June 2026” right.
- Center zone: `bg-background`, no page-level gradient, decorative top-right `--gradient-mesh-velvet` blob at opacity `0.4` behind the card.
- Content width: card container max-width 720px, full width on mobile with 24px horizontal padding.
- Footer: same “Confidential investor portal · Access governed by NDA”.
- Use React Query to fetch the current NDA:
  - table: `nda_versions`
  - select: `id, version, body_md`
  - filter: `is_current = true`
  - `.single()`
- While loading, render the NDA card with skeleton lines in the scroll area and no checkbox/buttons.
- If loading fails, show the requested centered destructive fallback message.
- If `hasAcceptedNda === true`, redirect to `/portal` defensively.

## Files to edit

### `package.json`
Add `react-markdown` to dependencies, because it is not currently installed.

### `src/App.tsx`
Register the language-agnostic route next to `/investor`:

```tsx
<Route
  path="/investor/nda"
  element={
    <RequireInvestorSession>
      <InvestorNda />
    </RequireInvestorSession>
  }
/>
```

Also import `InvestorNda` and `RequireInvestorSession`.

## Technical details

- No database migrations are needed.
- No Edge Function changes are needed.
- The existing `accept-nda` function already accepts `{ session_id }` and returns `{ success: true }`.
- NDA markdown will be rendered with typography classes:

```tsx
className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground"
```

- The scroll area will be keyboard focusable to preserve the requested tab order:

```text
scroll area -> checkbox -> Decline -> Accept
```

- The checkbox will remain disabled until the scroll hook flips true, including keyboard interaction.

## Verification after implementation

I will verify and report each checklist item:

- Navigating to `/investor/nda` without a session redirects to `/investor`.
- A stored session with `hasAcceptedNda: true` redirects to `/portal`.
- Page renders cleanly at 320px, 768px, and 1280px.
- NDA loads from DB and renders as formatted markdown.
- Checkbox is disabled and visibly muted before scrolling completes.
- Helper text is visible while the checkbox is disabled.
- Scrolling to the bottom enables the checkbox and hides helper text.
- Scrolling back up does not disable it again.
- Checkbox can be checked and unchecked once enabled.
- Accept is disabled until checked.
- Accept calls `accept-nda`, updates `navio_investor_session.hasAcceptedNda` to `true`, then navigates to `/portal`.
- Decline clears localStorage and returns to `/investor`.
- Tab order is scroll area, checkbox, Decline, Accept.
- No console errors occur.