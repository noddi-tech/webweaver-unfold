# Build `/investor` Investor Portal Gate

## Corrections included

This plan incorporates the approved corrections:

1. Reuse the actual homepage Header logo element, not a text fallback.
2. Preserve the exact typography, spacing, strings, and Tailwind classes from the original request.
3. Use the exact predefined error-message strings.

## Files to create

### 1. `src/contexts/InvestorSessionContext.tsx`

Create `InvestorSessionProvider` and context exposing:

```ts
interface InvestorSession {
  sessionId: string | null;
  email: string | null;
  name: string | null;
  firm: string | null;
  hasAcceptedNda: boolean;
  isLoaded: boolean;
  setSession: (session: {
    sessionId: string;
    email: string;
    name: string;
    firm: string | null;
    hasAcceptedNda: boolean;
  }) => void;
  markNdaAccepted: () => void;
  signOut: () => void;
}
```

Implementation details:

- Use localStorage key `navio_investor_session`.
- On mount, synchronously read and hydrate `{ sessionId, email, name, firm, hasAcceptedNda }`.
- Set `isLoaded = true` after the read completes, even when no session exists.
- `setSession` updates state and localStorage atomically.
- `markNdaAccepted` updates state and persists the updated session.
- `signOut` clears state and removes localStorage without navigation.

### 2. `src/hooks/useInvestorSession.ts`

Create a thin hook that wraps `useContext(InvestorSessionContext)` and throws if used outside the provider.

### 3. `src/components/InvestorGateForm.tsx`

Create the isolated gate form component.

Exact card structure:

- shadcn `Card`
- `glass-card` utility class
- `rounded-2xl`
- `p-8`

Exact internal content:

1. Eyebrow label:

```text
INVESTOR PORTAL
```

Classes:

```text
text-xs font-semibold tracking-[0.2em] text-muted-foreground mb-2
```

2. Heading:

```text
Welcome.
```

Classes:

```text
text-4xl sm:text-5xl font-bold text-foreground mb-3 leading-tight
```

3. Subheading:

```text
A private space for investors evaluating the Series A round. Enter your details to continue.
```

Classes:

```text
text-base text-muted-foreground mb-8
```

4. Form fields using shadcn `Input` + `Label`:

- Field wrapper spacing: `mb-5` between fields
- Label/input spacing: `mb-2` between label and input

Fields:

- `Full name`
  - required
  - min 2 characters
  - trim before submit
  - placeholder `Jane Doe`

- `Email address`
  - required
  - regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - trim and lowercase before submit
  - `type="email"`
  - placeholder `jane@firm.com`

- `Firm (optional)`
  - optional
  - trim before submit
  - send `null` if empty
  - placeholder `Acme Capital`

- `Access code`
  - required
  - `type="password"` by default
  - eye-toggle button using lucide `Eye` / `EyeOff`
  - input wrapper `relative`
  - icon button positioned absolute on the right side
  - dynamic aria-label: `Show access code` / `Hide access code`
  - placeholder `••••••••`
  - `autoComplete="off"`

5. Inline error region, only when error is set:

Classes:

```text
text-sm text-destructive mb-4
```

Accessibility:

```text
aria-live="polite"
role="alert"
```

Exact wrong-password string:

```text
Access code is incorrect. Please check your invitation email or contact tom@naviosolutions.com.
```

Exact generic-failure string:

```text
We could not verify your access. Please try again or contact tom@naviosolutions.com.
```

6. Submit button:

- shadcn `Button`
- `variant="default"`
- `size="lg"`
- `className="w-full"`
- label `Continue`
- loading label `Verifying…`
- loading icon `Loader2` with `animate-spin`
- disabled when any required field is empty, email regex fails, or loading

7. Footnote:

```text
By continuing, you'll be asked to accept the confidentiality terms.
```

Classes:

```text
text-xs text-muted-foreground mt-4 text-center
```

Submit behavior:

1. Prevent default.
2. Client-side validate.
3. Focus the first invalid field and do not call the API if invalid.
4. Set `loading=true` and clear prior error.
5. Call:

