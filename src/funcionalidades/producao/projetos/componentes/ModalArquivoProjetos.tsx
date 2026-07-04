import { Pedido } from "../tipos";
import { CartaoPedido } from "./CartaoPedido";
import { Archive, FolderKanban } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { ModalListagemPremium } from "@/compartilhado/componentes";
import { useVirtualizacao } from "@/compartilhado/hooks/useVirtualizacao";

interface PropriedadesModalArquivoProjetos {
  aberto: boolean;
  aoFechar: () => void;
  pedidos: Pedido[];
  abrirFormularioEdicao?: (id: string) => void;
}

/**
 * 🗄️ ModalArquivoProjetos - Histórico de Produção
 * Utiliza o padrão universal ModalListagemPremium.
 */
export function ModalArquivoProjetos({ aberto, aoFechar, pedidos, abrirFormularioEdicao }: PropriedadesModalArquivoProjetos) {
  const [busca, setBusca] = useState("");

  const pedidosArquivados = useMemo(() => {
    return pedidos.filter((p) => p.status === StatusPedido.ARQUIVADO);
  }, [pedidos]);

  const filtrados = useMemo(() => {
    if (!busca) return pedidosArquivados;
    const termo = busca.toLowerCase();
    return pedidosArquivados.filter(
      (p) => (p.descricao || "").toLowerCase().includes(termo) || (p.nomeCliente || "").toLowerCase().includes(termo),
    );
  }, [pedidosArquivados, busca]);

  const [colunas, setColunas] = useState(4);
  useEffect(() => {
    const calcularColunas = () => {
      const w = window.innerWidth;
      if (w < 768) return setColunas(1);
      if (w < 1024) return setColunas(2);
      if (w < 1280) return setColunas(3);
      return setColunas(4);
    };
    calcularColunas();
    window.addEventListener("resize", calcularColunas);
    return () => window.removeEventListener("resize", calcularColunas);
  }, []);

  const { containerRef, itensVisiveis, paddingTop, paddingBottom } = useVirtualizacao(
    filtrados,
    140, // Altura estimada do CartaoPedido
    colunas
  );

  return (
    <ModalListagemPremium
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Arquivo de Projetos"
      iconeTitulo={Archive}
      corDestaque="zinc"
      termoBusca={busca}
      aoMudarBusca={setBusca}
      placeholderBusca="PESQUISAR NO ARQUIVO..."
      temResultados={filtrados.length > 0}
      totalResultados={filtrados.length}
      iconeVazio={FolderKanban}
      mensagemVazio="Pedidos concluídos há mais de 7 dias serão movidos automaticamente para cá."
      infoRodape="* O arquivamento ocorre automaticamente após 7 dias de conclusão."
    >
      <div 
        ref={containerRef}
        className="max-h-[60vh] overflow-y-auto pr-2 scrollbar-premium"
        style={{ contentVisibility: 'auto' }}
      >
        <div 
          style={{
            paddingTop: `${paddingTop}px`,
            paddingBottom: `${paddingBottom}px`,
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {itensVisiveis.map((p) => (
            <CartaoPedido key={p.id} pedido={p} abrirFormularioEdicao={abrirFormularioEdicao} />
          ))}
        </div>
      </div>
    </ModalListagemPremium>
  );
}
