import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Tag, FileText, Calendar, User, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { CampoTexto } from "@/compartilhado/componentes";
import { CampoMonetario } from "@/compartilhado/componentes";
import { AcoesDescarte } from "@/compartilhado/componentes";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { TipoLancamentoFinanceiro } from "@/compartilhado/tipos/modelos";
import { CriarLancamentoInput, LancamentoFinanceiro } from "../tipos";
import { usarGerenciadorClientes } from "@/funcionalidades/comercial/clientes/hooks/usarGerenciadorClientes";
import { Combobox } from "@/compartilhado/componentes";
import { Dialogo } from "@/compartilhado/componentes";
import { toast } from "react-hot-toast";

const esquemaLancamento = z.object({
  tipo: z.nativeEnum(TipoLancamentoFinanceiro),
  valor: z.number().positive("O valor deve ser maior que zero"),
  descricao: z.string().min(3, "Descrição muito curta"),
  categoria: z.string().min(1, "Selecione uma categoria"),
  idCliente: z.string().optional(),
  data: z.any(), // Flexível para lidar com Date ou String ISO
});

type LancamentoFormData = z.infer<typeof esquemaLancamento>;

interface FormularioLancamentoProps {
  aberto: boolean;
  lancamentoEditando?: LancamentoFinanceiro | null;
  aoSalvar: (dados: CriarLancamentoInput) => Promise<unknown>;
  aoCancelar: () => void;
}

export function FormularioLancamento({ aberto, lancamentoEditando, aoSalvar, aoCancelar }: FormularioLancamentoProps) {
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
      data: new Date().toLocaleDateString("en-CA"),
    },
  });

  const tipoSelecionado = watch("tipo");
  const clienteSelecionado = watch("idCliente");

  useEffect(() => {
    if (aberto) {
      if (lancamentoEditando) {
        // Modo Edição: Preenche com dados existentes
        reset({
          tipo: lancamentoEditando.tipo,
          descricao: lancamentoEditando.descricao,
          valor: lancamentoEditando.valorCentavos / 100,
          categoria: lancamentoEditando.categoria || "",
          idCliente: lancamentoEditando.idCliente || "",
          data: new Date(lancamentoEditando.dataCriacao).toLocaleDateString("en-CA"),
        });
      } else {
        // Modo Criação: Reseta para o padrão
        reset({
          tipo: TipoLancamentoFinanceiro.ENTRADA,
          descricao: "",
          valor: 0,
          categoria: "",
          idCliente: "",
          data: new Date().toLocaleDateString("en-CA"),
        });
      }
      setConfirmarDescarte(false);
    }
  }, [aberto, lancamentoEditando, reset]);

  const aoSubmeter = async (dados: LancamentoFormData) => {
    try {
      await aoSalvar({
        tipo: dados.tipo,
        descricao: dados.descricao,
        valorCentavos: Math.round(dados.valor * 100),
        categoria: dados.categoria,
        idCliente: dados.idCliente,
        data: new Date(dados.data),
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
    if (isDirty) {
      setConfirmarDescarte(true);
    } else {
      aoCancelar();
    }
  };

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={lidarComTentativaFechamento}
      titulo={
        lancamentoEditando 
          ? "Ajustar Transação" 
          : tipoSelecionado === TipoLancamentoFinanceiro.ENTRADA 
            ? "Nova Receita Maker" 
            : "Registrar Despesa"
      }
      larguraMax="max-w-2xl"
    >
      <form onSubmit={handleSubmit(aoSubmeter)} className="flex flex-col bg-card">
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
                        : "bg-transparent border-borda-sutil text-zinc-400"
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
                        : "bg-transparent border-borda-sutil text-zinc-400"
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
                  {...register("data")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-borda-sutil bg-muted/30 flex flex-col items-end gap-3">
          {!confirmarDescarte ? (
            <div className="flex items-center gap-3 w-full justify-between md:justify-end">
              <button
                type="button"
                onClick={lidarComTentativaFechamento}
                className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
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
                {lancamentoEditando 
                  ? "Salvar Alterações" 
                  : tipoSelecionado === TipoLancamentoFinanceiro.ENTRADA 
                    ? "Confirmar Entrada" 
                    : "Confirmar Saída"}
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
