import { FolderKanban, AlertTriangle, Plus, Archive } from "lucide-react";
import { CardResumo } from "@/compartilhado/componentes";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { Pedido } from "../tipos";
import { filtrarPedidosAtrasados } from "@/compartilhado/utilitarios/gestaoAtrasos";

interface ResumoProjetosProps {
  pedidos: Pedido[];
  aoAbrirArquivo: () => void;
  aoAbrirAtrasados: () => void;
}

export function ResumoProjetos({ pedidos, aoAbrirArquivo, aoAbrirAtrasados }: ResumoProjetosProps) {
  const pedidosAtivos = pedidos.filter(
    (p) => p.status !== StatusPedido.CONCLUIDO && p.status !== StatusPedido.ARQUIVADO,
  ).length;

  const pedidosAtrasados = filtrarPedidosAtrasados(pedidos).length;
  
  const concluidosHoje = pedidos.filter(
    (p) =>
      p.status === StatusPedido.CONCLUIDO &&
      p.dataConclusao &&
      new Date(p.dataConclusao).toDateString() === new Date().toDateString(),
  ).length;

  const pedidosArquivadosTotal = pedidos.filter((p) => p.status === StatusPedido.ARQUIVADO).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 shrink-0">
      <CardResumo
        titulo="Pedidos Ativos"
        valor={pedidosAtivos}
        unidade="em fluxo"
        icone={FolderKanban}
        cor="indigo"
      />
      
      <CardResumo
        titulo="Atrasados"
        valor={pedidosAtrasados}
        unidade="atenção"
        icone={AlertTriangle}
        cor="rose"
        aoClicar={aoAbrirAtrasados}
        textoAcao="Resolver"
      />

      <CardResumo
        titulo="Concluídos Hoje"
        valor={concluidosHoje}
        unidade="entregues"
        icone={Plus}
        cor="emerald"
      />

      <CardResumo
        titulo="Projetos Arquivados"
        valor={pedidosArquivadosTotal}
        unidade="no arquivo"
        icone={Archive}
        cor="zinc"
        aoClicar={aoAbrirArquivo}
        textoAcao="Ver tudo"
      />
    </div>
  );
}
