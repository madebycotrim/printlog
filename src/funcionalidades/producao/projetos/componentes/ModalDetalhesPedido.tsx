import { Pedido } from "../tipos";
import { Dialogo } from "@/compartilhado/componentes";
import { 
  Settings, Box, FileText, Cpu
} from "lucide-react";

import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { useMemo, useState, useEffect } from "react";
import { useGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/useGerenciadorImpressoras";
import { CabecalhoModalPremium } from "@/compartilhado/componentes/ui";
import { AbasModalPremium } from "@/compartilhado/componentes/ui";
import { motion, AnimatePresence } from "framer-motion";
import { AbaEspecificacoesProjeto } from "./AbaEspecificacoesProjeto";
import { AbaCustosProjeto } from "./AbaCustosProjeto";
import { AbaWorkflowProjeto } from "./AbaWorkflowProjeto";

interface PropriedadesModalDetalhes {
  aberto: boolean;
  aoFechar: () => void;
  pedido: Pedido | null;
}

export function ModalDetalhesPedido({ aberto, aoFechar, pedido }: PropriedadesModalDetalhes) {
  const { estado: estadoImpressoras } = useGerenciadorImpressoras();
  const [abaAtiva, setAbaAtiva] = useState<string>("espec");

  useEffect(() => {
    if (aberto) {
      setAbaAtiva("espec");
    }
  }, [aberto, pedido]);

  const impressora = useMemo(() => {
    if (!pedido || !estadoImpressoras.impressoras) return null;
    return estadoImpressoras.impressoras.find(i => i.id === pedido.idImpressora) || null;
  }, [pedido, estadoImpressoras.impressoras]);

  const configStatus = useMemo(() => {
    if (!pedido) return { cor: "zinc", label: "Pendente", bg: "bg-zinc-500/10", text: "text-zinc-500" };
    switch (pedido.status) {
      case StatusPedido.A_FAZER:
        return { cor: "amber-500", label: "A Fazer", bg: "bg-amber-500/10", text: "text-amber-500" };
      case StatusPedido.EM_PRODUCAO:
        return { cor: "indigo-500", label: "Produzindo", bg: "bg-indigo-500/10", text: "text-indigo-500" };
      case StatusPedido.ACABAMENTO:
        return { cor: "sky-500", label: "Acabamento", bg: "bg-sky-500/10", text: "text-sky-500" };
      case StatusPedido.CONCLUIDO:
        return { cor: "emerald-500", label: "Concluído", bg: "bg-emerald-500/10", text: "text-emerald-500" };
      default:
        return { cor: "zinc-500", label: "Pendente", bg: "bg-zinc-500/10", text: "text-zinc-500" };
    }
  }, [pedido]);

  if (!pedido) return null;

  const abas = [
    { id: "espec", rotulo: "Especificações", icone: FileText },
    { id: "custos", rotulo: "Consumos e Custos", icone: Settings },
    { id: "workflow", rotulo: "Fila de Produção", icone: Box },
  ];

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      larguraMax="max-w-4xl"
      esconderCabecalho={true}
    >
      <div className="bg-white dark:bg-[#121214] min-h-[650px] flex flex-col overflow-hidden rounded-2xl shadow-2xl">
        
        {/* Cabeçalho Premium Unificado */}
        <CabecalhoModalPremium 
          titulo={pedido.descricao}
          aoFechar={aoFechar}
          corTema={configStatus.cor}
          icone={
            <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 text-zinc-500 flex items-center justify-center">
              <Cpu size={24} />
            </div>
          }
          subtitulo={
            <>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${configStatus.text}`}>
                {configStatus.label}
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                {impressora ? impressora.nome : "Sem Máquina Alocada"}
              </span>
            </>
          }
        />

        {/* Sistema de Abas Padronizado */}
        <AbasModalPremium 
          abas={abas}
          abaAtiva={abaAtiva}
          aoMudarAba={(id) => setAbaAtiva(id as any)}
          corTema={configStatus.cor}
        />

        {/* Conteúdo Dinâmico */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={abaAtiva}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {abaAtiva === "espec" && (
                <AbaEspecificacoesProjeto pedido={pedido} />
              )}
              {abaAtiva === "custos" && (
                <AbaCustosProjeto pedido={pedido} />
              )}
              {abaAtiva === "workflow" && (
                <AbaWorkflowProjeto pedido={pedido} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Dialogo>
  );
}
