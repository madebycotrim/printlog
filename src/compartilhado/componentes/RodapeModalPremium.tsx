import { ReactNode } from "react";
import { Save } from "lucide-react";

interface PropriedadesRodape {
  aoCancelar: () => void;
  aoConfirmar?: () => void;
  rotuloConfirmar?: string;
  rotuloCancelar?: string;
  desabilitado?: boolean;
  carregando?: boolean;
  corTema?: string;
  children?: ReactNode; // Para casos de rodapé personalizado (ex: confirmação de descarte)
}

/**
 * 💳 RodapeModalPremium - Ações de rodapé padronizadas com design de alta fidelidade v10.0
 */
export function RodapeModalPremium({
  aoCancelar,
  aoConfirmar,
  rotuloConfirmar = "Salvar Alterações",
  rotuloCancelar = "Cancelar",
  desabilitado = false,
  carregando = false,
  corTema = "sky-500",
  children
}: PropriedadesRodape) {
  
  // Mapeamento de cores para o botão principal
  const coresBotao = {
    "sky-500": "bg-sky-500 hover:bg-sky-600 shadow-sky-500/20",
    "emerald-500": "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20",
    "indigo-500": "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20",
    "rose-500": "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20",
  };

  const classeCor = coresBotao[corTema as keyof typeof coresBotao] || coresBotao["sky-500"];

  return (
    <div className="p-6 border-t border-borda-sutil bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-md flex flex-col items-end gap-3 rounded-b-2xl min-h-[80px] justify-center">
      {children ? children : (
        <div className="flex items-center gap-4 w-full justify-between md:justify-end">
          <button
            type="button"
            onClick={aoCancelar}
            className="px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-primary dark:hover:text-white transition-all"
          >
            {rotuloCancelar}
          </button>
          <button
            type={aoConfirmar ? "button" : "submit"}
            onClick={aoConfirmar}
            disabled={desabilitado || carregando}
            className={`px-8 py-2.5 flex-1 md:flex-none justify-center text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 ${classeCor}`}
          >
            <Save size={16} strokeWidth={3} />
            {carregando ? "Processando..." : rotuloConfirmar}
          </button>
        </div>
      )}
    </div>
  );
}
