import { memo, useState } from "react";
import { Warehouse, Settings, Search, MapPin, RefreshCcw } from "lucide-react";
import { PerfilMarketplace } from "../tipos";
import { ContadorAnimado, InputBancario } from "@/compartilhado/componentes/ui";
import { toast } from "react-hot-toast";

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
  const [cep, setCep] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const estadoLogista = "SP"; // Para efeito de simulação, logista é de SP

  const consultarCep = async () => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return toast.error("CEP incompleto");
    
    setBuscandoCep(true);
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await resp.json();
      if (dados.erro) throw new Error("CEP não encontrado");
      
      const freteSimulado = dados.uf === estadoLogista ? 1500 : 3500;
      setFrete(freteSimulado);
      toast.success(`Frete calculado para ${dados.localidade}-${dados.uf}!`);
    } catch {
      toast.error("Erro ao buscar CEP");
    } finally {
      setBuscandoCep(false);
    }
  };

  return (
    <div className={`p-6 rounded-3xl bg-card border border-borda-sutil relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500 overflow-hidden premium-card premium-card-orange ${!cobrarLogistica ? 'opacity-50 grayscale-[0.5]' : ''}`}>
      {/* Efeito Glow Laranja de Fundo */}
      <div className="absolute -top-24 -right-20 w-80 h-80 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none transition-all duration-700" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-borda-sutil">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${cobrarLogistica ? 'text-orange-600 dark:text-orange-500 border-orange-500/30' : 'text-zinc-500 dark:text-zinc-400 border-borda-sutil'}`}>
            <Warehouse size={18} />
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Canais de Venda e Logística</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Custos de plataforma e fretes</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCobrarLogistica(!cobrarLogistica)}
          className={`relative w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
            cobrarLogistica ? 'bg-orange-500' : 'bg-muted dark:bg-zinc-700'
          }`}
        >
          <div className={`w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-300 ${
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
                setTaxaEcommerce(p.taxaPontosBase || 0);
                setTaxaFixa(p.fixaCentavos || 0);
                if (p.freteCentavos !== undefined) setFrete(p.freteCentavos);
              }
            }}
            className={`px-4 h-11 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider flex flex-col items-center justify-center text-center leading-tight shrink-0
              ${perfilAtivo === p.nome 
                ? "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.15)]" 
                : "bg-muted/40 dark:bg-white/5 border-borda-sutil hover:border-orange-500/30 text-muted-foreground"}
            `}
          >
            <span>{p.nome}</span>
            <span className={`text-[8px] font-bold opacity-80 flex items-center gap-1 ${perfilAtivo === p.nome ? "text-orange-600 dark:text-orange-400/80" : "text-muted-foreground dark:text-gray-400"} ${!cobrarLogistica ? "opacity-50" : ""}`}>
              (<ContadorAnimado valor={(p.taxaPontosBase || 0) / 100} prefixo="" sufixo="%" casasDecimais={1} /> + <ContadorAnimado valor={(p.fixaCentavos || 0) / 100} /> + <ContadorAnimado valor={(p.freteCentavos || 0) / 100} />)
            </span>
          </button>
        ))}
        <button onClick={abrirPerfis} className="w-11 h-11 flex items-center justify-center rounded-xl bg-muted/40 dark:bg-white/5 border border-borda-sutil text-muted-foreground hover:text-orange-500 hover:border-orange-500/30 transition-all shrink-0">
          <Settings size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-borda-sutil items-end">
        <div>
          <label className="block text-xs font-black uppercase text-muted-foreground mb-2">Comissão (%)</label>
          <input 
            type="number" 
            placeholder="0" 
            value={taxaEcommerce === 0 ? "" : (taxaEcommerce / 100)} 
            onChange={(e) => setTaxaEcommerce(Math.round(Number(e.target.value) * 100))} 
            className={`w-full h-14 px-4 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-orange-500/40 outline-none font-black text-sm text-primary dark:text-white transition-all shadow-inner ${!cobrarLogistica ? "opacity-50" : ""}`} 
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase text-muted-foreground mb-2">Taxa Fixa (R$)</label>
          <InputBancario 
            placeholder="0.00" 
            value={taxaFixa === 0 ? "" : taxaFixa / 100} 
            onChange={(e) => setTaxaFixa(Math.round(Number(e.target.value) * 100))} 
            className={`w-full h-14 px-4 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-orange-500/40 outline-none font-black text-sm text-primary dark:text-white transition-all shadow-inner ${!cobrarLogistica ? "opacity-50" : ""}`} 
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2 whitespace-nowrap">CEP Cliente</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                maxLength={9}
                className={`w-full h-14 pl-10 pr-3 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-orange-500/40 outline-none font-black text-sm text-primary dark:text-white transition-all shadow-inner ${!cobrarLogistica ? "opacity-50" : ""}`} 
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            </div>
          </div>
          <button 
            onClick={consultarCep}
            disabled={!cep || buscandoCep || !cobrarLogistica}
            className="w-14 h-14 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-muted text-white flex items-center justify-center transition-colors shrink-0 shadow-lg mt-auto"
            title="Calcular frete automático"
          >
            {buscandoCep ? <RefreshCcw className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2">Frete Estimado (R$)</label>
          <InputBancario 
            placeholder="0.00" 
            value={frete === 0 ? "" : frete / 100} 
            onChange={(e) => setFrete(Math.round(Number(e.target.value) * 100))} 
            className={`w-full h-14 px-4 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-orange-500/40 outline-none font-black text-sm text-primary dark:text-white transition-all shadow-inner text-center ${!cobrarLogistica ? "opacity-50" : ""}`} 
          />
        </div>
      </div>
      </div>
    </div>
  );
});
