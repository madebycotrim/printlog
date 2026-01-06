import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Search, ChevronRight, Mail, X, Terminal, Activity, AlertTriangle, 
    Coins, Code, Send, Globe, Info, ClipboardCheck, Factory, CheckCircle2,
    Copy, AlertCircle
} from 'lucide-react';

import { WIKI_DATA } from '../utils/wikiData';
import MainSidebar from "../layouts/mainSidebar";

// --- SUB-COMPONENTE: JANELA MODAL (PADRÃO HUD) ---
const Modal = ({ isOpen, onClose, title, children, actions }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-white/[0.03] flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{title}</span>
                    <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-6 text-zinc-300 text-sm leading-relaxed">{children}</div>
                {actions && <div className="px-6 py-4 bg-white/[0.02] flex gap-3 justify-end border-t border-white/[0.03]">{actions}</div>}
            </div>
        </div>
    );
};

// --- COMPONENTES VISUAIS AUXILIARES ---

const HUDOverlay = () => (
    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.02]"
        style={{
            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
            backgroundSize: '100% 4px, 3px 100%'
        }}
    />
);

const TypewriterHero = ({ phrases, speed = 100, delay = 2500 }) => {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const currentPhrase = phrases[phraseIndex];
    const fullText = currentPhrase.line1 + currentPhrase.line2;

    useEffect(() => {
        if (subIndex === fullText.length + 1 && !reverse) {
            setTimeout(() => setReverse(true), delay);
            return;
        }
        if (subIndex === 0 && reverse) {
            setReverse(false);
            setPhraseIndex((prev) => (prev + 1) % phrases.length);
            return;
        }
        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, reverse ? speed / 2 : speed);
        return () => clearTimeout(timeout);
    }, [subIndex, phraseIndex, reverse, phrases, fullText.length, speed, delay]);

    return (
        <div className="flex flex-col leading-tight select-none">
            <span className="text-zinc-100 font-bold text-4xl md:text-6xl tracking-tighter">
                {currentPhrase.line1.substring(0, subIndex)}
                {subIndex <= currentPhrase.line1.length && <span className="animate-pulse border-r-4 border-sky-500 ml-1"></span>}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 font-bold text-4xl md:text-6xl tracking-tighter">
                {subIndex > currentPhrase.line1.length ? currentPhrase.line2.substring(0, subIndex - currentPhrase.line1.length) : ""}
                {subIndex > currentPhrase.line1.length && <span className="animate-pulse border-r-4 border-emerald-500 ml-1"></span>}
            </span>
        </div>
    );
};

