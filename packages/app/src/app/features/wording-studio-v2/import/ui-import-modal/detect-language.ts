import { detect } from 'tinyld';

export function detectColumnLanguages(
  table: string[][],
  availableLocales: string[],
): {
  detectedLanguages: string[];
  confidence: number[];
} {
  if (table.length === 0 || table[0].length === 0) {
    return { detectedLanguages: [], confidence: [] };
  }

  const numColumns = table[0].length;
  const detectedLanguages: string[] = [];
  const confidence: number[] = [];

  for (let col = 0; col < numColumns; col++) {
    // Collect all text from this column
    const columnText = table
      .map((row) => row[col] || '')
      .filter((text) => text.trim().length > 0)
      .join(' ');

    if (!columnText.trim()) {
      detectedLanguages.push(availableLocales[0] || 'en');
      confidence.push(0);
      continue;
    }

    // Detect language
    const detected = detect(columnText);

    // Try to match with available locales
    const matchedLocale = findMatchingLocale(detected, availableLocales);

    if (matchedLocale) {
      detectedLanguages.push(matchedLocale);
      confidence.push(0.8); // tinyld doesn't provide confidence, use a reasonable default
    } else {
      // Fall back to first available locale or 'en'
      detectedLanguages.push(
        availableLocales[col] || availableLocales[0] || 'en',
      );
      confidence.push(0.3);
    }
  }

  return { detectedLanguages, confidence };
}

function findMatchingLocale(
  detected: string,
  availableLocales: string[],
): string | null {
  if (!detected) {
    return null;
  }

  // Normalize the detected language code
  const normalizedDetected = detected.toLowerCase();

  // Try exact match first
  const exactMatch = availableLocales.find(
    (locale) => locale.toLowerCase() === normalizedDetected,
  );
  if (exactMatch) {
    return exactMatch;
  }

  // Try prefix match (e.g., 'en' matches 'en-US')
  const prefixMatch = availableLocales.find((locale) =>
    locale.toLowerCase().startsWith(normalizedDetected),
  );
  if (prefixMatch) {
    return prefixMatch;
  }

  // Try reverse prefix match (e.g., 'en-US' detected, 'en' available)
  const reversePrefixMatch = availableLocales.find((locale) =>
    normalizedDetected.startsWith(locale.toLowerCase()),
  );
  if (reversePrefixMatch) {
    return reversePrefixMatch;
  }

  return null;
}

export function getLanguageDisplayName(localeCode: string): string {
  try {
    const displayName = new Intl.DisplayNames(['en'], { type: 'language' });
    return displayName.of(localeCode) || localeCode;
  } catch {
    return localeCode;
  }
}
