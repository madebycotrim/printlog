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
}: PropsPainelBranding) {
  return (
    <div
      className={`hidden lg:flex ${largura} relative flex-col justify-between p-12 overflow-hidden border-r border-white/5 bg-black/20`}
    >

      {/* Logo */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-3">
          <img
            src="/logo-branca.png"
            alt="Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="text-xl font-black tracking-tighter text-white">
            PRINTLOG
            <span className="text-[#0ea5e9] text-[10px] align-top ml-1 font-bold px-1.5 py-0.5 bg-[#0ea5e9]/10 rounded uppercase tracking-wide border border-[#0ea5e9]/10">
              Beta
            </span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 my-auto py-8">
        <div className="text-5xl font-bold leading-[1.15] mb-8 text-white drop-shadow-sm">
          {titulo}
        </div>
        <p className="text-zinc-400 text-base leading-relaxed mb-12 max-w-md">
          {descricao}
        </p>

        {beneficios && <div className="space-y-6">{beneficios}</div>}
      </div>

      {/* Footer - Legal */}
      <div className="relative z-10 flex gap-6 text-[10px] uppercase tracking-widest text-zinc-600 font-bold mt-12">
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
