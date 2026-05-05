import { TrendingUp, Plus, Check, X, Pencil, Trash } from "lucide-react";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";
import { toast } from "react-hot-toast";

/**
 * Interface para as propriedades do ModalConfiguracaoFiscal.
 */
interface PropriedadesModalConfiguracaoFiscal {
  aberto: boolean;
  aoFechar: () => void;
  hook: any;
  indiceSendoEditado: number | null;
  setIndiceSendoEditado: (v: number | null) => void;
  nomeTemporario: string;
  setNomeTemporario: (v: string) => void;
}

/**
 * Modal para configuração da estrutura fiscal (regimes e taxas).
 */
export function ModalConfiguracaoFiscal({
  aberto,
  aoFechar,
  hook,
  indiceSendoEditado,
  setIndiceSendoEditado,
  nomeTemporario,
  setNomeTemporario
}: PropriedadesModalConfiguracaoFiscal) {
  return (
    <ModalListagemPremium
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Estrutura Fiscal"
      iconeTitulo={TrendingUp}
      corDestaque="violet"
      termoBusca=""
      aoMudarBusca={() => { }}
      temResultados={true}
      totalResultados={hook.perfisFiscais?.length || 0}
      larguraMax="max-w-3xl"
      altura="h-[70vh]"
    >
      <div className="flex flex-col h-full justify-between">
        <div className="overflow-y-auto max-h-[42vh] pr-2 space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {hook.perfisFiscais?.map((p: any, idx: number) => {
              const selecionado = hook.tipoOperacao === p.nome.toLowerCase();
              return (
                <div
                  key={p.nome}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-all ${selecionado ? "border-violet-500 bg-violet-500/5" : "border-borda-sutil bg-zinc-50 dark:bg-zinc-800/10"
                    }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      hook.setTipoOperacao(p.nome.toLowerCase());
                      hook.setImpostos(p.base);
                      hook.setIcms(p.icms);
                      hook.setIss(p.iss);
                    }}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selecionado ? "bg-violet-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}>
                      <TrendingUp size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {indiceSendoEditado === idx ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={nomeTemporario}
                            onChange={(e) => setNomeTemporario(e.target.value)}
                            className="flex-1 min-w-0 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-violet-500 font-bold text-xs text-primary dark:text-white outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (!nomeTemporario.trim()) return;
                                const novos = [...hook.perfisFiscais];
                                const nomeAntigo = novos[idx].nome;
                                novos[idx].nome = nomeTemporario.trim();
                                hook.setPerfisFiscais(novos);
                                if (hook.tipoOperacao === nomeAntigo.toLowerCase()) {
                                  hook.setTipoOperacao(nomeTemporario.trim().toLowerCase());
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
                              const novos = [...hook.perfisFiscais];
                              const nomeAntigo = novos[idx].nome;
                              novos[idx].nome = nomeTemporario.trim();
                              hook.setPerfisFiscais(novos);
                              if (hook.tipoOperacao === nomeAntigo.toLowerCase()) {
                                hook.setTipoOperacao(nomeTemporario.trim().toLowerCase());
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
                            className="opacity-0 group-hover/nome:opacity-100 hover:scale-110 active:scale-95 transition-all text-zinc-400 hover:text-violet-500 p-1 flex items-center justify-center rounded-md"
                            title="Alterar Nome"
                          >
                            <Pencil size={12} />
                          </button>
                        </div>
                      )}
                      {selecionado && <span className="text-[10px] font-black uppercase text-violet-500">Ativo</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Base (%)</span>
                      <input
                        type="number"
                        value={p.base ?? ""}
                        onChange={(e) => {
                          const novos = [...hook.perfisFiscais];
                          novos[idx].base = Number(e.target.value);
                          hook.setPerfisFiscais(novos);
                          if (selecionado) hook.setImpostos(Number(e.target.value));
                        }}
                        className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-borda-sutil dark:border-white/10 font-black text-xs text-primary dark:text-white outline-none text-right focus:border-violet-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">ICMS (%)</span>
                      <input
                        type="number"
                        value={p.icms ?? ""}
                        onChange={(e) => {
                          const novos = [...hook.perfisFiscais];
                          novos[idx].icms = Number(e.target.value);
                          hook.setPerfisFiscais(novos);
                          if (selecionado) hook.setIcms(Number(e.target.value));
                        }}
                        className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-borda-sutil dark:border-white/10 font-black text-xs text-primary dark:text-white outline-none text-right focus:border-violet-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">ISS (%)</span>
                      <input
                        type="number"
                        value={p.iss ?? ""}
                        onChange={(e) => {
                          const novos = [...hook.perfisFiscais];
                          novos[idx].iss = Number(e.target.value);
                          hook.setPerfisFiscais(novos);
                          if (selecionado) hook.setIss(Number(e.target.value));
                        }}
                        className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-borda-sutil dark:border-white/10 font-black text-xs text-primary dark:text-white outline-none text-right focus:border-violet-500"
                      />
                    </div>
                    {p.nome !== "Produto" && p.nome !== "Servico" && p.nome !== "Industrializacao" && p.nome !== "MEI" ? (
                      <button
                        onClick={() => {
                          const novos = hook.perfisFiscais.filter((_: any, i: number) => i !== idx);
                          hook.setPerfisFiscais(novos);
                          if (selecionado) {
                            hook.setTipoOperacao("produto");
                            hook.setImpostos(0);
                            hook.setIcms(18);
                            hook.setIss(0);
                          }
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

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/5 rounded-xl border border-dashed border-borda-sutil dark:border-white/5 mt-4 shrink-0">
          <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Adicionar Novo Regime</span>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Ex: Simples Nacional"
              id="novoFiscalNome"
              className="flex-1 min-w-[120px] h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-borda-sutil dark:border-white/10 font-bold text-xs text-primary dark:text-white outline-none focus:border-violet-500"
            />
            <input
              type="number"
              placeholder="Base %"
              id="novoFiscalBase"
              className="w-20 h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-borda-sutil dark:border-white/10 font-bold text-xs text-primary dark:text-white outline-none text-right focus:border-violet-500"
            />
            <input
              type="number"
              placeholder="ICMS %"
              id="novoFiscalIcms"
              className="w-20 h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-borda-sutil dark:border-white/10 font-bold text-xs text-primary dark:text-white outline-none text-right focus:border-violet-500"
            />
            <input
              type="number"
              placeholder="ISS %"
              id="novoFiscalIss"
              className="w-20 h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-borda-sutil dark:border-white/10 font-bold text-xs text-primary dark:text-white outline-none text-right focus:border-violet-500"
            />
            <button
              onClick={() => {
                const nomeEl = document.getElementById("novoFiscalNome") as HTMLInputElement;
                const baseEl = document.getElementById("novoFiscalBase") as HTMLInputElement;
                const icmsEl = document.getElementById("novoFiscalIcms") as HTMLInputElement;
                const issEl = document.getElementById("novoFiscalIss") as HTMLInputElement;

                if (!nomeEl || !nomeEl.value) {
                  toast.error("Informe o nome do regime!");
                  return;
                }

                const novo = {
                  nome: nomeEl.value,
                  base: Number(baseEl.value) || 0,
                  icms: Number(icmsEl.value) || 0,
                  iss: Number(issEl.value) || 0
                };

                hook.setPerfisFiscais([...hook.perfisFiscais, novo]);
                nomeEl.value = "";
                baseEl.value = "";
                icmsEl.value = "";
                issEl.value = "";
                toast.success("Regime fiscal adicionado!");
              }}
              className="px-4 h-9 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-wider rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              Salvar
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-borda-sutil pt-6">
          <div className="space-y-3">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-violet-400">Guia: Venda (ICMS)</h5>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Use para produtos de <span className="text-primary dark:text-zinc-200">pronta entrega</span> ou fabricação em série.
              Geralmente tributado pelo <span className="text-primary dark:text-zinc-200">Anexo I do Simples Nacional (4%)</span>.
              CNAE comum: 4789-0/99.
            </p>
          </div>
          <div className="space-y-3">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-violet-400">Guia: Serviço (ISS)</h5>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Use para <span className="text-primary dark:text-zinc-200">encomendas personalizadas</span> onde o cliente fornece o arquivo.
              Geralmente tributado pelo <span className="text-primary dark:text-zinc-200">Anexo III do Simples Nacional (6%)</span>.
              CNAE comum: 1813-0/99.
            </p>
          </div>
        </div>
      </div>
    </ModalListagemPremium>
  );
}
