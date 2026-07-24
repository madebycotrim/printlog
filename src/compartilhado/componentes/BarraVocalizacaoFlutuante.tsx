import { Volume2, VolumeX, Pause, Play, Square } from "lucide-react";
import { useVocalizador } from "@/compartilhado/hooks/useVocalizador";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

/**
 * Player Flutuante Profissional de Vocalização de Tela.
 * Exibe controles de áudio (Play/Pause/Stop/Velocidade) quando a voz está ativa.
 */
export function BarraVocalizacaoFlutuante() {
  const { falando, pausado, pausarOuContinuar, parar, definirVelocidade } = useVocalizador();
  const [velocidade, setVelocidadeLocal] = useState(1.0);

  if (!falando) return null;

  const alternarVelocidade = () => {
    const proxima = velocidade === 1.0 ? 1.25 : velocidade === 1.25 ? 1.5 : 1.0;
    setVelocidadeLocal(proxima);
    definirVelocidade(proxima);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 p-3 px-4 rounded-2xl bg-zinc-900/90 dark:bg-zinc-950/95 border border-violet-500/30 text-white shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
            {pausado ? <VolumeX size={16} /> : <Volume2 size={16} className="animate-pulse text-violet-400" />}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-violet-300">Vocalizando Tela</span>
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
              {pausado ? "Pausado" : "Lendo em Português..."}
            </span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-zinc-800 mx-1" />

        <div className="flex items-center gap-1.5">
          <button
            onClick={pausarOuContinuar}
            aria-label={pausado ? "Continuar Leitura" : "Pausar Leitura"}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
          >
            {pausado ? <Play size={14} /> : <Pause size={14} />}
          </button>

          <button
            onClick={parar}
            aria-label="Parar Leitura"
            className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition-colors cursor-pointer"
          >
            <Square size={14} />
          </button>

          <button
            onClick={alternarVelocidade}
            className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-violet-300 text-[10px] font-mono font-bold transition-colors cursor-pointer"
          >
            {velocidade}x
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
