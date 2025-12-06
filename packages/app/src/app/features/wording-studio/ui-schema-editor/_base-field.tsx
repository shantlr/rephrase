import { PathToField } from '../use-project-wording-form';
import { MinimalistInput } from './_minimalist-input';
import { memo, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { forEach, isEqual, sortBy } from 'lodash-es';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/app/common/lib/utils';
import { DeleteButton } from '../_ui-delete-button';
import { SelectFieldType } from './_select-field-type';
import {
  useWordingStudioStore,
  WordingStudioStore,
} from '../ui-wording-studio-context';
import { useReadStoreField, useSelectStoreField } from '../store';
import { SchemaObjectNode } from '@/server/data/wording.types';
import { extractParams } from './_util-extract-params';
import { useStudio } from './studio-context';
import { highlightText, textContainsQuery } from './_text-highlight-utils';

export const useFieldHasParams = ({
  pathToField,
  store,
}: {
  pathToField: PathToField;
  store: WordingStudioStore | null;
}) => {
  return useSelectStoreField(store, pathToField, (field) => {
    return !!field?.params;
  });
};

/**
 * Shows example of name template with params substituted
 */
const SchemaNameTemplateExample = ({
  pathToField,
}: {
  pathToField: PathToField;
}) => {
  const store = useWordingStudioStore();

  const template = useReadStoreField(store, `${pathToField}.name`);
  const params = useReadStoreField(store, `${pathToField}.params`);

  const constants = useReadStoreField(store, 'constants');

  const example = useMemo(() => {
    let res = template || '';
    forEach(params, (param, name) => {
      if (param.type === 'constant') {
        const constant = constants.find((c) => c.name === param.name);
        if (constant && constant.type === 'enum') {
          res = res.replaceAll(`{${name}}`, constant.options[0] ?? '<never>');
        }
      }
    });
    return res;
  }, [constants, params, template]);

  return <div className="text-xs text-gray-500">eg: `{example}`</div>;
};

type FieldParams = NonNullable<SchemaObjectNode['fields'][number]['params']>;

/**
 * Extract params from template and sync to field params
 */
function useSyncParamsFromTemplate({
  template,
  currentParams,
  onSync,
}: {
  template: string | undefined;
  currentParams: FieldParams | undefined;
  onSync: (params: FieldParams | undefined) => void;
}) {
  const ref = useRef({ onSync });
  ref.current.onSync = onSync;

  useEffect(() => {
    const check = () => {
      const extractedParams = extractParams(template || '');
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
        const nextParams: typeof currentParams = {} as FieldParams;
        extractedParams.forEach((p) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          nextParams[p] = currentParams?.[p] ?? {
            type: 'constant',
            name: p,
          };
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

export const SchemaFieldName = ({
  pathToField,
}: {
  pathToField: PathToField;
}) => {
  const store = useWordingStudioStore();
  const name = useReadStoreField(store, `${pathToField}.name`);
  const searchQuery = useReadStoreField(store, 'searchQuery');
  const currentParams = useReadStoreField(store, `${pathToField}.params`);
  const studio = useStudio();
  const [isFocused, setIsFocused] = useState(false);

  useSyncParamsFromTemplate({
    template: name,
    currentParams,
    onSync: (params) => {
      store?.setField(`${pathToField}.params`, params);
    },
  });

  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    return studio.registerInputRef(pathToField, ref.current);
  }, [pathToField, studio]);

  // Check if this field name contains the search query
  const hasMatch = searchQuery && textContainsQuery(name || '', searchQuery);

  // Show highlighted overlay when not focused and there's a search match
  const showHighlightOverlay = !isFocused && hasMatch;

  return (
    <>
      <div className="w-full relative shrink">
        <MinimalistInput
          ref={ref}
          value={name}
          placeholder="Field name"
          className={showHighlightOverlay ? 'text-transparent' : ''}
          onChange={(e) => {
            store?.setField(`${pathToField}.name`, e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              flushSync(() => {
                studio.appendItem(pathToField);
              });
              studio.focusNextInput(pathToField);
            } else if (
              event.key === 'Backspace' &&
              !event.currentTarget.value
            ) {
              studio.focusPreviousInput(pathToField);
              if (studio.deleteItemIfEmpty(pathToField)) {
                event.preventDefault();
              }
            } else if (event.key === 'ArrowDown') {
              studio.focusNextInput(pathToField);
            } else if (event.key === 'ArrowUp') {
              studio.focusPreviousInput(pathToField);
            }
          }}
        />

        {/* Highlighted text overlay */}
        {showHighlightOverlay && (
          <div className="absolute inset-0 pointer-events-none flex items-center px-0 py-1">
            <div className="text-sm font-medium text-gray-900">
              {highlightText(name || '', searchQuery)}
            </div>
          </div>
        )}

        {!!currentParams && (
          <SchemaNameTemplateExample pathToField={pathToField} />
        )}
      </div>
    </>
  );
};

export const SchemaBaseField = memo(
  ({
    pathToField,
    expandable = false,

    children = ({ expandButton, selectType, fieldName, deleteButton }) => (
      <div className="group flex gap-1 items-center">
        {expandButton}
        {selectType}
        {fieldName}
        {deleteButton}
      </div>
    ),
  }: {
    pathToField: PathToField;
    expandable?: boolean;

    children?: (arg: {
      expandButton: ReactNode;
      expanded: boolean;
      selectType: ReactNode;
      fieldName: ReactNode;
      deleteButton: ReactNode;
    }) => ReactNode;
  }) => {
    const store = useWordingStudioStore();
    const { deleteField } = useStudio();
    const typeId = useReadStoreField(store, `${pathToField}.typeId`);
    const pathToType = `schema.nodes.${typeId}` as const;

    const fieldName = useReadStoreField(store, `${pathToField}.name`);

    const [showDetails, setShowDetails] = useState(true);

    return children({
      expanded: showDetails,
      expandButton: expandable && (
        <button
          type="button"
          className={cn('cursor-pointer transition-all', {
            'rotate-180': showDetails,
          })}
          onClick={() => setShowDetails((v) => !v)}
        >
          <ChevronDownIcon />
        </button>
      ),
      selectType: <SelectFieldType pathToType={pathToType} />,
      fieldName: <SchemaFieldName pathToField={pathToField} />,
      deleteButton: (
        <DeleteButton
          onDelete={() => deleteField?.(pathToField)}
          requireConfirmation={!!fieldName}
          itemName={fieldName}
          itemType="field"
        />
      ),
    });
  },
);
SchemaBaseField.displayName = 'SchemaBaseField';
