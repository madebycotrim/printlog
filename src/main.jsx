import { StrictMode, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";

import "./main.css";
import AppRoutes from "./routes/route";
import { setupAxiosInterceptors } from "./utils/api";
import PageLoading from "./components/Loading"; // Importe o componente aqui

function AxiosInitializer({ children }) {
    const { getToken } = useAuth();
    useEffect(() => { 
        setupAxiosInterceptors(getToken); 
    }, [getToken]);
    return children;
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
            <AxiosInitializer>
                {/* O fallback agora utiliza o componente PageLoading estilizado */}
                <Suspense fallback={<PageLoading />}>
                    <Router>
                        <AppRoutes />
                    </Router>
                </Suspense>
            </AxiosInitializer>
        </ClerkProvider>
    </StrictMode>
);