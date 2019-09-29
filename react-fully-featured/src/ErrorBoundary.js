import React, { Component } from 'react';

class ErrorBoundary extends Component {
	state = { error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    // Catch errors in any components below and re-render with error message
    return { error }
    // You can also log error messages to an error reporting service here
  }

  render() {
    if (this.state.error) {
      return (
        <details style={{ whiteSpace: 'pre-wrap' }}>
          <p>could not display this message</p>
        </details>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
