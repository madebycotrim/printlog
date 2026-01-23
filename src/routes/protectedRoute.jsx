import { useAuth, useUser } from "../contexts/AuthContext";
import { Route, Redirect, useLocation } from "wouter";
import { Suspense, useEffect } from "react";
import { saveRedirectUrl } from "../utils/auth";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "../components/ErrorBoundary";

export default function ProtectedRoute({ path, component: Component }) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const [location, setLocation] = useLocation();

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

  // Se o Auth ainda estiver carregando a sessão, mostra loading
  if (!authLoaded) {
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

        // Se estiver logado mas o usuário ainda não carregou, mostra loader
        if (!userLoaded && !user) {
          return <SimpleLoader />;
        }

        // Prepara os dados do usuário de forma segura
        const userData = {
          id: user?.id || "",
          email: user?.email || "",
          name: user?.firstName || user?.username || "Maker",
          role: user?.publicMetadata?.role || "user",
        };

        // Renderização com Suspense para Lazy loading
        return (
          <Suspense fallback={<SimpleLoader />}>
            <ErrorBoundary
              title="Erro na Página"
              message="Ocorreu um erro crítico ao carregar esta tela. Tente recarregar."
              className="h-screen w-full flex flex-col items-center justify-center p-8 bg-zinc-950/80"
              onBack={() => setLocation('/dashboard')}
              backLabel="Voltar ao Início"
            >
              <Component user={userData} />
            </ErrorBoundary>
          </Suspense>
        );
      }}
    </Route>
  );
}