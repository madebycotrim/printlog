import { useAuth, useUser } from "@clerk/clerk-react";
import { Route, Redirect, useLocation } from "wouter";
import { Suspense, useMemo } from "react";
import PageLoading from "../components/Loading";

export default function ProtectedRoute({ path, component: Component }) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const [location] = useLocation();

  // 1. Memoizamos o userData para garantir estabilidade de referência.
  // Isso evita que o Sidebar ou Header fiquem piscando/re-renderizando.
  const userData = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || "",
      name: user.firstName || user.username || "Maker",
      role: user.publicMetadata?.role || "user", // Útil para esconder botões de admin
      imageUrl: user.imageUrl,
    };
  }, [user]);

  // Enquanto o Clerk carrega, mantemos o estado de Loading.
  // Como o ClerkAndAxiosGate já roda no main.jsx, este estado será breve.
  if (!authLoaded || !userLoaded) {
    return (
      <Route path={path}>
        <PageLoading />
      </Route>
    );
  }

  return (
    <Route path={path}>
      {() => {
        // Se não estiver logado, redireciona para o login salvando a rota atual
        if (!isSignedIn) {
          // Implementação da Dica: Passamos a URL atual para o login
          // No componente de Login, você pode capturar isso com: 
          // const [location] = useLocation(); const redirect = new URLSearchParams(window.location.search).get("redirect");
          return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
        }

        return (
          <Suspense fallback={<PageLoading />}>
            {/* 
               Injetamos o userData. Assim, em qualquer página protegida,
               você pode fazer: export default function Dashboard({ user }) { ... }
            */}
            <Component user={userData} />
          </Suspense>
        );
      }}
    </Route>
  );
}