import { useState } from "react";
import { Trophy, Award, Sparkles, CheckCircle2, Lock } from "lucide-react";
import { useMedalhasMaker } from "@/compartilhado/hooks/useMedalhasMaker";
import { ModalSalaTrofeus } from "@/compartilhado/componentes/ui/ModalSalaTrofeus";

export function CardMedalhasMaker() {
  const [modalAberto, setModalAberto] = useState(false);
  const {
    medalhas,
    totalConquistadas,
    totalMedalhas,
    nivelMaker,
  } = useMedalhasMaker();

  return (
    <>
      <div className="rounded-2xl border border-borda-sutil bg-card p-5 md:p-6 flex flex-col gap-6 relative overflow-hidden group hover:shadow-premium transition-all duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] via-transparent to-sky-500/[0.02] pointer-events-none" />

        {/* Topo com Título e Estatísticas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Trophy size={22} className="text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-primary uppercase tracking-tight">
                  Medalhas & Conquistas
                </h3>
                <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                  100% Gratuito
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Classificação: <strong className={nivelMaker.classeCor}>{nivelMaker.titulo}</strong> • {totalConquistadas} de {totalMedalhas} medalhas acumuladas
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalAberto(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all self-start sm:self-auto cursor-pointer"
          >
            Abrir Sala de Troféus
          </button>
        </div>

        {/* Grid Compacto de Conquistas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {medalhas.map((m) => (
            <div
              key={m.id}
              onClick={() => setModalAberto(true)}
              className={`p-3 rounded-xl border transition-all cursor-pointer text-center flex flex-col items-center justify-between gap-2 ${
                m.desbloqueada
                  ? "border-amber-500/30 bg-amber-500/[0.04] hover:bg-amber-500/[0.08]"
                  : "border-border/40 bg-muted/10 opacity-50 hover:opacity-70"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  m.desbloqueada
                    ? `bg-gradient-to-br ${m.corPrimaria} text-white shadow-md`
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {m.desbloqueada ? <Sparkles size={16} /> : <Lock size={14} />}
              </div>

              <div className="w-full">
                <div className="text-[11px] font-bold text-foreground truncate">
                  {m.titulo}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
                  {m.desbloqueada ? (
                    <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> Conquistada
                    </span>
                  ) : (
                    <span>{m.progresso}%</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ModalSalaTrofeus
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
      />
    </>
  );
}
