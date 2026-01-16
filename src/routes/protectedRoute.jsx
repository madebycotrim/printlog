import { useAuth, useUser } from "@clerk/clerk-react";
import { Route, Redirect, useLocation } from "wouter";
import { Suspense, useEffect } from "react";
import { saveRedirectUrl } from "../utils/auth";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "../components/ErrorBoundary";

export default function ProtectedRoute({ path, component: Component }) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const [location] = useLocation();

  // Salvar URL se não estiver logado
  useEffect(() => {
    if (authLoaded && !isSignedIn) {
      saveRedirectUrl(location);
    }
  }, [authLoaded, isSignedIn, location]);

  const SimpleLoader = () => (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="animate-spin text-sky-500" size={40} />
    </div>
  );

  // Se o Clerk ainda estiver carregando a sessão, mostra loading
  if (!authLoaded || !userLoaded) {
    return (
      <Route path={path}>
        <SimpleLoader />
      </Route>
    );
  }

  return (
    <Route path={path}>
      {() => {
        // Se não estiver logado, redireciona para o login
        if (!isSignedIn) {
          // O useEffect já salvou o redirect
          return <Redirect to="/login" />;
        }

        // Prepara os dados do usuário de forma segura
        const userData = {
          id: user?.id || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
          name: user?.firstName || user?.username || "Maker",
          role: user?.publicMetadata?.role || "user",
        };

        // Renderização com Suspense para Lazy loading
        return (
          <Suspense fallback={<SimpleLoader />}>
            <ErrorBoundary>
              <Component user={userData} />
            </ErrorBoundary>
          </Suspense>
        );
      }}
    </Route>
  );
}