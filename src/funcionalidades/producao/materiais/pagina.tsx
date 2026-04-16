import { FormularioMaterial } from "./componentes/FormularioMaterial";
import { ResumoEstoque } from "./componentes/ResumoEstoque";
import { FiltrosMaterial } from "./componentes/FiltrosMaterial";
import { CardMaterial } from "./componentes/CardMaterial";
import { PackageSearch, Search } from "lucide-react";
import { ModalHistoricoUso } from "./componentes/ModalHistoricoUso";
import { ModalArquivamentoMaterial } from "./componentes/ModalArquivamentoMaterial";
import { ModalReposicaoEstoque } from "./componentes/ModalReposicaoEstoque";
import { usarGerenciadorMateriais } from "./hooks/usarGerenciadorMateriais";
import { Material } from "./tipos";

import { motion, AnimatePresence } from "framer-motion";
import { EstadoVazio } from "@/compartilhado/componentes/EstadoVazio";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";

export function PaginaMateriais() {
  const { estado, acoes } = usarGerenciadorMateriais();

  return (
    <div className="space-y-10">
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {estado.carregando && estado.materiais.length > 0 && <Carregamento texto="Carregando materiais..." />}
        {estado.materiais.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum material encontrado"
            descricao="Adicione o seu primeiro material para gerenciar o seu estoque de matéria prima."
            icone={PackageSearch}
            textoBotao="Cadastrar Material"
            aoClicarBotao={() => acoes.abrirEditar(null as unknown as Material)}
          />
        ) : (
          <>
            <ResumoEstoque
              materiais={estado.materiais}
              totalEmbalagens={estado.metricas.totalEmbalagens}
              valorInvestido={estado.metricas.valorInvestido}
              alertasBaixoEstoque={estado.metricas.alertasBaixoEstoque}
            />

            <div className="mt-8">
              <FiltrosMaterial
                filtroAtual={estado.filtro}
                aoFiltrar={acoes.definirFiltro}
                ordenacaoAtual={estado.ordenacao}
                aoOrdenar={acoes.definirOrdenacao}
                ordemInvertida={estado.ordemInvertida}
                aoInverterOrdem={acoes.inverterOrdem}
              />
            </div>

            {estado.materiaisFiltradosOrdenados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search size={36} strokeWidth={1.5} className="text-gray-300 dark:text-zinc-700 mb-4" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Nenhum resultado encontrado</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400">Tente buscar com termos diferentes.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                <AnimatePresence mode="popLayout">
                  {estado.agrupadosPorTipoMaterial.map(([tipo, lista]) => (
                    <motion.div
                      layout
                      key={tipo}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {tipo}
                          </h3>
                          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#27272a] border border-gray-200 dark:border-zinc-700/50 text-[10px] font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-widest flex items-center h-6 leading-none shadow-sm">
                            {lista.length} ITEM{lista.length !== 1 ? "S" : ""}
                          </span>
                        </div>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-white/5" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {lista.map((mat) => (
                          <CardMaterial
                            key={mat.id}
                            material={mat}
                            aoEditar={acoes.abrirEditar}
                            aoHistorico={acoes.abrirHistorico}
                            aoExcluir={acoes.abrirExcluir}
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

      {/* Modal de Cadastro/Edição */}
      <FormularioMaterial
        aberto={estado.modalAberto}
        aoSalvar={acoes.salvarMaterial}
        aoCancelar={acoes.fecharEditar}
        materialEditando={estado.materialSendoEditado}
      />

      {/* Modal Unificado de Uso e Histórico (Fase 4) */}
      {estado.modalHistoricoAberto && estado.materialParaHistorico && (
        <ModalHistoricoUso
          aberto={estado.modalHistoricoAberto}
          material={estado.materialParaHistorico}
          aoFechar={acoes.fecharHistorico}
        />
      )}

      {/* Modal de Arquivamento disfarçado de Remoção */}
      <ModalArquivamentoMaterial
        aberto={estado.modalExclusaoAberto}
        material={estado.materialParaExcluir}
        aoFechar={acoes.fecharExcluir}
        aoConfirmar={acoes.confirmarArquivamento}
      />

      {/* Modal de Reposição de Estoque */}
      <ModalReposicaoEstoque
        aberto={estado.modalReposicaoAberto}
        material={estado.materialParaRepor}
        aoFechar={acoes.fecharRepor}
        aoConfirmar={acoes.confirmarReposicaoMaterial}
      />
    </div>
  );
}
