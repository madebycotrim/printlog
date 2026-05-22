import { Plus, Trash2 } from "lucide-react";
import { MaterialProjeto } from "../tipos";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";

interface PropriedadesSeletor {
    selecionados: MaterialProjeto[];
    aoAbrirArmazem: () => void;
    aoAlterar: (materiais: MaterialProjeto[]) => void;
}

export function SeletorMateriaisPedido({ selecionados, aoAbrirArmazem, aoAlterar }: PropriedadesSeletor) {
    const { materiais } = useArmazemMateriais();

    const adicionarMaterial = () => {
        aoAbrirArmazem();
    };

    const removerMaterial = (index: number) => {
        const novaLista = [...selecionados];
        novaLista.splice(index, 1);
        aoAlterar(novaLista);
    };

    const atualizarItem = (index: number, campos: Partial<MaterialProjeto>) => {
        const novaLista = selecionados.map((item, i) => {
            if (i === index) {
                const base = { ...item, ...campos };
                // Se mudou o ID, atualiza o nome
                if (campos.idMaterial) {
                    const ref = materiais.find(m => m.id === campos.idMaterial);
                    if (ref) {
                        base.nome = ref.nome;
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
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Plus size={16} />
                    </div>
                    <div>
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Filamentos e Materiais</h5>
                        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Defina os materiais gastos nesta impressão</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={adicionarMaterial}
                    disabled={materiais.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[9px] font-black uppercase tracking-[0.15em] rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
                >
                    <Plus size={10} strokeWidth={4} />
                    Adicionar Filamento
                </button>
            </div>

            {selecionados.length === 0 ? (
                <div 
                    onClick={adicionarMaterial}
                    className="p-10 border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-2xl text-center bg-gray-50/30 dark:bg-white/[0.01] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] hover:border-amber-500/20 cursor-pointer transition-all group"
                >
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Plus size={18} className="text-zinc-400 group-hover:text-amber-500" />
                    </div>
                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Nenhum material detalhado ainda</p>
                    <p className="text-[8px] font-bold text-zinc-300 dark:text-zinc-600 uppercase mt-1">Clique para vincular um filamento do seu armazém</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {selecionados.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl group animate-in zoom-in-95 duration-300">
                            <div className="flex-1 min-w-[150px]">
                                <select
                                    value={item.idMaterial}
                                    onChange={(e) => atualizarItem(index, { idMaterial: e.target.value })}
                                    className="w-full bg-transparent border-0 border-b-2 border-zinc-200 dark:border-white/10 text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-white outline-none focus:border-amber-500 py-1.5 transition-colors cursor-pointer"
                                >
                                    {materiais.map(m => (
                                        <option key={m.id} value={m.id} className="bg-white dark:bg-zinc-900">{m.nome} ({m.tipo})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-3 w-28 bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-white/5 focus-within:border-amber-500/30 transition-all">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={item.quantidadeGasta === 0 ? "" : item.quantidadeGasta}
                                    onChange={(e) => atualizarItem(index, { quantidadeGasta: Number(e.target.value) || 0 })}
                                    className="w-full bg-transparent border-none text-xs font-black text-right text-zinc-900 dark:text-white outline-none"
                                />
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">g</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => removerMaterial(index)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    
                    <div className="pt-2 px-4 flex justify-end">
                        <div className="flex items-center gap-3 px-4 py-2 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-600/70 dark:text-amber-500/50">Peso Total:</span>
                            <span className="text-sm font-black text-zinc-900 dark:text-white tabular-nums">
                                {selecionados.reduce((acc, i) => acc + (i.quantidadeGasta || 0), 0)}g
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
