// src/features/calculadora/components/MakersHubWidget.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
    Bot, Copy, Check, ChevronLeft, ChevronRight, ArrowUpRight, Loader2
} from "lucide-react";
import { formatCurrency } from "../../../../utils/numbers";

// Importação da store oficial para sincronia com Banco de Dados
import { useFilamentStore } from "../../../filamentos/logic/filaments";

export default function MakersHubWidget({ resultados = {}, entradas = {}, nomeProjeto }) {
    const [slide, definirSlide] = useState(0);
    const [copiado, setCopiado] = useState(false);

    // Hook da Store para sincronização de estoque
    const { filaments: filamentos, fetchFilaments: buscarFilamentos, loading: carregando } = useFilamentStore();

    useEffect(() => {
        buscarFilamentos(); // Sincroniza estoque do banco ao abrir o componente
    }, [buscarFilamentos]);

    // --- 1. CÁLCULOS DE TEMPO E PESO (ALINHADOS COM O MOTOR) ---
    const pesoTotal = useMemo(() => {
        const slots = entradas.material?.slots;
        if (Array.isArray(slots) && slots.length > 0) {
            return slots.reduce((acc, s) => acc + (Number(s.weight) || 0), 0);
        }
        return Number(entradas.material?.pesoModelo) || Number(entradas.pesoModelo) || 0;
    }, [entradas]);

    const tempoTotalHorasCalculado = useMemo(() => {
        const h = Number(entradas.tempo?.impressaoHoras) || Number(entradas.tempoImpressaoHoras) || 0;
        const m = Number(entradas.tempo?.impressaoMinutos) || Number(entradas.tempoImpressaoMinutos) || 0;
        const total = h + (m / 60);
        return isFinite(total) ? total : 0;
    }, [entradas]);

    // --- 2. PERFORMANCE E RENTABILIDADE ---
    const lucroPorHora = useMemo(() => {
        if (tempoTotalHorasCalculado <= 0) return 0;
        const lucroTotal = Number(resultados.lucroBrutoUnitario) || 0;
        return lucroTotal / tempoTotalHorasCalculado;
    }, [resultados, tempoTotalHorasCalculado]);

    const margemRendimentoPct = useMemo(() => {
        return Math.round(Number(resultados.margemEfetivaPct) || 0);
    }, [resultados]);

    // --- 3. TELEMETRIA DE ESTOQUE (MAPEAMENTO DE DISPONIBILIDADE) ---
    const dadosTelemetria = useMemo(() => {
        const material = entradas.material || {};
        const slots = (Array.isArray(material.slots) && material.slots.length > 0)
            ? material.slots
            : [{ id: material.selectedFilamentId || 'manual', weight: material.pesoModelo || 0 }];

        return slots.map((slot, idx) => {
            const itemNoBanco = filamentos.find(f => f.id === slot.id);
            const consumoPrevisto = Number(slot.weight) || 0;

            // Dados do banco: peso_atual, nome, material
            const pesoAntes = itemNoBanco ? Number(itemNoBanco.peso_atual) : 0;

            return {
                rotulo: itemNoBanco ? itemNoBanco.nome : (slot.id === 'manual' ? "Entrada Manual" : `Slot ${idx + 1}`),
                sobra: pesoAntes - (consumoPrevisto * (Number(entradas.qtdPecas) || 1)),
                tipo: itemNoBanco ? itemNoBanco.material : "PLA",
                ativo: consumoPrevisto > 0 || (slots.length === 1 && !itemNoBanco)
            };
        }).filter(s => s.ativo);
    }, [entradas, filamentos]);

    // --- 4. DICAS TÉCNICAS ---
    const dicasTecnicas = useMemo(() => {
        const materialAtivo = (dadosTelemetria[0]?.tipo || "PLA").toUpperCase();
        const baseConhecimento = {
            "PLA": { temp: "200°C", mesa: "60°C", vent: "100%", speed: "60-100mm/s" },
            "PETG": { temp: "240°C", mesa: "80°C", vent: "40%", speed: "40-60mm/s" },
            "ABS": { temp: "255°C", mesa: "110°C", vent: "0%", speed: "40-50mm/s" }
        };
        return baseConhecimento[materialAtivo] || baseConhecimento["PLA"];
    }, [dadosTelemetria]);

    // --- 5. TEXTO DO ORÇAMENTO ---
    const textoOrcamento = `*ORÇAMENTO: ${nomeProjeto || "Projeto 3D"}*\n\n` +
        `📦 *Peça:* Personalizada em 3D\n` +
        `⏱️ *Produção:* ~${Math.floor(tempoTotalHorasCalculado)}h ${Math.round((tempoTotalHorasCalculado % 1) * 60)}m\n` +
        `💰 *Valor:* ${formatCurrency(resultados.precoComDesconto || resultados.precoSugerido || 0)}\n\n` +
        `_Podemos iniciar?_ 🚀`;

    const slides = [
        { id: 'quote', title: "Orçamento", color: 'text-emerald-400', badge: 'WHATSAPP' },
        { id: 'telemetry', title: "Estoque", color: 'text-sky-400', badge: 'FILAMENTO' },
        { id: 'performance', title: "Performance", color: 'text-indigo-400', badge: 'KPI' },
        { id: 'tech', title: "Setup", color: 'text-rose-400', badge: 'CONFIG' }
    ];

    const slideAtual = slides[slide];

    return (
        <div className="h-fit flex flex-col bg-zinc-950/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden relative shadow-2xl animate-in fade-in duration-700">
            {/* HEADER DO WIDGET */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-white/5 bg-zinc-900/20">
                <div className="flex items-center gap-2">
                    <Bot size={14} className="text-sky-500" />
                    <span className="text-[9px] font-black text-zinc-400 tracking-widest uppercase">Assistente Maker</span>
                    {carregando && <Loader2 size={10} className="animate-spin text-zinc-600" />}
                </div>
                <div className={`px-2 py-0.5 rounded border text-[8px] font-black ${slideAtual.color.replace('text', 'border')}/20 ${slideAtual.color} bg-white/5`}>
                    {slideAtual.badge}
                </div>
            </div>

            {/* CONTEÚDO DINÂMICO */}
            <div className="p-5 min-h-[160px]">
                {slideAtual.id === 'quote' && (
                    <div className="flex flex-col animate-in fade-in duration-500">
                        <div className="h-24 bg-black/40 border border-zinc-800 rounded-xl p-3 mb-3 font-mono text-[9px] text-zinc-500 overflow-y-auto custom-scrollbar">
                            {textoOrcamento}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { navigator.clipboard.writeText(textoOrcamento); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }}
                                className="flex-1 h-9 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-black text-zinc-300 flex items-center justify-center gap-2 transition-all active:scale-95">
                                {copiado ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />} {copiado ? "COPIADO" : "COPIAR"}
                            </button>
                            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(textoOrcamento)}`)} className="w-10 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white hover:bg-emerald-500 transition-colors"><ArrowUpRight size={16} /></button>
                        </div>
                    </div>
                )}

                {slideAtual.id === 'telemetry' && (
                    <div className="flex flex-col gap-3 animate-in slide-in-from-right-2">
                        <span className="text-[10px] font-black text-zinc-500 uppercase">Consumo Estimado: <span className="text-white">{pesoTotal}g</span></span>
                        {dadosTelemetria.map((d, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between text-[9px] font-bold uppercase">
                                    <span className="text-zinc-400 truncate max-w-[150px]">{d.rotulo}</span>
                                    <span className={d.sobra < 0 ? "text-rose-500 font-black" : "text-zinc-500"}>
                                        {d.sobra < 0 ? "FALTA MATERIAL!" : `${Math.round(d.sobra)}g sobra`}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                    <div className={`h-full transition-all duration-1000 ${d.sobra < 50 ? "bg-rose-500" : "bg-sky-500"}`} style={{ width: `${Math.max(0, Math.min(100, (d.sobra / 1000) * 100))}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {slideAtual.id === 'performance' && (
                    <div className="flex flex-col justify-center py-2 animate-in zoom-in-95">
                        <span className="text-[9px] font-black text-zinc-600 uppercase mb-1">Rentabilidade Operacional</span>
                        <div className="text-3xl font-black text-indigo-400 font-mono mb-2">{formatCurrency(lucroPorHora)}<span className="text-[10px] text-zinc-500 ml-1">/H</span></div>
                        <div className="text-[8px] font-bold text-zinc-500 bg-white/5 p-2 rounded border border-white/5">
                            Margem Efetiva sobre Venda: <span className="text-emerald-500">+{margemRendimentoPct}%</span> real.
                        </div>
                    </div>
                )}

                {slideAtual.id === 'tech' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                        <div className="col-span-2 text-[9px] font-black text-zinc-500 uppercase border-b border-white/5 pb-1">Perfil Sugerido para {dadosTelemetria[0]?.tipo || "PLA"}</div>
                        <div className="flex flex-col"><span className="text-[7px] text-zinc-600 uppercase font-black">Bico</span><span className="text-xs font-mono font-bold text-zinc-200">{dicasTecnicas.temp}</span></div>
                        <div className="flex flex-col"><span className="text-[7px] text-zinc-600 uppercase font-black">Mesa</span><span className="text-xs font-mono font-bold text-zinc-200">{dicasTecnicas.mesa}</span></div>
                        <div className="flex flex-col"><span className="text-[7px] text-zinc-600 uppercase font-black">Cooling</span><span className="text-xs font-mono font-bold text-zinc-200">{dicasTecnicas.vent}</span></div>
                        <div className="flex flex-col"><span className="text-[7px] text-zinc-600 uppercase font-black">Velocidade</span><span className="text-xs font-mono font-bold text-zinc-200">{dicasTecnicas.speed}</span></div>
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div className="h-10 border-t border-white/5 bg-zinc-900/40 flex items-center justify-between px-2 shrink-0">
                <button onClick={() => definirSlide(s => (s - 1 + 4) % 4)} className="p-1.5 text-zinc-700 hover:text-white transition-colors"><ChevronLeft size={16} /></button>
                <div className="flex gap-1">
                    {[0, 1, 2, 3].map(i => <div key={i} className={`h-1 rounded-full transition-all duration-500 ${slide === i ? 'w-4 bg-sky-500' : 'w-1 bg-zinc-800'}`} />)}
                </div>
                <button onClick={() => definirSlide(s => (s + 1) % 4)} className="p-1.5 text-zinc-700 hover:text-white transition-colors"><ChevronRight size={16} /></button>
            </div>
        </div>
    );
}