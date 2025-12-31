// src/features/calculadora/components/Summary.jsx
import React, { useState, useEffect, useMemo } from "react";
import { formatCurrency } from "../../../utils/numbers";
import {
    Save, CircleDashed, Calculator, ShieldCheck,
    Activity, FileText, Loader2, AlertTriangle, TrendingUp,
    Check, HelpCircle, RotateCcw, Package, Zap, Clock, Truck, Wrench, Landmark, Store
} from "lucide-react";

import { generateProfessionalPDF } from "../../../utils/pdfGenerator";

/* ---------- COMPONENTE: LINHA DE DETALHAMENTO ---------- */
const LinhaResumo = ({ icon: Icon, label, value, total, color = "text-zinc-200" }) => {
    const valorNumerico = Number(value || 0);
    const valorTotal = Number(total || 0);
    
    // Oculta linhas com valores irrelevantes
    if (valorNumerico < 0.01) return null;
    
    // Cálculo do peso percentual deste custo sobre o preço de venda
    const percentual = valorTotal > 0 ? Math.round((valorNumerico / valorTotal) * 100) : 0;

    return (
        <div className="flex items-center justify-between px-3 -mx-1 py-1.5 rounded-lg group hover:bg-white/5 transition-all duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="rounded bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-sky-400 w-7 h-7 shrink-0 transition-colors">
                    <Icon size={12} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-zinc-500 uppercase tracking-widest truncate group-hover:text-zinc-300 text-[9px]">{label}</span>
            </div>
            <div className="text-right shrink-0">
                <span className={`block font-mono font-bold leading-none text-xs ${color}`}>{formatCurrency(valorNumerico)}</span>
                <span className="text-[7px] font-black text-zinc-600 uppercase tracking-tighter">{percentual}% da venda</span>
            </div>
        </div>
    );
};

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function Resumo({ resultados = {}, entradas = {}, salvar = () => { } }) {
    const {
        custoUnitario = 0, precoSugerido = 0, precoComDesconto = 0, margemEfetivaPct = 0,
        lucroBrutoUnitario = 0, custoMaterial = 0, custoEnergia = 0, custoMaquina = 0,
        custoMaoDeObra = 0, custoEmbalagem = 0, custoFrete = 0, custoSetup = 0,
        valorImpostos = 0, valorMarketplace = 0, valorRisco = 0, tempoTotalHoras = 0
    } = resultados;

    const [estaSalvo, setEstaSalvo] = useState(false);
    const [estaGravando, setEstaGravando] = useState(false);

    // Reseta o estado visual de "Salvo" se houver qualquer alteração nos inputs ou resultados
    useEffect(() => { 
        setEstaSalvo(false); 
    }, [entradas, resultados.precoSugerido]);

    const lidarSalvar = async () => {
        setEstaGravando(true);
        try { 
            await salvar(); 
            setEstaSalvo(true); 
        } catch (erro) { 
            console.error("Erro ao persistir cálculo:", erro); 
        } finally { 
            setEstaGravando(false); 
        }
    };

    const lidarNovoCalculo = () => {
        if (window.confirm("Deseja limpar todos os campos e iniciar um novo cálculo?")) {
            window.location.reload(); 
        }
    };

    // VALIDAÇÃO DE DADOS MÍNIMOS PARA EXIBIÇÃO
    const temDadosSuficientes = useMemo(() => {
        const material = entradas.material || {};
        const peso = Number(material.pesoModelo) ||
            (material.slots?.reduce((acc, s) => acc + (Number(s.weight) || 0), 0)) || 0;
        
        const tempo = (Number(entradas.tempo?.impressaoHoras) || 0) + (Number(entradas.tempo?.impressaoMinutos) || 0);
        
        return peso > 0 && tempo > 0;
    }, [entradas]);

    const precoFinalVenda = temDadosSuficientes ? Number(precoComDesconto || precoSugerido || 0) : 0;
    const possuiDesconto = precoComDesconto > 0 && precoComDesconto < (precoSugerido - 0.01);
    const estaNeutro = !temDadosSuficientes || precoFinalVenda <= 0.01;

    // MÉTRICA FINANCEIRA: Ganho por Hora (Efetividade do tempo)
    const ganhoPorHora = useMemo(() => {
        if (estaNeutro || tempoTotalHoras <= 0) return 0;
        return lucroBrutoUnitario / tempoTotalHoras;
    }, [estaNeutro, lucroBrutoUnitario, tempoTotalHoras]);

    // INDICADOR VISUAL DE SAÚDE DO PROJETO
    const saudeProjeto = useMemo(() => {
        if (estaNeutro) return { label: "AGUARDANDO DADOS", color: "text-zinc-600", glow: "border-zinc-800", bg: "bg-zinc-900/20", icon: CircleDashed, bar: "bg-zinc-800" };
        if (margemEfetivaPct <= 0) return { label: "🔴 OPERAÇÃO INVIÁVEL", color: "text-rose-500", glow: "border-rose-500 animate-pulse", bg: "bg-rose-500/5", icon: AlertTriangle, bar: "bg-rose-500" };
        if (margemEfetivaPct < 15) return { label: "🟡 MARGEM APERTADA", color: "text-amber-500", glow: "border-amber-500/50", bg: "bg-amber-500/5", icon: Activity, bar: "bg-amber-500" };
        return { label: "🟢 PROJETO SAUDÁVEL", color: "text-emerald-500", glow: "border-emerald-500/50", bg: "bg-emerald-500/5", icon: ShieldCheck, bar: "bg-emerald-500" };
    }, [estaNeutro, margemEfetivaPct]);

    // Cálculo da proporção visual Custo vs Lucro
    const somaEncargosVenda = valorImpostos + valorMarketplace;
    const custoTotalReal = custoUnitario + somaEncargosVenda;
    const percentualCusto = precoFinalVenda <= 0 ? 0 : Math.min(100, Math.round((custoTotalReal / precoFinalVenda) * 100));
    const percentualLucro = Math.max(0, 100 - percentualCusto);

    return (
        <div className="h-full flex flex-col gap-3 select-none animate-in fade-in duration-700">

            {/* CARD 01: PERFORMANCE E LUCRO LÍQUIDO */}
            <div className={`relative rounded-2xl border-2 p-5 transition-all duration-500 ${saudeProjeto.bg} ${saudeProjeto.glow} backdrop-blur-md`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <saudeProjeto.icon size={14} className={saudeProjeto.color} />
                        <span className={`text-[10px] font-black tracking-[0.2em] ${saudeProjeto.color}`}>{saudeProjeto.label}</span>
                    </div>
                    {!estaNeutro && (
                        <div className="text-right">
                            <span className="text-[7px] font-black text-zinc-500 uppercase block leading-none mb-1">Ganho por Hora</span>
                            <span className={`text-[11px] font-mono font-bold ${saudeProjeto.color}`}>
                                {formatCurrency(ganhoPorHora)}/h
                            </span>
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <h2 className={`text-5xl font-black font-mono tracking-tighter ${estaNeutro ? 'text-zinc-800' : 'text-white'}`}>
                        {estaNeutro ? formatCurrency(0) : formatCurrency(lucroBrutoUnitario)}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Lucro Líquido Real</p>
                        {!estaNeutro && (
                            <div className="flex items-center gap-1">
                                <TrendingUp size={10} className={saudeProjeto.color} />
                                <span className={`text-[10px] font-mono font-bold ${saudeProjeto.color}`}>{Math.round(margemEfetivaPct)}%</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Barra de Progresso Comparativa */}
                <div className="h-1.5 w-full bg-zinc-950/80 rounded-full overflow-hidden flex p-[1px] border border-white/5">
                    <div style={{ width: `${percentualCusto}%` }} className="bg-zinc-700 h-full transition-all duration-1000" />
                    <div style={{ width: `${percentualLucro}%` }} className={`${saudeProjeto.bar} h-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.3)]`} />
                </div>
                <div className="flex justify-between mt-2">
                    <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Despesas ({estaNeutro ? 0 : percentualCusto}%)</span>
                    <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Lucro ({estaNeutro ? 0 : percentualLucro}%)</span>
                </div>
            </div>

            {/* CARD 02: PREÇO FINAL (EXIBIÇÃO COMERCIAL) */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl py-5 px-6 relative overflow-hidden group hover:border-sky-500/40 transition-all text-center">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.4em] block mb-3 group-hover:text-sky-400 transition-colors">Valor Final de Venda</span>

                <div className="flex flex-col items-center">
                    {possuiDesconto && (
                        <div className="flex items-center gap-2 mb-1 animate-in slide-in-from-top-2">
                            <span className="text-zinc-600 font-mono text-base line-through decoration-rose-500/40">
                                {formatCurrency(precoSugerido)}
                            </span>
                            <div className="bg-sky-500/10 text-sky-500 text-[8px] px-2 py-0.5 rounded border border-sky-500/20 font-black tracking-tighter">
                                COM DESCONTO
                            </div>
                        </div>
                    )}
                    <span className={`text-5xl font-black font-mono tracking-tighter ${estaNeutro ? 'text-zinc-800' : 'text-white'}`}>
                        {formatCurrency(precoFinalVenda)}
                    </span>
                </div>
                {possuiDesconto && <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 blur-3xl rounded-full -mr-12 -mt-12" />}
            </div>

            {/* CARD 03: DETALHAMENTO TÉCNICO */}
            <div className="flex-1 bg-zinc-950/20 border border-white/5 rounded-2xl flex flex-col overflow-hidden backdrop-blur-md">
                <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Distribuição de Custos</h3>
                    <div className="group/help relative cursor-help">
                        <HelpCircle size={12} className="text-zinc-700 hover:text-zinc-500" />
                        <div className="absolute right-0 top-5 w-48 p-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl invisible group-hover/help:visible opacity-0 group-hover/help:opacity-100 transition-all z-50">
                           <p className="text-[7px] text-zinc-400 uppercase font-bold leading-tight">Cálculos baseados no Método do Divisor, garantindo que suas taxas não consumam seu lucro líquido.</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
                    {temDadosSuficientes ? (
                        <>
                            {/* Custos Diretos */}
                            <div>
                                <h4 className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-zinc-600" /> Produção Direta
                                </h4>
                                <LinhaResumo icon={Package} label="Materiais Insumos" value={custoMaterial} total={precoFinalVenda} />
                                <LinhaResumo icon={Zap} label="Consumo Elétrico" value={custoEnergia} total={precoFinalVenda} />
                                <LinhaResumo icon={Clock} label="Depreciação Máquina" value={custoMaquina} total={precoFinalVenda} />
                                <LinhaResumo icon={Wrench} label="Trabalho e Setup" value={custoMaoDeObra + custoSetup} total={precoFinalVenda} />
                                <LinhaResumo icon={ShieldCheck} label="Fundo de Falhas" value={valorRisco} total={precoFinalVenda} color="text-amber-400/70" />
                            </div>

                            {/* Logística */}
                            {(custoEmbalagem > 0 || custoFrete > 0) && (
                                <div>
                                    <h4 className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-zinc-600" /> Logística Interna
                                    </h4>
                                    <LinhaResumo icon={Truck} label="Embalagem e Frete" value={custoEmbalagem + custoFrete} total={precoFinalVenda} />
                                </div>
                            )}

                            {/* Impostos e Taxas */}
                            <div>
                                <h4 className="text-[7px] font-black text-rose-900 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-rose-900" /> Taxas de Venda
                                </h4>
                                <LinhaResumo icon={Landmark} label="Impostos e Tributos" value={valorImpostos} total={precoFinalVenda} color="text-rose-400/80" />
                                <LinhaResumo icon={Store} label="Comissão Plataforma" value={valorMarketplace} total={precoFinalVenda} color="text-rose-400/80" />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-800 gap-3 opacity-30">
                            <Calculator size={32} strokeWidth={1} />
                            <span className="text-[9px] uppercase font-black tracking-[0.4em]">Aguardando Dados</span>
                        </div>
                    )}
                </div>

                {/* Rodapé do Detalhamento */}
                <div className="p-4 bg-zinc-900/80 border-t border-white/5 flex justify-between items-center">
                    <div>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block leading-none">Custo Operacional</span>
                        <span className="text-[7px] text-zinc-600 uppercase font-bold italic">Base de Cálculo</span>
                    </div>
                    <span className={`text-lg font-black font-mono ${estaNeutro ? 'text-zinc-800' : 'text-zinc-200'}`}>
                        {temDadosSuficientes ? formatCurrency(custoTotalReal) : formatCurrency(0)}
                    </span>
                </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex flex-col gap-3 pt-2">
                <button
                    type="button"
                    onClick={lidarSalvar}
                    disabled={estaNeutro || estaSalvo || estaGravando}
                    className={`h-14 w-full rounded-xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all
                    ${estaSalvo
                            ? "bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 cursor-default"
                            : "bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/20 active:scale-95 disabled:bg-zinc-900 disabled:text-zinc-700 disabled:border-transparent"}
                    `}
                >
                    {estaGravando ? <Loader2 size={20} className="animate-spin" /> : estaSalvo ? <Check size={20} strokeWidth={3} /> : <Calculator size={20} />}
                    {estaGravando ? "SALVANDO..." : estaSalvo ? "CÁLCULO ARQUIVADO" : "GERAR ORÇAMENTO E SALVAR"}
                </button>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={lidarNovoCalculo}
                        className="h-12 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <RotateCcw size={14} />
                        Reiniciar
                    </button>

                    <button
                        type="button"
                        onClick={() => generateProfessionalPDF(resultados, entradas)}
                        disabled={estaNeutro}
                        className="h-12 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-sky-500/50 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-30"
                    >
                        <FileText size={16} />
                        Gerar PDF
                    </button>
                </div>
            </div>
        </div>
    );
}