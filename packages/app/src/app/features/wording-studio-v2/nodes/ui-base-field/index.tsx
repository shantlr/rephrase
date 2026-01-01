import { useReadStoreField } from '@/app/features/wording-studio/store';
import { PathToField } from '../../types';
import { useStudioStore } from '../../store';
import { ReactNode } from 'react';
import {
  SchemaObjectNodeField,
  WordingData,
} from '@/server/data/wording.types';
import { PlusIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/app/common/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/common/ui/dropdown-menu';
import { map } from 'lodash-es';
import { ExpandedNameInfo } from '../../utils/compute-expanded-names';
import { cn } from '@/app/common/lib/utils';

/**
 * Parses a template string and returns an array of parts (text or param).
 * E.g., "field_{locale}_{variant}" => ["field_", {param: "locale"}, "_", {param: "variant"}]
 */
const parseTemplateName = (template: string) => {
  const parts: (string | { param: string })[] = [];
  const regex = /\{([^}]+)\}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      parts.push(template.slice(lastIndex, match.index));
    }
    parts.push({ param: match[1] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < template.length) {
    parts.push(template.slice(lastIndex));
  }

  return parts;
};

/**
 * Renders a single param with tooltip showing constant details.
 */
const ParamWithTooltip = ({
  param,
  paramRef,
  constants,
}: {
  param: string;
  paramRef:
    | NonNullable<SchemaObjectNodeField['nameParams']>[string]
    | undefined;
  constants: WordingData['constants'];
}) => {
  const getTooltipContent = () => {
    if (!paramRef) {
      return <p>{param}</p>;
    }

    if (paramRef.type === 'constant') {
      const constant = constants.find((c) => c.name === paramRef.id);
      if (!constant) {
        return <p>constant: {paramRef.id} (not found)</p>;
      }

      if (constant.type === 'enum') {
        return (
          <div className="space-y-1">
            <p className="font-medium">{constant.name}</p>
            <p className="text-xs opacity-70">enum</p>
            <div className="flex flex-wrap gap-1 max-w-48">
              {constant.options.map((option) => (
                <span
                  key={option}
                  className="bg-violet-500/20 text-violet-200 px-1.5 py-0.5 rounded text-xs"
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (constant.type === 'string') {
        return (
          <div className="space-y-1">
            <p className="font-medium">{constant.name}</p>
            <p className="text-xs opacity-70">string</p>
            <p className="text-xs">{constant.value}</p>
          </div>
        );
      }
    }

    return (
      <p>
        {paramRef.type}: {paramRef.id}
      </p>
    );
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-violet-600 font-medium cursor-help hover:bg-violet-100 rounded px-0.5 italic">
          {`{${param}}`}
        </span>
      </TooltipTrigger>
      <TooltipContent>{getTooltipContent()}</TooltipContent>
    </Tooltip>
  );
};

/**
 * Renders a templated field name with params highlighted and hoverable.
 */
const TemplatedName = ({
  template,
  params,
}: {
  template: string;
  params: SchemaObjectNodeField['nameParams'];
}) => {
  const store = useStudioStore();
  const constants = useReadStoreField(
    store,
    'constants',
  ) as WordingData['constants'];
  const parts = parseTemplateName(template);

  return (
    <span className="text-gray-500 text-sm">
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={index}>{part}</span>;
        }

        return (
          <ParamWithTooltip
            key={index}
            param={part.param}
            paramRef={params?.[part.param]}
            constants={constants}
          />
        );
      })}
    </span>
  );
};

/**
 * Renders an expanded instance name with param values highlighted and hoverable.
 * E.g., for template "button_{action}_{variant}" with values { action: "click", variant: "primary" },
 * renders "button_[click]_[primary]" where bracketed parts are colored and have tooltips.
 */
const FormattedInstanceName = ({
  template,
  paramValues,
}: {
  template: string;
  paramValues: ExpandedNameInfo['paramValues'];
}) => {
  const parts = parseTemplateName(template);

  return (
    <span className="text-gray-500 text-sm">
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={index}>{part}</span>;
        }

        const paramInfo = paramValues[part.param];
        if (!paramInfo) {
          // Param not found in values, show placeholder
          return (
            <span key={index} className="text-gray-400">
              {`{${part.param}}`}
            </span>
          );
        }

        return (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <span className="text-violet-600/70 italic font-medium cursor-help hover:bg-violet-100 rounded px-0.5">
                {paramInfo.value}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>From constant: {paramInfo.constantId}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </span>
  );
};

const TemplatedBaseField = (props: {
  /**
   * Icon to display right before the field name
   */
  icon?: ReactNode;
  fieldPath: PathToField;
  valuePath: string;
  valuesPreview?: (args: { valuePath: string }) => ReactNode;
  children?: (args: {
    fieldPath: PathToField;
    valuePath: string;
    depth: number;
  }) => ReactNode;
  /**
   * Whether we are currently in import assignment mode with a wording selected
   */
  isAssigningImportWording?: boolean;
  /**
   * Callback to assign the selected import wording to a field
   */
  onAssignImportWording?: (valuePath: string) => void;
  /**
   * Nesting depth for indentation
   */
  depth?: number;
}) => {
  const store = useStudioStore();
  const selectedLocale = useReadStoreField(store, 'selectedLocale');
  const expandedFieldNames = useReadStoreField(
    store,
    'expandedFieldNames',
  ) as Map<string, ExpandedNameInfo[]>;
  const templateName = useReadStoreField(store, `${props.fieldPath}.name`) as
    | string
    | undefined;

  const existingValues = useReadStoreField(
    store,
    `localeValues.${selectedLocale}.${props.valuePath}`,
  ) as Record<string, unknown> | undefined;

  // Use precomputed expanded names from store
  const allExpandedNames = expandedFieldNames.get(props.fieldPath) ?? [];
  const availableNames = allExpandedNames.filter(
    (info) =>
      !(info.name in (existingValues || ({} as Record<string, unknown>))),
  );

  // Create a lookup map for existing instance names to their param values
  const nameToParamValues = new Map(
    allExpandedNames.map((info) => [info.name, info.paramValues]),
  );

  const handleSelectInstantiation = (selectedName: string) => {
    store.setField(
      `localeValues.${selectedLocale}.${props.valuePath}.${selectedName}`,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      null,
    );
  };

  return (
    <div>
      {/* Already picked */}
      {map(existingValues, (v, instantiatedName) => {
        const instanceValuePath = `${props.valuePath}.${instantiatedName}`;
        const paramValues = nameToParamValues.get(instantiatedName) ?? {};
        const depth = props.depth ?? 0;
        return (
          <div
            key={instantiatedName}
            className={cn(
              'ml-4',
              props.isAssigningImportWording &&
                'cursor-pointer hover:bg-blue-50 ring-2 ring-blue-200 ring-inset rounded transition-colors',
            )}
            onClick={
              props.isAssigningImportWording
                ? () => props.onAssignImportWording?.(instanceValuePath)
                : undefined
            }
          >
            <div
              data-value-path={instanceValuePath}
              data-depth={depth + 1}
              className="grid grid-cols-[250px_350px] gap-8 items-start mx-auto text-sm text-gray-500"
              onMouseEnter={() =>
                store.setField('hoveredPath', instanceValuePath)
              }
              onMouseLeave={() => store.setField('hoveredPath', null)}
            >
              <FormattedInstanceName
                template={templateName ?? ''}
                paramValues={paramValues}
              />
              {props.valuesPreview?.({ valuePath: instanceValuePath })}
            </div>
            <div>
              {props.children?.({
                fieldPath: props.fieldPath,
                valuePath: instanceValuePath,
                depth: depth + 1,
              })}
            </div>
          </div>
        );
      })}
      {/* Add new instances */}
      {availableNames.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-4 cursor-pointer hover:bg-gray-100 rounded p-1">
              <PlusIcon size={12} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {availableNames.map((info) => (
              <DropdownMenuItem
                key={info.name}
                onClick={() => handleSelectInstantiation(info.name)}
              >
                <FormattedInstanceName
                  template={templateName ?? ''}
                  paramValues={info.paramValues}
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export const BaseField = ({
  icon,
  fieldPath,
  valuePath,
  valuesPreview,
  children,
  isAssigningImportWording,
  onAssignImportWording,
  depth = 0,
}: {
  /**
   * Icon to display right before the field name
   */
  icon?: ReactNode;
  fieldPath: PathToField;
  valuePath: string;
  valuesPreview?: (args: { valuePath: string }) => ReactNode;
  children?: (args: {
    fieldPath: PathToField;
    valuePath: string;
    depth: number;
  }) => ReactNode;
  /**
   * Whether we are currently in import assignment mode with a wording selected
   */
  isAssigningImportWording?: boolean;
  /**
   * Callback to assign the selected import wording to a field
   */
  onAssignImportWording?: (valuePath: string) => void;
  /**
   * Nesting depth for indentation
   */
  depth?: number;
}) => {
  const store = useStudioStore();
  const name = useReadStoreField(store, `${fieldPath}.name`) as
    | string
    | undefined;
  const params = useReadStoreField(
    store,
    `${fieldPath}.nameParams`,
  ) as SchemaObjectNodeField['nameParams'];

  const hasParams = !!params && Object.keys(params).length > 0;

  return (
    <div>
      <div
        data-value-path={valuePath}
        data-depth={depth}
        className="grid grid-cols-[250px_350px] gap-8 mx-auto"
        onMouseEnter={() => store.setField('hoveredPath', valuePath)}
        onMouseLeave={() => store.setField('hoveredPath', null)}
      >
        <div className="flex gap-2" style={{ paddingLeft: depth * 12 }}>
          {icon && <div className="mt-1.5">{icon}</div>}
          {hasParams ? (
            <TemplatedName template={name ?? ''} params={params} />
          ) : (
            <div className="mt-1 text-gray-500 text-sm">{name}</div>
          )}
        </div>
        <div>{!hasParams && valuesPreview?.({ valuePath })}</div>
      </div>
      {hasParams ? (
        <TemplatedBaseField
          icon={icon}
          valuePath={valuePath}
          fieldPath={fieldPath}
          valuesPreview={valuesPreview}
          isAssigningImportWording={isAssigningImportWording}
          onAssignImportWording={onAssignImportWording}
          depth={depth}
        >
          {children}
        </TemplatedBaseField>
      ) : (
        children?.({ fieldPath, valuePath, depth: depth + 1 })
      )}
    </div>
  );
};
