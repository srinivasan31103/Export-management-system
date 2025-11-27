import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6"
              >
                <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </motion.div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We encountered an unexpected error. Don't worry, our team has been notified.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 text-left bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-64"
                >
                  <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={this.handleReset}
                  className="btn btn-primary flex items-center justify-center"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Try Again
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={this.handleGoHome}
                  className="btn btn-secondary flex items-center justify-center"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Go Home
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Functional error fallback component for specific sections
export function ErrorFallback({ error, resetError }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 my-4"
    >
      <div className="flex items-start">
        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
            Error Loading Component
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            {error?.message || 'An unexpected error occurred'}
          </p>
          {resetError && (
            <button
              onClick={resetError}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
