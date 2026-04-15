import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Tag, FileText, Calendar, User, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoMonetario } from "@/compartilhado/componentes/CampoMonetario";
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

/**
 * Propriedades para o componente FormularioLancamento.
 */
interface FormularioLancamentoProps {
  /** Indica se o modal está visível */
  aberto: boolean;
  /** Função de callback para salvar o lançamento (recebe centavos) */
  aoSalvar: (dados: CriarLancamentoInput) => Promise<unknown>;
  /** Função de callback para cancelar/fechar o modal */
  aoCancelar: () => void;
}

/**
 * Formulário modal para registro de novas transações financeiras (Entradas/Saídas).
 * Segue a Regra v9.0 de validação rigorosa de valores positivos.
 */
export function FormularioLancamento({ aberto, aoSalvar, aoCancelar }: FormularioLancamentoProps) {
  const { estado: estadoClientes, acoes: acoesClientes } = usarGerenciadorClientes();
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
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
      reset();
      setConfirmarDescarte(false);
    }
  }, [aberto, reset]);

  /**
   * Processa a submissão do formulário, convertendo o valor para centavos.
   * @param dados - Dados validados do formulário
   */
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

      // Mapeamento de erro canônico v9.0
      if (erro instanceof Error && erro.message.includes("maior que zero")) {
        toast.error("Erro Financeiro: O valor deve ser maior que zero (FIN_001)");
      } else {
        toast.error("Falha ao registrar lançamento.");
      }
    }
  };

  /**
   * Atalho para criar um cliente rapidamente a partir do financeiro.
   * @param nome - Nome do novo cliente
   * @returns O ID do cliente criado
   */
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

  /**
   * Fecha o modal limpando estados de confirmação.
   */
  const fecharModalRealmente = () => {
    setConfirmarDescarte(false);
    aoCancelar();
  };

  /**
   * Intercepta a tentativa de fechamento para alertar sobre dados não salvos.
   */
  const lidarComTentativaFechamento = () => {
    if (isDirty && !confirmarDescarte) {
      setConfirmarDescarte(true);
    } else {
      fecharModalRealmente();
    }
  };

  return (
    <Dialogo aberto={aberto} aoFechar={lidarComTentativaFechamento} titulo="Nova Transação" larguraMax="max-w-xl">
      <form onSubmit={handleSubmit(aoSubmeter)} className="flex flex-col h-full bg-transparent">
        {/* ÁREA DE CONTEÚDO SCROLLÁVEL */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 min-h-[400px]">
          {/* SEÇÃO 1: CLASSIFICAÇÃO & VALOR */}
          <div className="space-y-5">
            <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2 text-gray-900 dark:text-white">
              CLASSIFICAÇÃO & VALOR
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5 ml-1">
                  Tipo de Fluxo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setValue("tipo", TipoLancamentoFinanceiro.ENTRADA, { shouldDirty: true })}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all duration-300 ${
                      tipoSelecionado === TipoLancamentoFinanceiro.ENTRADA
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "bg-transparent border-gray-100 dark:border-white/5 text-zinc-400 hover:text-zinc-500"
                    }`}
                  >
                    <ArrowUpRight
                      size={14}
                      strokeWidth={2.5}
                      className={
                        tipoSelecionado === TipoLancamentoFinanceiro.ENTRADA ? "text-emerald-500" : "text-zinc-400"
                      }
                    />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Entrada</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue("tipo", TipoLancamentoFinanceiro.SAIDA, { shouldDirty: true })}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all duration-300 ${
                      tipoSelecionado === TipoLancamentoFinanceiro.SAIDA
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-sm"
                        : "bg-transparent border-gray-100 dark:border-white/5 text-zinc-400 hover:text-zinc-500"
                    }`}
                  >
                    <ArrowDownLeft
                      size={14}
                      strokeWidth={2.5}
                      className={tipoSelecionado === TipoLancamentoFinanceiro.SAIDA ? "text-rose-500" : "text-zinc-400"}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Saída</span>
                  </button>
                </div>
              </div>

              <CampoMonetario
                rotulo="Valor da Transação"
                erro={errors.valor?.message}
                placeholder="0,00"
                icone={tipoSelecionado === TipoLancamentoFinanceiro.ENTRADA ? ArrowUpRight : ArrowDownLeft}
                {...register("valor", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* SEÇÃO 2: DETALHES DA TRANSAÇÃO */}
          <div className="space-y-5">
            <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2 text-gray-900 dark:text-white">
              DETALHES DA TRANSAÇÃO
            </h4>

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5 ml-1 leading-none">
                  Vincular Cliente
                </label>
                <Combobox
                  opcoes={estadoClientes.clientes.map((c) => ({ valor: c.id, rotulo: c.nome }))}
                  valor={clienteSelecionado || ""}
                  aoAlterar={(val) => setValue("idCliente", val, { shouldDirty: true })}
                  aoCriarNovo={lidarComCriarCliente}
                  placeholder="Nenhum vínculo..."
                  icone={User}
                />
              </div>

              <CampoTexto
                rotulo="Descrição do Lançamento"
                icone={FileText}
                placeholder="Ex: Venda de Arte 3D"
                erro={errors.descricao?.message}
                {...register("descricao")}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <CampoTexto
                  rotulo="Categoria"
                  icone={Tag}
                  placeholder="Ex: Vendas"
                  erro={errors.categoria?.message}
                  {...register("categoria")}
                />

                <CampoTexto
                  rotulo="Data do Lançamento"
                  icone={Calendar}
                  type="date"
                  erro={errors.data?.message}
                  {...register("data", { valueAsDate: true })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ PADRONIZADO v9.0 */}
        <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0e0e11]/50 backdrop-blur-md flex flex-col items-end gap-3 rounded-b-2xl min-h-[80px] justify-center">
          {!confirmarDescarte ? (
            <div className="flex items-center gap-3 w-full justify-between md:justify-end">
              <button
                type="button"
                onClick={lidarComTentativaFechamento}
                className="px-6 py-2.5 flex-1 md:flex-none text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-8 py-2.5 flex-1 md:flex-none justify-center hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 ${
                  tipoSelecionado === TipoLancamentoFinanceiro.ENTRADA
                    ? "bg-emerald-600 shadow-emerald-600/20"
                    : "bg-rose-600 shadow-rose-600/20"
                }`}
              >
                <Save size={16} strokeWidth={3} />
                {tipoSelecionado === TipoLancamentoFinanceiro.ENTRADA ? "Receber Valor" : "Pagar Valor"}
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
