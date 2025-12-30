export interface ParseResult {
  table: string[][];
  error: string | null;
}

export function parseClipboardContent(content: string): ParseResult {
  if (!content.trim()) {
    return { table: [], error: 'No content to parse' };
  }

  // Try to detect the delimiter
  const lines = content.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length === 0) {
    return { table: [], error: 'No content to parse' };
  }

  // Try tab-separated first (Excel default)
  const tabSeparated = lines.map((line) => parseTabSeparatedLine(line));
  if (isValidTable(tabSeparated)) {
    return { table: tabSeparated, error: null };
  }

  // Try comma-separated
  const commaSeparated = lines.map((line) => parseCsvLine(line));
  if (isValidTable(commaSeparated)) {
    return { table: commaSeparated, error: null };
  }

  // If single column detected, still return it
  if (tabSeparated.every((row) => row.length === 1)) {
    return { table: tabSeparated, error: null };
  }

  return { table: [], error: 'Could not parse content as a table' };
}

function parseTabSeparatedLine(line: string): string[] {
  return line.split('\t').map((cell) => cell.trim());
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else if (char === '"') {
        // End of quoted string
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        // Start of quoted string
        inQuotes = true;
      } else if (char === ',') {
        // Cell delimiter
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }

  // Add the last cell
  cells.push(current.trim());

  return cells;
}

function isValidTable(rows: string[][]): boolean {
  if (rows.length === 0) {
    return false;
  }

  // Check if all rows have the same number of columns (or at least 2 columns)
  const firstRowLength = rows[0].length;
  if (firstRowLength < 1) {
    return false;
  }

  // Allow some flexibility for trailing empty cells
  return rows.every(
    (row) => row.length >= 1 && Math.abs(row.length - firstRowLength) <= 1,
  );
}

export function normalizeTable(table: string[][]): string[][] {
  if (table.length === 0) {
    return table;
  }

  // Find the maximum number of columns
  const maxCols = Math.max(...table.map((row) => row.length));

  // Normalize each row to have the same number of columns
  return table.map((row) => {
    const normalized = [...row];
    while (normalized.length < maxCols) {
      normalized.push('');
    }
    return normalized;
  });
}
