import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary] Caught:', error.message, error.stack);
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
  }

  handleReset = () => {
    (this as unknown as { setState: (s: State) => void }).setState({ hasError: false, error: null });
  };

  render() {
    const self = this as unknown as { state: State; props: Props };
    if (self.state.hasError) {
      if (self.props.fallback) return self.props.fallback;

      return (
        <div className="p-10" style={{ fontFamily: 'sans-serif', background: '#0a0c10', color: '#f87171', minHeight: '100vh' }}>
          <h2 style={{ color: '#fff', marginBottom: 12, fontSize: 20, fontWeight: 700 }}>Something went wrong</h2>
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', maxWidth: 800, marginBottom: 24 }}>{self.state.error?.message}</pre>
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 24px',
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return self.props.children;
  }
}
