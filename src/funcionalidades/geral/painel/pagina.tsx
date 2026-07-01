import { useNavigate } from "react-router-dom";
import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import toast from "react-hot-toast";

import { autenticacao } from "@/compartilhado/servicos/firebase";
// Hooks e Estado
import { useArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { useArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { useArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { usePedidos } from "@/funcionalidades/producao/projetos/hooks/usePedidos";
import { useArmazemNotificacoes } from "@/compartilhado/estado/armazemNotificacoes";

// Serviços e Utilitários
import { servicoInventario } from "@/compartilhado/servicos/servicoInventario";
import { apiMateriais } from "@/funcionalidades/producao/materiais/servicos/apiMateriais";
import { apiInsumos } from "@/funcionalidades/producao/insumos/servicos/apiInsumos";
import { apiImpressoras } from "@/funcionalidades/producao/impressoras/servicos/apiImpressoras";
import { useGerenciadorClientes } from "@/funcionalidades/comercial/clientes/hooks/useGerenciadorClientes";
import { useFinanceiro } from "@/funcionalidades/comercial/financeiro/hooks/useFinanceiro";
import { useGerenciadorInsumos } from "@/funcionalidades/producao/insumos/hooks/useGerenciadorInsumos";
import { useGerenciadorMateriais } from "@/funcionalidades/producao/materiais/hooks/useGerenciadorMateriais";
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
const GraficoConsumo = lazy(() => import("./componentes/GraficoConsumo").then(m => ({ default: m.GraficoConsumo })));
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


// Componentes de Esqueleto para Carregamento
function SkeletonMetricas() {
  const itens = [1, 2, 3, 4, 5, 6];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {itens.map((i) => (
          <div key={i} className="h-28 bg-card border border-borda-sutil rounded-[1.5rem] p-6 animate-pulse flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-20" />
              <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-6 bg-zinc-300 dark:bg-zinc-700 rounded w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {itens.map((i) => (
          <div key={i} className="h-28 bg-card border border-borda-sutil rounded-[1.5rem] p-6 animate-pulse flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-20" />
              <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-6 bg-zinc-300 dark:bg-zinc-700 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonWidget({ classeAltura }: { classeAltura: string }) {
  return (
    <div className={`w-full ${classeAltura} min-h-[300px] bg-card border border-borda-sutil rounded-[2rem] p-8 animate-pulse flex flex-col justify-between`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-1/3" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-12" />
        </div>
        <div className="space-y-3 pt-4">
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800/50 rounded-2xl w-full" />
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800/50 rounded-2xl w-full" />
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800/50 rounded-2xl w-full" />
        </div>
      </div>
      <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full mt-4" />
    </div>
  );
}

export function PaginaInicial() {
  const { usuario } = useAutenticacao();
  const { pedidos } = usePedidos();
  const navegar = useNavigate();
  const { acoes: acoesClientes } = useGerenciadorClientes();
  const { adicionarLancamento } = useFinanceiro();
  const { acoes: acoesInsumosHook } = useGerenciadorInsumos();
  const { acoes: acoesMateriaisHook } = useGerenciadorMateriais();

  // 🏪 ACESSO AO ESTADO
  const materiais = useArmazemMateriais((s) => s.materiais);
  const impressoras = useArmazemImpressoras((s) => s.impressoras);
  const insumos = useArmazemInsumos((s) => s.insumos);
  const notificacoes = useArmazemNotificacoes((s) => s.notificacoes);

  const jaCarregouMateriais = useArmazemMateriais((s) => s.jaCarregou);
  const jaCarregouInsumos = useArmazemInsumos((s) => s.jaCarregou);
  const jaCarregouImpressoras = useArmazemImpressoras((s) => s.jaCarregou);

  const { insumos: insumosEstoque, adicionarOuAtualizarInsumo } = useArmazemInsumos();
  const { reporEstoque: reporEstoqueMat } = useArmazemMateriais();

  const acoesMateriais = useArmazemMateriais(useShallow(s => ({ definirMateriais: s.definirMateriais, definirJaCarregou: s.definirJaCarregou })));
  const acoesInsumos = useArmazemInsumos(useShallow(s => ({ definirInsumos: s.definirInsumos, definirJaCarregou: s.definirJaCarregou })));
  const acoesImpressoras = useArmazemImpressoras(useShallow(s => ({ definirImpressoras: s.definirImpressoras, definirJaCarregou: s.definirJaCarregou })));

  const [carregandoDados, definirCarregandoDados] = useState(false);
  const [erroDados, definirErroDados] = useState(false);

  // 🔄 SINCRONIZAÇÃO GLOBAL NO DASHBOARD
  const sincronizarTudo = useCallback(async (forcar = false) => {
    if (!usuario?.uid) return;

    if (!forcar && jaCarregouMateriais && jaCarregouInsumos && jaCarregouImpressoras) {
      return;
    }

    definirCarregandoDados(true);
    definirErroDados(false);

    try {
      const [mats, ins, imps] = await Promise.all([
        apiMateriais.listar(usuario.uid),
        apiInsumos.listar(usuario.uid),
        apiImpressoras.buscarTodas(usuario.uid)
      ]);
      acoesMateriais.definirMateriais(mats);
      acoesInsumos.definirInsumos(ins);
      acoesImpressoras.definirImpressoras(imps);

      acoesMateriais.definirJaCarregou(true);
      acoesInsumos.definirJaCarregou(true);
      acoesImpressoras.definirJaCarregou(true);
    } catch (erro) {
      console.error("Erro ao sincronizar dashboard:", erro);
      definirErroDados(true);
      toast.error("Falha ao sincronizar dados do painel.");
    } finally {
      definirCarregandoDados(false);
    }
  }, [usuario?.uid, jaCarregouMateriais, jaCarregouInsumos, jaCarregouImpressoras, acoesMateriais, acoesInsumos, acoesImpressoras]);

  useEffect(() => {
    sincronizarTudo();
  }, [usuario?.uid, sincronizarTudo]);

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
      if (autenticacao.currentUser) {
        await autenticacao.currentUser.reload();
        if (!autenticacao.currentUser.emailVerified) {
          toast.error("Você precisa verificar seu e-mail no Perfil antes de ativar este plano.");
          definirCarregandoUpgrade(false);
          return;
        }
      }

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
    <div className="space-y-8 pb-10 relative">
      {/* BACKGROUND PATTERN DISCRETO */}
      <div className="absolute inset-0 -top-20 bg-grid-printlog opacity-[0.03] pointer-events-none -z-10" />

      {/* BANNER DE UPGRADE - Oculto para Founders */}
      {plano !== "FUNDADOR" && (
        <div>
          <BannerPro 
            plano={plano} 
            aoRealizarUpgrade={realizarUpgradeGratis} 
            carregandoUpgrade={carregandoUpgrade} 
          />
        </div>
      )}

      {erroDados && (
        <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/50 dark:border-rose-900/30 rounded-[2rem] p-8 text-center space-y-4">
          <div className="text-rose-500 font-semibold">Falha na sincronização dos dados do painel</div>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Não foi possível carregar as informações do servidor. Verifique sua conexão com a internet e tente novamente.
          </p>
          <button
            onClick={() => sincronizarTudo(true)}
            className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-md hover:shadow-lg"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {carregandoDados ? (
        <>
          <SkeletonMetricas />
          <div className="grid grid-cols-12 gap-6 items-start">
            <div className="col-span-12 lg:col-span-8">
              <SkeletonWidget classeAltura="lg:h-[500px]" />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <SkeletonWidget classeAltura="lg:h-[500px]" />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <SkeletonWidget classeAltura="lg:h-[300px]" />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <SkeletonWidget classeAltura="lg:h-[300px]" />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <SkeletonWidget classeAltura="lg:h-[300px]" />
            </div>
            <div className="col-span-12">
              <SkeletonWidget classeAltura="lg:h-[400px]" />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* MÉTRICAS DE ALTO IMPACTO */}
          <div>
            <MetricasPainel 
              pedidos={pedidos} 
              impressoras={impressoras} 
              pedidosAtivos={pedidosAtivos}
              metricasInventario={metricasInventario}
            />
          </div>

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
                <WidgetAvisos 
                  impressoras={impressoras} 
                  notificacoes={notificacoes}
                  aoAgendarManutencao={() => navegar("/producao/manutencao")} 
                />
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
              <StatusTempoReal />
            </div>

            {/* LINHA DE TENDÊNCIA: Gráfico de Consumo Full Width */}
            <div className="col-span-12">
              <div className="lg:h-[400px]">
                <Suspense fallback={<div className="h-full w-full bg-gray-50/70 dark:bg-white/[0.02] border border-borda-sutil dark:border-white/10 rounded-2xl flex items-center justify-center text-xs text-muted-foreground uppercase font-black tracking-widest animate-pulse">Carregando gráfico de consumo...</div>}>
                  <GraficoConsumo />
                </Suspense>
              </div>
            </div>
          </div>
        </>
      )}

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
            definirModalClienteAberto(false);
            await acoesClientes.salvarCliente(dados);
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
            definirModalFinanceiroAberto(false);
            await adicionarLancamento(dados as any);
          }} 
        />
      </Dialogo>

      {modalReposicaoMatAberto && materialSelecionado && (
        <ModalReposicaoEstoque
          aberto={modalReposicaoMatAberto}
          aoFechar={() => definirModalReposicaoMatAberto(false)}
          material={materialSelecionado}
          aoConfirmar={async (qtd, preco) => {
            definirModalReposicaoMatAberto(false);
            await acoesMateriaisHook.confirmarReposicaoMaterial(materialSelecionado.id, qtd, preco);
          }}
        />
      )}

      {modalReposicaoInsAberto && insumoSelecionado && (
        <ModalReposicaoInsumo
          aberto={modalReposicaoInsAberto}
          aoFechar={() => definirModalReposicaoInsAberto(false)}
          insumo={insumoSelecionado}
          aoConfirmar={async (id, qtd, valorTotal) => {
            definirModalReposicaoInsAberto(false);
            await acoesInsumosHook.confirmarReposicaoInsumo(id, qtd, valorTotal);
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
    </div>
  );
}
