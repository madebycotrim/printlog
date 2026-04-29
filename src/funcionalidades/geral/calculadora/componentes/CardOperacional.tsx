import { useState, useEffect } from "react";
import { DollarSign, Activity } from "lucide-react";

interface CardOperacionalProps {
  maoDeObra: number;
  margem: number;
  setMargem: (v: number) => void;
  depreciacao: number;
  cobrarDesgaste: boolean;
  setCobrarDesgaste: (v: boolean) => void;
  cobrarMaoDeObra: boolean;
  setCobrarMaoDeObra: (v: boolean) => void;
  anosVidaUtil?: 5 | 3 | 2;
  setAnosVidaUtil?: (v: 5 | 3 | 2) => void;
  tempo: number;
  tempoSetup: number;
  setTempoSetup: (v: number) => void;
}

export function CardOperacional({
  maoDeObra, margem, setMargem, depreciacao, cobrarDesgaste, setCobrarDesgaste, cobrarMaoDeObra, setCobrarMaoDeObra, 
  anosVidaUtil = 5, setAnosVidaUtil, tempo, tempoSetup, setTempoSetup
}: CardOperacionalProps) {
  const [margemInterna, setMargemInterna] = useState(margem);

  useEffect(() => {
    setMargemInterna(margem);
  }, [margem]);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      if (margemInterna !== margem) {
        setMargem(margemInterna);
      }
    }, 50);

    return () => clearTimeout(temporizador);
  }, [margemInterna, margem, setMargem]);

  const msgMargem = margemInterna === 0 
    ? { texto: "Sem margem de lucro adicionada.", cor: "text-zinc-500" }
    : margemInterna <= 20 
    ? { texto: "🔴 Margem baixa (pode comprometer o lucro do estúdio)", cor: "text-rose-500" }
    : margemInterna <= 60 
    ? { texto: "🟡 Margem competitiva (ideal para brigar por preço)", cor: "text-amber-500" }
    : margemInterna <= 120 
    ? { texto: "🟢 Excelente margem (ótima relação custo/retorno)", cor: "text-emerald-500 font-bold" }
    : margemInterna <= 250 
    ? { texto: "💎 Margem Premium (indicado para peças raras ou serviços especializados)", cor: "text-sky-500 font-bold" }
    : { texto: "🚀 Margem Altíssima (atente-se à aceitação do mercado)", cor: "text-violet-500 font-black animate-pulse" };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-8 rounded-2xl border shadow-sm space-y-6 transition-all duration-300 ${cobrarMaoDeObra ? "bg-white dark:bg-zinc-900 border-gray-100 dark:border-white/5" : "bg-gray-50/50 dark:bg-zinc-900/50 border-gray-100 dark:border-white/5 opacity-70 grayscale"}`}>
          <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-white/5">
            <div className="flex items-center gap-3">
              <DollarSign size={18} className="text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500">Mão de Obra</h3>
            </div>
            <button
              type="button"
              onClick={() => setCobrarMaoDeObra(!cobrarMaoDeObra)}
              className={`relative w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                cobrarMaoDeObra ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-zinc-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                cobrarMaoDeObra ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
          <div className={`transition-opacity ${!cobrarMaoDeObra ? "opacity-50 pointer-events-none" : ""}`}>
            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Setup / Operador (Minutos)</label>
            <div className="relative">
              <input 
                type="number" 
                placeholder="0"
                value={cobrarMaoDeObra ? (tempoSetup || "") : 0} 
                onChange={(e) => setTempoSetup(Number(e.target.value))} 
                className={`w-full h-12 px-4 rounded-xl outline-none font-black text-sm text-right ${!cobrarMaoDeObra ? 'bg-gray-50/50 dark:bg-white/5 line-through text-gray-400' : 'bg-gray-50 dark:bg-white/5'}`}
              />
              {cobrarMaoDeObra && (
                <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent animate-pulse" />
              )}
            </div>
            {cobrarMaoDeObra && (
              <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 mt-2 text-right uppercase tracking-wider">
                💡 Fórmula: (Tempo Setup / 60) * R$/h Operador
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex justify-between items-center relative overflow-hidden">
            <span className="text-[11px] font-black uppercase text-emerald-500">Custo Total Setup:</span>
            <span className={`text-sm font-black ${cobrarMaoDeObra ? 'text-emerald-500' : 'text-zinc-500 line-through'}`}>
              R$ {((cobrarMaoDeObra ? (tempoSetup / 60) * maoDeObra : 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className={`p-8 rounded-2xl border shadow-sm space-y-6 transition-all duration-300 ${cobrarDesgaste ? "bg-white dark:bg-zinc-900 border-gray-100 dark:border-white/5" : "bg-gray-50/50 dark:bg-zinc-900/50 border-gray-100 dark:border-white/5 opacity-70 grayscale"}`}>
          <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-white/5">
            <div className="flex items-center gap-3">
              <Activity size={18} className="text-rose-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-rose-500">Desgaste de Máquina</h3>
            </div>
            
            <button
              type="button"
              onClick={() => setCobrarDesgaste(!cobrarDesgaste)}
              className={`relative w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                cobrarDesgaste ? 'bg-rose-500' : 'bg-gray-200 dark:bg-zinc-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                cobrarDesgaste ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
          
          <div className={`space-y-6 transition-opacity ${!cobrarDesgaste ? "opacity-50 pointer-events-none" : ""}`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black uppercase text-gray-400">Taxa de Desgaste</label>
                <button
                  type="button"
                  onClick={() => {
                    if (!setAnosVidaUtil) return;
                    if (anosVidaUtil === 5) setAnosVidaUtil(3);
                    else if (anosVidaUtil === 3) setAnosVidaUtil(2);
                    else setAnosVidaUtil(5);
                  }}
                  className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-all hover:scale-105 active:scale-95 ${
                    anosVidaUtil === 5 ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
                    anosVidaUtil === 3 ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                    'text-rose-500 bg-rose-500/10 border-rose-500/20'
                  }`}
                >
                  {anosVidaUtil === 5 && "Uso Padrão (5 anos)"}
                  {anosVidaUtil === 3 && "Uso Severo (3 anos)"}
                  {anosVidaUtil === 2 && "Uso Extremo (2 anos)"}
                </button>
              </div>
              <div className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-between border border-gray-100 dark:border-white/5 select-none relative group">
                <span className="text-gray-400 font-black text-xs">R$/h</span>
                <span className="font-black text-sm text-gray-900 dark:text-white">
                  {(cobrarDesgaste ? depreciacao || 0 : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {cobrarDesgaste && (
                  <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-rose-500/30 to-transparent animate-pulse" />
                )}
              </div>
              {cobrarDesgaste && (
                <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 mt-2 text-right uppercase tracking-wider">
                  💡 Fórmula: (Valor / {anosVidaUtil} Anos) / 12 Meses / 240h
                </p>
              )}
            </div>
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex justify-between items-center relative overflow-hidden">
              <span className="text-[11px] font-black uppercase text-rose-500">Custo Total Desgaste:</span>
              <span className={`text-sm font-black ${cobrarDesgaste ? 'text-rose-500' : 'text-zinc-500 line-through'}`}>
                R$ {((cobrarDesgaste ? (tempo / 60) * depreciacao : 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6 px-8 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Coluna Esquerda: O Display do Valor e Status */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start border-b md:border-b-0 md:border-r border-zinc-100 dark:border-white/5 pb-4 md:pb-0 md:pr-6">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Margem de Lucro</label>
            
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-black text-zinc-900 dark:text-white">{margemInterna}</span>
              <span className="text-sm font-black text-zinc-400">%</span>
            </div>

            <span className={`text-[9px] uppercase font-black tracking-wider mt-2 transition-all duration-300 ${msgMargem.cor}`}>
              {msgMargem.texto}
            </span>
          </div>

          {/* Coluna Direita: Controles */}
          <div className="md:col-span-8 flex flex-col space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Presets rápidos</span>
              
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Presets Inteligentes */}
                {[30, 50, 100, 150, 200].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setMargemInterna(preset);
                      setMargem(preset);
                    }}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-xl border transition-all ${
                      margemInterna === preset 
                        ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30 shadow-sm shadow-emerald-500/5' 
                        : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-white bg-gray-50 dark:bg-white/5 border-transparent'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}

                {/* Input Direto */}
                <div className="flex items-center bg-gray-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-2 w-24 h-8">
                  <input 
                    type="number" 
                    value={margemInterna || ""} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMargemInterna(val);
                    }} 
                    className="w-full bg-transparent border-none outline-none font-black text-xs text-right text-zinc-900 dark:text-white pr-1"
                    placeholder="0"
                  />
                  <span className="text-[10px] font-black text-zinc-400">%</span>
                </div>
              </div>
            </div>

            {/* Slider de Arrastar */}
            <div className="relative flex items-center pt-2 w-full">
              {/* Fundo da Barra */}
              <div className="absolute w-full h-1.5 bg-zinc-100 dark:bg-white/[0.03] rounded-full" />
              
              {/* Preenchimento Colorido até a marcação */}
              <div 
                className={`absolute h-1.5 rounded-full pointer-events-none transition-all ease-out duration-75 ${
                  margemInterna === 0 ? "bg-zinc-500" :
                  margemInterna <= 20 ? "bg-rose-500" :
                  margemInterna <= 60 ? "bg-amber-500" :
                  margemInterna <= 120 ? "bg-emerald-500" :
                  margemInterna <= 250 ? "bg-sky-500" :
                  "bg-violet-500"
                }`}
                style={{ width: `${Math.min(100, (margemInterna / 500) * 100)}%` }}
              />
              
              <input 
                type="range" 
                min="0" 
                max="500" 
                step="1" 
                value={margemInterna > 500 ? 500 : margemInterna} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMargemInterna(val);
                }} 
                className={`w-full h-1.5 appearance-none bg-transparent cursor-pointer relative z-10 
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] 
                  [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 
                  hover:[&::-webkit-slider-thumb]:scale-125 ${
                    margemInterna === 0 ? "[&::-webkit-slider-thumb]:border-zinc-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(115,115,115,0.5)]" :
                    margemInterna <= 20 ? "[&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(244,63,94,0.5)]" :
                    margemInterna <= 60 ? "[&::-webkit-slider-thumb]:border-amber-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(245,158,11,0.5)]" :
                    margemInterna <= 120 ? "[&::-webkit-slider-thumb]:border-emerald-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(16,185,129,0.5)]" :
                    margemInterna <= 250 ? "[&::-webkit-slider-thumb]:border-sky-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(14,165,233,0.5)]" :
                    "[&::-webkit-slider-thumb]:border-violet-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                  }`} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
