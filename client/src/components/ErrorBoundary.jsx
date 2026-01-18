import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ padding: '2rem', color: '#ff5555', backgroundColor: '#111', fontFamily: 'monospace', minHeight: '100vh', whiteSpace: 'pre-wrap' }}>
                    <h1>💥 Something went wrong.</h1>
                    <h2 style={{ color: '#ff7777' }}>{this.state.error && this.state.error.toString()}</h2>
                    <details style={{ marginTop: '1rem', color: '#aaa' }}>
                        <summary>Stack Trace</summary>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '2rem', padding: '0.5rem 1rem', background: '#333', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
