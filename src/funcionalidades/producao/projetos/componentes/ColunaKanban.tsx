import { Pedido } from "../tipos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { CartaoPedido } from "./CartaoPedido";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PropriedadesColunaKanban {
  titulo: string;
  status: StatusPedido;
  pedidos: Pedido[];
  aoMover: (id: string, novoStatus: StatusPedido) => void;
  aoEditar?: (id: string) => void;
  cor: string;
}

export function ColunaKanban({ titulo, status, pedidos, aoMover, aoEditar, cor }: PropriedadesColunaKanban) {
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

  return (
    <div
      className="flex flex-col gap-4 min-w-[320px] w-full max-w-sm h-full"
      onDragEnter={lidarComDragEnter}
      onDragOver={lidarComDragOver}
      onDragLeave={lidarComDragLeave}
      onDrop={lidarComDrop}
    >
      <div className="flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)] ${cor}`} />
          <h3 className="font-extrabold text-[11px] tracking-[0.25em] uppercase text-gray-500 dark:text-zinc-500">
            {titulo}
          </h3>
        </div>
        <div className="flex items-center justify-center min-w-[24px] h-[24px] px-2 rounded-full bg-gray-100 dark:bg-white/5 border border-subtle">
          <span className="text-[10px] font-black text-gray-900 dark:text-white">{pedidos.length}</span>
        </div>
      </div>

      <div
        className={`
                flex-1 flex flex-col gap-4 p-4 rounded-[2.5rem] border transition-colors duration-200 min-h-0 relative
                ${
                  arrastandoSobre
                    ? "bg-white/50 dark:bg-white/[0.05] border-primaria/20"
                    : "bg-white/40 dark:bg-white/[0.03] border-gray-100 dark:border-white/5"
                }
            `}
      >
        <AnimatePresence mode="popLayout">
          {pedidos.length === 0 && !arrastandoSobre ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center mb-4 opacity-40">
                <div className={`w-3 h-3 rounded-full ${cor}`} />
              </div>
              <p className="text-[10px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-[0.2em]">
                Fluxo Limpo
              </p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/5"
            >
              {pedidos.map((pedido) => (
                <CartaoPedido key={pedido.id} pedido={pedido} aoEditar={aoEditar} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
