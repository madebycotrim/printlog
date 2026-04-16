import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, User, FileText, Calendar, Scale, Timer } from "lucide-react";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Combobox } from "@/compartilhado/componentes/Combobox";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoMonetario } from "@/compartilhado/componentes/CampoMonetario";
import { CampoAreaTexto } from "@/compartilhado/componentes/CampoAreaTexto";
import { CriarPedidoInput, Pedido } from "../tipos";
import { usarGerenciadorClientes } from "@/funcionalidades/comercial/clientes/hooks/usarGerenciadorClientes";
import { SecaoFormulario, GradeCampos } from "@/compartilhado/componentes/FormularioLayout";
import { usarAnalisadorGCode } from "@/compartilhado/hooks/usarAnalisadorGCode";
import { Upload, Loader2, Sparkles } from "lucide-react";
import { SeletorInsumosSecundarios } from "./SeletorInsumosSecundarios";

const esquemaPedido = z.object({
  idCliente: z.string().min(1, "Selecione um cliente"),
  descricao: z.string().min(3, "A descrição deve ter pelo menos 3 caracteres"),
  valorCentavos: z.number().positive("O valor deve ser maior que zero"), // Regra v9.0: FIN_001
  prazoEntrega: z.string().optional(),
  material: z.string().optional(),
  pesoGramas: z.number().min(0).optional(),
  tempoMinutos: z.number().int().min(0).optional(),
  observacoes: z.string().optional(),
  insumosSecundarios: z
    .array(
      z.object({
        idInsumo: z.string(),
        nome: z.string(),
        quantidade: z.number().min(0),
        custoUnitarioCentavos: z.number().int().min(0),
      }),
    )
    .optional(),
});

type PedidoFormData = z.infer<typeof esquemaPedido>;

/**
 * Propriedades para o formulário de pedido.
 *
 * @lgpd Base legal: Execução de contrato (Art. 7º, V)
 * @lgpd Finalidade: Registro de pedido vinculado ao cliente e faturamento.
 */
interface PropriedadesFormularioPedido {
  aberto: boolean;
  aoSalvar: (dados: CriarPedidoInput) => Promise<any> | void;
  aoCancelar: () => void;
  pedidoEdicao?: Pedido | null;
}