```ts
const { data, error } = await supabase.functions.invoke(
  'validate-portal-access',
  { body: { name, email, firm, password } }
);
```

6. Handle response:

- `error`: show exact generic-failure string, set loading false.
- `data.success === false`: show exact wrong-password string, set loading false, do not clear access code.
- `data.success === true`: extract `data.data.session_id` and `data.data.requires_nda`, call `setSession`, then navigate:
  - `requires_nda === true` → `/investor/nda`
  - `requires_nda === false` → `/portal`

### 4. `src/pages/Investor.tsx`

Create the public investor landing page shell.

Layout:

- Full viewport height.
- Background: `hsl(var(--background))` through existing `bg-background` token.
- No page-body gradient.
- One decorative blob behind the card using existing `--gradient-mesh-velvet`, positioned top-right, fixed coordinates, opacity `0.4`.

Zone 1 — top bar:

- `h-16`
- sticky on mobile, static on desktop
- left: actual homepage Header logo element, extracted/reused from `src/components/Header.tsx` so it matches the live Header logo rendering exactly, without rendering the full navigation header
- logo click returns to homepage
- right text:

```text
Series A · Closing 30 June 2026
```

Classes:

```text
text-sm text-muted-foreground
```

Hidden on mobile with `hidden sm:block`.

Zone 2 — centered content:

- `flex-1`
- `flex items-center`
- card centered
- max width 480px
- full width on mobile with 24px horizontal margins (`px-6`)

Zone 3 — footer:

- `h-16`
- centered text

Exact footer text:

```text
Confidential investor portal · Access governed by NDA
```

Classes:

```text
text-xs text-muted-foreground
```

Redirect behavior:

- Wait for `isLoaded === true`.
- If stored session exists and `hasAcceptedNda === false`, navigate to `/investor/nda`.
- If stored session exists and `hasAcceptedNda === true`, navigate to `/portal`.

## Files to update

### `src/App.tsx`

- Import `Investor`.
- Import `InvestorSessionProvider`.
- Add `InvestorSessionProvider` inside the provider stack between `TranslationProvider` and `CurrencyProvider`.
- Add language-agnostic route outside the `/:lang` routes:

```tsx
<Route path="/investor" element={<Investor />} />
```

This route will be placed in the existing CMS/special routes block so it is not handled by the language redirect flow.

## Logo implementation detail

Because `Header.tsx` currently renders the logo inline from Supabase `brand_settings`, the implementation will extract that exact logo rendering into a reusable component, for example `src/components/BrandLogo.tsx`, and update `Header.tsx` and `Investor.tsx` to use it.

The extracted component will preserve the same behavior from `Header.tsx`:

- `logo_variant === 'image'` renders the configured logo image.
- Otherwise it renders the configured `logo_text` with the same gradient-token behavior.
- It preserves optional logo icon rendering through `lucide-react` `icons`.
- It preserves configured `logo_image_height`.

This creates one small shared logo component while keeping the investor page free of the full homepage navigation.

## Design constraints

- Use existing design tokens from `src/index.css` only.
- No new colors, gradients, fonts, or shadows.
- No hardcoded hex/rgb values.
- No remember-me checkbox.
- No social login.
- No forgot-password link.
- No hero image, illustration, or photo.
- No analytics or tracking calls.
- Do not touch `/cms`, `/admin`, or `/auth` files.

## Verification checklist

After implementation, verify:

- `/investor` renders without errors at 320px, 768px, and 1280px.
- Submitting empty form does not call the API and focuses the first invalid field.
- Submitting invalid email does not call the API.
- Submitting wrong password shows the exact inline wrong-password error and keeps the access code field value.
- Submitting correct password `NavioFunding2026` navigates to `/investor/nda`.
- Refreshing `/investor` after successful gate redirects based on NDA state.
- Eye-toggle reveals/hides access code text.
- Tab order is name → email → firm → access code → eye-toggle → submit.
- Existing routes such as `/`, `/pricing`, and `/careers` still load normally.
- No console errors in the verified flows.