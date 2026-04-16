import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function Rodape() {
  return (
    <>
      {/* Rodapé */}
      <footer className="bg-black py-12 border-t border-zinc-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent"></div>
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[200px] bg-sky-500/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-8">
            {/* Marca */}
            <div>
              <div className="flex items-center gap-3 mb-5 group cursor-pointer w-fit">
                <img
                  src="/logo-colorida.png"
                  alt="PrintLog"
                  className="h-8 w-auto"
                />
                <span className="text-white font-black text-xl tracking-tighter">
                  PRINTLOG{" "}
                  <span className="text-[#0ea5e9] text-xs not-italic font-bold bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 align-top ml-1 animate-pulse">
                    BETA
                  </span>
                </span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                Sistema de gestão para makers 3D. Calcule com
                precisão seus custos de impressão e maximize seus lucros.
              </p>
            </div>

            {/* Contato */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
                <div className="w-4 h-px bg-gradient-to-r from-sky-400 to-blue-600"></div>
                Contato
              </h4>
              <a
                href="mailto:contato@printlog.com.br"
                className="group flex items-center gap-3 text-zinc-500 text-sm hover:text-sky-400 transition-all duration-200"
              >
                <div className="w-9 h-9 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 group-hover:border-sky-500/50 group-hover:bg-sky-500/10 transition-all duration-300 shrink-0">
                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
                contato@printlog.com.br
              </a>
            </div>
          </div>

          {/* Barra Inferior */}

          <div className="pt-8 mt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 text-zinc-500 text-xs">
              <span>© 2026 PrintLog. Todos os direitos reservados.</span>

              {/* Separador Desktop - Oculto em mobile */}
              <span className="hidden md:block w-px h-3 bg-white/10 mx-2"></span>

              <div className="flex flex-wrap justify-center gap-6">
                <Link
                  to="/seguranca-e-privacidade"
                  className="hover:text-sky-400 transition-colors duration-300"
                >
                  Segurança e Privacidade
                </Link>
                <Link
                  to="/politica-de-privacidade"
                  className="hover:text-sky-400 transition-colors duration-300"
                >
                  Política de Privacidade
                </Link>
                <Link
                  to="/termos-de-uso"
                  className="hover:text-sky-400 transition-colors duration-300"
                >
                  Termos de Uso
                </Link>
              </div>
            </div>

            <a
              href="https://madebycotrim.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/10"
            >
              <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white uppercase tracking-widest transition-colors">
                MADEBYCOTRIM
              </span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
