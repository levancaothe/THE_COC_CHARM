import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '100vh' }}>
          <h2>Lỗi! Có vấn đề xảy ra</h2>
          <p style={{ color: 'red', marginTop: '20px' }}>
            {this.state.error?.message || 'Không xác định'}
          </p>
          <pre style={{ 
            background: '#f0f0f0', 
            padding: '20px', 
            borderRadius: '8px', 
            textAlign: 'left',
            overflow: 'auto'
          }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
