# hōm Foundation

## Status

Foundation status: **GREEN** — the engineering foundation is complete. Expo/React Native architecture, TypeScript, Supabase client, database profiles table with RLS, Git baseline commit, and documentation are all in place. The next phase is login and account creation.

## Architecture

hōm is a single Expo and React Native application written in TypeScript. Expo Router provides file-based navigation. The same source supports iOS, Android, and a secondary web smoke-preview target.

Primary targets are iOS and Android. The browser preview is not a substitute for testing safe areas, touch behavior, keyboard handling, native navigation, or device performance.

## Technology choices

- Expo SDK 54
- React Native 0.81
- TypeScript with strict checking
- Expo Router
- Supabase JavaScript client
- `react-native-safe-area-context` for device cutouts and home indicators
- `lucide-react-native` for line icons
- No new runtime dependencies were added for the foundation

## Project structure

- `app/`: Expo Router screens and navigation
- `app/(tabs)/`: primary Home, Maintenance, Projects, and Settings tabs
- `components/`: reusable screen, button, card, brand, and status primitives
- `src/theme.ts`: color, typography, spacing, radius, and shadow tokens
- `src/config.ts`: client configuration detection
- `src/supabase.ts`: client-safe Supabase singleton
- `src/logger.ts`: development-only app event logging
- `hooks/useFrameworkReady.ts`: required Bolt framework startup hook
- `assets/images/`: app icon and favicon
- `eas.json`: EAS development, preview, and production profiles
- `claude.md`: permanent project engineering rules

## Navigation

The first route is a welcome screen. It links to an authentication placeholder and to the tab navigator. The tab navigator currently contains Home, Maintenance, Projects, and Settings placeholders. Authentication is not implemented in this phase.

## Supabase architecture

The mobile app initializes Supabase from the public project URL and anon key. The anon key is client-safe when protected by correct RLS policies. A service-role key must never be included in the mobile app. All signed-in data features must use Supabase Auth and owner-scoped RLS policies together in the same feature.

**Two live projects exist and are schema-identical** (verified via the Supabase MCP connector):

| Environment | Project name | Project ref |
|---|---|---|
| Development | Homie Dev | `mhdlhmelgdxdovpwigny` |
| Production | Homie Production | `eqhwvpjscarwhfstecjv` |

Both are on Postgres 17. Every migration in `supabase/migrations/` has been applied to both via `mcp__supabase__apply_migration`, and the Supabase security advisor is clean on both except one platform-internal function (`public.rls_auto_enable`) that hōm's migrations did not create and should not modify.

Project display names above are still "Homie Dev"/"Homie Production" in the Supabase dashboard — purely cosmetic, not yet renamed (see `BRANDING.md`).

### Database foundation

A minimal `profiles` table stores display information for each authenticated user and does not duplicate authentication credentials or store passwords.

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Matches the authenticated user's ID in `auth.users`. FK with `ON DELETE CASCADE`. |
| `full_name` | text, nullable | Display name. Optional at creation; set during onboarding. |
| `created_at` | timestamptz | Defaults to `now()`. |
| `updated_at` | timestamptz | Defaults to `now()`. Auto-updated via trigger. |

A `homes` table (schema in `supabase/migrations/20260826180000_create_homes_table.sql`) is live on both projects, empty, ready for the "add a home" feature:

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | `gen_random_uuid()`. |
| `user_id` | uuid | Owner. FK to `auth.users(id)` with `ON DELETE CASCADE`. |
| `nickname` | text | Defaults to `'My Home'`. |
| `address` | text, nullable | Single free-text line — low friction over structured fields. |
| `postal_code` | text, nullable | For future climate-aware guidance. |
| `year_built` | integer, nullable | For future age-based maintenance guidance. |
| `created_at` / `updated_at` | timestamptz | Same pattern as `profiles`. |

A `home_systems` table (`20260827120000_create_home_systems_table.sql`) records which of a fixed, small set of systems a home has:

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | `gen_random_uuid()`. |
| `home_id` | uuid | FK to `homes(id)` with `ON DELETE CASCADE`. |
| `user_id` | uuid | Denormalized owner reference — same pattern as `homes` — so RLS policies check `auth.uid() = user_id` directly instead of joining through `homes`. |
| `system_type` | text | `CHECK`-constrained to `'heating' \| 'cooling' \| 'water_heater' \| 'electrical_panel' \| 'sewer_septic'`. |
| `created_at` / `updated_at` | timestamptz | Same pattern as `profiles`. |

