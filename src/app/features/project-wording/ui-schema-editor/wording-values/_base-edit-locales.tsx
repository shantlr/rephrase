import { ReactNode } from 'react';
import { useProjectWordingForm } from '../../use-project-wording-form';
import { useStore } from '@tanstack/react-form';

export const BaseEditLocales = ({
  form,
  children,
}: {
  form: ReturnType<typeof useProjectWordingForm>['form'];
  children: (locale: string) => ReactNode;
}) => {
  const locales = useStore(form.store, (s) => s.values.locales);

  return (
    <div className="flex flex-col gap-2">
      {locales.map((locale) => (
        <div key={locale}>
          <h2 className="font-bold text-black">{locale}</h2>
          {children(locale)}
        </div>
      ))}
    </div>
  );
};
