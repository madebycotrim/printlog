import { ReactNode } from "react";

interface PropsPainelBranding {
  titulo: ReactNode;
  descricao: string;
  beneficios?: ReactNode;
  largura?: string; // ex: 'w-1/2' ou 'w-5/12'
  fundoEfeito?: "blue" | "emerald"; // Cor do blob de fundo
}

export function PainelBranding({
  titulo,
  descricao,
  beneficios,
  largura = "w-1/2",
  fundoEfeito = "blue",
}: PropsPainelBranding) {
  return (
    <div
      className={`hidden lg:flex ${largura} relative flex-col justify-between p-12 overflow-hidden border-r border-white/5 bg-black/20`}
    >
      {/* Efeito interno sutil */}
      <div
        className={`absolute top-0 right-0 w-64 h-64 ${fundoEfeito === "blue" ? "bg-blue-500/10" : "bg-emerald-500/10"} blur-[80px] rounded-full pointer-events-none`}
      ></div>

      {/* Logo */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 backdrop-blur-md shadow-lg">
            <img
              src="/logo-colorida.png"
              alt="Logo"
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">
            PRINTLOG
            <span className="text-[#0ea5e9] text-[10px] align-top ml-1 font-bold px-1.5 py-0.5 bg-[#0ea5e9]/10 rounded uppercase tracking-wide border border-[#0ea5e9]/10">
              Beta
            </span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 my-auto">
        <div className="text-4xl font-bold leading-relaxed mb-6 text-white drop-shadow-sm">
          {titulo}
        </div>
        <p className="text-zinc-400 text-base leading-relaxed mb-8 max-w-sm">
          {descricao}
        </p>

        {beneficios && <div className="space-y-4">{beneficios}</div>}
      </div>

      {/* Footer - Legal */}
      <div className="relative z-10 flex gap-6 text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
        <a
          href="/seguranca-e-privacidade"
          className="hover:text-zinc-400 transition-colors"
        >
          Segurança e Privacidade
        </a>
      </div>
    </div>
  );
}
