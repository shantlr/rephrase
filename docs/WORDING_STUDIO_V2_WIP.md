# Wording Studio V2 (WIP)

Lean, value-only wording editor that keeps the original Studio (schema editor) intact.

## Purpose
- Edit wording values quickly, especially templated fields, without touching the schema.
- Reduce cognitive load versus the V1 schema editor.

## Where it lives
- Route: `/_authenticated/projects/$projectId/branch/$branchId/studio-v2`
- Feature code: `src/app/features/wording-studio-v2/`

## Current UX
- Sticky header with Back-to-Project, locale selector, and Save button.
- Search box filters flattened wording paths.
- Cards per field show path, type, and an inline editor:
  - string-template (plain or pluralized), number, boolean, array-as-JSON (minimal support).
- Templated field names are expanded using enum constants to present concrete keys.

## Data flow
- Loads branch via existing `useProjectWordingsBranch` (schema + constants + locales). Each locale now exposes a `values` bag so V2 stores wording values under the locale instead of on schema nodes; V2 ignores legacy schema `instances` entirely.
- Local edits kept in the lightweight custom store (`createStore`) shared with Studio V1; updates applied via `flatten-schema.ts` helpers writing to `locales[].values`.
- Save uses existing `useUpdateProjectWordingsBranch` mutation with unchanged constants and writes to `locales[].values` only.

## Known limitations / next steps
- No dirty-state warning yet; navigating away can drop edits.
- `structuredClone` per change may be costly on very large schemas; consider Immer or debounced updates.
- Arrays/objects editing is minimal; richer editors could be added.
- Concurrency not handled (last-write-wins); consider optimistic locking in API.
- Shared utilities with V1 are still duplicated; could centralize template expansion helpers.
- V2 now ignores schema `instances`; all editing/reads use `locales[].values`.

## Quick nav
- Project page now shows both “Studio” (V1) and “Studio V2” buttons; V2 is value-only.
