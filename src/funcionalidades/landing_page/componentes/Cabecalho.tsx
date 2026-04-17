import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { LayoutDashboard } from "lucide-react";

export function Cabecalho() {
  const { usuario, carregando } = usarAutenticacao();
  const [rolouTela, definirRolouTela] = useState(false);
  const [menuMobileAberto, definirMenuMobileAberto] = useState(false);

  useEffect(() => {
    const lidarRolagem = () => {
      definirRolouTela(window.scrollY > 20);
    };

    window.addEventListener("scroll", lidarRolagem);
    return () => window.removeEventListener("scroll", lidarRolagem);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
          rolouTela
            ? "bg-[#050505]/95 backdrop-blur-xl border-zinc-800/80 py-3 shadow-lg shadow-black/20"
            : "bg-transparent border-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer group relative z-50"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img src="/logo-colorida.png" alt="Logo PrintLog" className="h-8 w-auto" />
            <span className="text-white font-black text-xl tracking-tighter">
              PRINTLOG{" "}
              <span className="text-[#0ea5e9] text-xs not-italic font-bold bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 align-top ml-1 animate-pulse">
                BETA
              </span>
            </span>
          </div>

          {/* Ações Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            {!carregando && usuario ? (
              <Link
                to="/dashboard"
                className="relative px-6 py-2.5 bg-white text-zinc-950 font-bold rounded-lg text-sm transition-all duration-300 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-3px_rgba(255,255,255,0.5)] uppercase tracking-wide transform hover:-translate-y-0.5 hover:scale-105 flex items-center gap-2 group"
              >
                <LayoutDashboard size={16} className="text-sky-500" />
                <span className="relative z-10">Ir para o Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/cadastro"
                  className="text-sm font-bold text-zinc-400 hover:text-white transition-all duration-300 uppercase tracking-wide relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-sky-500 after:to-blue-500 hover:after:w-full after:transition-all after:duration-300"
                >
                  Criar Conta
                </Link>
                <Link
                  to="/login"
                  className="relative px-6 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white font-bold rounded-lg text-sm transition-all duration-300 shadow-[0_0_20px_-5px_rgba(14,165,233,0.6)] hover:shadow-[0_0_30px_-3px_rgba(14,165,233,0.9)] uppercase tracking-wide transform hover:-translate-y-0.5 hover:scale-105 overflow-hidden group"
                >
                  <span className="relative z-10">Entrar</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </Link>
              </>
            )}
          </div>

          {/* Botão Menu Mobile */}
          <button
            onClick={() => definirMenuMobileAberto(!menuMobileAberto)}
            className="lg:hidden relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5 transition-all duration-300"
            aria-label="Alternar menu"
          >
            <span
              className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${menuMobileAberto ? "rotate-45 translate-y-2" : ""}`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${menuMobileAberto ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${menuMobileAberto ? "-rotate-45 -translate-y-2" : ""}`}
            ></span>
          </button>
        </div>
      </header>

      {/* Overlay Menu Mobile */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${menuMobileAberto ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => definirMenuMobileAberto(false)} />

        <div className="relative h-full flex flex-col items-center justify-center gap-8 p-6">
          <div
            className={`flex flex-col items-center gap-4 w-full max-w-xs transition-all duration-500 ${menuMobileAberto ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            style={{ transitionDelay: "200ms" }}
          >
            <Link
              to="/cadastro"
              className="w-full text-center px-8 py-4 border-2 border-sky-500 text-sky-400 font-bold rounded-lg text-sm uppercase tracking-wide transition-all duration-300 hover:bg-sky-500/10"
            >
              Criar Conta
            </Link>
            <Link
              to="/login"
              className="w-full text-center px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-lg text-sm uppercase tracking-wide shadow-[0_0_30px_rgba(14,165,233,0.4)]"
            >
              Entrar
            </Link>
          </div>

          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sky-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        </div>
      </div>
    </>
  );
}
