import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', background: '#0a0c10', color: '#f87171', minHeight: '100vh' }}>
          <h2 style={{ color: '#fff', marginBottom: 12 }}>Something went wrong</h2>
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', maxWidth: 800 }}>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
