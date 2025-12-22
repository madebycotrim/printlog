import React, { useState } from 'react';
import {
    Book, Search, Play, Zap, HelpCircle,
    ChevronRight, ArrowLeft, Cpu, Target,
    Settings, History, Layers, DollarSign,
    Info, ExternalLink, Lightbulb, MessageSquare
} from 'lucide-react';

import MainSidebar from "../components/MainSidebar";

// --- COMPONENTES DE UI ---

const KnowledgeCard = ({ title, description, icon: Icon, topics }) => (
    <div className="group relative bg-[#0a0a0c] border border-zinc-800/50 rounded-[2.5rem] p-8 transition-all hover:border-sky-500/30 hover:bg-zinc-900/20 flex flex-col justify-between shadow-2xl">
        <div>
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-sky-500 shadow-inner group-hover:scale-110 transition-transform">
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">{title}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter mt-0.5">{description}</p>
                </div>
            </div>
            <ul className="space-y-3 mb-8">
                {topics.map(topic => (
                    <li key={topic} className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase hover:text-sky-400 cursor-pointer transition-colors group/item">
                        <ChevronRight size={12} className="text-zinc-800 group-hover/item:text-sky-500 transition-colors" />
                        {topic}
                    </li>
                ))}
            </ul>
        </div>
        <button className="w-full py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:bg-sky-600 hover:text-white hover:border-sky-500 transition-all">
            Abrir Módulo
        </button>
    </div>
);

const QuickTip = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Icon size={16} />
        </div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase leading-relaxed italic">
            <span className="text-emerald-500 font-black">Dica Maker:</span> {text}
        </p>
    </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function WikiPage() {
    const [larguraSidebar, setLarguraSidebar] = useState(72);
    const [busca, setBusca] = useState("");

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

                {/* HEADER TÉCNICO */}
                <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl z-40 relative">
                    <div className="flex items-center gap-6">
                        <div>
                            {/* Título Principal no padrão das outras telas */}
                            <h1 className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 leading-none mb-1.5">
                                Central Maker
                            </h1>

                            {/* Subtítulo com indicadores técnicos */}
                            <div className="flex items-center gap-4 text-[10px] font-bold">
                                <span className="flex items-center gap-1.5 text-sky-500/80 uppercase">
                                    <Book size={12} strokeWidth={3} /> Biblioteca Online
                                </span>

                                {/* Divisor visual (bolinha) igual ao de Filamentos */}
                                <div className="w-1 h-1 rounded-full bg-zinc-800" />

                                <span className="text-zinc-500 uppercase tracking-tighter">
                                    Versão 2.4 Stable
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={14} />
                        <input
                            className="w-80 bg-zinc-900/40 border border-zinc-800/60 rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-mono text-white focus:border-sky-500/40 outline-none transition-all placeholder:text-zinc-700"
                            placeholder="PROCURAR_TÓPICO..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                    </div>
                </header>

                {/* CONTEÚDO SCROLLÁVEL */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
                    <div className="max-w-[1400px] mx-auto space-y-12">

                        {/* HERO DE BOAS-VINDAS */}
                        <section className="bg-sky-600/5 border border-sky-500/20 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 w-fit">
                                    <Zap size={12} className="text-sky-400" />
                                    <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Início Rápido</span>
                                </div>
                                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                                    Aprenda a dominar <br /> sua <span className="text-sky-500">Print Farm.</span>
                                </h2>
                                <p className="text-sm text-zinc-500 max-w-xl font-medium leading-relaxed italic">
                                    Bem-vindo à base de dados. Aqui você encontrará guias sobre como configurar suas máquinas,
                                    gerenciar seu estoque de filamentos e, o mais importante: como transformar plástico em lucro real.
                                </p>
                            </div>
                            <div className="hidden lg:block w-px h-32 bg-zinc-800" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                                <QuickTip icon={Target} text="O ROI indica em quanto tempo sua impressora se paga totalmente." />
                                <QuickTip icon={Lightbulb} text="Sempre deixe 10% de margem extra para suportes e bordas." />
                            </div>
                        </section>

                        {/* GRID DE CATEGORIAS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <KnowledgeCard
                                title="Gestão de Máquinas"
                                description="Vida útil e Manutenção"
                                icon={Settings}
                                topics={[
                                    "O que é o intervalo de manutenção?",
                                    "Como resetar o contador de horas",
                                    "Entendendo o custo por hora",
                                    "Identificando falhas com a IA"
                                ]}
                            />
                            <KnowledgeCard
                                title="Finanças Maker"
                                description="Lucro, ROI e Orçamentos"
                                icon={DollarSign}
                                topics={[
                                    "Como calcular o preço final?",
                                    "O que é ROI (Retorno sobre Investimento)?",
                                    "Calculando o custo da energia",
                                    "Enviando orçamentos via WhatsApp"
                                ]}
                            />
                            <KnowledgeCard
                                title="Inventário de Peças"
                                description="Materiais e Filamentos"
                                icon={Layers}
                                topics={[
                                    "Como pesar carretéis vazios",
                                    "Diferença de custo: PLA vs PETG",
                                    "Alertas de estoque baixo",
                                    "Histórico de uso de material"
                                ]}
                            />
                        </div>

                        {/* SEÇÃO DE PERGUNTAS TÉCNICAS */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 py-2">
                                <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sky-500 shadow-inner">
                                    <Cpu size={16} />
                                </div>
                                <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-100">Perguntas Frequentes</h2>
                                <div className="h-[1px] bg-gradient-to-r from-zinc-800 to-transparent flex-1 mx-4" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { q: "Como o sistema calcula o lucro?", a: "Somamos o custo do material gasto, a energia da máquina e a depreciação do bico, aplicando sua margem por cima." },
                                    { q: "Posso usar em mais de um computador?", a: "Sim, seus dados são sincronizados automaticamente na nuvem do PrintLog." },
                                    { q: "O que é o intervalo de 300h?", a: "É o tempo médio para revisão de correias, lubrificação de eixos e limpeza do bico extrusor." },
                                    { q: "Como funciona o backup?", a: "Cada vez que você salva uma alteração, uma cópia criptografada é enviada aos nossos servidores." }
                                ].map((item, i) => (
                                    <div key={i} className="p-6 bg-zinc-900/20 border border-zinc-800/60 rounded-3xl hover:border-zinc-700 transition-all">
                                        <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <HelpCircle size={14} className="text-sky-500" /> {item.q}
                                        </h4>
                                        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium italic">
                                            {item.a}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* SUPORTE E COMUNIDADE */}
                        <section className="bg-[#0c0c0e] border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-[1.5rem] bg-sky-500/10 text-sky-500 border border-sky-500/20">
                                    <MessageSquare size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">Ainda com dúvidas?</h3>
                                    <p className="text-xs text-zinc-500 uppercase font-bold">Nossa comunidade de Makers pode ajudar.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button className="h-12 px-8 border border-zinc-800 hover:bg-zinc-800 text-[10px] font-black uppercase rounded-2xl transition-all">Acessar Fórum</button>
                                <button className="h-12 px-8 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-lg shadow-sky-900/20">Chamar Suporte</button>
                            </div>
                        </section>

                    </div>
                </div>

                {/* RODAPÉ */}
                <footer className="p-6 text-center border-t border-white/5 bg-black/20">
                    <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-[0.5em]">PrintLog Manual Operacional • Build 2026.12</p>
                </footer>
            </main>
        </div>
    );
}