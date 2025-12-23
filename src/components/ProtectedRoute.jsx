import { useAuth } from "@clerk/clerk-react";
import { Route, Redirect } from "wouter";
import PageLoading from "./Loading"; // Importe seu loading aqui

const ProtectedRoute = ({ path, component: Component }) => {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <Route path={path}>
      {() => {
        // Se ainda está carregando o status do usuário, mostra o seu componente de Loading
        if (!isLoaded) return <PageLoading />;

        // Se não estiver logado, manda para a SUA página de login interna
        if (!isSignedIn) {
          return <Redirect to="/login" />;
        }

        // Se estiver logado, renderiza o componente
        return <Component />;
      }}
    </Route>
  );
};

export default ProtectedRoute;