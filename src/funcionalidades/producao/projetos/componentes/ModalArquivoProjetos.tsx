import { Pedido } from "../tipos";
import { CartaoPedido } from "./CartaoPedido";
import { Archive, FolderKanban } from "lucide-react";
import { useState, useMemo } from "react";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { ModalListagemPremium } from "@/compartilhado/componentes";

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
      (p) => p.descricao.toLowerCase().includes(termo) || p.nomeCliente?.toLowerCase().includes(termo),
    );
  }, [pedidosArquivados, busca]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtrados.map((p) => (
          <CartaoPedido key={p.id} pedido={p} abrirFormularioEdicao={abrirFormularioEdicao} />
        ))}
      </div>
    </ModalListagemPremium>
  );
}
