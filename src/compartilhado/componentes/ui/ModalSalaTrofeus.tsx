import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  X,
  Sparkles,
  Printer,
  Layers,
  Palette,
  Cpu,
  Flame,
  Boxes,
  UserCheck,
  Briefcase,
  Award,
  Target,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useMedalhasMaker } from "@/compartilhado/hooks/useMedalhasMaker";
import { MedalhaProcessada } from "@/compartilhado/utilitarios/medalhasMaker";

interface PropriedadesModalSalaTrofeus {
  aberto: boolean;
  aoFechar: () => void;
}

const MAPA_ICONES: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Sparkles,
  Printer,
  Layers,
  Palette,
  Cpu,
  Flame,
  Boxes,
  UserCheck,
  Briefcase,
  Award,
  Target,
  Trophy,
};

export function ModalSalaTrofeus({ aberto, aoFechar }: PropriedadesModalSalaTrofeus) {
  const {
    medalhas,
    totalConquistadas,
    totalMedalhas,
    nivelMaker,
  } = useMedalhasMaker();

  if (!aberto) return null;

  const percentualGeral = Math.round((totalConquistadas / totalMedalhas) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop blur escuro */}
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          className="absolute inset-0 bg-[#050505]/85"
          onClick={aoFechar}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950/95 border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_-15px_rgba(14,165,233,0.2)] overflow-hidden flex flex-col backdrop-blur-2xl"
        >
          {/* Efeitos de Iluminação Superior */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-sky-500/10 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 right-10 w-1/2 h-32 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

          {/* Cabeçalho do Modal */}
          <div className="relative p-6 sm:p-8 pb-4 border-b border-white/5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-[1px] shadow-lg shadow-amber-500/20 shrink-0">
                <div className="w-full h-full rounded-2xl bg-zinc-950 flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Galeria de Honra Maker
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    100% Gratuito
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  Suas Medalhas & Conquistas
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Nível Atual: <strong className={nivelMaker.classeCor}>{nivelMaker.titulo}</strong> • {totalConquistadas} de {totalMedalhas} medalhas acumuladas
                </p>
              </div>
            </div>

            <button
              onClick={aoFechar}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Barra de Progresso Geral */}
          <div className="px-6 sm:px-8 pt-4 pb-2">
            <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
              <span className="text-zinc-400 text-[11px] uppercase tracking-wider">Progresso da Carreira Maker</span>
              <span className="text-sky-400 font-mono font-black">{percentualGeral}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentualGeral}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-400 shadow-[0_0_12px_rgba(14,165,233,0.5)]"
              />
            </div>
          </div>

          {/* Grid de Medalhas com Rolagem */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 barra-rolagem-personalizada">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {medalhas.map((medalha) => (
                <CartaoMedalha key={medalha.id} medalha={medalha} />
              ))}
            </div>
          </div>

          {/* Rodapé Informativo */}
          <div className="p-4 px-6 sm:px-8 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-[11px] text-zinc-500">
              💡 As medalhas são desbloqueadas automaticamente conforme você usa o PrintLog em seu estúdio.
            </p>
            <button
              onClick={aoFechar}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Fechar Galeria
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function CartaoMedalha({ medalha }: { medalha: MedalhaProcessada }) {
  const Icone = MAPA_ICONES[medalha.iconeNome] || Award;

  const coresNivel = {
    lendaria: {
      borda: "border-amber-500/40 bg-amber-500/[0.04]",
      selo: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-300",
      textoNivel: "Lendária",
      glow: "shadow-[0_0_30px_-5px_rgba(245,158,11,0.25)]",
    },
    ouro: {
      borda: "border-yellow-500/30 bg-yellow-500/[0.03]",
      selo: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
      textoNivel: "Ouro",
      glow: "shadow-[0_0_20px_-5px_rgba(234,179,8,0.2)]",
    },
    prata: {
      borda: "border-indigo-500/30 bg-indigo-500/[0.03]",
      selo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
      textoNivel: "Prata",
      glow: "shadow-[0_0_20px_-5px_rgba(99,102,241,0.15)]",
    },
    bronze: {
      borda: "border-sky-500/30 bg-sky-500/[0.03]",
      selo: "bg-sky-500/10 border-sky-500/20 text-sky-400",
      textoNivel: "Bronze",
      glow: "shadow-[0_0_20px_-5px_rgba(14,165,233,0.15)]",
    },
  }[medalha.nivel];

  return (
    <div
      className={`relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
        medalha.desbloqueada
          ? `${coresNivel.borda} ${coresNivel.glow} hover:scale-[1.02]`
          : "border-white/5 bg-zinc-900/30 opacity-60 hover:opacity-80"
      }`}
    >
      {/* Topo do card */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
            medalha.desbloqueada
              ? `bg-gradient-to-br ${medalha.corPrimaria} text-white shadow-lg`
              : "bg-zinc-800 text-zinc-500"
          }`}
        >
          <Icone size={22} />
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
              medalha.desbloqueada ? coresNivel.selo : "bg-zinc-800 border-zinc-700 text-zinc-500"
            }`}
          >
            {coresNivel.textoNivel}
          </span>
          {medalha.desbloqueada ? (
            <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={12} />
            </span>
          ) : (
            <span className="p-1 rounded-full bg-zinc-800 text-zinc-500">
              <Lock size={12} />
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="space-y-1 mb-4 flex-1">
        <h4 className="text-sm font-black text-white tracking-tight uppercase">
          {medalha.titulo}
        </h4>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {medalha.descricao}
        </p>
      </div>

      {/* Barra de Progresso da Medalha */}
      <div className="pt-2 border-t border-white/5">
        <div className="flex justify-between items-center text-[10px] font-mono mb-1">
          <span className="text-zinc-500 font-bold uppercase tracking-wider">
            {medalha.desbloqueada ? "Conquistada" : `${medalha.valorAtual}/${medalha.meta} ${medalha.unidade}`}
          </span>
          <span className={`font-black ${medalha.desbloqueada ? "text-emerald-400" : "text-zinc-500"}`}>
            {medalha.progresso}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              medalha.desbloqueada
                ? `bg-gradient-to-r ${medalha.corPrimaria}`
                : "bg-zinc-700"
            }`}
            style={{ width: `${medalha.progresso}%` }}
          />
        </div>
      </div>
    </div>
  );
}
