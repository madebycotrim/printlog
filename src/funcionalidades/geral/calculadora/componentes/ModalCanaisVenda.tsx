import { Store, Check, X, Pencil, Trash, Plus } from "lucide-react";
import { createPortal } from "react-dom";
import { InputBancario } from "@/compartilhado/componentes";

interface PropriedadesModalCanaisVenda {
  aberto: boolean;
  aoFechar: () => void;
  hook: any;
  indiceSendoEditado: number | null;
  setIndiceSendoEditado: (v: number | null) => void;
  nomeTemporario: string;
  setNomeTemporario: (v: string) => void;
}

export function ModalCanaisVenda({
  aberto,
  aoFechar,
  hook,
  indiceSendoEditado,
  setIndiceSendoEditado,
  nomeTemporario,
  setNomeTemporario
}: PropriedadesModalCanaisVenda) {
  if (!aberto) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-card w-full max-w-3xl rounded-[2rem] p-6 shadow-2xl border border-white/5 relative overflow-hidden flex flex-col max-h-[90vh]"
        style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(6, 182, 212, 0.15) 0%, transparent 60%)' }}
      >
        <button 
          onClick={aoFechar}
          className="absolute top-6 right-6 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900/40 hover:bg-zinc-800/80 text-zinc-400 hover:text-white transition-all border border-white/5"
        >
          <X size={16} />
        </button>
        
        <div className="flex items-center gap-4 mb-6 relative z-10 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Store size={22} className="animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-base font-black uppercase tracking-widest text-primary">Canais de Venda</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Configure suas taxas de marketplace</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6 overflow-y-auto pr-2 scrollbar-fino relative z-10 flex-1">
          {hook.perfisMarketplace.map((p: any, idx: number) => {
            const selecionado = hook.perfilAtivo === p.nome;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors group ${
                  selecionado 
                    ? "bg-zinc-900/60 border-cyan-500/40 shadow-[0_4px_12px_rgba(6,182,212,0.05)]" 
                    : "bg-zinc-900/40 border-white/5 hover:bg-zinc-900/60"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => hook.setPerfilAtivo(p.nome)}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    selecionado 
                      ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" 
                      : "bg-zinc-900/80 text-zinc-500 border-zinc-800 group-hover:text-zinc-400"
                  }`}>
                    <Store size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {indiceSendoEditado === idx ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={nomeTemporario}
                          onChange={(e) => setNomeTemporario(e.target.value)}
                          className="flex-1 min-w-0 h-9 px-3 rounded-xl bg-zinc-950 border border-cyan-500/50 font-black text-xs uppercase tracking-wider text-white outline-none shadow-inner"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (!nomeTemporario.trim()) return;
                              const novos = [...hook.perfisMarketplace];
                              const nomeAntigo = novos[idx].nome;
                              novos[idx].nome = nomeTemporario.trim();
                              hook.setPerfisMarketplace(novos);
                              if (hook.perfilAtivo === nomeAntigo) {
                                hook.setPerfilAtivo(nomeTemporario.trim());
                              }
                              setIndiceSendoEditado(null);
                            } else if (e.key === 'Escape') {
                              setIndiceSendoEditado(null);
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!nomeTemporario.trim()) return;
                            const novos = [...hook.perfisMarketplace];
                            const nomeAntigo = novos[idx].nome;
                            novos[idx].nome = nomeTemporario.trim();
                            hook.setPerfisMarketplace(novos);
                            if (hook.perfilAtivo === nomeAntigo) {
                              hook.setPerfilAtivo(nomeTemporario.trim());
                            }
                            setIndiceSendoEditado(null);
                          }}
                          className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition-all shadow-md shrink-0"
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIndiceSendoEditado(null);
                          }}
                          className="w-9 h-9 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 flex items-center justify-center transition-all shrink-0"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/nome">
                        <h4 className={`text-xs font-black uppercase tracking-wider truncate transition-colors ${
                          selecionado ? "text-cyan-400" : "text-white"
                        }`}>
                          {p.nome}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIndiceSendoEditado(idx);
                            setNomeTemporario(p.nome);
                          }}
                          className="opacity-0 group-hover/nome:opacity-100 hover:scale-110 active:scale-95 transition-all text-zinc-500 hover:text-cyan-400 p-1 flex items-center justify-center rounded-lg bg-zinc-900/80"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    )}
                    {selecionado && <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500/80 mt-0.5 block">Canal Ativo</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">Comissão</span>
                    <div className="relative flex items-center bg-zinc-950 border border-white/5 rounded-xl focus-within:border-cyan-500/50 overflow-hidden w-24">
                      <input
                        type="number"
                        value={p.taxaPontosBase !== undefined ? p.taxaPontosBase / 100 : ""}
                        onChange={(e) => {
                          const novos = [...hook.perfisMarketplace];
                          novos[idx].taxaPontosBase = Math.round(Number(e.target.value) * 100);
                          hook.setPerfisMarketplace(novos);
                          if (selecionado) hook.setTaxaEcommerce(Math.round(Number(e.target.value) * 100));
                        }}
                        className="w-full h-11 bg-transparent outline-none pl-3 pr-7 font-black text-sm text-white"
                      />
                      <span className="absolute right-3 font-black text-[10px] text-zinc-500 select-none">%</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">Custo Fixo</span>
                    <div className="relative flex items-center bg-zinc-950 border border-white/5 rounded-xl focus-within:border-cyan-500/50 overflow-hidden w-28">
                      <span className="absolute left-3 font-black text-[10px] text-zinc-500 select-none">R$</span>
                      <InputBancario
                        placeholder="0.00"
                        value={p.fixaCentavos !== undefined ? p.fixaCentavos / 100 : ""}
                        onChange={(e) => {
                          const novos = [...hook.perfisMarketplace];
                          novos[idx].fixaCentavos = Math.round(Number(e.target.value) * 100);
                          hook.setPerfisMarketplace(novos);
                          if (selecionado) hook.setTaxaFixa(Math.round(Number(e.target.value) * 100));
                        }}
                        className="w-full h-11 bg-transparent outline-none pl-8 pr-3 font-black text-sm text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">Frete</span>
                    <div className="relative flex items-center bg-zinc-950 border border-white/5 rounded-xl focus-within:border-cyan-500/50 overflow-hidden w-28">
                      <span className="absolute left-3 font-black text-[10px] text-zinc-500 select-none">R$</span>
                      <InputBancario
                        placeholder="0.00"
                        value={p.freteCentavos !== undefined ? p.freteCentavos / 100 : 0}
                        onChange={(e) => {
                          const val = Math.round(Number(e.target.value) * 100);
                          const novos = [...hook.perfisMarketplace];
                          novos[idx].freteCentavos = val;
                          hook.setPerfisMarketplace(novos);
                          if (selecionado) hook.setFrete(val);
                        }}
                        className="w-full h-11 bg-transparent outline-none pl-8 pr-3 font-black text-sm text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 self-end shrink-0 ml-1">
                    {p.nome !== "Direto" ? (
                      <button
                        onClick={() => {
                          const novos = hook.perfisMarketplace.filter((_: any, i: number) => i !== idx);
                          hook.setPerfisMarketplace(novos);
                          if (selecionado) hook.setPerfilAtivo("Direto");
                        }}
                        className="w-11 h-11 rounded-xl bg-zinc-950 border border-white/5 hover:border-rose-500/20 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all"
                      >
                        <Trash size={16} />
                      </button>
                    ) : (
                      <div className="w-11 h-11" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => {
              const novos = [...hook.perfisMarketplace, { nome: "Novo Canal", taxaPontosBase: 0, fixaCentavos: 0, freteCentavos: 0 }];
              hook.setPerfisMarketplace(novos);
              setIndiceSendoEditado(novos.length - 1);
              setNomeTemporario("Novo Canal");
            }}
            className="w-full mt-2 h-12 rounded-xl bg-zinc-950 border border-white/5 hover:border-cyan-500/30 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all group shrink-0"
          >
            <Plus size={14} className="group-hover:scale-125 transition-transform" /> NOVO CANAL DE VENDA
          </button>
        </div>

        <div className="flex gap-2 relative z-10 shrink-0 mt-auto">
          <button 
            type="button"
            onClick={aoFechar}
            className="w-24 shrink-0 h-12 text-[10px] font-black uppercase tracking-widest rounded-xl bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            Fechar
          </button>
          <button 
            type="button"
            onClick={aoFechar}
            className="flex-1 h-12 text-xs font-black uppercase tracking-widest rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all cursor-pointer shadow-lg"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  , document.body);
}
