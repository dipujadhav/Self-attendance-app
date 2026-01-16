
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
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
        <div className="h-screen w-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-full mb-6 text-rose-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">Something went wrong</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">The application encountered an unexpected error. Your data is safe.</p>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all mb-4"
          >
            Clear Data & Restart
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="text-slate-400 hover:text-indigo-600 text-sm font-medium"
          >
            Try Refreshing
          </button>
          <div className="mt-12 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl text-left overflow-auto max-w-full">
            <p className="text-[10px] font-mono text-slate-400 uppercase mb-2">Error Details</p>
            <code className="text-[10px] font-mono text-rose-500 dark:text-rose-400 leading-tight">
              {this.state.error?.toString()}
            </code>
          </div>
        </div>
      );
    }

    // Fix: access children from props in class component
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  const fallback = document.createElement('div');
  fallback.style.padding = '20px';
  fallback.style.color = 'red';
  fallback.innerText = 'Critical Error: Mounting root not found.';
  document.body.appendChild(fallback);
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);