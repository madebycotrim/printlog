import { AnimatePresence, motion } from "framer-motion";
import { X, Settings } from "lucide-react";
import { ReactNode, useEffect, ComponentType } from "react";
import { createPortal } from "react-dom";

interface PropriedadesDialogo {
  aberto: boolean;
  aoFechar: () => void;
  titulo?: string;
  subtitulo?: string;
  icone?: ComponentType<any>;
  children: ReactNode;
  larguraMax?: string;
  esconderCabecalho?: boolean;
  telaCheia?: boolean;
  semScroll?: boolean;
  corBase?: "sky" | "violet" | "emerald" | "rose" | "stone" | "cyan";
}

const coresMapeamento = {
  sky: "bg-sky-500/10 border-sky-500/20 text-sky-500",
  violet: "bg-violet-500/10 border-violet-500/20 text-violet-500",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  rose: "bg-rose-500/10 border-rose-500/20 text-rose-500",
  stone: "bg-stone-500/10 border-stone-500/20 text-stone-500",
  cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-500",
};

/**
 * Componente de DiÃ¡logo (Modal) com suporte a Portals.
 * Renderiza fora da hierarquia do DOM atual para evitar problemas de 'transform' no CSS.
 */
export function Dialogo({
  aberto,
  aoFechar,
  titulo,
  subtitulo,
  icone: Icone,
  children,
  larguraMax = "max-w-2xl",
  esconderCabecalho = false,
  telaCheia = false,
  semScroll = false,
  corBase = "sky",
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
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-[2px]"
            onClick={aoFechar}
          />

          {/* Container Centralizado */}
          <div className={`fixed inset-0 z-[1000] flex items-center justify-center ${telaCheia ? "p-0" : "p-4 md:p-8"} pointer-events-none`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 450, damping: 30, mass: 0.8 }}
              role="dialog"
              aria-modal="true"
              aria-label={titulo || "Diálogo"}
              className={`
                w-full pointer-events-auto flex flex-col overflow-hidden bg-card border-borda-sutil shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                ${telaCheia ? "h-full w-full border-none rounded-none" : `${larguraMax} rounded-[2rem] border max-h-[90vh]`}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabeçalho */}
              {!esconderCabecalho && (
                <div className={`flex items-center justify-between px-6 py-4.5 border-b border-borda-sutil bg-card backdrop-blur-md z-20 ${telaCheia ? "" : "rounded-t-3xl"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${coresMapeamento[corBase]}`}>
                      {Icone ? <Icone size={18} /> : <Settings size={18} />}
                    </div>
                    <div className="flex flex-col text-left">
                      <h3 className="text-sm font-black text-primary tracking-wider uppercase leading-none">
                        {titulo || "Painel"}
                      </h3>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {subtitulo || "Configurações do Sistema"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={aoFechar}
                    className="w-8 h-8 rounded-lg text-zinc-500 hover:text-primary dark:hover:text-zinc-200 transition-all bg-zinc-100 dark:bg-zinc-900/40 border border-borda-sutil flex items-center justify-center cursor-pointer active:scale-95"
                    aria-label="Fechar"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* ConteÃºdo com Scroll (Opcional) */}
              <div className={`flex-1 p-0 ${semScroll ? "overflow-hidden" : "overflow-y-auto scrollbar-fino"}`}>
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
