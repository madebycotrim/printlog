import { AlertTriangle } from "lucide-react";

interface PropsBannerErro {
  titulo?: string;
  mensagem?: string;
  aoTentarNovamente: () => void;
}

export function BannerErro({
  titulo = "Falha ao sincronizar dados",
  mensagem = "Não foi possível carregar as informações do servidor. Verifique sua conexão com a internet e tente novamente.",
  aoTentarNovamente
}: PropsBannerErro) {
  return (
    <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/50 dark:border-rose-900/30 rounded-[2rem] p-8 text-center space-y-4 max-w-2xl mx-auto my-6">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-2">
        <AlertTriangle size={24} />
      </div>
      <div className="text-rose-500 font-semibold text-sm uppercase tracking-wider">{titulo}</div>
      <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
        {mensagem}
      </p>
      <button
        onClick={aoTentarNovamente}
        className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
