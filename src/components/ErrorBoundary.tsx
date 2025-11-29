import React from 'react';
import type { ErrorInfo } from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console for development; could be sent to a monitoring service
    // Keep stack trace for easier debugging
    console.error('Uncaught error in ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
