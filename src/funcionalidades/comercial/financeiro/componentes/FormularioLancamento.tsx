import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Tag, FileText, Calendar, User, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoMonetario } from "@/compartilhado/componentes/CampoMonetario";
import { AcoesDescarte } from "@/compartilhado/componentes/AcoesDescarte";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { TipoLancamentoFinanceiro } from "@/compartilhado/tipos/modelos";
import { CriarLancamentoInput } from "../tipos";
import { usarGerenciadorClientes } from "@/funcionalidades/comercial/clientes/hooks/usarGerenciadorClientes";
import { Combobox } from "@/compartilhado/componentes/Combobox";
import { toast } from "react-hot-toast";

const esquemaLancamento = z.object({
  tipo: z.nativeEnum(TipoLancamentoFinanceiro),
  valor: z.number().positive("O valor deve ser maior que zero"),
  descricao: z.string().min(3, "Descrição muito curta"),
  categoria: z.string().min(1, "Selecione uma categoria"),
  idCliente: z.string().optional(),
  data: z.date(),
});

type LancamentoFormData = z.infer<typeof esquemaLancamento>;

interface FormularioLancamentoProps {
  aberto: boolean;
  aoSalvar: (dados: CriarLancamentoInput) => Promise<unknown>;
  aoCancelar: () => void;
}

export function FormularioLancamento({ aberto, aoSalvar, aoCancelar }: FormularioLancamentoProps) {
  const { estado: estadoClientes, acoes: acoesClientes } = usarGerenciadorClientes();
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<LancamentoFormData>({
    resolver: zodResolver(esquemaLancamento),
    mode: "onChange",
    defaultValues: {
      tipo: TipoLancamentoFinanceiro.ENTRADA,
      descricao: "",
      valor: 0,
      categoria: "",
      idCliente: "",
      data: new Date(),
    },
  });

  const tipoSelecionado = watch("tipo");
  const clienteSelecionado = watch("idCliente");

  useEffect(() => {
    if (aberto) {
      reset({
        tipo: TipoLancamentoFinanceiro.ENTRADA,
        descricao: "",
        valor: 0,
        categoria: "",
        idCliente: "",
        data: new Date().toLocaleDateString("en-CA") as any,
      });
      setConfirmarDescarte(false);
    }
  }, [aberto, reset]);

  const aoSubmeter = async (dados: LancamentoFormData) => {
    try {
      await aoSalvar({
        tipo: dados.tipo,
        descricao: dados.descricao,
        valorCentavos: Math.round(dados.valor * 100),
        categoria: dados.categoria,
        idCliente: dados.idCliente,
        data: dados.data,
      });
      aoCancelar();
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "Financeiro" }, "Erro ao salvar lançamento", erro);
      toast.error("Falha ao registrar lançamento.");
    }
  };

  const lidarComCriarCliente = async (nome: string) => {
    try {
      const novoCliente = await acoesClientes.salvarCliente({
        nome,
        email: "",
        telefone: "",
      });
      setValue("idCliente", novoCliente.id, { shouldDirty: true });
      return novoCliente.id;
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "FormularioLancamento" }, "Erro ao criar cliente rápido", erro);
    }
  };

  const lidarComTentativaFechamento = () => {
    const valores = control._formValues;
    const temConteudo = valores.descricao || (valores.valor > 0) || valores.categoria || valores.idCliente;

    if (isDirty && temConteudo) {
      setConfirmarDescarte(true);
    } else {
      aoCancelar();
    }
  };

  return (
    <Dialogo aberto={aberto} aoFechar={lidarComTentativaFechamento} titulo="Registro Financeiro" larguraMax="max-w-xl">
      <form onSubmit={handleSubmit(aoSubmeter)} className="flex flex-col bg-white dark:bg-[#18181b]">
        <div className="p-6 md:p-8 space-y-10">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Dados da Movimentação
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                  Tipo de Fluxo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setValue("tipo", TipoLancamentoFinanceiro.ENTRADA, { shouldDirty: true })}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all ${
                      tipoSelecionado === TipoLancamentoFinanceiro.ENTRADA
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                        : "bg-transparent border-zinc-100 dark:border-white/5 text-zinc-400"
                    }`}
                  >
                    <ArrowUpRight size={16} strokeWidth={3} />
                    <span className="text-[11px] font-black uppercase">Entrada</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue("tipo", TipoLancamentoFinanceiro.SAIDA, { shouldDirty: true })}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all ${
                      tipoSelecionado === TipoLancamentoFinanceiro.SAIDA
                        ? "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400"
                        : "bg-transparent border-zinc-100 dark:border-white/5 text-zinc-400"
                    }`}
                  >
                    <ArrowDownLeft size={16} strokeWidth={3} />
                    <span className="text-[11px] font-black uppercase">Saída</span>
                  </button>
                </div>
              </div>

              <CampoMonetario
                rotulo="Valor Real"
                erro={errors.valor?.message}
                placeholder="0,00"
                icone={tipoSelecionado === TipoLancamentoFinanceiro.ENTRADA ? ArrowUpRight : ArrowDownLeft}
                {...register("valor", { setValueAs: (v: string) => parseFloat(String(v).replace(",", ".")) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Categorização & Vínculo
            </h4>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                  Vincular Cliente (Opcional)
                </label>
                <Combobox
                  opcoes={estadoClientes.clientes.map((c) => ({ valor: c.id, rotulo: c.nome }))}
                  valor={clienteSelecionado || ""}
                  aoAlterar={(val) => setValue("idCliente", val, { shouldDirty: true })}
                  aoCriarNovo={lidarComCriarCliente}
                  placeholder="Pesquisar parceiro..."
                  icone={User}
                />
              </div>

              <CampoTexto
                rotulo="O que foi?"
                icone={FileText}
                placeholder="Ex: Venda de Action Figure, Compra de Bico 0.4..."
                erro={errors.descricao?.message}
                {...register("descricao")}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CampoTexto
                  rotulo="Categoria"
                  icone={Tag}
                  placeholder="Vendas, Peças, Fixos..."
                  erro={errors.categoria?.message}
                  {...register("categoria")}
                />

                <CampoTexto
                  rotulo="Data"
                  icone={Calendar}
                  type="date"
                  erro={errors.data?.message}
                  {...register("data", { valueAsDate: true })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-[#0e0e11]/50 flex flex-col items-end gap-3 rounded-b-[2rem]">
          {!confirmarDescarte ? (
            <div className="flex items-center gap-3 w-full justify-between md:justify-end">
              <button
                type="button"
                onClick={lidarComTentativaFechamento}
                className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-8 py-3 flex-1 md:flex-none justify-center text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2 ${
                  tipoSelecionado === TipoLancamentoFinanceiro.ENTRADA
                    ? "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-500"
                    : "bg-rose-600 shadow-rose-600/20 hover:bg-rose-500"
                }`}
              >
                <Save size={16} strokeWidth={3} />
                {tipoSelecionado === TipoLancamentoFinanceiro.ENTRADA ? "Confirmar Entrada" : "Confirmar Saída"}
              </button>
            </div>
          ) : (
            <AcoesDescarte
              aoConfirmarDescarte={aoCancelar}
              aoContinuarEditando={() => setConfirmarDescarte(false)}
            />
          )}
        </div>
      </form>
    </Dialogo>
  );
}
