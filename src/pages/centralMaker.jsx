import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, ChevronRight, Mail, Copy, CheckCircle2, X, ShieldCheck, Terminal, Activity, Cpu, Clock, Factory, AlertTriangle, Users, CheckCircle, Coins, Truck, HeartPulse, Hash, Gauge, Settings, Code, Send, MessageSquare, Globe
} from 'lucide-react';

import MainSidebar from "../layouts/mainSidebar";

// --- MÁQUINA DE ESCREVER (HERO) REFINADA ---
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

const HUDOverlay = () => (
    <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.02]"
        style={{
            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
            backgroundSize: '100% 4px, 3px 100%'
        }}
    />
);

// --- DATA: CONHECIMENTO AVANÇADO PARA MAKERS BR (ADAPTADO PARA SISTEMA HUD) ---
const WIKI_DATA = [
    // =====================================================
    // PRODUÇÃO & CONFIABILIDADE -> CATEGORIA: SETUP
    // =====================================================
    {
        id: 'MOD-10',
        title: "Produção em Escala",
        category: "Produção",
        type: 'setup',
        icon: Factory,
        color: "sky",
        topics: [
            {
                id: 'pr1',
                title: "Batch inteligente",
                content: "Agrupe peças por material, cor e perfil. Cada troca de filamento consome tempo, gera risco de erro e quebra o fluxo produtivo.",
                level: "Produção",
                updated: "MAR/2026",
                gcode: "M117 Iniciando_Batch"
            },
            {
                id: 'pr2',
                title: "Print longo = risco",
                content: "Impressões acima de 12h devem ter margem maior. Tempo longo aumenta risco elétrico, mecânico e de falha humana.",
                level: "Gestão de Risco",
                updated: "MAR/2026"
            },
            {
                id: 'pr3',
                title: "Redundância mínima",
                content: "Tenha bico, PTFE, correia e sensor reserva. Parada por peça barata custa mais que o estoque.",
                level: "Confiabilidade",
                updated: "FEV/2026"
            },
            {
                id: 'pr4',
                title: "Produção noturna",
                content: "Imprima à noite apenas com máquina revisada, filamento seco e monitoramento remoto. Segurança contra incêndio é prioridade.",
                level: "Segurança",
                updated: "JAN/2026",
                gcode: "M104 S0 ; Desligar Hotend"
            }
        ]
    },

    // =====================================================
    // FALHAS CLÁSSICAS -> CATEGORIA: CRÍTICO
    // =====================================================
    {
        id: 'MOD-11',
        title: "Falhas e Prejuízos",
        category: "Erros Comuns",
        type: 'critico',
        icon: AlertTriangle,
        color: "rose",
        topics: [
            {
                id: 'e1',
                title: "Bico Entupido",
                content: "A impressão começa boa e piora com o tempo. Limpe ou troque o bico antes de produções longas.",
                level: "Crítico",
                updated: "JAN/2026",
                gcode: "M109 S240 ; Heat for Cold Pull"
            },
            {
                id: 'e2',
                title: "Extrusor patinando",
                content: "Clique metálico indica tensão errada, engrenagem suja ou filamento ruim. Ignorar gera peça fraca.",
                level: "Alerta",
                updated: "FEV/2026"
            },
            {
                id: 'e3',
                title: "Warping silencioso",
                content: "Peça solta levemente da mesa e só falha horas depois. Brim correto e mesa limpa evitam prejuízo oculto.",
                level: "Prevenção",
                updated: "MAR/2026",
                gcode: "M140 S65 ; Boost Bed Temp"
            },
            {
                id: 'e4',
                title: "Perfil errado",
                content: "Perfil bom para PLA não serve para PETG ou ABS. Copiar perfil sem ajuste gera falha imprevisível.",
                level: "Erro Comum",
                updated: "MAR/2026"
            }
        ]
    },

    // =====================================================
    // RELAÇÃO COM CLIENTE -> CATEGORIA: RENTABILIDADE (LUCRO)
    // =====================================================
    {
        id: 'MOD-12',
        title: "Clientes e Expectativas",
        category: "Comercial",
        type: 'lucro',
        icon: Users,
        color: "emerald",
        topics: [
            {
                id: 'c1',
                title: "Alinhe expectativa",
                content: "Explique linhas de camada, tolerâncias e acabamento antes de imprimir. Educação evita retrabalho.",
                level: "Essencial",
                updated: "JAN/2026"
            },
            {
                id: 'c2',
                title: "Amostra de Validação",
                content: "Miniatura ou trecho crítico validado evita prejuízo em peças grandes e caras.",
                level: "Estratégia",
                updated: "FEV/2026"
            },
            {
                id: 'c3',
                title: "Escopo fechado",
                content: "Defina claramente o que está incluso. Alteração de STL após orçamento é novo serviço.",
                level: "Proteção",
                updated: "MAR/2026"
            },
            {
                id: 'c4',
                title: "Prazos Realistas",
                content: "Clientes que pressionam prazo irreal costumam reclamar mais. Cuidado ao aceitar.",
                level: "Experiência",
                updated: "MAR/2026"
            }
        ]
    },

    // =====================================================
    // PADRÕES DE QUALIDADE -> CATEGORIA: SETUP
    // =====================================================
    {
        id: 'MOD-13',
        title: "Qualidade Profissional",
        category: "Padrão",
        type: 'setup',
        icon: CheckCircle,
        color: "sky",
        topics: [
            {
                id: 'q1',
                title: "Checklist pré-print",
                content: "Mesa limpa, bico ok, perfil correto, filamento seco. Dois minutos evitam horas de prejuízo.",
                level: "Rotina",
                updated: "JAN/2026",
                gcode: "G28 ; Home & Check"
            },
            {
                id: 'q2',
                title: "Consistência Vende",
                content: "O cliente aceita linhas de impressão, mas não aceita variação entre peças do mesmo pedido.",
                level: "Qualidade",
                updated: "FEV/2026"
            },
            {
                id: 'q3',
                title: "Teste de Produção",
                content: "Primeira peça é piloto. Só produza em lote após validar peso, tempo e acabamento.",
                level: "Controle",
                updated: "MAR/2026"
            },
            {
                id: 'q4',
                title: "Registro de Parâmetros",
                content: "Anote perfil, material e ajustes de cada projeto. Repetibilidade é lucro.",
                level: "Profissional",
                updated: "MAR/2026"
            }
        ]
    },

    // =====================================================
    // CUSTOS INVISÍVEIS -> CATEGORIA: RENTABILIDADE (LUCRO)
    // =====================================================
    {
        id: 'MOD-14',
        title: "Saúde Financeira",
        category: "Financeiro",
        type: 'lucro',
        icon: Coins,
        color: "amber",
        topics: [
            {
                id: 'ci1',
                title: "Taxa de Falha Real",
                content: "Toda oficina perde peça. Taxa de falha não é pessimismo, é realismo financeiro.",
                level: "Essencial",
                updated: "JAN/2026"
            },
            {
                id: 'ci2',
                title: "Tempo de Atendimento",
                content: "Mensagens, ajustes e orçamentos são horas de trabalho não visíveis no fatiador.",
                level: "Gestão",
                updated: "MAR/2026"
            },
            {
                id: 'ci3',
                title: "Desgaste da Máquina",
                content: "Correias, bicos e rolamentos se desgastam. Ignorar isso gera custos surpresa.",
                level: "Planejamento",
                updated: "MAR/2026"
            },
            {
                id: 'ci4',
                title: "Energia Elétrica",
                content: "Bandeira tarifária, pico de consumo e fontes ineficientes aumentam seu custo real.",
                level: "Financeiro",
                updated: "FEV/2026"
            }
        ]
    },

    // =====================================================
    // LOGÍSTICA & ENTREGA -> CATEGORIA: RENTABILIDADE (LUCRO)
    // =====================================================
    {
        id: 'MOD-15',
        title: "Envio e Logística",
        category: "Logística",
        type: 'lucro',
        icon: Truck,
        color: "emerald",
        topics: [
            {
                id: 'l1',
                title: "Embalagem Blindada",
                content: "Peça quebrada no envio é prejuízo duplo: custo do material e perda da reputação.",
                level: "Importante",
                updated: "FEV/2026"
            },
            {
                id: 'l2',
                title: "Promessa vs Entrega",
                content: "Prometer menos e entregar antes fideliza mais que o inverso.",
                level: "Estratégia",
                updated: "MAR/2026"
            },
            {
                id: 'l3',
                title: "Teste de Queda",
                content: "Se a embalagem não aguenta 1 metro de queda, ela não está pronta para o transporte.",
                level: "Qualidade",
                updated: "MAR/2026"
            }
        ]
    },

    // =====================================================
    // SAÚDE DO MAKER -> CATEGORIA: SETUP
    // =====================================================
    {
        id: 'MOD-16',
        title: "Saúde e Sustentabilidade",
        category: "Pessoal",
        type: 'setup',
        icon: HeartPulse,
        color: "sky",
        topics: [
            {
                id: 'sau1',
                title: "Vapores e Ruído",
                content: "Ruído, calor e vapores acumulam fadiga. Ventilação e pausas aumentam seu rendimento.",
                level: "Bem-estar",
                updated: "JAN/2026"
            },
            {
                id: 'sau2',
                title: "Fadiga Humana",
                content: "Maker exausto erra. Erro humano na farm custa filamento e tempo de bico.",
                level: "Consciência",
                updated: "FEV/2026"
            },
            {
                id: 'sau4',
                title: "Lucro Sustentável",
                content: "Produzir no limite gera burnout. Uma farm equilibrada gera renda contínua.",
                level: "Mentalidade",
                updated: "MAR/2026"
            }
        ]
    }
];

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
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{category.category}</span>
                        </div>
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

