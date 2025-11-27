import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, Printer, ChevronDown, Loader2 } from 'lucide-react';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/exportUtils';
import { notify } from './NotificationToast';

export default function ExportButton({
  data,
  filename = 'export',
  elementId,
  title = 'Export Data',
  disabled = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      notify.error('No data to export');
      return;
    }

    setIsExporting(true);
    setIsOpen(false);

    try {
      switch (format) {
        case 'excel':
          await exportToExcel(data, filename);
          notify.success('Exported to Excel successfully');
          break;
        case 'csv':
          await exportToCSV(data, filename);
          notify.success('Exported to CSV successfully');
          break;
        case 'pdf':
          if (!elementId) {
            notify.error('PDF export requires element ID');
            return;
          }
          await exportToPDF(elementId, title);
          notify.success('PDF generated successfully');
          break;
        default:
          notify.error('Invalid export format');
      }
    } catch (error) {
      console.error('Export error:', error);
      notify.error(error.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    {
      label: 'Excel',
      format: 'excel',
      icon: FileSpreadsheet,
      description: 'Export as .xlsx file',
      color: 'text-green-600',
    },
    {
      label: 'CSV',
      format: 'csv',
      icon: FileText,
      description: 'Export as .csv file',
      color: 'text-blue-600',
    },
    ...(elementId ? [{
      label: 'PDF',
      format: 'pdf',
      icon: Printer,
      description: 'Print to PDF',
      color: 'text-red-600',
    }] : []),
  ];

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
        className={`btn btn-secondary flex items-center ${
          disabled || isExporting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isExporting ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <Download className="h-5 w-5 mr-2" />
        )}
        {isExporting ? 'Exporting...' : 'Export'}
        <ChevronDown
          className={`h-4 w-4 ml-1 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-10"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden"
            >
              <div className="py-2">
                {exportOptions.map((option) => (
                  <motion.button
                    key={option.format}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                    onClick={() => handleExport(option.format)}
                    className="w-full px-4 py-3 flex items-start hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <option.icon className={`h-5 w-5 mr-3 mt-0.5 ${option.color}`} />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Bulk export component for multiple sheets
export function BulkExportButton({
  sheets,
  filename = 'bulk-export',
  disabled = false,
  className = ''
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleBulkExport = async () => {
    if (!sheets || Object.keys(sheets).length === 0) {
      notify.error('No data to export');
      return;
    }

    setIsExporting(true);

    try {
      const { exportMultipleSheets } = await import('../utils/exportUtils');
      await exportMultipleSheets(sheets, filename);
      notify.success('Bulk export completed successfully');
    } catch (error) {
      console.error('Bulk export error:', error);
      notify.error(error.message || 'Bulk export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={handleBulkExport}
      disabled={disabled || isExporting}
      className={`btn btn-primary flex items-center ${
        disabled || isExporting ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {isExporting ? (
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
      ) : (
        <FileSpreadsheet className="h-5 w-5 mr-2" />
      )}
      {isExporting ? 'Exporting...' : 'Bulk Export'}
    </motion.button>
  );
}
