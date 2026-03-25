
Root cause: the issue is not the integrations content itself. `IntegrationStrip` renders inside `EditableBackground`, and `EditableBackground` swaps the actual `<section>` DOM node once style data finishes loading. `useScrollAnimation` currently observes only the first mounted node (`ref.current` once in `useEffect`). After the DOM swap, the observer stays attached to the old node, the new live node is never observed, and `isVisible` can remain `false` forever. Because the content container is gated by `opacity-0 translate-y-8`, the user sees a blank section background with no content. That is why it appears to “randomly disappear” and why it can work in one session/browser but fail in another.

Implementation plan:

1. Harden `useScrollAnimation` at the hook level
- Refactor `src/hooks/useScrollAnimation.ts` to observe the current live element, not just the initial `ref.current`.
- Use a callback ref or tracked node state so the observer re-attaches whenever the DOM element changes.
- Keep the public API the same (`{ ref, isVisible }`) so existing sections do not break.

2. Make the hook resilient to wrapper-driven remounts
- Recreate/cleanup the observer whenever the target node changes.
- Preserve existing behavior for `threshold`, `rootMargin`, `triggerOnce`, and reduced-motion users.
- Add a safe fallback for environments where `IntersectionObserver` is unavailable so content never stays hidden permanently.

3. Remove the integrations section’s dependency on a brittle cast
- Update `src/components/IntegrationStrip.tsx` to use the hook ref directly on the `<section>` instead of the current manual cast.
- Keep the existing mobile ordering, editable background, SVG, badges, and translations unchanged.

4. Audit for the same failure pattern
- Check other sections using `useScrollAnimation` to ensure they still work with the hardened hook.
- Specifically confirm there are no other components combining animated “hidden until visible” content with wrappers that can swap DOM nodes after mount.

5. Verify the real failure mode is gone
- Test `/en/` from a fresh load, not just after hot reload.
- Confirm the integrations section appears consistently on first load, after refresh, and after CMS style/background data finishes loading.
- Confirm no regressions in other animated sections like `WhyNavio` and `HowItWorks`.

Files expected:
- `src/hooks/useScrollAnimation.ts`
- `src/components/IntegrationStrip.tsx`

Result:
- Fixes the actual race condition instead of patching the integrations section only.
- Prevents this class of “blank section with background but no content” bugs from recurring when components are wrapped in editable/styled CMS containers.
