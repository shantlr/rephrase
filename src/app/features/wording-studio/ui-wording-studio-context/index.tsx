import { createContext, useContext } from 'react';
import { useProjectWordingForm } from '../use-project-wording-form';

const Context = createContext<
  ReturnType<typeof useProjectWordingForm>['store'] | null
>(null);

export const WordingStudioProvider = ({
  store,
  children,
}: {
  store: ReturnType<typeof useProjectWordingForm>['store'];
  children: React.ReactNode;
}) => {
  return <Context.Provider value={store}>{children}</Context.Provider>;
};

export type WordingStudioStore = ReturnType<
  typeof useProjectWordingForm
>['store'];

export const useWordingStudioStore = () => {
  const store = useContext(Context);
  return store;
};
