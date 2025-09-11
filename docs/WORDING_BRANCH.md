# Project Wordings branch

This project is about having a GUI to manipulate localization wordings

User can create multiple projects. Each project have at least one wordings branch called `main`

See `src/server/data/db.ts` and `src/server/data/wording.types.ts` to have a look at table column and types details

Each branch should define `data.schema` that describes the schema of the wordings that each locale should implements
Each branch should define `data.locales` that is a list of locale that the project support and associated wordings that should respect the wordings schema

## Schema

Schema root is an object
Object type, may contains multiple fields
Each field should have a name, and associated type

One very basic schema exemple

```ts
const config: WordingData['config'] = {
  enums: {},
  schema: {
    type: 'object';
    fields: [
      {
        name: 'title';
        type: {
          type: 'string-template';
        }
      },
      {
        name: 'subtitle';
        type: {
          type: 'string-template';
        }
      },
      {
        name: 'description';
        type: {
          type: 'string-template';
        }
      },
      {
        name: 'footer',
        type: {
          type: 'object',
          fields: [
            {
              name: 'title',
              type: {
                type: 'string-template'
              }
            },
            {
              name: 'note',
              type: {
                type: 'string-template'
              }
            }
          ]
        }
      }
    ]
  },
}
```

Then each locale data should associate key (wich is the field path separated with '.' for nested fields) with value that respect defined field type

Associated locales would looks like that:

```ts
const locales: WordingData['locales'] = [
  {
    code: 'en',
    tag: 'en-GB',
    data: [
      {
        key: 'title',
        value: 'Welcome',
      },
      {
        key: 'subtitle',
        value: 'Take your time',
      },
      {
        key: 'description',
        value: 'Consequat elit eu non enim nostrud aliquip labore aliquip excepteur velit consectetur ut.'
      },
      {
        key: 'footer.title',
        value: 'This is the footer'
      },
      {
        key: 'footer.note',
        value: 'Dolor mollit aliquip incididunt non consectetur Lorem anim aute est Lorem id occaecat ex officia.',
      }
    ]
  }
]
```

### Enums

in the config, we can define enums that can then be reused in the schema definitions

Example of enum definitions:

```ts
const configEnums: WordingData['config']['enums'] = {
  JOB_TYPE: {
    values: ['WARRIOR', 'ARCHER', 'MAGE'],
    description: 'list of job types'
  },
  STATS: {
    values: ['STRENGTH', 'AGILITY', 'INTELLIGENCE'],
    description: ''
  },
};
```

Enum can then be used as param of field name template

```ts
const schema: WordingData['config']['schema'] = {
  type: 'object',
  fields: [
    {
      name: {
        type: 'template';
        value: `{JOB_TYPE}_DESCRIPTION`
      },
    },
  ],
};
```