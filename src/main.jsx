/* eslint-disable react-refresh/only-export-components */
import { StrictMode, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
// import { ClerkProvider, useAuth } from "@clerk/clerk-react"; // REMOVED
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Loader2 } from "lucide-react";
import GlobalSearch from "./components/GlobalSearch";
import ErrorBoundary from "./components/ErrorBoundary";
import Toast from "./components/Toast";

import "./styles/main.css";
import AppRoutes from "./routes/route";
import { configurarInterceptadoresAxios } from "./utils/api";


function AuthAndAxiosGate({ children }) {
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

    // Enquanto o Auth não carregar OU o Axios não estiver interceptado,
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

// React Query Setup
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos
            refetchOnWindowFocus: false,
            retry: 1
        }
    }
});

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <AuthAndAxiosGate>
                    {/* O Suspense aqui é para os imports lazy() das páginas */}
                    <Suspense fallback={
                        <div className="flex h-screen items-center justify-center bg-zinc-950">
                            <Loader2 className="animate-spin text-sky-500" size={40} />
                        </div>
                    }>
                        <Toast />
                        <Router>
                            <ErrorBoundary
                                title="Erro na Busca Global"
                                message="A pesquisa encontrou um problema."
                                className="fixed bottom-4 right-4 z-[9999] w-80 bg-zinc-900 border-zinc-800 shadow-2xl"
                            >
                                <GlobalSearch />
                            </ErrorBoundary>
                            <AppRoutes />
                        </Router>
                    </Suspense>
                </AuthAndAxiosGate>
            </QueryClientProvider>
        </AuthProvider>
    </StrictMode>
);