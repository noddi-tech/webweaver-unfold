Plan to handle the two tracking bugs

1. Diagnose Bug 1 before rewriting behavior
   - Add temporary development-only `console.log` instrumentation in `src/pages/Portal.tsx`:
     - When the tab tracking effect initializes the first tab timer.
     - When the tab tracking effect records a previous tab exit and resets `tabEnteredAtRef.current` for the new active tab.
     - When the `beforeunload` handler fires, including:
       - `activeTabRef.current`
       - `tabEnteredAtRef.current`
       - `Date.now()`
       - computed `dwell_seconds`
   - Keep logs behind `import.meta.env.DEV` so production behavior is unaffected.

2. Fix Bug 1 only after confirming the breakpoint
   - Inspect the diagnostic output from the requested flow:
     1. Gate through to `/portal`.
     2. Wait 5s on Pitch.
     3. Click Traction.
     4. Wait 5s.
     5. Dispatch `beforeunload`.
   - If the logs confirm `tabEnteredAtRef.current` is stale at unload, fix the root cause in `src/pages/Portal.tsx`.
   - The likely systemic fix is to avoid relying on effect timing for URL-driven tab changes and instead update the tab timer synchronously in the tab-change path before `beforeunload` can observe stale state. I will choose the minimal implementation after the diagnostic identifies the exact breakpoint.

3. Fix Bug 2: queue `session_end` before keepalive flush on tab close
   - In `src/contexts/InvestorTrackingContext.tsx`, update the provider `beforeunload` handler to append:
     ```ts
     {
       event_type: "session_end",
       path: window.location.pathname,
     }
     ```
     before calling `keepaliveFlush(sessionIdRef.current, queueRef.current)`.
   - Keep the existing unmount cleanup session_end for SPA navigation/unmount scenarios.

4. Remove temporary diagnostics after the fix is confirmed
   - Remove all temporary `console.log` statements from `Portal.tsx` after capturing the diagnostic evidence and applying the fix.
   - Keep existing `console.warn` error handling in the tracking provider.

5. Verification
   - Use the dev-mode `?skip_scroll=1` NDA bypass:
     1. Navigate `/investor`.
     2. Submit gate with `NavioFunding2026`.
     3. Navigate/continue through `/investor/nda?skip_scroll=1`.
     4. Accept NDA.
     5. Wait 5s on Pitch.
     6. Click Traction.
     7. Wait 5s.
     8. Dispatch `beforeunload`.
     9. Wait 3s for keepalive.
   - Query `investor_events` for the test email, last 2 minutes.
   - Report literal DB output and pass/fail for:
     - Bug 1 fixed: Traction `tab_exit` dwell is approximately 5, not approximately 10.
     - Bug 2 fixed: `session_end` exists at the end of the sequence.
     - Pitch `tab_exit` dwell is approximately 5, not approximately 10.

Technical notes

- `src/main.tsx` does not currently wrap the app in `React.StrictMode`, so React StrictMode double-effect runs are unlikely to be the cause.
- `Portal.tsx` currently registers the `beforeunload` handler with `[trackEvent]`. The handler reads refs at fire time, so a plain stale closure over the ref object is unlikely; the diagnostic will confirm whether the ref value itself is stale.
- The provider-level `beforeunload` currently flushes the queue but does not append `session_end`; that is a confirmed implementation gap and will be changed directly after approval.