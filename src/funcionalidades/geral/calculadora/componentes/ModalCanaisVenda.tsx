import { Store, Check, X, Pencil, Trash, Plus } from "lucide-react";
import { Dialogo, InputBancario } from "@/compartilhado/componentes";

/**
 * Interface para as propriedades do ModalCanaisVenda.
 */
interface PropriedadesModalCanaisVenda {
  aberto: boolean;
  aoFechar: () => void;
  hook: any;
  indiceSendoEditado: number | null;
  setIndiceSendoEditado: (v: number | null) => void;
  nomeTemporario: string;
  setNomeTemporario: (v: string) => void;
}

/**
 * Modal para configuração dos canais de venda (marketplaces e taxas).
 */
export function ModalCanaisVenda({
  aberto,
  aoFechar,
  hook,
  indiceSendoEditado,
  setIndiceSendoEditado,
  nomeTemporario,
  setNomeTemporario
}: PropriedadesModalCanaisVenda) {
  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} larguraMax="max-w-3xl" esconderCabecalho={true}>
      <div className="p-6 space-y-5">
        {/* Cabeçalho Premium Standardizado */}
        <div className="flex items-center justify-between border-b border-borda-sutil pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Store size={18} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-black uppercase tracking-wider text-primary">Canais de Venda</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Configure suas taxas de marketplace</span>
            </div>
          </div>
          <button
            onClick={aoFechar}
            className="w-8 h-8 rounded-lg text-zinc-500 hover:text-primary dark:hover:text-zinc-200 transition-all bg-zinc-100 dark:bg-zinc-900/40 border border-borda-sutil flex items-center justify-center cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-col h-full justify-between">
          <div className="overflow-y-auto max-h-[50vh] pr-2 space-y-3 scrollbar-hide">
            <div className="grid grid-cols-1 gap-3">
              {hook.perfisMarketplace.map((p: any, idx: number) => {
                const selecionado = hook.perfilAtivo === p.nome;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                      selecionado 
                        ? "border-orange-500 bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.1)]" 
                        : "border-borda-sutil bg-zinc-50 dark:bg-zinc-900/40 hover:border-orange-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => hook.setPerfilAtivo(p.nome)}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selecionado ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-white dark:bg-zinc-800 text-zinc-400 border border-borda-sutil"
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
                              className="flex-1 min-w-0 h-9 px-3 rounded-lg bg-white dark:bg-zinc-950 border border-orange-500 font-black text-xs uppercase tracking-wider text-primary dark:text-white outline-none shadow-inner"
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
                              className="w-9 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-md shrink-0"
                              title="Salvar"
                            >
                              <Check size={14} strokeWidth={3} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIndiceSendoEditado(null);
                              }}
                              className="w-9 h-9 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 flex items-center justify-center transition-all shrink-0"
                              title="Cancelar"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group/nome">
                            <h4 className={`text-xs font-black uppercase tracking-wider truncate ${selecionado ? "text-orange-500" : "text-primary dark:text-zinc-200"}`}>
                              {p.nome}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIndiceSendoEditado(idx);
                                setNomeTemporario(p.nome);
                              }}
                              className="opacity-0 group-hover/nome:opacity-100 hover:scale-110 active:scale-95 transition-all text-zinc-400 hover:text-orange-500 p-1 flex items-center justify-center rounded-md bg-white/50 dark:bg-black/20"
                              title="Alterar Nome"
                            >
                              <Pencil size={12} />
                            </button>
                          </div>
                        )}
                        {selecionado && <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500/80 mt-0.5 block">Canal Ativo no Cálculo</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Comissão (%)</span>
                        <div className="relative flex items-center bg-white dark:bg-zinc-950 border border-borda-sutil dark:border-zinc-800 rounded-xl focus-within:border-orange-500/50 overflow-hidden shadow-inner w-20">
                          <input
                            type="number"
                            value={p.taxaPontosBase !== undefined ? p.taxaPontosBase / 100 : ""}
                            onChange={(e) => {
                              const novos = [...hook.perfisMarketplace];
                              novos[idx].taxaPontosBase = Math.round(Number(e.target.value) * 100);
                              hook.setPerfisMarketplace(novos);
                              if (selecionado) hook.setTaxaEcommerce(Math.round(Number(e.target.value) * 100));
                            }}
                            className="w-full h-9 bg-transparent outline-none pl-3 pr-6 font-black text-xs text-primary dark:text-white"
                          />
                          <span className="absolute right-3 font-black text-[10px] text-zinc-400 select-none">%</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Custo Fixo</span>
                        <div className="relative flex items-center bg-white dark:bg-zinc-950 border border-borda-sutil dark:border-zinc-800 rounded-xl focus-within:border-orange-500/50 overflow-hidden shadow-inner w-24">
                          <span className="absolute left-3 font-black text-[10px] text-zinc-400 select-none">R$</span>
                          <InputBancario
                            placeholder="0.00"
                            value={p.fixaCentavos !== undefined ? p.fixaCentavos / 100 : ""}
                            onChange={(e) => {
                              const novos = [...hook.perfisMarketplace];
                              novos[idx].fixaCentavos = Math.round(Number(e.target.value) * 100);
                              hook.setPerfisMarketplace(novos);
                              if (selecionado) hook.setTaxaFixa(Math.round(Number(e.target.value) * 100));
                            }}
                            className="w-full h-9 bg-transparent outline-none pl-8 pr-3 font-black text-xs text-primary dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Frete Médio</span>
                        <div className="relative flex items-center bg-white dark:bg-zinc-950 border border-borda-sutil dark:border-zinc-800 rounded-xl focus-within:border-orange-500/50 overflow-hidden shadow-inner w-24">
                          <span className="absolute left-3 font-black text-[10px] text-zinc-400 select-none">R$</span>
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
                            className="w-full h-9 bg-transparent outline-none pl-8 pr-3 font-black text-xs text-primary dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 self-end shrink-0 ml-2">
                        {p.nome !== "Direto" ? (
                          <button
                            onClick={() => {
                              const novos = hook.perfisMarketplace.filter((_: any, i: number) => i !== idx);
                              hook.setPerfisMarketplace(novos);
                              if (selecionado) hook.setPerfilAtivo("Direto");
                            }}
                            className="w-9 h-9 rounded-xl border border-transparent hover:border-rose-500/20 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-all"
                            title="Remover Canal"
                          >
                            <Trash size={14} />
                          </button>
                        ) : (
                          <div className="w-9 h-9" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                const novos = [...hook.perfisMarketplace, { nome: "Novo Canal", taxaPontosBase: 0, fixaCentavos: 0, freteCentavos: 0 }];
                hook.setPerfisMarketplace(novos);
                setIndiceSendoEditado(novos.length - 1);
                setNomeTemporario("Novo Canal");
              }}
              className="w-full mt-4 h-12 border-2 border-dashed border-borda-sutil hover:border-orange-500/50 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-orange-500 bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-orange-500/5 transition-all group"
            >
              <Plus size={14} className="group-hover:scale-125 transition-transform" /> NOVO CANAL DE VENDA
            </button>
          </div>
        </div>
      </div>
    </Dialogo>
  );
}
