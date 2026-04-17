import { Component, ErrorInfo, ReactNode } from "react";
import { Beaker, RefreshCw, AlertOctagon } from "lucide-react";
import { registrar } from "@/compartilhado/utilitarios/registrador";

interface Props {
  children: ReactNode;
  nomeFuncionalidade: string;
}

interface State {
  temErro: boolean;
}

/**
 * Fronteira de Erro especializada para Funcionalidades Beta.
 * Se um protótipo quebrar, ele não derruba a aplicação inteira.
 */
export class FronteiraErroBeta extends Component<Props, State> {
  public state: State = {
    temErro: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { temErro: true };
  }

  public componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    registrar.error(
      { rastreioId: crypto.randomUUID(), nomeFuncionalidade: this.props.nomeFuncionalidade },
      "Erro em Funcionalidade Beta",
      error,
    );
  }

  public render() {
    if (this.state.temErro) {
      return (
        <div className="p-8 rounded-[2rem] bg-rose-500/5 border border-rose-500/20 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <AlertOctagon size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight text-rose-600 dark:text-rose-400">
              Ops! O Protótipo Falhou
            </h3>
            <p className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
              {this.props.nomeFuncionalidade} (Programa Beta)
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-zinc-400 max-w-md leading-relaxed">
            Funcionalidades experimentais podem apresentar instabilidades. Você pode tentar recarregar ou desativar este
            recurso nas configurações.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
            >
              <RefreshCw size={14} /> Recarregar
            </button>
            <button
              onClick={() => this.setState({ temErro: false })}
              className="px-4 py-2 rounded-xl border border-rose-500/20 text-rose-500 text-xs font-black uppercase tracking-widest hover:bg-rose-500/5 transition-all"
            >
              Tentar Novamente
            </button>
          </div>
          <div className="flex items-center gap-2 pt-4 opacity-50">
            <Beaker size={14} className="text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Relatório Automático Enviado
            </span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
