import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, ChevronRight, Settings, DollarSign,
    Mail, Copy, CheckCircle2, X, ShieldCheck,
    Terminal, Activity, Camera,
    Wrench, FlaskConical, BoxSelect, Cpu, Zap,
    Flame, MousePointer2, Clock
} from 'lucide-react';

import MainSidebar from "../components/MainSidebar";

// --- MÁQUINA DE ESCREVER (TELA DE CARREGAMENTO/HERO) ---
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

// --- DATA: CONHECIMENTO PARA O DIA A DIA ---
const WIKI_DATA = [
    {
        id: 'MOD-01', title: "Calibração da Máquina", category: "Mecânica", icon: Wrench, color: "text-orange-500",
        topics: [
            { id: 'h1', title: "Passos do Extrusor (E-Steps)", content: "Garanta que 100mm pedidos no fatiador sejam 100mm reais de filamento saindo no bico. Isso evita buracos na peça ou excesso de material.", level: "Essencial", updated: "JAN/2026", params: { "Comando": "M92", "Alvo": "100mm" } },
            { id: 'h2', title: "Ajuste de Temperatura (PID)", content: "Estabilize o aquecimento do bico e da mesa para evitar variações de cor e linhas visíveis nas camadas da peça.", level: "Importante", updated: "DEZ/2025" }
        ]
    },
    {
        id: 'MOD-02', title: "Lucro e Vendas", category: "Gestão", icon: DollarSign, color: "text-emerald-500",
        topics: [
            { id: 'f1', title: "Como Cobrar Suas Peças", content: "Use a fórmula: (Material + Luz + Desgaste da Máquina) x Margem de Lucro. Nunca ignore o tempo que você gasta preparando o arquivo.", level: "Prático", updated: "FEV/2026" },
            { id: 'f2', title: "Hora de comprar outra?", content: "O momento ideal para colocar mais uma impressora na oficina é quando você começa a recusar pedidos por falta de horário livre.", level: "Estratégia", updated: "MAR/2026" }
        ]
    },
    {
        id: 'MOD-03', title: "Dicas de Fatiamento", category: "Slicer", icon: Zap, color: "text-sky-500",
        topics: [
            { id: 's1', title: "Uma Peça por Vez", content: "Imprima objetos sequencialmente. Se uma peça falhar no meio da noite, você não perde todo o restante da mesa.", level: "Avançado", updated: "JAN/2026" },
            { id: 's2', title: "Suporte em Árvore", content: "Economiza até 40% de filamento e é muito mais fácil de remover, deixando a peça com um acabamento limpo.", level: "Economia", updated: "MAR/2026" }
        ]
    },
    {
        id: 'MOD-04', title: "Primeira Camada", category: "Bancada", icon: BoxSelect, color: "text-amber-500",
        topics: [
            { id: 'a1', title: "Z-Offset Perfeito", content: "A primeira camada deve ficar 'esmagada' na medida certa: sem frestas entre as linhas e sem ficar transparente de tão fina.", level: "Ajuste", updated: "JAN/2026" },
            { id: 'a2', title: "Limpeza da Mesa", content: "Mantenha a mesa sempre limpa de gordura. Use álcool isopropílico para garantir que as peças não deslem (warping).", level: "Rotina", updated: "FEV/2026" }
        ]
    },
    {
        id: 'MOD-05', title: "Guia de Filamentos", category: "Materiais", icon: FlaskConical, color: "text-indigo-500",
        topics: [
            { id: 'm1', title: "Filamento com Umidade", content: "PETG e TPU 'bebem' água do ar. Se ouvir estalos no bico ou ver bolinhas na peça, precisa secar o rolo antes de imprimir.", level: "Técnico", updated: "JAN/2026" },
            { id: 'm2', title: "Qual material escolher?", content: "Use PLA para enfeites e protótipos rápidos, PETG para peças que vão aguentar esforço e ABS para coisas que ficam no sol/calor.", level: "Essencial", updated: "FEV/2026" }
        ]
    },
    {
        id: 'MOD-06', title: "Manutenção Preventiva", category: "Hardware", icon: Settings, color: "text-zinc-400",
        topics: [
            { id: 'p1', title: "Lubrificar Eixos e Fusos", content: "Use graxa sintética nos fusos. Evite WD-40, pois ele remove a lubrificação de fábrica dos rolamentos lineares.", level: "Mensal", updated: "JAN/2026" },
            { id: 'p2', title: "Correias Apertadas", content: "Correias frouxas causam marcas de 'fantasma' na peça. Elas devem estar tensionadas como cordas de violão.", level: "Revisão", updated: "MAR/2026" }
        ]
    },
    {
        id: 'MOD-07', title: "Acabamento de Peças", category: "Pós-Print", icon: MousePointer2, color: "text-rose-400",
        topics: [
            { id: 'v1', title: "Lixar com Água", content: "Comece com lixa 80 e suba até a 400. A água evita que o plástico derreta com o calor da mão enquanto você lixa.", level: "Manual", updated: "DEZ/2025" },
            { id: 'v2', title: "Roscas de Metal (Inserts)", content: "Use o ferro de solda para derreter porcas de latão na peça. É a melhor forma de criar fixação forte para parafusos.", level: "Avançado", updated: "FEV/2026" }
        ]
    },
    {
        id: 'MOD-08', title: "Fotos e Divulgação", category: "Vendas", icon: Camera, color: "text-blue-400",
        topics: [
            { id: 'k1', title: "Fotos que Vendem", content: "Use luz natural e fotos de perto (macro). Mostrar a textura das camadas bem feitas gera confiança no seu trabalho.", level: "Marketing", updated: "JAN/2026" },
            { id: 'k2', title: "Vídeo da Impressão", content: "Grave timelapses da peça crescendo. Isso atrai muito a atenção nas redes sociais e valoriza seu serviço.", level: "Divulgação", updated: "MAR/2026" }
        ]
    },
    {
        id: 'MOD-09', title: "Segurança da Oficina", category: "Cuidados", icon: Flame, color: "text-red-500",
        topics: [
            { id: 'r1', title: "Fogo e Monitoramento", content: "Item obrigatório: tenha um detector de fumaça e um extintor de incêndio perto das máquinas. Segurança em primeiro lugar.", level: "URGENTE", updated: "JAN/2026" },
            { id: 'r2', title: "Tomadas e Fiação", content: "Evite ligar várias impressoras no mesmo benjamim. O aquecimento simultâneo das mesas pode derreter fiações baratas.", level: "Elétrica", updated: "MAR/2026" }
        ]
    }
];

