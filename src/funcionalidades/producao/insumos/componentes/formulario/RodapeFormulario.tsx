import { Save } from "lucide-react";

interface PropriedadesRodape {
  confirmarDescarte: boolean;
  estaEditando: boolean;
  isDirty: boolean;
  aoCancelar: () => void;
  aoFecharRealmente: () => void;
  aoContinuarEditando: () => void;
}

export function RodapeFormulario({
  confirmarDescarte,
  estaEditando,
  isDirty,
  aoCancelar,
  aoFecharRealmente,
  aoContinuarEditando,
}: PropriedadesRodape) {
  return (
    <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0e0e11]/50 backdrop-blur-md flex flex-col items-end gap-3 rounded-b-2xl min-h-[80px] justify-center">
      {!confirmarDescarte ? (
        <div className="flex items-center gap-4 w-full justify-between md:justify-end">
          <button
            type="button"
            onClick={aoCancelar}
            className="px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={{ backgroundColor: "var(--cor-primaria)" }}
            className="px-8 py-3 flex-1 md:flex-none justify-center hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Save size={16} strokeWidth={3} />
            {estaEditando ? "Salvar Alterações" : "Cadastrar Insumo"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-end gap-4 w-full animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="flex items-center gap-3 w-full justify-between md:justify-end">
            <button
              type="button"
              onClick={aoFecharRealmente}
              className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
            >
              Descartar Alterações
            </button>
            <button
              type="button"
              onClick={aoContinuarEditando}
              className="px-8 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-xl shadow-black/10 dark:shadow-white/5"
            >
              Continuar Editando
            </button>
          </div>
          {isDirty && (
            <div className="flex flex-col items-end gap-1 animate-in slide-in-from-top-1 fade-in duration-300">
              <span className="text-[10px] font-black text-red-600 dark:text-red-500 uppercase tracking-widest mr-2">
                Há alterações não salvas
              </span>
              <span className="text-[8px] font-medium text-gray-500 uppercase tracking-widest mr-2 opacity-70">
                O progresso atual será perdido se você sair
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
