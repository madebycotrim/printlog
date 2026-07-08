import { memo, useState } from "react";
import { Warehouse, Settings, Search, MapPin, RefreshCcw, Percent, Coins, Truck } from "lucide-react";
import { PerfilMarketplace } from "../tipos";
import { ContadorAnimado, InputBancario } from "@/compartilhado/componentes/ui";
import { extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";
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
  const [localidadeCEP, setLocalidadeCEP] = useState("");
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
      setLocalidadeCEP(`${dados.localidade} - ${dados.uf}`);
      toast.success(`Frete calculado para ${dados.localidade}-${dados.uf}!`);
    } catch {
      toast.error("Erro ao buscar CEP");
      setLocalidadeCEP("");
      setFrete(0);
    } finally {
      setBuscandoCep(false);
    }
  };

  return (
    <div className={`p-6 rounded-3xl bg-card border border-borda-sutil relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500 overflow-hidden ${!cobrarLogistica ? 'opacity-50 grayscale-[0.5]' : ''}`}>
      {/* Efeito Glow Ciano de Fundo */}
      <div className="absolute -top-24 -right-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-borda-sutil">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${cobrarLogistica ? 'text-cyan-600 dark:text-cyan-500 border-cyan-500/30' : 'text-zinc-500 dark:text-zinc-400 border-borda-sutil'}`}>
            <Warehouse size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-primary">Canais de Venda e Logística</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Custos de plataforma e fretes</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={abrirPerfis} 
            disabled={!cobrarLogistica}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/40 dark:bg-white/5 border border-borda-sutil text-zinc-500 hover:text-cyan-500 disabled:opacity-50 hover:border-cyan-500/30 transition-all shrink-0"
            title="Configurar Perfis"
          >
            <Settings size={15} />
          </button>
          
          <div className="w-px h-6 bg-borda-sutil mx-1" />

          <button
            type="button"
            onClick={() => setCobrarLogistica(!cobrarLogistica)}
            className={`relative w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
              cobrarLogistica ? 'bg-cyan-500' : 'bg-muted dark:bg-zinc-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-300 ${
              cobrarLogistica ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      <div className={`space-y-6 transition-all ${!cobrarLogistica ? 'pointer-events-none opacity-40' : ''}`}>
        {perfis.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-borda-sutil">
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
                className={`px-4 h-9 rounded-lg border transition-all text-[10px] font-black uppercase tracking-wider flex flex-col items-center justify-center text-center leading-tight shrink-0
                  ${perfilAtivo === p.nome 
                    ? "bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]" 
                    : "bg-muted/40 dark:bg-white/5 border-borda-sutil hover:border-cyan-500/30 text-muted-foreground"}
                `}
              >
                <span>{p.nome}</span>
                <span className={`text-[8px] font-bold opacity-80 flex items-center gap-1 ${perfilAtivo === p.nome ? "text-cyan-600 dark:text-cyan-400/80" : "text-muted-foreground dark:text-gray-400"} ${!cobrarLogistica ? "opacity-50" : ""}`}>
                  (<ContadorAnimado valor={(p.taxaPontosBase || 0) / 100} prefixo="" sufixo="%" casasDecimais={1} /> + <ContadorAnimado valor={(p.fixaCentavos || 0) / 100} /> + <ContadorAnimado valor={(p.freteCentavos || 0) / 100} />)
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Coluna 1: Custos da Plataforma */}
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500/70 block mb-1">
              Custos da Plataforma
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Comissão (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={taxaEcommerce === 0 ? "" : (taxaEcommerce / 100)} 
                    onChange={(e) => setTaxaEcommerce(Math.round(Number(e.target.value) * 100))} 
                    className={`w-full h-12 pl-10 pr-4 rounded-xl bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 outline-none font-bold text-xs text-primary dark:text-white transition-all shadow-inner ${!cobrarLogistica ? "opacity-50" : ""}`} 
                  />
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                </div>
              </div>
              
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Taxa Fixa (R$)</label>
                <div className="relative">
                  <InputBancario 
                    placeholder="0.00" 
                    value={taxaFixa === 0 ? "" : taxaFixa / 100} 
                    onChange={(e) => setTaxaFixa(Math.round(extrairValorNumerico(e.target.value) * 100))} 
                    className={`w-full h-12 pl-10 pr-4 rounded-xl bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 outline-none font-bold text-xs text-primary dark:text-white transition-all shadow-inner ${!cobrarLogistica ? "opacity-50" : ""}`} 
                  />
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2: Custos de Envio */}
          <div className="space-y-4 lg:border-l lg:border-borda-sutil lg:pl-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500/70 block mb-1">
              Logística e Envio
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CEP Cliente com botão integrado */}
              <div className="w-full">
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 whitespace-nowrap">Consultar CEP</label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                      <input 
                        type="text"
                        placeholder="00000-000"
                        value={cep}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          val = val.replace(/^(\d{5})(\d)/, "$1-$2");
                          setCep(val);
                          if (val.length === 0) {
                            setFrete(0);
                            setLocalidadeCEP("");
                          }
                        }}
                        maxLength={9}
                        className={`w-full h-12 pl-10 pr-3 rounded-xl bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 outline-none font-bold text-xs text-primary dark:text-white transition-all shadow-inner ${!cobrarLogistica ? "opacity-50" : ""}`} 
                      />
                    </div>
                    <button 
                      onClick={consultarCep}
                      disabled={!cep || buscandoCep || !cobrarLogistica}
                      className="h-12 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:bg-muted disabled:text-muted-foreground text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-lg shadow-cyan-500/20 active:scale-95 shrink-0"
                      title="Calcular frete automático"
                    >
                      {buscandoCep ? <RefreshCcw className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                    </button>
                  </div>
                  {localidadeCEP && (
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400/80 px-1 animate-in fade-in slide-in-from-top-1">
                      Destino: {localidadeCEP}
                    </span>
                  )}
                </div>
              </div>

              {/* Frete Estimado */}
              <div className="w-full">
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Valor do Frete (R$)</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/70" size={15} />
                  <InputBancario 
                    placeholder="0.00" 
                    value={frete === 0 ? "" : frete / 100} 
                    onChange={(e) => setFrete(Math.round(extrairValorNumerico(e.target.value) * 100))} 
                    className={`w-full h-12 pl-10 pr-4 rounded-xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none font-bold text-xs text-cyan-700 dark:text-cyan-400 transition-all shadow-inner ${!cobrarLogistica ? "opacity-50" : ""}`} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
