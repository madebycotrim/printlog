import { lazy, Suspense } from "react"; // Importar Suspense aqui também
import { Switch, Route, Redirect } from "wouter";
import { useAuth } from "@clerk/clerk-react"; // Importar para proteção de rotas públicas

import ProtectedRoute from "./protectedRoute";
import PageLoading from "../components/Loading";

// =======================================================
// LAZY PAGES
// =======================================================
const LandingPage = lazy(() => import("../pages/landingPage"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/forgotPassword"));
const SSOCallback = lazy(() => import("../pages/auth/SSOCallback"));
const CalculadoraPreview = lazy(() => import("../pages/calculadoraPreview"));
const Dashboard = lazy(() => import("../pages/dashboard"));
const Calculadora = lazy(() => import("../pages/calculadora"));
const Projetos = lazy(() => import("../pages/projetos"));
const Filamentos = lazy(() => import("../pages/filamentos"));
const Impressoras = lazy(() => import("../pages/impressoras"));
const Configuracoes = lazy(() => import("../pages/configuracoes.jsx"));
const Ajuda = lazy(() => import("../pages/centralMaker"));
const NotFound = lazy(() => import("../pages/notFound"));

// Componente auxiliar para rotas que só podem ser vistas por quem NÃO está logado
function GuestRoute({ component: Component, ...props }) {
    const { isSignedIn, isLoaded } = useAuth();
    
    if (!isLoaded) return <PageLoading />;
    if (isSignedIn) return <Redirect to="/dashboard" />;
    
    return <Component {...props} />;
}

export default function AppRoutes() {
    return (
        // O Suspense aqui protege todas as rotas públicas contra o erro de carregamento lazy
        <Suspense fallback={<PageLoading />}>
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
                <Route path="/sso-callback" component={SSOCallback} />
                <Route path="/preview" component={CalculadoraPreview} />

                {/* ---------- PROTECTED ROUTES ---------- */}
                {/* O ProtectedRoute já possui seu próprio Suspense interno conforme a correção anterior */}
                <ProtectedRoute path="/dashboard" component={Dashboard} />
                <ProtectedRoute path="/calculadora" component={Calculadora} />
                <ProtectedRoute path="/projetos" component={Projetos} />
                <ProtectedRoute path="/filamentos" component={Filamentos} />
                <ProtectedRoute path="/impressoras" component={Impressoras} />
                <ProtectedRoute path="/configuracoes" component={Configuracoes} />
                <ProtectedRoute path="/central-maker" component={Ajuda} />

                {/* ---------- FALLBACK ---------- */}
                <Route component={NotFound} />

            </Switch>
        </Suspense>
    );
}