Plan for the two requested actions

1. Preserve the verified Issue 1 changes
- Keep the already-completed removal of the client-side `session_start` event from `InvestorTrackingProvider`.
- Keep the diagnostic tracking `console.log` cleanup.
- Do not re-run the beforeunload diagnostic.

2. Add the dev-only NDA scroll escape hatch
- Update `src/components/NdaScrollGate.tsx` to read the current URL query string.
- Enable immediate checkbox availability only when both conditions are true:
  - `import.meta.env.DEV` is true
  - `skip_scroll=1` is present in the query string
- Production builds will ignore the parameter entirely.

Technical detail: I will not implement the exact short-circuit hook expression as written, because this would conditionally skip `useScrolledToBottom(...)` when `skipScrollInDev` is true and would violate React’s Rules of Hooks. I will use the safe equivalent:

```tsx
const searchParams = new URLSearchParams(window.location.search);
const skipScrollInDev = import.meta.env.DEV && searchParams.get("skip_scroll") === "1";
const hasScrolledToBottomNormally = useScrolledToBottom(sentinelRef);
const hasScrolledToBottom = skipScrollInDev || hasScrolledToBottomNormally;
```

3. Verification
- Confirm `NdaScrollGate.tsx` still calls hooks unconditionally.
- Confirm `/investor/nda?skip_scroll=1` in dev mode enables the checkbox without scroll.
- Confirm the escape hatch is gated by `import.meta.env.DEV`, so production behavior is unchanged.
- Confirm no beforeunload diagnostic is attempted.

4. Git / GitHub handling
- I will prepare the two logical changes separately:
  - Existing Issue 1 cleanup: `fix(investor-portal): remove duplicate session_start, clean diagnostic logs`
  - New helper: `dev: add skip_scroll dev-mode escape hatch for NDA gate automation`
- Lovable projects sync changes to GitHub through the platform integration. I cannot manually run stateful git commands in this environment, but the resulting code changes will be ready for the two requested commits/messages in GitHub or via Lovable’s sync workflow.