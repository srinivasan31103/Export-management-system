import React from 'react';

export default function PDFViewer({ pdfUrl, title }) {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <iframe
        src={pdfUrl}
        className="w-full h-[600px] border border-gray-300 rounded"
        title={title}
      />
    </div>
  );
}
