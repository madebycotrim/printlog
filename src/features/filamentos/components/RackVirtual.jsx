import React from "react";
import { Plus } from "lucide-react";
import { CartaoFilamento } from "./CardFilamento";
import { LinhaFilamento } from "./LinhaFilamento";

export const RackVirtual = ({
    filamentosAgrupados,
    umidadeAtual,
    temperaturaAtual,
    acoes,
    modoVisualizacao = 'grid'
}) => {
    // Safety check para evitar erro quando filamentosAgrupados é undefined/null
    if (!filamentosAgrupados || typeof filamentosAgrupados !== 'object') {
        return null;
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            {Object.entries(filamentosAgrupados).map(([material, itens]) => (
                <div key={material} className="relative group/shelf pt-4">
                    {/* Cabeçalho da Prateleira */}
                    <div className="flex items-baseline gap-4 mb-8 ml-2">
                        <h2 className="text-4xl font-black text-zinc-800/50 uppercase tracking-tighter select-none absolute -top-2 -left-4 -z-10 group-hover/shelf:text-zinc-800 transition-colors duration-500">
                            {material}
                        </h2>
                        <div className="flex items-center gap-4 relative z-10">
                            <span className="text-2xl font-bold text-zinc-100 tracking-tight">{material}</span>
                            <span className="px-2 py-0.5 rounded-md bg-zinc-800/50 border border-white/5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                {itens.length} {itens.length === 1 ? 'Carretel' : 'Carretéis'}
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent min-w-[100px]" />
                        </div>
                    </div>

                    {/* Conteúdo da Prateleira (Grade ou Lista) */}
                    {modoVisualizacao === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                            {itens.map(item => (
                                <CartaoFilamento
                                    key={item.id}
                                    item={item}
                                    umidadeAtual={umidadeAtual}
                                    temperaturaAtual={temperaturaAtual}
                                    aoEditar={acoes.aoEditar}
                                    aoExcluir={acoes.aoExcluir}
                                    aoConsumir={acoes.aoConsumir}
                                    aoDuplicar={acoes.aoDuplicar}
                                    aoVerHistorico={acoes.aoVerHistorico}
                                />
                            ))}

                            {/* Slot Vazio (Adicionar Rápido) */}
                            <button
                                onClick={() => acoes.aoEditar({ material })} // Abre modal de novo item com material preenchido
                                className="group flex flex-col items-center justify-center w-full aspect-[3/4] rounded-3xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-transparent hover:bg-zinc-900/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]"
                            >
                                <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-zinc-800 group-hover:border-zinc-500 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                    <Plus size={24} className="text-zinc-600 group-hover:text-zinc-200" />
                                </div>
                                <span className="mt-4 text-xs font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400">Adicionar {material}</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {itens.map(item => (
                                <LinhaFilamento
                                    key={item.id}
                                    item={item}
                                    umidadeAtual={umidadeAtual}
                                    temperaturaAtual={temperaturaAtual}
                                    aoEditar={acoes.aoEditar}
                                    aoExcluir={acoes.aoExcluir}
                                    aoConsumir={acoes.aoConsumir}
                                    aoDuplicar={acoes.aoDuplicar}
                                    aoVerHistorico={acoes.aoVerHistorico}
                                />
                            ))}
                            {/* Slot Vazio (Adicionar Rápido - Lista) */}
                            <button
                                onClick={() => acoes.aoEditar({ material })}
                                className="w-full h-12 rounded-2xl border-2 border-dashed border-zinc-800/50 hover:border-zinc-700 bg-transparent hover:bg-zinc-900/30 flex items-center justify-center gap-3 transition-all group"
                            >
                                <Plus size={16} className="text-zinc-600 group-hover:text-zinc-400" />
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400">Adicionar {material}</span>
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
