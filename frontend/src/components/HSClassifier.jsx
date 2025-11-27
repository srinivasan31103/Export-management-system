import React, { useState } from 'react';
import { aiAPI } from '../api/apiClient';
import { Brain, Loader, CheckCircle } from 'lucide-react';

export default function HSClassifier() {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClassify = async () => {
    if (!description.trim()) {
      setError('Please enter a product description');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await aiAPI.classifyHS(description);
      setResult(response.data);
    } catch (err) {
      setError(err.error || 'Failed to classify HS code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center mb-4">
        <Brain className="h-6 w-6 text-primary mr-2" />
        <h2 className="text-xl font-semibold">HS Code Classifier</h2>
      </div>

      <p className="text-gray-600 mb-4 text-sm">
        Use AI to automatically classify products and get HS codes for customs declarations.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            rows="3"
            placeholder="e.g., stainless steel cutlery set 24 pieces"
          />
        </div>

        <button
          onClick={handleClassify}
          disabled={loading}
          className="btn btn-primary w-full flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Classifying...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Classify HS Code
            </>
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
              <div className="flex-1">
                <div className="mb-3">
                  <p className="text-sm text-gray-600">Suggested HS Code:</p>
                  <p className="text-2xl font-bold text-green-900">{result.hsCode}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Confidence: {result.confidence}%
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Reasons:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {result.reasons?.map((reason, idx) => (
                      <li key={idx} className="text-sm text-gray-600">{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
