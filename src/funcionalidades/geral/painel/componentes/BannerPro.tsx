import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";

/**
 * Interface para as propriedades do BannerPro.
 */
interface PropriedadesBannerPro {
  plano: string;
  aoRealizarUpgrade: () => Promise<void>;
  carregandoUpgrade: boolean;
}

/**
 * Banner de oferta para upgrade do plano para PRO.
 * @param plano - Plano atual do usuário
 * @param aoRealizarUpgrade - Função para realizar o upgrade
 * @param carregandoUpgrade - Estado de carregamento do upgrade
 */
export function BannerPro({ plano, aoRealizarUpgrade, carregandoUpgrade }: PropriedadesBannerPro) {
  if (plano !== "FREE") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[2rem] bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 overflow-hidden shadow-2xl shadow-sky-500/20 group"
    >
      {/* Elementos Decorativos */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Crown size={180} strokeWidth={1} />
      </div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 blur-[60px] rounded-full" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/20">
              Oferta de Lançamento
            </span>
            <Sparkles size={14} className="text-sky-200 animate-pulse" />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-tight">
            Dê adeus ao chutômetro. <br />
            <span className="text-sky-200">Para fortalecer a comunidade.</span>
          </h3>
          <p className="text-sky-50/70 text-sm font-medium max-w-xl">
            O PrintLog nasceu para ajudar cada estúdio a crescer com precisão e dignidade. 
            Seja um Fundador e ajude a manter este sistema online para todos os makers.
          </p>
        </div>

        <button
          onClick={aoRealizarUpgrade}
          disabled={carregandoUpgrade}
          className="px-10 py-5 bg-white text-indigo-700 font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-3 shrink-0"
        >
          {carregandoUpgrade ? "Unindo-se..." : "Ser um Maker Fundador"}
          <Sparkles size={16} className="text-sky-500" />
        </button>
      </div>
    </motion.div>
  );
}
