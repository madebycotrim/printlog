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
    <div className="relative overflow-hidden rounded-[32px] border border-sky-500/20 bg-[#090a0f] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-[0_32px_64px_-16px_rgba(14,165,233,0.15)] dark:shadow-[0_40px_80px_-16px_rgba(14,165,233,0.25)] group transition-all duration-700">
      {/* Luzes e Efeitos de Background Premium */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15),transparent_60%)] pointer-events-none blur-3xl animate-pulse duration-[8s]" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12),transparent_60%)] pointer-events-none blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/[0.03] via-transparent to-indigo-500/[0.03]" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full">
        {/* Ícone com Glow de Coroa */}
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 backdrop-blur-2xl border border-sky-500/30 shadow-[0_0_30px_rgba(14,165,233,0.2)]">
          <Crown size={48} className="text-sky-400 fill-sky-500/30 animate-bounce duration-[3s]" />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <span className="text-[10px] font-black tracking-[0.25em] text-sky-400 uppercase">
            Oportunidade Única de Lançamento
          </span>
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase bg-clip-text bg-gradient-to-r from-white via-sky-100 to-indigo-100">
            Clube dos 50: <span className="text-sky-400">Makers Fundadores</span>
          </h2>
          <p className="max-w-2xl text-base font-medium text-gray-400 leading-relaxed">
            Estamos construindo algo revolucionário. Como parte da nossa estratégia, apenas os primeiros <span className="font-bold text-sky-300 underline underline-offset-4 decoration-sky-400/50">{totalFundadores} usuários</span> garantirão o título vitalício de <strong>Maker Fundador</strong>.
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-sky-200 border border-sky-500/20 backdrop-blur-sm">
                <Info size={14} className="text-sky-400" />
                <span>Legacy Badge Vitalício</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-sky-200 border border-sky-500/20 backdrop-blur-sm">
                <Crown size={14} className="text-sky-400 fill-sky-400/20" />
                <span>Prioridade no Roadmap</span>
             </div>
          </div>
        </div>

        {/* Contador Estilo Futurista */}
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 shadow-2xl min-w-[160px] relative group-hover:border-sky-500/30 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent rounded-[24px] pointer-events-none" />
          <span className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-sky-200 leading-none">
            {vagasRestantes}
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2 text-center">
            Vagas Restantes
          </span>
          <div className="mt-4 h-1.5 w-full rounded-full bg-white/5 overflow-hidden border border-white/5">
             <div 
               className="h-full bg-gradient-to-r from-sky-500 to-blue-500 shadow-[0_0_10px_rgba(14,165,233,0.5)] transition-all duration-1000" 
               style={{ width: `${(vagasRestantes / totalFundadores) * 100}%` }}
             />
          </div>
        </div>
      </div>
    </div>
  );
}
