# Repository Guidelines

## Project Structure & Module Organization
- `src/app/routes` holds TanStack React Start route files and global styles (`app.css`); `routeTree.gen.ts` is generated—do not hand-edit.
- `src/app/features/*` contains feature modules (wording studio, projects, import, user) with colocated components, stores, and hooks.
- Shared utilities live in `src/hooks` and `src/ts-utils`; server-side logic is split between `src/server` (common/data) and `src/server-functions`.
- Reference `docs/CODING_RULES.md` for shared expectations; feature notes live in `docs/WORDING_SCHEMA_STUDIO.md`, `docs/WORDING_STUDIO_SEARCH.md`, and `docs/WORDING_BRANCH.md` (all relevant to the wording studio).
- Tests currently live alongside code (e.g., `src/app/features/wording-studio/store/index.test.tsx`).

## Build, Test, and Development Commands
- Install deps with `yarn install` (Yarn 4, Node 24 via Volta).
- `yarn dev` runs the Vite dev server.
- `yarn build` creates a production build; `yarn ts-check` runs type-only checks.
- `yarn lint` / `yarn lint:fix` run ESLint (Prettier integrated).
- `yarn test` runs Vitest; `yarn test --watch` for rapid cycles.
- Data: start services with `docker-compose up -d postgres redis`; run `yarn migrate:latest`, `yarn migrate:down`, or `yarn db:reset` via `dotenvx` (requires `DATABASE_URL`/`REDIS_URL`).

## Coding Style & Naming Conventions
- TypeScript + React with functional components; use 2-space indentation.
- Prefer `type` over `interface`; avoid barrel exports and unnecessary exports (see `docs/CODING_RULES.md`).
- Components in `PascalCase`, hooks prefixed with `use`, utilities in `camelCase`; keep modules focused and colocate related code.
- ESLint + Prettier enforce formatting; React-specific rules allow JSX without explicit `React` import.

## Testing Guidelines
- Vitest is the test runner; colocate `*.test.tsx`/`*.test.ts` near the implementation.
- Name tests after behaviors, not methods; prefer deterministic tests without shared global state.
- For new features, cover critical paths (rendering, data flow, error states) and add minimal fixtures/mocks in the same folder.
- Run `yarn test` and `yarn lint` before sending changes; add type checks (`yarn ts-check`) for risky refactors.

## Commit & Pull Request Guidelines
- Follow the existing convention `type(scope): summary` (e.g., `feat(studio): improve shortcuts`, `fix(studio): add search debounce`).
- Keep commits small and focused; include relevant docs or migration notes when behavior changes.
- PRs should describe the change, note risk areas, list manual/automated checks (tests, lint, type-check), and include screenshots for UI tweaks where useful.
- Link related issues or tickets; ensure migrations and env changes are called out explicitly.
