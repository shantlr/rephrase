export type PathToType = 'schema' | `schema.${string}`;
export type PathToRootFieldList = `schema.root.fields`;
export type PathToFieldList = `${PathToType}.fields` | PathToRootFieldList;

export type PathToField = `${PathToFieldList}.${number}`;

export type PathToArrayItemTypeId = `${PathToType}.itemTypeId`;
