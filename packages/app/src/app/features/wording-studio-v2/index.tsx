import { useState } from 'react';
import { Button } from '@/app/common/ui/button';
import { Card, CardContent, CardHeader } from '@/app/common/ui/card';
import { Input } from '@/app/common/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/common/ui/select';
import { toast } from 'sonner';
import { useUpdateProjectWordingsBranch } from '@/app/features/wording-studio/use-project-wording';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useReadStoreField } from '../wording-studio/store';
import { WordingData } from '@/server/data/wording.types';
import { createV2Store, StudioStoreProvider } from './store';
import { SchemaFieldList } from './nodes/ui-schema-field-list';

type Props = {
  branch: {
    id: string;
    name: string;
    projectId: string;
    schema: WordingData['schema'];
    constants: WordingData['constants'];
    locales: string[];
    localeValues?: Record<string, Record<string, unknown>>;
  };
  projectName?: string;
  projectId: string;
};

export const WordingStudioV2 = ({ branch, projectName, projectId }: Props) => {
  const [store] = useState(() => {
    return createV2Store({
      schema: branch.schema,
      locales: branch.locales,
      constants: branch.constants,
      localeValues: branch.localeValues || {},
      selectedLocale: branch.locales[0] || '',
    });
  });
  const selectedLocale = useReadStoreField(store, 'selectedLocale');
  const search = useReadStoreField(store, 'search') ?? '';

  const updateBranch = useUpdateProjectWordingsBranch();
  const handleSave = async () => {
    try {
      await updateBranch.mutateAsync({
        branchId: branch.id,
        config: {
          constants: branch.constants,
          schema: branch.schema,
          locales: branch.locales.map((tag) => ({
            tag,
            values: store.getField('localeValues')[tag] || {},
          })),
        },
      });
      toast.success('Wording values saved');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save wording values');
    }
  };

  console.log({
    branch,
  });

  return (
    <StudioStoreProvider value={store}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="sticky top-0 z-30 -mx-6 px-6 pt-2 pb-4 bg-gray-50/90 backdrop-blur border-b border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="sm" className="pl-0">
                  <Link to="/projects/$projectId" params={{ projectId }}>
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Project
                  </Link>
                </Button>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {projectName
                      ? `${projectName} • ${branch.name}`
                      : branch.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={selectedLocale}
                  onValueChange={(value) => {
                    store.setField('selectedLocale', value);
                  }}
                  disabled={!branch.locales.length}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Locale" />
                  </SelectTrigger>
                  <SelectContent>
                    {branch.locales.map((locale) => (
                      <SelectItem key={locale} value={locale}>
                        {locale}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSave} disabled={updateBranch.isPending}>
                  <SaveIcon className="w-4 h-4 mr-2" />
                  {updateBranch.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader className="space-y-2">
              <Input
                placeholder="Search by path"
                value={search}
                onChange={(e) => store.setField('search', e.target.value)}
                className="max-w-md"
              />
            </CardHeader>
            <CardContent>
              <SchemaFieldList schemaPath="schema.fields" valuePath="" />
            </CardContent>
          </Card>
        </div>
      </div>
    </StudioStoreProvider>
  );
};
