/* eslint-disable react-refresh/only-export-components */
import { StrictMode, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";

import "./styles/main.css";
import AppRoutes from "./routes/route";
import { configurarInterceptadoresAxios } from "./utils/api";
import PageLoading from "./components/Loading";

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
        return <PageLoading />;
    }

    return children;
}

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
            <ClerkAndAxiosGate>
                {/* O Suspense aqui é para os imports lazy() das páginas */}
                <Suspense fallback={<PageLoading />}>
                    <Router>
                        <AppRoutes />
                    </Router>
                </Suspense>
            </ClerkAndAxiosGate>
        </ClerkProvider>
    </StrictMode>
);