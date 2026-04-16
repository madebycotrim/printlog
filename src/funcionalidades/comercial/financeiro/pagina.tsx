import { Plus, ReceiptText, Search, FileBarChart } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { ResumoFinanceiroComponente } from "./componentes/ResumoFinanceiro";
import { TabelaLancamentos } from "./componentes/TabelaLancamentos";
import { FormularioLancamento } from "./componentes/FormularioLancamento";
import { FiltrosFinanceiro } from "./componentes/FiltrosFinanceiro";
import { EstadoVazio } from "@/compartilhado/componentes/EstadoVazio";
import { usarFinanceiro } from "./hooks/usarFinanceiro";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";
import { servicoFinanceiroAvancado } from "@/compartilhado/servicos/servicoFinanceiroAvancado";

export function PaginaFinanceiro() {
  const [modalAberto, setModalAberto] = useState(false);
  const {
    lancamentos,
    lancamentosFiltrados,
    resumo,
    carregando,
    adicionarLancamento,
    filtroTipo,
    ordenacao,
    ordemInvertida,
    definirFiltroTipo,
    ordenarPor,
    inverterOrdem,
    pesquisar,
  } = usarFinanceiro();

  const materiais = usarArmazemMateriais((s) => s.materiais);
  const { pedidos } = usarPedidos();

  const dre = useMemo(
    () => servicoFinanceiroAvancado.gerarDRE(pedidos, lancamentos, materiais),
    [pedidos, lancamentos, materiais],
  );

  usarDefinirCabecalho({
    titulo: "Ecossistema Financeiro",
    subtitulo: "Acompanhamento detalhado de DRE e Fluxo de Caixa",
    placeholderBusca: "Buscar transações, categorias ou referências...",
    aoBuscar: pesquisar,
    acao: {
      texto: "Registrar Transação",
      icone: Plus,
      aoClicar: () => setModalAberto(true),
    },
  });

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-8"
      >
        {carregando && lancamentos.length > 0 ? (
          <Carregamento tipo="pulse" texto="Sincronizando Lançamentos" />
        ) : lancamentos.length === 0 ? (
          <EstadoVazio
            titulo="Fluxo de caixa vazio"
            descricao="Comece registrando suas contas para visualizar sua rentabilidade e margem de lucro real."
            icone={ReceiptText}
            textoBotao="Novo Lançamento"
            aoClicarBotao={() => setModalAberto(true)}
          />
        ) : (
          <>
            <ResumoFinanceiroComponente resumo={resumo} lucratividadePercentual={dre.lucratividadePercentual} />

            {/* Banner de Status DRE */}
            <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 flex items-center justify-between group overflow-hidden relative shadow-sm">
              <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <FileBarChart size={120} />
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${dre.lucroLiquidoCentavos >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                  />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Status de Rentabilidade
                  </h4>
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 max-w-lg">
                  Baseado no Mix de Produção atual, seu estúdio está operando com uma margem de{" "}
                  <strong className="text-zinc-900 dark:text-white">{dre.lucratividadePercentual}%</strong>. Este
                  cálculo considera o preço de venda vs. consumo estimado de filamento.
                </p>
              </div>
            </div>

            <FiltrosFinanceiro
              tipoAtivo={filtroTipo}
              aoMudarTipo={definirFiltroTipo}
              ordenacaoAtual={ordenacao}
              aoOrdenar={ordenarPor}
              ordemInvertida={ordemInvertida}
              aoInverterOrdem={inverterOrdem}
            />

            {lancamentosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Search size={36} className="text-zinc-300 dark:text-zinc-700 mb-4" />
                <h3 className="text-base font-black text-zinc-900 dark:text-white">Nenhum lançamento filtrado</h3>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${filtroTipo}-${ordenacao}-${ordemInvertida}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabelaLancamentos lancamentos={lancamentosFiltrados} />
                </motion.div>
              </AnimatePresence>
            )}
          </>
        )}
      </motion.div>

      <FormularioLancamento
        aberto={modalAberto}
        aoCancelar={() => setModalAberto(false)}
        aoSalvar={adicionarLancamento}
      />
    </div>
  );
}
