import React, { useState, useMemo } from 'react';
import {
    Search, ChevronRight, Terminal, Activity, AlertTriangle,
    Coins, Code, Send, Globe, Info, CheckCircle2,
    Copy, AlertCircle, FileText, Cpu, Target,
    Box, Server, RefreshCw, LayoutGrid, BookOpen,
    Wrench, Lightbulb, ArrowRight
} from 'lucide-react';

import { WIKI_DATA } from '../utils/wikiData';
import MainSidebar from "../layouts/mainSidebar";
import JanelaFlutuante from "../components/Popup";

// --- COMPONENTES VISUAIS (Minimalistas) ---

const SimpleCard = ({ title, subtitle, icon: Icon, color = "sky", children, badge }) => {
    const colors = {
        sky: "text-sky-400 bg-sky-500/10",
        emerald: "text-emerald-400 bg-emerald-500/10",
        amber: "text-amber-400 bg-amber-500/10",
        rose: "text-rose-400 bg-rose-500/10",
        zinc: "text-zinc-400 bg-zinc-500/10",
    };
    // Fallback seguro
    const activeColorClass = colors[color] || colors.zinc;
    // Extrair apenas a cor do texto para o ícone (hack limpo)
    const iconColorClass = activeColorClass.split(' ')[0];

    return (
        <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-6 hover-lift transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-zinc-400 transition-colors">
                        {title}
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-1">
                        {subtitle}
                    </p>
                </div>

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeColorClass} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} className={iconColorClass} strokeWidth={2} />
                </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800/50">
                {children}
            </div>

            {badge && (
                <div className="mt-4 flex justify-end">
                    <span className="text-[9px] font-black px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-600 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                        {badge}
                    </span>
                </div>
            )}
        </div>
    );
};

export default function CentralMaker() {
    const [sidebarWidth, setSidebarWidth] = useState(68);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilter, setSelectedFilter] = useState('todos');
    const [selectedArticle, setSelectedArticle] = useState(null);


    const [popupConfig, setPopupConfig] = useState({
        isOpen: false, title: "", message: "", icon: AlertCircle, color: "sky"
    });

    // Filtros e Dados
    const filteredData = useMemo(() => {
        return WIKI_DATA.filter(category => {
            const matchesSearch = category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.topics.some(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesFilter = selectedFilter === 'todos' || category.type === selectedFilter;
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, selectedFilter]);

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setPopupConfig({
            isOpen: true,
            title: "Copiado",
            message: "Comando técnico copiado para a área de transferência.",
            icon: CheckCircle2,
            color: "emerald"
        });
    };

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">


            <MainSidebar onCollapseChange={(collapsed) => setSidebarWidth(collapsed ? 68 : 256)} />

            <main className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar" style={{ marginLeft: `${sidebarWidth}px` }}>

                {/* Fundo Decorativo */}
                <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
                    <div className="absolute inset-0 opacity-[0.08]" style={{
                        backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                    }} />

                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
                        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-sky-500/30 via-transparent to-transparent" />
                    </div>
                </div>

                <div className="p-8 xl:p-12 relative z-10 max-w-[1600px] mx-auto w-full">

                    {/* Header Minimalista */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-in-up">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-white">Central Maker</h1>

                            <p className="text-sm text-zinc-500 max-w-lg leading-relaxed">
                                Base de conhecimento para otimizar sua produção e resolver problemas técnicos comuns.
                            </p>
                        </div>

                        {/* Barra de Busca Estilo Dashboard */}
                        <div className="relative group w-full md:w-96">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" />
                            <input
                                className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-zinc-300 outline-none focus:border-sky-500/50 focus:bg-zinc-900 transition-all placeholder:text-zinc-700 uppercase tracking-wider shadow-inner font-mono"
                                placeholder="BUSCAR GUIA..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filtros em Tabs - Visual de 'Pílulas' do Dashboard */}
                    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        {[
                            { id: 'todos', label: 'Todos' },
                            { id: 'critico', label: 'Críticos' },
                            { id: 'lucro', label: 'Financeiro' },
                            { id: 'setup', label: 'Técnico' },
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setSelectedFilter(filter.id)}
                                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${selectedFilter === filter.id
                                    ? 'bg-zinc-800 text-zinc-200 border-zinc-700 shadow-lg'
                                    : 'bg-transparent text-zinc-600 border-transparent hover:bg-zinc-900/50 hover:text-zinc-400'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Grid de Conteúdo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {filteredData.map((category) => (
                            <SimpleCard
                                key={category.id}
                                title={category.title}
                                subtitle={category.category}
                                icon={category.icon}
                                color={category.color}
                                badge={`REF: 0${category.id}`}
                            >
                                <div className="space-y-1 mt-2">
                                    {category.topics.map(topic => (
                                        <button
                                            key={topic.id}
                                            onClick={() => setSelectedArticle(topic)}
                                            className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.03] group/item transition-all border border-transparent hover:border-zinc-800/50"
                                        >
                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                <div className="w-1 h-1 rounded-full bg-zinc-800 group-hover/item:bg-sky-500 transition-colors shrink-0" />
                                                <span className="text-[10px] font-bold text-zinc-500 group-hover/item:text-zinc-300 truncate transition-colors uppercase tracking-tight">
                                                    {topic.title}
                                                </span>
                                            </div>
                                            <ChevronRight size={12} className="text-zinc-800 group-hover/item:text-sky-500 opacity-60 group-hover/item:opacity-100 transition-all shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            </SimpleCard>
                        ))}
                    </div>



                </div>
            </main>

            {/* Modal de Detalhes (Mantido funcional, ajustado visualmente) */}
            <JanelaFlutuante
                isOpen={!!selectedArticle}
                onClose={() => setSelectedArticle(null)}
                title={selectedArticle?.title || "Leitura"}
                subtitle="Detalhes do tópico"
                icon={FileText}
            >
                <div className="p-6 space-y-6 bg-zinc-950/50">
                    <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-sky-500/10 border border-sky-500/20 rounded text-[9px] font-bold text-sky-400 uppercase tracking-wide">
                            Nível: {selectedArticle?.level}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono">
                            Atualizado: {selectedArticle?.updated}
                        </span>
                    </div>

                    <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-line">
                            {selectedArticle?.content}
                        </p>
                    </div>

                    {selectedArticle?.gcode && (
                        <div className="bg-black/40 border border-zinc-800 rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                    <Terminal size={10} /> Snippet G-Code
                                </span>
                                <button
                                    onClick={() => handleCopyCode(selectedArticle.gcode)}
                                    className="text-zinc-600 hover:text-sky-400 transition-colors"
                                >
                                    <Copy size={12} />
                                </button>
                            </div>
                            <div className="p-4 font-mono text-[10px] text-emerald-400 bg-zinc-950/80">
                                {selectedArticle.gcode}
                            </div>
                        </div>
                    )}
                </div>
            </JanelaFlutuante>

            {/* Toasts / Notificações */}
            <JanelaFlutuante
                isOpen={popupConfig.isOpen}
                onClose={() => setPopupConfig({ ...popupConfig, isOpen: false })}
                title={popupConfig.title}
                icon={popupConfig.icon}
            >
                <div className="p-8 text-center">
                    <p className="text-xs text-zinc-400 mb-6">{popupConfig.message}</p>
                    <button
                        onClick={() => setPopupConfig({ ...popupConfig, isOpen: false })}
                        className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        OK
                    </button>
                </div>
            </JanelaFlutuante>
        </div>
    );
}