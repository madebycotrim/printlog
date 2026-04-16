/**
 * @file SeletorInsumosSecundarios.tsx
 * @description Componente para gerenciar a composição de custos de insumos no projeto.
 * v9.0 - Arquiteto Sênior PrintLog
 */

import { Plus, Trash2 } from "lucide-react";
import { InsumoProjeto } from "../tipos";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";

interface PropriedadesSeletor {
    selecionados: InsumoProjeto[];
    aoAlterar: (insumos: InsumoProjeto[]) => void;
}

export function SeletorInsumosSecundarios({ selecionados, aoAlterar }: PropriedadesSeletor) {
    const { insumos } = usarArmazemInsumos();

    const adicionarInsumo = () => {
        const primeiroDisponivel = insumos[0];
        if (!primeiroDisponivel) return;

        aoAlterar([...selecionados, {
            idInsumo: primeiroDisponivel.id,
            nome: primeiroDisponivel.nome,
            quantidade: 1,
            custoUnitarioCentavos: primeiroDisponivel.custoMedioUnidade
        }]);
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
            <div className="flex items-center justify-between">
                <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Composição de Insumos Diversos</h5>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Parafusos, Embalagens, Tintas e Insumos Secundários</p>
                </div>
                <button
                    type="button"
                    onClick={adicionarInsumo}
                    disabled={insumos.length === 0}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[9px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={10} strokeWidth={3} />
                    Adicionar Item
                </button>
            </div>

            {selecionados.length === 0 ? (
                <div className="p-8 border border-dashed border-zinc-100 dark:border-white/5 rounded-2xl text-center">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Nenhum insumo extra aplicado a este projeto</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {selecionados.map((item, index) => (
                        <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-3 p-3 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-xl group animate-in slide-in-from-left-2 duration-300">
                            <div className="flex-1 min-w-[150px]">
                                <select
                                    value={item.idInsumo}
                                    onChange={(e) => atualizarItem(index, { idInsumo: e.target.value })}
                                    className="w-full bg-transparent border-0 border-b border-zinc-200 dark:border-white/10 text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-white outline-none focus:border-sky-500 py-1"
                                >
                                    {insumos.map(ins => (
                                        <option key={ins.id} value={ins.id} className="bg-white dark:bg-zinc-900">{ins.nome} ({ins.unidadeMedida})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 w-24">
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantidade}
                                    onChange={(e) => atualizarItem(index, { quantidade: Number(e.target.value) || 0 })}
                                    className="w-full bg-transparent border-0 border-b border-zinc-200 dark:border-white/10 text-xs font-black text-center text-zinc-900 dark:text-white outline-none focus:border-sky-500 py-1"
                                />
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Qtd</span>
                            </div>

                            <div className="hidden md:block w-32 px-2 text-right">
                                <span className="text-[10px] font-black tabular-nums text-zinc-500 dark:text-zinc-400">
                                    {(item.quantidade * (item.custoUnitarioCentavos / 100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => removerInsumo(index)}
                                className="p-2 text-zinc-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}

                    <div className="pt-2 px-3 flex justify-end">
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Custo Total em Insumos Extras</p>
                            <p className="text-sm font-black text-zinc-900 dark:text-white">
                                {selecionados.reduce((acc, i) => acc + (i.quantidade * (i.custoUnitarioCentavos / 100)), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
