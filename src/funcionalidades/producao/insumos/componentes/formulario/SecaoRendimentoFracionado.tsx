import { Ruler } from "lucide-react";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { Combobox } from "@/compartilhado/componentes/Combobox";
import { UNIDADES_CONSUMO } from "../../constantes";
import { extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";

interface PropriedadesSecaoRendimento {
  register: any;
  errors: any;
  setValue: any;
  itemFracionavelAtivo: boolean;
  unidadeConsumoAtiva: string;
  custoEfetivo: string;
}

export function SecaoRendimentoFracionado({
  register,
  errors,
  setValue,
  itemFracionavelAtivo,
  unidadeConsumoAtiva,
  custoEfetivo,
}: PropriedadesSecaoRendimento) {
  return (
    <div className="pt-8 border-t border-gray-100 dark:border-white/5">
      <label className="flex items-center gap-4 cursor-pointer select-none w-max group px-2">
        <div className="relative flex items-center justify-center">
          <input type="checkbox" {...register("itemFracionavel")} className="peer sr-only" />
          <div
            className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center
              ${
                itemFracionavelAtivo
                  ? "bg-zinc-900 dark:bg-white border-transparent text-white dark:text-zinc-900 shadow-md ring-4 ring-black/5 dark:ring-white/5"
                  : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 group-hover:border-zinc-400"
              }`}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${itemFracionavelAtivo ? "scale-100" : "scale-0"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
        <div className="flex flex-col">
          <span
            className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
              itemFracionavelAtivo ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-zinc-500"
            }`}
          >
            Cálculo de Rendimento Fracionado
          </span>
          <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-widest">
            Habilitar para itens consumidos em partes (ex: ml, g, metros)
          </span>
        </div>
      </label>

      {itemFracionavelAtivo && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 fade-in duration-500 bg-gray-50/50 dark:bg-black/20 p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner">
          <div className="relative">
            <CampoTexto
              rotulo="Rendimento Total"
              icone={Ruler}
              type="text"
              inputMode="decimal"
              placeholder="Ex: 50"
              erro={errors.rendimentoTotal?.message}
              {...register("rendimentoTotal", {
                required: itemFracionavelAtivo ? "Obrigatório" : false,
                setValueAs: (v: any) => extrairValorNumerico(v) || 0,
              })}
            />
            <span className="absolute right-4 top-[46px] text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none tracking-[0.2em] uppercase">
              {unidadeConsumoAtiva || "UND"}
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
              Consome em
            </label>
            <Combobox
              opcoes={UNIDADES_CONSUMO.map((u) => ({ valor: u.valor, rotulo: u.rotulo }))}
              valor={unidadeConsumoAtiva}
              aoAlterar={(val) => setValue("unidadeConsumo", val, { shouldValidate: true, shouldDirty: true })}
              placeholder="Selecione..."
              permitirNovo={true}
              icone={Ruler}
            />
          </div>

          <div className="col-span-1 md:col-span-2 mt-4 pt-6 border-t border-gray-200/50 dark:border-white/10 flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-500 dark:text-zinc-500 uppercase tracking-[0.2em]">
              CUSTO POR {unidadeConsumoAtiva || "UNIDADE"}:
            </span>
            <span className="text-gray-900 dark:text-white text-lg font-black tracking-tight">
              {custoEfetivo}{" "}
              <span className="text-gray-400 dark:text-zinc-600 text-xs ml-1 uppercase font-black tracking-widest">
                / {unidadeConsumoAtiva || "und"}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
