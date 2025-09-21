// import { useState, useEffect, useCallback } from 'react';
// import { ProjectWordingConfig } from '../use-project-wording-form';
// import { configToYaml, yamlToConfig, validateYaml } from '../yaml-utils';
// import Editor, { BeforeMount } from '@monaco-editor/react';
// import { configureMonacoYaml } from 'monaco-yaml';
// import { projectWordingConfigSchema } from './schema';

// interface YamlEditorProps {
//   config: ProjectWordingConfig;
//   onChange: (config: ProjectWordingConfig) => void;
//   className?: string;
// }

// export const YamlEditor = ({
//   config,
//   onChange,
//   className,
// }: YamlEditorProps) => {
//   const [yamlContent, setYamlContent] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [isInitialized, setIsInitialized] = useState(false);

//   // Configure Monaco with YAML schema support
//   const handleEditorWillMount: BeforeMount = (monaco) => {
//     configureMonacoYaml(monaco, {
//       enableSchemaRequest: false,
//       hover: true,
//       completion: true,
//       validate: true,
//       format: true,
//       schemas: [
//         {
//           uri: 'http://internal/project-wording-config.schema.json',
//           fileMatch: ['*'],
//           schema: projectWordingConfigSchema as any, // Monaco YAML has looser typing
//         },
//       ],
//     });
//   };

//   // Initialize YAML content from config
//   useEffect(() => {
//     if (!isInitialized) {
//       try {
//         const yamlString = configToYaml(config);
//         setYamlContent(yamlString);
//         setError(null);
//         setIsInitialized(true);
//       } catch (err) {
//         setError(
//           err instanceof Error
//             ? err.message
//             : 'Failed to convert config to YAML',
//         );
//       }
//     }
//   }, [config, isInitialized]);

//   const handleYamlChange = useCallback(
//     (value: string) => {
//       setYamlContent(value);

//       // Clear error if content is empty
//       if (!value.trim()) {
//         setError(null);
//         return;
//       }

//       // Validate YAML and update config
//       const validation = validateYaml(value);
//       if (validation.valid) {
//         try {
//           const newConfig = yamlToConfig(value);
//           onChange(newConfig);
//           setError(null);
//         } catch (err) {
//           const errorMessage =
//             err instanceof Error ? err.message : 'Failed to parse YAML';
//           console.warn('YAML parsing error:', errorMessage);
//           setError(errorMessage);
//         }
//       } else {
//         setError(validation.error || 'Invalid YAML syntax');
//       }
//     },
//     [onChange],
//   );

//   return (
//     <div className={`space-y-4 ${className}`}>
//       {/* Error display */}
//       {error && (
//         <div className="p-3 bg-red-50 border border-red-200 rounded-md">
//           <p className="text-sm text-red-700 font-medium">YAML Error:</p>
//           <p className="text-sm text-red-600 mt-1">{error}</p>
//         </div>
//       )}

//       {/* Monaco YAML editor */}
//       <div className="border border-gray-300 rounded-md overflow-hidden">
//         <Editor
//           height="400px"
//           language="yaml"
//           value={yamlContent}
//           onChange={(value) => handleYamlChange(value || '')}
//           beforeMount={handleEditorWillMount}
//           theme="light"
//           options={{
//             minimap: { enabled: false },
//             scrollBeyondLastLine: false,
//             fontSize: 13,
//             lineNumbers: 'on',
//             wordWrap: 'on',
//             folding: true,
//             tabSize: 2,
//             insertSpaces: true,
//             suggest: {
//               showKeywords: true,
//               showSnippets: true,
//             },
//             quickSuggestions: {
//               other: true,
//               comments: false,
//               strings: true,
//             },
//           }}
//         />
//       </div>

//       {/* Status indicator */}
//       <div className="flex items-center gap-2 text-sm">
//         <div
//           className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}
//         />
//         <span className="text-gray-600">
//           {error ? 'YAML contains errors' : 'YAML is valid'}
//         </span>
//       </div>
//     </div>
//   );
// };
