import type { JSONSchema7 } from 'json-schema';

/**
 * JSON Schema definition for Project Wording Configuration
 * This schema provides autocompletion and validation for the YAML editor
 */
export const projectWordingConfigSchema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  title: 'Project Wording Configuration',
  description:
    'Configuration for project wording branches with enums and schema definitions',
  properties: {
    enums: {
      type: 'array',
      title: 'Enums',
      description:
        'Define reusable enums that can be referenced in schema field names',
      items: {
        type: 'object',
        title: 'Enum Definition',
        description: 'An enum with name, description, and possible values',
        properties: {
          name: {
            type: 'string',
            title: 'Enum Name',
            description:
              'Unique name for this enum (used in template field names)',
            minLength: 1,
            pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
          },
          description: {
            type: 'string',
            title: 'Description',
            description:
              'Human-readable description of what this enum represents',
          },
          values: {
            type: 'array',
            title: 'Enum Values',
            description: 'List of possible values for this enum',
            items: {
              type: 'string',
              title: 'Enum Value',
              minLength: 1,
            },
            minItems: 1,
            uniqueItems: true,
          },
        },
        required: ['name', 'description', 'values'] as const,
        additionalProperties: false,
      },
    },
    schema: {
      type: 'object',
      title: 'Root Schema',
      description: 'The root schema definition for all locales',
      properties: {
        type: {
          type: 'string',
          title: 'Schema Type',
          description: 'Type of the root schema (always "object")',
          const: 'object',
        },
        description: {
          type: 'string',
          title: 'Schema Description',
          description: 'Description of what this schema represents',
        },
        fields: {
          type: 'array',
          title: 'Schema Fields',
          description: 'List of fields in this schema',
          items: {
            type: 'object',
            title: 'Field Definition',
            description: 'A field definition with name and type',
            properties: {
              name: {
                oneOf: [
                  {
                    type: 'string',
                    title: 'Static Field Name',
                    description: 'A static field name',
                    minLength: 1,
                  },
                  {
                    type: 'object',
                    title: 'Template Field Name',
                    description:
                      'A templated field name using enums (e.g., "{{enumName}}Description")',
                    properties: {
                      type: {
                        type: 'string',
                        const: 'template',
                      },
                      value: {
                        type: 'string',
                        title: 'Template Value',
                        description:
                          'Template string with {{enumName}} placeholders',
                        minLength: 1,
                      },
                    },
                    required: ['type', 'value'],
                    additionalProperties: false,
                  },
                ],
              },
              type: {
                oneOf: [
                  {
                    type: 'object',
                    title: 'String Template Type',
                    description:
                      'A string template that can have parameters and variants',
                    properties: {
                      type: {
                        type: 'string',
                        const: 'string-template',
                      },
                      description: {
                        type: 'string',
                        title: 'Type Description',
                        description: 'Description of this field type',
                      },
                      variants: {
                        type: 'object',
                        title: 'Variants',
                        description: 'Supported variants (e.g., plural forms)',
                        properties: {
                          type: {
                            type: 'string',
                            enum: ['plural'],
                            title: 'Variant Type',
                          },
                        },
                        additionalProperties: false,
                      },
                      params: {
                        type: 'array',
                        title: 'Parameters',
                        description:
                          'Parameters that can be used in the template',
                        items: {
                          type: 'object',
                          title: 'Parameter Definition',
                          properties: {
                            name: {
                              type: 'string',
                              title: 'Parameter Name',
                              minLength: 1,
                            },
                            description: {
                              type: 'string',
                              title: 'Parameter Description',
                            },
                            type: {
                              type: 'object',
                              title: 'Parameter Type',
                              properties: {
                                type: {
                                  type: 'string',
                                  const: 'string',
                                },
                                options: {
                                  type: 'array',
                                  title: 'Allowed Options',
                                  description:
                                    'List of allowed values for this parameter',
                                  items: {
                                    type: 'string',
                                  },
                                },
                              },
                              required: ['type'],
                              additionalProperties: false,
                            },
                          },
                          required: ['name', 'description', 'type'],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ['type', 'description'],
                    additionalProperties: false,
                  },
                  {
                    type: 'object',
                    title: 'Object Type',
                    description: 'An object containing other fields',
                    properties: {
                      type: {
                        type: 'string',
                        const: 'object',
                      },
                      description: {
                        type: 'string',
                        title: 'Type Description',
                      },
                      fields: {
                        type: 'array',
                        title: 'Nested Fields',
                        description: 'Fields within this object',
                        items: {
                          type: 'object',
                          description: 'Nested field definition',
                        },
                      },
                    },
                    required: ['type', 'description', 'fields'],
                    additionalProperties: false,
                  },
                  {
                    type: 'object',
                    title: 'Array Type',
                    description: 'An array of items',
                    properties: {
                      type: {
                        type: 'string',
                        const: 'array',
                      },
                      description: {
                        type: 'string',
                        title: 'Type Description',
                      },
                      item: {
                        title: 'Array Item Type',
                        description: 'Type of items in this array',
                        type: 'object',
                      },
                    },
                    required: ['type', 'description', 'item'],
                    additionalProperties: false,
                  },
                ],
              },
            },
            required: ['name', 'type'],
            additionalProperties: false,
          },
        },
      },
      required: ['type', 'description', 'fields'],
      additionalProperties: false,
    },
  },
  required: ['enums', 'schema'] as const,
  additionalProperties: false,
};
