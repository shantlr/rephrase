import { ReactNode } from 'react';
import { useReadStoreField } from '../../store';
import { useWordingStudioStore } from '../../ui-wording-studio-context';

export const BaseEditLocales = ({
  beforeLocales,
  children,
}: {
  beforeLocales?: ReactNode;
  children: (locale: string) => ReactNode;
}) => {
  const store = useWordingStudioStore();
  const locales = useReadStoreField(store, 'locales');

  return (
    <div className="flex flex-col gap-2">
      {beforeLocales}
      {locales.map((locale) => (
        <div key={locale}>
          <h2 className="font-bold text-black">{locale}</h2>
          {children(locale)}
        </div>
      ))}
    </div>
  );
};
