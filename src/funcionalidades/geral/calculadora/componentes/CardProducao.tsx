import { Zap, Plus, Minus, Sparkles } from "lucide-react";
import { useState, memo } from "react";
import { ContadorAnimado, InputBancario } from "@/compartilhado/componentes/ui";
import { extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";

interface CardProducaoProps {
  tempo: number;
  setTempo: (v: number) => void;
  modoEntrada: 'unitario' | 'lote' | 'projeto';
  potencia: number;
  setPotencia: (v: number) => void;
  precoKwh: number;
  setPrecoKwh: (v: number) => void;
  custoEnergia: number;
  cobrarEnergia: boolean;
  setCobrarEnergia: (v: boolean) => void;
  impressoras?: any[];
  idImpressoraSelecionada?: string;
  aoSelecionarImpressora?: (id: string) => void;
  quantidade: number;
  setQuantidade: (v: number) => void;
  pecasPorMesa?: number;
  setPecasPorMesa?: (v: number) => void;
  aoDetectarTarifa?: () => Promise<any>;
}

export const CardProducao = memo(function CardProducao({
  tempo, setTempo, potencia, setPotencia, precoKwh, setPrecoKwh, custoEnergia, cobrarEnergia, setCobrarEnergia,
  impressoras = [], idImpressoraSelecionada, quantidade, setQuantidade, modoEntrada, aoDetectarTarifa
}: CardProducaoProps) {
  const impressoraAtiva = impressoras.find(i => i.id === idImpressoraSelecionada);
  
  // Estados de foco
  // Buffers de digitação para garantir que o campo fique vazio ao focar
  const [tempQuantidade, setTempQuantidade] = useState<string | undefined>(undefined);
  const [tempHora, setTempHora] = useState<string | undefined>(undefined);
  const [tempMinuto, setTempMinuto] = useState<string | undefined>(undefined);
  const [tempSegundo, setTempSegundo] = useState<string | undefined>(undefined);
  const [tempPotencia, setTempPotencia] = useState<string | undefined>(undefined);

  const lidarComDeteccao = () => {
    if (aoDetectarTarifa) {
      aoDetectarTarifa();
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-card border border-borda-sutil relative flex flex-col gap-3 shadow-2xl backdrop-blur-3xl group transition-all duration-500 premium-card premium-card-emerald h-full w-full">
      {/* Efeito Glow Indigo de Fundo */}
      <div className="absolute -top-24 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-borda-sutil">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-emerald-500 border border-emerald-500/30">
            <Zap size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Produção e Impressão</span>
            <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-0.5">Metricas de tempo e hardware</span>
          </div>
        </div>

        {/* Display da Impressora (Estático) */}
        {impressoraAtiva && (
          <div className="flex items-center justify-between px-4 h-11 rounded-xl border bg-muted/30 dark:bg-white/5 border-borda-sutil shadow-sm min-w-[160px]">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-black uppercase tracking-tight text-primary dark:text-white">
                  {impressoraAtiva.nome}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <span className="text-[10px] font-black text-muted-foreground tracking-tighter leading-none">{impressoraAtiva.potenciaWatts}W</span>
            </div>
          </div>
        )}
      </div>

        <div className="flex-1 flex flex-col justify-center">
        {/* Coluna Única: Tempo e Energia */}
        <div className="space-y-6">
          <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[130px_1fr] gap-3 sm:gap-4">
            <div>
              <label className="block h-4 text-[10px] font-black uppercase text-muted-foreground mb-2">
                {modoEntrada === 'projeto' ? 'Quantos Projetos?' : 'Quantas Peças?'}
              </label>
              <div className="relative flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-emerald-500/40 transition-all shadow-inner overflow-hidden">
                <button 
                  type="button"
                  onClick={() => setQuantidade(Math.max(1, (quantidade || 1) - 1))}
                  className="w-10 h-full flex items-center justify-center text-zinc-500 hover:bg-muted/50 dark:hover:bg-zinc-700/50 hover:text-primary dark:hover:text-white transition-colors"
                >
                  <Minus size={12} />
                </button>
                <input 
                  type="number" 
                  placeholder="1" 
                  min="1" 
                  value={tempQuantidade !== undefined ? tempQuantidade : (quantidade === 0 ? "" : (quantidade ?? ""))} 
                  onFocus={() => {}}
                  onBlur={() => setTempQuantidade(undefined)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setTempQuantidade(v);
                    setQuantidade(v === "" ? 0 : Number(v));
                  }} 
                  className="w-full h-full bg-transparent outline-none font-black text-sm text-center text-primary dark:text-white" 
                />
                <button 
                  type="button"
                  onClick={() => setQuantidade((quantidade || 1) + 1)}
                  className="w-10 h-full flex items-center justify-center text-zinc-500 hover:bg-muted/50 dark:hover:bg-zinc-700/50 hover:text-primary dark:hover:text-white transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            <div>
              <label className="block h-4 text-xs font-black uppercase text-muted-foreground mb-2">
                {modoEntrada === 'lote' ? "Tempo de Produção (Lote)" : modoEntrada === 'projeto' ? "Tempo de Produção (Projeto)" : "Tempo de Produção (Peça)"}
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1 flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-emerald-500/40 transition-all shadow-inner">
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={tempHora !== undefined ? tempHora : (Math.floor(tempo / 60) === 0 ? "" : (Math.floor(tempo / 60) || ""))} 
                    onFocus={() => {}}
                    onBlur={() => setTempHora(undefined)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTempHora(v);
                      setTempo((v === "" ? 0 : Number(v)) * 60 + Math.floor(tempo % 60) + (tempo % 1));
                    }} 
                    className="w-full h-11 pl-2 pr-6 sm:pl-4 sm:pr-8 bg-transparent outline-none font-black text-sm text-center text-primary dark:text-white" 
                  />
                  <span className="absolute right-2 sm:right-2.5 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">h</span>
                </div>

                <span className="text-zinc-400 font-bold">:</span>

                <div className="relative flex-1 flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-emerald-500/40 transition-all shadow-inner">
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={tempMinuto !== undefined ? tempMinuto : (Math.floor(tempo % 60) === 0 ? "" : (Math.floor(tempo % 60) || ""))} 
                    onFocus={() => {}}
                    onBlur={() => setTempMinuto(undefined)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTempMinuto(v);
                      setTempo(Math.floor(tempo / 60) * 60 + (v === "" ? 0 : Number(v)) + (tempo % 1));
                    }} 
                    className="w-full h-11 pl-2 pr-6 sm:pl-4 sm:pr-8 bg-transparent outline-none font-black text-sm text-center text-primary dark:text-white" 
                  />
                  <span className="absolute right-2 sm:right-2.5 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">MIN</span>
                </div>

                <span className="text-zinc-400 font-bold">:</span>

                <div className="relative flex-1 flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-emerald-500/40 transition-all shadow-inner">
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={tempSegundo !== undefined ? tempSegundo : (Math.round((tempo % 1) * 60) === 0 ? "" : (Math.round((tempo % 1) * 60) || ""))} 
                    onFocus={() => {}}
                    onBlur={() => setTempSegundo(undefined)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTempSegundo(v);
                      setTempo(Math.floor(tempo / 60) * 60 + Math.floor(tempo % 60) + ((v === "" ? 0 : Number(v)) / 60));
                    }} 
                    className="w-full h-11 pl-2 pr-6 sm:pl-4 sm:pr-8 bg-transparent outline-none font-black text-sm text-center text-primary dark:text-white" 
                  />
                  <span className="absolute right-2 sm:right-2.5 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">SEG</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col group">
              <div className="flex items-center justify-between h-4 mb-2">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-black uppercase text-muted-foreground">Energia (R$)</label>
                </div>
                <div
                  onClick={() => setCobrarEnergia(!cobrarEnergia)}
                  title={cobrarEnergia ? "Clique para desativar cobrança de energia" : "Clique para ativar cobrança de energia"}
                  className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase flex items-center gap-0.5 w-fit cursor-pointer transition-all hover:scale-105 active:scale-95 ${!cobrarEnergia
                      ? "bg-zinc-500/10 border-borda-sutil text-zinc-500 opacity-60"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500"
                    }`}
                >
                  <input
                    type="number"
                    value={tempPotencia !== undefined ? tempPotencia : (potencia === 0 ? "" : (potencia ?? ""))}
                    onFocus={() => {}}
                    onBlur={() => setTempPotencia(undefined)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTempPotencia(v);
                      setPotencia(v === "" ? 0 : Number(v));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent outline-none text-right placeholder:current-color leading-none"
                    style={{ width: `${Math.max(1, (potencia || 0).toString().length)}ch` }}
                    placeholder="0"
                  />
                  <span className="leading-none">W</span>
                </div>
              </div>
              <div
                onClick={() => setCobrarEnergia(!cobrarEnergia)}
                title={cobrarEnergia ? "Clique para desativar cobrança de energia" : "Clique para ativar cobrança de energia"}
                className={`w-full h-11 px-4 rounded-xl flex items-center border cursor-pointer transition-all shadow-inner ${!cobrarEnergia ? 'bg-muted/20 border-borda-sutil opacity-40 grayscale' :
                    impressoraAtiva ? 'bg-muted/40 dark:bg-zinc-800/40 border-emerald-500/20 group-hover:border-emerald-500/40' : 'bg-muted/40 dark:bg-zinc-800/40 border-borda-sutil group-hover:border-emerald-500/30'
                  }`}
              >
                <span className="text-muted-foreground font-black text-xs mr-2 select-none">R$</span>
                <span className={`font-black text-sm w-full text-center ${!cobrarEnergia ? 'line-through text-zinc-400 dark:text-gray-400' : impressoraAtiva ? 'text-emerald-600 dark:text-emerald-500' : 'text-primary dark:text-white'}`}>
                  <ContadorAnimado valor={cobrarEnergia ? custoEnergia : 0} prefixo="" />
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between h-4 mb-2">
                <label className="block text-xs font-black uppercase text-muted-foreground">kWh (R$)</label>
                <button
                  onClick={lidarComDeteccao}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[8px] font-black uppercase transition-all active:scale-95 bg-muted/40 border-borda-sutil text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10"
                  title="Auto-detectar tarifa pelo IP"
                >
                  <Sparkles size={10} />
                  <span>Auto-ajuste</span>
                </button>
              </div>
              <div className="relative flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-emerald-500/40 transition-all shadow-inner overflow-hidden">
                <InputBancario 
                  placeholder="0.00" 
                  value={precoKwh === 0 ? "" : precoKwh / 100} 
                  onChange={(e) => {
                    const v = e.target.value;
                    setPrecoKwh(v === "" ? 0 : Math.round(extrairValorNumerico(v) * 100));
                  }} 
                  className="w-full h-full px-4 bg-transparent outline-none font-black text-sm text-primary dark:text-white text-center" 
                />
              </div>
              {precoKwh > 200 && (
                <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex items-start gap-1.5">
                  <div className="text-amber-500 mt-0.5 shrink-0 text-[10px]">
                    ⚠️
                  </div>
                  <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500 leading-tight">
                    Custo alto. A média no Brasil é R$ 0,90. Verifique sua conta de luz.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
