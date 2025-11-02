# Wording Studio Search Feature

## Overview

Real-time search functionality for filtering wording schema fields with text highlighting and nested field support.

**Key Features:**
- Case-insensitive field name filtering
- Text highlighting in matching field names
- Parent-children visibility (finding parent shows all children)
- Debounced input (300ms) for performance
- Preserves field hierarchy during filtering

## Architecture

**Core Components:**
- `SearchInput` - Debounced search input with clear button
- `SchemaFieldName` - Field name display with highlighting overlay
- `useSchemaSearch` - Search state management hook

**Data Flow:**
1. User types → `SearchInput` (local state)
2. Debounced sync → Store (`searchQuery`)
3. Store updates → Rebuild visible field paths
4. Components check visibility → Render filtered fields

## Key Files

- `ui-schema-editor/index.tsx` - SearchInput component
- `ui-schema-editor/_base-field.tsx` - Field highlighting logic
- `ui-schema-editor/_text-highlight-utils.tsx` - Text highlighting utilities
- `use-project-wording-form.ts` - Search indexing and filtering logic
- `ui-schema-editor/field-object.tsx` - Field visibility checks

## How It Works

**Search Indexing:**
- `buildSearchableFields()` - Traverses entire schema tree to create flat array of all searchable fields
  - Each field gets: `{ path: "schema.root.fields.0", name: "username", depth: 0 }`
  - Handles nested objects (`schema.nodes.{id}.fields`) and array items recursively
  - Built once when schema changes, cached until next schema update
- `buildFieldHierarchy()` - Creates bidirectional relationship maps:
  - `parentMap`: `"user.email" → ["user"]` (for showing ancestors)
  - `childrenMap`: `"user" → ["user.name", "user.email", "user.address"]` (for showing descendants)
  - Enables O(1) lookup of field relationships during filtering

**Search Examples:**
- Search "user" → Shows: `user`, `user.name`, `user.email`, `user.address` (parent + all children)
- Search "email" → Shows: `user`, `user.email` (child + its parents)
- Search "addr" → Shows: `user`, `user.address`, `user.address.street`, `user.address.city` (partial match + hierarchy)

**Filtering Algorithm:**
- `getVisibleFieldPaths()` - Returns Set of visible field paths
- For each matching field: adds field + all ancestors + all descendants
- `addAllDescendants()` - Recursively includes all children when parent matches

**Text Highlighting:**
- `highlightText()` - Wraps matching text in `<mark>` tags with yellow background
  - Example: Search "user" in "username" → `<mark>user</mark>name`
- Shows highlight overlay when field not focused
- Transparent input text when highlighting active

## Performance Optimizations

- **O(1) Visibility Checks:** Components use `Set.has(fieldPath)` for instant visibility lookup
- **Pre-computed Index:** Search index built only when schema changes, not on every search
- **Debounced Input:** 300ms delay prevents excessive filtering during typing
- **Efficient Hierarchy:** Parent-child maps built once, reused for all searches

## Maintenance

**To modify search behavior:**
- Search matching logic: `getVisibleFieldPaths()` in `use-project-wording-form.ts`
- Highlight styling: `_text-highlight-utils.tsx` mark className
- Debounce timing: `SearchInput` setTimeout delay (currently 300ms)

**To add new searchable fields:**
- Extend `buildSearchableFields()` to include additional field properties
- Update `SearchableField` type to include new searchable data

**Performance considerations:**
- Keep search index minimal - only include necessary searchable data
- Visibility checks should remain O(1) operations
- Avoid rebuilding hierarchy maps during search operations