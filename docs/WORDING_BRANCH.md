# Project Wordings branch

This project provides a GUI to manage localization wordings

Users can create multiple projects. Each project has at least one wording branch called `main`

See `src/server/data/db.ts` and `src/server/data/wording.types.ts` to have a look at table column and types details

Each branch should define `data.schema` that describes the schema of the wordings that each locale should implement
Each branch should define `data.locales` that is a list of locales that the project supports and associated wordings that should respect the wording schema

This document explains the core idea of how a project localization schema is defined, and how each locale may define values for each schema field

The schema GUI editor is a complex part of this project and can be found in the folder `/src/app/features/project-wording`

## Schema

Projects must define a schema to provide localization. Each locale must implement this schema to provide the wording values.

Schema definition is a complex part of this project. It has some similarity to a typing system, and can allow for example to define records with keys that should respect a given pattern.

`config.schema.root` is always an object
Object fields have a name, and a typeId that references a key in the `config.schema.nodes` record

One very basic schema example

```ts
const config: WordingData['config'] = {
  constants: [],
  schema: {
    nodes: {
      '1': {
        type: 'string-template',
        instances: {
          'en-GB': 'Welcome to our App'
        },
      },
      '2': {
        type: 'string-template',
        instances: {
          'en-GB': 'Get started in seconds'
        }
      },
      '3': {
        type: 'string-template',
        instances: {
          'en-GB': 'Manage your tasks efficiently with our powerful project management tools.'
        }
      },
      '4': {
        type: 'object',
        fields: [
          {
            name: 'title',
            typeId: '5',
          },
          {
            name: 'quickActions',
            typeId: '6',
          }
        ],
      },
      '5': {
        type: 'string-template',
        instances: {
          'en-GB': 'Contact Support'
        }
      },
      '6': {
        type: 'array',
        itemTypeId: '7',
        instances: {
          'en-GB': ['Create new project', 'Invite team members', 'Set up notifications']
        }
      },
      '7': {
        type: 'string-template'
      }
    },
    root: {
      type: 'object',
      fields: [
        {
          name: 'title',
          typeId: '1',
        },
        {
          name: 'subtitle',
          typeId: '2',
        },
        {
          name: 'description',
          typeId: '3',
        },
        {
          name: 'sidebar',
          typeId: '4',
        }
      ]
    }
  },
  locales: [
    {
      tag: 'en-GB',
    }
  ],
}
```

For each defined locale in `config.locales`, each type may define `instances` that will contain values corresponding to each locale.
When a type has no defined wording, instances will be undefined.
Wording values are not required to be defined for each locale in `instances`.

### String Template Parameters

String template types can define parameters that can be used within the locale instances. These parameters act as placeholders that can be dynamically replaced with values at runtime.

When a string-template type defines `params`, the locale instances can reference these parameters using curly brace syntax like `{paramName}`.

```ts
const config: WordingData = {
  constants: [],
  schema: {
    nodes: {
      '1': {
        type: 'string-template',
        params: {
          firstName: {
            type: 'string'
          },
          itemCount: {
            type: 'string'
          }
        },
        instances: {
          'en-GB': 'Hello {firstName}, you have {itemCount} items',
          'fr-FR': 'Bonjour {firstName}, vous avez {itemCount} éléments'
        }
      }
    },
    root: {
      type: 'object',
      fields: [
        {
          name: 'greeting',
          typeId: '1'
        }
      ]
    }
  },
  locales: [
    { tag: 'en-GB' },
    { tag: 'fr-FR' }
  ]
}
```

In this example, the string template defines two parameters (`firstName` and `itemCount`) that can be used in the locale instances. At runtime, these placeholders would be replaced with actual values.

### Constants

In the config, we can define constants that can then be reused in the schema definitions

Example of enum definitions:

```ts
const config: WordingData = {
  constants: [
    {
      name: 'JOB_TYPE',
      type: 'enum',
      options: ['WARRIOR', 'ARCHER', 'MAGE']
    },
    {
      name: 'STATS',
      type: 'enum',
      options: ['STRENGTH', 'AGILITY', 'INTELLIGENCE'],
    },
  ],
  // ...
};
```

### Object field templating

Objects may either have a static field name, or a templated name

Templated field names can currently only use defined constants

Once a field is templated, locale instances should be defined in the field instead of the type, this is due to the fact that templated fields may contain multiple values, one for each possible template value

```ts
const config: WordingData = {
  constants: [
    {
      name: 'JOB_TYPE',
      type: 'enum',
      options: ['WARRIOR', 'ARCHER', 'MAGE']
    },
  ],
  schema: {
    nodes: {
      type: 'string-template',
    },
    root: {
      type: 'object',
      fields: [
        {
          name: '${JOB_TYPE}_DESCRIPTION',
          params: {
            JOB_TYPE: {
              type: 'constant',
              name: 'JOB_TYPE'
            },
          },
          instances: {
            'en-GB': {
              'WARRIOR_DESCRIPTION': 'Strong melee fighter with high defense and powerful sword attacks.',
              'ARCHER_DESCRIPTION': 'Agile ranged combatant with precise bow skills and stealth abilities.',
              'MAGE_DESCRIPTION': 'Mystical spellcaster wielding elemental magic and powerful enchantments.',
            }
          },
        },
      ],
    },
  },
  locales: [{ tag: 'en-GB' }],
}
```

