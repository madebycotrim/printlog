import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/compartilhado/componentes/Layout";
import { RotaProtegida } from "@/configuracoes/rotas-protegidas";
import { ScrollParaTopo } from "@/compartilhado/utilitarios/ScrollParaTopo";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";
import { ProvedorAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { ProvedorEstudio } from "@/funcionalidades/beta/multi_estudos/contextos/ContextoEstudio";
import { ProvedorBeta } from "@/compartilhado/contextos/ContextoBeta";

// Landing Page Publica
const PaginaLanding = lazy(() =>
  import("@/funcionalidades/landing_page/PaginaLanding").then((m) => ({
    default: m.PaginaLanding,
  })),
);
const SegurancaPrivacidade = lazy(() =>
  import("@/funcionalidades/landing_page/seguranca-e-privacidade").then((m) => ({
    default: m.SegurancaPrivacidade,
  })),
);
const PoliticaPrivacidade = lazy(() =>
  import("@/funcionalidades/landing_page/politica-de-privacidade").then((m) => ({
    default: m.PoliticaPrivacidade,
  })),
);
const TermosUso = lazy(() =>
  import("@/funcionalidades/landing_page/termos-de-uso").then((m) => ({
    default: m.TermosUso,
  })),
);

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

export function RoteadorPrincipal() {
  return (
    <ProvedorAutenticacao>
      <ProvedorBeta>
        <ProvedorEstudio>
          <BrowserRouter>
            <ScrollParaTopo />
            <Suspense fallback={<Carregamento />}>
              <Routes>
                <Route path="/" element={<PaginaLanding />} />
                <Route path="/seguranca-e-privacidade" element={<SegurancaPrivacidade />} />
                <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
                <Route path="/termos-de-uso" element={<TermosUso />} />

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
                <Route
                  path="/projetos"
                  element={
                    <RotaProtegida>
                      <Layout>
                        <PaginaProjetos />
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
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ProvedorEstudio>
      </ProvedorBeta>
    </ProvedorAutenticacao>
  );
}
