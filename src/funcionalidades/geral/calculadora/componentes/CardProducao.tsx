import { Zap, Plus, Trash2, Minus, Sparkles } from "lucide-react";
import { ItemPosProcesso } from "../tipos";
import { useState, memo } from "react";
import { ContadorAnimado, InputBancario } from "@/compartilhado/componentes/ui";
import { toast } from "react-hot-toast";
import { centavosParaReais, extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";

interface CardProducaoProps {
  tempo: number;
  setTempo: (v: number) => void;
  modoEntrada: 'unitario' | 'lote';
  potencia: number;
  setPotencia: (v: number) => void;
  precoKwh: number;
  setPrecoKwh: (v: number) => void;
  custoEnergia: number;
  cobrarEnergia: boolean;
  setCobrarEnergia: (v: boolean) => void;
  posProcesso: ItemPosProcesso[];
  setPosProcesso: (v: ItemPosProcesso[]) => void;
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
  tempo, setTempo, potencia, setPotencia, precoKwh, setPrecoKwh, custoEnergia, cobrarEnergia, setCobrarEnergia, posProcesso, setPosProcesso,
  impressoras = [], idImpressoraSelecionada, quantidade, setQuantidade, pecasPorMesa, setPecasPorMesa, modoEntrada, aoDetectarTarifa
}: CardProducaoProps) {
  const impressoraAtiva = impressoras.find(i => i.id === idImpressoraSelecionada);
  
  // Estados de foco
  const [detectando, setDetectando] = useState(false);

  // Buffers de digitação para garantir que o campo fique vazio ao focar
  const [tempQuantidade, setTempQuantidade] = useState<string | undefined>(undefined);
  const [tempPecasPorMesa, setTempPecasPorMesa] = useState<string | undefined>(undefined);
  const [tempHora, setTempHora] = useState<string | undefined>(undefined);
  const [tempMinuto, setTempMinuto] = useState<string | undefined>(undefined);
  const [tempPotencia, setTempPotencia] = useState<string | undefined>(undefined);

  const lidarComDeteccao = async () => {
    if (!aoDetectarTarifa) return;
    setDetectando(true);
    try {
      const res = await aoDetectarTarifa();
      if (res) {
        toast.success(`Tarifa de ${res.estado} aplicada: R$ ${res.tarifa.toFixed(2)}/kWh`);
      } else {
        toast.error("Não foi possível detectar sua localização.");
      }
    } catch (e) {
      toast.error("Erro ao buscar tarifas.");
    } finally {
      setDetectando(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-card border border-borda-sutil relative flex flex-col gap-3 shadow-2xl backdrop-blur-3xl group transition-all duration-500 premium-card premium-card-emerald">
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

        <div className="flex flex-col md:flex-row gap-8 md:gap-0">
        {/* Coluna Esquerda: Tempo e Energia */}
        <div className="flex-1 space-y-4 md:pr-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block h-4 text-xs font-black uppercase text-muted-foreground mb-2">Quantas peças?</label>
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

            {modoEntrada === 'lote' ? (
              <div>
                <label className="block h-4 text-xs font-black uppercase text-muted-foreground mb-2 flex justify-between">Peças/Mesa <span className="text-[8px] text-zinc-400 lowercase">{Math.ceil(quantidade / Math.max(1, pecasPorMesa || 1))} ciclo(s)</span></label>
                <div className="relative flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-emerald-500/40 transition-all shadow-inner overflow-hidden">
                  <input 
                    type="number" 
                    placeholder="Tudo" 
                    min="1" 
                    value={tempPecasPorMesa !== undefined ? tempPecasPorMesa : (pecasPorMesa === 0 ? "" : (pecasPorMesa ?? ""))} 
                    onFocus={() => {}}
                    onBlur={() => setTempPecasPorMesa(undefined)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTempPecasPorMesa(v);
                      setPecasPorMesa && setPecasPorMesa(v === "" ? 0 : Number(v));
                    }} 
                    className="w-full h-full bg-transparent outline-none font-black text-sm text-center text-primary dark:text-white" 
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block h-4 text-xs font-black uppercase text-muted-foreground mb-2">Tempo de Produção</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-emerald-500/40 transition-all shadow-inner">
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={tempHora !== undefined ? tempHora : (Math.floor(tempo / 60) === 0 ? "" : (Math.floor(tempo / 60) || ""))} 
                      onFocus={() => {}}
                      onBlur={() => setTempHora(undefined)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setTempHora(v);
                        setTempo((v === "" ? 0 : Number(v)) * 60 + (tempo % 60));
                      }} 
                      className="w-full h-11 pl-4 pr-10 bg-transparent outline-none font-black text-sm text-center text-primary dark:text-white" 
                    />
                    <span className="absolute right-3 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">h</span>
                  </div>

                  <div className="relative flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-emerald-500/40 transition-all shadow-inner">
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={tempMinuto !== undefined ? tempMinuto : (tempo % 60 === 0 ? "" : (tempo % 60 || ""))} 
                      onFocus={() => {}}
                      onBlur={() => setTempMinuto(undefined)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setTempMinuto(v);
                        setTempo(Math.floor(tempo / 60) * 60 + (v === "" ? 0 : Number(v)));
                      }} 
                      className="w-full h-11 pl-4 pr-12 bg-transparent outline-none font-black text-sm text-left text-primary dark:text-white" 
                    />
                    <span className="absolute right-3 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">min</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {modoEntrada === 'lote' && (
            <div className="grid grid-cols-1">
              <div>
                <label className="block h-4 text-xs font-black uppercase text-muted-foreground mb-2">Tempo de Produção (do Lote inteiro)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-emerald-500/40 transition-all shadow-inner">
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={tempHora !== undefined ? tempHora : (Math.floor(tempo / 60) === 0 ? "" : (Math.floor(tempo / 60) || ""))} 
                      onFocus={() => {}}
                      onBlur={() => setTempHora(undefined)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setTempHora(v);
                        setTempo((v === "" ? 0 : Number(v)) * 60 + (tempo % 60));
                      }} 
                      className="w-full h-11 pl-4 pr-10 bg-transparent outline-none font-black text-sm text-center text-primary dark:text-white" 
                    />
                    <span className="absolute right-3 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">h</span>
                  </div>

                  <div className="relative flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-emerald-500/40 transition-all shadow-inner">
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={tempMinuto !== undefined ? tempMinuto : (tempo % 60 === 0 ? "" : (tempo % 60 || ""))} 
                      onFocus={() => {}}
                      onBlur={() => setTempMinuto(undefined)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setTempMinuto(v);
                        setTempo(Math.floor(tempo / 60) * 60 + (v === "" ? 0 : Number(v)));
                      }} 
                      className="w-full h-11 pl-4 pr-12 bg-transparent outline-none font-black text-sm text-left text-primary dark:text-white" 
                    />
                    <span className="absolute right-3 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">min</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  disabled={detectando}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[8px] font-black uppercase transition-all active:scale-95 ${
                    detectando 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 animate-pulse' 
                      : 'bg-muted/40 border-borda-sutil text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10'
                  }`}
                  title="Auto-detectar tarifa pelo IP"
                >
                  <Sparkles size={10} className={detectando ? 'animate-pulse text-emerald-400' : ''} />
                  <span>{detectando ? 'Buscando...' : 'Auto-ajuste'}</span>
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
            </div>
          </div>
        </div>

        {/* Linha Divisória Vertical */}
        <div className="hidden md:block w-[1px] bg-borda-sutil self-stretch mx-3" />

        {/* Coluna Direita: Pós-Processamento */}
        <div className="flex-1 flex flex-col h-full md:pl-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-primary dark:text-white">
                Pós-Processamento
              </label>
              <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Lixamento, Pintura, Cola e Acabamentos</p>
            </div>
            <button 
              onClick={() => {
                setPosProcesso([...posProcesso, { id: crypto.randomUUID(), nome: "Novo Item", valor: 0 }]);
              }}
              className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500 hover:text-white text-[9px] font-black uppercase transition-all flex items-center gap-1"
            >
              <Plus size={10} strokeWidth={3} /> Adicionar Item
            </button>
          </div>

          <div className="min-h-[140px] max-h-[240px] overflow-y-auto space-y-2 mb-3 pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800/50 transition-all">
            {posProcesso.length === 0 ? (
              <div className="w-full border border-dashed border-borda-sutil rounded-2xl flex flex-col items-center justify-center h-[140px] p-4 text-center bg-transparent opacity-60">
                <Plus size={20} className="text-zinc-300 dark:text-zinc-700 mb-2" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">Nenhum acabamento<br/>extra aplicado</span>
              </div>
            ) : (
              <div className="space-y-3">
                {posProcesso.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/20 dark:bg-white/[0.02] border border-borda-sutil rounded-xl group animate-in slide-in-from-right-2 duration-300">
                    <div className="flex-1 min-w-[120px]">
                      <input
                        type="text"
                        value={item.nome}
                        placeholder="Nome do item..."
                        onChange={(e) => {
                          const novaLista = [...posProcesso];
                          novaLista[index].nome = e.target.value;
                          setPosProcesso(novaLista);
                        }}
                        className="w-full bg-transparent border-0 border-b border-borda-sutil text-[11px] font-black uppercase tracking-tight text-primary dark:text-white outline-none focus:border-emerald-500 py-1 transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-20">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">R$</span>
                      <InputBancario
                        placeholder="0.00"
                        value={item.valor === 0 ? "" : item.valor / 100}
                        onChange={(e) => {
                          const v = e.target.value;
                          const novaLista = [...posProcesso];
                          novaLista[index].valor = v === "" ? 0 : Math.round(Number(v) * 100);
                          setPosProcesso(novaLista);
                        }}
                        className="w-full bg-transparent border-0 border-b border-borda-sutil text-[11px] font-black text-center text-primary dark:text-white outline-none focus:border-emerald-500 py-1 transition-colors"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setPosProcesso(posProcesso.filter(i => i.id !== item.id))}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                <div className="pt-2 px-3 flex justify-end">
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Total em Pós-Processamento</p>
                    <p className="text-xs font-black text-primary dark:text-white">
                      {centavosParaReais(posProcesso.reduce((acc, i) => acc + (i.valor || 0), 0))}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
