# Homie Engineering Instructions

## Product

Homie is a homeowner mobile application that will help homeowners understand, maintain, organize, and financially plan for their homes.

The MVP sequence is:

1. Foundation
2. Login and account creation
3. Add a home
4. Simple maintenance schedule
5. Additional features later

Do not build future features unless explicitly requested.

## Architecture

- Expo
- React Native
- TypeScript
- Supabase
- Expo Router
- One shared iOS and Android codebase
- GitHub-compatible project structure

The web target is only a secondary compatibility target. The primary product is the native mobile application.

## Engineering rules

- Preserve the existing architecture unless a change is explicitly justified.
- Prefer the smallest safe change.
- Do not modify unrelated files.
- Do not replace working infrastructure to solve isolated problems.
- Do not introduce new dependencies without justification.
- Never hardcode secrets.
- Never expose Supabase service-role or secret keys in the mobile app.
- Preserve environment configuration, Supabase configuration, navigation architecture, and design tokens.
- Test changes before declaring them complete.
- Do not claim a bug is fixed without reproducing and validating the affected behavior.
- If the root cause is uncertain, explain the uncertainty instead of making speculative changes.

## Token efficiency

- Keep prompts focused and work incrementally.
- Target relevant files whenever possible.
- Do not reread or rewrite unrelated project areas.
- Reuse existing components and utilities.
- Avoid unnecessary dependencies, abstractions, duplicate components, and abandoned implementations.

## Debugging

When something breaks:

1. Reproduce it.
2. Identify the likely root cause.
3. Inspect only the relevant code or configuration.
4. Make the smallest appropriate fix.
5. Test the fix.
6. Verify existing functionality still works.

Classify issues as code, configuration, credentials, dependency, Supabase, Expo, iOS, Android, GitHub, or preview-environment problems. If the cause cannot be established with reasonable confidence, stop and explain what is known, unknown, and the recommended next step.

## Preview and device testing

The goal is a working application on a physical iPhone. Bolt's browser preview is useful for a visual smoke check but cannot validate native behavior. Use Expo Go for rapid device testing and EAS development builds or TestFlight for more complete native validation.

## Security

- Client code may use only the Supabase URL and anon key.
- Never place service-role keys in the app, `.env.example`, or committed files.
- Use Supabase Auth, PostgreSQL, Row Level Security, Storage, and Edge Functions only when the current feature requires them.
- Do not create database tables or policies until a feature needs durable data.

## Feature workflow

PLAN → IMPLEMENT → TEST → VERIFY → STOP

Implement one logical feature at a time. Test the affected flow and existing navigation before stopping. Do not combine unrelated features.

## Foundation protection

Treat the following as foundational areas that must not be replaced or rewritten unless the requested feature genuinely requires it:

- Supabase initialization and client configuration (`src/supabase.ts`, `src/config.ts`)
- Environment variable handling (`.env`, `.env.example`)
- Navigation architecture (`app/_layout.tsx`, `app/(tabs)/_layout.tsx`)
- Design tokens (`src/theme.ts`)
- Core UI primitives (`components/`)
- Expo configuration (`app.json`)
- EAS configuration (`eas.json`)
- Git configuration (`.gitignore`)
- Database schema and RLS policies (managed via Supabase migrations)
- Documentation (`claude.md`, `docs/FOUNDATION.md`, `docs/DEVELOPMENT_RULES.md`)

When a feature requires changing a foundational area, make the smallest safe change, explain why, and update the relevant documentation.

## Database migration process

All schema changes go through the Supabase MCP `apply_migration` tool. Never make undocumented manual database changes. Never use the Supabase CLI. Each migration must be idempotent, include a summary comment, and enable RLS with owner-scoped policies on any new table. See `docs/FOUNDATION.md` for the full migration process.

## Priority order

1. Application works.
2. Application is stable.
3. Data and credentials are secure.
4. Foundation is maintainable.
5. iPhone testing works.
6. Android compatibility is preserved.
7. Future development remains efficient.
8. Mobile UX is good.
9. Visual fidelity to the supplied Homie design.
10. Speed.
