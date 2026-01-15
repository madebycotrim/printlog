import React, { useState, useEffect, useCallback } from "react";
import { X, AlertTriangle, Activity, Terminal, ArrowDownToLine, Loader2, TrendingDown } from "lucide-react";
import SpoolSideView from "./Carretel";
import { parseNumber } from "../../../utils/numbers";
import { useToastStore } from "../../../stores/toastStore";

export default function ModalBaixaRapida({ aberto, aoFechar, item, aoSalvar }) {
    const [consumo, setConsumo] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Reinicia o estado ao abrir o modal
    useEffect(() => {
        if (aberto) {
            setConsumo("");
            setIsSaving(false);
        }
    }, [aberto]);

    // Lógica de cálculo centralizada e segura
    const capacidade = Math.max(1, Number(item?.peso_total) || 1000);
    const pesoAnterior = Number(item?.peso_atual) || 0;
    const qtdConsumo = Math.max(0, parseNumber(consumo) || 0);

    // Cálculo do peso final (Trava em zero e evita problemas de dízimas)
    const pesoFinal = Math.max(0, parseFloat((pesoAnterior - qtdConsumo).toFixed(2)));

    // Percentuais para a interface
    const pctAtual = Math.min(100, Math.max(0, (pesoAnterior / capacidade) * 100));
    const pctFinal = Math.min(100, Math.max(0, (pesoFinal / capacidade) * 100));

    // Validações de estado
    const erroSaldoNegativo = (pesoAnterior - qtdConsumo) < 0;
    const isEstoqueCritico = pesoFinal > 0 && (pesoFinal / capacidade) < 0.1;
    const inputValido = consumo !== "" && qtdConsumo > 0;

    const corFilamento = item?.cor_hex || "#3b82f6";

    // Confirmação de fechamento caso haja algo digitado
    const handleTentativaFechar = useCallback(() => {
        if (isSaving) return;
        if (consumo !== "" && consumo !== "0") {
            if (window.confirm("Você tem alterações não salvas. Deseja realmente sair?")) {
                aoFechar();
            }
        } else {
            aoFechar();
        }
    }, [consumo, aoFechar, isSaving]);

    const confirmar = useCallback(async () => {
        if (!inputValido || erroSaldoNegativo || isSaving) return;

        try {
            setIsSaving(true);
            await aoSalvar({
                ...item,
                peso_atual: pesoFinal
            });
            aoFechar();
        } catch (error) {
            console.error("Erro ao processar baixa de estoque:", error);
            useToastStore.getState().addToast("Erro ao processar baixa de estoque.", "error");
        } finally {
            setIsSaving(false);
        }
    }, [inputValido, erroSaldoNegativo, isSaving, item, pesoFinal, aoSalvar, aoFechar]);

    // Atalhos de teclado para agilizar o uso
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter" && inputValido && !erroSaldoNegativo && !isSaving) {
                confirmar();
            }
            if (e.key === "Escape" && !isSaving) {
                handleTentativaFechar();
            }
        };
        if (aberto) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [aberto, inputValido, erroSaldoNegativo, isSaving, confirmar, handleTentativaFechar]);

    if (!aberto || !item) return null;

    const adicionarConsumo = (valor) => {
        if (isSaving) return;
        const atual = parseNumber(consumo) || 0;
        setConsumo((atual + valor).toString());
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Camada de fundo */}
            <div className={`absolute inset-0 z-0 ${isSaving ? 'cursor-wait' : 'cursor-pointer'}`} onClick={handleTentativaFechar} />

            <div className={`relative bg-zinc-950 border border-zinc-800/80 rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] z-10 transition-all duration-300 ${isSaving ? 'opacity-90 scale-[0.99] grayscale-[0.2]' : ''}`}>

                {/* --- BARRA LATERAL --- */}
                <div className="w-full md:w-[320px] bg-zinc-950/40/30 border-r border-zinc-800/50 p-10 flex flex-col justify-between shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-30 select-none">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)`,
                            backgroundSize: '40px 40px',
                            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                        }} />
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                            <div className="h-px w-4 bg-zinc-900/50" />
                            Prévia
                            <div className="h-px w-4 bg-zinc-900/50" />
                        </div>

                        <div className="relative group p-12 rounded-[2.5rem] bg-zinc-950/50 border border-zinc-800 shadow-inner flex items-center justify-center backdrop-blur-sm">
                            <div className="absolute inset-0 bg-zinc-500/5 blur-3xl rounded-full" />
                            <div className="relative scale-110">
                                <SpoolSideView color={corFilamento} percent={pctFinal} size={110} />
                            </div>
                        </div>

                        <div className="text-center space-y-1">
                            <h3 className="text-xl font-bold text-zinc-100 tracking-tight truncate px-2 leading-none">
                                {item.nome}
                            </h3>
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-800/50 inline-block">
                                {item.material} • {item.marca}
                            </span>
                        </div>
                    </div>

                    <div className={`${erroSaldoNegativo ? 'border-rose-500/40 bg-rose-500/10' : 'border-zinc-800 bg-zinc-950/50'} border rounded-2xl p-5 backdrop-blur-md relative z-10 shadow-xl transition-all duration-300`}>
                        <div className="flex items-center gap-2 mb-3">
                            <Activity size={12} className={erroSaldoNegativo ? 'text-rose-500' : 'text-emerald-500/50'} />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Cálculo de Massa</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase mb-1">Anterior</p>
                                    <p className="text-sm font-bold text-zinc-500 font-mono leading-none">{Math.round(pesoAnterior)}g</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase mb-1">Novo Saldo</p>
                                    <p className={`text-2xl font-bold font-mono leading-none ${erroSaldoNegativo ? 'text-rose-500' : 'text-zinc-100'}`}>
                                        {Math.round(pesoFinal)}<span className="text-xs ml-1 text-zinc-500 font-sans">g</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CONTEÚDO PRINCIPAL --- */}
                <div className="flex-1 flex flex-col bg-zinc-950">
                    <header className="px-10 py-6 border-b border-zinc-800/50 bg-zinc-950/40/10 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800">
                                <TrendingDown className="text-zinc-400" size={18} />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">Baixa de Estoque</h3>
                                <p className="text-[10px] text-zinc-500 font-medium mt-1">Registre o consumo de material da última impressão</p>
                            </div>
                        </div>
                        <button disabled={isSaving} onClick={handleTentativaFechar} className="p-2 rounded-full hover:bg-zinc-950/40 text-zinc-500 transition-all disabled:opacity-20">
                            <X size={20} />
                        </button>
                    </header>

                    <div className={`p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8 ${isSaving ? 'pointer-events-none opacity-50' : ''}`}>

                        {/* Seção 01 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                <h4>[01] Peso da Impressão</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500">
                                    <ArrowDownToLine size={20} />
                                </div>
                                <input
                                    id="input-consumo"
                                    autoFocus
                                    disabled={isSaving}
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={consumo}
                                    onChange={e => setConsumo(e.target.value)}
                                    placeholder="0.00"
                                    className={`w-full bg-zinc-900/50 border rounded-2xl py-6 pl-14 pr-24 text-4xl font-bold text-zinc-100 outline-none transition-all shadow-inner font-mono ${erroSaldoNegativo ? 'border-rose-500/40 focus:border-rose-500/60 ring-4 ring-rose-500/5' : 'border-zinc-800 focus:border-zinc-800/30 focus:bg-zinc-950/40'}`}
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-l border-zinc-800 pl-5">
                                    GRAMAS
                                </div>
                            </div>

                            <div className="grid grid-cols-5 gap-3">
                                {[10, 25, 50, 100, 250].map(val => (
                                    <button
                                        key={val}
                                        disabled={isSaving}
                                        onClick={() => adicionarConsumo(val)}
                                        className="py-2.5 bg-zinc-950/40 border border-zinc-800 hover:border-zinc-500 text-[10px] font-bold text-zinc-500 hover:text-zinc-100 rounded-xl transition-all active:scale-95 uppercase tracking-widest disabled:opacity-30"
                                    >
                                        +{val}g
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Seção 02 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                <h4>[02] Previsão de Saldo</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>

                            <div className="p-6 bg-zinc-950/40/20 border border-zinc-800/50 rounded-[1.5rem] space-y-5">
                                <div className="flex justify-between items-center h-6">
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Status do Inventário</span>

                                    {erroSaldoNegativo && (
                                        <div className="flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase animate-pulse">
                                            <AlertTriangle size={14} /> Saldo insuficiente no carretel
                                        </div>
                                    )}

                                    {isEstoqueCritico && !erroSaldoNegativo && (
                                        <div className="flex items-center gap-2 text-amber-500 text-[10px] font-bold uppercase">
                                            <AlertTriangle size={14} /> Material em nível crítico
                                        </div>
                                    )}
                                </div>

                                <div className="h-3 w-full bg-zinc-950 rounded-full border border-zinc-800/50 overflow-hidden relative p-0.5 shadow-inner">
                                    <div
                                        className="absolute h-full transition-all duration-500 opacity-10"
                                        style={{ width: `${pctAtual}%`, backgroundColor: corFilamento }}
                                    />
                                    <div
                                        className="absolute h-full transition-all duration-700 rounded-full shadow-lg"
                                        style={{
                                            width: `${pctFinal}%`,
                                            backgroundColor: corFilamento,
                                            boxShadow: `0 0 15px ${corFilamento}44`
                                        }}
                                    />
                                </div>

                                <div className="flex justify-between text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
                                    <span>Vazio</span>
                                    <span className="text-zinc-300">Estimativa: {Math.round(pctFinal)}% restantes</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <footer className="p-8 border-t border-zinc-800/50 bg-zinc-950/40/10 flex gap-4">
                        <button
                            disabled={isSaving}
                            onClick={handleTentativaFechar}
                            className="flex-1 py-4 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-500 hover:text-zinc-200 transition-all tracking-widest disabled:opacity-20"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={!inputValido || erroSaldoNegativo || isSaving}
                            onClick={confirmar}
                            className={`flex-[2] py-4 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 tracking-widest
                                ${(!inputValido || erroSaldoNegativo || isSaving)
                                    ? 'bg-zinc-950/40 text-zinc-700 border border-zinc-800 cursor-not-allowed opacity-50'
                                    : 'bg-zinc-100 text-zinc-950 hover:bg-white active:scale-95 shadow-xl'}`}
                        >
                            {isSaving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Terminal size={16} />
                            )}
                            {isSaving ? "Processando..." : "Confirmar Baixa"}
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}
