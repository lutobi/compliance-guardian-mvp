// Convert a CSV to a nicely formatted XLSX using exceljs
// Usage: node scripts/csv_to_xlsx.js <input_csv_path> <output_xlsx_path>

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

async function main() {
  const [,, inputCsv, outputXlsx] = process.argv;
  if (!inputCsv || !outputXlsx) {
    console.error('Usage: node scripts/csv_to_xlsx.js <input_csv_path> <output_xlsx_path>');
    process.exit(1);
  }
  const csv = fs.readFileSync(inputCsv, 'utf8');

  // Simple CSV parse (handles commas and quoted fields)
  const rows = csv.split(/\r?\n/).filter(Boolean).map(line => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i+1] === '"') { // Escaped quote
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  });

  const workbook = new ExcelJS.Workbook();
  const sheetName = path.basename(outputXlsx, path.extname(outputXlsx)).slice(0, 31) || 'Sheet1';
  const sheet = workbook.addWorksheet(sheetName);

  // Add rows
  sheet.addRows(rows);

  // Header formatting
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
  headerRow.height = 18;

  // Auto width for columns (max 50)
  sheet.columns.forEach(col => {
    let maxLength = 10;
    col.eachCell({ includeEmpty: true }, cell => {
      const val = cell.value == null ? '' : (typeof cell.value === 'object' ? (cell.value.richText ? cell.value.richText.map(t=>t.text).join('') : String(cell.value.text || cell.value)) : String(cell.value));
      maxLength = Math.min(50, Math.max(maxLength, val.length + 2));
    });
    col.width = maxLength;
  });

  // Freeze header row and add autofilter
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columnCount }
  };

  // Wrap Notes column if present
  const notesColIndex = rows[0].findIndex(h => /notes/i.test(h));
  if (notesColIndex >= 0) {
    for (let r = 2; r <= sheet.rowCount; r++) {
      const cell = sheet.getRow(r).getCell(notesColIndex + 1);
      cell.alignment = { wrapText: true, vertical: 'top' };
    }
  }

  // Optional: color rows by Category column
  const categoryColIndex = rows[0].findIndex(h => /category/i.test(h));
  if (categoryColIndex >= 0) {
    for (let r = 2; r <= sheet.rowCount; r++) {
      const cat = String(sheet.getRow(r).getCell(categoryColIndex + 1).value || '').toLowerCase();
      let fill;
      if (cat.startsWith('material')) {
        fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F2FF' } }; // light blue
      } else if (cat.startsWith('tool')) {
        fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9FCE8' } }; // light green
      }
      if (fill) {
        for (let c = 1; c <= sheet.columnCount; c++) {
          sheet.getRow(r).getCell(c).fill = fill;
        }
      }
    }
  }

  // Add a light border to all used cells
  for (let r = 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= sheet.columnCount; c++) {
      row.getCell(c).border = {
        top: { style: 'thin', color: { argb: 'FFDCE0E5' } },
        left: { style: 'thin', color: { argb: 'FFDCE0E5' } },
        bottom: { style: 'thin', color: { argb: 'FFDCE0E5' } },
        right: { style: 'thin', color: { argb: 'FFDCE0E5' } },
      };
    }
  }

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputXlsx), { recursive: true });
  await workbook.xlsx.writeFile(outputXlsx);
  console.log(`Wrote ${outputXlsx}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
