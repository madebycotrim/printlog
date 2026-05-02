import { memo } from "react";
import { Warehouse, Settings } from "lucide-react";
import { PerfilMarketplace } from "../tipos";
import { ContadorAnimado } from "@/componentes/ui";

interface CardLogisticaProps {
  perfis: PerfilMarketplace[];
  perfilAtivo: string;
  setPerfilAtivo: (v: string) => void;
  taxaEcommerce: number;
  setTaxaEcommerce: (v: number) => void;
  taxaFixa: number;
  setTaxaFixa: (v: number) => void;
  frete: number;
  setFrete: (v: number) => void;
  abrirPerfis: () => void;
  cobrarLogistica: boolean;
  setCobrarLogistica: (v: boolean) => void;
}

export const CardLogistica = memo(function CardLogistica({
  perfis, perfilAtivo, setPerfilAtivo, taxaEcommerce, setTaxaEcommerce, taxaFixa, setTaxaFixa, frete, setFrete, abrirPerfis, cobrarLogistica, setCobrarLogistica
}: CardLogisticaProps) {
  return (
    <div className={`p-6 rounded-3xl bg-[#121214] border border-white/5 relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500 ${!cobrarLogistica ? 'opacity-50 grayscale-[0.5]' : ''}`}>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${cobrarLogistica ? 'text-orange-400 border-orange-500/30' : 'text-zinc-500 border-zinc-800'}`}>
            <Warehouse size={18} />
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs font-black uppercase tracking-wider text-white">Canais de Venda e Logística</span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Custos de plataforma e fretes</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCobrarLogistica(!cobrarLogistica)}
          className={`relative w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
            cobrarLogistica ? 'bg-orange-500' : 'bg-gray-200 dark:bg-zinc-700'
          }`}
        >
          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
            cobrarLogistica ? 'translate-x-4' : 'translate-x-0'
          }`} />
        </button>
      </div>

      <div className={`space-y-6 transition-all ${!cobrarLogistica ? 'pointer-events-none opacity-40' : ''}`}>
        <div className="flex flex-wrap items-center gap-2">
        {perfis.map((p) => (
          <button
            key={p.nome}
            onClick={() => {
              if (perfilAtivo === p.nome) {
                setPerfilAtivo("");
                setTaxaEcommerce(0);
                setTaxaFixa(0);
                setFrete(0);
              } else {
                setPerfilAtivo(p.nome);
                setTaxaEcommerce(p.taxa);
                setTaxaFixa(p.fixa);
                if (p.frete !== undefined) setFrete(p.frete);
              }
            }}
            className={`px-4 h-11 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider flex flex-col items-center justify-center text-center leading-tight shrink-0
              ${perfilAtivo === p.nome 
                ? "bg-orange-500/10 border-orange-500 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.15)]" 
                : "bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-orange-500/30 text-zinc-400"}
            `}
          >
            <span>{p.nome}</span>
            <span className={`text-[8px] font-bold opacity-80 flex items-center gap-1 ${perfilAtivo === p.nome ? "text-orange-400/80" : "text-gray-400"} ${!cobrarLogistica ? "opacity-50" : ""}`}>
              (<ContadorAnimado valor={p.taxa} prefixo="" sufixo="%" casasDecimais={1} /> + <ContadorAnimado valor={p.fixa} /> + <ContadorAnimado valor={p.frete || 0} />)
            </span>
          </button>
        ))}
        <button onClick={abrirPerfis} className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-zinc-400 hover:text-orange-400 hover:border-orange-500/30 transition-all shrink-0">
          <Settings size={16} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
        <div>
          <label className="block text-xs font-black uppercase text-zinc-400 mb-2">Comissão (%)</label>
          <input 
            type="number" 
            placeholder="0" 
            value={taxaEcommerce === 0 ? "" : taxaEcommerce} 
            onChange={(e) => setTaxaEcommerce(Number(e.target.value))} 
            className={`w-full h-14 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-orange-500/40 outline-none font-black text-sm text-zinc-900 dark:text-white transition-all shadow-inner ${!cobrarLogistica ? "opacity-50" : ""}`} 
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase text-zinc-400 mb-2">Taxa Fixa (R$)</label>
          <input 
            type="number" 
            placeholder="0" 
            value={taxaFixa === 0 ? "" : taxaFixa} 
            onChange={(e) => setTaxaFixa(Number(e.target.value))} 
            className={`w-full h-14 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-orange-500/40 outline-none font-black text-sm text-zinc-900 dark:text-white transition-all shadow-inner ${!cobrarLogistica ? "opacity-50" : ""}`} 
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase text-zinc-400 mb-2">Frete (R$)</label>
          <input 
            type="number" 
            placeholder="0" 
            value={frete === 0 ? "" : frete} 
            onChange={(e) => setFrete(Number(e.target.value))} 
            className={`w-full h-14 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-orange-500/40 outline-none font-black text-sm text-zinc-900 dark:text-white transition-all shadow-inner text-center ${!cobrarLogistica ? "opacity-50" : ""}`} 
          />
        </div>
      </div>
      </div>
    </div>
  );
});
