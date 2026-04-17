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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`
          relative p-4 rounded-xl border transition-all duration-500
          bg-[#121214] border-white/[0.04]
          hover:border-white/[0.1] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]
          ${estaAtrasado ? "border-rose-500/30 ring-1 ring-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.05)]" : ""}
        `}
      >
        {/* Glow de Status Lateral */}
        <div className={`absolute left-0 top-4 bottom-4 w-[2px] rounded-r-full bg-${configStatus.cor}-500/40`} />

        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between mb-3 relative z-10 pl-2">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-1.5 mb-1.5 opacity-60">
              <User size={10} className="text-zinc-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 truncate">
                {pedido.nomeCliente || "Padrão"}
              </span>
            </div>
            <h4 className="text-[13px] font-bold text-white leading-tight tracking-tight line-clamp-2 uppercase group-hover/card:text-indigo-400 transition-colors">
              {pedido.descricao}
            </h4>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuAberto(!menuAberto);
              }}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${menuAberto ? "bg-white/10 text-white" : "text-zinc-700 hover:text-white opacity-0 group-hover/card:opacity-100"}`}
            >
              <MoreVertical size={14} />
            </button>

            <AnimatePresence>
              {menuAberto && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1e] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-xl"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      aoEditar?.(pedido.id);
                      setMenuAberto(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:bg-white/5 transition-colors"
                  >
                    <Edit3 size={12} className="text-indigo-400" /> Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Deseja realmente excluir este pedido?")) excluirPedido(pedido.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={12} /> Excluir
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Métricas e Status */}
        <div className="space-y-4 relative z-10 pl-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <DollarSign size={10} className="text-indigo-400" />
              <span className="text-[12px] font-bold text-zinc-100">
                {centavosParaReais(pedido.valorCentavos)}
              </span>
            </div>

            {pedido.prazoEntrega && (
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all duration-500 ${
                  estaAtrasado
                    ? "bg-rose-500 text-white border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                    : "bg-white/[0.02] border-white/5 text-zinc-500 group-hover/card:border-white/10 group-hover/card:text-zinc-400"
                }`}
              >
                <Clock size={10} />
                {formatarDataCurta(pedido.prazoEntrega)}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.03]">
            <div className="flex items-center gap-1.5 opacity-60">
              <Package size={10} className="text-zinc-600" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 truncate max-w-[80px]">
                {pedido.material || "Filamento"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full bg-${configStatus.cor}-500 shadow-[0_0_8px_rgba(var(--color-${configStatus.cor}-500),0.4)]`} />
              <span className={`text-[9px] font-bold uppercase tracking-widest text-${configStatus.cor}-500/80`}>
                {configStatus.label}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
