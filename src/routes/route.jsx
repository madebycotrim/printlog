import { lazy } from "react";
import { Switch, Route } from "wouter";

import ProtectedRoute from "./protectedRoute";

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
const Orcamentos = lazy(() => import("../pages/orcamentos"));
const Filamentos = lazy(() => import("../pages/filamentos"));
const Impressoras = lazy(() => import("../pages/impressoras"));


const Configuracoes = lazy(() => import("../pages/configuracoes.jsx"));
const Ajuda = lazy(() => import("../pages/centralMaker"));

const NotFound = lazy(() => import("../pages/notFound"));

// =======================================================
// ROUTES
// =======================================================
export default function AppRoutes() {
    return (
        <Switch>

            {/* ---------- PUBLIC ROUTES ---------- */}
            <Route path="/" component={LandingPage} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/sso-callback" component={SSOCallback} />
            <Route path="/preview" component={CalculadoraPreview} />

            {/* ---------- PROTECTED ROUTES ---------- */}

            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/calculadora" component={Calculadora} />
            <ProtectedRoute path="/orcamentos" component={Orcamentos} />
            <ProtectedRoute path="/filamentos" component={Filamentos} />
            <ProtectedRoute path="/impressoras" component={Impressoras} />
            <ProtectedRoute path="/configuracoes" component={Configuracoes} />
            <ProtectedRoute path="/central-maker" component={Ajuda} />

            {/* ---------- FALLBACK ---------- */}
            <Route component={NotFound} />

        </Switch>
    );
}
