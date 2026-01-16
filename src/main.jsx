/* eslint-disable react-refresh/only-export-components */
import { StrictMode, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import GlobalSearch from "./components/GlobalSearch";
import ErrorBoundary from "./components/ErrorBoundary";
import Toast from "./components/Toast";

import "./styles/main.css";
import AppRoutes from "./routes/route";
import { configurarInterceptadoresAxios } from "./utils/api";

function ClerkAndAxiosGate({ children }) {
    const { getToken, isLoaded } = useAuth();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        async function init() {
            if (isLoaded) {
                // 1. Configura os interceptadores
                configurarInterceptadoresAxios(getToken);
                // 2. Avisa que o sistema está pronto (Axios + Auth ok)
                setReady(true);
            }
        }
        init();
    }, [isLoaded, getToken]);

    // Enquanto o Clerk não carregar OU o Axios não estiver interceptado,
    // seguramos o usuário no Loading Global.
    if (!isLoaded || !ready) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-950">
                <Loader2 className="animate-spin text-sky-500" size={40} />
            </div>
        );
    }

    return children;
}

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
            <ClerkAndAxiosGate>
                {/* O Suspense aqui é para os imports lazy() das páginas */}
                <Suspense fallback={
                    <div className="flex h-screen items-center justify-center bg-zinc-950">
                        <Loader2 className="animate-spin text-sky-500" size={40} />
                    </div>
                }>
                    <Toast />
                    <Router>
                        <ErrorBoundary>
                            <GlobalSearch />
                        </ErrorBoundary>
                        <AppRoutes />
                    </Router>
                </Suspense>
            </ClerkAndAxiosGate>
        </ClerkProvider>
    </StrictMode>
);