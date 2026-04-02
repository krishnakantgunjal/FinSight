import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem', margin: '2rem', background: '#fee2e2',
          borderRadius: '12px', border: '1px solid #ef4444'
        }}>
          <h2 style={{ color: '#ef4444' }}>Something went wrong</h2>
          <pre style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '1rem' }}>
            {this.state.error?.message}
          </pre>
          <button onClick={() => window.location.href = '/login'}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
            Go back to Login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
