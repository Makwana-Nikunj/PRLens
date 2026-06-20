import { Component } from 'react';
import Button from './ui/Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  handleReload = () => {
    if (this.props.onReset) {
      this.props.onReset();
      this.setState({ hasError: false, error: null });
    } else {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className={`flex flex-col items-center justify-center bg-[#0a0a0d] text-white px-4 ${this.props.inline ? 'h-full w-full py-12' : 'min-h-screen'}`}>
          <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 mb-4 border border-red-500/20">
             <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2 text-[#f3f3f6]">Something went wrong</h1>
          <p className="text-[#9b9ba8] mb-6 max-w-md text-center text-[14px]">
            {this.props.inline ? 'This component encountered an error.' : 'The app hit an unexpected error. Reloading will restore your session.'}
          </p>
          <Button variant="secondary" onClick={this.handleReload}>
            {this.props.inline ? 'Try Again' : 'Reload App'}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
