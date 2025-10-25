import { clone, isEqual } from 'lodash-es';
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

/**
 * Schema may have hundred or thousands of nodes, we don't want thousands of listeners to be called on each change
 * We implement a simple store that tracks listeners per key
 */

type IValue = Record<PropertyKey, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StoreDeepKeyPaths<Value> = Value extends any[]
  ? [number, ...StoreDeepKeyPaths<Value[number]>]
  : Value extends IValue
    ?
        | [keyof Value]
        | {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [K in keyof Value]: Value[K] extends any[]
              ? [K, number, ...StoreDeepKeyPaths<Value[K][number]>]
              : Value[K] extends IValue
                ? [K, ...StoreDeepKeyPaths<Value[K]>]
                : [K];
          }[keyof Value]
    : never;

type StoreDeepKeys<T> = T extends number
  ? number
  : T extends (infer U)[]
    ?
        | `${number}`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        | (U extends IValue | any[]
            ? StoreDeepKeys<U> extends string | number
              ? `${number}.${StoreDeepKeys<U>}`
              : never
            : never)
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      T extends Record<string, any>
      ? {
          [K in keyof T]-?: K extends string
            ?
                | K
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                | (NonNullable<T[K]> extends Record<string, unknown> | any[]
                    ? `${K}.${StoreDeepKeys<T[K]>}`
                    : never)
            : never;
        }[keyof T]
      : never;

export type StoreDeepValue<Value, Key> =
  // Force distribution on Value if its an union
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Value extends any
    ? Key extends `${infer K}.${infer Rest}`
      ? K extends keyof Value
        ? StoreDeepValue<Value[K], Rest>
        : // Handle array index
          K extends `${number}`
          ? Value extends (infer U)[]
            ? StoreDeepValue<U, Rest>
            : undefined
          : undefined
      : Key extends keyof Value
        ? Value[Key]
        : // Handle array index
          Key extends `${number}`
          ? Value extends (infer U)[]
            ? U
            : undefined
          : undefined
    : undefined;

export type Store<Value extends IValue> = {
  data: Value;
  getField: <K extends StoreDeepKeys<Value>>(
    key: K,
  ) => StoreDeepValue<Value, K>;
  setField: <K extends StoreDeepKeys<Value>>(
    key: K,
    value:
      | StoreDeepValue<Value, K>
      | ((
          prev: StoreDeepValue<Value, K>,
        ) => StoreDeepValue<Value, K> | undefined),
  ) => void;

  getFieldFromPath: <K extends StoreDeepKeyPaths<Value>>(path: K) => unknown;
  setFieldFromPath: <K extends StoreDeepKeyPaths<Value>>(
    path: K,
    value: unknown | ((prev: unknown) => unknown | undefined),
  ) => void;

  subscribe: (callback: () => void) => () => void;
  subscribeKey: (key: PropertyKey, callback: () => void) => () => void;
};

type NestedListeners = {
  listeners: Set<() => void>;
  children: Record<PropertyKey, NestedListeners | undefined>;
};

