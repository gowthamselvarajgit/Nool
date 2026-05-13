import * as XLSX from 'xlsx';

/**
 * Export an array of plain row objects to an Excel file.
 *
 * @param {Object} opts
 * @param {Array<Object>} opts.rows  - One object per row; keys become column headers.
 * @param {string} opts.fileName     - Filename without extension. Today's date is appended.
 * @param {string} [opts.sheetName]  - Worksheet tab name. Defaults to "Data".
 * @param {Array<number>} [opts.columnWidths] - Optional widths in chars per column (left→right).
 */
export function exportToExcel({ rows, fileName, sheetName = 'Data', columnWidths }) {
  if (!Array.isArray(rows) || rows.length === 0) {
    alert('No data to export.');
    return;
  }

  const ws = XLSX.utils.json_to_sheet(rows);

  if (Array.isArray(columnWidths)) {
    ws['!cols'] = columnWidths.map((wch) => ({ wch }));
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${fileName}_${today}.xlsx`);
}
