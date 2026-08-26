# Homie Foundation

## Status

Foundation status: **GREEN** — the engineering foundation is complete. Expo/React Native architecture, TypeScript, Supabase client, database profiles table with RLS, Git baseline commit, and documentation are all in place. The next phase is login and account creation.

## Architecture

Homie is a single Expo and React Native application written in TypeScript. Expo Router provides file-based navigation. The same source supports iOS, Android, and a secondary web smoke-preview target.

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

### Database foundation

A minimal `profiles` table has been created. It stores display information for each authenticated user and does not duplicate authentication credentials or store passwords.

A `homes` table migration (`supabase/migrations/20260826180000_create_homes_table.sql`) has been written but **not yet applied** — no Supabase MCP connection was available in the session that authored it. It must be applied via `mcp__supabase__apply_migration` (or pasted into the Supabase SQL editor as a one-time stopgap) before the "add a home" feature can be built against it. See `## New Tables` in the migration file for the schema and rationale.

| Column | Type | Description |
|---|---|---|
| `id` | uuid, PK | Matches the authenticated user's ID in `auth.users`. FK with `ON DELETE CASCADE`. |
| `full_name` | text, nullable | Display name. Optional at creation; set during onboarding. |
| `created_at` | timestamptz | Defaults to `now()`. |
| `updated_at` | timestamptz | Defaults to `now()`. Auto-updated via trigger. |

### Row Level Security

RLS is enabled on `profiles`. Four owner-scoped policies (one per CRUD verb) ensure each authenticated user can only access their own profile row:

- `select_own_profile` — `USING (auth.uid() = id)`
- `insert_own_profile` — `WITH CHECK (auth.uid() = id)`
- `update_own_profile` — `USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`
- `delete_own_profile` — `USING (auth.uid() = id)`

All policies are scoped `TO authenticated`. No public or anon access. No broad `USING(true)` policies.

### Future relationship: User → Profile → Home

The intended data relationship for the next feature sequence is:

```
auth.users (Supabase Auth) → profiles (current) → homes (future)
```

The `homes` table will be created when the home creation feature is built. It will reference `auth.users(id)` and have its own owner-scoped RLS policies. Maintenance, project, and other product tables will follow the same pattern.

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
2. Open the Homie project in Bolt and use the Device Preview control to generate the Expo QR code.
3. Scan the QR code from Expo Go while the iPhone and development environment can reach the same project connection.
4. Confirm the welcome screen opens, the foundation status is shown, the tab bar switches between all four tabs, and the authentication placeholder can be opened and backed out of.
5. Check an iPhone with a notch and the keyboard when future forms are introduced; the foundation already provides safe-area and keyboard-avoiding containers.

Expo Go is the fastest path for JavaScript-only development. A development build is required when future work adds native modules not included in Expo Go.

## Expo and EAS

`app.json` identifies the app as Homie with the `homie` URL scheme, portrait orientation, iOS bundle identifier `com.homie.app`, and Android package `com.homie.app`. These identifiers should be treated as permanent once a store build exists.

`assets/images/icon.png` (1024×1024) and `assets/images/favicon.png` are placeholder marks in the brand teal (`colors.primary`) with a simple house glyph, generated to unblock builds. They satisfy `app.json`'s asset requirements but should be replaced with final brand artwork before any App Store or Play Store submission — a placeholder icon is acceptable for internal/dev builds, not for public release.

`eas.json` includes development, preview, and production build profiles, each with an explicit `"environment"` field of the same name. This maps each profile to an EAS Environment Variables scope so development/preview and production builds can point at different Supabase projects without editing `eas.json` or committing project-specific values. Set the actual values with `eas env:create` (or the EAS dashboard) per environment — see the Supabase connection steps below. Before building outside Bolt, use an Expo account and EAS CLI, then run Expo's project diagnostics. EAS manages native signing credentials during the build flow.

## Connecting Supabase (dev and production)

Two separate Supabase projects are required — one for development, one for production — so dev and prod data are never mixed (a non-negotiable per `CLAUDE.md`).

For each project:

1. Create the project in the Supabase dashboard.
2. Copy its Project URL and anon/public key (Project Settings → API). Never copy the service-role key into anything client-facing.
3. Replay the migrations in `supabase/migrations/` in order against that project (via the Supabase MCP `apply_migration` tool when connected, or the SQL editor as a one-time stopgap) so both projects have identical schema and RLS.

Then wire the values in:

- **Local development**: copy `.env.example` to `.env` and fill in the dev project's URL/anon key. `.env` is gitignored and never committed.
- **EAS builds**: run `eas env:create` for each of the `development`, `preview`, and `production` environments with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` — development/preview pointing at the dev project, production at the prod project. This keeps both values out of committed files while still being available at build time.

To let a future Claude Code session run migrations directly (recommended), connect the Supabase MCP connector for this GitHub-connected environment/org — until then, migrations are written to `supabase/migrations/` but must be applied manually.

## iOS path

For device testing, use Expo Go first. For a shareable native build, use an EAS development or preview build. For TestFlight, an Apple Developer account is required; create an iOS production build and submit it through EAS, then manage testers in App Store Connect.

## Android path

Use Expo Go for early testing. For a shareable Android build, use an EAS preview build. For Google Play testing and release, an Android package identity and Google Play Developer account are required; upload the production Android build through Play Console.

## GitHub and source control

A local Git repository has been initialized with a baseline commit containing the full foundation. The `.gitignore` excludes `.env`, `node_modules/`, `.expo/`, `dist/`, `web-build/`, and other build artifacts. The `.env.example` file with placeholder-only values is committed.

**GitHub connection status**: Connected. The repository `mckev23/homie` on GitHub serves as the permanent source-control backup. The full foundation has been pushed to the `main` branch.

**Git safety rules:**

- `.env` is always ignored and must never be committed.
- `.env.example` contains placeholders only and is committed.
- Service-role keys must never appear in any committed file.
- Build artifacts (`node_modules/`, `.expo/`, `dist/`, `web-build/`) are ignored.
- Source code, documentation, and configuration files are committed.
- The working tree should be clean after each completed feature.

## Known limitations

- The `homes` table migration exists in the repo but has not been applied to any Supabase project yet (no MCP connection when it was written).
- No Supabase project connection has been verified from within a Claude Code session — confirm a project exists, note whether email confirmation is on/off, and connect the Supabase MCP connector if direct migration application is wanted.
- Dev and production Supabase projects are not yet provisioned or wired into EAS environments — see "Connecting Supabase" above.
- App icon and favicon are placeholder brand marks, not final artwork — fine for dev/internal builds, must be replaced before store submission.
- No crash/error reporting is wired up; `src/logger.ts` only logs in `__DEV__`.
- No CI (lint/typecheck) runs on push.
- The browser preview cannot validate native iPhone behavior.
- A physical-device check has not been performed by this environment.
- App store signing, TestFlight, and Play Console setup require the owner's developer accounts.
- GitHub remote is connected (`mckev23/homie`).
