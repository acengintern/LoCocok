# Task 2: Create AuthHeroBanner and Integrate Dynamic Branding into AuthLayout

## Task Details
**Files:**
- Create: `free-nextjs-admin-dashboard/src/components/auth/AuthHeroBanner.tsx`
- Modify: `free-nextjs-admin-dashboard/src/app/(full-width-pages)/(auth)/layout.tsx`

**Requirements:**
1. Create `src/components/auth/AuthHeroBanner.tsx`:
   - Client component consuming `useSettings()`.
   - Render right-side panel: `bg-brand-950 dark:bg-white/5` with decorative SVG background grids (`GridShape`).
   - Centered brand block with `loco.png` in a crisp rounded-2xl container.
   - Dynamic title: `settings.agency_name || "LOCO TRACK"`.
   - Tagline: "Platform manajemen kampanye kreatif, approval aset, & pelacakan performa tim agensi Anda."
2. In `src/app/(full-width-pages)/(auth)/layout.tsx`:
   - Mount `<AuthHeroBanner />` in the right pane.
3. Test: Run `npm run build` in `free-nextjs-admin-dashboard` to verify clean compilation with 0 errors across all routes.
4. Commit: `git commit -am "feat(auth): integrate dynamic agency brand hero banner in AuthLayout"`
