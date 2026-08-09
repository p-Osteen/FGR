import React from 'react';

export default class ErrorBoundary extends React.Component {
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
        <div className="empty-state" style={{ padding: '4rem 2rem' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{this.state.error?.message}</p>
          <button className="btn" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
