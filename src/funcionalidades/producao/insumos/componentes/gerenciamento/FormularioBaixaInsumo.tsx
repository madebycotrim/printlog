import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { CampoTexto } from "@/compartilhado/componentes";
import { Combobox } from "@/compartilhado/componentes";
import { MotivoBaixaInsumo, Insumo } from "@/funcionalidades/producao/insumos/tipos";
import { ArrowDownCircle, Package, Tag, FileText } from "lucide-react";

interface FormularioBaixaInsumoProps {
  insumo: Insumo;
  aoCancelar: () => void;
  aoConfirmar: (idInsumo: string, quantidade: number, motivo: MotivoBaixaInsumo, observacao?: string) => void;
}

const OPCOES_MOTIVO = [
  { valor: "Consumo", rotulo: "Consumo / Uso Base" },
  { valor: "Descarte", rotulo: "Descarte Validade" },
  { valor: "Avaria", rotulo: "Quebra / Avaria" },
  { valor: "Outro", rotulo: "Outro" },
];

export function FormularioBaixaInsumo({ insumo, aoCancelar, aoConfirmar }: FormularioBaixaInsumoProps) {
  const [usarFracionamento, setUsarFracionamento] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      quantidade: 1,
      motivo: "Consumo" as MotivoBaixaInsumo,
      observacao: "",
    },
  });

  const onSubmit = (data: any) => {
    let qtdNumerica = Number(data.quantidade);
    if (usarFracionamento && insumo?.rendimentoTotal) {
      qtdNumerica = qtdNumerica / insumo.rendimentoTotal;
    }

    if (qtdNumerica > 0) {
      aoConfirmar(insumo.id, qtdNumerica, data.motivo, data.observacao);
      reset();
      setUsarFracionamento(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl p-4 flex gap-4 text-sm items-start">
        <ArrowDownCircle className="text-rose-500 flex-shrink-0" size={24} />
        <div className="flex-1">
          <strong className="text-rose-800 dark:text-rose-400 block mb-1">{insumo.nome}</strong>
          <span className="text-rose-700/80 dark:text-rose-400/80 block">
            Estoque atual:{" "}
            <strong>
              {insumo.quantidadeAtual} {insumo.unidadeMedida}
            </strong>
          </span>
          <span className="text-rose-700/80 dark:text-rose-400/80 block mt-1 text-xs">
            A quantidade preenchida abaixo será deduzida deste insumo.
            {insumo.itemFracionavel && insumo.rendimentoTotal && (
              <span className="block mt-2 font-bold bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                Rendimento Total: {insumo.rendimentoTotal * insumo.quantidadeAtual} {insumo.unidadeConsumo} no estoque
              </span>
            )}
          </span>
        </div>
      </div>

      {insumo.itemFracionavel && insumo.rendimentoTotal && (
        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-white/[0.02] p-4 rounded-xl border border-borda-sutil">
          <button
            type="button"
            role="switch"
            aria-checked={usarFracionamento}
            onClick={() => setUsarFracionamento(!usarFracionamento)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 ${usarFracionamento ? "bg-rose-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${usarFracionamento ? "translate-x-6" : "translate-x-1"}`} />
          </button>
          <span className="text-sm font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">
            Dar baixa em {insumo.unidadeConsumo}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">
        <CampoTexto
          type="number"
          rotulo={`Quantidade (${usarFracionamento ? insumo.unidadeConsumo : insumo.unidadeMedida})`}
          icone={Package}
          max={usarFracionamento && insumo.rendimentoTotal ? insumo.quantidadeAtual * insumo.rendimentoTotal : insumo.quantidadeAtual}
          min={0.0001}
          step="any"
          {...register("quantidade", { required: "Obrigatório" })}
          erro={(errors.quantidade as any)?.message}
        />

        <Controller
          name="motivo"
          control={control}
          render={({ field }) => (
            <Combobox
              titulo="Motivo da Saída"
              icone={Tag}
              opcoes={OPCOES_MOTIVO}
              valor={field.value}
              aoAlterar={field.onChange}
              permitirNovo={false}
            />
          )}
        />
      </div>

      <CampoTexto
        rotulo="Observação (Opcional)"
        icone={FileText}
        placeholder="Ex: Troca do filme FEP furado..."
        {...register("observacao")}
      />

      <div className="flex items-center gap-3 w-full justify-between md:justify-end pt-4">
        <button
          type="button"
          onClick={aoCancelar}
          className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 flex-1 md:flex-none justify-center bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <ArrowDownCircle size={18} strokeWidth={2.5} />
          Confirmar Baixa
        </button>
      </div>
    </form>
  );
}
