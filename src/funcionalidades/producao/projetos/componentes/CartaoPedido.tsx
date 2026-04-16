import { DollarSign, User, MoreVertical, Trash2, Edit3, Clock, Package } from "lucide-react";
import { Pedido } from "../tipos";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import { usarPedidos } from "../hooks/usarPedidos";
import { verificarSeEstaAtrasado } from "@/compartilhado/utilitarios/gestaoAtrasos";
import { formatarDataCurta } from "@/compartilhado/utilitarios/formatadores";
import { StatusPedido } from "@/compartilhado/tipos/modelos";

interface PropriedadesCartaoPedido {
  pedido: Pedido;
  aoEditar?: (id: string) => void;
}

export function CartaoPedido({ pedido, aoEditar }: PropriedadesCartaoPedido) {
  const { excluirPedido } = usarPedidos();
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const estaAtrasado = useMemo(() => verificarSeEstaAtrasado(pedido), [pedido]);

  useEffect(() => {
    const clicarFora = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    };
    document.addEventListener("mousedown", clicarFora);
    return () => document.removeEventListener("mousedown", clicarFora);
  }, []);

  // Configuração Visual do Status
  const configStatus = useMemo(() => {
    switch (pedido.status) {
      case StatusPedido.A_FAZER:
        return { cor: "zinc", label: "A Fazer" };
      case StatusPedido.EM_PRODUCAO:
        return { cor: "emerald", label: "Produzindo" };
      case StatusPedido.ACABAMENTO:
        return { cor: "amber", label: "Acabamento" };
      case StatusPedido.CONCLUIDO:
        return { cor: "sky", label: "Concluído" };
      default:
        return { cor: "zinc", label: "Pendente" };
    }
  }, [pedido.status]);

  return (
    <div
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", pedido.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="cursor-grab active:cursor-grabbing group/card"
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
                    relative p-5 rounded-2xl border transition-all duration-300
                    bg-white dark:bg-[#121214] border-gray-100 dark:border-white/[0.05]
                    shadow-sm hover:shadow-md
                    ${estaAtrasado ? "border-rose-500/40" : ""}
                `}
      >
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-1.5 mb-1">
              <User size={10} className="text-gray-400" />
              <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500 truncate">
                {pedido.nomeCliente || "Padrão"}
              </span>
            </div>
            <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight tracking-tight line-clamp-2 uppercase">
              {pedido.descricao}
            </h4>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuAberto(!menuAberto);
              }}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${menuAberto ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white" : "text-gray-300 dark:text-zinc-700 hover:text-gray-900 dark:hover:text-white opacity-0 group-hover/card:opacity-100"}`}
            >
              <MoreVertical size={14} />
            </button>

            <AnimatePresence>
              {menuAberto && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1a1a1e] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl p-1.5 z-50"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      aoEditar?.(pedido.id);
                      setMenuAberto(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Edit3 size={12} className="text-sky-500" /> Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Deseja realmente excluir este pedido?")) excluirPedido(pedido.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={12} /> Excluir
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Métricas e Status */}
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <DollarSign size={10} className="text-emerald-500" />
              <span className="text-[11px] font-black text-gray-700 dark:text-zinc-300">
                {centavosParaReais(pedido.valorCentavos)}
              </span>
            </div>

            {pedido.prazoEntrega && (
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                  estaAtrasado
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-gray-50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5 text-gray-400 dark:text-zinc-500"
                }`}
              >
                <Clock size={10} />
                {formatarDataCurta(pedido.prazoEntrega)}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-white/[0.02]">
            <div className="flex items-center gap-1.5 opacity-50">
              <Package size={10} className="text-gray-400" />
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 truncate max-w-[80px]">
                {pedido.material || "Filamento"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full bg-${configStatus.cor}-500 opacity-80`} />
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                {configStatus.label}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
