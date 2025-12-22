// src/components/ProtectedRoute.jsx
import { useAuth } from "@clerk/clerk-react";
import { Route, Redirect } from "wouter";

const ProtectedRoute = ({ path, component: Component }) => {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <Route path={path}>
      {() => {
        // Se ainda está carregando o status do usuário, mostra nada ou um loader
        if (!isLoaded) return null; 

        // Se não estiver logado, redireciona para o login
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