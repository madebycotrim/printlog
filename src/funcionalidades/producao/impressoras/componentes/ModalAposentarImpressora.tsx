import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { AlertTriangle, Archive, Wrench } from "lucide-react";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";

interface ModalAposentarImpressoraProps {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: () => void;
  impressora: Impressora | null;
}

export function ModalAposentarImpressora({ aberto, aoFechar, aoConfirmar, impressora }: ModalAposentarImpressoraProps) {
  if (!impressora) return null;
  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} titulo="Aposentar Impressora" larguraMax="max-w-md">
      <div className="flex flex-col bg-white dark:bg-[#18181b]">
        <div className="p-8 md:p-10 space-y-8">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner border border-rose-100 dark:border-rose-500/20 animate-pulse">
              <AlertTriangle size={40} strokeWidth={2.5} />
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                Aposentar Máquina?
              </h3>
              <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 max-w-[300px] mx-auto leading-relaxed uppercase tracking-widest">
                O equipamento será movido para o arquivo, preservando todo o{" "}
                <span className="text-gray-900 dark:text-white">histórico operacional</span>.
              </p>
            </div>
          </div>

          {/* Card Resumo da Impressora */}
          <div className="flex items-center gap-5 bg-gray-50/50 dark:bg-black/20 p-5 rounded-2xl border border-gray-100 dark:border-white/5 w-full shadow-inner group">
            <div className="w-16 h-16 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/5 flex items-center justify-center shrink-0 relative overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-500">
              {impressora.imagemUrl ? (
                <img
                  src={impressora.imagemUrl}
                  alt={impressora.nome}
                  className="w-[85%] h-[85%] object-contain scale-110 drop-shadow-md"
                />
              ) : (
                <Wrench size={28} className="text-zinc-400 dark:text-zinc-600" />
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-base font-black text-gray-900 dark:text-white truncate uppercase tracking-tight">
                {impressora.nome}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-black uppercase tracking-[0.2em] truncate mt-1">
                {impressora.marca || impressora.tecnologia} • {impressora.modeloBase}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0e0e11]/50 backdrop-blur-md flex items-center justify-end gap-4 rounded-b-2xl">
          <button
            type="button"
            onClick={aoFechar}
            className="px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={aoConfirmar}
            className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Archive size={16} strokeWidth={3} />
            Confirmar Aposentadoria
          </button>
        </div>
      </div>
    </Dialogo>
  );
}
