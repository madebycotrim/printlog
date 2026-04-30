import { Zap, Plus, Trash2, ChevronDown, Minus } from "lucide-react";
import { ItemPosProcesso } from "../tipos";
import { useState } from "react";

interface CardProducaoProps {
  tempo: number;
  setTempo: (v: number) => void;
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
}

export function CardProducao({
  tempo, setTempo, potencia, setPotencia, precoKwh, setPrecoKwh, custoEnergia, cobrarEnergia, setCobrarEnergia, posProcesso, setPosProcesso,
  impressoras = [], idImpressoraSelecionada, aoSelecionarImpressora, quantidade, setQuantidade
}: CardProducaoProps) {
  const [novoItemNome, setNovoItemNome] = useState("");
  const [novoItemValor, setNovoItemValor] = useState(0);
  const [seletorAberto, setSeletorAberto] = useState(false);

  const impressoraAtiva = impressoras.find(i => i.id === idImpressoraSelecionada);

  return (
    <div className="p-6 rounded-3xl bg-[#121214] border border-white/5 relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/30">
            <Zap size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-white">Produção e Impressão</span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Metricas de tempo e hardware</span>
          </div>
        </div>

        {/* Seletor Inteligente de Impressora (Estilo Premium) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSeletorAberto(!seletorAberto)}
            className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all group ${impressoraAtiva
                ? "bg-zinc-50 dark:bg-white/5 border-gray-100 dark:border-white/10 shadow-sm"
                : "bg-zinc-100 dark:bg-white/5 border-transparent text-zinc-400"
              }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)] ${impressoraAtiva ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />

            <div className="flex flex-col items-start leading-tight">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                  {impressoraAtiva ? impressoraAtiva.nome : "Selecionar Máquina"}
                </span>
                {impressoraAtiva && (
                  <div className="flex items-center gap-1.5 translate-y-[-0.5px]">
                    <span className="text-[10px] text-zinc-300 dark:text-zinc-600 font-black leading-none">•</span>
                    <span className="text-[11px] font-black text-amber-500 tracking-tighter leading-none">{impressoraAtiva.potenciaWatts}W</span>
                  </div>
                )}
              </div>
            </div>

            <ChevronDown size={14} className="text-zinc-400 transition-transform ml-2" style={{ transform: seletorAberto ? 'rotate(180deg)' : 'none' }} />
          </button>

          {seletorAberto && (
            <div className="absolute top-full right-0 mt-2 w-56 p-2 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/10 shadow-2xl z-50">
              {impressoras.length === 0 ? (
                <div className="p-4 text-[10px] font-bold text-center text-zinc-500 uppercase">Nenhuma máquina cadastrada</div>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-hide">
                  {impressoras.map(imp => (
                    <button
                      key={imp.id}
                      type="button"
                      onClick={() => {
                        aoSelecionarImpressora?.(imp.id);
                        setSeletorAberto(false);
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-black uppercase tracking-tight transition-colors ${idImpressoraSelecionada === imp.id
                          ? "bg-amber-500 text-white"
                          : "hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-500"
                        }`}
                    >
                      {imp.nome}
                      <span className="block text-[10px] opacity-60 font-bold">{imp.marca} {imp.modeloBase}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-0">
        {/* Coluna Esquerda: Tempo e Energia */}
        <div className="flex-1 space-y-8 md:pr-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block h-4 text-xs font-black uppercase text-gray-400 mb-2">Quantidade</label>
              <div className="relative flex items-center h-14 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-amber-500/40 transition-all shadow-inner overflow-hidden">
                <button 
                  type="button"
                  onClick={() => setQuantidade(Math.max(1, (quantidade || 1) - 1))}
                  className="w-10 h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <Minus size={12} />
                </button>
                <input 
                  type="number" 
                  placeholder="1" 
                  min="1" 
                  value={quantidade || ""} 
                  onChange={(e) => setQuantidade(Number(e.target.value))} 
                  className="w-full h-full bg-transparent outline-none font-black text-sm text-center text-zinc-900 dark:text-white" 
                />
                <button 
                  type="button"
                  onClick={() => setQuantidade((quantidade || 1) + 1)}
                  className="w-10 h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            <div>
              <label className="block h-4 text-xs font-black uppercase text-gray-400 mb-2">Tempo de Impressão</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative flex items-center rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-amber-500/40 transition-all shadow-inner">
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={Math.floor(tempo / 60) || ""} 
                    onChange={(e) => setTempo(Number(e.target.value) * 60 + (tempo % 60))} 
                    className="w-full h-14 pl-4 pr-10 bg-transparent outline-none font-black text-sm text-left text-zinc-900 dark:text-white" 
                  />
                  <span className="absolute right-3 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">h</span>
                </div>

                <div className="relative flex items-center rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-amber-500/40 transition-all shadow-inner">
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={tempo % 60 || ""} 
                    onChange={(e) => setTempo(Math.floor(tempo / 60) * 60 + Number(e.target.value))} 
                    className="w-full h-14 pl-4 pr-12 bg-transparent outline-none font-black text-sm text-left text-zinc-900 dark:text-white" 
                  />
                  <span className="absolute right-3 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col group">
              <div className="flex items-center justify-between h-4 mb-2">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-black uppercase text-gray-400">Energia (R$)</label>
                </div>
                <div
                  onClick={() => setCobrarEnergia(!cobrarEnergia)}
                  title={cobrarEnergia ? "Clique para desativar cobrança de energia" : "Clique para ativar cobrança de energia"}
                  className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase flex items-center gap-0.5 w-fit cursor-pointer transition-colors hover:scale-105 active:scale-95 ${!cobrarEnergia
                      ? "bg-gray-500/10 border-gray-500/20 text-gray-500 opacity-60"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    }`}
                >
                  <input
                    type="number"
                    value={potencia || ""}
                    onChange={(e) => setPotencia(Number(e.target.value))}
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
                className={`w-full h-14 px-4 rounded-xl flex items-center border cursor-pointer transition-all shadow-inner ${!cobrarEnergia ? 'bg-zinc-100/20 dark:bg-zinc-800/20 border-zinc-200/20 dark:border-white/5 opacity-50 grayscale' :
                    impressoraAtiva ? 'bg-zinc-100/50 dark:bg-zinc-800/40 border-amber-500/20 group-hover:border-amber-500/40' : 'bg-zinc-100/50 dark:bg-zinc-800/40 border-zinc-200/50 dark:border-white/5 group-hover:border-amber-500/30'
                  }`}
              >
                <span className="text-gray-400 font-black text-xs mr-2 select-none">R$</span>
                <span className={`font-black text-sm ${!cobrarEnergia ? 'line-through text-gray-400' : impressoraAtiva ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>
                  {(cobrarEnergia ? custoEnergia : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block h-4 text-xs font-black uppercase text-gray-400 mb-2">kWh (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="0" 
                value={precoKwh || ""} 
                onChange={(e) => setPrecoKwh(Number(e.target.value))} 
                className="w-full h-14 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-amber-500/40 outline-none font-black text-sm text-zinc-900 dark:text-white transition-all shadow-inner" 
              />
            </div>
          </div>
        </div>

        {/* Linha Divisória Vertical */}
        <div className="hidden md:block w-[1px] bg-amber-500/20 dark:bg-amber-500/10 self-stretch mx-3" />

        {/* Coluna Direita: Pós-Processamento */}
        <div className="flex-1 flex flex-col h-full md:pl-6">
          <label className="block h-4 text-xs font-black uppercase text-gray-400 mb-2 shrink-0">Pós-Processamento</label>

          <div className="h-[140px] overflow-y-auto space-y-2 mb-3 pr-2">
            {posProcesso.length === 0 ? (
              <div className="w-full border border-dashed border-gray-100 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center h-full min-h-[120px] p-4 text-center bg-transparent">
                <Plus size={20} className="text-gray-400 dark:text-zinc-600 mb-2" />
                <span className="text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Nenhum item adicionado</span>
                <span className="text-[10px] font-bold text-gray-300 dark:text-zinc-600 uppercase mt-1">Ex: Lixamento, Pintura, Cola...</span>
              </div>
            ) : (
              posProcesso.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent">
                  <span className="text-xs font-bold uppercase truncate max-w-[120px] text-gray-900 dark:text-white">{item.nome}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-900 dark:text-white">R$ {item.valor}</span>
                    <button onClick={() => setPosProcesso(posProcesso.filter(i => i.id !== item.id))} className="text-rose-500 hover:scale-110 transition-transform">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 shrink-0 mt-auto">
            <input type="text" placeholder="Item..." value={novoItemNome} onChange={(e) => setNovoItemNome(e.target.value)} className="flex-1 h-14 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-amber-500/40 outline-none font-black text-xs uppercase text-zinc-900 dark:text-white transition-all shadow-inner" />
            <input type="number" placeholder="R$" value={novoItemValor || ""} onChange={(e) => setNovoItemValor(Number(e.target.value))} className="w-20 h-14 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-amber-500/40 outline-none font-black text-xs text-zinc-900 dark:text-white transition-all shadow-inner" />
            <button onClick={() => { if (novoItemNome && novoItemValor > 0) { setPosProcesso([...posProcesso, { id: crypto.randomUUID(), nome: novoItemNome, valor: novoItemValor }]); setNovoItemNome(""); setNovoItemValor(0); } }} className="w-14 h-14 rounded-xl bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
