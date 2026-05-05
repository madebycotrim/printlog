import { motion } from "framer-motion";

interface PropriedadesCarregamento {
  tipo?: "global" | "pulse" | "ponto";
  mensagem?: string;
  texto?: string;
}

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
      className="h-[2px] bg-primary dark:bg-white shadow-[0_0_8px_rgba(0,0,0,0.1)] dark:shadow-[0_0_8px_rgba(255,255,255,0.5)]"
    />
  );
}

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

  if (tipo === "ponto") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.2 }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
              className="w-1.5 h-1.5 rounded-full bg-sky-500"
            />
          ))}
        </div>
        {(mensagem || texto) && (
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
            {mensagem || texto}
          </span>
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
