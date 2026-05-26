import { Navigate } from "react-router-dom";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { Carregamento } from "@/compartilhado/componentes";

interface RotaProtegidaProps {
  children: React.ReactNode;
}

export function RotaProtegida({ children }: RotaProtegidaProps) {
  const { usuario, carregando } = useAutenticacao();

  if (carregando) {
    return <Carregamento texto="Verificando Acesso..." />;
  }

  if (!usuario) {
    return <Navigate to="/autenticacao" state={{ from: window.location.pathname + window.location.search }} replace />;
  }

  return <>{children}</>;
}