Unique on `(home_id, system_type)` — toggling a system on twice is a no-op, not a duplicate row.

A `maintenance_tasks` table (`20260827130000_create_maintenance_tasks_table.sql`) holds the "simple maintenance schedule" (MVP sequence step 4):

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | `gen_random_uuid()`. |
| `home_id` | uuid | FK to `homes(id)` with `ON DELETE CASCADE`. |
| `user_id` | uuid | Denormalized owner reference, same reasoning as `home_systems`. |
| `system_type` | text, nullable | Informational link back to the system category this task came from. No FK to `home_systems` — removing a system should not silently delete task history. |
| `title` | text | e.g. "Replace furnace filter". |
| `frequency_months` | integer | A recurrence cadence, not a predicted date — matches the "no false precision" product rule. |
| `last_completed_at` | timestamptz, nullable | Null means never completed. |
| `created_at` / `updated_at` | timestamptz | Same pattern as `profiles`. |

Unique on `(home_id, title)` so re-saving systems seeds via `ON CONFLICT DO NOTHING` and never resets a task's completion history. Seeded from a small static best-practice template per system type in `src/maintenance.ts`, not a dynamic recommendation engine.

### Row Level Security

RLS is enabled on `profiles`, `homes`, `home_systems`, and `maintenance_tasks`. Four owner-scoped policies each (one per CRUD verb):

- `profiles`: `auth.uid() = id`
- `homes`, `home_systems`, `maintenance_tasks`: `auth.uid() = user_id`

All policies are scoped `TO authenticated`. No public or anon access. No broad `USING(true)` policies. A follow-up migration additionally revoked public/anon/authenticated `EXECUTE` on `handle_new_user()` — the security advisor flagged it as callable as an RPC endpoint; it's a `SECURITY DEFINER` trigger function that would error if invoked outside trigger context, but there was no reason to leave that surface open.

### Relationship: User → Profile → Home → Systems / Maintenance

```
auth.users (Supabase Auth) → profiles → homes → home_systems
                                              → maintenance_tasks
```

Maintenance and project tables will follow the same owner-scoped pattern once the "add a home" feature is built and validated.

### Supabase client configuration

The Supabase client is initialized in `src/supabase.ts` with `autoRefreshToken: false`, `detectSessionInUrl: false`, and `persistSession: false`. This is correct for the foundation phase where no authentication is implemented yet.

When the login/account-creation feature is built, the client will be updated to enable session persistence using a React Native secure storage adapter (`expo-secure-store`). The specific changes needed at that time are:

1. Install `expo-secure-store`.
2. Set `autoRefreshToken: true`.
3. Set `persistSession: true`.
4. Provide a custom storage adapter backed by `expo-secure-store`.
5. Keep `detectSessionInUrl: false` (not relevant on native).

### Authentication architecture (prepared, not yet implemented)

The next phase will implement email/password authentication using Supabase Auth. The architecture will be:

- **Sign-up**: `supabase.auth.signUp({ email, password })` — creates the auth user and a corresponding `profiles` row.
- **Sign-in**: `supabase.auth.signInWithPassword({ email, password })`.
- **Sign-out**: `supabase.auth.signOut()`.
- **Session persistence**: via `expo-secure-store` custom storage adapter.
- **Auth state listener**: `supabase.auth.onAuthStateChange()` wrapped in an async IIFE to avoid deadlock (per Supabase React Native guidance).
- **Email verification**: Supabase Auth email confirmation stays OFF for development (per project rules).
- **Password reset**: `supabase.auth.resetPasswordForEmail()`.
- **Navigation**: signed-out users see the welcome/auth screens; signed-in users see the tab navigator. A root-level auth state check will gate navigation.
- **No social auth**: Apple/Google sign-in is deferred until explicitly requested.

## Database migrations and repeatability

All database schema changes are made through the Supabase MCP `apply_migration` tool, which records each migration with a filename and timestamp. This ensures the database structure is reproducible and documented.

**How to make future schema changes:**

1. Use the `mcp__supabase__apply_migration` tool (never raw SQL outside it, never the Supabase CLI).
2. Start each migration with a multi-line comment summary explaining the changes.
3. Use `IF NOT EXISTS` / `IF EXISTS` for idempotency.
4. Drop policies before recreating them (`DROP POLICY IF EXISTS` before `CREATE POLICY`).
5. One migration per logical change.
6. Never use `DROP` table, `DELETE` column, or rename tables — these lose data.
7. Never use transaction control statements (`BEGIN`, `COMMIT`, `ROLLBACK`).
8. Always enable RLS on new tables and write four separate owner-scoped policies.

