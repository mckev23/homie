# hōm — Brand Reference

**Status: rebrand in progress.** The product is still called and configured as "Homie" throughout the codebase — see the rename inventory below. This document is the source of truth for the new brand while that transition happens. Nothing irreversible (bundle ID, deep link scheme) has been changed yet.

## Name

- **Primary name**: hōm (lowercase, with macron over the o)
- **ASCII fallback**: hom — use anywhere the macron can't render: domains, usernames, URL slugs, bundle identifiers, database/project names, file names, code identifiers.
- Never spell it "home" or "homm" as a fallback — "hom" is the deliberate fallback spelling.

## Taglines

- **Primary**: "Bringing peace, confidence, and joy back to homeownership."
- **Short / tight spaces** (App Store subtitle, nav bar): "More calm. More confidence. More joy at home."

## Brand colors

| Token | Hex | Role |
|---|---|---|
| Navy | `#1E3A5F` | Primary text, wordmark, "bottom stone" of the mark |
| Teal | `#5B9C8F` | Accent — "peace" / calm elements |
| Peach | `#F0A868` | Accent — "joy" |
| Warm cream | `#FBF3EA` | Background (replaces the old cooler off-white) |

Applied to `src/theme.ts`: `primary`=teal, `secondary`=navy, `accent`=peach, `background`=cream, `text`=navy. `primaryDark`/`primarySoft`/`secondarySoft`/`textSoft` are **mechanically derived tints**, not brand-specified — they're placeholders until a real design pass (ideally against actual screenshots) confirms them. `success`/`warning`/`error`/`muted`/`border`/`surface` are untouched from the old palette and may read slightly cool against the new warm cream background — revisit together with the derived tints.

## Typography

- **Wordmark**: "hōm" in Quicksand Bold. The macron over the "o" is drawn natively as a small rounded rectangle positioned above the letter — not a font glyph, not an image. Implemented in `components/Wordmark.tsx` (built, not yet wired into any live screen).
- No other typeface change requested or made — body/heading text elsewhere in the app is unaffected for now.

## Visual mark

- New logo will be a **stacked-stones mark** (icon SVG, wordmark SVG, full lockup — to be dropped into the project by the PM). Deliberately *not* a house/roofline glyph — nearly every competitor (Dwello, Casa, HomeZada, HomeBinder, and the old Homie mark itself) uses a literal house/roof icon; the stacked-stones mark avoids that visual cliché.
- Icon/splash pipeline: once the SVG files are added, wire them into `app.json` via the existing Expo icon/splash config (`icon`, `android.adaptiveIcon`, and an `expo-splash-screen` plugin config block with `image`/`backgroundColor`). No splash config exists yet — see rename inventory below.

## Positioning & competitive context

The home-maintenance-app category expanded after **Centriq** (previous market leader) shut down in Jan 2025. No dominant player has emerged since — the market is real but crowded (10+ competitors: Dwello, Casa, HomeZada, Dib, HomeBeacon, HomeBinder, Toolbox, Hearth, and others).

- **Dwello.homes** — closest competitor to our planned MVP feature set (home health score, appliance inventory, maintenance reminders). Their differentiation is an AI-advisor layer that takes actions on the user's behalf — explicitly out of scope for our MVP. **Our differentiation can't be "we're the AI one."** It has to come from elsewhere: simpler onboarding, calmer/lower-anxiety UX, Android support (Dwello is iOS-only), or a sharper wedge.
- **Casa** — VC-backed, human-concierge/marketplace layer, geo-limited to SF/LA. Lower direct overlap since marketplace is out of our MVP scope.
- Nearly every competitor (including the old Homie branding) uses a literal house/roofline icon — the new stacked-stones mark deliberately avoids that.
- **Core brand wedge**: calm/low-anxiety positioning — soft language, no red-alert-style dashboards — versus competitors who lean anxiety-driven ("your water heater is entering its replacement window") or spreadsheet-complex (HomeZada).

