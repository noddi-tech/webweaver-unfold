Plan to address the two NDA scroll-gate verification items:

1. Confirm the scroll fallback target
   - `src/components/NdaScrollGate.tsx` already renders the actual scroll container with `data-scroll-gate="true"`, `tabIndex={0}`, `aria-label="Confidentiality agreement text"`, and `max-h-[50vh] overflow-y-auto` on the same `<div>`.
   - No code change is needed in this file unless you want the JSX attribute order adjusted to exactly match the prompt.

2. Add development-only hook logging
   - Update `src/hooks/useScrolledToBottom.ts` so every path that flips the gate logs in development only:
     ```ts
     if (import.meta.env.DEV) {
       console.log('[NDA] scrolled to bottom — checkbox now enabled', {
         via: 'observer-or-scroll'
       });
     }
     ```
   - To avoid duplicated logging from both the observer and scroll fallback, I will centralize the state flip in a small helper such as `markScrolled()` and call that helper from both trigger paths.
   - Production builds will not emit the log because it is guarded by `import.meta.env.DEV`.

3. Report reviewable diffs
   - After implementation, I will report only the two relevant file diffs:
     - `src/components/NdaScrollGate.tsx`: confirmation/no-op or exact attribute-order adjustment if requested.
     - `src/hooks/useScrolledToBottom.ts`: development-only console log addition.