The migration history is visible via `mcp__supabase__list_migrations`. To recreate the schema in another Supabase environment, replay the migrations in order.

## Environment variables

`.env.example` contains placeholders only:

- `EXPO_PUBLIC_SUPABASE_URL`: public Supabase project URL; client-safe.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: public Supabase anon key; client-safe, but never substitute a service-role key.

The local `.env` file is ignored by Git and contains real values for development only. Secret values, if required by future server-side Edge Functions, must remain server-side and must not be copied into Expo public variables.

## Mobile testing procedure

1. Install Expo Go on the physical iPhone.
2. Open the hōm project in Bolt and use the Device Preview control to generate the Expo QR code.
3. Scan the QR code from Expo Go while the iPhone and development environment can reach the same project connection.
4. Confirm the welcome screen opens, the foundation status is shown, the tab bar switches between all four tabs, and the authentication placeholder can be opened and backed out of.
5. Check an iPhone with a notch and the keyboard when future forms are introduced; the foundation already provides safe-area and keyboard-avoiding containers.

Expo Go is the fastest path for JavaScript-only development. A development build is required when future work adds native modules not included in Expo Go.

## Expo and EAS

`app.json`'s display `name` is "hōm" (consumer-facing; the full name/text rebrand is complete — see `BRANDING.md`). Its technical identifiers — `slug` (`homeapp`), URL `scheme` (`homeapp`), iOS bundle identifier and Android package (`com.homeapp.mobile`) — were deliberately chosen as a brand-neutral internal codename, decoupled from both "Homie" and "hōm", specifically so a future brand name change never touches them again. The bundle ID was originally `com.mckev23.homeapp` (the developer's GitHub handle) but was changed to the fully generic `com.homeapp.mobile` — a bundle ID ships inside the compiled binary and is inspectable by anyone (App Store tooling, decompilation, third-party app-intelligence sites), so it shouldn't carry anything tied to a real person, even a handle already public elsewhere. These identifiers should be treated as permanent once a store build exists.

`assets/images/icon.png` (1024×1024) and `assets/images/favicon.png` are the final "hōm" stones mark (see `BRANDING.md`), upscaled from a 610×600px source — fine for dev/internal builds, needs a proper high-res/vector export before any App Store or Play Store submission.

The splash screen is configured via the `expo-splash-screen` config plugin in `app.json`'s `plugins` array — the stones mark (`assets/images/hom-icon.png`) centered on the `#FBF3EA` cream background.

`eas.json` includes development, preview, and production build profiles, each with an explicit `"environment"` field of the same name. This maps each profile to an EAS Environment Variables scope so development/preview and production builds can point at different Supabase projects without editing `eas.json` or committing project-specific values. Set the actual values with `eas env:create` (or the EAS dashboard) per environment — see the Supabase connection steps below. Before building outside Bolt, use an Expo account and EAS CLI, then run Expo's project diagnostics. EAS manages native signing credentials during the build flow.

## Connecting Supabase (dev and production)

**Status: connected.** Two Supabase projects exist — `Homie Dev` (`mhdlhmelgdxdovpwigny`) and `Homie Production` (`eqhwvpjscarwhfstecjv`) — display names not yet renamed (cosmetic only, see `BRANDING.md`) — and both have the full migration history applied and verified (see Supabase architecture above). A "Supabase" connector is authorized for this Claude Code account/org, so future sessions can run `apply_migration`, `list_tables`, `get_advisors`, etc. directly against either project by its ref.

Remaining wiring, not yet done:

