import { Book, ArrowUpRight, Sparkles, Zap, Shield, Target, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface InterfaceTopico {
    id: string;
    titulo: string;
    conteudo: string;
    nivel: string;
    atualizado: string;
    gcode?: string;
    categoria?: string;
    cor?: string;
    level?: string;
}

interface InterfaceCategoria {
    id: string;
    titulo: string;
    subtitulo: string;
    icone: any;
    corPaleta: string;
    cor: string;
    fundo: string;
    topicos: InterfaceTopico[];
}

interface Propriedades {
    categorias: InterfaceCategoria[];
    aoSelecionarTopico: (topico: InterfaceTopico) => void;
}

const CONFIG_NIVEL: Record<string, { icone: any, cor: string }> = {
    "Iniciante": { icone: Zap, cor: "text-emerald-500" },
    "Essencial": { icone: Shield, cor: "text-sky-500" },
    "Técnico": { icone: Target, cor: "text-amber-500" },
    "Avançado": { icone: Activity, cor: "text-violet-500" },
    "Veterano": { icone: Sparkles, cor: "text-orange-500" },
    "Segurança": { icone: Shield, cor: "text-rose-500" },
    "Crítico": { icone: Zap, cor: "text-rose-600" },
};

export function GridWiki({ categorias, aoSelecionarTopico }: Propriedades) {
    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                {categorias.map((categoria, index) => (
                    <motion.div
                        key={categoria.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-white/[0.04] p-2 shadow-sm hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all duration-700 flex flex-col overflow-hidden"
                    >
                        {/* CABEÇALHO DO MÓDULO (LADO A - VERTICALIZADO) */}
                        <div className={`p-8 rounded-2xl relative overflow-hidden ${categoria.fundo} border border-white/50 dark:border-white/5 m-1`}>
                            {/* Brilho de Fundo Sutil */}
                            <div className={`absolute -top-24 -right-24 w-64 h-64 ${categoria.cor.replace('text', 'bg').replace('-500', '-600')}/10 blur-[80px] pointer-events-none opacity-50`} />

                            <div className="flex items-center justify-between relative z-10 mb-6">
                                <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-black/40 shadow-xl flex items-center justify-center ${categoria.cor} border border-gray-100 dark:border-white/5 transform group-hover:rotate-6 transition-transform`}>
                                    <categoria.icone size={28} strokeWidth={2.5} />
                                </div>
                                <div className="px-3 py-1 rounded-full bg-white/50 dark:bg-black/20 border border-white/50 dark:border-white/5">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${categoria.cor} opacity-80`}>MÓDULO {categoria.id}</span>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-3xl font-black uppercase tracking-tighter leading-none text-gray-900 dark:text-white drop-shadow-sm mb-2">
                                    {categoria.titulo}
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500 leading-relaxed border-l-2 border-current pl-3">
                                    {categoria.subtitulo}
                                </p>
                            </div>
                        </div>

                        {/* LISTAGEM TÉCNICA COM SCROLL (LADO B - VERTICALIZADO) */}
                        <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col">
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {categoria.topicos.map(topico => {
                                    const nivelKey = topico.level || topico.nivel;
                                    const config = CONFIG_NIVEL[nivelKey] || { icone: Book, cor: "text-gray-400" };

                                    return (
                                        <button
                                            key={topico.id}
                                            onClick={() => aoSelecionarTopico({ ...topico, categoria: categoria.titulo, cor: categoria.cor })}
                                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.05] border border-gray-100/50 dark:border-white/[0.03] hover:border-gray-200 dark:hover:border-white/10 transition-all group/item shadow-sm hover:shadow-xl text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 group-hover/item:border-current transition-colors ${categoria.cor}`}>
                                                    <config.icone size={16} strokeWidth={2.5} className="opacity-40 group-hover/item:opacity-100 transition-opacity" />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-black text-gray-900 dark:text-zinc-100 block tracking-tight leading-none mb-1.5 uppercase">
                                                        {topico.titulo}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[8px] font-black uppercase tracking-[0.15em] ${config.cor}`}>
                                                            {nivelKey}
                                                        </span>
                                                        <span className="text-[8px] font-bold text-gray-400 dark:text-zinc-700 uppercase tracking-widest">
                                                            • {topico.atualizado}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all duration-300 bg-gray-100 dark:bg-white/5 ${categoria.cor}`}>
                                                <ArrowUpRight size={18} strokeWidth={3} />
                                            </div>
                                        </button>
                                    );
                                })}

                                {categoria.topicos.length === 0 && (
                                    <div className="flex-1 flex flex-col items-center justify-center py-12 opacity-20 select-none grayscale">
                                        <Book size={40} strokeWidth={1} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] mt-4">Repositório Vazio</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.1);
                    border-radius: 20px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(156, 163, 175, 0.2);
                }
            `}</style>
        </div>
    );
}
