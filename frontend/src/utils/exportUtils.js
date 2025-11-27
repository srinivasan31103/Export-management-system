import * as XLSX from 'xlsx';
import { format } from 'date-fns';

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file (without extension)
 * @param {String} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, filename = 'export', sheetName = 'Sheet1') => {
  try {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const colWidths = Object.keys(data[0] || {}).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.map((row) => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate Excel file
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
};

/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file (without extension)
 */
export const exportToCSV = (data, filename = 'export') => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Get headers
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Handle values with commas, quotes, or newlines
            if (
              value &&
              (value.toString().includes(',') ||
                value.toString().includes('"') ||
                value.toString().includes('\n'))
            ) {
              return `"${value.toString().replace(/"/g, '""')}"`;
            }
            return value ?? '';
          })
          .join(',')
      ),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export to CSV');
  }
};

/**
 * Export data to PDF (using browser print)
 * @param {String} elementId - ID of the element to print
 * @param {String} title - Title for the document
 */
export const exportToPDF = (elementId, title = 'Export Document') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${element.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF');
  }
};

/**
 * Export multiple sheets to Excel
 * @param {Object} sheets - Object with sheet names as keys and data arrays as values
 * @param {String} filename - Name of the file (without extension)
 */
export const exportMultipleSheets = (sheets, filename = 'export') => {
  try {
    const wb = XLSX.utils.book_new();

    Object.entries(sheets).forEach(([sheetName, data]) => {
      if (data && data.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data);

        // Auto-size columns
        const colWidths = Object.keys(data[0]).map((key) => {
          const maxLength = Math.max(
            key.length,
            ...data.map((row) => String(row[key] || '').length)
          );
          return { wch: Math.min(maxLength + 2, 50) };
        });
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }
    });

    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);

    return true;
  } catch (error) {
    console.error('Error exporting multiple sheets:', error);
    throw new Error('Failed to export to Excel');
  }
};

/**
 * Import Excel file
 * @param {File} file - Excel file to import
 * @returns {Promise<Object>} Object with sheet names as keys and data arrays as values
 */
export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const result = {};
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          result[sheetName] = XLSX.utils.sheet_to_json(worksheet);
        });

        resolve(result);
      } catch (error) {
        reject(new Error('Failed to parse Excel file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Import CSV file
 * @param {File} file - CSV file to import
 * @returns {Promise<Array>} Array of objects
 */
export const importFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter((line) => line.trim());

        if (lines.length === 0) {
          reject(new Error('File is empty'));
          return;
        }

        // Parse headers
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));

        // Parse data
        const data = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });

        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Format data for export (clean up and transform)
 * @param {Array} data - Raw data array
 * @param {Object} columnMapping - Object mapping internal keys to display names
 * @param {Array} excludeColumns - Array of column keys to exclude
 */
export const formatForExport = (data, columnMapping = {}, excludeColumns = []) => {
  return data.map((row) => {
    const formattedRow = {};

    Object.entries(row).forEach(([key, value]) => {
      // Skip excluded columns
      if (excludeColumns.includes(key)) return;

      // Use mapped column name or original key
      const displayKey = columnMapping[key] || key;

      // Format value
      let formattedValue = value;

      // Handle dates
      if (value instanceof Date) {
        formattedValue = format(value, 'yyyy-MM-dd HH:mm:ss');
      } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        formattedValue = format(new Date(value), 'yyyy-MM-dd HH:mm:ss');
      }

      // Handle objects and arrays
      if (typeof value === 'object' && value !== null) {
        formattedValue = JSON.stringify(value);
      }

      formattedRow[displayKey] = formattedValue;
    });

    return formattedRow;
  });
};

/**
 * Download file from URL
 * @param {String} url - File URL
 * @param {String} filename - Name for downloaded file
 */
export const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);

    link.setAttribute('href', objectUrl);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(objectUrl);

    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};
