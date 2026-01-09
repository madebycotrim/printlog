import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, ChevronRight, Mail, Terminal, Activity, AlertTriangle,
    Coins, Code, Send, Globe, Info, CheckCircle2,
    Copy, AlertCircle, FileText, Cpu, Target, Zap,
    Box, Server, RefreshCw, LayoutGrid, BookOpen,
    Wrench, Lightbulb, HelpCircle
} from 'lucide-react';

import { WIKI_DATA } from '../utils/wikiData';
import MainSidebar from "../layouts/mainSidebar";
import Popup from "../components/Popup";

// --- COMPONENTES COM ESTILO DE MANUAL TÉCNICO ---

const TacticalCard = ({ title, subtitle, icon: Icon, colorClass, children, badge }) => (
    <div className="bg-zinc-900/10 border border-white/5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all">
        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
            <div className="w-10 h-10 border-t border-r border-white/20 rounded-tr-lg" />
        </div>

        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${colorClass}-500/10 text-${colorClass}-500`}>
                    <Icon size={18} />
                </div>
                <div>
                    <h2 className="text-[11px] font-black text-white uppercase tracking-wider">{title}</h2>
                    <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-tight">{subtitle}</p>
                </div>
            </div>
            {badge && (
                <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-zinc-950 border border-white/10 text-zinc-500 uppercase">
                    {badge}
                </span>
            )}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
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
        <div className="flex flex-col leading-none select-none">
            <span className="text-white font-black text-5xl md:text-7xl tracking-tighter uppercase italic">
                {currentPhrase.line1.substring(0, subIndex)}
                {subIndex <= currentPhrase.line1.length && <span className="animate-pulse border-r-8 border-sky-500 ml-2"></span>}
            </span>
            <span className="text-zinc-800 font-black text-5xl md:text-7xl tracking-tighter uppercase not-italic">
                {subIndex > currentPhrase.line1.length ? currentPhrase.line2.substring(0, subIndex - currentPhrase.line1.length) : ""}
                {subIndex > currentPhrase.line1.length && <span className="animate-pulse border-r-8 border-zinc-700 ml-2"></span>}
            </span>
        </div>
    );
};

export default function WikiPage() {
    const [larguraSidebar, setLarguraSidebar] = useState(68);
    const [busca, setBusca] = useState("");
    const [filtroAtivo, setFiltroAtivo] = useState('all');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [copiado, setCopiado] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        open: false, title: "", message: "", icon: AlertCircle, color: "sky"
    });

    const totalGuias = useMemo(() => {
        return WIKI_DATA.reduce((acc, categoria) => acc + categoria.topics.length, 0);
    }, []);

    const phrases = useMemo(() => [
        { line1: "TRANSFORME ", line2: "FILAMENTO EM LUCRO" },
        { line1: "APRENDA ", line2: "TUDO NA PRÁTICA" },
        { line1: "CRIE ", line2: "PROJETOS REAIS" },
        { line1: "DOMINE ", line2: "SUA IMPRESSORA" },
        { line1: "OTIMIZE ", line2: "CADA CAMADA" },
        { line1: "VENDA ", line2: "MAIS TODO DIA" },
        { line1: "EVOLUA ", line2: "SUA OFICINA" }
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
            title: "Código Copiado!",
            message: "O comando G-Code foi copiado. Agora é só colar no terminal da sua impressora.",
            icon: CheckCircle2,
            color: "emerald"
        });
    };

    return (
        <div className="flex h-screen w-full bg-[#050505] text-zinc-300 font-sans antialiased overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 68 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-500" style={{ marginLeft: `${larguraSidebar}px` }}>

                {/* HEADER */}
                <header className="h-24 px-10 flex items-center justify-between z-40 relative border-b border-white/5 bg-[#050505]/50 backdrop-blur-sm">
                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <BookOpen size={12} className="text-sky-500" /> Manual do Maker Iniciante
                            </p>
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">Central de <span className="text-sky-500">Ajuda</span></h1>
                        </div>
                    </div>

                    <div className="relative group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" />
                        <input
                            className="w-80 bg-zinc-950 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-wider text-white outline-none focus:border-sky-500/40 transition-all placeholder:text-zinc-800"
                            placeholder="O QUE VOCÊ PRECISA RESOLVER?"
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-10 pt-10 pb-24 custom-scrollbar relative z-10">
                    <div className="max-w-[1600px] mx-auto space-y-10">

                        {/* HERO */}
                        <div className="relative bg-zinc-900/10 border border-white/5 rounded-[2.5rem] p-16 overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Lightbulb size={280} className="text-white" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="h-px w-8 bg-sky-500"></span>
                                    <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em]">Guia Prático para sua Impressora</p>
                                </div>

                                <TypewriterHero phrases={phrases} />

                                <div className="mt-8 flex items-center gap-6">
                                    <div className="px-5 py-3 bg-zinc-950 border border-white/5 rounded-2xl shadow-xl">
                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Dicas Disponíveis</p>
                                        <p className="text-xl font-black text-white italic text-center">{totalGuias} DICAS</p>
                                    </div>

                                    <div className="px-5 py-3 bg-zinc-950 border border-white/5 rounded-2xl shadow-xl">
                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Conexão</p>
                                        <p className="text-xl font-black text-emerald-500 italic text-center">ONLINE</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FILTROS */}
                        <div className="flex flex-wrap items-center gap-3">
                            {[
                                { id: 'all', label: 'Ver Tudo', icon: LayoutGrid },
                                { id: 'critico', label: 'Problemas Comuns', icon: AlertTriangle, color: 'rose' },
                                { id: 'lucro', label: 'Economia e Lucro', icon: Coins, color: 'emerald' },
                                { id: 'setup', label: 'Peças e Ajustes', icon: Wrench, color: 'sky' },
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFiltroAtivo(f.id)}
                                    className={`h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 border ${filtroAtivo === f.id
                                        ? 'bg-sky-500 text-zinc-950 border-sky-500 shadow-lg shadow-sky-500/20'
                                        : 'bg-zinc-950 text-zinc-500 border-white/5 hover:border-white/10 hover:text-zinc-300'
                                        }`}
                                >
                                    <f.icon size={16} />
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* GRID DE MÓDULOS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredData.map((category) => (
                                <TacticalCard
                                    key={category.id}
                                    title={category.title}
                                    subtitle={category.category}
                                    icon={category.icon}
                                    colorClass={category.color}
                                    badge={`MANUAL-0${category.id}`}
                                >
                                    <div className="space-y-2">
                                        {category.topics.map(topic => (
                                            <button
                                                key={topic.id}
                                                onClick={() => setSelectedArticle(topic)}
                                                className="w-full group/item flex items-center justify-between p-4 rounded-xl bg-zinc-950/40 border border-white/[0.02] hover:border-sky-500/30 transition-all hover:bg-zinc-900/60 text-left"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-1.5 h-1.5 shrink-0 rounded-full bg-zinc-800 group-hover/item:bg-sky-500 transition-all" />
                                                    <span className="text-[11px] font-bold text-zinc-500 group-hover/item:text-white transition-colors uppercase truncate">{topic.title}</span>
                                                </div>
                                                <ChevronRight size={14} className="text-zinc-800 group-hover/item:text-sky-500 shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                </TacticalCard>
                            ))}
                        </div>

                        {/* SUPORTE */}
                        <div className="bg-sky-500/[0.02] border border-sky-500/10 rounded-[2rem] p-10 relative overflow-hidden group mt-12">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                <div className="flex items-start gap-6">
                                    <div className="p-5 bg-sky-500/10 rounded-2xl text-sky-500 border border-sky-500/20 shadow-inner">
                                        <HelpCircle size={32} />
                                    </div>
                                    <div className="max-w-md">
                                        <h3 className="text-base font-black text-white uppercase tracking-widest mb-2 italic">Precisa de Ajuda?</h3>
                                        <p className="text-xs text-zinc-500 font-medium leading-relaxed tracking-tight">
                                            Não encontrou o que procurava? Nossa equipe de makers experientes está pronta para te ajudar com qualquer dúvida técnica.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={() => { navigator.clipboard.writeText("suporte@printlog.com.br"); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }}
                                        className="h-14 px-8 bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3"
                                    >
                                        <Mail size={18} className={copiado ? "text-emerald-400" : ""} /> {copiado ? "E-MAIL_COPIADO" : "Copiar E-mail"}
                                    </button>
                                    <button className="h-14 px-8 bg-sky-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-500 transition-all flex items-center gap-3 shadow-lg shadow-sky-900/20">
                                        Falar com Suporte <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="fixed bottom-0 left-0 right-0 h-10 px-10 flex items-center justify-between border-t border-white/5 bg-[#050505] z-50 transition-all" style={{ marginLeft: `${larguraSidebar}px` }}>
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            {/* LED Verde indicando que o sistema está ok */}
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />

                            {/* MENSAGEM MAKER */}
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                                Manual Oficial: De Maker para Maker
                            </span>
                        </div>

                        {/* Separador sutil */}
                        <div className="h-4 w-[1px] bg-white/5" />

                        <div className="flex items-center gap-2 text-zinc-700">
                            <span className="text-[9px] font-bold uppercase tracking-widest">
                                Status: Base de Dados Sincronizada
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-mono text-zinc-800 uppercase">Acesso Livre</span>
                        <span className="text-[9px] font-mono text-zinc-600 uppercase font-bold">Guia v2.4.0-MAKER</span>
                    </div>
                </div>
            </main>

            {/* MODAL: GUIA DETALHADO */}
            <Popup
                isOpen={!!selectedArticle}
                onClose={() => setSelectedArticle(null)}
                title={selectedArticle?.title || "Guia Técnico"}
                subtitle={`Referência: #${selectedArticle?.id || '000'}`}
                icon={selectedArticle?.gcode ? Code : FileText}
            >
                <div className="p-8 space-y-8 bg-zinc-950">
                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black bg-zinc-900 text-sky-400 px-4 py-1.5 rounded-lg border border-sky-500/20 uppercase tracking-widest flex items-center gap-2">
                            <Target size={12} /> Nível: {selectedArticle?.level}
                        </span>
                        <span className="text-[9px] font-black bg-zinc-900 text-zinc-500 px-4 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest">
                            Revisado em: {selectedArticle?.updated}
                        </span>
                    </div>

                    <div className="relative p-6 bg-zinc-900/20 border-l-4 border-sky-500 rounded-r-2xl">
                        <p className="text-zinc-300 text-sm font-medium leading-relaxed">
                            {selectedArticle?.content}
                        </p>
                    </div>

                    {selectedArticle?.gcode && (
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Terminal size={12} /> Código de Comando (G-Code):
                            </p>
                            <div className="bg-black p-6 rounded-2xl border border-white/5 flex justify-between items-center group/code shadow-inner">
                                <code className="text-sky-500 text-sm font-mono font-bold tracking-tight">{selectedArticle.gcode}</code>
                                <button onClick={() => handleCopyGCode(selectedArticle.gcode)} className="p-2 text-zinc-600 hover:text-sky-400 transition-colors">
                                    <Copy size={18} />
                                </button>
                            </div>
                            <button
                                onClick={() => handleCopyGCode(selectedArticle.gcode)}
                                className="w-full h-14 bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-xl shadow-sky-900/20"
                            >
                                Copiar Comando para Usar
                            </button>
                        </div>
                    )}
                </div>
            </Popup>

            {/* MODAL NOTIFICAÇÃO */}
            <Popup
                isOpen={modalConfig.open}
                onClose={() => setModalConfig({ ...modalConfig, open: false })}
                title={modalConfig.title}
                icon={modalConfig.icon}
            >
                <div className="p-10 text-center space-y-6">
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                        {modalConfig.message}
                    </p>
                    <button
                        onClick={() => setModalConfig({ ...modalConfig, open: false })}
                        className={`w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all text-white bg-${modalConfig.color}-600 hover:opacity-90 shadow-lg`}
                    >
                        Entendido
                    </button>
                </div>
            </Popup>
        </div>
    );
}