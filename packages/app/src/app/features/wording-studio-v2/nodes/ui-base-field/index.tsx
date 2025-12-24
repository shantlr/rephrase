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

const computePossibleNames = ({
  template,
  params,
  constants,
}: {
  template: string;
  params: {
    name: string;
    ref: NonNullable<SchemaObjectNodeField['nameParams']>[string];
  }[];
  constants: WordingData['constants'];
}) => {
  if (params.length === 0) {
    return [template];
  }

  const param = params[0];
  const restParams = params.slice(1);
  const possibleValues: string[] = [];

  if (param.ref.type === 'constant') {
    const constant = constants.find((c) => c.name === param.ref.id);
    if (constant?.type === 'enum') {
      constant.options.forEach((option) => {
        possibleValues.push(option);
      });
    } else if (constant?.type === 'string') {
      possibleValues.push(constant.value);
    }
  }

  const results: string[] = [];
  for (const value of possibleValues) {
    const newTemplate = template.replaceAll(`{${param.name}}`, value);
    const subResults = computePossibleNames({
      template: newTemplate,
      params: restParams,
      constants,
    });
    results.push(...subResults);
  }

  return results;
};

/**
 * When field name is templated, we show '+' to add instances of the field with
 * specific parameter values.
 */
const TemplatedBaseField = (props: {
  /**
   * Icon to display right before the field name
   */
  icon?: ReactNode;
  fieldPath: PathToField;
  valuesPreview?: ReactNode;
  children?: ReactNode;
}) => {
  const store = useStudioStore();
  const name = useReadStoreField(store, `${props.fieldPath}.name`) as
    | string
    | undefined;
  const constants = useReadStoreField(store, 'constants');
  const params = useReadStoreField(
    store,
    `${props.fieldPath}.nameParams`,
  ) as SchemaObjectNodeField['nameParams'];

  const possibleNames = computePossibleNames({
    template: name ?? '',
    params: Object.entries(params ?? {}).map(([key, value]) => ({
      name: key,
      ref: value,
    })),
    constants,
  });

  const handleSelectInstantiation = (selectedName: string) => {
    // TODO: handle instantiation selection
    console.log('Selected instantiation:', selectedName);
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="ml-4 cursor-pointer hover:bg-gray-100 rounded p-1">
            <PlusIcon size={12} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {possibleNames.map((possibleName) => (
            <DropdownMenuItem
              key={possibleName}
              onClick={() => handleSelectInstantiation(possibleName)}
            >
              {possibleName}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const BaseField = ({
  icon,
  fieldPath,
  valuesPreview,
  children,
}: {
  /**
   * Icon to display right before the field name
   */
  icon?: ReactNode;
  fieldPath: PathToField;
  valuesPreview?: ReactNode;
  children?: ReactNode;
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
      <div className="flex gap-2 items-center w-full">
        {icon}
        {hasParams ? (
          <TemplatedName template={name ?? ''} params={params} />
        ) : (
          <div className="text-gray-500 text-sm">{name}</div>
        )}
        {!hasParams && valuesPreview}
      </div>
      {hasParams ? (
        <TemplatedBaseField
          icon={icon}
          fieldPath={fieldPath}
          valuesPreview={valuesPreview}
        />
      ) : (
        children
      )}
    </div>
  );
};
