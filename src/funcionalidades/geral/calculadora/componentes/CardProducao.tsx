import { Zap, Plus, Trash2, ChevronDown } from "lucide-react";
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
    <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-white/5">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-amber-500" />
          <h3 className="text-xs font-black uppercase tracking-widest text-amber-500">Produção</h3>
        </div>

        {/* Seletor Inteligente de Impressora (Estilo Premium) */}
        <div className="relative">
          <button 
            type="button"
            onClick={() => setSeletorAberto(!seletorAberto)}
            className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all group ${
              impressoraAtiva 
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

            <ChevronDown size={14} className={`text-zinc-400 transition-transform ml-2 ${seletorAberto ? "rotate-180" : ""}`} />
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
                      className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-black uppercase tracking-tight transition-colors ${
                        idImpressoraSelecionada === imp.id 
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {/* Coluna Esquerda: Tempo e Energia */}
        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block h-4 text-xs font-black uppercase text-gray-400 mb-2">Quant. (Lote)</label>
              <input type="number" placeholder="1" min="1" value={quantidade || ""} onChange={(e) => setQuantidade(Number(e.target.value))} className="w-full h-14 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block h-4 text-xs font-black uppercase text-gray-400 mb-2">Horas</label>
              <input type="number" placeholder="0" value={Math.floor(tempo / 60) || ""} onChange={(e) => setTempo(Number(e.target.value) * 60 + (tempo % 60))} className="w-full h-14 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
            <div className="flex-1">
              <label className="block h-4 text-xs font-black uppercase text-gray-400 mb-2">Minutos</label>
              <input type="number" placeholder="0" value={tempo % 60 || ""} onChange={(e) => setTempo(Math.floor(tempo / 60) * 60 + Number(e.target.value))} className="w-full h-14 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
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
                  className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase flex items-center gap-0.5 w-fit cursor-pointer transition-colors hover:scale-105 active:scale-95 ${
                    !cobrarEnergia 
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
                className={`w-full h-14 px-4 rounded-xl flex items-center border cursor-pointer transition-all ${
                  !cobrarEnergia ? 'bg-gray-50/50 dark:bg-zinc-800/50 border-transparent opacity-50 grayscale' :
                  impressoraAtiva ? 'bg-gray-50 dark:bg-white/5 border-amber-500/20 group-hover:border-amber-500/40' : 'bg-gray-50 dark:bg-white/5 border-transparent group-hover:border-amber-500/30'
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
              <input type="number" step="0.01" placeholder="0" value={precoKwh || ""} onChange={(e) => setPrecoKwh(Number(e.target.value))} className="w-full h-14 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
          </div>
        </div>

        {/* Coluna Direita: Pós-Processamento */}
        <div className="flex flex-col h-full">
          <label className="block h-4 text-xs font-black uppercase text-gray-400 mb-2 shrink-0">Pós-Processamento</label>
          
          <div className="flex-1 space-y-2 overflow-y-auto mb-3 pr-1" style={{ maxHeight: "100px" }}>
            {posProcesso.length === 0 ? (
              <div className="w-full h-full border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-center min-h-[56px]">
                <p className="text-[11px] font-bold text-gray-300 dark:text-zinc-700 uppercase tracking-widest italic">Vazio</p>
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
            <input type="text" placeholder="Item..." value={novoItemNome} onChange={(e) => setNovoItemNome(e.target.value)} className="flex-1 h-14 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-bold text-xs uppercase" />
              <input type="number" placeholder="R$" value={novoItemValor || ""} onChange={(e) => setNovoItemValor(Number(e.target.value))} className="w-20 h-14 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-xs" />
              <button onClick={() => { if (novoItemNome && novoItemValor > 0) { setPosProcesso([...posProcesso, { id: crypto.randomUUID(), nome: novoItemNome, valor: novoItemValor }]); setNovoItemNome(""); setNovoItemValor(0); } }} className="w-14 h-14 rounded-xl bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
