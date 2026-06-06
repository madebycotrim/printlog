import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Zap, ShieldCheck, X } from "lucide-react";

interface PropriedadesModalPaywall {
  aberto: boolean;
  aoFechar: () => void;
  aoFazerUpgrade: () => void;
  recurso: string;
}

/**
 * Modal Premium exibido quando um usuário FREE atinge o limite de uso (Paywall).
 */
export function ModalUpgradePaywall({
  aberto,
  aoFechar,
  aoFazerUpgrade,
  recurso,
}: PropriedadesModalPaywall) {
  if (!aberto) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop blur Premium */}
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          className="absolute inset-0 bg-[#050505]/80"
          onClick={aoFechar}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-lg bg-zinc-900 border border-sky-500/30 rounded-3xl shadow-[0_0_80px_-15px_rgba(14,165,233,0.3)] overflow-hidden"
        >
          {/* Brilhos de Fundo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-sky-500/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[50%] h-[40%] bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />

          {/* Botão Fechar */}
          <button
            onClick={aoFechar}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          <div className="relative p-8 flex flex-col items-center text-center">
            {/* Ícone Coroa Brilhante */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 p-[1px] mb-6 shadow-xl shadow-sky-500/20">
              <div className="w-full h-full rounded-2xl bg-zinc-900 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-sky-500/10" />
                <Crown className="w-10 h-10 text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)] animate-pulse" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
              Limite de <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">{recurso}</span> Atingido
            </h2>
            
            <p className="text-sm text-zinc-400 leading-relaxed mb-8 max-w-sm">
              Você atingiu o limite do plano Gratuito. Libere seu estúdio para o próximo nível e aproveite o verdadeiro potencial da sua fazenda de impressão 3D.
            </p>

            <div className="w-full space-y-3 mb-8 text-left">
              {[
                { icone: Sparkles, cor: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", texto: "Cadastros ilimitados de Impressoras e Materiais" },
                { icone: Zap, cor: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", texto: "Otimização Avançada de Preço com IA" },
                { icone: ShieldCheck, cor: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", texto: "Exportação em PDF White-label e Link Mágico" },
              ].map((beneficio, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${beneficio.border} bg-white/[0.02] backdrop-blur-sm`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${beneficio.bg}`}>
                    <beneficio.icone className={`w-4 h-4 ${beneficio.cor}`} />
                  </div>
                  <span className="text-xs font-bold text-zinc-300">{beneficio.texto}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                aoFazerUpgrade();
                aoFechar();
              }}
              className="w-full relative group overflow-hidden px-8 py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #4f46e5)",
                color: "#fff",
                boxShadow: "0 10px 30px -10px rgba(14,165,233,0.5)",
              }}
            >
              <div
                className="absolute inset-0 w-1/2 h-full -skew-x-12 transform -translate-x-full group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Quero ser MAKER PRO <Crown size={16} />
              </span>
            </button>
            <p className="mt-4 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              Cancele a qualquer momento
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
