import { memo, ReactNode, useCallback, useMemo, useRef } from 'react';
import { PathToType, useProjectWordingForm } from '../use-project-wording-form';
import { useStore } from '@tanstack/react-form';
import { get } from 'lodash-es';
import { SchemaNode } from '@/server/data/wording.types';
import { HashIcon, ListIcon, PackageIcon, TypeIcon } from 'lucide-react';
import { DistributiveOmit } from '@/ts-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/app/common/ui/select';
import { nanoid } from 'nanoid';

export const SelectFieldType = memo(
  ({
    pathToType,
    form,
    onChange,
  }: {
    pathToType: PathToType;
    form: ReturnType<typeof useProjectWordingForm>['form'];
    onChange?: () => void;
  }) => {
    const fieldType = useStore(
      form.store,
      (s) =>
        get(s.values, `${pathToType}.type`) as SchemaNode['type'] | undefined,
    );

    const typeOptions = useMemo(() => {
      return [
        {
          value: 'string-template',
          label: 'String Template',
          icon: <TypeIcon />,
        },
        {
          value: 'number',
          label: 'Number',
          icon: <HashIcon />,
        },
        {
          value: 'object',
          label: 'Object',
          icon: <PackageIcon />,
        },
        {
          value: 'array',
          label: 'Array',
          icon: <ListIcon />,
        },
      ] as {
        value: SchemaNode['type'];
        label: string;
        icon: ReactNode;
      }[];
    }, []);

    const currentOption = useMemo(() => {
      return typeOptions.find((option) => option.value === fieldType);
    }, [fieldType, typeOptions]);

    const removeField = useCallback((typeId: string) => {
      // NOTE: when removing a node, we have to recursively remove all children nodes to not leave relicas
      const field = form.getFieldValue(`schema.nodes.${typeId}`) as SchemaNode;
      if (!field) {
        return;
      }

      form.setFieldValue(`schema.nodes.${typeId}`, undefined);

      switch (field.type) {
        case 'array': {
          removeField(field.itemTypeId);
          break;
        }
        case 'object': {
          field.fields.forEach((f) => {
            removeField(f.typeId);
          });
          break;
        }
        default:
      }
    }, []);

    const ref = useRef({ onChange });
    ref.current.onChange = onChange;

    const replaceType = useCallback(
      ({
        node,
        additionalNodes,
      }: {
        node: DistributiveOmit<SchemaNode, 'id'>;
        additionalNodes?: SchemaNode[];
      }) => {
        const previous = form.getFieldValue(pathToType) as SchemaNode;
        if (node.type === previous.type) {
          return;
        }

        removeField(previous.id);

        additionalNodes?.forEach((node) => {
          form.setFieldValue(`schema.nodes.${node.id}`, node);
        });
        form.setFieldValue(pathToType, {
          id: previous.id,
          ...node,
        });

        ref.current.onChange?.();
      },
      [],
    );

    return (
      <Select
        value={fieldType}
        onValueChange={(newType) => {
          switch (newType as SchemaNode['type']) {
            case 'string-template': {
              replaceType({
                node: {
                  type: 'string-template',
                },
              });
              break;
            }
            case 'number': {
              replaceType({
                node: {
                  type: 'number',
                },
              });
              break;
            }
            case 'object': {
              replaceType({
                node: {
                  type: 'object',
                  fields: [],
                },
              });
              break;
            }
            case 'array': {
              const itemType = {
                id: nanoid(),
                type: 'string-template',
              } satisfies SchemaNode;
              replaceType({
                node: {
                  type: 'array',
                  itemTypeId: itemType.id,
                },
                additionalNodes: [itemType],
              });
              break;
            }
          }
        }}
      >
        <SelectTrigger
          size="sm"
          className="flex items-center justify-center"
          hideChevron
        >
          {currentOption?.icon}
        </SelectTrigger>
        <SelectContent>
          {typeOptions.map((option) => {
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  },
);
SelectFieldType.displayName = 'SelectFieldType';
