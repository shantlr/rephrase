import {
  ComponentProps,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';
import { PathToField, PathToType } from '../../use-project-wording-form';
import { useWordingStudioStore } from '../../ui-wording-studio-context';
import { SchemaNode, SchemaObjectNode } from '@/server/data/wording.types';
import { nanoid } from 'nanoid';

const Context = createContext<{
  registerInputRef: (
    pathToField: PathToField,
    elem: HTMLInputElement | null,
  ) => void;
  focusInput: (pathToField: PathToField) => boolean;
  focusPreviousInput: (currentPathToField: PathToField) => void;
  focusNextInput: (currentPathToField: PathToField) => void;
  appendItem: (currentlyAt: PathToField) => void;
  deleteItemIfEmpty: (pathToField: PathToField) => void;
}>({
  registerInputRef: () => {
    throw new Error('Not implemented');
  },
  appendItem: () => {
    throw new Error('Not implemented');
  },
  deleteItemIfEmpty: () => {
    throw new Error('Not implemented');
  },
  focusInput: () => {
    throw new Error('Not implemented');
  },
  focusPreviousInput: () => {
    throw new Error('Not implemented');
  },
  focusNextInput: () => {
    throw new Error('Not implemented');
  },
});

type ContextValue = ComponentProps<typeof Context.Provider>['value'];

const isPathToField = (path: string): path is PathToField => {
  return !!path && !!/\.fields\.\d+$/.test(path);
};

export const StudioContext = ({ children }: { children: ReactNode }) => {
  const ref = useRef<{
    [path: string]: HTMLInputElement | null;
  }>({});

  const store = useWordingStudioStore();
  const registerInputRef: ContextValue['registerInputRef'] = useCallback(
    (path, elem) => {
      ref.current[path] = elem;
      return () => {
        delete ref.current[path];
      };
    },
    [],
  );

  const focusInput: ContextValue['focusInput'] = useCallback((path) => {
    const elem = ref.current[path];
    if (elem) {
      elem.focus();
      return true;
    }
    return false;
  }, []);

  const focusPreviousInput: ContextValue['focusPreviousInput'] = useCallback(
    (path) => {
      if (isPathToField(path)) {
        const pathItems = path.split('.');
        const index = Number(pathItems[pathItems.length - 1]);
        if (index > 0) {
          const previousPath = [
            ...pathItems.slice(0, -1),
            String(index - 1),
          ].join('.') as PathToField;
          if (focusInput(previousPath)) {
            return;
          }
        }
      }
    },
    [],
  );
  const focusNextInput: ContextValue['focusNextInput'] = useCallback((path) => {
    if (isPathToField(path)) {
      const currentField = store?.getField(path);
      const currentType = currentField
        ? store?.getField(`schema.nodes.${currentField.typeId}`)
        : undefined;

      console.log({
        currentlyField: currentField,
        currentType,
      });

      if (currentType?.type === 'object') {
        // try to focus first fields
        if (focusInput(`schema.nodes.${currentField?.typeId}.fields.0`)) {
          return;
        }
      }

      const pathItems = path.split('.');
      const index = Number(pathItems[pathItems.length - 1]);

      const pathToFieldList = pathItems
        .slice(0, -1)
        .join('.') as `${PathToType}.fields`;

      const fieldList = store?.getField(pathToFieldList);
      if (index < (fieldList?.length ?? 0) - 1) {
        // Try to focus next item in field list
        const nextPath = `${pathToFieldList}.${index + 1}` as PathToField;
        if (focusInput(nextPath)) {
          return;
        }
      }

      const pathToParent = pathItems.slice(0, -2).join('.') as PathToField;
      const parentType = store?.getField(pathToParent);
      console.log({
        path,
        parentType,
      });

      // try to focus next nodes
    }
  }, []);
  const appendItem: ContextValue['appendItem'] = useCallback((path) => {
    const pathItems = path.split('.');
    const parentPath = pathItems.slice(0, -1).join('.');

    if (path.match(/\.fields\.\d+$/)) {
      // path to field
      const currentlyAt: SchemaObjectNode['fields'][number] | undefined =
        store?.getField(path);

      const currentTypePath: PathToType = `schema.nodes.${currentlyAt?.typeId}`;
      const currentType = currentlyAt
        ? store?.getField(currentTypePath)
        : undefined;

      if (currentType?.type === 'object') {
        // prepend to object field's item type
        const newField: SchemaNode = {
          type: 'string-template',
          id: nanoid(),
        };
        store?.setField(`schema.nodes.${newField.id}`, newField);
        store?.setField(`${currentTypePath}.fields`, (fields) => [
          {
            typeId: newField.id,
            name: '',
          },
          ...(fields ?? []),
        ]);
        return;
      }
    }

    if (parentPath.endsWith('.fields')) {
      // => append to object fields array
      const index = Number(pathItems[pathItems.length - 1]);
      const newField: SchemaNode = {
        type: 'string-template',
        id: nanoid(),
      };
      store?.setField(`schema.nodes.${newField.id}`, newField);
      store?.setField(parentPath as `${PathToType}.fields`, (fields) => [
        ...(fields?.slice(0, index + 1) ?? []),
        {
          typeId: newField.id,
          name: '',
        },
        ...(fields?.slice(index + 1) ?? []),
      ]);
    }
  }, []);

  const deleteItemIfEmpty: ContextValue['deleteItemIfEmpty'] = useCallback(
    (path) => {
      const pathItems = path.split('.');
      const parentPath = pathItems.slice(0, -1).join('.');

      if (parentPath.endsWith('.fields')) {
        const index = Number(pathItems[pathItems.length - 1]);
        store?.setField(parentPath as `${PathToType}.fields`, (fields) => {
          if (!Array.isArray(fields)) {
            return fields;
          }
          return fields.filter((_, i) => i !== index);
        });
      }
    },
    [],
  );

  const value = useMemo(
    (): ContextValue => ({
      registerInputRef,
      focusPreviousInput,
      focusNextInput,
      appendItem,
      focusInput,
      deleteItemIfEmpty,
    }),
    [
      registerInputRef,
      focusPreviousInput,
      focusNextInput,
      appendItem,
      focusInput,
    ],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useStudio = () => useContext(Context);
