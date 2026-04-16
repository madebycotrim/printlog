import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoMonetario } from "@/compartilhado/componentes/CampoMonetario";
import { ArrowUpCircle, TrendingUp, Info, Package, DollarSign, FileText } from "lucide-react";
import { Insumo } from "@/funcionalidades/producao/insumos/tipos";

interface ModalReposicaoInsumoProps {
  aberto: boolean;
  insumo: Insumo | null;
  aoFechar: () => void;
  aoConfirmar: (id: string, quantidade: number, valorTotalCompra: number, observacao?: string) => void;
}

export function ModalReposicaoInsumo({ aberto, insumo, aoFechar, aoConfirmar }: ModalReposicaoInsumoProps) {
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      quantidade: 1,
      custoCompraTotal: "",
      observacao: "",
    },
  });

  const watchQtd = watch("quantidade") || 1;
  const watchCustoStr = watch("custoCompraTotal") || "0";
  // Tenta converter p tratar UI
  const custoConvertido =
    typeof watchCustoStr === "string" ? parseFloat(watchCustoStr.replace(",", ".")) : watchCustoStr;
  const custoUnitarioSimulado =
    !isNaN(custoConvertido) && custoConvertido > 0 && watchQtd > 0 ? custoConvertido / watchQtd : 0;

  if (!aberto || !insumo) return null;

  const fecharModalRealmente = () => {
    setConfirmarDescarte(false);
    aoFechar();
  };

  const lidarComTentativaFechamento = () => {
    if (isDirty && !confirmarDescarte) {
      setConfirmarDescarte(true);
    } else {
      fecharModalRealmente();
    }
  };

  const onSubmit = (data: any) => {
    const qtdNumerica = Number(data.quantidade);
    const custoRealStr = String(data.custoCompraTotal).replace(",", ".");
    const custoNumerico = Number(custoRealStr);

    if (qtdNumerica > 0 && custoNumerico >= 0) {
      aoConfirmar(insumo.id, qtdNumerica, custoNumerico, data.observacao);
      reset();
      fecharModalRealmente();
    }
  };

  return (
    <Dialogo aberto={aberto} aoFechar={lidarComTentativaFechamento} titulo="Reposição de Estoque" larguraMax="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 bg-white dark:bg-[#18181b]">
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-4 flex gap-4 text-sm items-start">
          <TrendingUp className="text-emerald-500 flex-shrink-0" size={24} />
          <div className="flex-1">
            <strong className="text-emerald-800 dark:text-emerald-400 block mb-1">{insumo.nome}</strong>
            <span className="text-emerald-700/80 dark:text-emerald-400/80 block">
              Estoque atual:{" "}
              <strong>
                {insumo.quantidadeAtual} {insumo.unidadeMedida}
              </strong>
            </span>
            <span className="text-emerald-700/80 dark:text-emerald-400/80 block mt-1 text-xs">
              Ao registrar esta entrada, o Custo Médio do Insumo será recalculado automaticamente pela média ponderada.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <CampoTexto
            type="number"
            rotulo="Quantidade"
            icone={Package}
            min={1}
            placeholder="Qtd NF"
            {...register("quantidade", { required: "Obrigatório" })}
            erro={(errors.quantidade as any)?.message}
          />

          <CampoMonetario
            rotulo="Valor Total"
            icone={DollarSign}
            placeholder="0,00"
            {...register("custoCompraTotal", { required: "Obrigatório" })}
            erro={(errors.custoCompraTotal as any)?.message}
          />
        </div>

        {custoUnitarioSimulado > 0 && (
          <div className="flex items-center gap-2 text-xs text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-500/10 p-2.5 rounded-lg border border-sky-100 dark:border-sky-500/20 animate-in fade-in slide-in-from-top-1">
            <Info size={14} />
            Nesta aquisição, cada unidade sairá por{" "}
            {custoUnitarioSimulado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.
          </div>
        )}

        <CampoTexto
          rotulo="Observação (Opcional)"
          icone={FileText}
          placeholder="Ex: Fornecedor, NF..."
          {...register("observacao")}
        />

        {/* RODAPÉ PADRONIZADO v9.0 */}
        <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0e0e11]/50 backdrop-blur-md flex flex-col items-end gap-3 rounded-b-2xl min-h-[80px] justify-center">
          {!confirmarDescarte ? (
            <div className="flex items-center gap-3 w-full justify-between md:justify-end">
              <button
                type="button"
                onClick={lidarComTentativaFechamento}
                className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ backgroundColor: "var(--cor-primaria)" }}
                className="px-6 py-2.5 flex-1 md:flex-none justify-center hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <ArrowUpCircle size={18} strokeWidth={2.5} />
                Confirmar Entrada
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-2 w-full animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="flex items-center gap-3 w-full justify-between md:justify-end">
                <button
                  type="button"
                  onClick={fecharModalRealmente}
                  className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                >
                  Descartar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmarDescarte(false)}
                  className="px-8 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg"
                >
                  Continuar Editando
                </button>
              </div>
              {isDirty && (
                <span className="text-[9px] font-black text-red-600/70 dark:text-red-500/50 uppercase tracking-[0.2em] mr-2">
                  Há alterações não salvas que serão perdidas
                </span>
              )}
            </div>
          )}
        </div>
      </form>
    </Dialogo>
  );
}
