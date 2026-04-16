import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Combobox } from "@/compartilhado/componentes/Combobox";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoMonetario } from "@/compartilhado/componentes/CampoMonetario";
import {
  Save,
  Box,
  AlertCircle,
  Link as LinkIcon,
  Layers,
  Package,
  Link2,
  Zap,
  Hammer,
  FlaskConical,
  Ruler,
  Tag,
} from "lucide-react";
import { Insumo } from "@/funcionalidades/producao/insumos/tipos";
import { registrar } from "@/compartilhado/utilitarios/registrador";

interface PropriedadesFormularioInsumo {
  aberto: boolean;
  insumoEditando: Insumo | null;
  aoCancelar: () => void;
  /**
   * @param dados Dados do insumo para salvar.
   * @returns Promise (Justificativa: tipagem flexível para persistência mock)
   */
  aoSalvar: (dados: Partial<Insumo>) => Promise<any> | void;
}

const CATEGORIAS = [
  { id: "Geral", rotulo: "GERAL", icone: Layers },
  { id: "Embalagem", rotulo: "EMBALAGEM", icone: Package },
  { id: "Fixação", rotulo: "FIXAÇÃO", icone: Link2 },
  { id: "Eletrônica", rotulo: "ELETRÔNICA", icone: Zap },
  { id: "Acabamento", rotulo: "ACABAMENTO", icone: Hammer },
  { id: "Limpeza", rotulo: "LIMPEZA/QUÍMICA", icone: FlaskConical },
  { id: "Outros", rotulo: "OUTROS", icone: Box },
];

const UNIDADES = [
  { valor: "un", rotulo: "UN" },
  { valor: "ml", rotulo: "ML" },
  { valor: "L", rotulo: "L" },
  { valor: "g", rotulo: "G" },
  { valor: "kg", rotulo: "KG" },
  { valor: "Rolo", rotulo: "ROLO" },
  { valor: "Caixa", rotulo: "CX" },
  { valor: "Par", rotulo: "PAR" },
];

const UNIDADES_CONSUMO = [
  { valor: "m", rotulo: "Metro (m)" },
  { valor: "cm", rotulo: "Centímetro (cm)" },
  { valor: "ml", rotulo: "Mililitro (ml)" },
  { valor: "g", rotulo: "Grama (g)" },
  { valor: "folha", rotulo: "Folha" },
  { valor: "pedaço", rotulo: "Pedaço" },
  { valor: "dose", rotulo: "Dose" },
  { valor: "spray", rotulo: "Spray / Borrifada" },
  { valor: "gota", rotulo: "Gota" },
];

/**
 * Formulário de Cadastro/Edição de Insumos.
 * @lgpd Base legal: Execução de contrato (Art. 7º, V) - Gestão de insumos e suprimentos.
 */