This section exists so the positioning survives context resets across future sessions — treat it as background, not a feature spec. It doesn't change MVP scope in `CLAUDE.md` on its own.

## Open items — unresolved, do not treat as settled

- **Trademark**: "hōm" vs. HOM Furniture (Minneapolis-based retailer) — not cleared. Needs a real trademark attorney's opinion before public launch. Informal research is not sufficient.
- **Domain and App Store name availability** for "hōm" — not yet checked/locked down.

Do not commit to the name publicly (App Store listing, marketing, domain purchase) until both are resolved.

## Rename inventory (audit — nothing renamed yet)

Every place "Homie"/"homie" appears in the codebase as of this audit, grouped by how expensive each is to change later.

### Cheap — cosmetic text/labels, change anytime, no functional impact
- `app/login.tsx`, `app/signup.tsx`, `app/index.tsx`, `app/(tabs)/home.tsx`, `app/(tabs)/settings.tsx` — user-facing copy ("Sign in to your Homie account", "WELCOME TO HOMIE", etc.)
- `components/BrandMark.tsx` — `accessibilityLabel="Homie"`, and the require path for `homie-logo.png`
- `src/logger.ts` — `[Homie]` console prefix (dev-only, invisible to users)
- `CLAUDE.md`, `docs/FOUNDATION.md`, `docs/DEVELOPMENT_RULES.md` — project documentation prose
- `package.json` `"name": "bolt-expo-starter"` — actually not "Homie"-branded at all; it's a leftover Bolt template name. Separate, low-priority cleanup whenever renaming happens.

### Low-moderate — functional, reversible, but has a one-time side effect
- `src/secure-storage.ts` — `PREFIX = 'homie-auth-'`, the SecureStore key prefix for the persisted auth session. Changing it will silently sign out anyone with an already-installed build (they'd just need to log in again). Fine pre-launch; worth doing deliberately once, not repeatedly.
- Supabase project **display names** ("Homie Dev", "Homie Production") — purely cosmetic dashboard labels. The actual project refs (`mhdlhmelgdxdovpwigny`, `eqhwvpjscarwhfstecjv`) and URLs are random strings, never human-readable/branded, and cannot be renamed regardless — so there's no functional reason to recreate the projects, only a cosmetic dashboard rename if desired.
- GitHub repo name `mckev23/homie` — GitHub auto-redirects the old URL after a rename, but docs (`FOUNDATION.md`) hardcode the current name/URL and would need updating; do deliberately, not casually.

### Expensive / time-sensitive — flagged per your request

- **iOS/Android bundle identifiers** (`com.homie.app` in `app.json`) — **the one to decide first.** No EAS project has been linked yet and no build has been submitted to App Store Connect or Play Console. Once a build is submitted under this identifier, it is effectively permanent — changing it later means a brand-new app listing, losing any TestFlight testers/history. This is the ideal, low-cost moment to change it, before the EAS build pipeline (currently being set up) goes further.
- **Deep link URL scheme** (`"scheme": "homie"` in `app.json`) — used for email verification and password-reset redirect links. Low real risk today (pre-launch, no users with in-flight links), but same category as the bundle ID: better locked in before wider testing.
- **`app.json` `slug`** (currently `"homie"`) — determines the EAS project's URL slug (`expo.dev/@account/<slug>`) the first time `eas init` runs. **Time-sensitive**: `eas init` has not been run yet, so changing this now is free. Once a project exists under a slug, renaming it later is possible but adds friction.
- **Supabase project ref/URL** — cannot be renamed at all, by design (Supabase doesn't support this). Not a real issue since it was never human-readable/branded in the first place — only relevant if you want a custom domain later (a paid Supabase feature, out of scope).
- **App Store / Play Store listing name** — actually cheap, not expensive: both stores allow renaming a live listing without losing reviews or rankings. Flagging this mainly to say it's *not* in the same risk category as the bundle ID.

**Recommendation**: decide the bundle identifier, deep link scheme, and `app.json` slug together, before running `eas init` — all three are cheap right now and expensive later. Everything else can change on your timeline.
