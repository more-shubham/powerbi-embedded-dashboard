"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class PowerBIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(_error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      errorInfo: errorInfo.componentStack || null,
    });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900"
          role="alert"
          aria-live="assertive"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Something went wrong</h2>
            </div>

            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              An unexpected error occurred while loading the Power BI report. Please try refreshing
              the page.
            </p>

            {this.state.error && (
              <div className="mt-4 rounded-md bg-gray-100 p-3 dark:bg-gray-700">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Error details:
                </p>
                <p className="mt-1 font-mono text-xs break-all text-gray-600 dark:text-gray-400">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800"
                aria-label="Refresh page to retry"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Refresh Page
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  Component stack (development only)
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-gray-100 p-2 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  {this.state.errorInfo}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
