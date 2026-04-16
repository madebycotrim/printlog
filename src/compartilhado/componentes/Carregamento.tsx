import { motion } from "framer-motion";

interface PropriedadesCarregamento {
  tipo?: "global" | "pulse";
  mensagem?: string;
  texto?: string;
}

// Assuming BarraProgressoSuperior is a new component that needs to be defined or imported elsewhere.
// For the purpose of this edit, we'll just include its usage as provided.
function BarraProgressoSuperior() {
  return (
    <motion.div
      initial={{ width: "0%", opacity: 0 }}
      animate={{
        width: ["0%", "30%", "70%", "90%"],
        opacity: 1,
      }}
      transition={{
        duration: 8,
        times: [0, 0.2, 0.5, 1],
        ease: "easeOut",
      }}
      className="h-[2px] bg-zinc-800 dark:bg-white shadow-[0_0_8px_rgba(255,255,255,0.3)] dark:shadow-[0_0_8px_rgba(255,255,255,0.5)]"
    />
  );
}

/**
 * Componente de Carregamento Padronizado (v9.0)
 * Substitui spinners por uma experiência minimalista e instantânea.
 */
export function Carregamento({ tipo = "global", mensagem, texto }: PropriedadesCarregamento) {
  if (tipo === "global") {
    return (
      <div className="fixed top-0 left-0 right-0 z-[10000] pointer-events-none">
        <BarraProgressoSuperior />
        {(mensagem || texto) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500 animate-pulse">
              {mensagem || texto}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center p-8 space-y-4"
    >
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-12 h-1 gap-1 flex"
      >
        <div className="flex-1 bg-zinc-400/50 rounded-full" />
        <div className="flex-1 bg-zinc-400/50 rounded-full" />
        <div className="flex-1 bg-zinc-400/50 rounded-full" />
      </motion.div>
      {(mensagem || texto) && (
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{mensagem || texto}</span>
      )}
    </motion.div>
  );
}
