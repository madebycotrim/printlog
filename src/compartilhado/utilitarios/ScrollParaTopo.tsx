import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Componente utilitário que reseta o scroll para o topo em cada mudança de rota.
 * Implementa exceções para permitir scroll direcionado via query params.
 */
export function ScrollParaTopo() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        // Exceção: Se houver indicação de seção específica (?secao=), 
        // deixamos o componente de destino lidar com o scroll direcionado.
        const params = new URLSearchParams(search);
        if (params.has("secao")) return;

        // Reset padrão para o topo
        window.scrollTo(0, 0);
    }, [pathname, search]);

    return null;
}
