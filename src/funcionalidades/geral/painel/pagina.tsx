import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import toast from "react-hot-toast";

// Hooks e Estado
import { useArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { useArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { useArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { usePedidos } from "@/funcionalidades/producao/projetos/hooks/usePedidos";

// Serviços e Utilitários
import { servicoInventario } from "@/compartilhado/servicos/servicoInventario";
import { apiMateriais } from "@/funcionalidades/producao/materiais/servicos/apiMateriais";
import { apiInsumos } from "@/funcionalidades/producao/insumos/servicos/apiInsumos";
import { apiImpressoras } from "@/funcionalidades/producao/impressoras/servicos/apiImpressoras";
import { apiClientes } from "@/funcionalidades/comercial/clientes/servicos/apiClientes";
import { apiFinanceiro } from "@/funcionalidades/comercial/financeiro/servicos/apiFinanceiro";
import { StatusPedido } from "@/compartilhado/tipos/modelos";

// Componentes do Painel
import { BannerPro } from "./componentes/BannerPro";
import { MetricasPainel } from "./componentes/MetricasPainel";

import { StatusTempoReal } from "./componentes/StatusTempoReal";
import { ModalPatrimonio } from "./componentes/ModalPatrimonio";
import { ModalSelecaoMaterial } from "./componentes/ModalSelecaoMaterial";
import { ModalSelecaoInsumo } from "./componentes/ModalSelecaoInsumo";
import { DockAcoes } from "./componentes/DockAcoes";
import { WidgetOrcamentos } from "./componentes/WidgetOrcamentos";
import { GraficoConsumo } from "./componentes/GraficoConsumo";
import { WidgetInsumos } from "./componentes/WidgetInsumos";
import { WidgetMateriais } from "./componentes/WidgetMateriais";
import { WidgetAvisos } from "./componentes/WidgetAvisos";

// Componentes Compartilhados e de Outras Funcionalidades
import { FormularioCliente } from "@/funcionalidades/comercial/clientes/componentes/FormularioCliente";
import { FormularioLancamento } from "@/funcionalidades/comercial/financeiro/componentes/FormularioLancamento";
import { ModalReposicaoEstoque } from "@/funcionalidades/producao/materiais/componentes/ModalReposicaoEstoque";
import { ModalReposicaoInsumo } from "@/funcionalidades/producao/insumos/componentes/ModalReposicaoInsumo";
import { Dialogo } from "@/compartilhado/componentes";

/**
 * Página principal do dashboard (Painel).
 * Centraliza as principais métricas, status de produção e ações rápidas.
 */
import { motion } from "framer-motion";

export function PaginaInicial() {
  const { usuario } = useAutenticacao();
  const { pedidos } = usePedidos();
  const navegar = useNavigate();

  // 🏪 ACESSO AO ESTADO
  const materiais = useArmazemMateriais((s) => s.materiais);
  const impressoras = useArmazemImpressoras((s) => s.impressoras);
  const insumos = useArmazemInsumos((s) => s.insumos);

  const { insumos: insumosEstoque, adicionarOuAtualizarInsumo } = useArmazemInsumos();
  const { reporEstoque: reporEstoqueMat } = useArmazemMateriais();

  const acoesMateriais = useArmazemMateriais(useShallow(s => ({ definirMateriais: s.definirMateriais })));
  const acoesInsumos = useArmazemInsumos(useShallow(s => ({ definirInsumos: s.definirInsumos })));
  const acoesImpressoras = useArmazemImpressoras(useShallow(s => ({ definirImpressoras: s.definirImpressoras })));

  // 🔄 SINCRONIZAÇÃO GLOBAL NO DASHBOARD
  useEffect(() => {
    if (usuario?.uid) {
      const sincronizarTudo = async () => {
        try {
          const [mats, ins, imps] = await Promise.all([
            apiMateriais.listar(usuario.uid),
            apiInsumos.listar(usuario.uid),
            apiImpressoras.buscarTodas(usuario.uid)
          ]);
          acoesMateriais.definirMateriais(mats);
          acoesInsumos.definirInsumos(ins);
          acoesImpressoras.definirImpressoras(imps);
        } catch (erro) {
          console.error("Erro ao sincronizar dashboard:", erro);
        }
      };
      sincronizarTudo();
    }
  }, [usuario?.uid]);

  // 🧮 CÁLCULOS DE KPI
  const metricasInventario = servicoInventario.gerarRelatorioConsolidado(materiais, insumos);
  const pedidosAtivos = pedidos.filter(
    (p) => p.status !== StatusPedido.CONCLUIDO && p.status !== StatusPedido.ARQUIVADO,
  ).length;

  // 👑 LÓGICA DE UPGRADE PRO
  const plano = useArmazemConfiguracoes((s) => s.plano);
  const definirPlano = useArmazemConfiguracoes((s) => s.definirPlano);
  const salvarConfiguracoes = useArmazemConfiguracoes((s) => s.salvarNoD1);
  const [carregandoUpgrade, definirCarregandoUpgrade] = useState(false);

  // Estados de Modais
  const [modalPatrimonioAberto, definirModalPatrimonioAberto] = useState(false);
  const [modalClienteAberto, definirModalClienteAberto] = useState(false);
  const [modalFinanceiroAberto, definirModalFinanceiroAberto] = useState(false);
  const [modalReposicaoMatAberto, definirModalReposicaoMatAberto] = useState(false);
  const [modalReposicaoInsAberto, definirModalReposicaoInsAberto] = useState(false);
  const [modalSelecaoMatAberto, definirModalSelecaoMatAberto] = useState(false);
  const [modalSelecaoInsAberto, definirModalSelecaoInsAberto] = useState(false);
  
  // Estados de Seleção
  const [materialSelecionado, definirMaterialSelecionado] = useState<any>(null);
  const [insumoSelecionado, definirInsumoSelecionado] = useState<any>(null);

  const realizarUpgradeGratis = async () => {
    if (!usuario?.uid) return;
    definirCarregandoUpgrade(true);
    try {
      definirPlano("FUNDADOR");
      await salvarConfiguracoes(usuario.uid);
      toast.success("Parabéns! Agora você é um MAKER FUNDADOR vitalício ✨");
    } catch (erro) {
      toast.error("Não foi possível ativar seu plano agora.");
    } finally {
      definirCarregandoUpgrade(false);
    }
  };

  useDefinirCabecalho({
    titulo: `Olá, ${usuario?.nome?.split(" ")[0] || "Maker"}! 👋`,
    subtitulo: "Seu centro de comando para custos reais e gestão profissional.",
    placeholderBusca: "PESQUISAR EM TODA A PLATAFORMA...",
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10 relative"
    >
      {/* BACKGROUND PATTERN DISCRETO */}
      <div className="absolute inset-0 -top-20 bg-grid-printlog opacity-[0.03] pointer-events-none -z-10" />

      {/* BANNER DE UPGRADE - Oculto para Founders */}
      {plano !== "FUNDADOR" && (
        <BannerPro 
          plano={plano} 
          aoRealizarUpgrade={realizarUpgradeGratis} 
          carregandoUpgrade={carregandoUpgrade} 
        />
      )}

      {/* MÉTRICAS DE ALTO IMPACTO */}
      <MetricasPainel 
        pedidos={pedidos} 
        impressoras={impressoras} 
        pedidosAtivos={pedidosAtivos}
        metricasInventario={metricasInventario}
      />

      {/* GRADE OPERACIONAL PRINCIPAL */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* COLUNA ESQUERDA: Atividade Comercial */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="lg:h-[500px]">
            <WidgetOrcamentos 
              pedidos={pedidos} 
              aoVerTodos={() => navegar("/producao")} 
            />
          </div>
        </div>

        {/* COLUNA DIREITA: Status de Hardware */}
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:h-[500px]">
            <StatusTempoReal />
          </div>
        </div>

        {/* LINHA DE UTILITÁRIOS: 3 CARDS ALINHADOS */}
        <div className="col-span-12 lg:col-span-4 lg:h-[300px]">
          <WidgetInsumos 
            insumos={insumos} 
            aoVerTodos={() => navegar("/insumos")} 
          />
        </div>
        <div className="col-span-12 lg:col-span-4 lg:h-[300px]">
          <WidgetMateriais 
            materiais={materiais} 
            aoVerTodos={() => navegar("/materiais")} 
          />
        </div>
        <div className="col-span-12 lg:col-span-4 lg:h-[300px]">
          <WidgetAvisos 
            impressoras={impressoras} 
            aoAgendarManutencao={() => navegar("/producao/manutencao")} 
          />
        </div>

        {/* LINHA DE TENDÊNCIA: Gráfico de Consumo Full Width */}
        <div className="col-span-12">
          <div className="lg:h-[400px]">
            <GraficoConsumo />
          </div>
        </div>
      </div>

      {/* MODAIS GLOBAIS */}
      <ModalPatrimonio
        aberto={modalPatrimonioAberto}
        aoFechar={() => definirModalPatrimonioAberto(false)}
        materiais={materiais}
        insumos={insumos}
      />

      <Dialogo
        aberto={modalClienteAberto}
        aoFechar={() => definirModalClienteAberto(false)}
        titulo="NOVO CADASTRO MAKER"
      >
        <FormularioCliente 
          aberto={modalClienteAberto}
          clienteEditando={null}
          aoCancelar={() => definirModalClienteAberto(false)}
          aoSalvar={async (dados) => {
            if (!usuario?.uid) return;
            await apiClientes.salvar(dados, usuario.uid);
            definirModalClienteAberto(false);
            toast.success("Cliente cadastrado com sucesso!");
          }} 
        />
      </Dialogo>

      <Dialogo
        aberto={modalFinanceiroAberto}
        aoFechar={() => definirModalFinanceiroAberto(false)}
        titulo="REGISTRO FINANCEIRO"
      >
        <FormularioLancamento 
          aberto={modalFinanceiroAberto}
          aoCancelar={() => definirModalFinanceiroAberto(false)}
          aoSalvar={async (dados) => {
            if (!usuario?.uid) return;
            await apiFinanceiro.registrar(dados as any, usuario.uid);
            definirModalFinanceiroAberto(false);
            toast.success("Lançamento registrado!");
          }} 
        />
      </Dialogo>

      {modalReposicaoMatAberto && materialSelecionado && (
        <ModalReposicaoEstoque
          aberto={modalReposicaoMatAberto}
          aoFechar={() => definirModalReposicaoMatAberto(false)}
          material={materialSelecionado}
          aoConfirmar={(qtd, preco) => {
            reporEstoqueMat(materialSelecionado.id, qtd, preco);
            definirModalReposicaoMatAberto(false);
            toast.success("Estoque de material atualizado!");
          }}
        />
      )}

      {modalReposicaoInsAberto && insumoSelecionado && (
        <ModalReposicaoInsumo
          aberto={modalReposicaoInsAberto}
          aoFechar={() => definirModalReposicaoInsAberto(false)}
          insumo={insumoSelecionado}
          aoConfirmar={(id, qtd, valorTotal) => {
            const insumoAtual = insumosEstoque.find(i => i.id === id);
            if (insumoAtual) {
              const novoEstoque = (insumoAtual.quantidadeAtual || 0) + qtd;
              const novoCustoTotal = ((insumoAtual.quantidadeAtual || 0) * (insumoAtual.custoMedioUnidade || 0)) + valorTotal;
              const novoCustoMedio = novoEstoque > 0 ? novoCustoTotal / novoEstoque : (insumoAtual.custoMedioUnidade || 0);

              adicionarOuAtualizarInsumo({
                ...insumoAtual,
                quantidadeAtual: novoEstoque,
                custoMedioUnidade: Math.round(novoCustoMedio),
                dataAtualizacao: new Date()
              });
              
              definirModalReposicaoInsAberto(false);
              toast.success("Estoque de insumo atualizado!");
            }
          }}
        />
      )}

      <ModalSelecaoMaterial 
        aberto={modalSelecaoMatAberto}
        aoFechar={() => definirModalSelecaoMatAberto(false)}
        materiais={materiais}
        aoSelecionarMaterial={(m) => {
          definirMaterialSelecionado(m);
          definirModalSelecaoMatAberto(false);
          definirModalReposicaoMatAberto(true);
        }}
      />

      <ModalSelecaoInsumo 
        aberto={modalSelecaoInsAberto}
        aoFechar={() => definirModalSelecaoInsAberto(false)}
        insumos={insumos}
        aoSelecionarInsumo={(i) => {
          definirInsumoSelecionado(i);
          definirModalSelecaoInsAberto(false);
          definirModalReposicaoInsAberto(true);
        }}
      />

      <DockAcoes 
        aoNavegar={navegar}
        aoAbrirModalCliente={() => definirModalClienteAberto(true)}
        aoAbrirModalSelecaoMat={() => definirModalSelecaoMatAberto(true)}
        aoAbrirModalSelecaoIns={() => definirModalSelecaoInsAberto(true)}
        aoAbrirModalFinanceiro={() => definirModalFinanceiroAberto(true)}
      />
    </motion.div>
  );
}
