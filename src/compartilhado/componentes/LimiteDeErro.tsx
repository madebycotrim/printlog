import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface PropriedadesLimiteDeErro {
  children: ReactNode;
  textoAlternativo?: string;
}

interface EstadoLimiteDeErro {
  temErro: boolean;
  erro: Error | null;
}

/**
 * Componente ErrorBoundary que captura exceções não tratadas nos filhos
 * e exibe uma tela amigável de recuperação em conformidade com as Regras Globais.
 */
export class LimiteDeErro extends Component<PropriedadesLimiteDeErro, EstadoLimiteDeErro> {
  public state: EstadoLimiteDeErro = {
    temErro: false,
    erro: null,
  };

  public static getDerivedStateFromError(erro: Error): EstadoLimiteDeErro {
    return { temErro: true, erro };
  }

  public componentDidCatch(erro: Error, erroInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Erro capturado pelo LimiteDeErro:", erro, erroInfo);
    }
  }

  private recarregarPagina = () => {
    this.setState({ temErro: false, erro: null });
    window.location.reload();
  };

  private irParaDashboard = () => {
    this.setState({ temErro: false, erro: null });
    window.location.href = "/dashboard";
  };

  public render() {
    if (this.state.temErro) {
      return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
              <AlertTriangle size={32} strokeWidth={2} />
            </div>
          </div>

          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
            Ops! Algo inesperado aconteceu.
          </h2>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-6 leading-relaxed">
            {this.props.textoAlternativo ||
              "Ocorreu uma falha temporária ao carregar esta área do sistema. Seus dados continuam seguros."}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={this.recarregarPagina}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              <RefreshCw size={15} />
              Tentar Novamente
            </button>

            <button
              onClick={this.irParaDashboard}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-100 dark:hover:bg-white/5 active:scale-95 transition-all"
            >
              <Home size={15} />
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
