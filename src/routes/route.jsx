import { lazy, Suspense } from "react"; // Importar Suspense aqui também
import { Switch, Route, Redirect } from "wouter";
import { useAuth } from "../contexts/AuthContext"; // Importar para proteção de rotas públicas
import { Loader2 } from "lucide-react";

import ProtectedRoute from "./protectedRoute";

// =======================================================
// LAZY PAGES
// =======================================================
const LandingPage = lazy(() => import("../pages/Publica/LandingPage"));
const Login = lazy(() => import("../pages/Publica/auth/Login"));
const Register = lazy(() => import("../pages/Publica/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/Publica/auth/forgotPassword"));
// const SSOCallback = lazy(() => import("../pages/Publica/auth/SSOCallback")); // REMOVED
const Dashboard = lazy(() => import("../pages/Principal/Dashboard.jsx"));
const Calculadora = lazy(() => import("../pages/Principal/Calculadora.jsx"));
const Projetos = lazy(() => import("../pages/Gestao/Projetos"));
const Materiais = lazy(() => import("../pages/Gestao/Materiais"));
const Insumos = lazy(() => import('../pages/Gestao/Insumos'));
const Impressoras = lazy(() => import("../pages/Gestao/Impressoras"));
const Configuracoes = lazy(() => import("../pages/Sistema/Configuracoes.jsx"));
const Financeiro = lazy(() => import("../pages/Gestao/Financeiro"));
const Clientes = lazy(() => import("../pages/Principal/Clientes"));
const Ajuda = lazy(() => import("../pages/Sistema/CentralMaker"));
const NotFound = lazy(() => import("../pages/Publica/NotFound"));
const PrivacyPolicy = lazy(() => import("../pages/Publica/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../pages/Publica/TermsOfService"));
const SecurityPrivacy = lazy(() => import("../pages/Publica/SecurityPrivacy"));

// Componente auxiliar para rotas que só podem ser vistas por quem NÃO está logado
function GuestRoute({ component: Component, ...props }) {
    const { isSignedIn, isLoaded } = useAuth();

    if (!isLoaded) return (
        <div className="flex h-screen items-center justify-center bg-zinc-950">
            <Loader2 className="animate-spin text-sky-500" size={40} />
        </div>
    );
    if (isSignedIn) return <Redirect to="/dashboard" />;

    return <Component {...props} />;
}

export default function AppRoutes() {
    return (
        // O Suspense aqui protege todas as rotas públicas contra o erro de carregamento lazy
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-zinc-950">
                <Loader2 className="animate-spin text-sky-500" size={40} />
            </div>
        }>
            <Switch>

                {/* ---------- PUBLIC ROUTES ---------- */}
                <Route path="/" component={LandingPage} />

                {/* Usamos GuestRoute para não deixar logado voltar pro Login */}
                <Route path="/login">
                    <GuestRoute component={Login} />
                </Route>
                <Route path="/register">
                    <GuestRoute component={Register} />
                </Route>

                <Route path="/forgot-password" component={ForgotPassword} />
                {/* <Route path="/sso-callback" component={SSOCallback} /> */}
                <Route path="/privacy-policy" component={PrivacyPolicy} />
                <Route path="/terms-of-service" component={TermsOfService} />
                <Route path="/security-privacy" component={SecurityPrivacy} />

                {/* ---------- PROTECTED ROUTES ---------- */}
                {/* O ProtectedRoute já possui seu próprio Suspense interno conforme a correção anterior */}
                <ProtectedRoute path="/dashboard" component={Dashboard} />
                <ProtectedRoute path="/calculadora" component={Calculadora} />
                <ProtectedRoute path="/projetos" component={Projetos} />
                <ProtectedRoute path="/materiais" component={Materiais} />
                <ProtectedRoute path="/insumos" component={Insumos} />
                <ProtectedRoute path="/impressoras" component={Impressoras} />
                <ProtectedRoute path="/configuracoes" component={Configuracoes} />
                <ProtectedRoute path="/financeiro" component={Financeiro} />
                <ProtectedRoute path="/clientes" component={Clientes} />
                <ProtectedRoute path="/central-maker" component={Ajuda} />

                {/* ---------- FALLBACK ---------- */}
                <Route component={NotFound} />

            </Switch>
        </Suspense>
    );
}
