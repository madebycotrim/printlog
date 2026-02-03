import React, { useState, useMemo } from 'react';
import {
    Search, ChevronRight, Terminal, Activity, AlertTriangle,
    Coins, Code, Send, Globe, Info, CheckCircle2,
    Copy, AlertCircle, FileText, Cpu, Target,
    Box, Server, RefreshCw, LayoutGrid, BookOpen,
    Wrench, Lightbulb, ArrowRight, Star, GraduationCap,
    Zap, Shield, Flame, Layers
} from 'lucide-react';

import { WIKI_DATA } from '../../utils/wikiData';
import ManagementLayout from "../../layouts/ManagementLayout";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import EstadoVazio from "../../components/ui/EstadoVazio";

export default function CentralMaker() {
    // Stores
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilter, setSelectedFilter] = useState('todos');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [popupConfig, setPopupConfig] = useState({
        isOpen: false, title: "", message: "", icon: AlertCircle, color: "sky"
    });

    // Lógica de Filtros
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

    // Mapeamento de cores para classes Tailwind
    const getColorClasses = (color) => {
        const colors = {
            sky: {
                bg: "bg-sky-500/10",
                text: "text-sky-400",
                border: "border-sky-500/20",
                glow: "shadow-sky-500/20",
                gradient: "from-sky-500/20",
                bottomGradient: "via-sky-500/50",
                iconBg: "bg-sky-500/10",
                ring: "ring-sky-500/5",
                iconText: "text-sky-500"
            },
            emerald: {
                bg: "bg-emerald-500/10",
                text: "text-emerald-400",
                border: "border-emerald-500/20",
                glow: "shadow-emerald-500/20",
                gradient: "from-emerald-500/20",
                bottomGradient: "via-emerald-500/50",
                iconBg: "bg-emerald-500/10",
                ring: "ring-emerald-500/5",
                iconText: "text-emerald-500"
            },
            amber: {
                bg: "bg-amber-500/10",
                text: "text-amber-400",
                border: "border-amber-500/20",
                glow: "shadow-amber-500/20",
                gradient: "from-amber-500/20",
                bottomGradient: "via-amber-500/50",
                iconBg: "bg-amber-500/10",
                ring: "ring-amber-500/5",
                iconText: "text-amber-500"
            },
            rose: {
                bg: "bg-rose-500/10",
                text: "text-rose-400",
                border: "border-rose-500/20",
                glow: "shadow-rose-500/20",
                gradient: "from-rose-500/20",
                bottomGradient: "via-rose-500/50",
                iconBg: "bg-rose-500/10",
                ring: "ring-rose-500/5",
                iconText: "text-rose-500"
            },
            purple: {
                bg: "bg-purple-500/10",
                text: "text-purple-400",
                border: "border-purple-500/20",
                glow: "shadow-purple-500/20",
                gradient: "from-purple-500/20",
                bottomGradient: "via-purple-500/50",
                iconBg: "bg-purple-500/10",
                ring: "ring-purple-500/5",
                iconText: "text-purple-500"
            },
            indigo: {
                bg: "bg-indigo-500/10",
                text: "text-indigo-400",
                border: "border-indigo-500/20",
                glow: "shadow-indigo-500/20",
                gradient: "from-indigo-500/20",
                bottomGradient: "via-indigo-500/50",
                iconBg: "bg-indigo-500/10",
                ring: "ring-indigo-500/5",
                iconText: "text-indigo-500"
            },
            orange: {
                bg: "bg-orange-500/10",
                text: "text-orange-400",
                border: "border-orange-500/20",
                glow: "shadow-orange-500/20",
                gradient: "from-orange-500/20",
                bottomGradient: "via-orange-500/50",
                iconBg: "bg-orange-500/10",
                ring: "ring-orange-500/5",
                iconText: "text-orange-500"
            },
        };
        // Fallback seguro
        return colors[color] || colors.sky;
    };

    return (
        <ManagementLayout>
            <div className="relative min-h-screen pb-20">
                {/* Background Decorativo */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="relative z-10 space-y-8">
                    {/* Header Preservado */}
                    <PageHeader
                        title="Central Maker"
                        subtitle="Guias técnicos, configurações e soluções de problemas"
                        accentColor="text-purple-500"
                        searchQuery={searchTerm}
                        onSearchChange={setSearchTerm}
                        placeholder="BUSCAR GUIA..."
                    />

                    {/* Filtros Premium */}
                    <div className="flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        {[
                            { id: 'todos', label: 'Visão Geral', icon: LayoutGrid, color: 'text-zinc-400' },
                            { id: 'critico', label: 'Críticos', icon: AlertTriangle, color: 'text-rose-400' },
                            { id: 'lucro', label: 'Financeiro', icon: Coins, color: 'text-emerald-400' },
                            { id: 'setup', label: 'Técnico', icon: Wrench, color: 'text-sky-400' },
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setSelectedFilter(filter.id)}
                                className={`
                                    relative group px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300
                                    flex items-center gap-2.5 border overflow-hidden
                                    ${selectedFilter === filter.id
                                        ? 'bg-zinc-100/10 border-zinc-100/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                        : 'bg-zinc-950/40 border-zinc-800/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 hover:bg-zinc-900/60'
                                    }
                                `}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine`} />
                                <filter.icon
                                    size={14}
                                    className={`transition-colors duration-300 ${selectedFilter === filter.id ? filter.color : 'text-zinc-600 group-hover:text-zinc-400'}`}
                                />
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Grid de Conteúdo */}
                    {filteredData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            {filteredData.map((category, index) => {
                                const styles = getColorClasses(category.color);
                                const Icon = category.icon;

                                return (
                                    <div
                                        key={category.id}
                                        className={`
                                            group relative flex flex-col justify-between
                                            bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-[2rem] p-6
                                            hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all duration-500
                                            hover:shadow-2xl hover:-translate-y-1 overflow-hidden
                                        `}
                                        style={{ animationDelay: `${0.1 + (index * 0.05)}s` }}
                                    >
                                        {/* Gradient Background Effect */}
                                        <div className={`
                                            absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700
                                            bg-gradient-to-br ${styles.gradient} to-transparent
                                        `} />

                                        {/* Header do Card */}
                                        <div className="relative z-10 mb-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`
                                                    w-12 h-12 rounded-2xl flex items-center justify-center
                                                    ${styles.bg} ${styles.border} ${styles.text} border
                                                    group-hover:scale-110 transition-transform duration-500 shadow-lg
                                                `}>
                                                    <Icon size={24} strokeWidth={2} />
                                                </div>
                                                <span className="font-mono text-[10px] font-black text-zinc-700/50 group-hover:text-zinc-600/80 transition-colors uppercase tracking-widest text-right">
                                                    REF<br /><span className="text-xl opacity-20">0{category.id}</span>
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-white leading-tight group-hover:text-zinc-100 transition-colors">
                                                    {category.title}
                                                </h3>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${styles.text} opacity-80`}>
                                                    {category.category}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Lista de Tópicos */}
                                        <div className="relative z-10 space-y-2">
                                            {category.topics.map(topic => (
                                                <button
                                                    key={topic.id}
                                                    onClick={() => setSelectedArticle(topic)}
                                                    className="w-full group/item relative overflow-hidden flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.05] transition-all duration-300"
                                                >
                                                    <div className={`
                                                        w-1.5 h-1.5 rounded-full ring-2 ring-zinc-900
                                                        ${selectedArticle?.id === topic.id ? styles.text.replace('text', 'bg') : 'bg-zinc-700 group-hover/item:bg-zinc-400'}
                                                        transition-colors duration-300
                                                    `} />

                                                    <span className="text-xs font-medium text-zinc-500 group-hover/item:text-zinc-200 truncate transition-colors text-left flex-1">
                                                        {topic.title}
                                                    </span>

                                                    <ChevronRight
                                                        size={14}
                                                        className="text-zinc-700 group-hover/item:text-zinc-400 -translate-x-2 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300"
                                                    />
                                                </button>
                                            ))}
                                        </div>

                                        {/* Glow Effect na Borda (Bottom) */}
                                        <div className={`
                                            absolute bottom-0 left-0 w-full h-[1px]
                                            bg-gradient-to-r from-transparent ${styles.bottomGradient} to-transparent
                                            opacity-0 group-hover:opacity-100 transition-opacity duration-700
                                        `} />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <EstadoVazio
                            title="Nenhum guia encontrado"
                            description="Tente buscar por outro termo ou categoria."
                            icon={Search}
                        />
                    )}
                </div>

                {/* Modal de Leitura */}
                <Modal
                    isOpen={!!selectedArticle}
                    onClose={() => setSelectedArticle(null)}
                    title={selectedArticle?.title || "Leitura"}
                    subtitle="Base de Conhecimento"
                    icon={BookOpen}
                    maxWidth="max-w-4xl"
                >
                    <div className="p-8 md:p-10 space-y-10">
                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 pb-8 border-b border-white/5">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 shadow-lg shadow-sky-500/5">
                                <Target size={14} className="text-sky-400" />
                                <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider">
                                    Nível: {selectedArticle?.level}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                                <RefreshCw size={14} className="text-zinc-500" />
                                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                                    Atualizado: {selectedArticle?.updated}
                                </span>
                            </div>
                        </div>

                        {/* Conteúdo */}
                        <div className="prose prose-invert max-w-none">
                            <p className="text-zinc-300 text-base leading-8 tracking-wide font-light whitespace-pre-line text-justify selection:bg-purple-500/30 selection:text-white">
                                {selectedArticle?.content}
                            </p>
                        </div>

                        {/* Snippet de código */}
                        {selectedArticle?.gcode && (
                            <div className="relative group/code mt-10">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-sky-500/20 rounded-xl opacity-0 group-hover/code:opacity-100 transition duration-700 blur" />
                                <div className="relative bg-[#0d0d10] rounded-xl border border-zinc-800/80 overflow-hidden shadow-2xl">
                                    <div className="flex items-center justify-between px-5 py-4 bg-white/[0.02] border-b border-white/[0.03]">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2.5">
                                            <Terminal size={14} strokeWidth={2.5} />
                                            Comando G-Code
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCopyCode(selectedArticle.gcode)}
                                            className="text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                            title="Copiar Código"
                                            icon={Copy}
                                        />
                                    </div>
                                    <div className="p-6 overflow-x-auto custom-scrollbar bg-black/20">
                                        <pre className="font-mono text-sm text-emerald-300/90 leading-relaxed shadow-none">
                                            {selectedArticle.gcode}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dica de Rodapé */}
                        <div className="flex items-start gap-5 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 mb-auto">
                                <Lightbulb size={20} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Dica de Mestre</span>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Sempre teste os comandos em uma impressão pequena antes de aplicar em peças grandes para evitar perda de material.
                                </p>
                            </div>
                        </div>
                    </div>
                </Modal>

                {/* Notificações (Toast) */}
                <Modal
                    isOpen={popupConfig.isOpen}
                    onClose={() => setPopupConfig({ ...popupConfig, isOpen: false })}
                    title=""
                    icon={null}
                    maxWidth="max-w-xs"
                    className="!p-0 overflow-hidden"
                >
                    <div className="p-6 text-center flex flex-col items-center bg-zinc-950 border border-zinc-800 rounded-2xl">
                        {(() => {
                            const popupStyles = getColorClasses(popupConfig.color);
                            return (
                                <>
                                    <div className={`w-16 h-16 rounded-full ${popupStyles.iconBg} flex items-center justify-center mb-5 ${popupStyles.iconText} ring-4 ${popupStyles.ring}`}>
                                        <popupConfig.icon size={32} strokeWidth={1.5} />
                                    </div>
                                    <h4 className="text-base font-bold text-white mb-2">{popupConfig.title}</h4>
                                    <p className="text-sm text-zinc-400 font-medium mb-6 leading-relaxed">
                                        {popupConfig.message}
                                    </p>
                                </>
                            );
                        })()}

                        <Button
                            variant="primary"
                            onClick={() => setPopupConfig({ ...popupConfig, isOpen: false })}
                            className="w-full rounded-xl py-3"
                        >
                            Fechar
                        </Button>
                    </div>
                </Modal>
            </div>
        </ManagementLayout>
    );
}
