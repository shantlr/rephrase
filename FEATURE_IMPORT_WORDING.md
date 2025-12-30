# Import Wording Feature

From the Wording Studio v2, user can import a batch of wording values.

## Use Case

User copies wording values from an Excel file (no headers, just values). Each row represents a wording entry, each column represents the value in a different language.

Example clipboard content:

```
Welcome to app!    Bienvenue !    Willkommen!
Logout             Déconnexion    Abmelden
```

The user then manually assigns each row to the appropriate field in the wording tree.

## UI Flow

### Step 1: Import Button & Modal

- [x] Add an "Import" button on the top right of the wording studio v2 page
- [x] Clicking the button opens an import modal

### Step 2: Import Modal (paste & configure)

- [x] Modal listens for paste events and detects clipboard content
- [x] Parse content as a table (tab-separated from Excel, or comma-separated)
- [x] Show error message if content cannot be parsed as a valid table
- [x] Detect language for each column using language detection
- [x] Add a "Switch rows/columns" button to swap orientation
- [x] Show a preview table:
  - [x] Each cell is editable
  - [x] Each column header shows detected language with dropdown to change (project languages only)
  - [x] Each column can be deleted via X button
- [x] "Confirm" button to proceed to assignment phase

### Step 3: Assignment Mode (sticky right panel + expanded tree)

- [x] Sticky panel appears on the right side of the wording studio
- [x] Panel can be minimized/expanded
- [x] Panel shows list of wordings to assign (one item per row from import)
- [x] Each item displays the value in the currently selected locale
- [ ] Wording tree enters "import mode":
  - [ ] Expanded view: show all assignable targets including:
    - String array items (each item shown separately)
    - [x] Pluralized string forms (one/other shown separately)
  - [x] Valid targets are visually highlighted when a wording is selected
- [x] Click-to-assign workflow:
  1. User clicks a wording item in the panel to select it (highlighted)
  2. Valid target fields are highlighted in the tree
  3. User clicks a target field to assign
  4. [x] Assignment is staged (not immediately applied)
  5. Assigned wording shows "✓" indicator in the panel
  6. [x] Auto-select next unassigned wording after assignment
  7. [x] User can reassign already-assigned wordings to different fields
- [x] "Review Changes" button shows diff preview before applying
- [x] Diff preview modal shows all pending changes with current vs new values
- [x] User confirms to apply all changes at once
- [x] User can dismiss the panel at any time (discards unassigned wordings)
