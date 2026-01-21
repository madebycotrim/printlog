import React, { useState, useEffect, useMemo, useRef } from "react";
import { formatCurrency, formatDecimal } from "../../../utils/numbers";
// ... imports

// Line 80
import {
    MessageCircle, Target, Package, Zap, Clock, Wrench,
    Landmark, RotateCcw, Send, Copy, Check, Settings2,
    Truck, ShoppingBag, Tag, ShieldAlert, Box, AlertTriangle,
    CheckCircle2, Wand2, Save, Loader2, FileText,
    PieChart, List as ListIcon, Camera, TrendingUp, TrendingDown
} from "lucide-react";

import { useCalculatorStore } from "../../../stores/calculatorStore";
import { generateProfessionalPDF } from "../../../utils/pdfGenerator";
import { useSettings } from "../../sistema/logic/settingsQueries";
import Modal from "../../../components/ui/Modal";
import { CHART_COLORS } from "../logic/chartColors";

/* ---------- SUB-COMPONENTE: NÚMERO ANIMADO ---------- */
const AnimatedNumber = ({ value, duration = 800, className }) => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps -- displayValue excluído intencionalmente para evitar loop infinito
    }, [value, duration]);

    return <span className={className}>{formatDecimal(displayValue, 2)}</span>;
};

