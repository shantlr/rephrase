import { ReactNode } from 'react';
import { useProjectWordingForm } from '../../use-project-wording-form';
import { useStore } from '@tanstack/react-form';

export const BaseEditLocales = ({
  form,
  beforeLocales,
  children,
}: {
  form: ReturnType<typeof useProjectWordingForm>['form'];
  beforeLocales?: ReactNode;
  children: (locale: string) => ReactNode;
}) => {
  const locales = useStore(form.store, (s) => s.values.locales);

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
