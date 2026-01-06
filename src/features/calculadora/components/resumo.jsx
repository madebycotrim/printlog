import React, { useState, useEffect, useMemo, useRef } from "react";
import { formatCurrency } from "../../../utils/numbers";
import {
    Save, Calculator, FileText, Loader2, Wand2,
    MessageCircle, Target, Package, Zap, Clock, Wrench,
    Landmark, RotateCcw, Send, Copy, Check, Settings2,
    Truck, ShoppingBag, Tag, ShieldAlert, Box, AlertTriangle,
    PlusCircle, CheckCircle2, Globe, History, CloudCheck
} from "lucide-react";

import { generateProfessionalPDF } from "../../../utils/pdfGenerator";
import { useSettingsStore } from "../logic/calculator";
import Popup from "../../../components/Popup";

/* ---------- SUB-COMPONENTE: NÚMERO ANIMADO ---------- */
const AnimatedNumber = ({ value, duration = 800 }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const frameRef = useRef();
    const startTimeRef = useRef();
    const startValueRef = useRef(displayValue);

    useEffect(() => {
        startValueRef.current = displayValue;
        startTimeRef.current = performance.now();
        const animate = (now) => {
            const elapsed = now - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuad = (t) => t * (2 - t);
            const nextValue = startValueRef.current + (value - startValueRef.current) * easeOutQuad(progress);
            setDisplayValue(nextValue);
            if (progress < 1) frameRef.current = requestAnimationFrame(animate);
        };
        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [value]);

    return <span>{formatCurrency(displayValue)}</span>;
};

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function Resumo({ resultados = {}, entradas = {}, salvar = () => { } }) {
    const {
        lucroBrutoUnitario = 0, precoSugerido = 0, precoComDesconto = 0, tempoTotalHoras = 0,
        custoMaterial = 0, custoEnergia = 0, custoMaquina = 0, custoMaoDeObra = 0,
        custoSetup = 0, valorImpostos = 0, valorMarketplace = 0, margemEfetivaPct = 0,
        custoUnitario = 0, custoEmbalagem = 0, custoFrete = 0, custosExtras = 0,
        valorRisco = 0
    } = resultados;

    const { settings } = useSettingsStore();

    const [estaSalvo, setEstaSalvo] = useState(false);
    const [estaGravando, setEstaGravando] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const [whatsappModal, setWhatsappModal] = useState(false);
    const [genericModal, setGenericModal] = useState({
        open: false, type: '', title: '', message: '', onConfirm: null, icon: ShieldAlert
    });

    const [precoArredondado, setPrecoArredondado] = useState(null);
    const [copiado, setCopiado] = useState(false);
    const [copiadoPreco, setCopiadoPreco] = useState(false);
    const [mensagemEditavel, setMensagemEditavel] = useState("");

    const temMaterial = custoMaterial > 0.001;
    const possuiDesconto = precoComDesconto > 0 && Math.abs(precoComDesconto - precoSugerido) > 0.01;
    const precoFinalVenda = precoArredondado || (possuiDesconto ? precoComDesconto : precoSugerido);
    const nomeProjeto = entradas?.nomeProjeto || "";

    useEffect(() => {
        setEstaSalvo(false);
        setPrecoArredondado(null);
    }, [resultados, entradas]);

    const paybackInsumo = useMemo(() => {
        if (!custoMaterial || !lucroBrutoUnitario) return 0;
        return (lucroBrutoUnitario / custoMaterial).toFixed(1);
    }, [custoMaterial, lucroBrutoUnitario]);

    const saudeProjeto = useMemo(() => {
        if (!temMaterial) return { label: "AGUARDANDO INSUMOS", color: "text-zinc-600", bar: "bg-zinc-800", dot: "bg-zinc-800" };
        if (margemEfetivaPct <= 0) return { label: "VALOR INVIÁVEL", color: "text-rose-500", bar: "bg-rose-500", dot: "bg-rose-500" };
        return { label: "PROJETO SAUDÁVEL", color: "text-[#10b981]", bar: "bg-[#10b981]", dot: "bg-[#10b981]" };
    }, [temMaterial, margemEfetivaPct]);

    const composicaoItens = useMemo(() => {
        return [
            { label: 'Matéria-Prima', val: custoMaterial, icon: Package },
            { label: 'Energia Elétrica', val: custoEnergia, icon: Zap },
            { label: 'Depreciação Máquina', val: custoMaquina, icon: Clock },
            { label: 'Mão de Obra', val: custoMaoDeObra, icon: Wrench },
            { label: 'Taxa de Setup', val: custoSetup, icon: Settings2 },
            { label: 'Embalagem', val: custoEmbalagem, icon: Box },
            { label: 'Frete de Entrega', val: custoFrete, icon: Truck },
            { label: 'Gastos Adicionais', val: custosExtras, icon: Tag },
            { label: 'Reserva p/ Falhas', val: valorRisco, icon: ShieldAlert, color: 'text-amber-400/70' },
            { label: 'Impostos', val: valorImpostos, icon: Landmark, color: 'text-rose-400/60' },
            { label: 'Taxas de Venda', val: valorMarketplace, icon: ShoppingBag, color: 'text-rose-400/60' }
        ].filter(item => item.val > 0.009);
    }, [custoMaterial, custoEnergia, custoMaquina, custoMaoDeObra, custoSetup, custoEmbalagem, custoFrete, custosExtras, valorRisco, valorImpostos, valorMarketplace]);

    // --- HANDLERS ---
    const lidarSalvarResumo = async () => {
        if (!nomeProjeto.trim()) {
            setGenericModal({
                open: true, type: 'ALERT', title: 'Nome Obrigatório', icon: AlertTriangle,
                message: 'Dê um nome para o seu projeto no topo da página antes de salvar.'
            });
            return;
        }
        setEstaGravando(true);
        try {
            const sucesso = await salvar();
            if (sucesso) {
                setEstaSalvo(true);
                setShowSuccessPopup(true);
            }
        }
        catch (error) { setGenericModal({ open: true, type: 'ERROR', title: 'Erro', icon: AlertTriangle, message: 'Falha ao salvar.' }); }
        finally { setEstaGravando(false); }
    };

    return (
        <div className="h-full flex flex-col gap-3 select-none animate-in fade-in duration-500">

            {/* CARD 01: DESEMPENHO FINANCEIRO */}
            <div className="bg-[#0c0c0e] border border-white/[0.05] rounded-3xl p-5 relative overflow-hidden shrink-0">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${saudeProjeto.dot} ${temMaterial ? 'animate-pulse' : ''} shadow-[0_0_8px_currentColor]`} />
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${saudeProjeto.color}`}>{saudeProjeto.label}</span>
                    </div>
                    {temMaterial && (
                        <div className="text-right">
                            <span className="text-[7px] font-bold text-zinc-600 uppercase block leading-none mb-1">Retorno Insumo</span>
                            <span className="text-[10px] font-mono font-bold text-zinc-300">{paybackInsumo}x</span>
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    {temMaterial ? (
                        <h2 className="text-5xl font-black font-mono tracking-tighter leading-none text-white">
                            <AnimatedNumber value={lucroBrutoUnitario} />
                        </h2>
                    ) : (
                        <span className="text-xl font-bold text-zinc-800 uppercase tracking-tighter">Aguardando dados...</span>
                    )}
                    <div className="flex justify-between items-end mt-2">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Lucro Líquido Real</span>
                        <span className={`text-[10px] font-bold font-mono ${temMaterial ? 'text-zinc-400' : 'text-zinc-800'}`}>
                            {temMaterial ? `${Math.round(margemEfetivaPct)}% MARGEM` : '--'}
                        </span>
                    </div>
                </div>

                <div className="h-[2px] w-full bg-zinc-900 rounded-full flex overflow-hidden">
                    <div style={{ width: `${temMaterial ? (custoUnitario / Math.max(precoFinalVenda, 0.01) * 100) : 0}%` }} className="bg-zinc-800 h-full transition-all duration-1000" />
                    <div style={{ width: `${temMaterial ? (lucroBrutoUnitario / Math.max(precoFinalVenda, 0.01) * 100) : 0}%` }} className={`${saudeProjeto.bar} h-full transition-all duration-1000`} />
                </div>
            </div>

            {/* CARD 02: PREÇO FINAL DE VENDA */}
            <div className="bg-[#0c0c0e] border border-white/[0.05] rounded-3xl p-5 relative group shrink-0">
                <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(precoFinalVenda.toFixed(2)); setCopiadoPreco(true); setTimeout(() => setCopiadoPreco(false), 2000); }} disabled={!temMaterial} className="p-2.5 rounded-xl border border-white/5 bg-zinc-900/50 text-zinc-600 hover:text-sky-400 disabled:opacity-10 transition-all">
                        {copiadoPreco ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button onClick={() => { const current = precoFinalVenda; const val = Math.floor(current); const cents = Number((current % 1).toFixed(2)); setPrecoArredondado(cents < 0.90 ? val + 0.90 : val + 1.90); }} disabled={!temMaterial} className="p-2.5 rounded-xl border border-white/5 bg-zinc-900/50 text-zinc-600 hover:text-sky-400 disabled:opacity-10 transition-all">
                        <Wand2 size={14} />
                    </button>
                </div>

                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] block mb-3">Preço Sugerido</span>

                <div className="flex flex-col">
                    {temMaterial ? (
                        possuiDesconto ? (
                            <div className="flex flex-col">
                                <span className="text-zinc-600 font-mono text-sm line-through decoration-rose-500/40 mb-1">{formatCurrency(precoSugerido)}</span>
                                <h3 className="text-5xl font-black font-mono tracking-tighter text-white leading-none">
                                    <AnimatedNumber value={precoFinalVenda} />
                                </h3>
                            </div>
                        ) : (
                            <h3 className="text-5xl font-black font-mono tracking-tighter text-white leading-none">
                                <AnimatedNumber value={precoFinalVenda} />
                            </h3>
                        )
                    ) : (
                        <span className="text-2xl font-black text-zinc-800 uppercase tracking-tighter">Inicie o cálculo</span>
                    )}
                </div>
            </div>

            {/* CARD 03: COMPOSIÇÃO DOS CUSTOS */}
            <div className="flex-1 bg-zinc-900/10 border border-white/[0.05] rounded-3xl flex flex-col overflow-hidden min-h-0">
                <div className="px-5 py-3 border-b border-white/[0.03] flex justify-between items-center text-[9px] font-bold text-zinc-600 uppercase tracking-widest shrink-0">
                    <span>Composição dos Custos</span>
                    <Target size={12} className="opacity-20" />
                </div>
                <div className="flex-1 overflow-y-auto px-5 custom-scrollbar">
                    {temMaterial && composicaoItens.length > 0 ? (
                        <div className="py-2 space-y-0.5">
                            {composicaoItens.map((item, i) => (
                                <div key={i} className="flex justify-between py-1.5 border-b border-white/[0.01] last:border-0 group">
                                    <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-2 group-hover:text-zinc-300 transition-colors">
                                        <item.icon size={11} className="shrink-0" /> {item.label}
                                    </span>
                                    <span className={`text-[10px] font-mono font-bold ${item.color || 'text-zinc-300'}`}>{formatCurrency(item.val)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20 py-10">
                            <PlusCircle size={40} strokeWidth={1} className="text-sky-500" />
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-center px-6">Informe peso e custo do material</p>
                        </div>
                    )}
                </div>
            </div>

            {/* AÇÕES FIXAS */}
            <div className="flex flex-col gap-2 shrink-0">
                <div className="flex gap-2 h-14">
                    <button onClick={lidarSalvarResumo} disabled={!temMaterial || estaSalvo || estaGravando} className={`flex-1 rounded-2xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em] transition-all ${estaSalvo ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-[#0095ff] hover:bg-[#007cd6] text-white shadow-lg shadow-sky-500/10 disabled:opacity-20'}`}>
                        {estaGravando ? <Loader2 className="animate-spin" size={16} /> : <Save size={18} />}
                        {estaSalvo ? "PROJETO SINCRONIZADO" : "GERAR E SALVAR"}
                    </button>
                    <button onClick={() => { if (temMaterial) { const template = settings?.whatsappTemplate || "Olá! Segue orçamento: *{valor}*"; setMensagemEditavel(template.replace(/{projeto}/g, nomeProjeto || "3D").replace(/{valor}/g, formatCurrency(precoFinalVenda)).replace(/{tempo}/g, `${tempoTotalHoras}h`)); setWhatsappModal(true); } }} disabled={!temMaterial} className="w-14 h-14 rounded-2xl bg-[#10b981] hover:bg-[#0da472] text-white flex items-center justify-center transition-all disabled:opacity-20">
                        <MessageCircle size={24} fill="currentColor" />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-2 h-10">
                    <button onClick={() => setGenericModal({ open: true, type: 'CONFIRM', title: 'Reiniciar', icon: RotateCcw, message: 'Apagar dados atuais?', onConfirm: () => window.location.reload() })} className="rounded-xl bg-zinc-900 border border-white/[0.05] text-zinc-600 hover:text-zinc-300 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all"><RotateCcw size={12} /> Reiniciar</button>
                    <button onClick={() => generateProfessionalPDF(resultados, entradas, precoFinalVenda)} className="rounded-xl bg-zinc-900 border border-white/[0.05] text-zinc-600 hover:text-zinc-300 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all"><FileText size={12} /> Orçamento</button>
                </div>
            </div>

            {/* POPUP DE SUCESSO (ESTILO RESUMO) */}
            <Popup
                isOpen={showSuccessPopup}
                onClose={() => setShowSuccessPopup(false)}
                title="Sincronizado com a Nuvem"
                subtitle="MakersLog Cloud Sync"
                icon={CheckCircle2}
                footer={
                    <button
                        onClick={() => setShowSuccessPopup(false)}
                        className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all active:scale-95"
                    >
                        Continuar trabalhando
                    </button>
                }
            >
                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                            <Globe size={10} /> Backup Ativo
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                            {nomeProjeto || "Orçamento Sem Nome"}
                        </h3>
                    </div>

                    {/* Mini Cards (Reflexo do Resumo) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-950 border border-white/5 p-5 rounded-[2rem] flex flex-col justify-center">
                            <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Preço de Venda</span>
                            <span className="text-2xl font-black font-mono text-white leading-none">
                                {formatCurrency(precoFinalVenda)}
                            </span>
                        </div>
                        <div className="bg-zinc-950 border border-white/5 p-5 rounded-[2rem] flex flex-col justify-center">
                            <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Lucro Líquido</span>
                            <span className="text-2xl font-black font-mono text-emerald-500 leading-none">
                                {formatCurrency(lucroBrutoUnitario)}
                            </span>
                        </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-zinc-900/30 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sky-500">
                                <History size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Histórico Cloud</span>
                                <span className="text-[8px] font-black text-zinc-600 uppercase">Sincronizado via D1 Database</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Ativo</span>
                        </div>
                    </div>
                </div>
            </Popup>

            {/* OUTROS POPUPS */}
            <Popup isOpen={whatsappModal} onClose={() => setWhatsappModal(false)}
                title="Enviar WhatsApp"
                icon={MessageCircle}
                footer={
                    <div className="flex w-full gap-2">
                        <button onClick={() => { navigator.clipboard.writeText(mensagemEditavel); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }} className="flex-1 bg-zinc-900 border border-white/5 text-zinc-400 text-[10px] font-black uppercase h-12 rounded-xl flex items-center justify-center gap-2">
                            {copiado ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            {copiado ? "Copiado" : "Copiar"}
                        </button>
                        <button onClick={() => { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensagemEditavel)}`, "_blank"); setWhatsappModal(false); }} className="flex-[2] bg-[#10b981] text-white text-[10px] font-black uppercase h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg"><Send size={14} />
                            Enviar Agora
                        </button>
                    </div>
                }>
                <div className="p-6">
                    <textarea className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-300 outline-none focus:border-emerald-500/50 transition-all resize-none font-sans" value={mensagemEditavel} onChange={(e) => setMensagemEditavel(e.target.value)} />
                </div>
            </Popup>

            <Popup isOpen={genericModal.open} onClose={() => setGenericModal({ ...genericModal, open: false })}
                title={genericModal.title}
                icon={genericModal.icon}
                footer={
                    <div className="flex w-full gap-2">
                        {genericModal.type === 'CONFIRM' ? (
                            <>
                                <button onClick={() => setGenericModal({ ...genericModal, open: false })} className="flex-1 text-[10px] font-bold text-zinc-500 uppercase h-12">
                                    Cancelar
                                </button>
                                <button onClick={genericModal.onConfirm} className="flex-1 bg-rose-600 text-white text-[10px] font-black uppercase h-12 rounded-xl">
                                    Confirmar
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setGenericModal({ ...genericModal, open: false })} className="w-full bg-[#0095ff] text-white text-[10px] font-black uppercase h-12 rounded-xl">
                                Entendi
                            </button>
                        )}
                    </div>
                }>
                <div className="p-8 text-center">
                    <p className="text-sm text-zinc-400">{genericModal.message}</p>
                </div>
            </Popup>
        </div>
    );
}
