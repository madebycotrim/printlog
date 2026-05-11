import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DicaProps {
  texto: string;
  children: React.ReactNode;
  posicao?: "cima" | "baixo" | "esquerda" | "direita";
}

/**
 * Componente de Tooltip ("Dica") para exibir informações ao passar o mouse.
 * Design premium com animações suaves e suporte a dark mode.
 */
export function Dica({ texto, children, posicao = "cima" }: DicaProps) {
  const [visivel, definirVisivel] = useState(false);

  const variantesPosicao = {
    cima: { bottom: "100%", left: "50%", x: "-50%", y: -8 },
    baixo: { top: "100%", left: "50%", x: "-50%", y: 8 },
    esquerda: { right: "100%", top: "50%", y: "-50%", x: -8 },
    direita: { left: "100%", top: "50%", y: "-50%", x: 8 },
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => definirVisivel(true)}
      onMouseLeave={() => definirVisivel(false)}
    >
      {children}
      <AnimatePresence>
        {visivel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, ...variantesPosicao[posicao] }}
            animate={{ opacity: 1, scale: 1, ...variantesPosicao[posicao] }}
            exit={{ opacity: 0, scale: 0.9, ...variantesPosicao[posicao] }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-[9999] px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-white/10"
          >
            {texto}
            {/* Triângulo (Opcional, mas dá um toque premium) */}
            <div
              className={`absolute w-2 h-2 bg-zinc-900 dark:bg-zinc-800 border-white/10 transform rotate-45 ${
                posicao === "cima"
                  ? "bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b"
                  : posicao === "baixo"
                    ? "top-[-4px] left-1/2 -translate-x-1/2 border-l border-t"
                    : posicao === "esquerda"
                      ? "right-[-4px] top-1/2 -translate-y-1/2 border-r border-t"
                      : "left-[-4px] top-1/2 -translate-y-1/2 border-l border-b"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