const WikiModuleCard = ({ category, onSelectTopic }) => {
    const colorMap = {
        sky: "group-hover:border-sky-500/30 border-l-sky-500/50",
        rose: "group-hover:border-rose-500/30 border-l-rose-500/50",
        emerald: "group-hover:border-emerald-500/30 border-l-emerald-500/50",
        amber: "group-hover:border-amber-500/30 border-l-amber-500/50",
    };
    const textColorMap = {
        sky: "text-sky-400", rose: "text-rose-400", emerald: "text-emerald-400", amber: "text-amber-400",
    };

    return (
        <div className={`group relative bg-zinc-900/40 border border-zinc-800/50 border-l-4 ${colorMap[category.color]} rounded-2xl p-6 transition-all duration-300 hover:bg-zinc-900/60 hover:translate-y-[-2px] shadow-sm overflow-hidden backdrop-blur-sm`}>
            <HUDOverlay />
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700 transition-all ${textColorMap[category.color]}`}>
                        <category.icon size={20} strokeWidth={2} />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{category.category}</span>
                        <h3 className="text-sm font-bold uppercase text-zinc-100 tracking-tight">{category.title}</h3>
                    </div>
                </div>
            </div>
            <div className="space-y-2 relative z-10">
                {category.topics.map(topic => (
                    <button key={topic.id} onClick={() => onSelectTopic(topic)} className="w-full group/item flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700 transition-all hover:bg-zinc-900/50 text-left">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-3 rounded-full bg-zinc-800 group-hover/item:bg-sky-500 transition-all" />
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-zinc-400 group-hover/item:text-zinc-100 transition-colors uppercase tracking-tight">{topic.title}</span>
                                {topic.gcode && <span className="text-[9px] text-sky-500 font-mono mt-0.5 flex items-center gap-1 opacity-80"><Code size={10} /> SCRIPT_GCODE</span>}
                            </div>
                        </div>
                        <ChevronRight size={14} className="text-zinc-700 group-hover/item:text-sky-500 transition-all" />
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---

export default function WikiPage() {
    const [larguraSidebar, setLarguraSidebar] = useState(68);
    const [busca, setBusca] = useState("");
    const [filtroAtivo, setFiltroAtivo] = useState('all');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [copiado, setCopiado] = useState(false);

    // Estado para Modais de Alerta
    const [modalConfig, setModalConfig] = useState({ 
        open: false, title: "", message: "", type: "info" 
    });

    const phrases = useMemo(() => [
        { line1: "TRANSFORME", line2: "IDEIAS EM ATIVOS." },
        { line1: "EFICIÊNCIA", line2: "MÁXIMA NA FARM." },
        { line1: "SISTEMA", line2: "DE APOIO MAKER." }
    ], []);

    const filteredData = useMemo(() => {
        return WIKI_DATA.filter(cat => {
            const matchBusca = cat.title.toLowerCase().includes(busca.toLowerCase()) || 
                               cat.topics.some(t => t.title.toLowerCase().includes(busca.toLowerCase()));
            const matchFiltro = filtroAtivo === 'all' || cat.type === filtroAtivo;
            return matchBusca && matchFiltro;
        });
    }, [busca, filtroAtivo]);

    const handleCopyGCode = (code) => {
        navigator.clipboard.writeText(code);
        setModalConfig({
            open: true,
            title: "Terminal",
            message: "Protocolo G-Code copiado para a área de transferência.",
            type: "success"
        });
    };

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 68 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300 ease-out overflow-hidden" style={{ marginLeft: `${larguraSidebar}px` }}>
                
                {/* Background Decorativo */}
                <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none opacity-[0.05]"
                    style={{
                        backgroundImage: 'linear-gradient(to right, #3f3f46 1px, transparent 1px), linear-gradient(to bottom, #3f3f46 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                    }}
                />

                <header className="h-20 px-10 flex items-center justify-between z-40 relative border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-700 via-sky-500 to-indigo-400 opacity-60" />
                    <div className="flex flex-col relative select-none">
                        <h1 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-0.5">IDEIAS, TUTORIAIS E SOLUÇÕES</h1>
                        <span className="text-xl font-black uppercase tracking-tighter text-white">
                            Central <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">Maker</span>
                        </span>
                    </div>

                    <div className="relative group">
                        <Search size={14} strokeWidth={3} className={`absolute left-4 top-1/2 -translate-y-1/2 ${busca ? 'text-sky-400' : 'text-zinc-600'}`} />
                        <input
                            className="w-80 bg-zinc-900/40 border border-white/5 rounded-xl py-2.5 pl-11 pr-10 text-[11px] text-zinc-200 outline-none transition-all font-bold uppercase tracking-widest focus:border-sky-500/30 focus:bg-zinc-900/80"
                            placeholder="BUSCAR COMANDO..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 relative z-10">
                    <div className="max-w-[1600px] mx-auto space-y-12">
                        
                        {/* HERO */}
                        <section className="relative overflow-hidden rounded-[2rem] bg-zinc-900/40 border border-zinc-800/50 p-12 min-h-[320px] flex flex-col justify-center shadow-sm backdrop-blur-sm">
                            <HUDOverlay />
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3 text-sky-400">
                                    <Terminal size={14} className="animate-pulse" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Central de Inteligência Operacional</span>
                                </div>
                                <TypewriterHero phrases={phrases} />
                                <p className="text-sm text-zinc-400 max-w-xl font-medium leading-relaxed uppercase tracking-wide">Diretrizes e protocolos de otimização industrial para sua farm.</p>
                            </div>
                        </section>

                        {/* FILTROS */}
                        <div className="flex flex-wrap gap-3 relative z-10">
                            {[
                                { id: 'all', label: 'Todos os Módulos', icon: Activity },
                                { id: 'critico', label: 'Crítico [!]', icon: AlertTriangle, color: 'text-rose-400' },
                                { id: 'lucro', label: 'Rentabilidade [$]', icon: Coins, color: 'text-emerald-400' },
                                { id: 'setup', label: 'Hardware', icon: Code, color: 'text-sky-400' },
                            ].map((f) => (
                                <button key={f.id} onClick={() => setFiltroAtivo(f.id)} className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest ${filtroAtivo === f.id ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>
                                    <f.icon size={14} className={filtroAtivo === f.id ? 'text-zinc-950' : f.color} />
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* GRID DE CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredData.map((category) => (
                                <WikiModuleCard key={category.id} category={category} onSelectTopic={setSelectedArticle} />
                            ))}
                        </div>

                        {/* CALL TO ACTION */}
                        <section className="relative overflow-hidden rounded-[2rem] bg-zinc-900/40 border border-zinc-800/50 p-10 shadow-sm group backdrop-blur-sm">
                            <HUDOverlay />
                            <div className="relative z-30 flex flex-col lg:flex-row items-center justify-between gap-10">
                                <div className="flex items-center gap-8">
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-sky-400 shadow-inner">
                                        <Globe size={28} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Suporte Técnico & Contribuições</h3>
                                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide leading-relaxed max-w-lg">
                                            Tem sugestões de melhoria para os protocolos? Nossa central está aberta.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                                    <button
                                        onClick={() => { navigator.clipboard.writeText("suporte@printlog.com.br"); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }}
                                        className="flex-1 lg:flex-none px-6 py-3 bg-zinc-900/50 hover:bg-zinc-800 text-[10px] font-bold uppercase rounded-xl border border-zinc-800 flex items-center justify-center gap-3 transition-all"
                                    >
                                        <Mail size={16} className={copiado ? "text-emerald-400" : ""} />
                                        {copiado ? "E-mail Copiado" : "E-mail Suporte"}
                                    </button>
                                    <a href="https://forms.gle/NHYqNAcvApJwZM2w6" className="flex-1 lg:flex-none px-8 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-[10px] font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm">
                                        Mandar Sugestão <Send size={16} />
                                    </a>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* MODAL DETALHADO DO ARTIGO */}
                {selectedArticle && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
                        <div className="absolute inset-0 bg-zinc-950/80" onClick={() => setSelectedArticle(null)} />
                        <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-[2rem] relative z-10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                            <div className="p-10 border-b border-zinc-800/50 flex justify-between items-start bg-zinc-950/30">
                                <div className="space-y-4">
                                    <span className="px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[10px] font-bold text-sky-400 uppercase tracking-widest">Protocolo: {selectedArticle.id}</span>
                                    <h2 className="text-2xl font-bold text-zinc-100 uppercase tracking-tight">{selectedArticle.title}</h2>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Prioridade: {selectedArticle.level} | Atualizado: {selectedArticle.updated}</p>
                                </div>
                                <button onClick={() => setSelectedArticle(null)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 transition-all"><X size={20} /></button>
                            </div>
                            <div className="p-10 flex-1 space-y-8 overflow-y-auto custom-scrollbar">
                                <p className="text-zinc-400 text-sm font-medium leading-relaxed border-l-2 border-sky-500/30 pl-6 uppercase tracking-wide">{selectedArticle.content}</p>
                                {selectedArticle.gcode && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Comando de Terminal (G-Code):</p>
                                        <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 flex justify-between items-center group/code">
                                            <code className="text-sky-400 text-xs font-mono">{selectedArticle.gcode}</code>
                                            <button 
                                                onClick={() => handleCopyGCode(selectedArticle.gcode)} 
                                                className="p-2 bg-zinc-900 rounded-lg text-zinc-600 hover:text-sky-400 transition-all active:scale-90"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL GLOBAL DE ALERTAS */}
            <Modal
                isOpen={modalConfig.open}
                onClose={() => setModalConfig({ ...modalConfig, open: false })}
                title={modalConfig.title}
                actions={
                    <button onClick={() => setModalConfig({ ...modalConfig, open: false })}
                        className={`w-full text-[10px] font-black uppercase px-6 py-2.5 rounded-xl transition-all ${
                            modalConfig.type === 'success' ? 'bg-emerald-600' : 'bg-sky-600'
                        } text-white shadow-lg`}>
                        Entendi
                    </button>
                }
            >
                <div className="flex flex-col items-center text-center gap-4">
                    {modalConfig.type === 'success' && <CheckCircle2 size={40} className="text-emerald-500/50" />}
                    {modalConfig.type === 'info' && <AlertCircle size={40} className="text-sky-500/50" />}
                    <p className="text-sm text-zinc-400 font-medium">{modalConfig.message}</p>
                </div>
            </Modal>

        </div>
    );
}