import { Trash2, AlertTriangle, Box } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Insumo } from "@/funcionalidades/producao/insumos/tipos";

interface ModalArquivamentoInsumoProps {
  aberto: boolean;
  insumo: Insumo | null;
  aoFechar: () => void;
  aoConfirmar: (idInsumo: string) => void;
}

export function ModalArquivamentoInsumo({ aberto, insumo, aoFechar, aoConfirmar }: ModalArquivamentoInsumoProps) {
  if (!aberto || !insumo) return null;

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} titulo="Remover Insumo" larguraMax="max-w-md">
      <div className="flex flex-col bg-white dark:bg-[#18181b]">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Ícone de Alerta */}
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 shadow-sm border border-rose-200 dark:border-rose-500/20">
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Remover Insumo?</h3>
              <p className="text-sm font-medium text-gray-600 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                Este insumo sairá da sua lista, mas as{" "}
                <strong className="text-gray-900 dark:text-zinc-300">referências passadas</strong> serão preservadas.
              </p>
            </div>
          </div>

          {/* Card Resumo do Insumo a ser apagado */}
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 shadow-sm dark:shadow-none dark:border-white/5 relative z-10 w-full">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-200 dark:from-[#18181b] dark:to-[#121214] border border-gray-200/60 dark:border-white/5 flex items-center justify-center shrink-0 relative overflow-hidden shadow-inner text-gray-500 dark:text-zinc-600">
              <Box size={24} strokeWidth={2} />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight">
                {insumo.nome}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider truncate">
                {insumo.categoria} {insumo.marca ? `• ${insumo.marca}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="p-5 md:p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-[#0e0e11]/50 flex items-center justify-end gap-3 rounded-br-xl">
          <button
            type="button"
            onClick={aoFechar}
            className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => aoConfirmar(insumo.id)}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Trash2 size={18} strokeWidth={2.5} />
            Sim, Remover Insumo
          </button>
        </div>
      </div>
    </Dialogo>
  );
}
