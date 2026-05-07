import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import toast from "react-hot-toast";

// Hooks e Estado
import { usarArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";

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
import { SecaoAnalytics } from "./componentes/SecaoAnalytics";
import { SecaoOperacional } from "./componentes/SecaoOperacional";
import { ModalPatrimonio } from "./componentes/ModalPatrimonio";
import { ModalSelecaoMaterial } from "./componentes/ModalSelecaoMaterial";
import { ModalSelecaoInsumo } from "./componentes/ModalSelecaoInsumo";
import { DockAcoes } from "./componentes/DockAcoes";

// Componentes Compartilhados e de Outras Funcionalidades
import { FormularioCliente } from "@/funcionalidades/comercial/clientes/componentes/FormularioCliente";
import { FormularioLancamento } from "@/funcionalidades/comercial/financeiro/componentes/FormularioLancamento";
import { ModalReposicaoEstoque } from "@/funcionalidades/producao/materiais/componentes/ModalReposicaoEstoque";
import { ModalReposicaoInsumo } from "@/funcionalidades/producao/insumos/componentes/ModalReposicaoInsumo";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";

/**
 * Página principal do dashboard (Painel).
 * Centraliza as principais métricas, status de produção e ações rápidas.
 */
export function PaginaInicial() {
  const { usuario } = usarAutenticacao();
  const { pedidos } = usarPedidos();
  const navegar = useNavigate();

  // 🏪 ACESSO AO ESTADO
  const materiais = usarArmazemMateriais((s) => s.materiais);
  const impressoras = usarArmazemImpressoras((s) => s.impressoras);
  const insumos = usarArmazemInsumos((s) => s.insumos);

  const { insumos: insumosEstoque, adicionarOuAtualizarInsumo } = usarArmazemInsumos();
  const { reporEstoque: reporEstoqueMat } = usarArmazemMateriais();

  const acoesMateriais = usarArmazemMateriais(useShallow(s => ({ definirMateriais: s.definirMateriais })));
  const acoesInsumos = usarArmazemInsumos(useShallow(s => ({ definirInsumos: s.definirInsumos })));
  const acoesImpressoras = usarArmazemImpressoras(useShallow(s => ({ definirImpressoras: s.definirImpressoras })));

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
  const plano = usarArmazemConfiguracoes((s) => s.plano);
  const definirPlano = usarArmazemConfiguracoes((s) => s.definirPlano);
  const salvarConfiguracoes = usarArmazemConfiguracoes((s) => s.salvarNoD1);
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

  usarDefinirCabecalho({
    titulo: `Olá, ${usuario?.nome?.split(" ")[0] || "Maker"}! 👋`,
    subtitulo: "Seu centro de comando para custos reais e gestão profissional.",
    placeholderBusca: "PESQUISAR EM TODA A PLATAFORMA...",
  });

  return (
    <div className="space-y-12 pb-10">
      <BannerPro 
        plano={plano} 
        aoRealizarUpgrade={realizarUpgradeGratis} 
        carregandoUpgrade={carregandoUpgrade} 
      />

      <SecaoAnalytics 
        pedidos={pedidos} 
        impressoras={impressoras} 
        pedidosAtivos={pedidosAtivos}
        metricasInventario={metricasInventario}
      />

      <SecaoOperacional />
      
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
    </div>
  );
}
