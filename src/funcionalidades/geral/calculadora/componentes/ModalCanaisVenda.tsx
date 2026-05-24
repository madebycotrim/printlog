import { Settings, Check, X, Pencil, Trash } from "lucide-react";
import { ModalListagemPremium, InputBancario } from "@/compartilhado/componentes";

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
    <ModalListagemPremium
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Canais de Venda" corDestaque="orange"
      termoBusca=""
      aoMudarBusca={() => { }}
      temResultados={true}
      totalResultados={hook.perfisMarketplace.length}
      larguraMax="max-w-2xl"
      altura="h-[70vh]"
    >
      <div className="flex flex-col h-full justify-between">
        <div className="overflow-y-auto max-h-[42vh] pr-2 space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {hook.perfisMarketplace.map((p: any, idx: number) => {
              const selecionado = hook.perfilAtivo === p.nome;
              return (
                <div
                  key={p.nome}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-all ${selecionado ? "border-orange-500 bg-orange-500/5" : "border-borda-sutil bg-zinc-50 dark:bg-zinc-800/10"
                    }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => hook.setPerfilAtivo(p.nome)}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selecionado ? "bg-orange-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}>
                      <Settings size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {indiceSendoEditado === idx ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                           <input
                            type="text"
                            value={nomeTemporario}
                            onChange={(e) => setNomeTemporario(e.target.value)}
                            className="flex-1 min-w-0 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-orange-500 font-black text-[10px] uppercase tracking-[0.2em] text-primary dark:text-white outline-none"
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
                            className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center transition-colors shrink-0"
                            title="Salvar"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIndiceSendoEditado(null);
                            }}
                            className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition-colors shrink-0"
                            title="Cancelar"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group/nome">
                          <h4 className="text-sm font-black uppercase tracking-wider text-primary dark:text-white truncate">
                            {p.nome}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIndiceSendoEditado(idx);
                              setNomeTemporario(p.nome);
                            }}
                            className="opacity-0 group-hover/nome:opacity-100 hover:scale-110 active:scale-95 transition-all text-zinc-400 hover:text-orange-500 p-1 flex items-center justify-center rounded-md"
                            title="Alterar Nome"
                          >
                            <Pencil size={12} />
                          </button>
                        </div>
                      )}
                      {selecionado && <span className="text-[10px] font-black uppercase text-orange-500">Ativo</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Taxa (%)</span>
                      <input
                        type="number"
                        value={p.taxaPontosBase !== undefined ? p.taxaPontosBase / 100 : ""}
                        onChange={(e) => {
                          const novos = [...hook.perfisMarketplace];
                          novos[idx].taxaPontosBase = Math.round(Number(e.target.value) * 100);
                          hook.setPerfisMarketplace(novos);
                          if (selecionado) hook.setTaxaEcommerce(Math.round(Number(e.target.value) * 100));
                        }}
                        className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-borda-sutil dark:border-white/10 font-black text-xs text-primary dark:text-white outline-none text-right focus:border-orange-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Fixa (R$)</span>
                      <InputBancario
                        placeholder="0.00"
                        value={p.fixaCentavos !== undefined ? p.fixaCentavos / 100 : ""}
                        onChange={(e) => {
                          const novos = [...hook.perfisMarketplace];
                          novos[idx].fixaCentavos = Math.round(Number(e.target.value) * 100);
                          hook.setPerfisMarketplace(novos);
                          if (selecionado) hook.setTaxaFixa(Math.round(Number(e.target.value) * 100));
                        }}
                        className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-borda-sutil dark:border-white/10 font-black text-xs text-primary dark:text-white outline-none text-right focus:border-orange-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Frete (R$)</span>
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
                        className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-borda-sutil dark:border-white/10 font-black text-xs text-primary dark:text-white outline-none text-right focus:border-orange-500"
                      />
                    </div>
                    {p.nome !== "Direto" ? (
                      <button
                        onClick={() => {
                          const novos = hook.perfisMarketplace.filter((_: any, i: number) => i !== idx);
                          hook.setPerfisMarketplace(novos);
                          if (selecionado) hook.setPerfilAtivo("Direto");
                        }}
                        className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition-colors self-end"
                      >
                        <Trash size={14} />
                      </button>
                    ) : (
                      <div className="w-8 h-8 self-end" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ModalListagemPremium>
  );
}
