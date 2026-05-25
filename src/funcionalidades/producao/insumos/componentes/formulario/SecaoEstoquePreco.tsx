import { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import { Package, Ruler, AlertCircle, Link as LinkIcon, Calculator } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CampoTexto } from "@/compartilhado/componentes";
import { CampoMonetario } from "@/compartilhado/componentes";
import { Combobox } from "@/compartilhado/componentes";
import { UNIDADES } from "../../constantes";
import { UnidadeInsumo } from "../../tipos";
import { extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";

interface PropriedadesSecaoEstoque {
  register: any;
  control: any;
  errors: any;
  setValue: any;
  unidadeMedidaAtiva: UnidadeInsumo;
  quantidadeAtual: number | string;
  corTema?: string;
}

export function SecaoEstoquePreco({ register, control, errors, setValue, unidadeMedidaAtiva, quantidadeAtual, corTema = "sky-500" }: PropriedadesSecaoEstoque) {
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [valorTotalPago, setValorTotalPago] = useState<number | "">("");

  // Calcula o valor unitário automaticamente quando os campos são preenchidos
  useEffect(() => {
    const qtd = Number(quantidadeAtual);
    if (valorTotalPago !== "" && qtd > 0) {
      const valorUnitarioCentavos = Math.round((valorTotalPago / qtd) * 100);
      setValue("custoMedioUnidade", valorUnitarioCentavos, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
  }, [valorTotalPago, quantidadeAtual, setValue]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-600 flex items-center gap-3">
          Precificação & Estoque
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-100 to-transparent dark:from-white/5 dark:to-transparent" />
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col gap-3 relative">
          <Controller
            name="custoMedioUnidade"
            control={control}
            rules={{ required: "Obrigatório" }}
            render={({ field: { onChange, value, ref } }) => (
              <CampoMonetario
                ref={ref}
                rotulo="Valor Unitário"
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
          <button 
            type="button" 
            onClick={() => setMostrarCalculadora(!mostrarCalculadora)}
            className={`absolute -bottom-6 left-1 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${mostrarCalculadora ? 'text-rose-500' : `text-${corTema} hover:text-${corTema} hover:brightness-110`}`}
          >
            <Calculator size={10} strokeWidth={3} />
            {mostrarCalculadora ? "Fechar Calculadora" : "Calcular pra mim"}
          </button>
        </div>

        <CampoTexto
          rotulo="Estoque Atual"
          icone={Package}
          type="text"
          inputMode="decimal"
          placeholder="1"
          erro={errors.quantidadeAtual?.message}
          {...register("quantidadeAtual", { 
            setValueAs: (v: any) => {
              if (v === "" || v === null || v === undefined) return 1;
              return extrairValorNumerico(v);
            }
          })}
        />

        <Combobox
          titulo="Unidade"
          opcoes={UNIDADES}
          valor={unidadeMedidaAtiva}
          aoAlterar={(val) => setValue("unidadeMedida", val, { shouldDirty: true, shouldValidate: true })}
          icone={Ruler}
          placeholder="Ex: UN, KG..."
          permitirNovo={true}
        />
      </div>

      <AnimatePresence>
        {mostrarCalculadora && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className={`flex items-center gap-6 bg-${corTema}/5 dark:bg-${corTema}/10 p-5 rounded-2xl border border-${corTema}/20`}>
              <div className="flex-1">
                <CampoMonetario
                  rotulo="Valor Total da Compra"
                  placeholder="0,00"
                  value={valorTotalPago !== "" ? valorTotalPago : ""}
                  onChange={(e) => setValorTotalPago(extrairValorNumerico(e.target.value))}
                />
              </div>
              <div className={`flex-1 text-[11px] font-medium text-${corTema} opacity-70 leading-relaxed max-w-sm mt-4 border-l border-${corTema}/20 pl-6`}>
                Dividindo o <strong>valor total pago</strong> pela <strong>quantidade informada no estoque</strong> ({quantidadeAtual || 0}) para descobrir o valor unitário.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CampoTexto
          rotulo="Estoque Mínimo (Alerta)"
          icone={AlertCircle}
          type="text"
          inputMode="decimal"
          placeholder="5"
          erro={errors.quantidadeMinima?.message}
          {...register("quantidadeMinima", { 
            required: "Obrigatório", 
            setValueAs: (v: any) => extrairValorNumerico(v) || 0 
          })}
        />

        <CampoTexto
          rotulo="Link Reposição"
          icone={LinkIcon}
          placeholder="https://..."
          erro={errors.linkCompra?.message}
          {...register("linkCompra")}
        />
      </div>
    </div>
  );
}