export const createStore = <Value extends IValue>(
  initialValues: Value,
): Store<Value> => {
  const listeners: NestedListeners = {
    listeners: new Set(),
    children: {},
  };

  const store: Store<Value> = {
    data: initialValues,
    getField(key) {
      const path = typeof key === 'string' ? key.split('.') : [key];
      return store.getFieldFromPath(
        path as unknown as StoreDeepKeyPaths<Value>,
      ) as StoreDeepValue<Value, typeof key>;
    },
    setField(key, value) {
      const path = typeof key === 'string' ? key.split('.') : [key];
      store.setFieldFromPath(
        path as unknown as StoreDeepKeyPaths<Value>,
        value,
      );
    },
    getFieldFromPath(path) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let res = store.data as any;
      for (const part of path) {
        if (res == null) {
          return res;
        }
        res = res[part];
      }
      return res;
    },
    setFieldFromPath(path, value) {
      const listenersToBeCalled: NestedListeners[] = [listeners];

      let listenerNode: NestedListeners | undefined = listeners;
      const updatedData = clone(store.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let parentNode = updatedData as any;

      const pathToParent = path.slice(0, -1);
      const lastKey = path[path.length - 1];

      for (const part of pathToParent) {
        if (parentNode?.[part] == null) {
          parentNode[part] = {};
          parentNode = parentNode[part];
        } else {
          const cloned = clone(parentNode[part]);
          parentNode[part] = cloned;
          parentNode = cloned;
        }

        listenerNode = listenerNode?.children?.[part];
        if (listenerNode) {
          listenersToBeCalled.push(listenerNode);
        }
      }

      const currentValue = parentNode?.[lastKey];
      const newValue =
        typeof value === 'function' ? value(currentValue) : value;

      if (isEqual(currentValue, newValue)) {
        return;
      }

      // add last key listeners
      if (listenerNode?.children?.[lastKey]) {
        listenersToBeCalled.push(listenerNode.children[lastKey]);

        // add last key all children listeners
        const collectAllChildren = (node: NestedListeners) => {
          Object.values(node.children).forEach((child) => {
            if (child) {
              listenersToBeCalled.push(child);
              if (child.children) {
                collectAllChildren(child);
              }
            }
          });
        };
        collectAllChildren(listenerNode.children?.[lastKey]);
      }

      // finally set value
      if (newValue === undefined) {
        delete parentNode[lastKey];
      } else {
        parentNode[lastKey] = newValue;
      }
      store.data = updatedData;

      for (const listener of listenersToBeCalled) {
        listener.listeners.forEach((cb) => cb());
      }
    },

    subscribe(callback) {
      listeners.listeners.add(callback);
      return () => {
        listeners.listeners.delete(callback);
      };
    },
    subscribeKey(key, callback) {
      const k = typeof key === 'string' ? key.split('.') : [key];

      let node = listeners;
      const chains = [node];
      for (const part of k) {
        if (!node.children[part]) {
          node.children[part] = { listeners: new Set(), children: {} };
        }
        node = node.children[part];
        chains.push(node);
      }

      node.listeners.add(callback);

      return () => {
        node.listeners.delete(callback);
        // cleanup empty nodes
        for (let i = chains.length - 1; i >= 1; i--) {
          const n = chains[i];
          if (n.listeners.size === 0 && Object.keys(n.children).length === 0) {
            const parent = chains[i - 1];
            delete parent.children[k[i - 1]];
          } else {
            break;
          }
        }
      };
    },
  };

  return store;
};

export const useReadStoreField = <
  Value extends IValue,
  K extends StoreDeepKeys<Value>,
>(
  store: Store<Value> | null,
  key: K,
) => {
  const pathFromKey = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (typeof key === 'string' ? key.split('.') : [key]) as any;
  }, [key]);

  const [fieldValue, rerender] = useReducer(
    () => {
      return store?.getFieldFromPath(pathFromKey);
    },
    undefined,
    () => store?.getFieldFromPath(pathFromKey),
  );

  const lastKey = useRef(key);
  useEffect(() => {
    if (lastKey.current !== key) {
      lastKey.current = key;
      rerender();
    }
  }, [key]);
  useEffect(() => {
    return store?.subscribeKey(key, () => rerender());
  }, [store, key]);

  return fieldValue as StoreDeepValue<Value, K>;
};

export const useSelectStoreField = <
  Value extends IValue,
  K extends StoreDeepKeys<Value>,
  R,
>(
  store: Store<Value> | null,
  key: K,
  selector: (value: StoreDeepValue<Value, K>) => R,
) => {
  const pathFromKey = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (typeof key === 'string' ? key.split('.') : [key]) as any;
  }, [key]);

  const [fieldValue, rerender] = useReducer(
    () => {
      return store?.getFieldFromPath(pathFromKey);
    },
    undefined,
    () => store?.getFieldFromPath(pathFromKey),
  );

  const lastKey = useRef(key);
  useEffect(() => {
    if (lastKey.current !== key) {
      lastKey.current = key;
      rerender();
    }
  }, [key]);

  const result = selector(fieldValue as StoreDeepValue<Value, K>);

  const ref = useRef({
    selector,
    result,
  });
  ref.current.selector = selector;
  ref.current.result = result;

  useEffect(() => {
    return store?.subscribeKey(key, () => {
      const newValue = store.getFieldFromPath(pathFromKey);
      const selected = ref.current.selector(
        newValue as StoreDeepValue<Value, K>,
      );
      if (selected === ref.current.result) {
        return;
      }

      rerender();
    });
  }, [store, key]);

  return result;
};

export function StoreField<
  Value extends IValue,
  K extends StoreDeepKeys<Value>,
>({
  store,
  name,
  children,
}: {
  store: Store<Value> | null;
  name: K;
  children: (arg: {
    value: StoreDeepValue<Value, K>;
    setValue: (
      value:
        | StoreDeepValue<Value, K>
        | ((prev: StoreDeepValue<Value, K>) => StoreDeepValue<Value, K>),
    ) => void;
  }) => ReactNode;
}) {
  const value = useReadStoreField(store, name);
  const setValue = useCallback(
    (
      value:
        | StoreDeepValue<Value, K>
        | ((prev: StoreDeepValue<Value, K>) => StoreDeepValue<Value, K>),
    ) => {
      return store.setField(name, value);
    },
    [store, name],
  );
  return children({
    value,
    setValue,
  });
}
