import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Widget Error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-full min-h-[200px] flex flex-col items-center justify-center p-6 bg-zinc-950/40 border border-rose-500/30 rounded-2xl">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 mb-4">
                        <AlertOctagon className="w-6 h-6 text-rose-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Widget Error</h3>
                    <p className="text-sm text-zinc-400 text-center mb-4 max-w-xs">
                        Este widget encontrou um erro inesperado.
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
                    >
                        <RefreshCw size={16} />
                        Tentar Novamente
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