export default function WikiPage() {
    const [larguraSidebar, setLarguraSidebar] = useState(72);
    const [busca, setBusca] = useState("");
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [copiado, setCopiado] = useState(false);

    const phrases = [
        { line1: "TRANSFORME", line2: "IDEIAS EM PEÇAS REAIS." },
        { line1: "FALHA ZERO.", line2: "IMPRESSÃO MÁXIMA." },
        { line1: "DOMINE A FARM.", line2: "PRODUÇÃO EM SÉRIE." }
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

                <header className="h-20 px-8 flex items-center justify-between z-40 relative border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
                    <div className="flex flex-col">
                        <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-1">Manual do Maker</h1>
                        <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Central de <span className="text-sky-500">Conhecimento</span></h2>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={14} />
                        <input className="w-80 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl py-2.5 pl-11 pr-4 text-[11px] text-zinc-300 outline-none font-mono focus:border-sky-500/30 transition-all placeholder:text-zinc-700 uppercase" placeholder="O QUE VOCÊ PRECISA RESOLVER?" value={busca} onChange={e => setBusca(e.target.value)} />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 relative z-10 scroll-smooth">
                    <div className="max-w-[1650px] mx-auto space-y-16">

                        {/* HERO */}
                        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0b] border border-white/5 p-12 min-h-[350px] flex flex-col justify-center shadow-2xl group transition-all hover:border-zinc-800/50">
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-3 text-sky-500">
                                    <Terminal size={14} className="animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Acesso Liberado: Maker Autorizado</span>
                                </div>
                                <TypewriterHero phrases={phrases} />
                                <p className="text-sm text-zinc-500 max-w-xl font-bold italic leading-relaxed uppercase tracking-tight">O guia para você escalar sua produção. Evite desperdício de filamento e aproveite cada minuto da sua máquina.</p>
                            </div>
                            <div className="absolute right-[-20px] bottom-[-40px] opacity-[0.02] rotate-[-12deg] select-none pointer-events-none transition-transform group-hover:scale-110 duration-1000"><Cpu size={400} strokeWidth={1} /></div>
                        </section>

                        {/* GRID DE MÓDULOS */}
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

                        {/* SUPORTE */}
                        <section className="bg-[#0a0a0b] border border-zinc-900 rounded-[2.5rem] p-12 flex flex-col md:flex-row justify-between items-center relative overflow-hidden group">
                            <div className="flex items-center gap-8 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shadow-2xl group-hover:scale-110 transition-transform">
                                    <Mail size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-2 italic">Suporte ao Maker</h3>
                                    <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest italic leading-relaxed">Dúvida na máquina ou no processo de impressão? <br />Mande um e-mail para o nosso time: <span className="text-sky-500">suporte@printlog.com.br</span></p>
                                </div>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto mt-10 md:mt-0 relative z-10">
                                <button onClick={() => { navigator.clipboard.writeText("suporte@printlog.com.br"); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }} className="px-10 py-4 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-black uppercase rounded-xl border border-zinc-800 flex items-center gap-3 transition-all">
                                    {copiado ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    {copiado ? "Copiado" : "Copiar E-mail"}
                                </button>
                                <a href="mailto:suporte@printlog.com.br" className="px-10 py-4 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black uppercase rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.2)] transition-all">Pedir Ajuda</a>
                            </div>
                        </section>
                    </div>
                </div>

                {/* MODAL DE ARTIGO */}
                {selectedArticle && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300 font-mono">
                        <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedArticle(null)} />
                        <div className="bg-[#050505] border border-zinc-800 w-full max-w-3xl rounded-[2.5rem] relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-10 border-b border-zinc-900 flex justify-between items-start bg-zinc-950/50">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded bg-sky-500/10 border border-sky-500/20 text-[9px] font-black text-sky-500 uppercase italic tracking-widest">
                                            Dificuldade: {selectedArticle.level}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{selectedArticle.title}</h2>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5"><Clock size={12} className="text-zinc-600" /><span className="text-[9px] font-black text-zinc-500 uppercase italic">Leitura: {selectedArticle.time || "5 MIN"}</span></div>
                                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                        <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest font-mono">Atualizado em {selectedArticle.updated}</span>
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
                                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Dica do Especialista</h4>
                                        <p className="text-[11px] text-zinc-500 leading-relaxed uppercase font-bold italic">Seguir esta dica ajuda a evitar falhas de impressão e faz suas peças e bicos durarem muito mais.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-12 py-6 border-t border-zinc-900 bg-black/40 flex justify-between items-center italic">
                                <span className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.5em]">P R I N T L O G &nbsp; D A T A</span>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-700 animate-pulse"><Activity size={12} className="text-sky-500" /> CONEXÃO ATIVA COM A OFICINA</div>
                            </div>
                        </div>
                    </div>
                )}

                <footer className="p-4 px-10 border-t border-white/5 bg-black/40 flex justify-between items-center relative z-40 backdrop-blur-md">
                    <p className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.8em]">P R I N T L O G &nbsp; O F I C I N A &nbsp; T É C N I C A</p>
                </footer>
            </main>
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; } 
                .custom-scrollbar::-webkit-scrollbar-track { background: #050505; } 
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f23; border-radius: 20px; border: 1px solid #050505; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #27272a; }
            ` }} />
        </div>
    );
}