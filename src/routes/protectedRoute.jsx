import { useAuth, useSession } from "@clerk/clerk-react";
import { Route, Redirect } from "wouter";
import PageLoading from "../components/Loading";

export default function ProtectedRoute({ path, component: Component }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { session } = useSession(); // Puxa a sessão ativa

  return (
    <Route path={path}>
      {() => {
        if (!isLoaded) return <PageLoading />;

        if (!isSignedIn) return <Redirect to="/login" />;

        // Aqui estão os dados que você configurou no dashboard!
        const userClaims = session?.lastActiveToken?.claims;

        // Agora você pode passar o objeto inteiro ou partes dele para suas páginas
        return (
          <Component 
            user={{
              id: userClaims?.id,
              email: userClaims?.email,
              name: userClaims?.firstName,
              role: userClaims?.publicMetadata?.role // Exemplo de uso de role
            }} 
          />
        );
      }}
    </Route>
  );
};