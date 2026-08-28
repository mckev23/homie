# hōm — Brand Reference

**Status: rebrand complete in the codebase.** Visual identity (app icon, splash screen, in-app logo mark, colors) and the product name (display name, all in-app copy, docs prose) are both live as "hōm". Two purely cosmetic items remain, external to the codebase and not yet done: the GitHub repo name (`mckev23/homie`) and the Supabase project display names ("Homie Dev"/"Homie Production") — see the rename inventory below. Nothing irreversible (bundle ID, deep link scheme) has been changed since the earlier resolution.

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

- **Wordmark**: "hōm" in Quicksand Bold. The macron over the "o" is drawn natively as a small rounded rectangle positioned above the letter — not a font glyph, not an image. Implemented in `components/Wordmark.tsx`, used by `components/BrandMark.tsx` (live on every screen that shows the logo).
- No other typeface change requested or made — body/heading text elsewhere in the app is unaffected for now.

## Visual identity — live

The final logo (stacked-stones icon + wordmark + tagline) was delivered as PNG exports and is now wired in:

- **App icon / favicon** (`assets/images/icon.png`, `favicon.png`): the stones mark, cropped square and upscaled from the source (1024×1024 / 196×196). **The source art is only 610×600px** — fine for dev/internal builds, but get a proper high-res or vector (SVG) export before real App Store/Play Store submission; upscaling this far will look soft at full resolution.
- **Splash screen**: configured via the `expo-splash-screen` config plugin in `app.json` — the same stones mark centered on the `#FBF3EA` cream background.
- **In-app logo** (`components/BrandMark.tsx`): now renders the stones icon (`assets/images/hom-icon.png`) beside the code-rendered `Wordmark` component, replacing the old flattened Homie logo image. Live on every screen that uses `BrandMark` (welcome, login, signup, verify-email).
- `assets/images/hom-logo-full.png` keeps the full lockup (icon + wordmark + tagline) as a reference asset for future marketing use; not wired into the app itself.
- The old `assets/images/homie-logo.png` is no longer referenced anywhere in code but was left in place rather than deleted.

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

## Rename inventory (audit — see what's done vs. still open)

### Done
- `app.json` display `name`: `"Homie"` → `"hōm"`.
- `app/login.tsx`, `app/signup.tsx`, `app/index.tsx`, `app/(tabs)/home.tsx`, `app/(tabs)/settings.tsx` — all user-facing copy renamed ("Sign in to your hōm account", "WELCOME TO HŌM", etc.)
- `src/logger.ts` — `[Homie]` → `[hōm]` console prefix (dev-only, invisible to users).
- `src/secure-storage.ts` — `PREFIX = 'homie-auth-'` → `'hom-auth-'` (ASCII fallback, per the Name convention above). **One-time side effect**: this silently signs out anyone with an already-installed build — their old stored session is orphaned under the new key prefix, they just log in again. Acceptable pre-launch.
- `CLAUDE.md`, `docs/FOUNDATION.md`, `docs/DEVELOPMENT_RULES.md` — project documentation prose renamed, except factual references to still-unrenamed external names (GitHub repo, Supabase project display names — see below), which stay accurate to current reality.
- `supabase/migrations/20260814155737_create_profiles_table.sql` — comment text only, no schema/behavior change.

### Still open — external to the codebase, cosmetic only, no functional impact
- Supabase project **display names** ("Homie Dev", "Homie Production") — purely cosmetic dashboard labels. The actual project refs (`mhdlhmelgdxdovpwigny`, `eqhwvpjscarwhfstecjv`) and URLs are random strings, never human-readable/branded, and cannot be renamed regardless — so there's no functional reason to recreate the projects, only a cosmetic dashboard rename if desired.
- GitHub repo name `mckev23/homie` — GitHub auto-redirects the old URL after a rename. Do deliberately when asked, not bundled into a routine commit.
- `package.json` `"name"`: currently `"homeapp"` (a deliberately brand-neutral internal codename, matching the bundle ID reasoning below) — not "hōm"-branded on purpose, not a gap.

### Expensive / time-sensitive — resolved

These three were resolved together, before `eas init` was ever run, by switching to a **brand-neutral internal codename** instead of either "Homie" or "hōm" — so a future brand name change (this one, or any later one) never touches them again:

- **iOS/Android bundle identifiers**: `com.homie.app` → **`com.homeapp.mobile`**. (Briefly used `com.mckev23.homeapp` — the developer's GitHub handle — but changed on request: a bundle ID ships inside the compiled binary and is inspectable by anyone, so it shouldn't carry anything tied to a real person. `com.homeapp.mobile` is fully generic — no personal identity, no brand name.)
- **Deep link URL scheme**: `"homie"` → **`"homeapp"`**.
- **`app.json` `slug`**: `"homie"` → **`"homeapp"`** (free to change — `eas init` had not been run yet, so no EAS project existed under the old slug).

`app.json`'s display `name` is now `"hōm"` (shown under the icon and in store listings) — the full text/name cutover is complete, see "Done" above. `package.json`'s `name` is `"homeapp"` for consistency with the bundle ID reasoning above (it was `"bolt-expo-starter"`, a leftover template name, not even "Homie"-branded).

- **Supabase project ref/URL** — cannot be renamed at all, by design (Supabase doesn't support this). Not a real issue since it was never human-readable/branded in the first place — only relevant if you want a custom domain later (a paid Supabase feature, out of scope).
- **App Store / Play Store listing name** — actually cheap, not expensive: both stores allow renaming a live listing without losing reviews or rankings. Noted mainly to say it's *not* in the same risk category as the bundle ID.
