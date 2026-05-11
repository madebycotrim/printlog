import { Ruler } from "lucide-react";
import { CampoTexto } from "@/compartilhado/componentes";
import { Combobox } from "@/compartilhado/componentes";
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
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-600 flex items-center gap-3">
          Rendimento & Fracionamento
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-100 to-transparent dark:from-white/5 dark:to-transparent" />
        </h4>
      </div>

      <div className="bg-zinc-50 dark:bg-white/[0.01] border border-zinc-100 dark:border-white/5 rounded-3xl p-6 transition-all">
        <label className="flex items-center gap-5 cursor-pointer select-none group">
          <div className="relative flex items-center justify-center">
            <input type="checkbox" {...register("itemFracionavel")} className="peer sr-only" />
            <div
              className={`w-14 h-7 rounded-full border-2 transition-all duration-500 flex items-center px-1
                ${
                  itemFracionavelAtivo
                    ? "bg-sky-500 border-sky-500"
                    : "bg-zinc-200 dark:bg-white/5 border-zinc-300 dark:border-white/10"
                }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all duration-500 shadow-sm ${itemFracionavelAtivo ? "translate-x-7" : "translate-x-0"}`} />
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${itemFracionavelAtivo ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500"}`}>
              Ativar Rendimento Fracionado
            </span>
            <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
              Habilitar para itens consumidos em partes (ml, g, metros...)
            </span>
          </div>
        </label>

        {itemFracionavelAtivo && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-top-4 fade-in duration-500">
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
              <span className="absolute right-4 top-[48px] text-[10px] font-black text-zinc-400 dark:text-zinc-500 pointer-events-none tracking-[0.2em] uppercase">
                {unidadeConsumoAtiva || "UND"}
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] px-1">
                Unidade de Consumo
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

            <div className="col-span-1 md:col-span-2 pt-8 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em]">
                  Custo Unitário Efetivo
                </span>
                <span className="text-[10px] font-bold text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">
                  Baseado no rendimento total informado
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-zinc-900 dark:text-white tabular-nums tracking-tighter">
                  {custoEfetivo}
                </span>
                <span className="text-xs font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                  / {unidadeConsumoAtiva || "un"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
