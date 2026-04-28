# Fix `/investor` gate validation focus and Firm payload

## Findings

`src/components/InvestorGateForm.tsx` already renders the Firm field and stores it in component state. The invoke body also includes `firm`, but the current implementation can be tightened to exactly match the requested contract.

The likely focus failure is caused by the submit button being disabled whenever fields are invalid. A disabled submit button does not reliably trigger the form submit path when clicked, so the synchronous focus logic in `handleSubmit` can be bypassed. Pressing Enter is partially handled by `onKeyDown`, but click behavior on a disabled button cannot focus the invalid input.

## Change 1 — Make invalid submit attempts reach validation focus

In `src/components/InvestorGateForm.tsx`:

- Keep the button disabled only while `loading`, not while the form is invalid.
- Replace the current invalid-state-driven disable logic with explicit synchronous validation in `handleSubmit`.
- Ensure validation focus happens immediately after `event.preventDefault()` and before any state update.

Validation order will be exactly:

```ts
if (!name.trim() || name.trim().length < 2) {
  nameRef.current?.focus();
  return;
}

if (!email.trim() || !EMAIL_RE.test(email.trim().toLowerCase())) {
  emailRef.current?.focus();
  return;
}

if (!password) {
  passwordRef.current?.focus();
  return;
}
```

This ensures both clicking Continue and pressing Enter run the same submit handler and focus the first invalid input without calling the API.

## Change 2 — Add and wire all requested refs

In `src/components/InvestorGateForm.tsx`:

- Add `firmRef` alongside the existing refs:

```ts
const firmRef = useRef<HTMLInputElement>(null);
```

- Wire it to the Firm input:

```tsx
<Input ref={firmRef} ... />
```

Firm remains optional, so `firmRef` is not used for validation focus, but this matches the requested field wiring and preserves tab order.

## Change 3 — Normalize Firm payload exactly as specified

In `src/components/InvestorGateForm.tsx`, submit payload will be explicit:

```ts
const trimmedFirm = firm.trim();

supabase.functions.invoke("validate-portal-access", {
  body: {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    firm: trimmedFirm.length > 0 ? trimmedFirm : null,
    password,
  },
});
```

The session state will also store the same normalized Firm value:

```ts
firm: trimmedFirm.length > 0 ? trimmedFirm : null
```

## Verification to run after implementation

1. Submit empty form and confirm Name receives focus.
2. Type valid name, leave email empty, submit and confirm Email receives focus.
3. Type valid name and email, leave password empty, submit and confirm Access code receives focus.
4. Type valid name, email, `Acme Capital` in Firm, correct password, submit successfully.
5. Inspect the `validate-portal-access` request payload and confirm `firm: "Acme Capital"`.
6. Repeat with Firm blank and confirm payload has `firm: null`.

## Files changed

| File | Change |
|---|---|
| `src/components/InvestorGateForm.tsx` | Fix submit/focus flow, add `firmRef`, and send normalized Firm value exactly as specified |