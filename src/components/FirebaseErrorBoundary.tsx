import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class FirebaseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'An unexpected application error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-rgb-canvas p-6">
          <div className="liquid-glass-elevated max-w-md w-full rounded-3xl p-6 text-center space-y-4">
            <h1 className="font-display text-xl font-semibold text-[#1a2238]">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Unable to complete your account or database request. Please reload the page and try
              again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-[#4d6bfe] hover:bg-[#3a59f7] min-h-[44px]"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
