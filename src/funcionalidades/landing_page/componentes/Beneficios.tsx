import { useEffect, useState, useRef } from "react";
import { AlertTriangle, Zap, OctagonAlert, Hourglass } from "lucide-react";

type Beneficio = {
  Icone: React.ElementType;
  titulo: string;
  descricao: string;
  atraso: string;
};

const beneficios: Beneficio[] = [
  {
    Icone: AlertTriangle,
    titulo: "Precificação Errada",
    descricao:
      "Vender barato demais e pagar para trabalhar? Nunca mais. Saiba seu custo real.",
    atraso: "0ms",
  },
  {
    Icone: Zap,
    titulo: "Energia Ignorada",
    descricao:
      "A conta de luz pode representar uma parcela significativa do custo. Ignorar isso é fatal para o seu negócio.",
    atraso: "100ms",
  },
  {
    Icone: OctagonAlert,
    titulo: "Falhas de Impressão",
    descricao:
      "Registre as falhas e inclua na margem de risco automaticamente no preço.",
    atraso: "200ms",
  },
  {
    Icone: Hourglass,
    titulo: "Estoque Parado",
    descricao:
      "Filamento velho absorve umidade e estraga suas peças. Controle seu giro.",
    atraso: "300ms",
  },
];

export function Beneficios() {
  const [visivel, definirVisivel] = useState(false);
  const refSecao = useRef<HTMLElement>(null);

  useEffect(() => {
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          definirVisivel(true);
        }
      },
      { threshold: 0.15 },
    );

    if (refSecao.current) {
      observador.observe(refSecao.current);
    }

    return () => observador.disconnect();
  }, []);

  return (
    <section
      id="beneficios"
      ref={refSecao}
      className="py-32 bg-[#050505] relative overflow-hidden"
    >
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[400px] bg-rose-500/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div
          className={`text-center mb-20 transition-all duration-1000 ${visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-gradient-to-r from-rose-950/50 to-rose-950/30 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(244,63,94,0.15)]">
            Pare de perder dinheiro
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase leading-tight mb-6">
            PARE DE JOGAR <br />
            <span className="bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 bg-clip-text text-transparent">
              DINHEIRO FORA
            </span>
          </h2>
          <p className="text-zinc-400 mt-6 max-w-xl mx-auto text-lg">
            Pequenos erros de cálculo destroem sua margem de lucro. O PrintLog
            elimina as variáveis invisíveis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {beneficios.map((beneficio) => (
            <div
              key={beneficio.titulo}
              className={`bg-gradient-to-br from-[#09090b] via-[#0a0a0a] to-[#09090b] p-8 rounded-3xl border border-zinc-800 hover:border-rose-500/40 transition-all duration-700 group hover:-translate-y-3 hover:scale-[1.02] shadow-2xl hover:shadow-rose-500/20 ${visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
              style={{ transitionDelay: beneficio.atraso }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500/20 to-rose-500/5 rounded-2xl flex items-center justify-center text-rose-500 mb-6 group-hover:bg-gradient-to-br group-hover:from-rose-500 group-hover:to-rose-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-rose-500/10 group-hover:shadow-rose-500/40 group-hover:scale-110 group-hover:rotate-6">
                <beneficio.Icone className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="text-white font-bold text-xl mb-3 group-hover:text-rose-400 transition-colors">
                {beneficio.titulo}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">
                {beneficio.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
