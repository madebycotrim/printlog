import { Plus, Printer, Search } from "lucide-react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarGerenciadorImpressoras } from "./hooks/usarGerenciadorImpressoras";
import { FormularioImpressora } from "./componentes/FormularioImpressora";
import { CardImpressora } from "./componentes/CardImpressora";
import { ResumoImpressoras } from "./componentes/ResumoImpressoras";
import { FiltrosImpressora } from "./componentes/FiltrosImpressora";
import { ModalDetalhesImpressora } from "./componentes/ModalDetalhesImpressora";
import { ModalAposentarImpressora } from "./componentes/ModalAposentarImpressora";
import { ModalManutencao } from "./manutencao/componentes/ModalManutencao";
import { ModalHistoricoProducao } from "./componentes/ModalHistoricoProducao";

import { motion, AnimatePresence } from "framer-motion";
import { EstadoVazio } from "@/compartilhado/componentes/EstadoVazio";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";

export function PaginaImpressoras() {
  const { estado, acoes } = usarGerenciadorImpressoras();

  usarDefinirCabecalho({
    titulo: "Minhas Impressoras",
    subtitulo: "Gerencie seu parque de máquinas",
    placeholderBusca: "Buscar impressora (Ex: Kobra S1)...",
    acao: {
      texto: "Nova Máquina",
      icone: Plus,
      aoClicar: () => acoes.abrirEditar(),
    },
    aoBuscar: acoes.pesquisar,
  });

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {estado.carregando && estado.impressoras.length > 0 && (
          <Carregamento tipo="global" mensagem="Carregando impressoras..." />
        )}
        {estado.impressoras.length === 0 ? (
          <EstadoVazio
            titulo="Nenhuma impressora encontrada"
            descricao="Adicione sua primeira impressora 3D para expandir sua capacidade de produção."
            icone={Printer}
            textoBotao="Cadastrar Máquina"
            aoClicarBotao={() => acoes.abrirEditar()}
          />
        ) : (
          <>
            <ResumoImpressoras
              totalMaquinas={estado.totais.total}
              horasImpressao={estado.totais.horasImpressao}
              emManutencao={estado.totais.manutencao}
              requerAtencao={estado.totais.requerAtencao}
              valorInvestido={estado.totais.valorInvestido}
            />

            <div className="mt-8">
              <FiltrosImpressora
                filtroAtual={estado.filtroTecnologia}
                aoFiltrar={acoes.filtrarPorTecnologia}
                ordenacaoAtual={estado.ordenacao}
                aoOrdenar={acoes.ordenarPor}
                ordemInvertida={estado.ordemInvertida}
                aoInverterOrdem={acoes.inverterOrdem}
              />
            </div>

            {estado.impressorasFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search size={36} strokeWidth={1.5} className="text-gray-300 dark:text-zinc-700 mb-4" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Nenhum resultado encontrado</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400">Tente buscar com termos diferentes.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                <AnimatePresence mode="popLayout">
                  {estado.agrupadasPorTecnologia.map(([tecnologia, lista]) => (
                    <motion.div
                      layout
                      key={tecnologia}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {tecnologia}
                          </h3>
                          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#27272a] border border-gray-200 dark:border-zinc-700/50 text-[10px] font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-widest flex items-center h-6 leading-none shadow-sm">
                            {lista.length} ITEM{lista.length !== 1 ? "S" : ""}
                          </span>
                        </div>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-white/5" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {lista.map((impressora) => (
                          <CardImpressora
                            key={impressora.id}
                            impressora={impressora}
                            aoEditar={acoes.abrirEditar}
                            aoAposentar={acoes.abrirAposentar}
                            aoDetalhes={acoes.abrirDetalhes}
                            aoManutencoes={acoes.abrirManutencao}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </motion.div>

      <FormularioImpressora
        aberto={estado.modalAberto}
        impressoraEditando={estado.impressoraSendoEditada}
        aoCancelar={acoes.fecharEditar}
        aoSalvar={acoes.salvarImpressora}
      />

      <ModalDetalhesImpressora
        aberto={estado.modalDetalhesAberto}
        impressora={estado.impressoraEmDetalhes}
        aoFechar={acoes.fecharDetalhes}
        aoSalvarObservacoes={acoes.salvarObservacoes}
      />

      <ModalAposentarImpressora
        aberto={estado.modalAposentarAberto}
        impressora={estado.impressoraParaAposentar}
        aoFechar={acoes.fecharAposentar}
        aoConfirmar={acoes.confirmarAposentadoria}
      />

      {estado.modalManutencaoAberto && estado.impressoraManutencao && (
        <ModalManutencao
          aberto={estado.modalManutencaoAberto}
          impressora={estado.impressoraManutencao}
          aoFechar={acoes.fecharManutencao}
        />
      )}

      <ModalHistoricoProducao
        aberto={estado.modalProducaoAberto}
        impressora={estado.impressoraProducao}
        aoFechar={acoes.fecharProducao}
      />
    </div>
  );
}
