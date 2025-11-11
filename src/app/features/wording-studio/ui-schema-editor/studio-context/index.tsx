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

const parsePathToField = (path: PathToField) => {
  const pathItems = path.split('.');
  const pathToFieldList = pathItems
    .slice(0, -1)
    .join('.') as `${PathToType}.fields`;
  const index = Number(pathItems[pathItems.length - 1]);
  return { pathToFieldList, index };
};

const Context = createContext<{
  registerInputRef: (
    pathToField: PathToField,
    elem: HTMLInputElement | null,
  ) => void;
  focusInput: (pathToField: PathToField) => boolean;
  focusPreviousInput: (currentPathToField: PathToField) => void;
  focusNextInput: (currentPathToField: PathToField) => void;
  appendItem: (currentlyAt: PathToField) => void;
  deleteField: (pathToField: PathToField) => void;
  deleteItemIfEmpty: (pathToField: PathToField) => boolean;
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
  deleteField: () => {
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
      if (!store) {
        return;
      }
      if (isPathToField(path)) {
        const pathToFieldList = store.getField('schema.pathToFieldList');
        const currentIndex = pathToFieldList.findIndex(
          (p: PathToField) => p === path,
        );

        for (let i = currentIndex - 1; i >= 0; i--) {
          const previousPath = pathToFieldList[i] as PathToField;
          if (focusInput(previousPath)) {
            return;
          }
        }
      }
    },
    [],
  );
  const focusNextInput: ContextValue['focusNextInput'] = useCallback((path) => {
    if (!store) {
      return;
    }
    if (isPathToField(path)) {
      const pathToFieldList = store.getField('schema.pathToFieldList');
      const currentIndex = pathToFieldList.indexOf(path);
      for (let i = currentIndex + 1; i < pathToFieldList.length; i++) {
        const nextPath = pathToFieldList[i] as PathToField;
        if (focusInput(nextPath)) {
          return;
        }
      }
    }
  }, []);
  const appendItem: ContextValue['appendItem'] = useCallback((path) => {
    if (!store) {
      return;
    }

    const pathItems = path.split('.');
    const parentPath = pathItems.slice(0, -1).join('.');
    if (isPathToField(path)) {
      const pathToFieldList = store.getField('schema.pathToFieldList');

      // path to field
      const currentlyAt: SchemaObjectNode['fields'][number] | undefined =
        store.getField(path);

      const currentTypePath: PathToType = `schema.nodes.${currentlyAt?.typeId}`;
      const currentType = currentlyAt
        ? store.getField(currentTypePath)
        : undefined;

      if (currentType?.type === 'object') {
        // prepend to object field's item type
        const newField: SchemaNode = {
          type: 'string-template',
          id: nanoid(),
        };

        const fieldList = store.getField(`${currentTypePath}.fields`);
        if (fieldList) {
          const lastFieldPathToField = `${currentTypePath}.fields.${fieldList.length - 1}`;
          const lastFieldPathIndex = pathToFieldList.findIndex(
            (p: PathToField) => p === lastFieldPathToField,
          );
          store.setField('schema.pathToFieldList', [
            ...pathToFieldList.slice(0, lastFieldPathIndex + 1),
            `${currentTypePath}.fields.${fieldList.length}` as PathToField,
            ...pathToFieldList.slice(lastFieldPathIndex + 1),
          ]);
        }

        store.setField(`schema.nodes.${newField.id}`, newField);
        store.setField(`${currentTypePath}.fields`, (fields) => [
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
      const pathToFieldList = store?.getField('schema.pathToFieldList');

      // => append to object fields array
      const index = Number(pathItems[pathItems.length - 1]);
      const newField: SchemaNode = {
        type: 'string-template',
        id: nanoid(),
      };

      const fieldList = store?.getField(parentPath as `${PathToType}.fields`);
      if (fieldList) {
        const lastFieldPathToField = `${parentPath}.${fieldList.length - 1}`;
        const lastFieldPathIndex = pathToFieldList.findIndex(
          (p: PathToField) => p === lastFieldPathToField,
        );
        store.setField('schema.pathToFieldList', [
          ...pathToFieldList.slice(0, lastFieldPathIndex + 1),
          `${parentPath}.${fieldList.length}` as PathToField,
          ...pathToFieldList.slice(lastFieldPathIndex + 1),
        ]);
      }

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

  const deleteField: ContextValue['deleteField'] = useCallback(
    (pathToField) => {
      const { index, pathToFieldList } = parsePathToField(pathToField);
      store?.setField(pathToFieldList, (prev) => {
        if (!Array.isArray(prev)) {
          return prev;
        }
        const next = prev.filter((_, i) => i !== index);
        return next;
      });
    },
    [],
  );

  const deleteItemIfEmpty: ContextValue['deleteItemIfEmpty'] = useCallback(
    (path) => {
      const field = store?.getField(path);
      if (!field || !!field.name) {
        return false;
      }

      deleteField(path);
      return true;
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
      deleteField,
    }),
    [
      registerInputRef,
      focusPreviousInput,
      focusNextInput,
      appendItem,
      focusInput,
      deleteField,
      deleteItemIfEmpty,
    ],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useStudio = () => useContext(Context);
