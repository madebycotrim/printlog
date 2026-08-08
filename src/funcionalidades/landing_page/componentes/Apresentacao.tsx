import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  Fragment,
} from "react";
import {
  ArrowRight,
  Zap,
  Box,
  Clock,
  Check,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── Tipos ────────────────────────────────────────────────────────────── */
interface Linha {
  d: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cor: string;
}

/* ─── Emblema Flutuante (forwardRef para medição de posição) ── */
const EmblemaFlutuante = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    atraso?: string;
    className?: string;
    style?: React.CSSProperties;
  }
>(({ children, atraso: delay = "0s", className = "", style }, ref) => (
  <div
    ref={ref}
    className={`absolute bg-[#0c0c0e]/90 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl ${className}`}
    style={{
      animation: `flutuacaoApresentacao 5s ease-in-out infinite`,
      animationDelay: delay,
      ...style,
    }}
  >
    {children}
  </div>
));
EmblemaFlutuante.displayName = "EmblemaFlutuante";

/* ─── Auxiliar: obter rect relativo a um elemento pai ───────────────────── */
function rectRel(el: HTMLElement, pai: HTMLElement) {
  const er = el.getBoundingClientRect();
  const pr = pai.getBoundingClientRect();
  return {
    left: er.left - pr.left,
    top: er.top - pr.top,
    right: er.right - pr.left,
    bottom: er.bottom - pr.top,
    width: er.width,
    height: er.height,
    cx: er.left - pr.left + er.width / 2,
    cy: er.top - pr.top + er.height / 2,
  };
}

