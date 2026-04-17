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
    titulo: "Fluxo de Caixa",
    subtitulo: "Acompanhamento detalhado de rentabilidade e saúde financeira",
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

            {/* Banner de Status DRE Premium */}
            <div className={`
              relative overflow-hidden p-8 rounded-[2rem] border transition-all duration-700 shadow-lg group
              ${dre.lucroLiquidoCentavos >= 0 
                ? "bg-gradient-to-br from-zinc-900 to-emerald-900/40 border-emerald-500/20 shadow-emerald-500/5" 
                : "bg-gradient-to-br from-zinc-900 to-rose-900/40 border-rose-500/20 shadow-rose-500/5"}
            `}>
              <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                <FileBarChart size={200} className={dre.lucroLiquidoCentavos >= 0 ? "text-emerald-500" : "text-rose-500"} />
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${dre.lucroLiquidoCentavos >= 0 ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-rose-500 shadow-lg shadow-rose-500/50"}`} />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    Performance de Lucratividade
                  </h4>
                </div>
                
                <div className="max-w-2xl">
                  <p className="text-sm font-medium text-zinc-300 leading-relaxed">
                    Com base no Mix de Produção atual, seu estúdio está operando com uma margem de segurança de{" "}
                    <strong className={`text-xl font-black tabular-nums mx-1 ${dre.lucroLiquidoCentavos >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {dre.lucratividadePercentual}%
                    </strong>. 
                    <span className="block mt-2 opacity-60 text-xs italic font-normal">
                      Este cálculo considera o preço médio de venda versus o consumo granular de filamento e custos operacionais ativos em configurações.
                    </span>
                  </p>
                </div>
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
