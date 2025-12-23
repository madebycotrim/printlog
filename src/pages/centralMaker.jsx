import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, ChevronRight, Settings, Layers, DollarSign,
    Mail, Copy, CheckCircle2, X, ShieldCheck,
    Terminal, Box, Activity, Camera,
    Wrench, FlaskConical, Gauge, BoxSelect, Hash, Cpu, Zap,
    Flame, MousePointer2, Share2, Ruler, Info
} from 'lucide-react';

import MainSidebar from "../components/MainSidebar";

// --- EFEITO MÁQUINA DE ESCREVER (ESTILO HUD) ---
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
        <div className="flex flex-col leading-[0.8] select-none">
            <span className="text-white italic font-black text-5xl md:text-7xl uppercase tracking-tighter">
                {currentPhrase.line1.substring(0, subIndex)}
                {subIndex <= currentPhrase.line1.length && <span className="animate-pulse border-r-8 border-sky-500 ml-1"></span>}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-500 italic font-black text-5xl md:text-7xl uppercase tracking-tighter">
                {subIndex > currentPhrase.line1.length ? currentPhrase.line2.substring(0, subIndex - currentPhrase.line1.length) : ""}
                {subIndex > currentPhrase.line1.length && <span className="animate-pulse border-r-8 border-emerald-500 ml-1"></span>}
            </span>
        </div>
    );
};

// --- DATA: 9 MÓDULOS DE CONHECIMENTO ---
const WIKI_DATA = [
    {
        id: 'MOD-01', title: "Bancada e Ajustes", category: "Mecânica", icon: Wrench, color: "text-orange-500",
        topics: [
            { id: 'h1', title: "Calibração de E-Steps", content: "Garanta que 100mm pedidos no fatiador sejam 100mm reais de filamento. Ajuste o M92 no seu firmware.", level: "Crítico", updated: "JAN/2026", params: { "Comando": "M92", "Alvo": "100mm" } },
            { id: 'h2', title: "Calibração de PID", content: "Estabilize a temperatura do bico e da mesa para evitar oscilações que causam marcas na peça.", level: "Essencial", updated: "DEZ/2025" }
        ]
    },
    {
        id: 'MOD-02', title: "Dinheiro e ROI", category: "Business", icon: DollarSign, color: "text-emerald-500",
        topics: [
            { id: 'f1', title: "Precificação Real", content: "Fórmula: (Material + Energia + Desgaste) x Margem. Nunca esqueça o custo do bico e da energia.", level: "Gestão", updated: "FEV/2026" },
            { id: 'f2', title: "Escalando a Farm", content: "A hora certa de comprar a segunda máquina é quando a primeira não para por 15 dias seguidos.", level: "Estratégia", updated: "MAR/2026" }
        ]
    },
    {
        id: 'MOD-03', title: "Software e Slicer", category: "Otimização", icon: Zap, color: "text-sky-500",
        topics: [
            { id: 's1', title: "Impressão Sequencial", content: "Imprima uma peça por vez na mesma mesa. Se uma falhar, você salva o resto do lote.", level: "Pro", updated: "JAN/2026" },
            { id: 's2', title: "Suportes em Árvore", content: "Economia de até 40% em material de suporte com remoção manual sem ferramentas.", level: "Eficiência", updated: "MAR/2026" }
        ]
    },
    {
        id: 'MOD-04', title: "Primeira Camada", category: "Operação", icon: BoxSelect, color: "text-amber-500",
        topics: [
            { id: 'a1', title: "Z-Offset Perfeito", content: "A camada deve ser um tapete. Sem espaços entre linhas e sem transparência excessiva.", level: "Diário", updated: "JAN/2026" },
            { id: 'a2', title: "Adesão de Mesa", content: "PEI gruda por calor, Vidro por química. Mantenha sempre limpo com álcool isopropílico.", level: "Básico", updated: "FEV/2026" }
        ]
    },
    {
        id: 'MOD-05', title: "Química de Materiais", category: "Insumos", icon: FlaskConical, color: "text-indigo-500",
        topics: [
            { id: 'm1', title: "Secagem de Filamento", content: "PETG e TPU são esponjas de umidade. Se houver estalos no bico, use uma estufa a 55°C.", level: "Técnico", updated: "JAN/2026" },
            { id: 'm2', title: "PLA vs PETG vs ABS", content: "PLA para estética, PETG para uso mecânico leve e ABS para alta temperatura e lixamento.", level: "Essencial", updated: "FEV/2026" }
        ]
    },
    {
        id: 'MOD-06', title: "Manutenção Preventiva", category: "Hardware", icon: Settings, color: "text-zinc-400",
        topics: [
            { id: 'p1', title: "Lubrificação de Fusos", content: "Use graxa branca de lítio. Nunca use WD-40 nos eixos, ele remove a lubrificação de fábrica.", level: "Mensal", updated: "JAN/2026" },
            { id: 'p2', title: "Tensão de Correias", content: "Devem soar como uma corda de baixo. Correias frouxas causam ghosting e perda de precisão.", level: "Técnico", updated: "MAR/2026" }
        ]
    },
    {
        id: 'MOD-07', title: "Pós-Processamento", category: "Acabamento", icon: MousePointer2, color: "text-rose-400",
        topics: [
            { id: 'v1', title: "Lixamento Progressivo", content: "Comece na lixa 80 e vá até a 400. Sempre use água para não derreter o plástico pelo atrito.", level: "Manual", updated: "DEZ/2025" },
            { id: 'v2', title: "Insertos Metálicos", content: "Use ferro de solda para inserir roscas de latão. É o único jeito de ter peças mecânicas duráveis.", level: "Pro", updated: "FEV/2026" }
        ]
    },
    {
        id: 'MOD-08', title: "Marketing Maker", category: "Vendas", icon: Camera, color: "text-blue-400",
        topics: [
            { id: 'k1', title: "A Foto do Milhão", content: "Luz lateral e fundo infinito. O cliente compra o visual antes de comprar a função da peça.", level: "Vendas", updated: "JAN/2026" },
            { id: 'k2', title: "Vídeo Timelapse", content: "Vídeos da peça subindo geram autoridade e engajamento. Use câmeras fixas no eixo X.", level: "Social", updated: "MAR/2026" }
        ]
    },
    {
        id: 'MOD-09', title: "Segurança Farm", category: "Riscos", icon: Flame, color: "text-red-500",
        topics: [
            { id: 'r1', title: "Sensores de Fumaça", content: "Obrigatório em farms. Instale um sensor acima das máquinas e tenha um extintor CO2 próximo.", level: "CRÍTICO", updated: "JAN/2026" },
            { id: 'r2', title: "Gestão Elétrica", content: "Nunca ligue 3 impressoras no mesmo Benjamin (T). O risco de incêndio por sobrecarga é real.", level: "Alerta", updated: "MAR/2026" }
        ]
    }
];

