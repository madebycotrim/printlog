import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Sparkles,
  ArrowRight,
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
} from "lucide-react";
import { useMedalhasMaker } from "@/compartilhado/hooks/useMedalhasMaker";
import { ModalSalaTrofeus } from "@/compartilhado/componentes/ui/ModalSalaTrofeus";

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

export function ShowcaseMedalhasMaker() {
  const [modalAberto, setModalAberto] = useState(false);
  const {
    medalhasDesbloqueadas,
    totalConquistadas,
    totalMedalhas,
    nivelMaker,
    proximaMedalha,
  } = useMedalhasMaker();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-6 sm:p-8 rounded-[2rem] bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-amber-500/20 shadow-2xl shadow-amber-500/5 overflow-hidden group"
      >
        {/* Glows Decorativos Sutis */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-sky-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Informações da Carreira Maker */}
          <div className="space-y-3 text-center lg:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full flex items-center gap-1.5">
                <Trophy size={12} className="text-amber-400" />
                Conquistas Maker
              </span>
              <span className="bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                100% Gratuito & Aberto
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Seu Prestígio: <span className={nivelMaker.classeCor}>{nivelMaker.titulo}</span>
            </h3>

            <p className="text-zinc-400 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
              Você já acumulou <strong className="text-amber-400">{totalConquistadas} de {totalMedalhas} medalhas</strong> operando seu estúdio 3D.
              {proximaMedalha && (
                <span className="block mt-1 text-zinc-500">
                  Próximo objetivo: <strong className="text-zinc-300">{proximaMedalha.titulo}</strong> ({proximaMedalha.valorAtual}/{proximaMedalha.meta} {proximaMedalha.unidade}).
                </span>
              )}
            </p>

            {/* Badges Conquistadas em Destaque */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              {medalhasDesbloqueadas.slice(0, 5).map((m) => {
                const Icone = MAPA_ICONES[m.iconeNome] || Award;
                return (
                  <div
                    key={m.id}
                    title={`${m.titulo}: ${m.descricao}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-bold hover:scale-105 transition-transform"
                  >
                    <Icone size={14} className="text-amber-400 shrink-0" />
                    <span className="text-[11px] truncate max-w-[130px]">{m.titulo}</span>
                  </div>
                );
              })}
              {totalConquistadas > 5 && (
                <span className="text-xs text-zinc-500 font-bold self-center">
                  +{totalConquistadas - 5} mais
                </span>
              )}
            </div>
          </div>

          {/* Botão de Ação / Galeria */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <button
              onClick={() => setModalAberto(true)}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-zinc-950 font-black uppercase text-xs tracking-[0.15em] rounded-2xl shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group cursor-pointer"
            >
              <span>Ver Minhas Medalhas</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              Galeria Completa de Troféus
            </span>
          </div>
        </div>
      </motion.div>

      <ModalSalaTrofeus
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
      />
    </>
  );
}
