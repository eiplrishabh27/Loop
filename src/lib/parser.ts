import Papa from 'papaparse';
import { ColumnProfile, DataType, ParsedDataset } from '../types';

export function detectDataType(content: string, fileName?: string): DataType {
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'csv') return 'csv';
    if (ext === 'tsv') return 'tsv';
    if (ext === 'json' || ext === 'jsonl') return 'json';
    if (ext === 'md' || ext === 'markdown') return 'markdown';
    if (ext === 'txt') return 'text';
  }

  const trimmed = content.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // ignore
    }
  }

  // Check for TSV
  const firstLines = trimmed.split('\n').slice(0, 5);
  const tabCounts = firstLines.map((l) => (l.match(/\t/g) || []).length);
  if (tabCounts.length > 0 && tabCounts.every((c) => c > 0 && c === tabCounts[0])) {
    return 'tsv';
  }

  // Check for Markdown table
  if (firstLines.some((l) => l.includes('|') && l.includes('---'))) {
    return 'markdown';
  }

  // Check for CSV
  const commaCounts = firstLines.map((l) => (l.match(/,/g) || []).length);
  if (commaCounts.length > 0 && commaCounts.every((c) => c > 0 && c === commaCounts[0])) {
    return 'csv';
  }

  return 'text';
}

export function parseDataset(rawContent: string, fileName = 'dataset.csv'): ParsedDataset {
  const type = detectDataType(rawContent, fileName);
  const bytes = new Blob([rawContent]).size;
  const fileSizeFormatted = formatBytes(bytes);

  if (type === 'json') {
    try {
      const parsed = JSON.parse(rawContent);
      let rows: Record<string, any>[] = [];
      if (Array.isArray(parsed)) {
        rows = parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        // Find if any key has an array of objects
        const arrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]) && parsed[k].length > 0);
        if (arrayKey) {
          rows = parsed[arrayKey];
        } else {
          rows = [parsed];
        }
      }

      const headers = rows.length > 0 ? Array.from(new Set(rows.flatMap((r) => Object.keys(r)))) : [];
      const columnProfiles = computeColumnProfiles(rows, headers);

      return {
        name: fileName,
        type: 'json',
        headers,
        rows,
        rawText: rawContent,
        totalRows: rows.length,
        totalColumns: headers.length,
        columnProfiles,
        fileSizeFormatted,
      };
    } catch (e) {
      console.warn('Failed to parse as JSON, treating as text', e);
    }
  }

  if (type === 'markdown') {
    const lines = rawContent.trim().split('\n');
    const tableLines = lines.filter((l) => l.includes('|'));
    if (tableLines.length >= 2) {
      const headerLine = tableLines[0];
      const headers = headerLine
        .split('|')
        .map((h) => h.trim())
        .filter(Boolean);

      const rows: Record<string, any>[] = [];
      for (let i = 2; i < tableLines.length; i++) {
        const cols = tableLines[i]
          .split('|')
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length);
        if (cols.length === headers.length) {
          const row: Record<string, any> = {};
          headers.forEach((h, idx) => {
            const val = cols[idx];
            row[h] = isNaN(Number(val)) || val === '' ? val : Number(val);
          });
          rows.push(row);
        }
      }

      if (rows.length > 0) {
        const columnProfiles = computeColumnProfiles(rows, headers);
        return {
          name: fileName,
          type: 'markdown',
          headers,
          rows,
          rawText: rawContent,
          totalRows: rows.length,
          totalColumns: headers.length,
          columnProfiles,
          fileSizeFormatted,
        };
      }
    }
  }

  if (type === 'csv' || type === 'tsv') {
    const parsed = Papa.parse<Record<string, any>>(rawContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimiter: type === 'tsv' ? '\t' : undefined,
    });

    const rows = parsed.data || [];
    const headers = parsed.meta.fields || (rows.length > 0 ? Object.keys(rows[0]) : []);
    const columnProfiles = computeColumnProfiles(rows, headers);

    return {
      name: fileName,
      type,
      headers,
      rows,
      rawText: rawContent,
      totalRows: rows.length,
      totalColumns: headers.length,
      columnProfiles,
      fileSizeFormatted,
    };
  }

  // Plain text fallback
  const lines = rawContent.split('\n').filter((l) => l.trim().length > 0);
  const rows = lines.map((line, idx) => ({ line_number: idx + 1, content: line }));
  const headers = ['line_number', 'content'];
  const columnProfiles = computeColumnProfiles(rows, headers);

  return {
    name: fileName,
    type: 'text',
    headers,
    rows,
    rawText: rawContent,
    totalRows: lines.length,
    totalColumns: headers.length,
    columnProfiles,
    fileSizeFormatted,
  };
}

function computeColumnProfiles(rows: Record<string, any>[], headers: string[]): ColumnProfile[] {
  return headers.map((header) => {
    const values = rows.map((r) => r[header]);
    const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== '');
    const nullCount = values.length - nonNullValues.length;
    const distinctSet = new Set(nonNullValues);

    let type: 'number' | 'string' | 'date' | 'boolean' = 'string';
    const sample = nonNullValues[0];

    if (typeof sample === 'boolean') {
      type = 'boolean';
    } else if (typeof sample === 'number' || (!isNaN(Number(sample)) && sample !== '')) {
      const allNumbers = nonNullValues.every((v) => typeof v === 'number' || !isNaN(Number(v)));
      if (allNumbers) type = 'number';
    } else if (typeof sample === 'string' && !isNaN(Date.parse(sample)) && sample.length > 5 && isNaN(Number(sample))) {
      type = 'date';
    }

    let min: number | undefined;
    let max: number | undefined;
    let avg: number | undefined;
    let sum: number | undefined;

    if (type === 'number') {
      const numValues = nonNullValues.map(Number).filter((n) => !isNaN(n));
      if (numValues.length > 0) {
        min = Math.min(...numValues);
        max = Math.max(...numValues);
        sum = numValues.reduce((acc, curr) => acc + curr, 0);
        avg = Math.round((sum / numValues.length) * 100) / 100;
      }
    }

    return {
      name: header,
      type,
      sampleValues: nonNullValues.slice(0, 5),
      nullCount,
      distinctCount: distinctSet.size,
      min,
      max,
      avg,
      sum,
    };
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
