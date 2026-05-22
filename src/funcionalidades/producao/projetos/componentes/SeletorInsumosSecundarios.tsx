/**
 * @file SeletorInsumosSecundarios.tsx
 * @description Componente para gerenciar a composição de custos de insumos no projeto.
 * v9.0 - Arquiteto Sênior PrintLog
 */

import { Plus, Trash2, Package } from "lucide-react";
import { InsumoProjeto } from "../tipos";
import { useArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";

interface PropriedadesSeletor {
    selecionados: InsumoProjeto[];
    aoAbrirArmazem: () => void;
    aoAlterar: (insumos: InsumoProjeto[]) => void;
}

export function SeletorInsumosSecundarios({ selecionados, aoAbrirArmazem, aoAlterar }: PropriedadesSeletor) {
    const { insumos } = useArmazemInsumos();

    const adicionarInsumo = () => {
        aoAbrirArmazem();
    };

    const removerInsumo = (index: number) => {
        const novaLista = [...selecionados];
        novaLista.splice(index, 1);
        aoAlterar(novaLista);
    };

    const atualizarItem = (index: number, campos: Partial<InsumoProjeto>) => {
        const novaLista = selecionados.map((item, i) => {
            if (i === index) {
                const base = { ...item, ...campos };
                // Se mudou o ID, atualiza o nome e o custo
                if (campos.idInsumo) {
                    const ref = insumos.find(ins => ins.id === campos.idInsumo);
                    if (ref) {
                        base.nome = ref.nome;
                        base.custoUnitarioCentavos = ref.custoMedioUnidade;
                    }
                }
                return base;
            }
            return item;
        });
        aoAlterar(novaLista);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
                        <Package size={16} />
                    </div>
                    <div>
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Insumos Diversos</h5>
                        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Parafusos, Embalagens, Tintas e Adicionais</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={adicionarInsumo}
                    disabled={insumos.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[9px] font-black uppercase tracking-[0.15em] rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
                >
                    <Plus size={10} strokeWidth={4} />
                    Adicionar Item
                </button>
            </div>

            {selecionados.length === 0 ? (
                <div 
                    onClick={adicionarInsumo}
                    className="p-10 border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-2xl text-center bg-gray-50/30 dark:bg-white/[0.01] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] hover:border-sky-500/20 cursor-pointer transition-all group"
                >
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Plus size={18} className="text-zinc-400 group-hover:text-sky-500" />
                    </div>
                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Nenhum insumo extra aplicado</p>
                    <p className="text-[8px] font-bold text-zinc-300 dark:text-zinc-600 uppercase mt-1">Clique para vincular um insumo do seu armazém</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {selecionados.map((item, index) => (
                        <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-4 p-4 bg-gray-50/50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl group animate-in zoom-in-95 duration-300">
                            <div className="flex-1 min-w-[150px]">
                                <select
                                    value={item.idInsumo}
                                    onChange={(e) => atualizarItem(index, { idInsumo: e.target.value })}
                                    className="w-full bg-transparent border-0 border-b-2 border-zinc-200 dark:border-white/10 text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-white outline-none focus:border-sky-500 py-1.5 transition-colors cursor-pointer"
                                >
                                    {insumos.map(ins => (
                                        <option key={ins.id} value={ins.id} className="bg-white dark:bg-zinc-900">{ins.nome} ({ins.unidadeMedida})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-3 w-28 bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-white/5 focus-within:border-sky-500/30 transition-all">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={item.quantidade === 0 ? "" : item.quantidade}
                                    onChange={(e) => atualizarItem(index, { quantidade: Number(e.target.value) || 0 })}
                                    className="w-full bg-transparent border-none text-xs font-black text-right text-zinc-900 dark:text-white outline-none"
                                />
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Qtd</span>
                            </div>

                            <div className="hidden md:flex flex-col items-end w-32 px-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">Subtotal</span>
                                <span className="text-[11px] font-black tabular-nums text-zinc-900 dark:text-white">
                                    {(item.quantidade * (item.custoUnitarioCentavos / 100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => removerInsumo(index)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    <div className="pt-2 px-4 flex justify-end">
                        <div className="flex items-center gap-3 px-4 py-2 bg-sky-500/5 border border-sky-500/10 rounded-xl">
                            <span className="text-[9px] font-black uppercase tracking-widest text-sky-600/70 dark:text-sky-500/50">Investimento em Insumos:</span>
                            <span className="text-sm font-black text-zinc-900 dark:text-white tabular-nums">
                                {selecionados.reduce((acc, i) => acc + (i.quantidade * (i.custoUnitarioCentavos / 100)), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