export function FormularioPedido({ aberto, aoSalvar, aoCancelar, pedidoEdicao }: PropriedadesFormularioPedido) {
  const { estado, acoes } = usarGerenciadorClientes();
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);
  const { analisando, resultado, analisarArquivo, limparAnalise, erro: erroAnalise } = usarAnalisadorGCode();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<PedidoFormData>({
    resolver: zodResolver(esquemaPedido) as any,
    mode: "onChange",
    defaultValues: {
      idCliente: "",
      descricao: "",
      valorCentavos: 0,
      prazoEntrega: "",
      material: "",
      pesoGramas: 0,
      tempoMinutos: 0,
      observacoes: "",
    },
  });

  const clienteSelecionado = watch("idCliente");
  const insumosSecundarios = watch("insumosSecundarios") || [];

  useEffect(() => {
    if (aberto) {
      if (pedidoEdicao) {
        reset({
          idCliente: pedidoEdicao.idCliente,
          descricao: pedidoEdicao.descricao,
          valorCentavos: pedidoEdicao.valorCentavos / 100,
          prazoEntrega: pedidoEdicao.prazoEntrega
            ? new Date(pedidoEdicao.prazoEntrega).toISOString().split("T")[0]
            : "",
          material: pedidoEdicao.material || "",
          pesoGramas: pedidoEdicao.pesoGramas || 0,
          tempoMinutos: pedidoEdicao.tempoMinutos || 0,
          observacoes: pedidoEdicao.observacoes || "",
          insumosSecundarios: pedidoEdicao.insumosSecundarios || [],
        });
      } else {
        reset({
          idCliente: "",
          descricao: "",
          valorCentavos: 0,
          prazoEntrega: "",
          material: "",
          pesoGramas: 0,
          tempoMinutos: 0,
          observacoes: "",
          insumosSecundarios: [],
        });
      }
      setConfirmarDescarte(false);
      limparAnalise();
    }
  }, [aberto, reset, pedidoEdicao, limparAnalise]);

  useEffect(() => {
    if (resultado) {
      if (resultado.pesoEstimadoGramas > 0) {
        setValue("pesoGramas", resultado.pesoEstimadoGramas, { shouldDirty: true });
      }
      if (resultado.tempoEstimadoMinutos > 0) {
        setValue("tempoMinutos", resultado.tempoEstimadoMinutos, { shouldDirty: true });
      }
      if (resultado.fatiadorDetectado !== "Desconhecido") {
        const obsAtual = watch("observacoes") || "";
        setValue("observacoes", `${obsAtual}\n[Auto] Fatiador: ${resultado.fatiadorDetectado}`.trim(), {
          shouldDirty: true,
        });
      }
    }
  }, [resultado, setValue, watch]);

  const fecharModalRealmente = () => {
    setConfirmarDescarte(false);
    aoCancelar();
  };

  const lidarComTentativaFechamento = () => {
    if (isDirty && !confirmarDescarte) {
      setConfirmarDescarte(true);
    } else {
      fecharModalRealmente();
    }
  };

  const opcoesClientes = estado.clientes.map((c) => ({
    valor: c.id,
    rotulo: c.nome,
  }));

  const aoSubmeter = async (dados: PedidoFormData) => {
    try {
      await aoSalvar({
        idCliente: dados.idCliente,
        descricao: dados.descricao,
        valorCentavos: Math.round(dados.valorCentavos * 100),
        prazoEntrega: dados.prazoEntrega ? new Date(dados.prazoEntrega) : undefined,
        material: dados.material,
        pesoGramas: dados.pesoGramas,
        tempoMinutos: dados.tempoMinutos,
        observacoes: dados.observacoes,
        insumosSecundarios: dados.insumosSecundarios,
      });
      aoCancelar();
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "FormularioPedido" }, "Erro ao salvar pedido", erro);
    }
  };

  const lidarComCriarCliente = async (nome: string) => {
    try {
      const novoCliente = await acoes.salvarCliente({
        nome,
        email: "",
        telefone: "",
      });
      setValue("idCliente", novoCliente.id, { shouldDirty: true, shouldValidate: true });
      return novoCliente.id;
    } catch (erro) {
      registrar.error(
        { rastreioId: "sistema", servico: "FormularioPedido" },
        "Erro ao criar cliente rápido no pedido",
        erro,
      );
    }
  };

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={lidarComTentativaFechamento}
      titulo={pedidoEdicao ? "Editar Pedido" : "Novo Pedido de Impressão"}
      larguraMax="max-w-2xl"
    >
      <form onSubmit={handleSubmit(aoSubmeter as any)} className="flex flex-col bg-white dark:bg-[#18181b]">
        <div className="p-6 md:p-8 space-y-8">
          {/* SEÇÃO 1: CLIENTE */}
          <SecaoFormulario titulo="Dados do Cliente">
            <Combobox
              titulo="Cliente / Titular do Pedido"
              opcoes={opcoesClientes}
              valor={clienteSelecionado}
              aoAlterar={(val) => setValue("idCliente", val, { shouldDirty: true, shouldValidate: true })}
              aoCriarNovo={lidarComCriarCliente}
              placeholder="Selecionar cliente..."
              icone={User}
              erro={errors.idCliente?.message}
            />
          </SecaoFormulario>

          {/* SEÇÃO OPCIONAL: ANÁLISE AUTOMÁTICA */}
          <SecaoFormulario titulo="Automação Maker (Opcional)">
            <div
              className={`relative p-8 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center ${
                analisando
                  ? "border-[var(--cor-primaria)] bg-[var(--cor-primaria)]/5"
                  : resultado
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-gray-100 dark:border-white/5 hover:border-[var(--cor-primaria)]/30 hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
              }`}
            >
              {analisando ? (
                <>
                  <div className="relative">
                    <Loader2 size={32} className="text-[var(--cor-primaria)] animate-spin" />
                    <div className="absolute inset-0 bg-[var(--cor-primaria)] blur-xl opacity-20 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">
                      Analisando Coordenadas...
                    </h5>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Extraindo metadados em thread paralela
                    </p>
                  </div>
                </>
              ) : resultado ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      Análise Concluída!
                    </h5>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                      {resultado.fatiadorDetectado} • {resultado.quantidadeLinhas.toLocaleString()} linhas processadas
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={limparAnalise}
                    className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    Limpar Arquivo
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-300 dark:text-zinc-700 group-hover:text-[var(--cor-primaria)] transition-all">
                    <Upload size={24} strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">
                      Importar G-Code para Auto-Preenchimento
                    </h5>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed px-10">
                      Arraste seu arquivo .gcode aqui para extrair peso e tempo automaticamente.
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".gcode"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const arquivo = e.target.files?.[0];
                      if (arquivo) analisarArquivo(arquivo);
                    }}
                  />
                </>
              )}

              {erroAnalise && (
                <span className="absolute bottom-4 text-[8px] font-black text-rose-500 uppercase tracking-widest">
                  {erroAnalise}
                </span>
              )}
            </div>
          </SecaoFormulario>

          {/* SEÇÃO 2: DETALHES DO PROJETO */}
          <SecaoFormulario titulo="Detalhes da Impressão">
            <GradeCampos colunas={2}>
              <div className="col-span-1 md:col-span-2">
                <CampoTexto
                  rotulo="O que será impresso? (Descrição)"
                  icone={FileText}
                  placeholder="Ex: Action Figure Batman 20cm"
                  erro={errors.descricao?.message}
                  {...register("descricao")}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <GradeCampos colunas={3} className="gap-5">
                  <CampoTexto
                    rotulo="Material / Cor"
                    placeholder="Ex: PLA Preto"
                    erro={errors.material?.message}
                    {...register("material")}
                  />

                  <CampoTexto
                    rotulo="Quantidade (g)"
                    icone={Scale}
                    type="number"
                    placeholder="0"
                    erro={errors.pesoGramas?.message}
                    {...register("pesoGramas", { valueAsNumber: true })}
                  />

                  <CampoTexto
                    rotulo="Tempo (min)"
                    icone={Timer}
                    type="number"
                    placeholder="0"
                    erro={errors.tempoMinutos?.message}
                    {...register("tempoMinutos", { valueAsNumber: true })}
                  />
                </GradeCampos>
              </div>

              <CampoTexto
                rotulo="Prazo de Entrega"
                icone={Calendar}
                type="date"
                erro={errors.prazoEntrega?.message}
                {...register("prazoEntrega")}
              />

              <CampoMonetario
                rotulo="Valor do Pedido"
                placeholder="0,00"
                erro={errors.valorCentavos?.message}
                {...register("valorCentavos", { valueAsNumber: true })}
              />

              <div className="col-span-1 md:col-span-2">
                <CampoAreaTexto
                  rotulo="Observações Internas"
                  rows={3}
                  placeholder="Detalhes técnicos, bico, preenchimento..."
                  erro={errors.observacoes?.message}
                  {...register("observacoes")}
                />
              </div>
            </GradeCampos>
          </SecaoFormulario>

          {/* SEÇÃO 3: COMPOSIÇÃO DE CUSTOS (v9.0) */}
          <SecaoFormulario titulo="Insumos e Acessórios">
            <SeletorInsumosSecundarios
              selecionados={insumosSecundarios}
              aoAlterar={(novos) => setValue("insumosSecundarios", novos, { shouldDirty: true })}
            />
          </SecaoFormulario>
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
                style={{ backgroundColor: "var(--cor-primaria)" }}
                className="px-8 py-2.5 flex-1 md:flex-none justify-center hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Save size={16} strokeWidth={3} />
                {pedidoEdicao ? "Salvar Alterações" : "Confirmar Pedido"}
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
