import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { Router, Switch, Route } from "wouter";
import { ClerkProvider } from "@clerk/clerk-react"; // 1. Importar o Provider
import "./main.css";

import ProtectedRoute from "./components/ProtectedRoute";

// Chave do Clerk
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const PageLoading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#050506]">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-sky-500" />
  </div>
);

const LandingPage = lazy(() => import("./pages/landingPage"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/forgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CalculadoraPage = lazy(() => import("./pages/Calculadora"));
const Filamentos = lazy(() => import("./pages/Filamentos"));
const Impressoras = lazy(() => import("./pages/Impressoras"));
const CalculadoraFree = lazy(() => import("./pages/calculadoraFree"));
const NotFound = lazy(() => import("./pages/NotFound"));

const SSOCallback = lazy(() => import("./components/sso-callback"));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 2. Envolver tudo com o ClerkProvider */}
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Suspense fallback={<PageLoading />}>
        <Router>
          <Switch>
            {/* ROTAS PÚBLICAS */}
            <Route path="/" component={LandingPage} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/sso-callback" component={SSOCallback} />
            <Route path="/preview" component={CalculadoraFree} />

            {/* ROTAS PROTEGIDAS */}
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/calculadora" component={CalculadoraPage} />
            <ProtectedRoute path="/filamentos" component={Filamentos} />
            <ProtectedRoute path="/impressoras" component={Impressoras} />

            <Route component={NotFound} />
          </Switch>
        </Router>
      </Suspense>
    </ClerkProvider>
  </StrictMode>
);