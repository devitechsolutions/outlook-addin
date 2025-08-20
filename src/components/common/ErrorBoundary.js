import React from 'react';
import { toast } from 'react-toastify';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    toast.error('Something went wrong. Please refresh the page.', {
      closeOnClick: true,
      pauseOnHover: true,
      theme: 'colored',
      autoClose: 7000,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4">
          <h5>Something went wrong.</h5>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;