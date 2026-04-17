import { Trash2, AlertTriangle, User } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Cliente } from "../tipos";

interface PropriedadesModalRemocaoCliente {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: () => void;
  cliente: Cliente | null;
}

export function ModalRemocaoCliente({ aberto, aoFechar, aoConfirmar, cliente }: PropriedadesModalRemocaoCliente) {
  if (!cliente) return null;

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} titulo="Remover Cliente" larguraMax="max-w-md">
      <div className="flex flex-col bg-white dark:bg-[#18181b]">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Ícone de Alerta */}
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 shadow-sm border border-rose-200 dark:border-rose-500/20">
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Remover Cliente?</h3>
              <p className="text-sm font-medium text-gray-600 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                Você está prestes a remover <strong className="text-gray-900 dark:text-zinc-300">{cliente.nome}</strong>
                . Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>

          {/* Resumo do Cliente */}
          <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5 relative z-10 w-full">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 flex items-center justify-center shrink-0 shadow-sm">
              <User size={24} className="text-zinc-400" />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight">
                {cliente.nome}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider truncate">
                {cliente.email}
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="p-5 md:p-6 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/80 dark:bg-[#0e0e11]/50 flex items-center justify-end gap-3 rounded-br-xl">
          <button
            type="button"
            onClick={aoFechar}
            className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={aoConfirmar}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-black rounded-xl shadow-lg shadow-rose-500/10 flex items-center gap-2 transition-all active:scale-95"
          >
            <Trash2 size={18} strokeWidth={2.5} />
            Confirmar Remoção
          </button>
        </div>
      </div>
    </Dialogo>
  );
}
