# Wording Schema Studio

The wording schema studio implement a visual editor to manage both a project wording schema and locale associated values for each of the schema fields.
Have a looks at `docs/WORDING_BRANCH.md` for more information about wording schema.

## Overview

The schema studio is located in `/src/app/features/project-wording/ui-schema-editor/` and consists of several interconnected components that work together to provide a comprehensive schema editing experience.

The wording studio has current 2 sections. The first one allow to manage constants, the second one is about managing the schema and associated locale instances.

Locale wording values are usually managed through a dialog, this allow to manage all locales at once for a given field.

In the studio we can select a locale that is used for the field locale wording values preview.

## Field Types

### String Template Fields

`field-string-template.tsx` implement the `string-template` schema node

Field of type `string-template` show current selected locale associated string as preview.
Once we open the locale instances dialog, we can toggle between pluralized variant and default, and have an input to edit value for each locale.

The `field-string-template` automatically infer params from locale instances and sync it with the field params.
When switching to pluralized variant, a `count` parameter of type `number` is automatically added.

### Number Fields

`field-number.tsx` implement the `number` schema node

Field of type `number` show current selected locale associated numeric value as preview.
Once we open the locale instances dialog, we get a number input to edit the value for each locale.

Number fields are straightforward - they store numeric values that can vary by locale. This is useful for quantities, prices, configuration values, or any other numeric data that might differ across regions or languages.

### Boolean Fields

`field-boolean.tsx` implement the `boolean` schema node

Field of type `boolean` show current selected locale associated boolean value as preview (true/false).
Once we open the locale instances dialog, we get a switch toggle to edit the true/false value for each locale.

Boolean fields are useful for feature flags, settings, or any binary configuration that might differ across regions or languages. The switch provides an intuitive way to toggle between true and false values.

### Object Fields

`field-object.tsx` implement the `object` schema node.

Field of type `object` will display all fields and use corresponding field editor implementation.

It may have templated fields when field name contain params.
Templated field that has nested fields (e.g: field of type `object`), should not show a locale instances dialog for each nested fields.
Instead the locale instances dialog will be at the templated field. Once we open the dialog, it will contain for each locale, an instance editor for each possible field name.

### Array Fields

`field-array.tsx` implement the `array` schema node.

Field of type `array` show an item count badge as preview (e.g., "<3 items>").
For string-template items, it shows individual string values as badges.

Once we open the locale instances dialog, we get an interface to add, remove, and reorder array items.
The array supports different item types (string-template, object, nested arrays).

Array fields can also have templated field names when they contain params, similar to object fields.

## Constants Management

Constants are managed in the first section of the schema studio.

`ui-constants-field/enum-field.tsx` implement enum constant management with name and list of possible option values.
Constants can be referenced in templated field names using `${CONSTANT_NAME}` syntax.

## Parameter System

The parameter system handles automatic parameter inference and management.

### String Template Parameters

For string-template fields, parameters are automatically inferred from locale instances:
- Scans wording text for `{paramName}` patterns
- Creates parameter definitions automatically
- Defaults to `string` type for inferred parameters
- Number parameters (like `count` for pluralization) are preserved even when not referenced in text

### Object Field Parameters

For object fields with templated names, parameters are created from field name templates:
- Scans field name for `${PARAM_NAME}` patterns
- Creates constant-type parameters that reference defined constants
- Values stored at field level for each template combination

Parameters are displayed as badges showing both name and type: `paramName (type)`

## Wording Values System

### Base Components

`wording-values/_base-edit-locales.tsx` provides locale iteration for editing.
`_base-wording-values-dialog.tsx` provides the modal dialog system triggered by clicking field values.

### Input Components

Different input components handle different field types:

- `StringTemplateWordingValueInput` - Basic string input
- `NumberWordingValueInput` - Number input for numeric values
- `BooleanWordingValueInput` - Switch toggle for true/false values
- `PluralizationWordingValueInput` - Dual inputs for singular/plural forms
- `WordingArrayInput` - Dynamic array management with add/remove controls
- `WordingObjectInput` - Handles nested object structures
- `WordingObjectFieldInput` - Manages individual object fields and templated fields

### Template Field Dialog

`field-template-wording-dialog.tsx` handles templated fields with parameters.
Shows badges for each possible field name combination and opens dialog with all template variations for each locale.