import { useState, useEffect } from "react";
import { Crown, Info } from "lucide-react";

/**
 * Banner de Exclusividade - Comunica a estratégia de Maker Fundador (apenas 51 vagas).
 */
export function BannerExclusividade() {
  const [vagasRestantes, definirVagasRestantes] = useState(49); // Default condizente com 50 total e 1 membro
  const totalFundadores = 50;

  useEffect(() => {
    const buscarVagas = async () => {
      try {
        const resposta = await fetch("/api/vagas-restantes");
        if (resposta.ok) {
          const dados = await resposta.json();
          definirVagasRestantes(dados.vagasRestantes);
        }
      } catch (erro) {
        console.error("Erro ao carregar vagas restantes", erro);
      }
    };
    buscarVagas();
  }, []);

  if (vagasRestantes <= 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-borda-sutil bg-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 group transition-all duration-700">
      {/* Efeitos de Background Sutis */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/[0.02] via-transparent to-indigo-500/[0.02]" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full">
        {/* Ícone Discreto */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted/30 border border-borda-sutil shadow-inner">
          <Crown size={24} className="text-zinc-500 dark:text-zinc-600 fill-zinc-600/10" />
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <span className="text-[9px] font-black tracking-[0.2em] text-muted-foreground uppercase">
            Iniciativa Limitada
          </span>
          <h2 className="text-xl font-black tracking-tight text-primary dark:text-zinc-200 uppercase">
            Clube dos 50: Makers Fundadores
          </h2>
          <p className="max-w-2xl text-sm font-medium text-muted-foreground leading-relaxed">
            Estamos construindo algo revolucionário. Como parte da nossa estratégia, apenas os primeiros <span className="text-primary/70 dark:text-zinc-400">{totalFundadores} usuários</span> garantirão o título vitalício de <strong>Maker Fundador</strong>.
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 text-[9px] font-black uppercase tracking-widest text-muted-foreground border border-borda-sutil">
                <Info size={10} />
                <span>Legacy Badge</span>
             </div>
             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 text-[9px] font-black uppercase tracking-widest text-muted-foreground border border-borda-sutil">
                <Crown size={10} />
                <span>Roadmap Priority</span>
             </div>
          </div>
        </div>

        {/* Contador Minimalista */}
        <div className="flex flex-col items-center justify-center rounded-xl bg-muted/20 border border-borda-sutil p-4 min-w-[120px] relative">
          <span className="text-3xl font-black tracking-tighter text-primary dark:text-zinc-300 leading-none">
            {vagasRestantes}
          </span>
          <span className="text-[8px] font-black uppercase tracking-[0.15em] text-muted-foreground mt-1.5 text-center">
            Vagas Restantes
          </span>
          <div className="mt-3 h-1 w-full rounded-full bg-muted/60 overflow-hidden">
             <div 
               className="h-full bg-sky-500/40 transition-all duration-1000" 
               style={{ width: `${(vagasRestantes / totalFundadores) * 100}%` }}
             />
          </div>
        </div>
      </div>
    </div>
  );
}
