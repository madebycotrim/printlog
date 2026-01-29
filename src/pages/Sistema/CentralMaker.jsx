import React, { useState, useMemo } from 'react';
import {
    Search, ChevronRight, Terminal, Activity, AlertTriangle,
    Coins, Code, Send, Globe, Info, CheckCircle2,
    Copy, AlertCircle, FileText, Cpu, Target,
    Box, Server, RefreshCw, LayoutGrid, BookOpen,
    Wrench, Lightbulb, ArrowRight, Star, GraduationCap
} from 'lucide-react';

import { WIKI_DATA } from '../../utils/wikiData';
import ManagementLayout from "../../layouts/ManagementLayout";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import DataCard from "../../components/ui/DataCard";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";



export default function CentralMaker() {
    // Stores
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilter, setSelectedFilter] = useState('todos');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [popupConfig, setPopupConfig] = useState({
        isOpen: false, title: "", message: "", icon: AlertCircle, color: "sky"
    });

    // Filtros e Lógica de Busca
    const filteredData = useMemo(() => {
        return WIKI_DATA.filter(category => {
            const term = searchTerm.toLowerCase();
            const matchesSearch = category.title.toLowerCase().includes(term) ||
                category.topics.some(t => t.title.toLowerCase().includes(term) || t.content.toLowerCase().includes(term));

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
        <ManagementLayout>
            <div className="p-8 xl:p-12 relative z-10 max-w-[1600px] mx-auto w-full">

                <PageHeader
                    title="Central Maker"
                    subtitle="Guias técnicos, configurações e soluções de problemas"
                    searchQuery={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="BUSCAR GUIA..."
                    extraControls={
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/50 border border-zinc-800 rounded-full">
                            <GraduationCap size={14} className="text-zinc-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Wiki v2.0</span>
                        </div>
                    }
                />

                {/* Filtros em Pílulas (Estilo Dashboard) */}
                <div className="flex flex-wrap items-center gap-2 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    {[
                        { id: 'todos', label: 'Todos', icon: LayoutGrid },
                        { id: 'critico', label: 'Críticos', icon: AlertTriangle },
                        { id: 'lucro', label: 'Financeiro', icon: Coins },
                        { id: 'setup', label: 'Técnico', icon: Wrench },
                    ].map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setSelectedFilter(filter.id)}
                            className={`
                                group px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 border flex items-center gap-2
                                ${selectedFilter === filter.id
                                    ? 'bg-zinc-100 text-zinc-950 border-white'
                                    : 'bg-zinc-950/40 text-zinc-600 border-zinc-800/50 hover:bg-zinc-900 hover:text-zinc-400 hover:border-zinc-700'
                                }
                            `}
                        >
                            <filter.icon size={12} className={selectedFilter === filter.id ? 'text-zinc-950' : 'text-zinc-600 group-hover:text-zinc-500'} />
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Grid de Conteúdo */}
                {filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {filteredData.map((category) => (
                            <DataCard
                                key={category.id}
                                title={category.title}
                                subtitle={category.category}
                                icon={category.icon}
                                color={category.color}
                                badge={`REF: 0${category.id}`}
                            >
                                <div className="mt-4 space-y-1">
                                    {category.topics.map(topic => (
                                        <button
                                            key={topic.id}
                                            onClick={() => setSelectedArticle(topic)}
                                            className="w-full relative overflow-hidden flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.04] group/item transition-all border border-transparent hover:border-zinc-800/50"
                                        >
                                            <div className="flex items-center gap-3 relative z-10 w-full overflow-hidden">
                                                <div className={`
                                                    w-1 h-1 rounded-full shrink-0 transition-colors duration-300
                                                    ${selectedArticle?.id === topic.id ? `bg-${category.color}-400` : 'bg-zinc-800 group-hover/item:bg-zinc-400'}
                                                `} />

                                                <span className="text-[10px] font-bold text-zinc-500 group-hover/item:text-zinc-300 truncate transition-colors uppercase tracking-tight flex-1 text-left">
                                                    {topic.title}
                                                </span>
                                            </div>
                                            <ChevronRight size={12} className="text-zinc-800 group-hover/item:text-zinc-400 opacity-60 group-hover/item:opacity-100 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </DataCard>
                        ))}
                    </div>
                ) : (
                    // Estado Vazio (Zero State)
                    <EmptyState
                        title="Nenhum resultado encontrado"
                        description="Tente buscar por outro termo ou categoria."
                        icon={Search}
                    />
                )}
            </div>

            {/* Modal de Leitura (Design Refinado) */}
            <Modal
                isOpen={!!selectedArticle}
                onClose={() => setSelectedArticle(null)}
                title={selectedArticle?.title || "Leitura"}
                subtitle="Detalhes do Tópico"
                icon={BookOpen}
                maxWidth="max-w-3xl"
            >
                <div className="p-8 space-y-8">

                    {/* Tags do Artigo */}
                    <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                            <Target size={12} className="text-sky-500" />
                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider">
                                {selectedArticle?.level}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                            <RefreshCw size={12} className="text-zinc-500" />
                            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                                {selectedArticle?.updated}
                            </span>
                        </div>
                    </div>

                    {/* Conteúdo do Texto */}
                    <div className="prose prose-invert max-w-none">
                        <p className="text-zinc-300 text-sm leading-8 tracking-wide font-medium whitespace-pre-line text-justify">
                            {selectedArticle?.content}
                        </p>
                    </div>

                    {/* Snippet de código (se houver) */}
                    {selectedArticle?.gcode && (
                        <div className="relative group/code mt-8">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-sky-500/20 rounded-xl opacity-50 blur group-hover/code:opacity-75 transition duration-500" />
                            <div className="relative bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.05]">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                        <Terminal size={12} strokeWidth={2.5} />
                                        Comando G-Code
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="xs"
                                        onClick={() => handleCopyCode(selectedArticle.gcode)}
                                        className="text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10"
                                        title="Copiar Código"
                                        icon={Copy}
                                    />
                                </div>
                                <div className="p-6 overflow-x-auto custom-scrollbar">
                                    <pre className="font-mono text-xs text-emerald-300 leading-relaxed">
                                        {selectedArticle.gcode}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dica de Rodapé */}
                    <div className="pt-6 border-t border-white/5 flex items-start gap-4 opacity-60">
                        <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase tracking-wide">
                            Dica de Mestre: Sempre teste os comandos em uma impressão pequena antes de aplicar em peças grandes.
                        </p>
                    </div>

                </div>
            </Modal>

            {/* Notificações */}
            <Modal
                isOpen={popupConfig.isOpen}
                onClose={() => setPopupConfig({ ...popupConfig, isOpen: false })}
                title={popupConfig.title}
                icon={popupConfig.icon}
                maxWidth="max-w-sm"
            >
                <div className="p-8 text-center flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full bg-${popupConfig.color}-500/10 flex items-center justify-center mb-4 text-${popupConfig.color}-500`}>
                        <CheckCircle2 size={24} />
                    </div>
                    <p className="text-xs text-zinc-400 font-medium mb-8 leading-relaxed max-w-[200px]">
                        {popupConfig.message}
                    </p>
                    <Button
                        variant="primary"
                        onClick={() => setPopupConfig({ ...popupConfig, isOpen: false })}
                        className="w-full"
                    >
                        Entendido
                    </Button>
                </div>
            </Modal>
        </ManagementLayout>
    );
}
