import { sortBy } from 'lodash-es';

/**
 * Extract params name from string template
 * */
export const extractParams = (template: string) => {
  return sortBy(
    template?.match(/{(.*?)}/g)?.map((m) => m.replace(/[{}]/g, '').trim()) ??
      [],
  );
};
