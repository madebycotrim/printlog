import { Pedido } from "../tipos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { CartaoPedido } from "./CartaoPedido";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban } from "lucide-react";

interface PropriedadesColunaKanban {
  titulo: string;
  status: StatusPedido;
  pedidos: Pedido[];
  aoMover: (id: string, novoStatus: StatusPedido) => void;
  abrirFormularioEdicao?: (id: string) => void;
  cor: string;
}

export function ColunaKanban({ titulo, status, pedidos, aoMover, abrirFormularioEdicao, cor }: PropriedadesColunaKanban) {
  const [arrastandoSobre, setArrastandoSobre] = useState(false);

  const lidarComDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastandoSobre(true);
  };

  const lidarComDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (!arrastandoSobre) setArrastandoSobre(true);
  };

  const lidarComDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const alvo = e.relatedTarget as Node;
    if (e.currentTarget.contains(alvo)) return;
    setArrastandoSobre(false);
  };

  const lidarComDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastandoSobre(false);

    const pedidoId = e.dataTransfer.getData("text/plain");

    if (pedidoId) {
      aoMover(pedidoId, status);
    }
  };

  // Mapeamento de cores para o Glass Pill
  const configCor = {
    'bg-zinc-500': { bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', text: 'text-zinc-500', dot: 'bg-zinc-500' },
    'bg-amber-500': { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500', dot: 'bg-amber-500' },
    'bg-emerald-500': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', dot: 'bg-emerald-500' },
    'bg-indigo-500': { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-500', dot: 'bg-indigo-500' },
    'bg-fuchsia-500': { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', text: 'text-fuchsia-500', dot: 'bg-fuchsia-500' },
    'bg-sky-500': { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-500', dot: 'bg-sky-500' },
  }[cor] || { bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', text: 'text-zinc-500', dot: 'bg-zinc-500' };

  return (
    <div
      className="flex flex-col gap-5 min-w-[320px] w-full max-w-sm h-full relative"
      onDragEnter={lidarComDragEnter}
      onDragOver={lidarComDragOver}
      onDragLeave={lidarComDragLeave}
      onDrop={lidarComDrop}
    >
      <div className="flex items-center justify-between px-1 shrink-0">
        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full ${configCor.bg} border ${configCor.border} backdrop-blur-md shadow-sm dark:shadow-lg dark:shadow-black/40`}>
          <div className={`w-1.5 h-1.5 rounded-full ${configCor.dot} shadow-[0_0_8px_rgba(0,0,0,0.1)] dark:shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
          <h3 className={`font-black text-[9px] tracking-[0.2em] uppercase ${configCor.text}`}>
            {titulo}
          </h3>
        </div>
        <div className="flex items-center justify-center min-w-[24px] h-6 px-2 rounded-lg bg-white/[0.03] border border-white/5">
          <span className="text-[10px] font-black text-zinc-500 tabular-nums">{pedidos.length}</span>
        </div>
      </div>

      <div
        className={`
          flex-1 flex flex-col gap-3 p-3 rounded-[24px] border transition-all duration-500 min-h-[450px] relative overflow-hidden
          ${
            arrastandoSobre
              ? "bg-zinc-100/50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/10 shadow-inner"
              : "bg-zinc-50 dark:bg-zinc-900/10 border-zinc-100 dark:border-white/[0.02]"
          }
        `}
      >
        {/* Background Decorative Icon para Empty State */}
        {pedidos.length === 0 && !arrastandoSobre && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] dark:opacity-[0.03]">
             <FolderKanban size={200} strokeWidth={0.5} className={configCor.text} />
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {pedidos.length === 0 && !arrastandoSobre ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center relative z-10"
            >
              <div className={`w-10 h-10 rounded-2xl ${configCor.bg} border ${configCor.border} flex items-center justify-center mb-4`}>
                 <FolderKanban size={16} className={configCor.text} />
              </div>
              <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.4em] mb-1">
                Fluxo Limpo
              </p>
              <span className="text-[8px] font-medium text-zinc-400 dark:text-zinc-800 uppercase tracking-widest">Aguardando novos projetos</span>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/5"
            >
              {pedidos.map((pedido) => (
                <CartaoPedido key={pedido.id} pedido={pedido} abrirFormularioEdicao={abrirFormularioEdicao} />
              ))}
              
              {/* Espaço extra no final para facilitar o drop em colunas vazias */}
              <div className="h-20 shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