/* ─── Apresentação Principal ────────────────────────────────────────────────────────── */
export function Apresentacao() {
  const navegar = useNavigate();
  const [visivel, definirVisivel] = useState(false);
  const [rolagemY, definirRolagemY] = useState(0);
  const [tick, definirTick] = useState(0);
  const [linhas, definirLinhas] = useState<Linha[]>([]);

  // Refs para medição dinâmica de linhas
  const refEnvelope = useRef<HTMLDivElement>(null);
  const refCartao = useRef<HTMLDivElement>(null);
  const refEmblema1 = useRef<HTMLDivElement>(null); // Lucro Garantido (esquerda)
  const refEmblema2 = useRef<HTMLDivElement>(null); // Rolo no Fim (direita-baixo)
  const refEmblema3 = useRef<HTMLDivElement>(null); // Otimização (direita-cima)

  const calcularLinhas = useCallback(() => {
    const env = refEnvelope.current;
    const cart = refCartao.current;
    const emb1 = refEmblema1.current;
    const emb2 = refEmblema2.current;
    const emb3 = refEmblema3.current;
    if (!env || !cart) return;

    const cartao = rectRel(cart, env);
    const resultado: Linha[] = [];

    // Emblema 1 — Lucro Garantido (lado esquerdo) → borda esquerda do cartão
    if (emb1) {
      const b = rectRel(emb1, env);
      // Conecta borda direita do emblema à borda esquerda do cartão
      const x1 = b.right;
      const y1 = b.cy;
      const x2 = cartao.left;
      const y2 = cartao.top + cartao.height * 0.22;
      const cx1 = x1 + (x2 - x1) * 0.5;
      const cy1 = y1;
      const cx2 = x2 - (x2 - x1) * 0.3;
      const cy2 = y2;
      resultado.push({
        d: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
        x1,
        y1,
        x2,
        y2,
        cor: "rgba(16,185,129,0.55)",
      });
    }

    // Emblema 2 — Rolo no Fim (lado direito, baixo) → borda direita do cartão
    if (emb2) {
      const b = rectRel(emb2, env);
      const x1 = b.left;
      const y1 = b.cy;
      const x2 = cartao.right;
      const y2 = cartao.top + cartao.height * 0.78;
      const cx1 = x1 - (x1 - x2) * 0.5;
      const cy1 = y1;
      const cx2 = x2 + (x1 - x2) * 0.3;
      const cy2 = y2;
      resultado.push({
        d: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
        x1,
        y1,
        x2,
        y2,
        cor: "rgba(244,63,94,0.55)",
      });
    }

    // Emblema 3 — Otimização Automática (lado direito, cima) → borda direita do cartão
    if (emb3) {
      const b = rectRel(emb3, env);
      const x1 = b.left;
      const y1 = b.cy;
      const x2 = cartao.right;
      const y2 = cartao.top + cartao.height * 0.22;
      const cx1 = x1 - (x1 - x2) * 0.5;
      const cy1 = y1;
      const cx2 = x2 + (x1 - x2) * 0.3;
      const cy2 = y2;
      resultado.push({
        d: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
        x1,
        y1,
        x2,
        y2,
        cor: "rgba(99,102,241,0.55)",
      });
    }

    definirLinhas(resultado);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => definirVisivel(true), 80);
    const aoRolar = () => definirRolagemY(window.scrollY);
    window.addEventListener("scroll", aoRolar, { passive: true });
    const intervalo = setInterval(() => definirTick((p) => p + 1), 3200);

    // Medir após pintura
    const raf = requestAnimationFrame(() => {
      setTimeout(calcularLinhas, 200);
    });

    // Re-medir ao redimensionar
    const ro = new ResizeObserver(calcularLinhas);
    if (refEnvelope.current) ro.observe(refEnvelope.current);

    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", aoRolar);
      clearInterval(intervalo);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [calcularLinhas]);

  const precos = ["R$ 38,50", "R$ 42,00", "R$ 35,90", "R$ 51,20"];
  const precoAtual = precos[tick % precos.length];

  return (
    <>
      {/* ── Estilos ── */}
      <style>{`
                @keyframes flutuacaoApresentacao {
                    0%,100% { transform: translateY(0px) rotate(0deg); }
                    50%      { transform: translateY(-10px) rotate(0.5deg); }
                }
                @keyframes brilhoApresentacao {
                    0%,100% { opacity: .5; transform: scale(1); }
                    50%      { opacity: 1;  transform: scale(1.08); }
                }
                @keyframes pulsoApresentacao {
                    0%,100% { box-shadow: 0 0 0 0 rgba(14,165,233,.4); }
                    50%      { box-shadow: 0 0 0 12px rgba(14,165,233,0); }
                }
                @keyframes varreduraApresentacao {
                    0%   { transform: translateY(-100%); }
                    100% { transform: translateY(400%); }
                }
                @keyframes cintilanciaApresentacao {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
                @keyframes surgirCimaApresentacao {
                    from { opacity:0; transform:translateY(24px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes deslizarDireitaApresentacao {
                    from { opacity:0; transform:translateX(-24px); }
                    to   { opacity:1; transform:translateX(0); }
                }
                @keyframes deslizarEsquerdaApresentacao {
                    from { opacity:0; transform:translateX(24px); }
                    to   { opacity:1; transform:translateX(0); }
                }
                @keyframes virarPrecoApresentacao {
                    0%   { opacity:0; transform:translateY(-12px); }
                    15%  { opacity:1; transform:translateY(0); }
                    85%  { opacity:1; transform:translateY(0); }
                    100% { opacity:0; transform:translateY(12px); }
                }
                }
                @keyframes feixeApresentacao {
                    0%   { transform: translateX(-100%) skewX(-15deg); opacity:0; }
                    10%  { opacity:1; }
                    90%  { opacity:1; }
                    100% { transform: translateX(400%) skewX(-15deg); opacity:0; }
                }
                @keyframes marchaTraco {
                    to { stroke-dashoffset: -24; }
                }
                @keyframes pontoRolagemApresentacao {
                    0%   { opacity: 1; transform: translateY(0); }
                    60%  { opacity: 0; transform: translateY(10px); }
                    61%  { opacity: 0; transform: translateY(0); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes corridaLinhaApresentacao {
                    0%   { transform: translateX(-50%) translateY(0);    opacity: 0; }
                    10%  { opacity: 1; }
                    80%  { opacity: 1; }
                    100% { transform: translateX(-50%) translateY(36px); opacity: 0; }
                }

                .texto-cintilante-apresentacao {
                    background: linear-gradient(90deg, #38bdf8 0%, #7dd3fc 30%, #fff 50%, #7dd3fc 70%, #38bdf8 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: cintilanciaApresentacao 4s linear infinite;
                }
                .brilho-cartao-apresentacao {
                    box-shadow:
                        0 0 0 1px rgba(255,255,255,.06),
                        0 32px 80px -12px rgba(0,0,0,.9),
                        0 0 60px -20px rgba(14,165,233,.15);
                }
                .brilho-cartao-apresentacao:hover {
                    box-shadow:
                        0 0 0 1px rgba(14,165,233,.2),
                        0 40px 100px -12px rgba(0,0,0,.95),
                        0 0 80px -15px rgba(14,165,233,.3);
                }
                .linha-conector {
                    fill: none;
                    stroke-width: 1.5;
                    stroke-dasharray: 5 4;
                    animation: marchaTraco 1.4s linear infinite;
                }
            `}</style>

      <section
        id="apresentacao"
        className="relative h-[100dvh] min-h-[100dvh] flex flex-col justify-between pt-16 sm:pt-20 pb-4 lg:pt-28 lg:pb-24 overflow-hidden"
      >
        {/* Orbes de Brilho Dinâmicos */}
        <div
          className="absolute pointer-events-none hidden md:block"
          style={{
            top: "-10%",
            left: "50%",
            transform: `translateX(-50%) translateY(${rolagemY * 0.25}px)`,
            width: 800,
            height: 500,
            background:
              "radial-gradient(ellipse, rgba(14,165,233,.15) 0%, transparent 70%)",
            animation: "brilhoApresentacao 6s ease-in-out infinite",
            zIndex: 1,
          }}
        />

        {/* ── Conteúdo ── */}
        <div className="container mx-auto px-4 sm:px-6 z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 xl:gap-32 items-center my-auto flex-1 flex flex-col justify-center">
          {/* ── ESQUERDA — Apresentação Mobile Dedicada & Desktop ── */}
          <div
            className="flex flex-col items-start text-left w-full max-w-xl lg:max-w-none mx-auto lg:mx-0 pt-2 sm:pt-4 lg:pt-0"
            style={{
              animation: visivel
                ? "surgirCimaApresentacao .8s ease both"
                : "none",
            }}
          >
            {/* Tag Discreta de Posicionamento */}
            <div className="inline-flex items-center gap-2 text-sky-400/90 text-[10px] sm:text-xs font-mono font-bold tracking-[0.18em] uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              Gestão Técnica de Impressão 3D
            </div>

            {/* Título Principal */}
            <h1
              className="font-black leading-[.92] tracking-tighter mb-3 lg:mb-6 uppercase text-left"
              style={{
                fontSize: "clamp(2.3rem, 7.5vw, 5.5rem)",
                animation: visivel
                  ? "surgirCimaApresentacao .8s .2s ease both"
                  : "none",
                opacity: 0,
              }}
            >
              <span className="text-white block">Transforme</span>
              <span className="texto-cintilante-apresentacao block italic">
                Filamento
              </span>
              <span className="text-white block">em Lucro.</span>
            </h1>

            {/* Subtítulo */}
            <p
              className="text-zinc-400 text-xs sm:text-base lg:text-lg leading-relaxed mb-4 lg:mb-8 max-w-lg text-left"
              style={{
                animation: visivel
                  ? "surgirCimaApresentacao .8s .35s ease both"
                  : "none",
                opacity: 0,
              }}
            >
              Dê adeus ao <span className="text-white font-semibold">"chutômetro"</span>. 
              Calcule custos reais de energia, resina, filamento e margem líquida com precisão e dignidade.
            </p>

            {/* Chamadas para Ação (CTAs) */}
            <div
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch mb-5"
              style={{
                animation: visivel
                  ? "surgirCimaApresentacao .8s .55s ease both"
                  : "none",
                opacity: 0,
              }}
            >
              <button
                onClick={() => navegar("/cadastro")}
                className="group relative w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm tracking-wide uppercase overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-95 touch-target"
                style={{
                  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
                  color: "#fff",
                  animation: "pulsoApresentacao 2.5s ease-in-out infinite",
                  boxShadow: "0 0 40px -8px rgba(14,165,233,.6)",
                }}
              >
                <div
                  className="absolute inset-0 w-1/3 h-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent)",
                    animation: "feixeApresentacao 3s ease-in-out infinite 1s",
                  }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Começar Grátis
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </div>

            {/* Métricas de Propaganda Discreta em Texto Puro (Exibido Apenas no Mobile) */}
            <div className="grid lg:hidden grid-cols-3 gap-2 sm:gap-4 w-full py-3 border-y border-white/10 my-3 text-left">
              <div>
                <div className="text-lg sm:text-2xl font-black text-sky-400 font-mono tracking-tight">100%</div>
                <div className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Precisão Custos</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">+85%</div>
                <div className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Lucro Real Médio</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-indigo-400 font-mono tracking-tight">Zero</div>
                <div className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Chutômetro</div>
              </div>
            </div>

            {/* Selo de Confiança */}
            <div
              className="mt-3 lg:mt-8 flex items-center gap-3 w-full justify-start"
              style={{
                animation: visivel
                  ? "surgirCimaApresentacao .8s .65s ease both"
                  : "none",
                opacity: 0,
              }}
            >
              <div className="w-full p-3 rounded-xl bg-white/[0.02] border border-white/5 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider">Compromisso Ético PrintLog</span>
                </div>
                <p className="text-zinc-500 text-[10px] sm:text-[11px] leading-relaxed italic">
                  "Transparência em primeiro lugar — 100% gratuito e em constante evolução junto com a comunidade 3D brasileira."
                </p>
              </div>
            </div>
          </div>

          {/* ── DIREITA — Mockup (Exibido EXCLUSIVAMENTE em Desktop/Telas Grandes para não poluir a primeira dobra no mobile) ── */}
          <div
            ref={refEnvelope}
            className="hidden lg:flex relative items-center justify-center w-full px-0 lg:px-12 py-4 lg:py-16"
            style={{
              animation: visivel
                ? "deslizarEsquerdaApresentacao .9s .3s ease both"
                : "none",
              opacity: 0,
              overflow: "visible",
            }}
          >
            {/* Brilho atrás do cartão */}
            <div
              className="absolute pointer-events-none hidden md:block"
              style={{
                inset: "-40px",
                background:
                  "radial-gradient(ellipse at center, rgba(14,165,233,.12) 0%, transparent 65%)",
                animation: "brilhoApresentacao 5s ease-in-out infinite",
              }}
            />

            {/* ── Linhas conectoras SVG dinâmicas ── */}
            {linhas.length > 0 && (
              <svg
                className="absolute pointer-events-none hidden lg:block"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  overflow: "visible",
                  zIndex: 15,
                }}
              >
                {linhas.map((l, i) => (
                  <g key={i}>
                    <path
                      className="linha-conector"
                      d={l.d}
                      stroke={l.cor}
                      style={{ animationDelay: `${i * 0.45}s` }}
                    />
                    {/* Ponto no final do emblema */}
                    <circle cx={l.x1} cy={l.y1} r="3.5" fill={l.cor} />
                    {/* Ponto no final do cartão */}
                    <circle cx={l.x2} cy={l.y2} r="3.5" fill={l.cor} />
                    {/* Ponto de brilho sutil no final do cartão */}
                    <circle
                      cx={l.x2}
                      cy={l.y2}
                      r="6"
                      fill={l.cor}
                      opacity="0.2"
                    />
                  </g>
                ))}
              </svg>
            )}

            {/* ── Cartão Principal ── */}
            <div
              ref={refCartao}
              className="relative brilho-cartao-apresentacao rounded-2xl w-full max-w-[380px] p-5 sm:p-7"
              style={{
                background: "linear-gradient(145deg, #0e0e12, #0a0a0d)",
                border: "1px solid rgba(255,255,255,.07)",
              }}
            >
              {/* Linha de varredura */}
              <div
                className="absolute left-0 right-0 h-px pointer-events-none overflow-hidden rounded-2xl"
                style={{ top: 0, bottom: 0 }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: "1px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(14,165,233,.6), transparent)",
                    animation: "varreduraApresentacao 4s ease-in-out infinite",
                  }}
                />
              </div>

              {/* Cabeçalho do Cartão */}
              <div
                className="flex justify-between items-start mb-6 pb-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
              >
                <div>
                  <div className="text-white font-bold text-base tracking-tight">
                    Peça Final
                  </div>
                  <div className="text-zinc-500 text-xs mt-0.5">
                    Vaso Decorativo (PLA)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                    Preço Final
                  </div>
                  <div
                    key={precoAtual}
                    className="text-3xl font-black font-mono tracking-tighter group-hover:text-sky-400 transition-colors"
                    style={{
                      color: "#fff",
                      animation: "virarPrecoApresentacao 3.2s ease both",
                    }}
                  >
                    {precoAtual}
                  </div>
                </div>
              </div>

              {/* Detalhamento de Custos */}
              {/* Detalhamento de Custos - Layout de Colunas */}
              <div className="flex items-center justify-between gap-2 mb-8 px-1">
                {[
                  {
                    Icon: Zap,
                    label: "Energia",
                    value: "R$ 5,20",
                    color: "#0ea5e9",
                    bg: "rgba(14,165,233,.1)",
                    border: "rgba(14,165,233,.2)",
                  },
                  {
                    Icon: Box,
                    label: "Material",
                    value: "R$ 12,80",
                    color: "#f97316",
                    bg: "rgba(249,115,22,.1)",
                    border: "rgba(249,115,22,.2)",
                  },
                  {
                    Icon: Clock,
                    label: "Setup",
                    value: "R$ 3,00",
                    color: "#a78bfa",
                    bg: "rgba(167,139,250,.1)",
                    border: "rgba(167,139,250,.2)",
                  },
                ].map((item, index) => (
                  <Fragment key={item.label}>
                    <div className="text-center group/item cursor-default flex-1">
                      <div
                        className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2.5 transition-all duration-300 group-hover/item:scale-110 shadow-[0_0_15px_-5px_transparent] group-hover/item:shadow-[0_0_15px_-5px_var(--shadow-cor)]"
                        style={
                          {
                            background: item.bg,
                            border: `1px solid ${item.border}`,
                            "--shadow-cor": item.color,
                          } as React.CSSProperties
                        }
                      >
                        <item.Icon
                          className="w-5 h-5"
                          style={{ color: item.color }}
                          strokeWidth={2}
                        />
                      </div>
                      <div className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest mb-1">
                        {item.label}
                      </div>
                      <div
                        className="text-white font-bold font-mono text-base md:text-lg tracking-tight hover:text-white/90 transition-colors"
                        style={{ textShadow: `0 0 10px ${item.color}40` }}
                      >
                        {item.value}
                      </div>
                    </div>
                    {/* Divisor */}
                    {index < 2 && (
                      <div className="w-px h-10 bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />
                    )}
                  </Fragment>
                ))}
              </div>

              {/* Barra de Lucro */}
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "rgba(16,185,129,.06)",
                  border: "1px solid rgba(16,185,129,.15)",
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">
                      Lucro Real
                    </div>
                    <div className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">
                      85%
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105"
                    style={{ background: "#fff", color: "#000" }}
                  >
                    Ver Detalhes
                  </button>
                </div>
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: 6, background: "rgba(255,255,255,.06)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "85%",
                      background: "linear-gradient(90deg, #10b981, #34d399)",
                      boxShadow: "0 0 12px rgba(16,185,129,.5)",
                      transition: "width 1.5s ease",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ── Emblema: Lucro Garantido (esquerda-cima) ── */}
            <EmblemaFlutuante
              ref={refEmblema1}
              atraso="0s"
              className="hidden lg:flex items-center gap-3 p-3.5 pr-5"
              style={{ top: "40px", left: "-120px", zIndex: 20 }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(16,185,129,.12)",
                  border: "1px solid rgba(16,185,129,.25)",
                }}
              >
                <Check className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-0.5">
                  Status
                </div>
                <div className="text-white font-bold text-sm">
                  Lucro Garantido
                </div>
              </div>
            </EmblemaFlutuante>

            {/* ── Emblema: Rolo no Fim (direita-baixo) ── */}
            <EmblemaFlutuante
              ref={refEmblema2}
              atraso="2s"
              className="hidden lg:block p-4"
              style={{
                bottom: "40px",
                right: "-120px",
                width: 230,
                zIndex: 20,
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(244,63,94,.1)",
                      border: "1px solid rgba(244,63,94,.2)",
                    }}
                  >
                    <AlertTriangle
                      className="w-4 h-4 text-rose-400"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">
                      Alerta
                    </div>
                    <div className="text-white font-bold text-sm">
                      Rolo no Fim
                    </div>
                  </div>
                </div>
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded"
                  style={{
                    color: "#fb7185",
                    background: "rgba(244,63,94,.12)",
                    border: "1px solid rgba(244,63,94,.2)",
                  }}
                >
                  15%
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">PLA Silk Dourado</span>
                  <span className="text-white font-mono font-bold">150g</span>
                </div>
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: 5, background: "rgba(255,255,255,.06)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "15%",
                      background: "#f43f5e",
                      boxShadow: "0 0 8px rgba(244,63,94,.5)",
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                  <Check className="w-3 h-3 text-emerald-400" strokeWidth={2} />
                  Suficiente para esta impressão (112g)
                </div>
              </div>
            </EmblemaFlutuante>

            {/* ── Emblema: Otimização Automática (direita-cima) ── */}
            <EmblemaFlutuante
              ref={refEmblema3}
              atraso="1s"
              className="hidden xl:flex items-center gap-2.5 px-4 py-3"
              style={{ top: "40px", right: "-120px", zIndex: 20 }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm"
                style={{
                  background: "rgba(99,102,241,.12)",
                  border: "1px solid rgba(99,102,241,.25)",
                }}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-0.5">
                  Otimização
                </div>
                <div className="text-white font-semibold text-xs">
                  Preço Sugerido
                </div>
              </div>
            </EmblemaFlutuante>
          </div>
        </div>

        {/* ── Indicador de Rolagem Vertical (Exibido em todas as telas) ── */}
        <div
          className="flex absolute bottom-3 lg:bottom-8 left-1/2 -translate-x-1/2 items-end gap-3 cursor-pointer group/scroll z-20 select-none"
          style={{
            animation: visivel
              ? "surgirCimaApresentacao .8s .9s ease both"
              : "none",
            opacity: 0,
          }}
          onClick={() =>
            window.scrollBy({ top: window.innerHeight, behavior: "smooth" })
          }
        >
          {/* Rótulo rotacionado */}
          <span
            className="text-[9px] uppercase font-bold transition-colors duration-300 group-hover/scroll:text-sky-400"
            style={{
              color: "rgba(255,255,255,.2)",
              letterSpacing: "0.3em",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
            }}
          >
            Role para descobrir
          </span>

          {/* Linha vertical animada */}
          <div
            className="relative flex flex-col items-center"
            style={{ height: 64 }}
          >
            {/* Trilho */}
            <div
              className="absolute inset-x-0 top-0 bottom-0 mx-auto"
              style={{ width: 1, background: "rgba(255,255,255,.07)" }}
            />
            {/* Corredor brilhante */}
            <div
              style={{
                animation: "corridaLinhaApresentacao 1.8s ease-in-out infinite",
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <div
                style={{
                  width: 1,
                  height: 28,
                  background: "linear-gradient(180deg, transparent, #0ea5e9)",
                }}
              />
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#38bdf8",
                  boxShadow: "0 0 10px 3px rgba(14,165,233,.7)",
                  marginLeft: -2,
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
