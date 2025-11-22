import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] ========== ERROR CAUGHT ==========');
    console.error('[ErrorBoundary] Error:', error);
    console.error('[ErrorBoundary] Error message:', error.message);
    console.error('[ErrorBoundary] Error stack:', error.stack);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    
    // Also show error on screen immediately
    setTimeout(() => {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: #ff4d4f; color: white; padding: 20px; z-index: 999999; font-family: monospace;';
      errorDiv.innerHTML = `<strong>ERROR:</strong> ${error.message}<br><small>${error.stack?.split('\n')[0]}</small>`;
      document.body.appendChild(errorDiv);
    }, 100);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle={this.state.error?.message || 'An unexpected error occurred'}
          extra={[
            <Button type="primary" key="reload" onClick={() => window.location.reload()}>
              Reload Page
            </Button>,
          ]}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

