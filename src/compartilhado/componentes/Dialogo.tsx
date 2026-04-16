import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface PropriedadesDialogo {
  aberto: boolean;
  aoFechar: () => void;
  titulo?: string;
  children: ReactNode;
  larguraMax?: string;
  esconderCabecalho?: boolean;
  telaCheia?: boolean;
  semScroll?: boolean;
}

/**
 * Componente de DiÃ¡logo (Modal) com suporte a Portals.
 * Renderiza fora da hierarquia do DOM atual para evitar problemas de 'transform' no CSS.
 */
export function Dialogo({
  aberto,
  aoFechar,
  titulo,
  children,
  larguraMax = "max-w-2xl",
  esconderCabecalho = false,
  telaCheia = false,
  semScroll = false,
}: PropriedadesDialogo) {
  // Fecha com ESC
  useEffect(() => {
    const lidarComTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    if (aberto) window.addEventListener("keydown", lidarComTecla);
    return () => window.removeEventListener("keydown", lidarComTecla);
  }, [aberto, aoFechar]);

  // Bloqueia scroll do body quando aberto
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [aberto]);

  const modalConteudo = (
    <AnimatePresence>
      {aberto && (
        <>
          {/* Backdrop (Fundo Borrado) - Agora garante tela inteira via Portal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-md"
            onClick={aoFechar}
          />

          {/* Container Centralizado */}
          <div className={`fixed inset-0 z-[1000] flex items-center justify-center ${telaCheia ? "p-0" : "p-4 md:p-8"} pointer-events-none`}>
            <motion.div
              initial={telaCheia ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={telaCheia ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              className={`
                                w-full pointer-events-auto flex flex-col overflow-hidden bg-[var(--bg-card)] border-[var(--border-subtle)] shadow-2xl
                                ${telaCheia ? "h-full w-full border-none rounded-none" : `${larguraMax} rounded-2xl border max-h-[90vh]`}
                            `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* CabeÃ§alho */}
              {!esconderCabecalho && (
                <div className={`flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-transparent backdrop-blur-md z-20 ${telaCheia ? "" : "rounded-t-2xl"}`}>
                  <h3 className="text-sm font-bold text-gray-500 dark:text-zinc-400 tracking-widest uppercase">
                    {titulo}
                  </h3>
                  <button
                    onClick={aoFechar}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/10 transition-all active:scale-90"
                    aria-label="Fechar"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>
              )}

              {/* ConteÃºdo com Scroll (Opcional) */}
              <div className={`flex-1 p-0 ${semScroll ? "overflow-hidden" : "overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700/50 hover:scrollbar-thumb-zinc-600"}`}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalConteudo, document.body);
}
