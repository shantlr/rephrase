import { memo, ReactNode, useCallback, useMemo, useRef } from 'react';
import { PathToType } from '../use-project-wording-form';
import { SchemaNode } from '@/server/data/wording.types';
import {
  CheckSquareIcon,
  HashIcon,
  ListIcon,
  PackageIcon,
  TypeIcon,
} from 'lucide-react';
import { DistributiveOmit } from '@/ts-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/app/common/ui/select';
import { nanoid } from 'nanoid';
import { useWordingStudioStore } from '../ui-wording-studio-context';
import { useReadStoreField } from '../store';

export const SelectFieldType = memo(
  ({
    pathToType,
    onChange,
  }: {
    pathToType: PathToType;
    onChange?: () => void;
  }) => {
    const store = useWordingStudioStore();
    const fieldType = useReadStoreField(store, `${pathToType}.type`);

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
          value: 'boolean',
          label: 'Boolean',
          icon: <CheckSquareIcon />,
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
      const field = store?.getField(`schema.nodes.${typeId}`);
      // const field = form.getFieldValue(`schema.nodes.${typeId}`) as SchemaNode;
      if (!field) {
        return;
      }

      store?.setField(`schema.nodes.${typeId}`, undefined);

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
        /**
         * Other nodes to add along with the main node, e.g. for array item types
         */
        additionalNodes?: SchemaNode[];
      }) => {
        const previous = store?.getField(pathToType);
        if (!previous || node.type === previous?.type) {
          return;
        }

        removeField(previous.id);

        additionalNodes?.forEach((node) => {
          store?.setField(`schema.nodes.${node.id}`, node);
        });
        store?.setField(pathToType, {
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
            case 'boolean': {
              replaceType({
                node: {
                  type: 'boolean',
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