- **Local development**: copy `.env.example` to `.env` and fill in the **dev** project's URL/anon key (Project Settings → API, or `get_project_url` / `get_publishable_keys` via the MCP connector). `.env` is gitignored and never committed. Never point local development at the production project.
- **EAS builds**: run `eas env:create` for each of the `development`, `preview`, and `production` environments (these map to `eas.json`'s `"environment"` fields) with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` — development/preview pointing at the dev project, production at the prod project. This is a local/CI action requiring an authenticated `eas` CLI session; it hasn't been run yet.

## iOS path

For device testing, use Expo Go first. For a shareable native build, use an EAS development or preview build. For TestFlight, an Apple Developer account is required; create an iOS production build and submit it through EAS, then manage testers in App Store Connect.

## Android path

Use Expo Go for early testing. For a shareable Android build, use an EAS preview build. For Google Play testing and release, an Android package identity and Google Play Developer account are required; upload the production Android build through Play Console.

## GitHub and source control

A local Git repository has been initialized with a baseline commit containing the full foundation. The `.gitignore` excludes `.env`, `node_modules/`, `.expo/`, `dist/`, `web-build/`, and other build artifacts. The `.env.example` file with placeholder-only values is committed.

**GitHub connection status**: Connected. The repository `mckev23/homie` on GitHub (name not yet renamed, cosmetic only, see `BRANDING.md`) serves as the permanent source-control backup. The full foundation has been pushed to the `main` branch.

**Git safety rules:**

- `.env` is always ignored and must never be committed.
- `.env.example` contains placeholders only and is committed.
- Service-role keys must never appear in any committed file.
- Build artifacts (`node_modules/`, `.expo/`, `dist/`, `web-build/`) are ignored.
- Source code, documentation, and configuration files are committed.
- The working tree should be clean after each completed feature.

## Auth deep links (password reset)

`resetPasswordForEmail` sends the user back into the app via
`PASSWORD_RESET_REDIRECT` in `src/auth.tsx`, built with
`Linking.createURL('/reset-password')`. That resolves to
`homeapp://reset-password` in a standalone build, and to an
`exp://…/--/reset-password` URL under Expo Go.

`app/reset-password.tsx` reads the tokens off the incoming link
(`src/authLinks.ts` parses both the URL fragment and the query string, so
it works under either the implicit or PKCE flow), exchanges them for a
session via `setSession`, then calls `updateUser` to set the new password.
Expired or already-used links are detected and routed back to
"request a new link" rather than failing silently.

**Required dashboard configuration — the flow does not work without it.**
In each Supabase project, under Authentication → URL Configuration →
Redirect URLs, allow-list the redirect targets. Supabase only honours a
`redirectTo` value that matches the allow-list; otherwise it silently
falls back to the Site URL and the email link will not open hōm:

- `homeapp://**` — standalone / TestFlight / store builds
- the `exp://` URL printed by `npx expo start` — Expo Go development only
  (it changes with the host machine's IP, so re-add it when it changes)

## Account deletion

`delete_current_user()` (migration
`20260828120000_create_delete_current_user_function.sql`) is a
`SECURITY DEFINER` function that deletes the caller's own `auth.users` row.
Every hōm table cascades from `auth.users(id)`, so one statement removes
the profile, home, systems, and maintenance tasks. It takes no parameters
and operates only on `auth.uid()`, so a caller cannot target another
account. `EXECUTE` is revoked from `PUBLIC`/`anon` and granted only to
`authenticated`.

This exists because App Store Guideline 5.1.1(v) requires in-app account
deletion for any app offering account creation. Deletion is a hard delete
by design (see the migration's comment for the rationale) and is behind a
two-step confirmation in `app/(tabs)/settings.tsx`.

## Known limitations

- Email confirmation is confirmed **on** for both projects (verified by the PM directly in each dashboard).
- `delete_current_user()` migration is written but **not yet applied** — the Supabase MCP connector was unavailable in the session that authored it. Apply to both projects via `mcp__supabase__apply_migration` before account deletion will work.
- The password-reset redirect URLs have **not yet been allow-listed** in either Supabase project (see "Auth deep links" above). Until that is done, reset emails will not open the app.
- Neither the password reset nor the account deletion flow has been exercised on a real device — both are typecheck-clean only.
- `eas env:create` has not been run — EAS builds don't yet have Supabase credentials wired in (see "Connecting Supabase" above). Local `.env` also still needs to be created per-machine (gitignored, never committed).
- App icon and favicon are now the final "hōm" stones mark (see `BRANDING.md`). Source art is only 610×600px — fine for dev/internal builds, needs a proper high-res/vector export before real store submission.
- No crash/error reporting is wired up; `src/logger.ts` only logs in `__DEV__`.
- No CI (lint/typecheck) runs on push.
- `npm audit` reports vulnerabilities, all transitive through Expo's native-build tooling (`xcode`/`@expo/config-plugins`, used only by `prebuild`/EAS builds, not shipped in the app bundle). Fixing requires a breaking Expo major-version bump — deliberately deferred, not a silent risk.
- The browser preview cannot validate native iPhone behavior.
- A physical-device check has not been performed by this environment.
- App store signing, TestFlight, and Play Console setup require the owner's developer accounts.
- GitHub remote is connected (`mckev23/homie`).
