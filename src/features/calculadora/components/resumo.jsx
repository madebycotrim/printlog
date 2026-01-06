import React, { useState, useEffect, useMemo, useRef } from "react";
import { formatCurrency } from "../../../utils/numbers";
import {
    Save, Calculator, FileText, Loader2, Wand2, X,
    MessageCircle, Target, Package, Zap, Clock, Wrench,
    Landmark, RotateCcw, Send, Copy, Check, Settings2,
    Truck, ShoppingBag, Tag, ShieldAlert, Box, AlertTriangle
} from "lucide-react";

import { generateProfessionalPDF } from "../../../utils/pdfGenerator";
import { useSettingsStore } from "../logic/calculator";

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

/* ---------- SUB-COMPONENTE: JANELA MODAL ---------- */
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

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function Resumo({ resultados = {}, entradas = {}, salvar = () => { }, onGoToSettings }) {
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
    
    // Estado de modal genérico para alertas
    const [modalConfig, setModalConfig] = useState({ 
        open: false, 
        type: '', 
        title: '', 
        message: '',
        onConfirm: null 
    });

    const [precoArredondado, setPrecoArredondado] = useState(null);
    const [copiado, setCopiado] = useState(false);
    const [copiadoPreco, setCopiadoPreco] = useState(false);
    const [whatsappModal, setWhatsappModal] = useState(false);
    const [mensagemEditavel, setMensagemEditavel] = useState("");

    const possuiDesconto = precoComDesconto > 0 && Math.abs(precoComDesconto - precoSugerido) > 0.01;
    const precoBase = possuiDesconto ? precoComDesconto : (precoSugerido || 0);
    const precoFinalVenda = precoArredondado || precoBase;
    const temDados = precoSugerido > 0.01;
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
        if (!temDados) return { label: "AGUARDANDO DADOS", color: "text-zinc-600", bar: "bg-zinc-800", dot: "bg-zinc-800" };
        if (margemEfetivaPct <= 0) return { label: "VALOR INVIÁVEL", color: "text-rose-500", bar: "bg-rose-500", dot: "bg-rose-500" };
        return { label: "PROJETO SAUDÁVEL", color: "text-[#10b981]", bar: "bg-[#10b981]", dot: "bg-[#10b981]" };
    }, [temDados, margemEfetivaPct]);

    // HANDLERS
    const handleSmartRound = () => {
        if (!temDados) return;
        const current = precoArredondado || precoBase;
        const valorInteiro = Math.floor(current);
        const centavos = Number((current % 1).toFixed(2));
        let next = centavos < 0.90 ? valorInteiro + 0.90 : valorInteiro + 1.90;
        setPrecoArredondado(next);
    };

    const handleCopyPrice = () => {
        if (!temDados) return;
        navigator.clipboard.writeText(precoFinalVenda.toFixed(2));
        setCopiadoPreco(true);
        setTimeout(() => setCopiadoPreco(false), 2000);
    };

    const lidarSalvarResumo = async () => {
        if (!nomeProjeto.trim()) {
            setModalConfig({ 
                open: true, 
                type: 'ALERT', 
                title: 'Nome Obrigatório', 
                message: 'Por favor, dê um nome para o seu projeto no topo da página antes de salvar.' 
            });
            return;
        }

        setEstaGravando(true);
        try {
            await salvar();
            setEstaSalvo(true);
        } catch (error) {
            setModalConfig({ 
                open: true, 
                type: 'ERROR', 
                title: 'Erro ao Salvar', 
                message: 'Não foi possível salvar os dados. Verifique sua conexão e tente novamente.' 
            });
        } finally {
            setEstaGravando(false);
        }
    };

    const abrirModalWhatsapp = () => {
        if (!temDados) return;
        const template = settings?.whatsappTemplate || "Olá! Segue o orçamento para o projeto *{projeto}*:\n\nValor: *{valor}*\nTempo estimado: *{tempo}*\n\nPodemos fechar?";
        const formatado = template
            .replace(/{projeto}/g, nomeProjeto || "Impressão 3D")
            .replace(/{valor}/g, formatCurrency(precoFinalVenda))
            .replace(/{tempo}/g, `${tempoTotalHoras}h`);
        setMensagemEditavel(formatado);
        setWhatsappModal(true);
    };

    const enviarParaWhatsapp = () => {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagemEditavel)}`;
        window.open(url, "_blank");
        setWhatsappModal(false);
    };

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

    return (
        <div className="h-full flex flex-col gap-3 select-none animate-in fade-in duration-500">

            {/* CARD 01: DESEMPENHO FINANCEIRO */}
            <div className="bg-[#0c0c0e] border border-white/[0.05] rounded-3xl p-5 relative overflow-hidden shrink-0">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${saudeProjeto.dot} ${temDados ? 'animate-pulse' : ''} shadow-[0_0_8px_currentColor]`} />
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${saudeProjeto.color}`}>{saudeProjeto.label}</span>
                    </div>
                    {temDados && (
                        <div className="flex gap-3">
                            <div className="text-right">
                                <span className="text-[7px] font-bold text-zinc-600 uppercase block leading-none mb-1">Retorno do Material</span>
                                <span className="text-[10px] font-mono font-bold text-zinc-300">{paybackInsumo}x</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[7px] font-bold text-zinc-600 uppercase block leading-none mb-1">Ganhos por Hora</span>
                                <span className={`text-[10px] font-mono font-bold ${saudeProjeto.color}`}>{formatCurrency(lucroBrutoUnitario / Math.max(1, tempoTotalHoras))}/h</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <h2 className={`text-5xl font-black font-mono tracking-tighter leading-none ${temDados ? 'text-white' : 'text-zinc-800'}`}>
                        {temDados ? <AnimatedNumber value={lucroBrutoUnitario} /> : "R$ 0,00"}
                    </h2>
                    <div className="flex justify-between items-end mt-2">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Lucro Líquido Real</span>
                        <span className={`text-[10px] font-bold font-mono ${temDados ? 'text-zinc-400' : 'text-zinc-800'}`}>{Math.round(margemEfetivaPct)}% DE MARGEM</span>
                    </div>
                </div>

                <div className="h-[2px] w-full bg-zinc-900 rounded-full flex overflow-hidden">
                    <div style={{ width: `${temDados ? (custoUnitario / Math.max(precoFinalVenda, 0.01) * 100) : 0}%` }} className="bg-zinc-800 h-full transition-all duration-1000" />
                    <div style={{ width: `${temDados ? (lucroBrutoUnitario / Math.max(precoFinalVenda, 0.01) * 100) : 0}%` }} className={`${saudeProjeto.bar} h-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
                </div>
            </div>

            {/* CARD 02: PREÇO FINAL DE VENDA */}
            <div className="bg-[#0c0c0e] border border-white/[0.05] rounded-3xl p-5 relative group shrink-0">
                <div className="absolute top-4 right-4 flex gap-2">
                    <button
                        onClick={handleCopyPrice}
                        disabled={!temDados}
                        className={`p-2.5 rounded-xl border border-white/5 transition-all active:scale-90 disabled:opacity-20 ${copiadoPreco ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-zinc-900/50 text-zinc-600 hover:text-sky-400'}`}
                    >
                        {copiadoPreco ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                        onClick={handleSmartRound}
                        disabled={!temDados}
                        className={`p-2.5 rounded-xl border border-white/5 transition-all active:scale-90 disabled:opacity-20 ${precoArredondado ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'bg-zinc-900/50 text-zinc-600 hover:text-sky-400'}`}
                    >
                        <Wand2 size={14} />
                    </button>
                </div>

                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] block mb-3">Preço Sugerido</span>

                <div className="flex flex-col">
                    {possuiDesconto ? (
                        <div className="flex flex-col animate-in slide-in-from-left-2">
                            <span className="text-zinc-600 font-mono text-sm line-through decoration-rose-500/40 mb-1">
                                {formatCurrency(precoSugerido)}
                            </span>
                            <h3 className="text-5xl font-black font-mono tracking-tighter text-white leading-none">
                                <AnimatedNumber value={precoFinalVenda} />
                            </h3>
                        </div>
                    ) : (
                        <h3 className={`text-5xl font-black font-mono tracking-tighter leading-none ${temDados ? 'text-white' : 'text-zinc-800'}`}>
                            {temDados ? <AnimatedNumber value={precoFinalVenda} /> : "R$ 0,00"}
                        </h3>
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
                    {temDados && composicaoItens.length > 0 ? (
                        <div className="py-2 space-y-0.5">
                            {composicaoItens.map((item, i) => (
                                <div key={i} className="flex justify-between py-1.5 border-b border-white/[0.01] last:border-0 group animate-in fade-in slide-in-from-left-1">
                                    <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-2 group-hover:text-zinc-300 transition-colors">
                                        <item.icon size={11} className="shrink-0" /> {item.label}
                                    </span>
                                    <span className={`text-[10px] font-mono font-bold ${item.color || 'text-zinc-300'}`}>{formatCurrency(item.val)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-5">
                            <Calculator size={40} />
                        </div>
                    )}
                </div>
            </div>

            {/* AÇÕES */}
            <div className="flex flex-col gap-2 shrink-0">
                <div className="flex gap-2 h-14">
                    <button
                        onClick={lidarSalvarResumo}
                        disabled={!temDados || estaSalvo || estaGravando}
                        className={`flex-1 rounded-2xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em] transition-all 
                        ${estaSalvo ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-[#0095ff] hover:bg-[#007cd6] text-white shadow-lg shadow-sky-500/10'}`}
                    >
                        {estaGravando ? <Loader2 className="animate-spin" size={16} /> : <Save size={18} />}
                        {estaSalvo ? "PROJETO SALVO" : "GERAR E SALVAR"}
                    </button>
                    <button
                        onClick={abrirModalWhatsapp}
                        disabled={!temDados}
                        className="w-14 h-14 rounded-2xl bg-[#10b981] hover:bg-[#0da472] text-white flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-emerald-500/10 disabled:opacity-20"
                    >
                        <MessageCircle size={24} fill="currentColor" />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-2 h-10">
                    <button 
                        onClick={() => setModalConfig({ 
                            open: true, 
                            type: 'CONFIRM', 
                            title: 'Reiniciar Cálculo', 
                            message: 'Deseja realmente apagar todos os dados inseridos? Esta ação não pode ser desfeita.',
                            onConfirm: () => window.location.reload()
                        })} 
                        className="rounded-xl bg-zinc-900 border border-white/[0.05] text-zinc-600 hover:text-zinc-300 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all"
                    >
                        <RotateCcw size={12} /> Reiniciar
                    </button>
                    <button onClick={() => generateProfessionalPDF(resultados, entradas, precoFinalVenda)} className="rounded-xl bg-zinc-900 border border-white/[0.05] text-zinc-600 hover:text-zinc-300 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all">
                        <FileText size={12} /> Gerar Orçamento
                    </button>
                </div>
            </div>

            {/* MODAL WHATSAPP */}
            <Modal
                isOpen={whatsappModal}
                onClose={() => setWhatsappModal(false)}
                title="Personalizar Mensagem"
                actions={
                    <div className="flex w-full gap-2">
                        <button onClick={() => { navigator.clipboard.writeText(mensagemEditavel); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }} className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase px-4 py-2.5 rounded-xl flex items-center justify-center gap-2">
                            {copiado ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            {copiado ? "Copiado" : "Copiar"}
                        </button>
                        <button onClick={enviarParaWhatsapp} className="flex-[2] bg-[#10b981] text-white text-[10px] font-black uppercase px-6 py-2.5 rounded-xl flex items-center justify-center gap-2">
                            <Send size={14} /> Enviar Agora
                        </button>
                    </div>
                }
            >
                <textarea
                    className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-300 outline-none focus:border-emerald-500/50 transition-all resize-none font-sans leading-relaxed"
                    value={mensagemEditavel}
                    onChange={(e) => setMensagemEditavel(e.target.value)}
                />
            </Modal>

            {/* MODAL DE ALERTA / ERRO / CONFIRMAÇÃO GENÉRICO */}
            <Modal
                isOpen={modalConfig.open}
                onClose={() => setModalConfig({ ...modalConfig, open: false })}
                title={modalConfig.title}
                actions={
                    <div className="flex w-full gap-2">
                        {modalConfig.type === 'CONFIRM' ? (
                            <>
                                <button onClick={() => setModalConfig({ ...modalConfig, open: false })} className="flex-1 text-[10px] font-bold text-zinc-500 uppercase px-4">Cancelar</button>
                                <button onClick={modalConfig.onConfirm} className="flex-1 bg-rose-600 text-white text-[10px] font-black uppercase px-6 py-2.5 rounded-xl">Confirmar</button>
                            </>
                        ) : (
                            <button onClick={() => setModalConfig({ ...modalConfig, open: false })} className="w-full bg-[#0095ff] text-white text-[10px] font-black uppercase px-6 py-2.5 rounded-xl">Entendi</button>
                        )}
                    </div>
                }
            >
                <div className="flex flex-col items-center text-center gap-4">
                    {modalConfig.type === 'ERROR' && <AlertTriangle size={32} className="text-rose-500 opacity-50" />}
                    <p className="text-sm text-zinc-400">{modalConfig.message}</p>
                </div>
            </Modal>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}} />
        </div>
    );
}