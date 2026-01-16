import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("🚀 SELF LOG: Application Bootstrap Initiated");

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('CRITICAL UI ERROR:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.toString()}</p>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }}>Reset & Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("✅ SELF LOG: React Render Complete");
  } catch (err) {
    console.error("FATAL BOOTSTRAP ERROR:", err);
    container.innerHTML = `<div style="padding:40px; color:red;"><h1>Bootstrap Failed</h1><p>${err}</p></div>`;
  }
} else {
  console.error("CRITICAL: No #root element found");
}
