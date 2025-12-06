import { Input } from '@/app/common/ui/input';
import { Switch } from '@/app/common/ui/switch';
import { Textarea } from '@/app/common/ui/textarea';
import { SchemaStringTemplateNode } from '@/server/data/wording.types';
import { FlattenedWordingItem } from './flatten-schema';

type ValueEditorProps = {
  item: FlattenedWordingItem;
  value: unknown;
  locale: string;
  onChange: (value: unknown) => void;
};

const StringEditor = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
}) => {
  return (
    <Textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter wording"
      className="min-h-[80px]"
    />
  );
};

const PluralizedEditor = ({
  value,
  onChange,
}: {
  value: SchemaStringTemplateNode['instances'] extends infer T
    ? T extends Record<string, infer U>
      ? U extends { one: string; other: string }
        ? U
        : never
      : never
    : never;
  onChange: (v: { one: string; other: string }) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Input
        value={value?.one ?? ''}
        placeholder="one"
        onChange={(e) =>
          onChange({ one: e.target.value, other: value?.other ?? '' })
        }
      />
      <Input
        value={value?.other ?? ''}
        placeholder="other"
        onChange={(e) =>
          onChange({ one: value?.one ?? '', other: e.target.value })
        }
      />
    </div>
  );
};

const NumberEditor = ({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) => {
  return (
    <Input
      type="number"
      value={value ?? ''}
      onChange={(e) => {
        const next = e.target.value;
        onChange(next === '' ? undefined : Number(next));
      }}
      placeholder="Enter number"
    />
  );
};

const BooleanEditor = ({
  value,
  onChange,
}: {
  value: boolean | undefined;
  onChange: (v: boolean) => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={value ?? false}
        onCheckedChange={(checked) => onChange(checked)}
      />
      <span className="text-sm text-muted-foreground">
        {(value ?? false).toString()}
      </span>
    </div>
  );
};

export const ValueEditor = ({ item, value, onChange }: ValueEditorProps) => {
  switch (item.nodeType) {
    case 'string-template': {
      if (item.variant === 'pluralized') {
        return (
          <PluralizedEditor
            value={(value as any) ?? { one: '', other: '' }}
            onChange={onChange}
          />
        );
      }
      return (
        <StringEditor
          value={value as string | undefined}
          onChange={onChange as (v: string) => void}
        />
      );
    }
    case 'number': {
      return (
        <NumberEditor
          value={value as number | undefined}
          onChange={onChange as (v: number | undefined) => void}
        />
      );
    }
    case 'boolean': {
      return (
        <BooleanEditor
          value={value as boolean | undefined}
          onChange={onChange as (v: boolean) => void}
        />
      );
    }
    case 'array': {
      return (
        <Textarea
          value={Array.isArray(value) ? JSON.stringify(value, null, 2) : ''}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value || '[]');
              onChange(parsed);
            } catch {
              onChange(e.target.value);
            }
          }}
          placeholder="Enter JSON array"
          className="min-h-[80px] font-mono"
        />
      );
    }
    default: {
      return (
        <StringEditor
          value={value as string | undefined}
          onChange={onChange as (v: string) => void}
        />
      );
    }
  }
};
