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
import { AvisoCookies } from "@/funcionalidades/lgpd/componentes/AvisoCookies";

// Landing Page Publica
const PaginaLanding = lazy(() => import("@/funcionalidades/landing_page/PaginaLanding"));
const SegurancaPrivacidade = lazy(() => import("@/funcionalidades/landing_page/seguranca-e-privacidade"));
const PoliticaPrivacidade = lazy(() => import("@/funcionalidades/lgpd/PaginaPoliticaPrivacidade"));
const TermosServico = lazy(() => import("@/funcionalidades/lgpd/PaginaTermosUso"));
const PaginaGestaoDados = lazy(() => import("@/funcionalidades/lgpd/PaginaGestaoDados"));

// Autenticação
const PaginaAcesso = lazy(() =>
  import("@/funcionalidades/autenticacao/PaginaAcesso").then((m) => ({
    default: m.PaginaAcesso,
  })),
);
const PaginaCadastro = lazy(() =>
  import("@/funcionalidades/autenticacao/PaginaCadastro").then((m) => ({
    default: m.PaginaCadastro,
  })),
);
const PaginaRecuperacaoSenha = lazy(() =>
  import("@/funcionalidades/autenticacao/PaginaRecuperacaoSenha").then((m) => ({
    default: m.PaginaRecuperacaoSenha,
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
const PaginaProjetos = lazy(() =>
  import("@/funcionalidades/producao/projetos/pagina").then((m) => ({
    default: m.PaginaProjetos,
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
const PaginaFila = lazy(() =>
  import("@/funcionalidades/producao/fila/pagina").then((m) => ({
    default: m.PaginaFila,
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
            <AvisoCookies />
            <Suspense fallback={<Carregamento />}>
              <Routes>
                <Route path="/" element={<PaginaLanding />} />
                <Route path="/seguranca-e-privacidade" element={<SegurancaPrivacidade />} />
                <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
                <Route path="/termos-de-servico" element={<TermosServico />} />
                <Route path="/rastreamento/:idPedido" element={<PaginaRastreamento />} />

                {/* Autenticação */}
                <Route path="/login" element={<PaginaAcesso />} />
                <Route path="/cadastro" element={<PaginaCadastro />} />
                <Route path="/recuperar-senha" element={<PaginaRecuperacaoSenha />} />

                {/* Aplicação Interna Protegida */}
                {/* 1. GERAL */}
                <Route
                  path="/dashboard"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaInicial />
                      </Layout>
                    </RotaProtegida>
                  }
                />
                <Route
                  path="/calculadora"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaCalculadora />
                      </Layout>
                    </RotaProtegida>
                  }
                />
                <Route
                  path="/relatorios/desperdicio"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaDesperdicio />
                      </Layout>
                    </RotaProtegida>
                  }
                />

                {/* 2. PRODUÇÃO */}
                <Route path="/projetos" element={<Navigate to="/producao" replace />} />
                <Route
                  path="/producao"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaProducao />
                      </Layout>
                    </RotaProtegida>
                  }
                />
                <Route
                  path="/impressoras"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaImpressoras />
                      </Layout>
                    </RotaProtegida>
                  }
                />
                <Route
                  path="/materiais"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaMateriais />
                      </Layout>
                    </RotaProtegida>
                  }
                />
                <Route
                  path="/insumos"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaInsumos />
                      </Layout>
                    </RotaProtegida>
                  }
                />
                <Route
                  path="/producao/historico"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaHistoricoProducao />
                      </Layout>
                    </RotaProtegida>
                  }
                />
                <Route
                  path="/producao/manutencao"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaManutencaoPreditiva />
                      </Layout>
                    </RotaProtegida>
                  }
                />
                <Route path="/producao/fila" element={<Navigate to="/producao?aba=fila" replace />} />

                {/* 3. COMERCIAL */}
                <Route
                  path="/clientes"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaClientes />
                      </Layout>
                    </RotaProtegida>
                  }
                />
                <Route
                  path="/financeiro"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaFinanceiro />
                      </Layout>
                    </RotaProtegida>
                  }
                />

                {/* 4. SISTEMA */}
                <Route
                  path="/configuracoes"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaConfiguracoes />
                      </Layout>
                    </RotaProtegida>
                  }
                />
                <Route
                  path="/central-maker"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaAjuda />
                      </Layout>
                    </RotaProtegida>
                  }
                />
                <Route
                  path="/admin/gestao-fundadores"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaAdmin />
                      </Layout>
                    </RotaProtegida>
                  }
                />
                <Route
                  path="/meus-dados"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaGestaoDados />
                      </Layout>
                    </RotaProtegida>
                  }
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ProvedorEstudio>
      </ProvedorBeta>
    </ProvedorAutenticacao>
  );
}