export function FormularioInsumo({ aberto, insumoEditando, aoCancelar, aoSalvar }: PropriedadesFormularioInsumo) {
  const estaEditando = Boolean(insumoEditando);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<Partial<Insumo>>({
    mode: "onChange",
    defaultValues: {
      nome: "",
      marca: "",
      categoria: "Geral",
      unidadeMedida: "un",
      quantidadeAtual: 0,
      custoMedioUnidade: 0, // Inicia como undefined para placeholder
      quantidadeMinima: 5,
      linkCompra: "",
      itemFracionavel: false,
      rendimentoTotal: undefined,
      unidadeConsumo: "",
    },
  });

  const [confirmarDescarte, definirConfirmarDescarte] = useState(false);

  const categoriaAtiva = watch("categoria");
  const unidadeMedidaAtiva = watch("unidadeMedida") || "un";
  const itemFracionavelAtivo = watch("itemFracionavel");
  const custoMedioAtivo = watch("custoMedioUnidade") || 0;
  const rendimentoAtivo = watch("rendimentoTotal") || 0;
  const unidadeConsumoAtiva = watch("unidadeConsumo") || "";

  const finalFormularioRef = useRef<HTMLDivElement>(null);

  const custoEfetivo =
    itemFracionavelAtivo && rendimentoAtivo > 0
      ? (custoMedioAtivo / rendimentoAtivo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "R$ 0,00";

  useEffect(() => {
    if (itemFracionavelAtivo) {
      // Pequeno atraso para garantir que a seção apareça no DOM e a animação inicie
      setTimeout(() => {
        finalFormularioRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  }, [itemFracionavelAtivo]);

  useEffect(() => {
    if (aberto) {
      const valoresPadrao = {
        nome: "",
        marca: "",
        categoria: "Geral" as const,
        unidadeMedida: "un" as const,
        quantidadeAtual: 0,
        custoMedioUnidade: 0,
        quantidadeMinima: 5,
        linkCompra: "",
        itemFracionavel: false,
        rendimentoTotal: undefined,
        unidadeConsumo: "",
      };

      if (insumoEditando) {
        // Sanitiza para garantir que nulls virem strings vazias ou undefineds
        reset({
          ...valoresPadrao,
          ...insumoEditando,
          linkCompra: insumoEditando.linkCompra || "",
          marca: insumoEditando.marca || "",
          unidadeConsumo: insumoEditando.unidadeConsumo || "",
        });
      } else {
        reset(valoresPadrao);
      }
    }
  }, [aberto, insumoEditando, reset]);

  const fecharModalRealmente = () => {
    definirConfirmarDescarte(false);
    aoCancelar();
  };

  // Intercepta fechamento do Dialogo para X, ESC e Backdrop
  const lidarComTentativaFechamento = () => {
    if (isDirty && !confirmarDescarte) {
      definirConfirmarDescarte(true);
    } else {
      fecharModalRealmente();
    }
  };

  const lidarComEnvio = async (data: Partial<Insumo>) => {
    try {
      const payload = {
        ...data,
        quantidadeAtual: Number(data.quantidadeAtual) || 0,
        quantidadeMinima: Number(data.quantidadeMinima) || 0,
        custoMedioUnidade: Number(data.custoMedioUnidade) || 0,
        rendimentoTotal: data.itemFracionavel ? Number(data.rendimentoTotal) || 0 : undefined,
      };
      await aoSalvar(payload);
      fecharModalRealmente();
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "FormularioInsumo" }, "Erro ao salvar insumo", erro);
    }
  };

  if (!aberto) return null;

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={lidarComTentativaFechamento}
      titulo={estaEditando ? "Editar Insumo" : "Novo Insumo"}
      larguraMax="max-w-2xl"
    >
      <div className="bg-white dark:bg-[#18181b]">
        <form onSubmit={handleSubmit(lidarComEnvio)} className="flex flex-col bg-white dark:bg-[#18181b]">
          <div className="p-6 space-y-6">
            {/* SEÇÃO: INFORMAÇÕES BÁSICAS */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5 pb-2 text-gray-400 dark:text-zinc-500">
                INFORMAÇÕES BÁSICAS
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CampoTexto
                  rotulo="Nome do Insumo"
                  icone={Box}
                  placeholder="Ex: Álcool Isopropílico, Fita Blue Tape..."
                  erro={errors.nome?.message}
                  {...register("nome", { required: "Obrigatório" })}
                />

                <CampoTexto
                  rotulo="Marca / Fabricante"
                  icone={Tag}
                  placeholder="Ex: Prime, 3M, Sinteglos..."
                  erro={errors.marca?.message}
                  {...register("marca")}
                />
              </div>

              <div className="space-y-4">
                <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-1">
                  Categoria Logística
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
                  {CATEGORIAS.map((cat) => {
                    const estaSelecionado = categoriaAtiva === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (categoriaAtiva !== cat.id) {
                            setValue("categoria", cat.id as any, { shouldDirty: true });
                          }
                        }}
                        className={`h-10 px-4 rounded-xl flex items-center justify-center gap-2.5 text-[10px] font-black tracking-widest transition-all whitespace-nowrap border shrink-0
                                                        ${
                                                          estaSelecionado
                                                            ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-900 shadow-md ring-4 ring-black/5 dark:ring-white/5"
                                                            : "bg-transparent text-gray-500 dark:text-zinc-500 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:text-gray-700 dark:hover:text-zinc-300"
                                                        }`}
                      >
                        <cat.icone size={12} strokeWidth={3} />
                        {cat.rotulo}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SEÇÃO: PRECIFICAÇÃO & ESTOQUE */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5 pb-2 text-gray-400 dark:text-zinc-500">
                PRECIFICAÇÃO & ESTOQUE
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CampoMonetario
                  rotulo="Valor Unitário"
                  placeholder="0,00"
                  erro={errors.custoMedioUnidade?.message}
                  {...register("custoMedioUnidade", { required: "Obrigatório", valueAsNumber: true })}
                />

                <CampoTexto
                  rotulo="Estoque Atual"
                  icone={Package}
                  type="number"
                  step={itemFracionavelAtivo ? "0.01" : "1"}
                  placeholder="0"
                  erro={errors.quantidadeAtual?.message}
                  {...register("quantidadeAtual", { required: "Obrigatório", valueAsNumber: true })}
                />

                <Combobox
                  titulo="Unidade"
                  opcoes={UNIDADES}
                  valor={unidadeMedidaAtiva}
                  aoAlterar={(val) => {
                    if (unidadeMedidaAtiva !== val) {
                      setValue("unidadeMedida", val as any, { shouldDirty: true, shouldValidate: true });
                    }
                  }}
                  icone={Ruler}
                  placeholder="Ex: UN, KG..."
                  permitirNovo={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <CampoTexto
                  rotulo="Estoque Mínimo (Alerta)"
                  icone={AlertCircle}
                  type="number"
                  placeholder="5"
                  erro={errors.quantidadeMinima?.message}
                  {...register("quantidadeMinima", { required: "Obrigatório", valueAsNumber: true })}
                />

                <CampoTexto
                  rotulo="Link Reposição"
                  icone={LinkIcon}
                  placeholder="https://..."
                  erro={errors.linkCompra?.message}
                  {...register("linkCompra")}
                />
              </div>

              {/* ITEM FRACIONÁVEL */}
              <div className="pt-8 border-t border-gray-100 dark:border-white/5">
                <label className="flex items-center gap-4 cursor-pointer select-none w-max group px-2">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" {...register("itemFracionavel")} className="peer sr-only" />
                    <div
                      className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center
                                                ${
                                                  itemFracionavelAtivo
                                                    ? "bg-zinc-900 dark:bg-white border-transparent text-white dark:text-zinc-900 shadow-md ring-4 ring-black/5 dark:ring-white/5"
                                                    : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 group-hover:border-zinc-400"
                                                }`}
                    >
                      <svg
                        className={`w-3.5 h-3.5 transition-transform ${itemFracionavelAtivo ? "scale-100" : "scale-0"}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${itemFracionavelAtivo ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-zinc-500"}`}
                    >
                      Cálculo de Rendimento Fracionado
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-widest">
                      Habilitar para itens consumidos em partes (ex: ml, g, metros)
                    </span>
                  </div>
                </label>

                {itemFracionavelAtivo && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 fade-in duration-500 bg-gray-50/50 dark:bg-black/20 p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner">
                    <div className="relative">
                      <CampoTexto
                        rotulo="Rendimento Total"
                        icone={Ruler}
                        type="number"
                        step="any"
                        placeholder="Ex: 50"
                        erro={errors.rendimentoTotal?.message}
                        {...register("rendimentoTotal", {
                          required: itemFracionavelAtivo ? "Obrigatório" : false,
                          valueAsNumber: true,
                        })}
                      />
                      <span className="absolute right-4 top-[46px] text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none tracking-[0.2em] uppercase">
                        {unidadeConsumoAtiva || "UND"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                        Consome em
                      </label>
                      <Combobox
                        opcoes={UNIDADES_CONSUMO.map((u) => ({ valor: u.valor, rotulo: u.rotulo }))}
                        valor={unidadeConsumoAtiva}
                        aoAlterar={(val) => {
                          if (unidadeConsumoAtiva !== val) {
                            setValue("unidadeConsumo", val, { shouldValidate: true, shouldDirty: true });
                          }
                        }}
                        placeholder="Selecione..."
                        permitirNovo={true}
                        icone={Ruler}
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2 mt-4 pt-6 border-t border-gray-200/50 dark:border-white/10 flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-500 dark:text-zinc-500 uppercase tracking-[0.2em]">
                        CUSTO POR {unidadeConsumoAtiva || "UNIDADE"}:
                      </span>
                      <span className="text-gray-900 dark:text-white text-lg font-black tracking-tight">
                        {custoEfetivo}{" "}
                        <span className="text-gray-400 dark:text-zinc-600 text-xs ml-1 uppercase font-black tracking-widest">
                          / {unidadeConsumoAtiva || "und"}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══════ FOOTER ═══════ */}
          <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0e0e11]/50 backdrop-blur-md flex flex-col items-end gap-3 rounded-b-2xl min-h-[80px] justify-center">
            {!confirmarDescarte ? (
              <div className="flex items-center gap-4 w-full justify-between md:justify-end">
                <button
                  type="button"
                  onClick={lidarComTentativaFechamento}
                  className="px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: "var(--cor-primaria)" }}
                  className="px-8 py-3 flex-1 md:flex-none justify-center hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Save size={16} strokeWidth={3} />
                  {estaEditando ? "Salvar Alterações" : "Cadastrar Insumo"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-4 w-full animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className="flex items-center gap-3 w-full justify-between md:justify-end">
                  <button
                    type="button"
                    onClick={fecharModalRealmente}
                    className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    Descartar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => definirConfirmarDescarte(false)}
                    className="px-8 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-xl shadow-black/10 dark:shadow-white/5"
                  >
                    Continuar Editando
                  </button>
                </div>
                {isDirty && (
                  <div className="flex flex-col items-end gap-1 animate-in slide-in-from-top-1 fade-in duration-300">
                    <span className="text-[10px] font-black text-red-600 dark:text-red-500 uppercase tracking-widest mr-2">
                      Há alterações não salvas
                    </span>
                    <span className="text-[8px] font-medium text-gray-500 uppercase tracking-widest mr-2 opacity-70">
                      O progresso atual será perdido se você sair
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ancora para scroll automático final */}
          <div ref={finalFormularioRef} className="h-px" />
        </form>
      </div>
    </Dialogo>
  );
}
