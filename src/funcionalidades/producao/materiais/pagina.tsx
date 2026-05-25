import { motion, AnimatePresence } from "framer-motion";
import { Plus, PackageSearch, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useBeta } from "@/compartilhado/contextos/ContextoBeta";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { Carregamento } from "@/compartilhado/componentes";
import { EstadoVazio } from "@/compartilhado/componentes";
import { useGerenciadorMateriais } from "./hooks/useGerenciadorMateriais";
import { Material } from "./tipos";
import { FormularioMaterial } from "./componentes/FormularioMaterial";
import { ResumoEstoque } from "./componentes/ResumoEstoque";
import { FiltrosMaterial } from "./componentes/FiltrosMaterial";
import { ListaMateriais } from "./componentes/ListaMateriais";
import { ModalHistoricoUso } from "./componentes/ModalHistoricoUso";
import { ModalArquivamentoMaterial } from "./componentes/ModalArquivamentoMaterial";
import { ModalReposicaoEstoque } from "./componentes/ModalReposicaoEstoque";
import { useArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { servicoInventario } from "@/compartilhado/servicos/servicoInventario";
import { apiInsumos } from "@/funcionalidades/producao/insumos/servicos/apiInsumos";
import { ALERTA_ESTOQUE_FILAMENTO_GRAMAS } from "@/compartilhado/constantes/constantesNegocio";

export function PaginaMateriais() {
  const { estado, acoes } = useGerenciadorMateriais();
  const { insumos, definirInsumos } = useArmazemInsumos();
  const { usuario } = useAutenticacao();
  const { betaEstoqueInteligente } = useBeta();

  // 🔄 SINCRONIZAÇÃO DE INSUMOS PARA CÁLCULO CONSOLIDADO
  useEffect(() => {
    if (usuario?.uid) {
      apiInsumos.listar(usuario.uid).then(definirInsumos);
    }
  }, [usuario?.uid]);

  useDefinirCabecalho({
    titulo: "Meus Materiais",
    subtitulo: "Gestão de filamentos, resinas e patrimônio técnico",
    placeholderBusca: "Buscar fabricante, cor ou tipo de material...",
    aoBuscar: acoes.definirTermoBusca,
    acao: {
      texto: "Novo Material",
      icone: Plus,
      aoClicar: () => acoes.abrirEditar(null as unknown as Material),
    },
  });

  // Consolidação de métricas para o dashboard da página
  const metricasConsolidadas = servicoInventario.gerarRelatorioConsolidado(estado.materiais, insumos);

  return (
    <div className="flex-1 flex flex-col space-y-10">
      <AnimatePresence mode="wait">
        {estado.carregando ? (
          <motion.div
            key="carregando"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-40"
          >
            <Carregamento tipo="ponto" mensagem="Sincronizando materiais e filamentos..." />
          </motion.div>
        ) : estado.materiais.length === 0 ? (
          <motion.div
            key="vazio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col w-full"
          >
            <EstadoVazio
              titulo="Nenhum material encontrado"
              descricao="Adicione o seu primeiro material para gerenciar o seu estoque de matéria prima."
              icone={PackageSearch}
              textoBotao="Cadastrar Material"
              aoClicarBotao={() => acoes.abrirEditar(null as unknown as Material)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="conteudo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <ResumoEstoque
              materiais={estado.materiais}
              insumos={insumos}
              totalEmbalagens={estado.metricas.totalEmbalagens}
              valorInvestido={metricasConsolidadas.valorTotalMateriaisCentavos}
              alertasBaixoEstoque={metricasConsolidadas.itensEmAlerta}
            />

            {betaEstoqueInteligente && estado.metricas.alertasBaixoEstoque > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-5 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-indigo-500">
                   <PackageSearch size={100} />
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 mt-1">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Alerta Preditivo (Em Breve)</h3>
                       <span className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">IA Lab</span>
                    </div>
                    <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 mt-1 leading-relaxed max-w-xl">
                      Historicamente, você consome rolos similares muito rápido. Seu estoque atual tem <strong className="text-indigo-700 dark:text-indigo-200">{estado.metricas.alertasBaixoEstoque} material(is)</strong> abaixo do seu limite de <strong className="text-indigo-700 dark:text-indigo-200">{ALERTA_ESTOQUE_FILAMENTO_GRAMAS}g</strong>. Sugerimos preparar uma ordem de compra nos próximos <strong>5 dias</strong> para não travar a linha de produção.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

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

            <ListaMateriais 
              materiais={estado.materiaisFiltradosOrdenados}
              agrupadosPorTipo={estado.agrupadosPorTipoMaterial}
              aoEditar={acoes.abrirEditar}
              aoHistorico={(m, aba) => acoes.abrirHistorico(m.id, aba)}
              aoExcluir={(m) => acoes.abrirExcluir(m.id)}
              aoAlternarFavorito={acoes.alternarFavorito}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Cadastro (Exclusivo para Novo Insumo) */}
      <FormularioMaterial
        aberto={estado.modalAberto}
        aoSalvar={acoes.salvarMaterial}
        aoCancelar={acoes.fecharEditar}
      />

      {/* Modal Unificado de Uso e Histórico (Fase 4) */}
      {estado.modalHistoricoAberto && estado.materialParaHistorico && (
        <ModalHistoricoUso
          aberto={estado.modalHistoricoAberto}
          material={estado.materialParaHistorico}
          abaInicial={estado.abaHistoricoInicial}
          aoAbater={acoes.confirmarAbatimentoPeso}
          aoSalvarCadastro={acoes.salvarMaterial}
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
