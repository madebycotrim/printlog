import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { Combobox } from "@/compartilhado/componentes/Combobox";
import { MotivoBaixaInsumo, Insumo } from "@/funcionalidades/producao/insumos/tipos";
import { ArrowDownCircle, Package, Tag, FileText } from "lucide-react";

interface ModalBaixaInsumoProps {
  aberto: boolean;
  insumo: Insumo | null;
  aoFechar: () => void;
  aoConfirmar: (idInsumo: string, quantidade: number, motivo: MotivoBaixaInsumo, observacao?: string) => void;
}

const OPCOES_MOTIVO = [
  { valor: "Consumo", rotulo: "Consumo / Uso Base" },
  { valor: "Descarte", rotulo: "Descarte Validade" },
  { valor: "Avaria", rotulo: "Quebra / Avaria" },
  { valor: "Outro", rotulo: "Outro" },
];

export function ModalBaixaInsumo({ aberto, insumo, aoFechar, aoConfirmar }: ModalBaixaInsumoProps) {
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      quantidade: 1,
      motivo: "Consumo" as MotivoBaixaInsumo,
      observacao: "",
    },
  });

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
    if (qtdNumerica > 0) {
      aoConfirmar(insumo.id, qtdNumerica, data.motivo, data.observacao);
      reset();
      fecharModalRealmente();
    }
  };

  return (
    <Dialogo aberto={aberto} aoFechar={lidarComTentativaFechamento} titulo="Dar Baixa em Estoque" larguraMax="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 bg-white dark:bg-[#18181b]">
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
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <CampoTexto
            type="number"
            rotulo="Quantidade"
            icone={Package}
            max={insumo.quantidadeAtual}
            min={1}
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
                className="px-6 py-2.5 flex-1 md:flex-none justify-center bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <ArrowDownCircle size={18} strokeWidth={2.5} />
                Confirmar Baixa
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
