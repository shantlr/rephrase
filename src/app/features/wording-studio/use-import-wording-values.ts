import { useState, useCallback } from 'react';
import { parseContent } from '@/app/features/import-wording/parser';
import {
  mapParsedValuesToInstances,
  createImportPreview,
  ValidationError,
} from './map-values-to-instances';
import { WordingData } from '@/server/data/wording.types';

export type ImportStep = 'form' | 'preview' | 'confirm';
export type OverwriteStrategy = 'overwrite' | 'merge';

export interface UseImportWordingValuesResult {
  // State
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  step: ImportStep;

  // Form step
  content: string;
  setContent: (content: string) => void;
  selectedLocale: string;
  setSelectedLocale: (locale: string) => void;

  // Preview step
  parsedValues: unknown;
  mappedInstances: Record<string, Record<string, unknown>>;
  validationErrors: ValidationError[];
  warnings: string[];
  previewStructure: unknown;
  previewStats: { nodeCount: number; fieldCount: number };

  // Confirm step
  overwriteStrategy: OverwriteStrategy;
  setOverwriteStrategy: (strategy: OverwriteStrategy) => void;

  // Actions
  handleParse: () => Promise<void>;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  handleImport: () => Promise<void>;
  reset: () => void;

  // State flags
  isLoading: boolean;
  error: string | null;
  parseSuccess: boolean;
}

export function useImportWordingValues(
  schema: WordingData['schema'],
  availableLocales: string[],
  onImportComplete: (
    instances: Record<string, Record<string, unknown>>,
    locale: string,
    strategy: OverwriteStrategy,
  ) => Promise<void>,
): UseImportWordingValuesResult {
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ImportStep>('form');

  // Form step state
  const [content, setContent] = useState('');
  const [selectedLocale, setSelectedLocale] = useState(
    availableLocales[0] || '',
  );

  // Preview step state
  const [parsedValues, setParsedValues] = useState<unknown>(null);
  const [mappedInstances, setMappedInstances] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [warnings, setWarnings] = useState<string[]>([]);
  const [previewStructure, setPreviewStructure] = useState<unknown>(null);
  const [previewStats, setPreviewStats] = useState({
    nodeCount: 0,
    fieldCount: 0,
  });

  // Confirm step state
  const [overwriteStrategy, setOverwriteStrategy] =
    useState<OverwriteStrategy>('merge');

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseSuccess, setParseSuccess] = useState(false);

  const reset = useCallback(() => {
    setStep('form');
    setContent('');
    setSelectedLocale(availableLocales[0] || '');
    setParsedValues(null);
    setMappedInstances({});
    setValidationErrors([]);
    setWarnings([]);
    setPreviewStructure(null);
    setPreviewStats({ nodeCount: 0, fieldCount: 0 });
    setOverwriteStrategy('merge');
    setError(null);
    setParseSuccess(false);
    setIsOpen(false);
  }, [availableLocales]);

  const handleParse = useCallback(async () => {
    if (!content.trim()) {
      setError('Please paste content to import');
      return;
    }

    if (!selectedLocale) {
      setError('Please select a locale');
      return;
    }

    setIsLoading(true);
    setError(null);
    setParseSuccess(false);

    try {
      // Parse the content
      const parsed = parseContent(content);

      // Get the first root value (or the one selected)
      const valueToImport = parsed.rootValues[0]?.value;

      if (valueToImport === undefined) {
        throw new Error('No valid values found in the imported content');
      }

      // Map values to instances
      const result = mapParsedValuesToInstances(
        valueToImport,
        schema,
        selectedLocale,
      );

      // Filter out "missing field" warnings as those are expected for partial imports
      const fatalErrors = result.validationErrors.filter(
        (err) => !err.error.includes('Missing field'),
      );

      if (fatalErrors.length > 0) {
        setError(`Validation errors found: ${fatalErrors.length} error(s)`);
        setValidationErrors(fatalErrors);
        setParseSuccess(false);
        return;
      }

      // Create preview
      const preview = createImportPreview(valueToImport, schema);

      setParsedValues(valueToImport);
      setMappedInstances(result.instances);
      setValidationErrors(result.validationErrors);
      setWarnings(result.warnings);
      setPreviewStructure(preview.structure);
      setPreviewStats({
        nodeCount: preview.nodeCount,
        fieldCount: preview.fieldCount,
      });
      setParseSuccess(true);
      setStep('preview');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to parse content. Make sure it is valid JSON or TypeScript code.',
      );
      setParseSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [content, selectedLocale, schema]);

  const handleNextStep = useCallback(() => {
    if (step === 'form' && parseSuccess) {
      setStep('preview');
    } else if (step === 'preview') {
      setStep('confirm');
    }
  }, [step, parseSuccess]);

  const handlePreviousStep = useCallback(() => {
    if (step === 'preview') {
      setStep('form');
    } else if (step === 'confirm') {
      setStep('preview');
    }
  }, [step]);

  const handleImport = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onImportComplete(
        mappedInstances,
        selectedLocale,
        overwriteStrategy,
      );
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import values');
    } finally {
      setIsLoading(false);
    }
  }, [
    mappedInstances,
    selectedLocale,
    overwriteStrategy,
    onImportComplete,
    reset,
  ]);

  return {
    // State
    isOpen,
    setIsOpen,
    step,

    // Form step
    content,
    setContent,
    selectedLocale,
    setSelectedLocale,

    // Preview step
    parsedValues,
    mappedInstances,
    validationErrors,
    warnings,
    previewStructure,
    previewStats,

    // Confirm step
    overwriteStrategy,
    setOverwriteStrategy,

    // Actions
    handleParse,
    handleNextStep,
    handlePreviousStep,
    handleImport,
    reset,

    // State flags
    isLoading,
    error,
    parseSuccess,
  };
}