/* ---------- SUB-COMPONENTE: GRÁFICO DE ROSCA SVG ---------- */
const DonutChart = ({ data, total }) => {
    let accumulatedAngle = 0;
    const radius = 16;
    const circumference = 2 * Math.PI * radius;



    return (
        <div className="relative w-48 h-48 flex items-center justify-center mx-auto my-6">
            <svg viewBox="0 0 40 40" className="w-full h-full transform -rotate-90">
                {/* Track Circle (Fundo escuro para dar profundidade) */}
                <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#18181b" strokeWidth="5" />

                {data.map((item, index) => {
                    const percentage = (item.val / total) * 100;
                    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((accumulatedAngle / 360) * circumference);
                    accumulatedAngle += (percentage / 100) * 360;
                    const color = item.hex;

                    return (
                        <circle
                            key={index}
                            cx="20" cy="20" r={radius}
                            fill="transparent"
                            stroke={color}
                            strokeWidth="5"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap={percentage > 3 ? "round" : "butt"}
                            className="transition-all duration-500 hover:opacity-80"
                        />
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Custo Total</span>
                <span className="text-xl font-mono font-black text-white tracking-tight">{formatCurrency(total)}</span>
            </div>
        </div>
    );
};

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function Resumo({ resultados = {}, entradas = {}, salvar = () => { } }) {
    const { dadosFormulario, atualizarCampo } = useCalculatorStore();

    const {
        lucroBrutoUnitario = 0, precoSugerido = 0, precoComDesconto = 0, tempoTotalHoras = 0,
        custoMaterial = 0, custoEnergia = 0, custoMaquina = 0, custoMaoDeObra = 0,
        custoSetup = 0, valorImpostos = 0, valorMarketplace = 0, margemEfetivaPct = 0,
        custoUnitario = 0, custoEmbalagem = 0, custoFrete = 0, custosExtras = 0,
        valorRisco = 0
    } = resultados;

    // Atualizar margem ao usar o slider
    const handleMargemChange = (e) => {
        atualizarCampo('config', 'margemLucro', parseFloat(e.target.value));
    };

    const { data: settings } = useSettings();

    const [estaSalvo, setEstaSalvo] = useState(false);
    const [estaGravando, setEstaGravando] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'chart'

    // ESTADO DO SNAPSHOT (GLOBAL VIA ZUSTAND)
    const { snapshot, setSnapshot, clearSnapshot } = useCalculatorStore();
    // const [snapshot, setSnapshot] = useState(null); // REMOVIDO EM FAVOR DO STORE GLOBAL

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

    // Lógica do Snapshot
    const handleToggleSnapshot = () => {
        if (snapshot) {
            clearSnapshot();
        } else {
            setSnapshot({
                precoFinalVenda,
                lucroBrutoUnitario,
                margemEfetivaPct,
                paybackInsumo: parseFloat(paybackInsumo) || 0
            });
        }
    };

    const deltaPreco = snapshot ? precoFinalVenda - snapshot.precoFinalVenda : 0;
    const deltaLucro = snapshot ? lucroBrutoUnitario - snapshot.lucroBrutoUnitario : 0;
    const deltaMargem = snapshot ? margemEfetivaPct - snapshot.margemEfetivaPct : 0;

    // Resetar estado local apenas quando o projeto mudar de fato (pelo nome)
    // ou se houver uma mudança drástica no preço final (opcional, mas ajuda a limpar estados visuais antigos)
    useEffect(() => {
        setEstaSalvo(false);
        setPrecoArredondado(null);
    }, [nomeProjeto]); // Depende apenas do nome do projeto agora, muito mais estável

    const paybackInsumo = useMemo(() => {
        if (!custoMaterial || custoMaterial < 0.001 || !lucroBrutoUnitario || lucroBrutoUnitario < 0) return 0;
        const resultado = lucroBrutoUnitario / custoMaterial;
        return isFinite(resultado) && !isNaN(resultado) ? formatDecimal(resultado, 1) : "0,0";
    }, [custoMaterial, lucroBrutoUnitario]);

    const saudeProjeto = useMemo(() => {
        if (!temMaterial) return { label: "Aguardando", color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-800" };
        // Lógica simplificada sem o painel visual pesado
        if (margemEfetivaPct <= 0) return { label: "Prejuízo", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/50" };
        return { label: "Simulação", color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/50" };
    }, [temMaterial, margemEfetivaPct]);


    // MAPA DE CORES CENTRALIZADO
    const composicaoItens = useMemo(() => {
        return [
            { label: 'Material', val: custoMaterial, icon: Package, color: CHART_COLORS.material.class, hex: CHART_COLORS.material.hex },
            { label: 'Impostos', val: valorImpostos, icon: Landmark, color: CHART_COLORS.impostos.class, hex: CHART_COLORS.impostos.hex },
            { label: 'Comissão', val: valorMarketplace, icon: ShoppingBag, color: CHART_COLORS.comissao.class, hex: CHART_COLORS.comissao.hex },
            { label: 'Energia', val: custoEnergia, icon: Zap, color: CHART_COLORS.energia.class, hex: CHART_COLORS.energia.hex },
            { label: 'Depreciação', val: custoMaquina, icon: Clock, color: CHART_COLORS.depreciacao.class, hex: CHART_COLORS.depreciacao.hex },
            { label: 'Mão de Obra', val: custoMaoDeObra, icon: Wrench, color: CHART_COLORS.maoDeObra.class, hex: CHART_COLORS.maoDeObra.hex },
            { label: 'Margem de Erro', val: valorRisco, icon: ShieldAlert, color: CHART_COLORS.margemErro.class, hex: CHART_COLORS.margemErro.hex },
            { label: 'Embalagem', val: custoEmbalagem, icon: Box, color: CHART_COLORS.embalagem.class, hex: CHART_COLORS.embalagem.hex },
            { label: 'Frete', val: custoFrete, icon: Truck, color: CHART_COLORS.frete.class, hex: CHART_COLORS.frete.hex },
            { label: 'Setup', val: custoSetup, icon: Settings2, color: CHART_COLORS.setup.class, hex: CHART_COLORS.setup.hex },
            { label: 'Custos Extras', val: custosExtras, icon: Tag, color: CHART_COLORS.extras.class, hex: CHART_COLORS.extras.hex }
        ].filter(item => item.val > 0.009).sort((a, b) => b.val - a.val);
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
        catch (_error) { setGenericModal({ open: true, type: 'ERROR', title: 'Erro', icon: AlertTriangle, message: 'Falha ao salvar.' }); }
        finally { setEstaGravando(false); }
    };

    return (
        <div className="h-full flex flex-col gap-3 animate-in fade-in duration-500 pb-20 lg:pb-0">

            {/* --- BLOCO PRINCIPAL: PRESIFICAÇÃO E METRICAS --- */}
            <div className="shrink-0 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
                {/* Background decorative */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-900/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                {/* Topo: Status e Ferramentas */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md border ${saudeProjeto.bg} ${saudeProjeto.border}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${saudeProjeto.color.replace('text', 'bg')} animate-pulse`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${saudeProjeto.color}`}>{saudeProjeto.label}</span>
                    </div>

                    <div className="flex gap-1">
                        {/* BOTÃO FREEZE / COMPARAÇÃO */}
                        <button
                            onClick={handleToggleSnapshot}
                            disabled={!temMaterial}
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all disabled:opacity-30 ${snapshot
                                ? "bg-sky-500 text-white border-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.5)] animate-pulse"
                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-sky-400 hover:border-sky-500/30"
                                }`}
                            title={snapshot ? "Parar Comparação" : "Comparar Orçamentos"}
                        >
                            <Camera size={14} strokeWidth={2.5} />
                        </button>

                        <button
                            onClick={() => { const current = precoFinalVenda; const val = Math.floor(current); const cents = Number((current % 1).toFixed(2)); setPrecoArredondado(cents < 0.90 ? val + 0.90 : val + 1.90); }}
                            disabled={!temMaterial}
                            className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-sky-400 hover:border-sky-500/30 flex items-center justify-center transition-all disabled:opacity-30"
                            title="Arredondar Valor"
                        >
                            <Wand2 size={14} strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={() => { navigator.clipboard.writeText(precoFinalVenda.toFixed(2)); setCopiadoPreco(true); setTimeout(() => setCopiadoPreco(false), 2000); }}
                            disabled={!temMaterial}
                            className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 flex items-center justify-center transition-all disabled:opacity-30"
                            title="Copiar Valor"
                        >
                            {copiadoPreco ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                    </div>
                </div>

                {/* Preço de Venda */}
                <div className="mb-6 relative z-10">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Sugestão de Venda</span>
                    {temMaterial ? (
                        <div className="flex flex-col">
                            {/* Preço Original e Badge de Desconto */}
                            {possuiDesconto && (
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm font-medium text-zinc-500 line-through decoration-zinc-600 decoration-1">
                                        {formatCurrency(precoSugerido)}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wide">
                                        -{Math.round(((precoSugerido - precoFinalVenda) / precoSugerido) * 100)}%
                                    </span>
                                </div>
                            )}

                            <div className="flex items-baseline gap-1">
                                <span className="text-zinc-600 text-xl font-light">R$</span>
                                <AnimatedNumber
                                    value={precoFinalVenda}
                                    className="text-5xl font-black tracking-tighter text-white font-mono"
                                />
                            </div>

                            {/* COMPARAÇÃO COM SNAPSHOT (MELHORADA) */}
                            {snapshot && (
                                <div className="mt-2 p-2 bg-sky-500/10 border border-sky-500/20 rounded-lg flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-sky-400 uppercase font-bold tracking-wider">Referência</span>
                                        <span className="text-xs text-sky-300 font-mono font-bold">{formatCurrency(snapshot.precoFinalVenda)}</span>
                                    </div>

                                    {Math.abs(deltaPreco) > 0.01 ? (
                                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${deltaPreco > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                                            {deltaPreco > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            <span className="text-xs font-bold font-mono">
                                                {deltaPreco > 0 ? "+" : ""}{formatCurrency(deltaPreco)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Igual</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="text-5xl font-black tracking-tighter text-zinc-800 select-none">--,--</span>
                    )}
                </div>

                {/* Grid de KPIs e Configurador de Margem */}
                <div className="border-t border-zinc-900 pt-3 relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                            Margem: {dadosFormulario?.config?.margemLucro}%
                        </span>
                        <input
                            type="range"
                            min="0" max="300" step="5"
                            value={dadosFormulario?.config?.margemLucro || 0}
                            onChange={handleMargemChange}
                            className="w-24 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Lucro</span>
                            <div className="flex flex-col">
                                <span className="text-emerald-500 font-bold font-mono text-sm">
                                    {temMaterial ? formatCurrency(lucroBrutoUnitario) : '--'}
                                </span>
                                {snapshot && Math.abs(deltaLucro) > 0.01 && (
                                    <span className={`text-[8px] font-mono font-bold ${deltaLucro > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                        {deltaLucro > 0 ? "+" : ""}{formatCurrency(deltaLucro)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Margem</span>
                            <div className="flex flex-col">
                                <span className={`font-bold font-mono text-sm ${margemEfetivaPct > 15 ? 'text-zinc-300' : 'text-amber-500'}`}>
                                    {temMaterial ? `${Math.round(margemEfetivaPct)}%` : '--'}
                                </span>
                                {snapshot && Math.abs(deltaMargem) > 0.1 && (
                                    <span className={`text-[8px] font-mono font-bold ${deltaMargem > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                        {deltaMargem > 0 ? "+" : ""}{deltaMargem.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Retorno</span>
                            <div className="text-zinc-400 font-bold font-mono text-sm">
                                {temMaterial ? `${paybackInsumo}x` : '--'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- LISTA vs GRÁFICO (TOGGLE) --- */}
            <div className="flex-1 min-h-0 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Custos</span>
                        <span className="text-[10px] font-mono font-bold text-zinc-600">({temMaterial ? composicaoItens.length : 0})</span>
                    </div>

                    {/* Toggle View */}
                    <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-400'}`}
                            title="Lista"
                        >
                            <ListIcon size={12} />
                        </button>
                        <button
                            onClick={() => setViewMode('chart')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'chart' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-400'}`}
                            title="Gráfico"
                        >
                            <PieChart size={12} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {temMaterial && composicaoItens.length > 0 ? (
                        viewMode === 'list' ? (
                            <div className="space-y-0.5">
                                {composicaoItens.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-900/50 transition-colors group">
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                            <item.icon size={12} className={`${item.color} shrink-0`} />
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide truncate group-hover:text-zinc-300 transition-colors">{item.label}</span>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="hidden sm:block w-12 h-1 bg-zinc-900 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.color.replace('text', 'bg')}`}
                                                    style={{ width: `${Math.min(100, (item.val / custoUnitario) * 100)}%` }}
                                                />
                                            </div>
                                            <span className={`text-[11px] font-mono font-bold ${item.color} min-w-[3rem] text-right`}>
                                                {formatCurrency(item.val)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in-95 duration-300 pb-4">
                                <DonutChart data={composicaoItens} total={custoUnitario} />

                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full px-4">
                                    {composicaoItens.map((item, i) => {
                                        // Helper para pegar a cor hexadecimal também aqui
                                        const hexColor = item.hex;
                                        const Icon = item.icon;

                                        return (
                                            <div key={i} className="flex items-center gap-2">
                                                <Icon size={16} strokeWidth={2.5} style={{ color: hexColor }} className="shrink-0" />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[10px] text-zinc-300 font-bold uppercase truncate leading-none">{item.label}</span>
                                                    <span className="text-[9px] text-zinc-500 font-mono mt-0.5">{((item.val / custoUnitario) * 100).toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-2 opacity-30">
                            <Box size={20} />
                            <span className="text-[9px] font-bold uppercase">Sem custos</span>
                        </div>
                    )}
                </div>
            </div>

            {/* --- FOOTER SIMPLIFICADO --- */}
            <div className="shrink-0 flex gap-2">
                <button
                    onClick={lidarSalvarResumo}
                    disabled={!temMaterial || estaSalvo || estaGravando}
                    className={`flex-1 h-11 rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 ${estaSalvo ? 'bg-zinc-900 text-emerald-500 border border-emerald-500/20' : 'bg-zinc-100 hover:bg-white text-black shadow-lg shadow-zinc-100/10'}`}
                >
                    {estaGravando ? <Loader2 className="animate-spin" size={14} /> : estaSalvo ? <CheckCircle2 size={14} /> : <Save size={14} />}
                    {estaSalvo ? "Salvo" : "Salvar"}
                </button>

                <button
                    onClick={() => { if (temMaterial) { const template = settings?.whatsappTemplate || "Olá! Segue orçamento: *{valor}*"; setMensagemEditavel(template.replace(/{projeto}/g, nomeProjeto || "3D").replace(/{valor}/g, formatCurrency(precoFinalVenda)).replace(/{tempo}/g, `${tempoTotalHoras}h`)); setWhatsappModal(true); } }}
                    disabled={!temMaterial}
                    className="aspect-square h-11 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 flex items-center justify-center transition-all disabled:opacity-30"
                    title="WhatsApp"
                >
                    <MessageCircle size={16} />
                </button>

                <button
                    onClick={() => generateProfessionalPDF(resultados, entradas, precoFinalVenda)}
                    disabled={!temMaterial}
                    className="aspect-square h-11 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-sky-500 hover:border-sky-500/30 flex items-center justify-center transition-all disabled:opacity-30"
                    title="PDF"
                >
                    <FileText size={16} />
                </button>
            </div>

            {/* --- MODAIS (MANTIDOS IGUAIS) --- */}
            <Modal
                isOpen={showSuccessPopup}
                onClose={() => setShowSuccessPopup(false)}
                title="Orçamento Salvo!"
                icon={CheckCircle2}
                footer={
                    <button onClick={() => setShowSuccessPopup(false)} className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">
                        Continuar
                    </button>
                }
            >
                <div className="p-8 space-y-6 text-center">
                    <h3 className="text-lg font-bold text-white mb-1">{nomeProjeto || "Projeto Sem Nome"}</h3>
                    <p className="text-xs text-zinc-400">Dados salvos com sucesso no histórico.</p>
                </div>
            </Modal>

            <Modal isOpen={whatsappModal} onClose={() => setWhatsappModal(false)}
                title="Enviar WhatsApp"
                icon={MessageCircle}
                footer={
                    <div className="flex w-full gap-2">
                        <button onClick={() => { navigator.clipboard.writeText(mensagemEditavel); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }} className="flex-1 bg-zinc-950/40 border border-zinc-800/50 text-zinc-400 text-[10px] font-black uppercase h-12 rounded-xl flex items-center justify-center gap-2">
                            {copiado ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            {copiado ? "Copiado" : "Copiar"}
                        </button>
                        <button onClick={() => { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensagemEditavel)}`, "_blank"); setWhatsappModal(false); }} className="flex-[2] bg-emerald-600 text-white text-[10px] font-black uppercase h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                            <Send size={14} /> Enviar
                        </button>
                    </div>
                }>
                <div className="p-6">
                    <textarea className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-300 outline-none focus:border-emerald-500/50 transition-all resize-none font-sans" value={mensagemEditavel} onChange={(e) => setMensagemEditavel(e.target.value)} />
                </div>
            </Modal>

            <Modal isOpen={genericModal.open} onClose={() => setGenericModal({ ...genericModal, open: false })}
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
            </Modal>
        </div>
    );
}
