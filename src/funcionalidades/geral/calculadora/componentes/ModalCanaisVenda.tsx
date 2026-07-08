import { Store, Check, X, Pencil, Trash, Plus, ShoppingBag } from "lucide-react";
import { Dialogo, InputBancario } from "@/compartilhado/componentes";
import { useState, useEffect } from "react";

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
  
  // Garantir que sempre tenha um canal selecionado para edição quando abrir
  useEffect(() => {
    if (aberto && indiceSendoEditado === null && hook.perfisMarketplace.length > 0) {
      setIndiceSendoEditado(0);
      setNomeTemporario(hook.perfisMarketplace[0].nome);
    }
  }, [aberto, indiceSendoEditado, hook.perfisMarketplace, setNomeTemporario]);

  if (!aberto) return null;

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Canais de Venda"
      subtitulo="Configure suas taxas de marketplace"
      icone={Store}
      larguraMax="max-w-4xl"
    >
      <div className="flex flex-col md:flex-row h-full min-h-[50vh]">
        
        {/* Painel Esquerdo: Lista de Canais */}
        <div className="w-full md:w-2/5 p-6 md:p-8 bg-zinc-50 dark:bg-zinc-900/50 border-b md:border-b-0 md:border-r border-borda-sutil flex flex-col h-full">
          <span className="text-xs font-black uppercase tracking-widest text-primary dark:text-white mb-6 block">Seus Canais</span>
          
          <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-fino flex-1">
            {hook.perfisMarketplace.map((p: any, idx: number) => {
              const selecionado = indiceSendoEditado === idx;
              const isAtivoNoApp = hook.perfilAtivo === p.nome;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setIndiceSendoEditado(idx);
                    setNomeTemporario(p.nome);
                  }}
                  className={`flex flex-col p-3 rounded-xl border text-left transition-all group ${
                    selecionado
                      ? "bg-cyan-500/10 border-cyan-500/30 shadow-[0_4px_12px_rgba(6,182,212,0.1)]"
                      : "bg-muted/20 dark:bg-zinc-900/40 border-borda-sutil hover:bg-muted/40 dark:hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                      selecionado 
                        ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" 
                        : "bg-white dark:bg-zinc-900/80 text-zinc-500 border-borda-sutil group-hover:text-cyan-500 shadow-sm"
                    }`}>
                      <ShoppingBag size={16} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span className={`text-xs font-black uppercase tracking-wider truncate ${
                        selecionado ? "text-cyan-600 dark:text-cyan-400" : "text-primary dark:text-white"
                      }`}>
                        {p.nome}
                      </span>
                      {isAtivoNoApp && (
                        <span className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest mt-0.5 block">Canal Ativo</span>
                      )}
                    </div>
                  </div>
                </button>
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
            className="w-full mt-4 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-dashed border-borda-sutil hover:border-cyan-500/30 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/5 transition-all group shrink-0 shadow-sm"
          >
            <Plus size={14} className="group-hover:scale-125 transition-transform" /> NOVO CANAL
          </button>
        </div>

        {/* Painel Direito: Configuração do Canal Selecionado */}
        <div className="w-full md:w-3/5 p-6 md:p-8 bg-card relative flex flex-col">
          {indiceSendoEditado !== null && hook.perfisMarketplace[indiceSendoEditado] ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
                    <Store size={18} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary dark:text-white">Editar Canal</h3>
                    <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">Configure as taxas deste marketplace</p>
                  </div>
                </div>
                
                {hook.perfisMarketplace[indiceSendoEditado].nome !== "Direto" && (
                  <button
                    onClick={() => {
                      const canalAntigo = hook.perfisMarketplace[indiceSendoEditado].nome;
                      const novos = hook.perfisMarketplace.filter((_: any, i: number) => i !== indiceSendoEditado);
                      hook.setPerfisMarketplace(novos);
                      if (hook.perfilAtivo === canalAntigo) hook.setPerfilAtivo("Direto");
                      setIndiceSendoEditado(0); 
                    }}
                    className="h-8 px-3 rounded-lg border border-rose-500/30 text-[9px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-1.5"
                  >
                    <Trash size={12} /> Excluir
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-6 flex-1">
                {/* NOME DO CANAL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">Nome do Canal</label>
                  <input
                    type="text"
                    value={nomeTemporario}
                    onChange={(e) => setNomeTemporario(e.target.value)}
                    onBlur={() => {
                      if (!nomeTemporario.trim()) return;
                      const novos = [...hook.perfisMarketplace];
                      const oldName = novos[indiceSendoEditado].nome;
                      novos[indiceSendoEditado].nome = nomeTemporario.trim();
                      hook.setPerfisMarketplace(novos);
                      if (hook.perfilAtivo === oldName) hook.setPerfilAtivo(nomeTemporario.trim());
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                    disabled={hook.perfisMarketplace[indiceSendoEditado].nome === "Direto"}
                    className="w-full h-12 bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil rounded-xl px-4 text-xs font-bold text-primary dark:text-white focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 outline-none transition-all shadow-inner disabled:opacity-50"
                  />
                </div>

                {/* COMISSAO */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">Taxa de Comissão (%)</label>
                  <div className="relative flex items-center bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil rounded-xl focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/10 overflow-hidden shadow-inner transition-all h-12">
                    <input
                      type="number"
                      value={hook.perfisMarketplace[indiceSendoEditado].taxaPontosBase !== undefined ? hook.perfisMarketplace[indiceSendoEditado].taxaPontosBase / 100 : ""}
                      onChange={(e) => {
                        const novos = [...hook.perfisMarketplace];
                        novos[indiceSendoEditado].taxaPontosBase = Math.round(Number(e.target.value) * 100);
                        hook.setPerfisMarketplace(novos);
                        if (hook.perfilAtivo === novos[indiceSendoEditado].nome) hook.setTaxaEcommerce(Math.round(Number(e.target.value) * 100));
                      }}
                      className="w-full h-full bg-transparent outline-none pl-4 pr-8 text-xs font-bold text-primary dark:text-white"
                    />
                    <span className="absolute right-4 text-[10px] font-black text-zinc-500 dark:text-zinc-400 select-none">%</span>
                  </div>
                </div>

                {/* CUSTO FIXO E FRETE - GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">Custo Fixo por Venda</label>
                    <div className="relative flex items-center bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil rounded-xl focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/10 overflow-hidden shadow-inner transition-all h-12">
                      <span className="absolute left-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 select-none">R$</span>
                      <InputBancario
                        placeholder="0.00"
                        value={hook.perfisMarketplace[indiceSendoEditado].fixaCentavos !== undefined ? hook.perfisMarketplace[indiceSendoEditado].fixaCentavos / 100 : ""}
                        onChange={(e) => {
                          const novos = [...hook.perfisMarketplace];
                          novos[indiceSendoEditado].fixaCentavos = Math.round(Number(e.target.value) * 100);
                          hook.setPerfisMarketplace(novos);
                          if (hook.perfilAtivo === novos[indiceSendoEditado].nome) hook.setTaxaFixa(Math.round(Number(e.target.value) * 100));
                        }}
                        className="w-full h-full bg-transparent outline-none pl-10 pr-4 text-xs font-bold text-primary dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">Frete Fixo</label>
                    <div className="relative flex items-center bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil rounded-xl focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/10 overflow-hidden shadow-inner transition-all h-12">
                      <span className="absolute left-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 select-none">R$</span>
                      <InputBancario
                        placeholder="0.00"
                        value={hook.perfisMarketplace[indiceSendoEditado].freteCentavos !== undefined ? hook.perfisMarketplace[indiceSendoEditado].freteCentavos / 100 : 0}
                        onChange={(e) => {
                          const val = Math.round(Number(e.target.value) * 100);
                          const novos = [...hook.perfisMarketplace];
                          novos[indiceSendoEditado].freteCentavos = val;
                          hook.setPerfisMarketplace(novos);
                          if (hook.perfilAtivo === novos[indiceSendoEditado].nome) hook.setFrete(val);
                        }}
                        className="w-full h-full bg-transparent outline-none pl-10 pr-4 text-xs font-bold text-primary dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center opacity-50">
              <Store size={48} className="text-zinc-300 dark:text-zinc-700 mb-4" />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Selecione um canal</span>
            </div>
          )}

          <div className="flex gap-2 relative z-10 shrink-0 mt-8 pt-6 border-t border-borda-sutil">
            <button 
              type="button"
              onClick={aoFechar}
              className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-primary dark:text-white transition-all cursor-pointer"
            >
              Fechar
            </button>
            <button 
              type="button"
              onClick={() => {
                if (indiceSendoEditado !== null && hook.perfisMarketplace[indiceSendoEditado]) {
                  hook.setPerfilAtivo(hook.perfisMarketplace[indiceSendoEditado].nome);
                }
                aoFechar();
              }}
              className="flex-[2] h-12 text-[10px] font-black uppercase tracking-widest rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Tornar Ativo e Concluir
            </button>
          </div>
        </div>
      </div>
    </Dialogo>
  );
}
