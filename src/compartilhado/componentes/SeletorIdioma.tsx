import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useIdioma } from "@/compartilhado/hooks/useIdioma";
import { CodigoIdioma } from "@/configuracoes/i18n";
import { BandeiraPais } from "./BandeiraPais";

interface PropriedadesSeletorIdioma {
  variante?: "compacto" | "completo";
  direcao?: "auto" | "cima" | "baixo";
  className?: string;
}

export function SeletorIdioma({
  variante = "compacto",
  direcao = "auto",
  className = "",
}: PropriedadesSeletorIdioma) {
  const { idiomaAtual, mudarIdioma, idiomas, t, i18n } = useIdioma();
  const [aberto, setAberto] = useState(false);
  const [abrirParaCima, setAbrirParaCima] = useState(direcao === "cima");
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function lidarCliqueFora(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    if (aberto) {
      document.addEventListener("mousedown", lidarCliqueFora);
    }
    return () => {
      document.removeEventListener("mousedown", lidarCliqueFora);
    };
  }, [aberto]);

  // Posicionamento inteligente adaptável (cima vs baixo) e detecção de viewport
  useEffect(() => {
    if (!aberto || !containerRef.current) return;

    if (direcao === "cima") {
      setAbrirParaCima(true);
      return;
    }
    if (direcao === "baixo") {
      setAbrirParaCima(false);
      return;
    }

    function recalcularPosicao() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const espacoAbaixo = window.innerHeight - rect.bottom;
      const espacoAcima = rect.top;
      const alturaMinima = 230;

      if (espacoAbaixo < alturaMinima && espacoAcima > espacoAbaixo) {
        setAbrirParaCima(true);
      } else {
        setAbrirParaCima(false);
      }
    }

    recalcularPosicao();

    window.addEventListener("scroll", recalcularPosicao, { passive: true });
    window.addEventListener("resize", recalcularPosicao);

    return () => {
      window.removeEventListener("scroll", recalcularPosicao);
      window.removeEventListener("resize", recalcularPosicao);
    };
  }, [aberto, direcao]);

  // Executa troca de idioma e sincroniza rota internacional se estiver na Landing Page
  const lidarTrocaIdioma = async (codigo: CodigoIdioma, rotulo: string) => {
    await mudarIdioma(codigo);
    setAberto(false);

    // Se estiver na Landing Page (/ ou /en ou /es ou /pt), sincroniza a URL correspondente
    const caminho = location.pathname;
    const rotasLanding = ["/", "/en", "/es", "/pt"];
    if (rotasLanding.includes(caminho)) {
      if (codigo === "en-US" && caminho !== "/en") {
        navigate("/en", { replace: true });
      } else if (codigo === "es-ES" && caminho !== "/es") {
        navigate("/es", { replace: true });
      } else if (codigo === "pt-BR" && caminho !== "/") {
        navigate("/", { replace: true });
      }
    }

    const mensagensSalvo: Record<string, string> = {
      "pt-BR": "Preferência salva no seu perfil e sincronizada entre dispositivos.",
      "en-US": "Preference saved to your profile and synced across devices.",
      "es-ES": "Preferencia guardada en su perfil y sincronizada entre dispositivos.",
    };
    const descricao = mensagensSalvo[codigo] || i18n.t("idiomas.salvoNuvem", { lng: codigo });
    toast.dismiss("toast-seletor-idioma");
    toast.success(rotulo, {
      id: "toast-seletor-idioma",
      description: descricao,
    });
  };

  const idiomaSelecionado = idiomas.find((i) => i.codigo === idiomaAtual) || idiomas[0];

  // Variante COMPACTA: Ideal para o Cabeçalho (Header) e Rodapé (Footer)
  if (variante === "compacto") {
    return (
      <div
        ref={containerRef}
        data-seletor-idioma="true"
        className={`relative ${aberto ? "z-[9999]" : "z-20"} ${className}`}
      >
        <button
          type="button"
          id="btn-seletor-idioma"
          aria-haspopup="listbox"
          aria-expanded={aberto}
          aria-label={t("idiomas.selecionar")}
          onClick={() => setAberto((prev) => !prev)}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border border-borda-sutil bg-card/60 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 transition-all duration-200 text-xs font-bold shadow-xs active:scale-95"
        >
          <BandeiraPais
            codigo={idiomaSelecionado.codigo}
            className="w-4 h-2.5 rounded-[2px] shadow-xs shrink-0 ring-1 ring-black/10 dark:ring-white/15"
          />
          <span className="uppercase text-[10px] font-black tracking-wider text-zinc-600 dark:text-zinc-300">
            {idiomaSelecionado.codigo.split("-")[0]}
          </span>
          <ChevronDown
            size={12}
            className={`text-zinc-400 transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {aberto && (
            <motion.div
              initial={{ opacity: 0, y: abrirParaCima ? 8 : -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: abrirParaCima ? 8 : -8, scale: 0.96 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              role="listbox"
              className={`absolute right-0 w-48 rounded-2xl bg-card/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-borda-sutil dark:border-zinc-800 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] py-1.5 z-[9999] overflow-hidden ${
                abrirParaCima
                  ? "bottom-full mb-2 origin-bottom-right"
                  : "top-full mt-2 origin-top-right"
              }`}
            >
              <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-400 border-b border-borda-sutil/60 flex items-center gap-1.5">
                <Globe size={11} />
                <span>{t("idiomas.titulo")}</span>
              </div>

              <div className="p-1 space-y-0.5">
                {idiomas.map((item) => {
                  const ativo = item.codigo === idiomaAtual;
                  return (
                    <button
                      key={item.codigo}
                      role="option"
                      aria-selected={ativo}
                      onClick={() => lidarTrocaIdioma(item.codigo as CodigoIdioma, item.rotulo)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        ativo
                          ? "bg-primary/10 text-primary font-bold dark:bg-white/10 dark:text-white"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <BandeiraPais
                          codigo={item.codigo}
                          className="w-5 h-3.5 rounded-[2px] shadow-xs shrink-0 ring-1 ring-black/10 dark:ring-white/15"
                        />
                        <div className="flex flex-col text-left">
                          <span className="leading-tight">{item.rotulo}</span>
                          <span className="text-[9px] text-zinc-400 font-normal leading-tight">
                            {item.pais}
                          </span>
                        </div>
                      </div>
                      {ativo && <Check size={14} className="text-primary dark:text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Variante COMPLETA: Ideal para a Página de Configurações
  return (
    <div data-seletor-idioma="true" className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {idiomas.map((item) => {
          const ativo = item.codigo === idiomaAtual;
          return (
            <button
              key={item.codigo}
              type="button"
              onClick={() => lidarTrocaIdioma(item.codigo as CodigoIdioma, item.rotulo)}
              className={`relative flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-200 ${
                ativo
                  ? "border-primary/50 bg-primary/5 shadow-xs dark:bg-white/5 dark:border-white/30 ring-1 ring-primary/30 dark:ring-white/20"
                  : "border-borda-sutil bg-card hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-white/[0.02]"
              }`}
            >
              <BandeiraPais
                codigo={item.codigo}
                className="w-8 h-5.5 rounded-[3px] shadow-sm shrink-0 ring-1 ring-black/10 dark:ring-white/15"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                  {item.rotulo}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5 truncate">
                  {item.pais}
                </p>
              </div>
              {ativo && (
                <div className="w-5 h-5 rounded-full bg-primary dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
        <span>{t("idiomas.salvoNuvem")}</span>
      </p>
    </div>
  );
}
