# API Tokens

## Overview
- Purpose: allow programmatic read/write access to project wording schemas/values via scoped tokens.
- Storage: `api_token` table (Kysely types in `packages/app/src/server/data/api-token.types.ts`).
- Visibility: tokens are only shown once on creation; only the hash is stored.

## Table schema (migration `1765032695048_add_api_token_table.ts`)
- `id` (uuid, pk, default `gen_random_uuid()`).
- `token_hash` (text) – hash of the plain token.
- `name` (text) – unique per creator (`created_by_user_id`, name).
- `resources` (jsonb) – array of `{ project_id, branch_id|null, scopes: ['read'|'write'][] }`.
- `created_by_user_id` (varchar FK user.id).
- `last_used_at` (timestamptz, nullable).
- `expires_at` (timestamptz, required; max 2 years ahead enforced in server fn).
- `revoked_at` (timestamptz, nullable).
- `created_at` / `updated_at` (timestamptz, default now()).

## Server functions
- `serverCreateApiToken` (`server-functions/auth/api-tokens.ts`)
  - Authenticated; enforces per-user unique name.
  - Validates resources, project/branch existence & user permissions (read/write → edit permission).
  - Requires expiry in future, ≤ 2 years.
  - Returns plain token once; stores hash.
- `serverListApiTokens`
  - Lists current user tokens; filters out tokens revoked more than 7 days ago.
- `serverRevokeApiToken`
  - Authenticated; only creator can revoke.
- Branch helper: `serverListProjectBranches` (flags `isDefault` when name === 'main').

## Client hooks & UI
- Hooks (`features/api-tokens/use-api-tokens.ts`): `useApiTokens`, `useCreateApiToken`, `useRevokeApiToken`.
- Create page (`routes/_authenticated/api-tokens.create.tsx`):
  - Form for name, expiry date, resources (project select, branch select, scopes).
  - Branch select loads per selected project via `useProjectBranches`.
  - Shows a modal with the token once; includes copy button and warning.
- List page (`routes/_authenticated/api-tokens.index.tsx`): displays tokens with revoke action; hides tokens revoked >7 days.

## Scopes and resources
- Scopes are per resource (project/optional branch): `read`, `write`.
- `branch_id=null` means project-wide access.

## Security notes
- Plain tokens are never stored; only SHA-256 hash.
- Token shown once; users must copy immediately.
- Expiry required (max 2 years); revoked tokens hidden after 7 days.
- Branch/project authorization checked at creation; creation blocked without read/write permission as appropriate.

## REST usage (Bearer tokens)
- Send tokens in `Authorization: Bearer <token>` when calling REST endpoints (not available to server-functions).
- `GET /api/projects` – lists projects the token can read, including accessible branches for each project.
- `GET /api/projects/:projectId` – returns project metadata, locales (from an accessible branch), and the branches the token can read.
- `GET /api/projects/:projectId/branch/:branchIdOrName` – returns full wording data for the branch when the token grants read access to that branch (or project-wide). Accepts either a branch UUID or branch name (e.g., `main`).
- `PUT /api/projects/:projectId/branch/:branchIdOrName` – updates the branch schema. Requires write access. Body: `{ "schema": { "nodes": {...}, "root": {...} } }`.
