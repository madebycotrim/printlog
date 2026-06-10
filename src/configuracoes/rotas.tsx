import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/compartilhado/componentes";
import { RotaProtegida } from "@/configuracoes/RotasProtegidas";
import { ScrollParaTopo } from "@/compartilhado/utilitarios/ScrollParaTopo";
import { Carregamento } from "@/compartilhado/componentes";
import { ProvedorAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { ProvedorEstudio } from "@/funcionalidades/beta/multi_estudos/contextos/ContextoEstudio";
import { ProvedorBeta } from "@/compartilhado/contextos/ContextoBeta";
import { ToasterPremium } from "@/compartilhado/componentes";
import { WidgetFeedbackBeta } from "@/funcionalidades/beta/componentes/WidgetFeedbackBeta";

// Landing Page Publica
const PaginaLanding = lazy(() => import("@/funcionalidades/landing_page/PaginaLanding"));
const SegurancaPrivacidade = lazy(() => import("@/funcionalidades/landing_page/seguranca-e-privacidade"));
const PoliticaPrivacidade = lazy(() => import("@/funcionalidades/lgpd/PaginaPoliticaPrivacidade"));
const PoliticaCookies = lazy(() => import("@/funcionalidades/lgpd/PaginaPoliticaCookies"));
const TermosServico = lazy(() => import("@/funcionalidades/lgpd/PaginaTermosUso"));
const PaginaGestaoDados = lazy(() => import("@/funcionalidades/lgpd/PaginaGestaoDados"));

// Autenticação
const PaginaAcesso = lazy(() =>
  import("@/funcionalidades/autenticacao/PaginaAcesso").then((m) => ({
    default: m.PaginaAcesso,
  })),
);

// 1. Geral
const PaginaInicial = lazy(() =>
  import("@/funcionalidades/geral/painel/pagina").then((m) => ({
    default: m.PaginaInicial,
  })),
);
const PaginaCalculadora = lazy(() =>
  import("@/funcionalidades/geral/calculadora/pagina").then((m) => ({
    default: m.PaginaCalculadora,
  })),
);
const PaginaOrcamentoPublico = lazy(() =>
  import("@/funcionalidades/geral/calculadora/PaginaOrcamentoPublico").then((m) => ({
    default: m.PaginaOrcamentoPublico,
  })),
);
const PaginaOrcamentoRedirecionamento = lazy(() =>
  import("@/funcionalidades/geral/calculadora/PaginaOrcamentoRedirecionamento").then((m) => ({
    default: m.PaginaOrcamentoRedirecionamento,
  })),
);
const PaginaDesperdicio = lazy(() =>
  import("@/funcionalidades/geral/desperdicio/pagina").then((m) => ({
    default: m.PaginaDesperdicio,
  })),
);

// 2. Produção
const PaginaProducao = lazy(() =>
  import("@/funcionalidades/producao/pagina").then((m) => ({
    default: m.PaginaProducao,
  })),
);

const PaginaImpressoras = lazy(() =>
  import("@/funcionalidades/producao/impressoras/pagina").then((m) => ({
    default: m.PaginaImpressoras,
  })),
);
const PaginaMateriais = lazy(() =>
  import("@/funcionalidades/producao/materiais/pagina").then((m) => ({
    default: m.PaginaMateriais,
  })),
);
const PaginaInsumos = lazy(() =>
  import("@/funcionalidades/producao/insumos/pagina").then((m) => ({
    default: m.PaginaInsumos,
  })),
);
const PaginaHistoricoProducao = lazy(() =>
  import("@/funcionalidades/producao/historico/pagina").then((m) => ({
    default: m.PaginaHistoricoProducao,
  })),
);
const PaginaManutencaoPreditiva = lazy(() =>
  import("@/funcionalidades/producao/manutencao/preditiva/pagina").then((m) => ({
    default: m.PaginaManutencaoPreditiva,
  })),
);

const PaginaRastreamento = lazy(() =>
  import("@/funcionalidades/producao/projetos/PaginaRastreamento").then((m) => ({
    default: m.PaginaRastreamento,
  })),
);

// 3. Comercial
const PaginaClientes = lazy(() =>
  import("@/funcionalidades/comercial/clientes/pagina").then((m) => ({
    default: m.PaginaClientes,
  })),
);
const PaginaFinanceiro = lazy(() =>
  import("@/funcionalidades/comercial/financeiro/pagina").then((m) => ({
    default: m.PaginaFinanceiro,
  })),
);

// 4. Sistema
const PaginaConfiguracoes = lazy(() =>
  import("@/funcionalidades/sistema/configuracoes/pagina").then((m) => ({ default: m.PaginaConfiguracoes })),
);
const PaginaAjuda = lazy(() =>
  import("@/funcionalidades/sistema/central-maker/pagina").then((m) => ({
    default: m.PaginaAjuda,
  })),
);
const PaginaAdmin = lazy(() =>
  import("@/funcionalidades/sistema/admin/PaginaAdmin").then((m) => ({
    default: m.PaginaAdmin,
  })),
);

export function RoteadorPrincipal() {
  return (
    <ProvedorAutenticacao>
      <ProvedorBeta>
        <ProvedorEstudio>
          <BrowserRouter>
            <ToasterPremium />
            <WidgetFeedbackBeta />
            <ScrollParaTopo />
            <Suspense fallback={<Carregamento />}>
              <Routes>
                <Route path="/" element={<PaginaLanding />} />
                <Route path="/seguranca-e-privacidade" element={<SegurancaPrivacidade />} />
                <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
                <Route path="/politica-de-cookies" element={<PoliticaCookies />} />
                <Route path="/termos-de-servico" element={<TermosServico />} />
                <Route path="/rastreamento/:idPedido" element={<PaginaRastreamento />} />
                <Route path="/orcamento" element={<PaginaOrcamentoPublico />} />
                <Route path="/o/:id" element={<PaginaOrcamentoRedirecionamento />} />

                {/* Autenticação */}
                <Route path="/autenticacao" element={<PaginaAcesso />} />
                <Route path="/login" element={<Navigate to="/autenticacao" replace />} />
                <Route path="/cadastro" element={<Navigate to="/autenticacao" replace />} />
                <Route path="/recuperar-senha" element={<Navigate to="/autenticacao" replace />} />

                {/* Aplicação Interna Protegida com Layout Persistente */}
                <Route
                  element={
                    <RotaProtegida>
                      <Layout />
                    </RotaProtegida>
                  }
                >
                  <Route path="/dashboard" element={<PaginaInicial />} />
                  <Route path="/calculadora" element={<PaginaCalculadora />} />
                  <Route path="/relatorios/desperdicio" element={<PaginaDesperdicio />} />
                  <Route path="/producao" element={<PaginaProducao />} />
                  <Route path="/impressoras" element={<PaginaImpressoras />} />
                  <Route path="/materiais" element={<PaginaMateriais />} />
                  <Route path="/insumos" element={<PaginaInsumos />} />
                  <Route path="/producao/historico" element={<PaginaHistoricoProducao />} />
                  <Route path="/producao/manutencao" element={<PaginaManutencaoPreditiva />} />
                  <Route path="/clientes" element={<PaginaClientes />} />
                  <Route path="/financeiro" element={<PaginaFinanceiro />} />
                  <Route path="/configuracoes" element={<PaginaConfiguracoes />} />
                  <Route path="/central-maker" element={<PaginaAjuda />} />
                  <Route path="/admin/gestao-fundadores" element={<PaginaAdmin />} />
                  <Route path="/meus-dados" element={<PaginaGestaoDados />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ProvedorEstudio>
      </ProvedorBeta>
    </ProvedorAutenticacao>
  );
}
