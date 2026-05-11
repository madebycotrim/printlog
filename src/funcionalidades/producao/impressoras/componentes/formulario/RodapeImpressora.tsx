import { Save } from "lucide-react";
import { RodapeModalPremium } from "@/compartilhado/componentes";

interface PropriedadesRodape {
  confirmarDescarte: boolean;
  estaEditando: boolean;
  isDirty: boolean;
  aoCancelar: () => void;
  aoFecharRealmente: () => void;
  aoContinuarEditando: () => void;
}

export function RodapeImpressora({
  confirmarDescarte,
  estaEditando,
  isDirty,
  aoCancelar,
  aoFecharRealmente,
  aoContinuarEditando,
}: PropriedadesRodape) {
  return (
    <RodapeModalPremium aoCancelar={aoCancelar} corTema="sky-500">
      {!confirmarDescarte ? (
        <div className="flex items-center gap-4 w-full justify-between md:justify-end">
          <button
            type="button"
            onClick={aoCancelar}
            className="px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 flex-1 md:flex-none justify-center bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Save size={16} strokeWidth={3} />
            {estaEditando ? "Salvar Alterações" : "Cadastrar Máquina"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-end gap-2 w-full animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="flex items-center gap-3 w-full justify-between md:justify-end">
            <button
              type="button"
              onClick={aoFecharRealmente}
              className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
            >
              Descartar Alterações
            </button>
            <button
              type="button"
              onClick={aoContinuarEditando}
              className="px-8 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg"
            >
              Continuar Editando
            </button>
          </div>
          {isDirty && (
            <span className="text-[9px] font-black text-rose-500/70 uppercase tracking-[0.2em] mr-2">
              Há alterações não salvas que serão perdidas
            </span>
          )}
        </div>
      )}
    </RodapeModalPremium>
  );
}
