import { Ruler } from "lucide-react";
import { CampoTexto, CampoMonetario } from "@/compartilhado/componentes";
import { Combobox } from "@/compartilhado/componentes";
import { Controller } from "react-hook-form";
import { UNIDADES_CONSUMO } from "../../constantes";
import { extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";

interface PropriedadesSecaoRendimento {
  register: any;
  control: any;
  errors: any;
  setValue: any;
  itemFracionavelAtivo: boolean;
  unidadeConsumoAtiva: string;
  custoEfetivo: string;
  corTema?: string;
}

export function SecaoRendimentoFracionado({
  register,
  control,
  errors,
  setValue,
  itemFracionavelAtivo,
  unidadeConsumoAtiva,
  custoEfetivo,
  corTema = "sky-500",
}: PropriedadesSecaoRendimento) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-600 flex items-center gap-3">
          Rendimento & Fracionamento
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-100 to-transparent dark:from-white/5 dark:to-transparent" />
        </h4>
      </div>

      <div className={`bg-zinc-50 dark:bg-white/[0.01] border transition-all duration-500 rounded-3xl p-6 ${itemFracionavelAtivo ? `border-${corTema}/20 dark:border-${corTema}/30 shadow-[0_0_15px_-3px_rgba(0,0,0,0.1)] shadow-${corTema}/10` : 'border-zinc-100 dark:border-white/5'}`}>
        <label className="flex items-center gap-5 cursor-pointer select-none group">
          <div className="relative flex items-center justify-center">
            <input type="checkbox" {...register("itemFracionavel")} className="peer sr-only" />
            <div
              className={`w-14 h-7 rounded-full border-2 transition-all duration-500 flex items-center px-1
                ${
                  itemFracionavelAtivo
                    ? `bg-${corTema} border-${corTema}`
                    : "bg-zinc-200 dark:bg-white/5 border-zinc-300 dark:border-white/10 group-hover:border-zinc-400 dark:group-hover:border-white/20"
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
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="relative">
              <Controller
                name="custoMedioUnidade"
                control={control}
                rules={{ required: "Obrigatório" }}
                render={({ field: { onChange, value, ref } }) => (
                  <CampoMonetario
                    ref={ref}
                    rotulo="Custo Base (Clone)"
                    placeholder="0,00"
                    erro={errors.custoMedioUnidade?.message}
                    value={value !== "" && value !== undefined && value !== null ? (Number(value) / 100) : ""}
                    onChange={(e) => {
                      const val = extrairValorNumerico(e.target.value);
                      onChange(Math.round(val * 100));
                    }}
                  />
                )}
              />
            </div>

            <div className="relative">
              <CampoTexto
                rotulo="Rendimento Total"
                icone={Ruler}
                type="text"
                inputMode="decimal"
                placeholder="Ex: 50"
                erro={errors.rendimentoTotal?.message}
                sufixo={unidadeConsumoAtiva || "UND"}
                {...register("rendimentoTotal", {
                  required: itemFracionavelAtivo ? "Obrigatório" : false,
                  setValueAs: (v: any) => extrairValorNumerico(v) || 0,
                })}
              />
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

            <div className="col-span-1 md:col-span-3 pt-8 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center">
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
