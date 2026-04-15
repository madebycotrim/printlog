import { LucideIcon, ArrowUpRight } from "lucide-react";
import { ElementType } from "react";

interface PropriedadesCardResumo {
  titulo: string;
  valor: string | number;
  unidade?: string;
  icone: LucideIcon | ElementType;
  cor?: "indigo" | "rose" | "emerald" | "sky" | "amber" | "violet" | "zinc";
  aoClicar?: () => void;
  textoAcao?: string;
  carregando?: boolean;
}

/**
 * 📊 CardResumo - Componente Padronizado v9.0
 * Unifica a estética de indicadores em todo o sistema.
 */
export function CardResumo({
  titulo,
  valor,
  unidade,
  icone: Icone,
  cor = "zinc",
  aoClicar,
  textoAcao,
  carregando = false,
}: PropriedadesCardResumo) {
  const mapaCores = {
    indigo: {
      texto: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/10 dark:border-indigo-500/20",
      hover: "hover:border-indigo-500/30",
    },
    rose: {
      texto: "text-rose-500",
      bg: "bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/10 dark:border-rose-500/20",
      hover: "hover:border-rose-500/30",
    },
    emerald: {
      texto: "text-emerald-500",
      bg: "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/10 dark:border-emerald-500/20",
      hover: "hover:border-emerald-500/30",
    },
    sky: {
      texto: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/5 dark:bg-sky-500/10 border-sky-500/10 dark:border-sky-500/20",
      hover: "hover:border-sky-500/30",
    },
    amber: {
      texto: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/10 dark:border-amber-500/20",
      hover: "hover:border-amber-500/30",
    },
    violet: {
      texto: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/5 dark:bg-violet-500/10 border-violet-500/10 dark:border-violet-500/20",
      hover: "hover:border-violet-500/30",
    },
    zinc: {
      texto: "text-zinc-500",
      bg: "bg-zinc-500/5 dark:bg-zinc-500/10 border-zinc-500/10 dark:border-zinc-500/20",
      hover: "hover:border-zinc-500/30",
    },
  };

  const estilo = mapaCores[cor];
  const Container = aoClicar ? "button" : "div";

  return (
    <Container
      onClick={aoClicar}
      className={`
                bg-white/50 dark:bg-[var(--bg-card)] backdrop-blur-sm border border-gray-100 dark:border-[var(--border-subtle)] 
                p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden group transition-all text-left
                ${aoClicar ? `${estilo.hover} cursor-pointer active:scale-[0.98]` : ""}
            `}
    >
      {/* Indicador de Ação (Apenas se tiver aoClicar) */}
      {aoClicar && (
        <div
          className={`absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 ${estilo.texto}`}
        >
          {textoAcao && <span className="text-[7px] font-black uppercase tracking-widest">{textoAcao}</span>}
          <ArrowUpRight size={10} />
        </div>
      )}

      {/* Ícone */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center border relative z-10 transition-transform group-hover:scale-110 duration-300 ${estilo.bg} ${estilo.texto}`}
      >
        <Icone size={24} strokeWidth={2.5} />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10">
        <h4 className="text-[10px] font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-0.5">
          {titulo}
        </h4>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span
            className={`text-2xl font-black tracking-tight ${carregando ? "skeleton h-8 w-12 rounded-lg" : "text-gray-900 dark:text-[var(--text-primary)]"}`}
          >
            {!carregando && valor}
          </span>
          {unidade && !carregando && (
            <span className="text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest">
              {unidade}
            </span>
          )}
        </div>
      </div>

      {/* Ícone de Fundo Decorativo */}
      <Icone
        className="absolute -right-6 -bottom-6 text-gray-100 dark:text-white/[0.02] transition-transform group-hover:scale-110 group-hover:-rotate-12 duration-500 pointer-events-none"
        size={100}
        strokeWidth={1}
      />
    </Container>
  );
}

/**
 * 📦 CardResumoVazio - Placeholder padronizado
 */
export function CardResumoVazio({
  texto = "MAIS INDICADORES EM BREVE",
  icone: Icone,
}: {
  texto?: string;
  icone: ElementType;
}) {
  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-950/40 border border-dashed border-gray-200 dark:border-white/10 p-6 rounded-2xl flex items-center justify-center relative overflow-hidden group transition-all">
      <div className="flex flex-col items-center gap-2 text-gray-300 dark:text-zinc-700 relative z-10 transition-colors group-hover:text-gray-400 dark:group-hover:text-zinc-500 text-center">
        <Icone size={24} className="opacity-40" />
        <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">{texto}</span>
      </div>
    </div>
  );
}