export default function WikiPage() {
    const [larguraSidebar, setLarguraSidebar] = useState(72);
    const [busca, setBusca] = useState("");
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [copiado, setCopiado] = useState(false);

    const phrases = [
        { line1: "TRANSFORME", line2: "PLÁSTICO EM LUCRO." },
        { line1: "MENOS CHUTE.", line2: "MAIS DADOS." },
        { line1: "PRECISÃO TÉCNICA.", line2: "RESULTADO INDUSTRIAL." }
    ];

    const filteredData = useMemo(() => {
        return WIKI_DATA.filter(cat =>
            cat.title.toLowerCase().includes(busca.toLowerCase()) ||
            cat.topics.some(t => t.title.toLowerCase().includes(busca.toLowerCase()))
        );
    }, [busca]);

    return (
        <div className="flex h-screen w-full bg-[#050505] text-zinc-100 font-sans overflow-hidden">
            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 72 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out overflow-hidden" style={{ marginLeft: `${larguraSidebar}px` }}>

                {/* GRID DE FUNDO */}
                <div className="absolute inset-x-0 top-0 h-[500px] z-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        maskImage: 'linear-gradient(to bottom, black, transparent)'
                    }}
                />

                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }} />

                <header className="h-20 px-8 flex items-center justify-between z-40 relative border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
                    <div className="flex flex-col">
                        <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-1">Knowledge_Base_v2.4</h1>
                        <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Central de <span className="text-sky-500">Treinamento</span></h2>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={14} />
                        <input className="w-80 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl py-2.5 pl-11 pr-4 text-[11px] text-zinc-300 outline-none font-mono focus:border-sky-500/30 transition-all placeholder:text-zinc-700 uppercase" placeholder="QUERY_KNOWLEDGE_DB..." value={busca} onChange={e => setBusca(e.target.value)} />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 relative z-10 scroll-smooth">
                    <div className="max-w-[1650px] mx-auto space-y-16">

                        {/* HERO HUD */}
                        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0b] border border-white/5 p-12 min-h-[350px] flex flex-col justify-center shadow-2xl group transition-all hover:border-zinc-800/50">
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-3 text-sky-500">
                                    <Terminal size={14} className="animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Decryption_Active: User_Granted</span>
                                </div>
                                <TypewriterHero phrases={phrases} />
                                <p className="text-sm text-zinc-500 max-w-xl font-bold italic leading-relaxed uppercase tracking-tight">O guia definitivo para escala de farm. Pare de perder material e comece a operar com precisão industrial.</p>
                            </div>
                            <div className="absolute right-[-20px] bottom-[-40px] opacity-[0.02] rotate-[-12deg] select-none pointer-events-none transition-transform group-hover:scale-110 duration-1000"><Cpu size={400} strokeWidth={1} /></div>
                        </section>

                        {/* MODULE GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredData.map((category) => (
                                <div key={category.id} className="bg-[#0a0a0b] border border-zinc-900 rounded-3xl p-8 group transition-all hover:border-zinc-700 shadow-2xl relative overflow-hidden">
                                    <div className="flex items-center gap-5 mb-10 relative z-10">
                                        <div className="p-4 rounded-2xl bg-black border border-zinc-800 group-hover:border-zinc-600 transition-all shadow-inner">
                                            <category.icon size={24} className={category.color} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-black uppercase text-white tracking-[0.1em] leading-none mb-1.5">{category.title}</h3>
                                            <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest italic">{category.category}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 relative z-10">
                                        {category.topics.map(topic => (
                                            <button key={topic.id} onClick={() => setSelectedArticle(topic)} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.03] transition-all group/item text-left border border-transparent hover:border-zinc-800/50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover/item:bg-sky-500 transition-all group-hover/item:scale-125" />
                                                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight group-hover/item:text-zinc-100">{topic.title}</span>
                                                </div>
                                                <ChevronRight size={14} className="text-zinc-800 group-hover/item:text-sky-500 transition-all group-hover/item:translate-x-1" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* COMUNICAÇÃO DIRETA (RODAPÉ) */}
                        <section className="bg-[#0a0a0b] border border-zinc-900 rounded-[2.5rem] p-12 flex flex-col md:flex-row justify-between items-center relative overflow-hidden group">
                            <div className="flex items-center gap-8 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shadow-2xl group-hover:scale-110 transition-transform">
                                    <Mail size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-2 italic">Módulo de Suporte Direto</h3>
                                    <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest italic leading-relaxed">Erro de sistema ou dúvida técnica? <br />Encaminhe um log para: <span className="text-sky-500">contato@printlog.com.br</span></p>
                                </div>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto mt-10 md:mt-0 relative z-10">
                                <button onClick={() => { navigator.clipboard.writeText("contato@printlog.com.br"); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }} className="px-10 py-4 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-black uppercase rounded-xl border border-zinc-800 flex items-center gap-3 transition-all">
                                    {copiado ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    {copiado ? "Copiado" : "Copiar Endereço"}
                                </button>
                                <a href="mailto:contato@printlog.com.br" className="px-10 py-4 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black uppercase rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.2)] transition-all">Enviar Relatório</a>
                            </div>
                        </section>
                    </div>
                </div>

                {/* MODAL: DOCUMENTO DESCRIPTOGRAFADO */}
                {selectedArticle && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300 font-mono">
                        <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedArticle(null)} />
                        <div className="bg-[#050505] border border-zinc-800 w-full max-w-3xl rounded-[2.5rem] relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-10 border-b border-zinc-900 flex justify-between items-start bg-zinc-950/50">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded bg-sky-500/10 border border-sky-500/20 text-[9px] font-black text-sky-500 uppercase italic tracking-widest">
                                            Security_Level: {selectedArticle.level}
                                        </span>
                                        <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest font-mono italic underline">DOC_REF_{selectedArticle.id}</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{selectedArticle.title}</h2>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5"><Clock size={12} className="text-zinc-600" /><span className="text-[9px] font-black text-zinc-500 uppercase italic">Leitura: {selectedArticle.time || "5 MIN"}</span></div>
                                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                        <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest font-mono">Updated_{selectedArticle.updated}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedArticle(null)} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 transition-all"><X size={20} /></button>
                            </div>

                            <div className="p-12 flex-1 overflow-y-auto custom-scrollbar space-y-10">
                                <div className="text-zinc-400 text-[15px] font-bold leading-relaxed italic border-l-4 border-sky-500/30 pl-8 py-2 uppercase">
                                    {selectedArticle.content}
                                </div>
                                {selectedArticle.params && (
                                    <div className="grid grid-cols-2 md:grid-cols-2 gap-6 p-8 bg-black border border-zinc-900 border-dashed rounded-3xl shadow-inner">
                                        {Object.entries(selectedArticle.params).map(([key, val]) => (
                                            <div key={key} className="flex flex-col items-center">
                                                <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1">{key}</span>
                                                <span className="text-[18px] font-black text-sky-500 font-mono tracking-widest underline decoration-sky-500/30">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-start gap-6">
                                    <div className="p-3 bg-black border border-emerald-500/20 rounded-xl text-emerald-500"><ShieldCheck size={20} /></div>
                                    <div className="space-y-1">
                                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Protocolo de Eficiência Confirmado</h4>
                                        <p className="text-[11px] text-zinc-500 leading-relaxed uppercase font-bold italic">A aplicação deste módulo reduz em até 15% as falhas de hardware e perda de insumos na Farm.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-12 py-6 border-t border-zinc-900 bg-black/40 flex justify-between items-center italic">
                                <span className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.5em]">P R I N T L O G &nbsp; D A T A &nbsp; F I L E</span>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-700 animate-pulse"><Activity size={12} className="text-sky-500" /> SECURE_CONNECTION_STABLE</div>
                            </div>
                        </div>
                    </div>
                )}

                <footer className="p-4 px-10 border-t border-white/5 bg-black/40 flex justify-between items-center relative z-40 backdrop-blur-md">
                    <p className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.8em]">P R I N T L O G &nbsp; C O M M U N I T Y &nbsp; E N G I N E</p>
                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest italic">Build_2026.12.23_STABLE</span>
                </footer>
            </main>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; } 
                .custom-scrollbar::-webkit-scrollbar-track { background: #050505; } 
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f23; border-radius: 20px; border: 1px solid #050505; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #27272a; }
            `}</style>
        </div>
    );
}