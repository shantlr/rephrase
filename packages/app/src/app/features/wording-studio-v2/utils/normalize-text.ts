/**
 * Normalizes text for search matching:
 * - Converts to lowercase
 * - Removes diacritics (accents)
 *
 * Uses String.prototype.normalize('NFD') to decompose characters,
 * then removes combining diacritical marks.
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

/**
 * Checks if the normalized needle is found in the normalized haystack.
 */
export const matchesSearch = (haystack: string, needle: string): boolean => {
  if (!needle) return true;
  return normalizeText(haystack).includes(normalizeText(needle));
};
