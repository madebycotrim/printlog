/**
 * @file MenuNotificacoes.tsx
 * @description Dropdown de notificações premium com suporte a temas e animações.
 */

import { Bell, CheckCircle2, AlertTriangle, AlertCircle, Info, Trash2, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { usarArmazemNotificacoes } from "../estado/armazemNotificacoes";
import { TipoNotificacao } from "../tipos/notificacoes";

export function MenuNotificacoes() {
  const { notificacoes, marcarComoLida, marcarTodasComoLidas, limparNotificacoes, removerNotificacao } =
    usarArmazemNotificacoes();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navegar = useNavigate();

  const nLidas = notificacoes.filter((n) => !n.lida).length;

  useEffect(() => {
    function clicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", clicarFora);
    return () => document.removeEventListener("mousedown", clicarFora);
  }, []);

  const obterIconeTipo = (tipo: TipoNotificacao) => {
    switch (tipo) {
      case TipoNotificacao.SUCESSO:
        return <CheckCircle2 className="text-emerald-500" size={18} />;
      case TipoNotificacao.AVISO:
        return <AlertTriangle className="text-amber-500" size={18} />;
      case TipoNotificacao.ERRO:
      case TipoNotificacao.CRITICO:
        return <AlertCircle className="text-rose-500" size={18} />;
      default:
        return <Info className="text-sky-500" size={18} />;
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto(!aberto)}
        className={`
                    relative p-2.5 rounded-xl transition-all duration-300
                    ${nLidas > 0 ? "text-sky-500 bg-sky-500/10" : "text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"}
                `}
      >
        <Bell size={20} className={nLidas > 0 ? "animate-pulse" : ""} />
        {nLidas > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#0e0e11]">
            {nLidas}
          </span>
        )}
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-96 bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header do Menu */}
            <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/2">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight">Notificações</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  Alertas e Atividades
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={marcarTodasComoLidas}
                  className="text-[10px] font-black uppercase tracking-widest text-sky-500 hover:text-sky-400 p-1"
                >
                  Ler Tudo
                </button>
                <button
                  onClick={limparNotificacoes}
                  className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-rose-500 p-1"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Lista de Notificações */}
            <div className="max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-hide">
              {notificacoes.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <Bell size={24} />
                  </div>
                  <p className="text-xs text-gray-400 font-medium italic">Tudo limpo por aqui, Maker!</p>
                </div>
              ) : (
                notificacoes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      marcarComoLida(n.id);
                      if (n.link) {
                        navegar(n.link);
                        setAberto(false);
                      }
                    }}
                    className={`
                                            p-4 flex gap-4 transition-all cursor-pointer border-b border-gray-50 dark:border-white/2
                                            ${n.lida ? "opacity-60 grayscale-[0.5]" : "bg-sky-500/[0.02] dark:bg-white/[0.01] hover:bg-sky-500/[0.05] dark:hover:bg-white/[0.03]"}
                                        `}
                  >
                    <div className="mt-1 shrink-0">{obterIconeTipo(n.tipo)}</div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-black uppercase tracking-tight truncate">{n.titulo}</h4>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                          {formatDistanceToNow(n.data, { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                        {n.mensagem}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-sky-500 flex items-center gap-1">
                          #{n.categoria}
                          {n.link && <ExternalLink size={8} />}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removerNotificacao(n.id);
                          }}
                          className="p-1 text-gray-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 text-center">
              <button className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-sky-500 transition-colors">
                Central de Notificações Completa (Fase 3)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
