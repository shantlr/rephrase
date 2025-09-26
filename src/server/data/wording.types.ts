export type WordingEnumConstant = {
  name: string;
  type: 'enum';
  description?: string;
  options: string[];
};
export type WordingStringConstant = {
  name: string;
  description?: string;
  type: 'string';
  value: string;
};

type BaseSchemaNode<Type extends string, T> = {
  type: Type;
  id: string;
  description?: string;
} & T;
export type SchemaStringTemplateNode = BaseSchemaNode<
  'string-template',
  {
    params?: {
      [paramName: string]: {
        type: 'string' | 'number';
      };
    };
  } & (
    | {
        variant: 'pluralized';
        instances?: {
          [localeTag: string]: {
            one: string;
            other: string;
          };
        };
      }
    | {
        variant?: never;
        instances?: {
          [localeTag: string]: string;
        };
      }
  )
>;
export type SchemaArrayNode = BaseSchemaNode<
  'array',
  {
    itemTypeId: string;
    instances?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [locale: string]: string[] | any[];
    };
  }
>;
export type SchemaNumberNode = BaseSchemaNode<
  'number',
  {
    instances?: {
      [localeTag: string]: number;
    };
  }
>;
export type SchemaObjectNode = BaseSchemaNode<
  'object',
  {
    fields: (
      | {
          typeId: string;
          name: string;
          params?: never;
          instances?: never;
        }
      | {
          typeId: string;
          name: string;
          params: {
            [name: string]: {
              type: 'constant';
              name: string;
            };
          };
          instances?: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [locale: string]: Record<string, any>;
          };
        }
    )[];
  }
>;

export type SchemaNode =
  | SchemaStringTemplateNode
  | SchemaArrayNode
  | SchemaNumberNode
  | SchemaObjectNode;

export type WordingData = {
  constants: (WordingEnumConstant | WordingStringConstant)[];

  schema: {
    nodes: {
      [id: string]: SchemaNode;
    };
    root: SchemaObjectNode;
  };

  locales: {
    tag: string;
  }[];
};
