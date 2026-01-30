import React from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

class LimiteErro extends React.Component {
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
            const {
                title = "Erro no Componente",
                message = "Um erro inesperado ocorreu. Tente recarregar ou contate o suporte.",
                className = "h-full w-full min-h-[120px] p-6",
                onBack,
                backLabel = "Voltar"
            } = this.props;

            return (
                <div className={`flex flex-col items-center justify-center bg-zinc-950/40 border border-rose-500/30 rounded-2xl ${className}`}>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-500/10 mb-3">
                        <AlertOctagon className="w-5 h-5 text-rose-500" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
                    <p className="text-xs text-zinc-400 text-center mb-3 max-w-[200px] leading-relaxed">
                        {message}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={this.handleReset}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-all duration-200 hover:scale-105 text-[10px] font-bold uppercase tracking-wide"
                        >
                            <RefreshCw size={12} />
                            Tentar Novamente
                        </button>
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-all duration-200 hover:scale-105 text-[10px] font-bold uppercase tracking-wide border border-zinc-700"
                            >
                                <Home size={12} />
                                {backLabel}
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default LimiteErro;
