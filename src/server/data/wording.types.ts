type WordingBaseSchema<T extends { type: string }> = {
  /**
   * Describe wording usage
   */
  description: string;
} & T;

type WordingObjectSchema = WordingBaseSchema<{
  type: 'object';
  fields: {
    name: // field with a static name
    | string
      | {
          /**
           * field with templated name field can use enums (see `WordingData.config.enums`)
           *
           * e.g: `{{optionType}}Description`
           */
          type: 'template';
          value: string;
        };
    type: WordingSchema;
  }[];
}>;

export type WordingSchema =
  | WordingObjectSchema
  | WordingBaseSchema<{
      type: 'string-template';
      variants?: {
        type: 'plural';
      };
      params?: {
        name: string;
        type: {
          type: 'string';
          options?: string[];
        };
        description: string;
      }[];
    }>
  | WordingBaseSchema<{
      type: 'array';
      item: WordingSchema;
    }>;

export type WordingData = {
  /**
   * Define the schemas that all locales should respect
   */
  config: {
    /**
     * Define enums that can be reused in schemas (templated field name)
     */
    enums: {
      name: string;
      values: string[];
      description: string;
    }[];
    schema: WordingObjectSchema;
  };
  locales: {
    code: string;
    tag: string;
    data: {
      key: string;
      value: string;
    }[];
  }[];
};
