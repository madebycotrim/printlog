import { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { useAuth } from "@clerk/clerk-react";

import ProtectedRoute from "./protectedRoute";
import PageLoading from "../components/Loading";

// =======================================================
// LAZY PAGES (Code Splitting para performance)
// =======================================================
const LandingPage = lazy(() => import("../pages/landingPage"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/forgotPassword"));
const SSOCallback = lazy(() => import("../pages/auth/SSOCallback"));
const CalculadoraPreview = lazy(() => import("../pages/calculadoraPreview"));
const Dashboard = lazy(() => import("../pages/dashboard"));
const Calculadora = lazy(() => import("../pages/calculadora"));
const Orcamentos = lazy(() => import("../pages/orcamentos"));
const Filamentos = lazy(() => import("../pages/filamentos"));
const Impressoras = lazy(() => import("../pages/impressoras"));
const Configuracoes = lazy(() => import("../pages/configuracoes.jsx"));
const Ajuda = lazy(() => import("../pages/centralMaker"));
const NotFound = lazy(() => import("../pages/notFound"));

/**
 * GuestRoute: Protege rotas que NÃO devem ser acessadas por usuários logados.
 * Exemplo: Se o usuário já está logado, ele não deve ver a página de Login.
 */
function GuestRoute({ component: Component, ...props }) {
    const { isSignedIn, isLoaded } = useAuth();
    
    // Aguarda o Clerk carregar o estado da sessão
    if (!isLoaded) return <PageLoading />;
    
    // Se já estiver logado, redireciona para o dashboard imediatamente
    if (isSignedIn) return <Redirect to="/dashboard" />;
    
    return <Component {...props} />;
}

export default function AppRoutes() {
    return (
        // O Suspense principal captura o carregamento inicial dos arquivos JS (lazy)
        <Suspense fallback={<PageLoading />}>
            <Switch>

                {/* ---------- ROTAS PÚBLICAS ---------- */}
                <Route path="/" component={LandingPage} />
                
                {/* 
                    GuestRoutes: Redirecionam para o Dashboard se o usuário 
                    já possuir uma sessão ativa no navegador.
                */}
                <Route path="/login">
                    {(params) => <GuestRoute component={Login} {...params} />}
                </Route>
                
                <Route path="/register">
                    {(params) => <GuestRoute component={Register} {...params} />}
                </Route>
                
                <Route path="/forgot-password" component={ForgotPassword} />
                <Route path="/sso-callback" component={SSOCallback} />
                <Route path="/preview" component={CalculadoraPreview} />

                {/* ---------- ROTAS PROTEGIDAS (AUTH REQUIRED) ---------- */}
                {/* 
                    ProtectedRoute já injeta o userData e possui seu próprio Suspense
                    interno para lidar com o processamento dos dados do usuário.
                */}
                <ProtectedRoute path="/dashboard" component={Dashboard} />
                <ProtectedRoute path="/calculadora" component={Calculadora} />
                <ProtectedRoute path="/orcamentos" component={Orcamentos} />
                <ProtectedRoute path="/filamentos" component={Filamentos} />
                <ProtectedRoute path="/impressoras" component={Impressoras} />
                <ProtectedRoute path="/configuracoes" component={Configuracoes} />
                <ProtectedRoute path="/central-maker" component={Ajuda} />

                {/* ---------- FALLBACK (404) ---------- */}
                <Route component={NotFound} />

            </Switch>
        </Suspense>
    );
}