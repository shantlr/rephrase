import { useState } from 'react';
import { Button } from '@/app/common/ui/button';
import { Input } from '@/app/common/ui/input';
import { Label } from '@/app/common/ui/label';
import { Textarea } from '@/app/common/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/common/ui/select';
import { Card, CardContent, CardHeader } from '@/app/common/ui/card';
import {
  PlusIcon,
  TrashIcon,
  SaveIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { WordingSchema } from '@/server/data/wording.types';

interface SchemaField {
  name: string | { type: 'template'; value: string };
  type: WordingSchema;
}

export interface ObjectSchema {
  type: 'object';
  description: string;
  fields: SchemaField[];
}

interface SchemaEditorProps {
  schema: ObjectSchema;
  onSave: (schema: ObjectSchema) => void;
  isLoading?: boolean;
}

export const SchemaEditor = ({
  schema: initialSchema,
  onSave,
  isLoading = false,
}: SchemaEditorProps) => {
  const [schema, setSchema] = useState<ObjectSchema>(initialSchema);

  const handleSave = () => {
    onSave(schema);
  };

  const handleSchemaDescriptionChange = (description: string) => {
    setSchema((prev) => ({ ...prev, description }));
  };

  const handleAddField = () => {
    setSchema((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          name: '',
          type: {
            type: 'string-template',
            description: '',
          },
        },
      ],
    }));
  };

  const handleDeleteField = (index: number) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const handleFieldChange = (index: number, field: Partial<SchemaField>) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? { ...f, ...field } : f)),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Root schema description */}
      <div className="space-y-2">
        <Label htmlFor="schema-description">Schema Description</Label>
        <Textarea
          id="schema-description"
          placeholder="Describe the purpose of this schema..."
          value={schema.description}
          onChange={(e) => handleSchemaDescriptionChange(e.target.value)}
        />
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Fields</h3>
          <Button onClick={handleAddField} variant="outline" size="sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </div>

        {schema.fields.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                No fields defined. Click &ldquo;Add Field&rdquo; to create your
                first field.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {schema.fields.map((field, index) => (
              <FieldEditor
                key={index}
                field={field}
                onChange={(updatedField) =>
                  handleFieldChange(index, updatedField)
                }
                onDelete={() => handleDeleteField(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} className="min-w-32">
          {isLoading ? (
            'Saving...'
          ) : (
            <>
              <SaveIcon className="w-4 h-4 mr-2" />
              Save Schema
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

interface FieldEditorProps {
  field: SchemaField;
  onChange: (field: Partial<SchemaField>) => void;
  onDelete: () => void;
  depth?: number;
}

const FieldEditor = ({
  field,
  onChange,
  onDelete,
  depth = 0,
}: FieldEditorProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleNameChange = (name: string) => {
    onChange({ name });
  };

  const getFieldName = (field: SchemaField): string => {
    return typeof field.name === 'string' ? field.name : field.name.value;
  };

  const handleTypeChange = (newType: string) => {
    let type: WordingSchema;

    switch (newType) {
      case 'string-template':
        type = {
          type: 'string-template',
          description: '',
        };
        break;
      case 'object':
        type = {
          type: 'object',
          description: '',
          fields: [],
        };
        break;
      case 'array':
        type = {
          type: 'array',
          description: '',
          item: {
            type: 'string-template',
            description: '',
          },
        };
        break;
      default:
        return;
    }

    onChange({ type });
  };

  const handleDescriptionChange = (description: string) => {
    onChange({
      type: {
        ...field.type,
        description,
      },
    });
  };

  const handleObjectFieldChange = (
    fieldIndex: number,
    updatedField: Partial<SchemaField>,
  ) => {
    if (field.type.type !== 'object') return;

    const updatedFields = field.type.fields.map((f: SchemaField, i: number) =>
      i === fieldIndex ? { ...f, ...updatedField } : f,
    );

    onChange({
      type: {
        ...field.type,
        fields: updatedFields,
      },
    });
  };

  const handleAddObjectField = () => {
    if (field.type.type !== 'object') return;

    onChange({
      type: {
        ...field.type,
        fields: [
          ...field.type.fields,
          {
            name: '',
            type: {
              type: 'string-template',
              description: '',
            },
          },
        ],
      },
    });
  };

  const handleDeleteObjectField = (fieldIndex: number) => {
    if (field.type.type !== 'object') return;

    onChange({
      type: {
        ...field.type,
        fields: field.type.fields.filter(
          (_: SchemaField, i: number) => i !== fieldIndex,
        ),
      },
    });
  };

  const handleArrayItemTypeChange = (newType: string) => {
    if (field.type.type !== 'array') return;

    let itemType: WordingSchema;

    switch (newType) {
      case 'string-template':
        itemType = {
          type: 'string-template',
          description: '',
        };
        break;
      case 'object':
        itemType = {
          type: 'object',
          description: '',
          fields: [],
        };
        break;
      default:
        return;
    }

    onChange({
      type: {
        ...field.type,
        item: itemType,
      },
    });
  };

  return (
    <Card className={`${depth > 0 ? 'ml-6 border-l-4 border-l-blue-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 flex-1">
            {field.type.type === 'object' && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </Button>
            )}
            <div className="flex-1 space-y-3">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label>Field Name</Label>
                  <Input
                    placeholder="Enter field name..."
                    value={getFieldName(field)}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
                <div className="w-40">
                  <Label>Type</Label>
                  <Select
                    value={field.type.type}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string-template">
                        String Template
                      </SelectItem>
                      <SelectItem value="object">Object</SelectItem>
                      <SelectItem value="array">Array</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  placeholder="Describe this field..."
                  value={field.type.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Object fields */}
      {field.type.type === 'object' && isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Object Fields</Label>
              <Button
                onClick={handleAddObjectField}
                variant="outline"
                size="sm"
              >
                <PlusIcon className="w-3 h-3 mr-1" />
                Add Field
              </Button>
            </div>

            {field.type.fields.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4 border-2 border-dashed rounded">
                No fields defined for this object
              </div>
            ) : (
              <div className="space-y-3">
                {field.type.fields.map(
                  (objField: SchemaField, objIndex: number) => (
                    <FieldEditor
                      key={objIndex}
                      field={objField}
                      onChange={(updatedField) =>
                        handleObjectFieldChange(objIndex, updatedField)
                      }
                      onDelete={() => handleDeleteObjectField(objIndex)}
                      depth={depth + 1}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}

      {/* Array item type */}
      {field.type.type === 'array' && isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Array Item Type</Label>
            <div className="w-40">
              <Select
                value={field.type.item.type}
                onValueChange={handleArrayItemTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string-template">
                    String Template
                  </SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {field.type.item.type === 'object' && (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Configure the structure for each item in this array:
                </div>
                <FieldEditor
                  field={{
                    name: 'Array Item',
                    type: field.type.item,
                  }}
                  onChange={(updatedField) => {
                    if (updatedField.type && field.type.type === 'array') {
                      onChange({
                        type: {
                          type: 'array',
                          description: field.type.description,
                          item: updatedField.type,
                        },
                      });
                    }
                  }}
                  onDelete={() => {}}
                  depth={depth + 1}
                />
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
