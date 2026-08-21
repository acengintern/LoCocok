# Design Specification: TailAdmin-Style Sign In Page with Dynamic Branding

**Author:** Antigravity Team  
**Date:** 2026-08-21  
**Status:** Approved  
**Reference:** `https://nextjs-demo.tailadmin.com/signin`

---

## 1. Goal & Requirements
1. Update the **Sign In** screen (`src/app/(full-width-pages)/(auth)/signin/page.tsx` & `src/components/auth/SignInForm.tsx`) to match the exact visual fidelity and styling of TailAdmin demo (`https://nextjs-demo.tailadmin.com/signin`).
2. Integrate **Dynamic Branding** from `useSettings()`:
   - Page `<title>` and metadata dynamically incorporate `settings.agency_name || "LOCO TRACK"`.
   - Right-side branding hero in `AuthLayout` renders the dynamic `agency_name` and `loco.png` logo.
   - Header titles on the signin form dynamically refer to the agency workspace.
3. Preserve existing authentication flow (`useAuth().login()`, error handling with `errors` validation bags, 401 unauthenticated alerts, and redirect to `/dashboard`).

---

## 2. Component Architecture & Visual Layout

### Dual-Pane Layout (`(auth)/layout.tsx`)
- **Left Pane (50% width on `lg` screens, 100% on mobile)**:
  - Back navigation link to `/` ("Back to dashboard") with `<ChevronLeftIcon />`.
  - Main sign-in container:
    - **Header**: `Sign In` title + descriptive subtitle ("Enter your email or username and password to sign in!").
    - **Social Auth Buttons**: "Sign in with Google" & "Sign in with X" with TailAdmin rounded buttons and SVG icons.
    - **Divider**: "Or" horizontal line with background text.
    - **Form Inputs**:
      - `Username or Email` input field (with proper TailAdmin focus rings `focus:ring-brand-500/20 focus:border-brand-500`).
      - `Password` input field with toggleable eye icon (`EyeIcon` / `EyeCloseIcon`).
      - Remember me checkbox (`Keep me logged in`) + "Forgot password?" link.
      - Full-width primary CTA button: "Sign in" (`bg-brand-500 hover:bg-brand-600 shadow-theme-xs`).
    - **Footer**: "Don't have an account? Sign Up" linking to `/signup`.
- **Right Pane (50% width on `lg` screens, hidden on mobile)**:
  - Dark container `bg-brand-950 dark:bg-white/5` with decorative SVG background grids (`GridShape`).
  - Centered brand block:
    - `loco.png` logo in high-res container.
    - Dynamic `settings.agency_name || "LOCO TRACK"` title.
    - Tagline: "Platform manajemen kampanye & tracking performa tim kreatif Anda."
- **Theme Toggler**:
  - Floating `ThemeTogglerTwo` at bottom-right corner.

---

## 3. Data Flow & State Management

```
SettingsContext (GET /settings)
       │
       ▼
   useSettings() ───► AuthLayout (Dynamic Brand Panel)
       │
       ▼
   useSettings() ───► SignInForm (Dynamic Page Title & Metadata)
       │
       ▼
   useAuth().login() ──► POST /api/v1/login ──► router.push("/dashboard")
```

---

## 4. Verification & Testing Criteria
1. `npm run build` succeeds cleanly with 0 TypeScript/lint errors.
2. Sign In form properly submits credentials to `/api/v1/login`.
3. Error messages (validation 422 and invalid credentials 401) display clearly.
4. Changing `agency_name` in System Settings immediately updates the title and branding on `/signin`.