export default function WikiPage() {
    const [larguraSidebar, setLarguraSidebar] = useState(68);
    const [busca, setBusca] = useState("");
    const [filtroAtivo, setFiltroAtivo] = useState('all');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [copiado, setCopiado] = useState(false);

    const phrases = [
        { line1: "TRANSFORME", line2: "IDEIAS EM ATIVOS." },
        { line1: "EFICIÊNCIA", line2: "MÁXIMA NA FARM." },
        { line1: "SISTEMA", line2: "DE APOIO MAKER." }
    ];

    // Lógica de filtro preservada conforme solicitado
    const filteredData = useMemo(() => {
        return WIKI_DATA.filter(cat => {
            const matchBusca = cat.title.toLowerCase().includes(busca.toLowerCase()) || cat.topics.some(t => t.title.toLowerCase().includes(busca.toLowerCase()));
            const matchFiltro = filtroAtivo === 'all' || cat.type === filtroAtivo;
            return matchBusca && matchFiltro;
        });
    }, [busca, filtroAtivo]);

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 68 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300 ease-out overflow-hidden" style={{ marginLeft: `${larguraSidebar}px` }}>

                {/* Background Decorativo Refinado */}
                <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none opacity-[0.05]"
                    style={{
                        backgroundImage: 'linear-gradient(to right, #3f3f46 1px, transparent 1px), linear-gradient(to bottom, #3f3f46 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                    }}
                />

                <header className="h-20 px-10 flex items-center justify-between z-40 relative border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Knowledge Database</h1>
                        <h2 className="text-xl font-bold tracking-tight text-zinc-100 uppercase">Wiki <span className="text-sky-400">Maker</span></h2>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-400 transition-colors" size={15} />
                        <input
                            className="w-80 bg-zinc-900/50 border border-zinc-800/80 rounded-xl py-2 pl-11 pr-4 text-xs text-zinc-300 outline-none transition-all placeholder:text-zinc-600 focus:border-zinc-600"
                            placeholder="BUSCAR PROTOCOLO TÉCNICO..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 relative z-10 scroll-smooth">
                    <div className="max-w-[1600px] mx-auto space-y-12">

                        {/* HERO REFINADO */}
                        <section className="relative overflow-hidden rounded-[2rem] bg-zinc-900/40 border border-zinc-800/50 p-12 min-h-[320px] flex flex-col justify-center shadow-sm backdrop-blur-sm group transition-all duration-500">
                            <HUDOverlay />
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3 text-sky-400">
                                    <Terminal size={14} className="animate-pulse" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Central de Inteligência Operacional</span>
                                </div>
                                <TypewriterHero phrases={phrases} />
                                <p className="text-sm text-zinc-400 max-w-xl font-medium leading-relaxed uppercase tracking-wide">Diretrizes e protocolos de otimização industrial para sua farm de impressão.</p>
                            </div>
                        </section>

                        {/* FILTROS REFINADOS */}
                        <div className="flex flex-wrap gap-3 relative z-10">
                            {[
                                { id: 'all', label: 'Todos os Módulos', icon: Activity },
                                { id: 'critico', label: 'Crítico [!]', icon: AlertTriangle, color: 'text-rose-400' },
                                { id: 'lucro', label: 'Rentabilidade [$]', icon: Coins, color: 'text-emerald-400' },
                                { id: 'setup', label: 'Hardware', icon: Code, color: 'text-sky-400' },
                            ].map((f) => (
                                <button key={f.id} onClick={() => setFiltroAtivo(f.id)} className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest ${filtroAtivo === f.id ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/80 hover:border-zinc-600 hover:text-zinc-300'}`}>
                                    <f.icon size={14} className={filtroAtivo === f.id ? 'text-zinc-950' : f.color} />
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* GRID DE CARDS REFINADO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredData.map((category) => (
                                <WikiModuleCard key={category.id} category={category} onSelectTopic={setSelectedArticle} />
                            ))}
                        </div>

                        {/* CALL TO ACTION REFINADO */}
                        <section className="relative overflow-hidden rounded-[2rem] bg-zinc-900/40 border border-zinc-800/50 p-10 shadow-sm group backdrop-blur-sm">
                            <HUDOverlay />
                            <div className="relative z-30 flex flex-col lg:flex-row items-center justify-between gap-10">
                                <div className="flex items-center gap-8">
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-sky-400 shadow-inner">
                                        <Globe size={28} strokeWidth={2} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Suporte Técnico & Contribuições</h3>
                                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide leading-relaxed max-w-lg">
                                            Tem sugestões de melhoria para os protocolos? <br />
                                            Nossa central de comando está aberta para novos relatórios.
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

                {/* MODAL REFINADO */}
                {selectedArticle && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-zinc-950/80" onClick={() => setSelectedArticle(null)} />
                        <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-[2rem] relative z-10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                            <div className="p-10 border-b border-zinc-800/50 flex justify-between items-start bg-zinc-950/30">
                                <div className="space-y-4">
                                    <span className="px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[10px] font-bold text-sky-400 uppercase tracking-widest">Protocolo: {selectedArticle.id}</span>
                                    <h2 className="text-2xl font-bold text-zinc-100 uppercase tracking-tight">{selectedArticle.title}</h2>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Prioridade: {selectedArticle.level}</p>
                                </div>
                                <button onClick={() => setSelectedArticle(null)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 transition-all"><X size={20} /></button>
                            </div>
                            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-8">
                                <p className="text-zinc-400 text-sm font-medium leading-relaxed border-l-2 border-sky-500/30 pl-6 uppercase tracking-wide">{selectedArticle.content}</p>
                                {selectedArticle.gcode && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Comando de Terminal (G-Code):</p>
                                        <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 flex justify-between items-center group/code">
                                            <code className="text-sky-400 text-xs font-mono">{selectedArticle.gcode}</code>
                                            <button onClick={() => { navigator.clipboard.writeText(selectedArticle.gcode); alert("Copiado!"); }} className="text-zinc-600 hover:text-zinc-100 transition-colors">
                                                <Code size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}