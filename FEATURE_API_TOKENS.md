# Api tokens ROADMAP

this document contain features to implement api tokens
As api tokens is implemented, we should ensure `./docs/API_TOKENS.md` is updated

## DB
- [x] Define API token table/types (hash-only storage, per-resource scopes, per-user unique name)
- [x] Kysely migration (`1765032695048_add_api_token_table.ts`) + DB wiring

## Api tokens management

- [x] Server functions:
    - create (with permissions, project/branch existence, expiry ≤2y)
    - list (filters revoked >7 days)
    - revoke (creator-only)
- [x] Client UI/hooks:
    - Create page with resource scopes, branch/project selects, date input, and one-time reveal modal with copy
    - List page showing tokens with revoke action
    - Hooks: `useApiTokens`, `useCreateApiToken`, `useRevokeApiToken`, `useProjectBranches`
- [x] Branch listing helper: `serverListProjectBranches` (flags default branch)

## Api token usages

Once created the api tokens can be used on the following cases
When api token is used, it should provided as `authorization` header using `Bearer` scheme
Api token is only used through REST request (not through server-functions) 

- [x] Implement a reusable server-only function that can resolve an api token from raw token
- [x] Implement helpers to check if token has access to project/branch/scope
- [x] List accessible projects enpoint 
  - GET `/api/projects`
  - check api tokens permissions
- [x] Get a specific project details 
  - GET `/api/projects/:project-id`
  - check api tokens permissions
- [x] Get a specific project branch details
  - GET `/api/projects/:project-id/branch/:branch-id-or-name`
  - check api tokens permissions
  - [x] also match by branch name
- [x] Update branch schema
  - PUT `/api/projects/:project-id/branch/:branch-id-or-name`
  - check api tokens permission (write)
  - body contain a schema field