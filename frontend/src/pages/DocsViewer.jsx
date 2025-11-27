import React, { useState } from 'react';
import { aiAPI } from '../api/apiClient';
import { Brain, Loader } from 'lucide-react';
import HSClassifier from '../components/HSClassifier';

export default function DocsViewer({ user }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Tools</h1>
        <p className="mt-1 text-sm text-gray-500">Use AI-powered tools for classification and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HSClassifier />

        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Brain className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold">Business Insights</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Get AI-powered insights about your export business, top countries, and recommendations.
          </p>
          <button className="btn btn-primary">
            Generate Insights
          </button>
        </div>
      </div>
    </div>
  );
}
