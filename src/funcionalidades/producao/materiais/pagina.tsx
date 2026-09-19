import { motion, AnimatePresence } from "framer-motion";
import { Plus, PackageSearch } from "lucide-react";
import { useEffect } from "react";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
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
import { atingiuLimite } from "@/compartilhado/constantes/limites-plano";
import { ModalUpgradePaywall } from "@/compartilhado/componentes/ui";
import { useState } from "react";
import { CardPrevisaoEstoqueIA } from "./componentes/CardPrevisaoEstoqueIA";
import { usePedidos } from "@/funcionalidades/producao/projetos/hooks/usePedidos";

export function PaginaMateriais() {
  const { estado, acoes } = useGerenciadorMateriais();
  const { insumos, definirInsumos } = useArmazemInsumos();
  const { pedidos } = usePedidos();
  const { usuario } = useAutenticacao();
  const [modalPaywallAberto, setModalPaywallAberto] = useState(false);



  const tentarNovoMaterial = () => {
    if (atingiuLimite("MATERIAIS", estado.materiais.length, usuario?.plano)) {
      setModalPaywallAberto(true);
    } else {
      acoes.abrirEditar(null as unknown as Material);
    }
  };

  // 🔄 SINCRONIZAÇÃO DE INSUMOS PARA CÁLCULO CONSOLIDADO
  useEffect(() => {
    if (usuario?.uid) {
      apiInsumos.listar(usuario.uid).then(definirInsumos);
    }
  }, [usuario?.uid, definirInsumos]);

  useDefinirCabecalho({
    titulo: "Meus Materiais",
    subtitulo: "Gestão de filamentos, resinas e patrimônio técnico",
    placeholderBusca: "Buscar fabricante, cor ou tipo de material...",
    aoBuscar: acoes.definirTermoBusca,
    acao: {
      texto: "Novo Material",
      icone: Plus,
      aoClicar: tentarNovoMaterial,
    },
  });

  // Consolidação de métricas para o dashboard da página
  const metricasConsolidadas = servicoInventario.gerarRelatorioConsolidado(estado.materiais, insumos);

  return (
    <div className="flex-1 flex flex-col space-y-10">
      <AnimatePresence mode="wait">
        {estado.carregando ? null : estado.materiais.length === 0 ? (
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
              aoClicarBotao={tentarNovoMaterial}
            />
          </motion.div>
        ) : (
          <motion.div
            key="conteudo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative"
          >
            <ResumoEstoque
              materiais={estado.materiais}
              insumos={insumos}
              totalEmbalagens={estado.metricas.totalEmbalagens}
              valorInvestido={metricasConsolidadas.valorTotalMateriaisCentavos}
              alertasBaixoEstoque={metricasConsolidadas.itensEmAlerta}
            />

            <div className="mt-6">
              <CardPrevisaoEstoqueIA
                materiais={estado.materiais}
                pedidos={pedidos}
                aoRepor={(m) => acoes.abrirRepor(m.id)}
              />
            </div>

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
              aoCarregarMais={acoes.carregarMais}
              temMais={estado.temMais && !estado.carregando}
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
        aoConfirmar={(qtd, preco) => {
          if (estado.materialParaRepor) {
            acoes.confirmarReposicaoMaterial(estado.materialParaRepor.id, qtd, preco);
          }
        }}
      />

      <ModalUpgradePaywall
        aberto={modalPaywallAberto}
        aoFechar={() => setModalPaywallAberto(false)}
        recurso="Materiais"
        aoFazerUpgrade={() => {
          window.location.href = "/dashboard";
        }}
      />
    </div>
  );
}
