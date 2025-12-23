import React, { useState, useEffect } from "react";
import { 
    Zap, Copy, Check, Package, CalendarClock, 
    Share2, PieChart, Printer, ArrowUpRight, 
    ChevronLeft, ChevronRight, AlertTriangle, Clock,
    Bot, Cpu, Sparkles, Send
} from "lucide-react";
import { formatCurrency } from "../../../../lib/format";

export default function MakersHubWidget({ resultados, entradas, nomeProjeto }) {
    const [slide, setSlide] = useState(0);
    const [copied, setCopied] = useState(false);
    
    const PRECO_IMPRESSORA_META = 4500; 

    useEffect(() => { setCopied(false); }, [resultados]);

    // --- LÓGICA DE CÁLCULO (Mantida a sua original) ---
    const getQuoteText = () => {
        const total = formatCurrency(resultados.precoSugerido || 0);
        const prazo = `${entradas.tempoImpressaoHoras || 0}h ${entradas.tempoImpressaoMinutos || 0}m`;
        return `*ORÇAMENTO: ${nomeProjeto || "Peça 3D"}*\n\n📦 *Modelo:* Personalizado\n⏱️ *Tempo:* ~${prazo}\n💰 *Investimento:* ${total}\n\n_Gerado via PrintLog_`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getQuoteText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tempoTotalMinutos = (Number(entradas.tempoImpressaoHoras) * 60) + Number(entradas.tempoImpressaoMinutos);
    const dataFim = new Date(new Date().getTime() + tempoTotalMinutos * 60000);
    const horaFim = dataFim.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const pesoPeca = Number(entradas.pesoModelo) || 0;
    const porcentagemRolo = (pesoPeca / 1000) * 100;
    const lucroUnitario = resultados.lucroBrutoUnitario || 0;
    const pecasParaNovaMaquina = lucroUnitario > 0 ? Math.ceil(PRECO_IMPRESSORA_META / lucroUnitario) : 0;

    const slides = [
        { id: 'quote', title: "Venda Rápida", icon: Share2, color: 'text-emerald-400', badge: 'WHATSAPP' },
        { id: 'schedule', title: "Entrega", icon: CalendarClock, color: 'text-amber-400', badge: 'DEADLINE' },
        { id: 'filament', title: "Consumo", icon: Package, color: 'text-sky-400', badge: 'ESTOQUE' },
        { id: 'costs', title: "Análise", icon: PieChart, color: 'text-purple-400', badge: 'RAIO-X' },
        { id: 'meta', title: "ROI", icon: Printer, color: 'text-rose-400', badge: 'METAS' },
    ];

    const currentSlide = slides[slide];

    return (
        <div className="h-full flex flex-col bg-zinc-950/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden group/hub relative shadow-2xl">
            
            {/* GRID DE FUNDO SUTIL */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

            {/* HEADER ESTILO DASHBOARD */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-white/5 bg-zinc-900/20 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Bot size={12} className="text-sky-500" />
                    </div>
                    <span className="text-[9px] font-black text-zinc-400 tracking-[0.2em] uppercase">Makers Hub</span>
                </div>

                <div className={`px-2 py-0.5 rounded-md border text-[8px] font-bold tracking-tighter ${currentSlide.color.replace('text-', 'border-').replace('400', '500/20')} ${currentSlide.color.replace('text-', 'bg-').replace('400', '500/5')}`}>
                    {currentSlide.badge}
                </div>
            </div>

            {/* CONTEÚDO DINÂMICO */}
            <div className="flex-1 p-5 relative z-10">
                
                {/* 1. WHATSAPP / QUOTE */}
                {slide === 0 && (
                    <div className="h-full flex flex-col">
                        <div className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 mb-3 font-mono text-[10px] text-zinc-500 leading-relaxed overflow-hidden relative">
                             <div className="absolute top-2 right-2 text-emerald-500/20"><Send size={12}/></div>
                             {getQuoteText()}
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            <button onClick={handleCopy} className="col-span-4 h-9 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-300 transition-all flex items-center justify-center gap-2">
                                {copied ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
                                {copied ? "Copiado" : "Copiar Orçamento"}
                            </button>
                            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(getQuoteText())}`)} className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20 transition-all">
                                <ArrowUpRight size={16}/>
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. CRONOGRAMA (Estilo "Temp na Oficina") */}
                {slide === 1 && (
                    <div className="h-full flex flex-col justify-center items-center">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Pronto às</span>
                        <div className="text-5xl font-black text-white font-mono tracking-tighter mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            {horaFim}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                            <Clock size={10}/> Duração: {tempoTotalMinutos} min
                        </div>
                    </div>
                )}

                {/* 3. CONSUMO (Barra Neon) */}
                {slide === 2 && (
                    <div className="h-full flex flex-col justify-center gap-5">
                         <div className="space-y-2">
                             <div className="flex justify-between text-[9px] font-bold uppercase text-zinc-500">
                                 <span>Uso do Carretel</span>
                                 <span className="text-sky-400">{porcentagemRolo.toFixed(1)}%</span>
                             </div>
                             <div className="h-3 w-full bg-zinc-900 rounded-full border border-zinc-800 p-[2px] overflow-hidden">
                                 <div 
                                    style={{width: `${Math.min(porcentagemRolo, 100)}%`}} 
                                    className="h-full bg-sky-500 rounded-full shadow-[0_0_12px_rgba(14,165,233,0.5)] transition-all duration-1000"
                                 />
                             </div>
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                            <StatBox value={Math.floor(1000/pesoPeca) || 0} label="Peças/Rolo" />
                            <StatBox value={`${pesoPeca}g`} label="Peso Peça" />
                         </div>
                    </div>
                )}

                {/* 4. ANÁLISE DE CUSTO */}
                {slide === 3 && (
                    <div className="h-full flex flex-col justify-center">
                         <div className="flex items-center gap-4">
                             <div className="w-20 h-20 rounded-full border-4 border-zinc-900 border-t-purple-500 border-r-sky-500 flex items-center justify-center bg-zinc-950 shadow-inner">
                                <PieChart size={20} className="text-zinc-700"/>
                             </div>
                             <div className="flex-1 space-y-2">
                                <MiniRow label="Material" color="bg-sky-500" pct={Math.round((resultados.custoMaterial/resultados.custoUnitario)*100)} />
                                <MiniRow label="Operacional" color="bg-purple-500" pct={Math.round((resultados.custoMaoDeObra/resultados.custoUnitario)*100)} />
                                <MiniRow label="Energia" color="bg-amber-500" pct={Math.round((resultados.custoEnergia/resultados.custoUnitario)*100)} />
                             </div>
                         </div>
                    </div>
                )}

                {/* 5. METAS ROI */}
                {slide === 4 && (
                    <div className="h-full flex flex-col items-center justify-center">
                         <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">Próxima Máquina em</span>
                         <div className="text-6xl font-black text-white font-mono tracking-tighter flex items-baseline gap-1">
                             {pecasParaNovaMaquina}
                             <span className="text-xs text-rose-500">pcs</span>
                         </div>
                         <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                             <Printer size={10} className="text-rose-500"/> Meta: {formatCurrency(PRECO_IMPRESSORA_META)}
                         </div>
                    </div>
                )}
            </div>

            {/* NAVEGAÇÃO FOOTER */}
            <div className="h-10 border-t border-white/5 bg-zinc-900/40 flex items-center justify-between px-2 shrink-0 relative z-20">
                <button onClick={() => setSlide((s) => (s-1+5)%5)} className="p-1.5 text-zinc-600 hover:text-white transition-colors"><ChevronLeft size={16}/></button>
                <div className="flex gap-1.5">
                    {[0,1,2,3,4].map(i => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${slide === i ? 'w-4 bg-sky-500' : 'w-1 bg-zinc-800'}`} />
                    ))}
                </div>
                <button onClick={() => setSlide((s) => (s+1)%5)} className="p-1.5 text-zinc-600 hover:text-white transition-colors"><ChevronRight size={16}/></button>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTES ESTILIZADOS ---

const StatBox = ({ value, label }) => (
    <div className="bg-zinc-900/50 border border-zinc-800 p-2 rounded-lg flex flex-col items-center group hover:border-zinc-700 transition-all">
        <span className="text-sm font-black text-white font-mono">{value}</span>
        <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">{label}</span>
    </div>
);

const MiniRow = ({ label, color, pct }) => (
    <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
            <span className="text-[8px] font-bold text-zinc-500 uppercase">{label}</span>
        </div>
        <span className="text-[9px] font-mono text-zinc-400">{pct || 0}%</span>
    </div>
);