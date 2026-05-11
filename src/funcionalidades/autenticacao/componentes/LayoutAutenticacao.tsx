import { ReactNode } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface PropsLayout {
  children: ReactNode;
  titulo?: string;
  linkVoltar?: string;
  textoVoltar?: string;
  larguraMaxima?: string; // 'max-w-5xl' | 'max-w-4xl' etc
  variante?: "sky" | "emerald";
}

export function LayoutAutenticacao({
  children,
  linkVoltar = "/",
  textoVoltar = "Voltar ao site",
  larguraMaxima = "max-w-5xl",
  variante = "sky",
}: PropsLayout) {
  const cores = {
    sky: {
      gradiente: "from-blue-900/20",
      grade: "rgba(14, 165, 233, 0.2)",
      subGrade: "rgba(14, 165, 233, 0.08)",
    },
    emerald: {
      gradiente: "from-emerald-900/20",
      grade: "rgba(16, 185, 129, 0.2)",
      subGrade: "rgba(16, 185, 129, 0.08)",
    },
  }[variante];

  return (
    <div className="min-h-screen w-full font-sans bg-[#050505] relative flex items-center justify-center p-4 overflow-hidden selection:bg-[#0ea5e9] selection:text-white">
      {/* Elementos de Design de Fundo (Padrão Global) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Grade Técnica Padronizada */}
        <div className="absolute inset-0 bg-grid-printlog opacity-[0.03] dark:opacity-[0.08]" />
        
        {/* Glows de Profundidade Premium */}
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-sky-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />
        
        {/* Gradiente Central de Foco */}
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${cores.gradiente} via-transparent to-transparent opacity-50`} />
      </div>

      {/* Link Voltar */}
      <nav className="absolute top-6 left-6 z-50">
        <a
          href={linkVoltar}
          className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
        >
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:bg-white/10 transition-all">
            {linkVoltar === "/" ? (
              <ArrowRight size={14} className="rotate-180" />
            ) : (
              <ArrowLeft size={14} />
            )}
          </div>
          {textoVoltar}
        </a>
      </nav>

      {/* Version Badge Bottom Right */}
      <div className="absolute bottom-4 right-6 text-zinc-800 text-[10px] uppercase tracking-widest font-mono z-0 hidden lg:block">
        PrintLog - Build 2026.4
      </div>

      {/* Card Principal */}
      <div
        className={`w-full ${larguraMaxima} min-h-[450px] bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex overflow-hidden relative z-10 animate-fade-in-up`}
      >
        {children}
      </div>
    </div>
  );
}
