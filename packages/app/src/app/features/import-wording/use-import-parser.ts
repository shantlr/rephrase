import { useState, useCallback, useMemo } from 'react';
import { parseContent } from './parser';
import { inferSchemaFromValue } from './schema-mapper';
import { omit } from 'lodash-es';
import { WordingData } from '@/server/data/wording.types';

export function useImportParser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [parsedData, setParsedData] = useState<{
    values: { name: string | undefined; value: unknown }[];
  }>();

  const [selectedData, setSelectedData] = useState<unknown | null>(null);

  const parse = useCallback((content: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedData(null);

    try {
      // Auto-detect and parse the content
      const parsed = parseContent(content);
      setParsedData({
        values: parsed.rootValues,
      });
      if (parsed.rootValues.length === 1) {
        setSelectedData(parsed.rootValues[0].value);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onSelectValue = useCallback(
    (value: NonNullable<typeof parsedData>['values'][number]) => {
      setSelectedData(value.value);
    },
    [],
  );

  const inferredSchema = useMemo(() => {
    if (!selectedData) {
      return null;
    }

    const inferred = inferSchemaFromValue(selectedData);
    if (!inferred) {
      return null;
    }

    const rootNode = inferred.nodes[inferred.rootId];
    if (rootNode?.type !== 'object') {
      return null;
    }

    return {
      nodes: omit(inferred.nodes, inferred.rootId),
      root: rootNode,
    } satisfies WordingData['schema'];
  }, [selectedData]);

  console.log({
    inferredSchema,
  });

  return {
    values: parsedData?.values,
    inferredSchema,
    onSelectValue,
    parse,
    isLoading,
    error,
  };
}
