import * as z from 'zod';

export const objectSchemaFieldNameValidator = z
  .string()
  .min(1)
  .regex(/^[a-z0-9A-Z-_]+$/);

const stringTemplateSchemaValidator = z.object({
  type: z.literal('string-template'),
});

const arraySchemaValidator = z.object({
  type: z.literal('array'),
  get item() {
    return schemaValidator;
  },
});

const objectSchemaValidator = z.object({
  type: z.literal('object'),
  description: z.string().default(''),
  get fields() {
    return z.array(
      z.object({
        name: objectSchemaFieldNameValidator,
        type: schemaValidator,
      }),
    );
  },
});

const schemaValidator = z.lazy(() =>
  z.union([
    objectSchemaValidator,
    stringTemplateSchemaValidator,
    arraySchemaValidator,
  ]),
);

export const wordingSchemaValidator = objectSchemaValidator;
