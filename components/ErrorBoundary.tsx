import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dots flex items-center justify-center p-4">
          <div className="retro-card max-w-md w-full p-8 border-red-500 shadow-[8px_8px_0px_0px_#ef4444]">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 border-2 border-black">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              <h1 className="text-2xl font-black text-white mb-2 font-mono uppercase">
                System Failure
              </h1>
              <p className="text-gray-400 mb-6 font-mono text-sm">
                A critical error has occurred in the mainframe.
                <br />
                <span className="text-red-400 text-xs mt-2 block bg-black/30 p-2 rounded border border-red-900/50">
                  {this.state.error?.message || 'Unknown Error'}
                </span>
              </p>

              <button
                onClick={() => window.location.reload()}
                className="retro-btn bg-white text-black w-full py-3 font-bold flex items-center justify-center gap-2 hover:bg-gray-100"
              >
                <RefreshCw className="w-4 h-4" />
                REBOOT SYSTEM
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
