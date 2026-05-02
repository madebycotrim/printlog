import { motion, AnimatePresence } from "framer-motion";
import { Plus, PackageSearch, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { usarBeta } from "@/compartilhado/contextos/ContextoBeta";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";
import { EstadoVazio } from "@/compartilhado/componentes/EstadoVazio";
import { usarGerenciadorMateriais } from "./hooks/usarGerenciadorMateriais";
import { Material } from "./tipos";
import { FormularioMaterial } from "./componentes/FormularioMaterial";
import { ResumoEstoque } from "./componentes/ResumoEstoque";
import { FiltrosMaterial } from "./componentes/FiltrosMaterial";
import { ListaMateriais } from "./componentes/ListaMateriais";
import { ModalHistoricoUso } from "./componentes/ModalHistoricoUso";
import { ModalArquivamentoMaterial } from "./componentes/ModalArquivamentoMaterial";
import { ModalReposicaoEstoque } from "./componentes/ModalReposicaoEstoque";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { servicoInventario } from "@/compartilhado/servicos/servicoInventario";
import { apiInsumos } from "@/funcionalidades/producao/insumos/servicos/apiInsumos";
import { ALERTA_ESTOQUE_FILAMENTO_GRAMAS } from "@/compartilhado/constantes/constantesNegocio";

export function PaginaMateriais() {
  const { estado, acoes } = usarGerenciadorMateriais();
  const { insumos, definirInsumos } = usarArmazemInsumos();
  const { usuario } = usarAutenticacao();
  const { betaEstoqueInteligente } = usarBeta();

  // 🔄 SINCRONIZAÇÃO DE INSUMOS PARA CÁLCULO CONSOLIDADO
  useEffect(() => {
    if (usuario?.uid) {
      apiInsumos.listar(usuario.uid).then(definirInsumos);
    }
  }, [usuario?.uid]);

  usarDefinirCabecalho({
    titulo: "Estoque de Insumos",
    subtitulo: "Gestão inteligente de filamentos, resinas e patrimônio técnico",
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
    <div className="space-y-10 min-h-[60vh] flex flex-col">
      <AnimatePresence mode="wait">
        {estado.carregando && estado.materiais.length === 0 ? (
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
                className="mt-6 p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <PackageSearch size={100} />
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 mt-1">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest">Alerta Preditivo (Em Breve)</h3>
                       <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">IA Lab</span>
                    </div>
                    <p className="text-xs text-indigo-300/80 mt-1 leading-relaxed max-w-xl">
                      Historicamente, você consome rolos similares muito rápido. Seu estoque atual tem <strong className="text-indigo-200">{estado.metricas.alertasBaixoEstoque} material(is)</strong> abaixo do seu limite de <strong className="text-indigo-200">{ALERTA_ESTOQUE_FILAMENTO_GRAMAS}g</strong>. Sugerimos preparar uma ordem de compra nos próximos <strong>5 dias</strong> para não travar a linha de produção.
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
