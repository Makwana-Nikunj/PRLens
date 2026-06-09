import { Component } from 'react';

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
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1326] text-white px-4">
          <span className="material-symbols-outlined text-6xl text-red-400 mb-4">warning</span>
          <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
          <p className="text-slate-400 mb-6 max-w-md text-center">
            The app hit an unexpected error. Reloading will restore your session.
          </p>
          <button
            onClick={this.handleReload}
            className="px-6 py-2 bg-violet-600 rounded-md text-white font-medium hover:bg-violet-700 transition-colors"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
