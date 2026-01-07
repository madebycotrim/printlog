import { StrictMode, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ptBR } from "@clerk/localizations"; // Opcional: Traduz componentes do Clerk

import "./main.css";
import AppRoutes from "./routes/route";
import { setupAxiosInterceptors } from "./utils/api";
import PageLoading from "./components/Loading";

// 1. Validação de Segurança da Chave
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
    throw new Error("Erro Crítico: VITE_CLERK_PUBLISHABLE_KEY não encontrada no arquivo .env");
}

/**
 * ClerkAndAxiosGate
 * Garante que a aplicação só renderize após:
 * 1. O Clerk carregar o estado da sessão.
 * 2. O Axios configurar os interceptores com a função de token atualizada.
 */
function ClerkAndAxiosGate({ children }) {
    const { getToken, signOut, isLoaded } = useAuth();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function init() {
            if (isLoaded) {
                try {
                    // Inicializa os interceptores passando getToken e signOut.
                    // O signOut permite que o Axios deslogue o usuário em caso de erro 401.
                    setupAxiosInterceptors(getToken, signOut);

                    if (isMounted) setReady(true);
                } catch (error) {
                    console.error("Falha ao inicializar protocolos de API:", error);
                }
            }
        }

        init();

        return () => { isMounted = false; };
    }, [isLoaded, getToken, signOut]);

    // Exibe o Loading Global enquanto o sistema de autenticação e API se preparam
    if (!isLoaded || !ready) {
        return <PageLoading />;
    }

    return children;
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} localization={ptBR}>
            <ClerkAndAxiosGate>
                <Suspense fallback={<PageLoading />}>
                    <Router>
                        <AppRoutes />
                    </Router>
                </Suspense>
            </ClerkAndAxiosGate>
        </ClerkProvider>
    </StrictMode>
);