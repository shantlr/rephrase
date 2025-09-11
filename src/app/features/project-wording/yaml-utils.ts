import { ProjectWordingConfig } from './use-project-wording-form';
import { dump, load } from 'js-yaml';

/**
 * Convert project wording configuration to YAML string
 */
export const configToYaml = (config: ProjectWordingConfig): string => {
  try {
    return dump(config, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
    });
  } catch (error) {
    throw new Error(
      `Failed to convert config to YAML: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

/**
 * Parse YAML string to project wording configuration
 */
export const yamlToConfig = (yamlString: string): ProjectWordingConfig => {
  try {
    // Handle empty string
    if (!yamlString.trim()) {
      return {
        enums: [],
        schema: {
          type: 'object',
          description: '',
          fields: [],
        },
      };
    }

    const parsed = load(yamlString) as Record<string, unknown>;

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid YAML: must be an object');
    }

    // Validate and transform the parsed YAML to match our config structure
    const config: ProjectWordingConfig = {
      enums: [],
      schema: {
        type: 'object',
        description: '',
        fields: [],
      },
    };

    // Handle enums
    if (parsed.enums) {
      if (Array.isArray(parsed.enums)) {
        config.enums = parsed.enums.map(
          (enumItem: Record<string, unknown>) => ({
            name: (enumItem.name as string) || '',
            description: (enumItem.description as string) || '',
            values: Array.isArray(enumItem.values)
              ? (enumItem.values as string[])
              : [],
          }),
        );
      }
    }

    // Handle schema
    if (parsed.schema && typeof parsed.schema === 'object') {
      const schema = parsed.schema as Record<string, unknown>;
      config.schema = {
        type: 'object', // Always 'object' for the root schema
        description: (schema.description as string) || '',
        fields: Array.isArray(schema.fields) ? schema.fields : [],
      };
    }

    return config;
  } catch (error) {
    throw new Error(
      `Failed to parse YAML: ${error instanceof Error ? error.message : 'Unknown parsing error'}`,
    );
  }
};

/**
 * Validate YAML string for basic syntax
 */
export const validateYaml = (
  yamlString: string,
): { valid: boolean; error?: string } => {
  try {
    // Empty string is valid
    if (!yamlString.trim()) {
      return { valid: true };
    }

    // Try to parse with js-yaml
    load(yamlString);

    // Additional validation can be done here if needed
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid YAML syntax',
    };
  }
};
