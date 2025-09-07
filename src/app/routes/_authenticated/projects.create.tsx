import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/app/common/ui/button';
import { Input } from '@/app/common/ui/input';
import { Label } from '@/app/common/ui/label';
import { Textarea } from '@/app/common/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/common/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/common/ui/select';
import { Badge } from '@/app/common/ui/badge';
import { useCreateProject } from '@/app/features/projects/use-projects';
import { LOCALE_OPTIONS } from '@/app/common/data/locales';

export const Route = createFileRoute('/_authenticated/projects/create')({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLocales, setSelectedLocales] = useState<string[]>(['en']); // Default to English
  const [selectValue, setSelectValue] = useState<string>('');

  const createProjectMutation = useCreateProject();

  const handleAddLocale = (localeCode: string) => {
    if (!selectedLocales.includes(localeCode)) {
      setSelectedLocales([...selectedLocales, localeCode]);
      setSelectValue(''); // Reset select value after adding
    }
  };

  const handleRemoveLocale = (localeCode: string) => {
    if (selectedLocales.length > 1) {
      // Keep at least one locale
      setSelectedLocales(selectedLocales.filter((code) => code !== localeCode));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      await createProjectMutation.mutateAsync({
        name: projectName.trim(),
        description: description.trim(),
        locales: selectedLocales,
      });

      // Navigate back to dashboard on success
      router.navigate({ to: '/dashboard' });
    } catch (error) {
      console.error('Failed to create project:', error);
      // Error is handled by React Query - could show toast here
    }
  };

  const getLocaleDisplayName = (code: string) => {
    const locale = LOCALE_OPTIONS.find((l) => l.code === code);
    return locale ? `${locale.nativeName} (${locale.code})` : code;
  };

  const availableLocales = LOCALE_OPTIONS.filter(
    (locale) => !selectedLocales.includes(locale.code),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.navigate({ to: '/dashboard' })}
            className="mb-4 pl-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Project
          </h1>
          <p className="text-gray-600 mt-2">
            Set up a new localization project with your target locales
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            {createProjectMutation.isError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">
                  {createProjectMutation.error instanceof Error
                    ? createProjectMutation.error.message
                    : 'Failed to create project. Please try again.'}
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="projectName">
                  Project Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>

              {/* Project Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Optional project description"
                />
              </div>

              {/* Selected Locales */}
              <div className="space-y-3">
                <Label>
                  Target Locales <span className="text-destructive">*</span>
                </Label>

                {/* Selected Locales Display */}
                <div className="flex flex-wrap gap-2">
                  {selectedLocales.map((code) => (
                    <Badge key={code} variant="secondary" className="text-sm">
                      {getLocaleDisplayName(code)}
                      {selectedLocales.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLocale(code)}
                          className="ml-2 h-auto p-0 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </Badge>
                  ))}
                </div>

                {/* Locale Selector */}
                <div className="space-y-2">
                  <Label
                    htmlFor="localeSelect"
                    className="text-sm text-muted-foreground"
                  >
                    Add more locales:
                  </Label>
                  <Select
                    value={selectValue}
                    onValueChange={(value) => {
                      setSelectValue(value);
                      if (value) {
                        handleAddLocale(value);
                      }
                    }}
                    disabled={availableLocales.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          availableLocales.length > 0
                            ? 'Select a locale to add...'
                            : 'All locales added'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLocales.map((locale) => (
                        <SelectItem key={locale.code} value={locale.code}>
                          {locale.nativeName} ({locale.code}) - {locale.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.navigate({ to: '/dashboard' })}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !projectName.trim() ||
                    selectedLocales.length === 0 ||
                    createProjectMutation.isPending
                  }
                >
                  {createProjectMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
