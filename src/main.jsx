import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { Router, Switch, Route } from "wouter";
import { ClerkProvider } from "@clerk/clerk-react";

import "./main.css";
import PageLoading from "./components/Loading";
import ProtectedRoute from "./components/ProtectedRoute";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("VITE_CLERK_PUBLISHABLE_KEY is missing");
}

// Pages (Lazy Load)
const LandingPage = lazy(() => import("./pages/landingPage"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/forgotPassword"));
const SSOCallback = lazy(() => import("./components/sso-callback"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CalculadoraPage = lazy(() => import("./pages/Calculadora"));
const Filamentos = lazy(() => import("./pages/Filamentos"));
const Impressoras = lazy(() => import("./pages/Impressoras"));
const Historico = lazy(() => import("./pages/Historico"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Ajuda = lazy(() => import("./pages/centralMaker"));
const CalculadoraPreview = lazy(() => import("./pages/calculadoraPreview"));
const NotFound = lazy(() => import("./pages/NotFound"));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* ClerkProvider deve envolver tudo para prover o contexto de auth */}
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      {/* Suspense envolve as rotas para lidar com os imports lazy() */}
      <Suspense fallback={<PageLoading />}>
        <Router>
          <Switch>
            {/* ROTAS PÚBLICAS */}
            <Route path="/" component={LandingPage} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/sso-callback" component={SSOCallback} />
            <Route path="/preview" component={CalculadoraPreview} />

            {/* ROTAS PROTEGIDAS (Redirecionam para /login se deslogado) */}
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/calculadora" component={CalculadoraPage} />
            <ProtectedRoute path="/historico" component={Historico} />
            <ProtectedRoute path="/filamentos" component={Filamentos} />
            <ProtectedRoute path="/impressoras" component={Impressoras} />
            <ProtectedRoute path="/configuracoes" component={Configuracoes} />
            <ProtectedRoute path="/central-maker" component={Ajuda} />

            {/* FALLBACK */}
            <Route component={NotFound} />
          </Switch>
        </Router>
      </Suspense>
    </ClerkProvider>
  </StrictMode>
);