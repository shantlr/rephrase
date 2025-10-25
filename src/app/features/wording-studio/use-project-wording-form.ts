import { SchemaNode, WordingData } from '@/server/data/wording.types';
import { isEqual, map, sortBy } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createStore, useReadStoreField } from './store';
import { WordingStudioStore } from './ui-wording-studio-context';
import { extractParams } from './ui-schema-editor/_util-extract-params';

export type PathToType = `schema.nodes.${string}`;

export type PathToArrayItemTypeId = `${PathToType}.itemTypeId`;

export type PathToField =
  | `schema.root.fields.${number}`
  | `${PathToType}.fields.${number}`;

export type PathToWordingInstanceValue =
  | `${PathToType}.instances.${string}`
  | `${PathToField}.instances.${string}`;

type FormValues = {
  constants: WordingData['constants'];
  schema: {
    nodes: Record<string, SchemaNode>;
    root: WordingData['schema']['root'];
  };
  selectedLocale: string | null;
  locales: string[];
};

export const useProjectWordingForm = ({
  initialValues: inputInitialValues,
  // onSubmit,
}: {
  initialValues?: Partial<FormValues>;
  onSubmit: (values: Pick<WordingData, 'constants' | 'schema'>) => void;
}) => {
  const [store] = useState(() =>
    createStore({
      constants: inputInitialValues?.constants ?? [],
      schema: inputInitialValues?.schema ?? {
        nodes: {},
        root: {
          id: 'root',
          type: 'object',
          fields: [],
        },
      },
      locales: inputInitialValues?.locales ?? [],
      selectedLocale: inputInitialValues?.locales?.[0] ?? null,
    }),
  );

  return {
    store,
  };
};

/**
 * Handle field name that contains params
 * Compute all possible field name
 */
export const useObjectFieldNamePossibilities = ({
  store,
  pathToField,
}: {
  store: WordingStudioStore | null;
  pathToField: PathToField;
}) => {
  const template = useReadStoreField(store, `${pathToField}.name`) ?? '';
  const params = useReadStoreField(store, `${pathToField}.params`);

  const constants = useReadStoreField(store, 'constants');

  return useMemo(() => {
    const compute = (
      temp: string,
      leftParams: {
        name: string;
        def: NonNullable<typeof params>[string];
      }[],
    ): string[] => {
      if (!leftParams.length) {
        return [temp];
      }

      const [p, ...others] = leftParams;
      if (p.def.type === 'constant') {
        const constant = constants.find((c) => c.name === p.def.name);
        if (!constant) {
          // not found, should not trigger warn in that case
          return [];
        }

        if (constant?.type === 'enum') {
          return constant.options.flatMap((option) => {
            const nextTemp = template.replaceAll(`{${p.name}}`, option);
            return compute(nextTemp, others);
          });
        }
      }
      console.warn(`Unhandled param`, p);
      return [];
    };

    return compute(
      template,
      map(params, (p, name) => ({
        name,
        def: p,
      })),
    );
  }, [constants, template, params]);
};

export function useSyncParamsFromTemplate<
  Params extends Record<string, unknown>,
>({
  template,
  currentParams,
  defaultParam,
  onSync,
}: {
  template: string | undefined;
  currentParams: Params | undefined;
  defaultParam: () => NoInfer<Params[string]>;
  onSync: (params: Params | undefined) => void;
}) {
  const ref = useRef({ onSync, defaultParam });
  ref.current.onSync = onSync;
  ref.current.defaultParam = defaultParam;

  useEffect(() => {
    const check = () => {
      const extractedParams = extractParams(template || '');
      console.log('>>', extractedParams);
      if (!extractedParams.length) {
        // no params
        if (currentParams) {
          ref.current.onSync?.(undefined);
        }
      } else if (
        (Object.keys(currentParams || {}).length ?? 0) !==
          extractedParams.length ||
        !isEqual(
          sortBy(Object.keys(currentParams || {})),
          sortBy(extractedParams),
        )
      ) {
        const nextParams: typeof currentParams = {} as Params;
        extractedParams.forEach((p) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          nextParams[p] = currentParams?.[p] ?? ref.current.defaultParam();
        });
        ref.current.onSync?.(nextParams);
      }
    };

    const id = requestIdleCallback(() => {
      check();
    });
    return () => {
      cancelIdleCallback(id);
    };
  }, [template, currentParams]);
}
