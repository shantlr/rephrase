import React from 'react';

/**
 * Highlights matching text in a given string based on a search query
 * @param text - The text to search within
 * @param searchQuery - The search term to highlight
 * @returns JSX with highlighted text or null if no text
 */
export const highlightText = (
  text: string,
  searchQuery: string,
): React.ReactNode => {
  if (!text) {
    return null;
  }

  if (!searchQuery.trim()) {
    return text;
  }

  const query = searchQuery.toLowerCase().trim();
  const lowerText = text.toLowerCase();

  // Find all matching indices
  const matches: Array<{ start: number; end: number }> = [];
  let startIndex = 0;

  while (true) {
    const index = lowerText.indexOf(query, startIndex);
    if (index === -1) break;

    matches.push({
      start: index,
      end: index + query.length,
    });

    startIndex = index + 1;
  }

  if (matches.length === 0) {
    return text;
  }

  // Build the highlighted text
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match, i) => {
    // Add text before the match
    if (match.start > lastIndex) {
      parts.push(text.slice(lastIndex, match.start));
    }

    // Add the highlighted match
    parts.push(
      <mark key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded-sm">
        {text.slice(match.start, match.end)}
      </mark>,
    );

    lastIndex = match.end;
  });

  // Add remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
};

/**
 * Check if text contains the search query (case-insensitive)
 */
export const textContainsQuery = (
  text: string,
  searchQuery: string,
): boolean => {
  if (!text || !searchQuery.trim()) {
    return false;
  }

  return text.toLowerCase().includes(searchQuery.toLowerCase().trim());
};
