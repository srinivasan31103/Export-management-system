import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';

export default function FileUpload({ onUpload, accept, maxSize = 10485760, multiple = true }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      progress: 0,
      status: 'pending',
      error: null
    }));

    setFiles(prev => [...prev, ...newFiles]);

    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        const errorMessages = errors.map(e => e.message).join(', ');
        setFiles(prev => [...prev, {
          file,
          id: Math.random().toString(36).substr(2, 9),
          preview: null,
          progress: 0,
          status: 'error',
          error: errorMessages
        }]);
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple
  });

  const removeFile = (id) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);

    for (const fileObj of files) {
      if (fileObj.status === 'error' || fileObj.status === 'success') continue;

      try {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setFiles(prev => prev.map(f =>
            f.id === fileObj.id ? { ...f, progress: i } : f
          ));
        }

        // Call actual upload function
        if (onUpload) {
          await onUpload(fileObj.file);
        }

        setFiles(prev => prev.map(f =>
          f.id === fileObj.id ? { ...f, status: 'success', progress: 100 } : f
        ));
      } catch (error) {
        setFiles(prev => prev.map(f =>
          f.id === fileObj.id ? { ...f, status: 'error', error: error.message } : f
        ));
      }
    }

    setUploading(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <motion.div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
        }`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />

        <motion.div
          animate={{ y: isDragActive ? -10 : 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Upload className={`mx-auto h-12 w-12 ${
            isDragActive ? 'text-primary-500' : 'text-gray-400'
          }`} />
        </motion.div>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {isDragActive ? (
            <span className="text-primary-600 dark:text-primary-400 font-semibold">
              Drop files here...
            </span>
          ) : (
            <>
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                Click to upload
              </span>{' '}
              or drag and drop
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          {accept ? `Accepted: ${Object.keys(accept).join(', ')}` : 'Any file type'}
          {' • '}
          Max size: {formatFileSize(maxSize)}
        </p>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((fileObj) => (
              <motion.div
                key={fileObj.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-4">
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {fileObj.preview ? (
                      <img
                        src={fileObj.preview}
                        alt={fileObj.file.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {getFileIcon(fileObj.file.type)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {fileObj.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(fileObj.file.size)}
                    </p>

                    {/* Progress Bar */}
                    {fileObj.status === 'pending' && fileObj.progress > 0 && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${fileObj.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {fileObj.error && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {fileObj.error}
                      </p>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {fileObj.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {fileObj.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    {fileObj.status === 'pending' && fileObj.progress === 0 && (
                      <button
                        onClick={() => removeFile(fileObj.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      {files.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleUpload}
          disabled={uploading || files.every(f => f.status !== 'pending')}
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Uploading...
            </>
          ) : (
            <>Upload {files.filter(f => f.status === 'pending').length} file(s)</>
          )}
        </motion.button>
      )}
    </div>
  );
}

function getFileIcon(mimeType) {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="h-6 w-6 text-blue-500" />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="h-6 w-6 text-red-500" />;
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return <FileText className="h-6 w-6 text-green-500" />;
  }
  return <File className="h-6 w-6 text-gray-500" />;
}
