import React, { useState, useEffect, useCallback, useRef } from "react";
import { AlertTriangle, Terminal, ArrowDownToLine, Loader2, TrendingDown, AlertOctagon } from "lucide-react";
import { useQueryClient } from '@tanstack/react-query';
import VisualizacaoCarretel from "./VisualizacaoCarretel";
import { parseNumber } from "../../../utils/numbers";
import { useToastStore } from "../../../stores/toastStore";
import SideBySideModal from "../../../components/ui/SideBySideModal";
import api from "../../../utils/api";
import { UnifiedInput } from "../../../components/UnifiedInput";
import { useMutacoesFilamento } from "../logic/consultasFilamento";
import { MATERIAIS_RESINA_FLAT } from "../logic/constantes";

export default function ModalBaixaRapida({ aberto, aoFechar, item, aoSalvar }) {
    const [consumo, setConsumo] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [mostrarErros, setMostrarErros] = useState(false);

    // Mutation Hook
    const { registrarHistorico } = useMutacoesFilamento();

    // Estados para Falha
    const [ehFalha, setEhFalha] = useState(false);
    const [motivoFalha, setMotivoFalha] = useState("Falha de Aderência");

    // Interaction States
    const [emFoco, setEmFoco] = useState(false);
    const [arrastando, setArrastando] = useState(false);
    const spoolRef = useRef(null);

    // Resin Logic (moved up for init)
    const isResin = React.useMemo(() => {
        if (!item) return false;
        const mat = (item.material || "").trim();
        const tipo = (item.tipo || "").toUpperCase();
        return (
            tipo === 'SLA' ||
            tipo === 'RESINA' ||
            MATERIAIS_RESINA_FLAT.includes(mat) ||
            MATERIAIS_RESINA_FLAT.some(r => mat.toLowerCase().includes(r.toLowerCase())) ||
            mat.toLowerCase().includes('resina') ||
            mat.toLowerCase().includes('resin')
        );
    }, [item]);
    const unitLabel = isResin ? "MILILITROS" : "GRAMAS";
    const unitSuffix = isResin ? "ml" : "g";
    const corFilamento = item?.cor_hex || "#3b82f6";

    // Reinicia o estado ao abrir o modal
    useEffect(() => {
        if (aberto) {
            setConsumo("");
            setEhFalha(false);
            setMotivoFalha(isResin ? "Falha de Aderência (Plataforma)" : "Falha de Aderência");
            setSalvando(false);
            setMostrarErros(false);
            setEmFoco(false);
            setArrastando(false);
        }
    }, [aberto, isResin]);

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
    const inputVazio = consumo === "";



    // Spool Interaction Logic (Adapted for Consumption)
    const handleSpoolInteraction = (e) => {
        if (!spoolRef.current || salvando) return;
        const rect = spoolRef.current.getBoundingClientRect();
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const padding = 20;
        const height = rect.height - (padding * 2);
        const y = Math.max(0, Math.min(height, (clientY - rect.top - padding)));
        const percent = 1 - (y / height); // 0 at bottom, 1 at top

        // Target weight based on drag position
        const targetWeight = Math.round(capacidade * Math.max(0, Math.min(1, percent)));

        // Ensure we don't increase weight (this is a usage modal)
        // Actually, dragging normally sets absolute weight. 
        // If target > pesoAnterior, maybe we should clamp it or just set consumption to 0?
        // Let's allow full range but clamp consumption logic.

        const validTarget = Math.min(targetWeight, pesoAnterior);
        const calculatedConsumption = Math.max(0, pesoAnterior - validTarget);

        setConsumo(calculatedConsumption.toString());
    };

    const queryClient = useQueryClient();

    const confirmar = useCallback(async () => {
        if (salvando) return;

        if (!inputValido || erroSaldoNegativo) {
            setMostrarErros(true);
            return;
        }

        try {
            setSalvando(true);

            if (ehFalha) {
                const pricePerGram = (Number(item?.preco || 0) / Math.max(1, Number(item?.peso_total || 1000)));
                const costWasted = (pricePerGram * qtdConsumo).toFixed(2);

                await api.post('/failures', {
                    peso_perdido: qtdConsumo,
                    custo_perdido: costWasted,
                    observacao: motivoFalha,
                    filamento_id: item.id,
                    impressora_id: null,
                    nome_modelo: "Baixa Rápida"
                });

                useToastStore.getState().addToast("Falha registrada e descontada!", "info");

                // Em falhas, o backend atualiza o peso e a versão. 
                // Não devemos chamar aoSalvar() pois causaria conflito de versão (409).
                // Apenas invalidamos o cache para refetch.
                queryClient.invalidateQueries(['filamentos']);
                queryClient.invalidateQueries(['historico-filamento']);

                aoFechar();
                return; // Encerra aqui, não chama aoSalvar
            }

            // Se for consumo normal (não falha):
            await registrarHistorico({
                id: item.id,
                tipo: 'consumo',
                qtd: qtdConsumo,
                obs: 'Baixa Manual'
            });

            // Para consumo normal, o registrarHistorico APENAS cria log.
            // Precisamos chamar aoSalvar para efetivamente atualizar o peso no banco.
            await aoSalvar({
                ...item,
                peso_atual: pesoFinal
            });
            aoFechar();
        } catch (error) {
            console.error("Erro crítico ao atualizar estoque:", error);
            const msg = error.response?.data?.details || error.message || "Erro desconhecido";
            useToastStore.getState().addToast(`Erro ao processar baixa: ${msg}`, "error");
        } finally {
            setSalvando(false);
        }
    }, [inputValido, erroSaldoNegativo, salvando, item, pesoFinal, aoSalvar, aoFechar, ehFalha, qtdConsumo, motivoFalha, registrarHistorico, queryClient]);

    // Atalhos de teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter" && !salvando) {
                confirmar();
            }
            // Escape is handled by SideBySideModal now
        };
        if (aberto) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [aberto, salvando, confirmar]);

    if (!aberto || !item) return null;

    const adicionarConsumo = (valor) => {
        if (salvando) return;
        const atual = parseNumber(consumo) || 0;
        setConsumo((atual + valor).toString());
    };

    // Sidebar Content (Matches ModalFilamento aesthetic & interaction)
    const sidebarContent = (
        <div className="flex flex-col items-center w-full h-full relative z-10 justify-between py-8 px-6">

            {/* Contextual Header */}
            <div className="w-full text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] border rounded-full px-3 py-1 ${erroSaldoNegativo ? "border-rose-500/50 text-rose-500 bg-rose-500/10" : "border-zinc-800 text-zinc-500 bg-zinc-900/50"}`}>
                        {erroSaldoNegativo ? "Saldo Insuficiente" : "Simular Baixa"}
                    </span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight leading-none break-words line-clamp-2 drop-shadow-lg">
                    {item.nome}
                </h2>
            </div>

            {/* Central Spool Visualization with Hit Box */}
            <div className="w-full flex-1 flex items-center justify-center select-none my-4">
                <div className="relative w-[220px] h-[220px]">
                    {/* HIT BOX */}
                    <div
                        className="absolute inset-0 z-50 cursor-ns-resize rounded-full"
                        ref={spoolRef}
                        onMouseEnter={() => setEmFoco(true)}
                        onMouseDown={() => setArrastando(true)}
                        onMouseUp={() => setArrastando(false)}
                        onMouseLeave={() => { setArrastando(false); setEmFoco(false); }}
                        onMouseMove={(e) => arrastando && handleSpoolInteraction(e)}
                        onClick={handleSpoolInteraction}
                        onTouchStart={() => setArrastando(true)}
                        onTouchEnd={() => setArrastando(false)}
                        onTouchMove={(e) => arrastando && handleSpoolInteraction(e)}
                        title="Arraste para definir o consumo"
                    />

                    {/* GLOW */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full opacity-15 blur-[60px] transition-all duration-700 pointer-events-none"
                        style={{ backgroundColor: corFilamento }}
                    />

                    {/* SPOOL / BOTTLE */}
                    <div className={`transform transition-transform duration-500 ${emFoco ? "scale-105" : ""} active:scale-95 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-none`}>
                        <VisualizacaoCarretel
                            cor={corFilamento}
                            tamanho={220}
                            porcentagem={pctFinal}
                            tipo={isResin ? 'SLA' : 'FDM'} // Force SLA visual if detected as resin
                        />
                    </div>

                    {/* PERCENTAGE INDICATOR */}
                    <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300 transform pointer-events-none z-40 ${emFoco ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
                        <span className="text-3xl font-black text-white drop-shadow-lg tabular-nums tracking-tighter">
                            {Math.round(pctFinal)}%
                        </span>
                    </div>

                    {/* DRAG HINT */}
                    <div className={`absolute right-[-40px] top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-opacity duration-500 pointer-events-none ${emFoco ? "opacity-40" : "opacity-0"}`}>
                        <div className="w-1 h-1 bg-white rounded-full" />
                        <div className="w-0.5 h-12 bg-gradient-to-b from-transparent via-white to-transparent" />
                        <div className="w-1 h-1 bg-white rounded-full" />
                    </div>
                </div>
            </div>

            {/* Previous/Next Stats */}
            <div className="w-full px-2">
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-xl p-4 flex justify-between items-center shadow-lg">
                    <div>
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Atual</span>
                        <p className="text-xs font-mono font-bold text-zinc-400">{Math.round(pesoAnterior)}{unitSuffix}</p>
                    </div>
                    <ArrowDownToLine size={16} className={`text-zinc-600 ${arrastando ? "animate-bounce" : ""}`} />
                    <div className="text-right">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Final</span>
                        <p className={`text-xl font-mono font-bold ${erroSaldoNegativo ? 'text-rose-500' : 'text-zinc-100'}`}>
                            {Math.round(pesoFinal)}{unitSuffix}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Footer Content
    const footerContent = ({ onClose }) => (
        <div className="flex gap-4 w-full">
            <button
                disabled={salvando}
                onClick={onClose}
                className="flex-1 py-4 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-500 hover:text-zinc-200 transition-all tracking-widest disabled:opacity-20"
            >
                Cancelar
            </button>
            <button
                disabled={salvando}
                onClick={confirmar}
                className={`flex-[2] py-4 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 tracking-widest
                                ${salvando
                        ? 'bg-zinc-950/40 text-zinc-700 border border-zinc-800 cursor-not-allowed opacity-50'
                        : 'bg-zinc-100 text-zinc-950 hover:bg-white active:scale-95 shadow-xl'}`}
            >
                {salvando ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
                {salvando ? "Processando..." : "Confirmar Uso"}
            </button>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={aberto}
            onClose={aoFechar}
            sidebar={sidebarContent}
            header={{ title: "Registrar Uso", subtitle: isResin ? "Lançar consumo de resina do frasco" : "Lançar consumo de material do carretel", icon: TrendingDown }}
            footer={footerContent}
            salvando={salvando}
            isDirty={consumo !== "" && consumo !== "0"}
        >
            <div className="space-y-8 relative">

                {/* Seção 01 */}
                <section className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <h4>[01] {isResin ? 'Volume Usado' : 'Peso Usado'}</h4>
                        <div className="h-px bg-zinc-800/50 flex-1" />
                    </div>

                    <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500">
                            <ArrowDownToLine size={20} />
                        </div>
                        <input
                            id="input-consumo"
                            autoFocus
                            disabled={salvando}
                            type="number"
                            min="0"
                            step="0.1"
                            value={consumo}
                            onChange={e => setConsumo(e.target.value)}
                            placeholder="0.00"
                            className={`w-full bg-zinc-900/50 border rounded-2xl py-6 pl-14 pr-24 text-4xl font-bold text-zinc-100 outline-none transition-all shadow-inner font-mono ${erroSaldoNegativo || (mostrarErros && inputVazio) ? 'border-rose-500/40 focus:border-rose-500/60 ring-4 ring-rose-500/5' : 'border-zinc-800 focus:border-zinc-800/30 focus:bg-zinc-950/40'}`}
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-l border-zinc-800 pl-5">
                            {unitLabel}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {(() => {
                            const maxVal = pesoAnterior;
                            let presets = [];

                            // Lógica de Curva de Consumo baseada no estoque atual
                            if (isResin) {
                                // RESINA (ML) - Geralmente consumos menores
                                if (maxVal > 800) presets = [50, 100, 250];
                                else if (maxVal > 300) presets = [25, 50, 100];
                                else if (maxVal > 100) presets = [10, 25, 50];
                                else if (maxVal > 30) presets = [5, 10, 20];
                                else presets = [1, 5, 10];
                            } else {
                                // FILAMENTO (G) - Consumos maiores
                                if (maxVal > 800) presets = [50, 100, 250]; // Rolo cheio
                                else if (maxVal > 400) presets = [25, 50, 100]; // Meio rolo
                                else if (maxVal > 100) presets = [10, 25, 50]; // Finalzinho
                                else if (maxVal > 40) presets = [5, 10, 25]; // Sobras
                                else presets = [1, 5, 10]; // Restos
                            }

                            // Filtra opções maiores que o saldo atual para não confundir
                            const validPresets = presets.filter(n => n <= maxVal);

                            return validPresets.map(val => (
                                <button
                                    key={val}
                                    disabled={salvando}
                                    onClick={() => adicionarConsumo(val)}
                                    className="py-2.5 bg-zinc-950/40 border border-zinc-800 hover:border-zinc-500 text-[10px] font-bold text-zinc-500 hover:text-zinc-100 rounded-xl transition-all active:scale-95 uppercase tracking-widest disabled:opacity-30"
                                >
                                    +{val}{unitSuffix}
                                </button>
                            ));
                        })()}
                        <button
                            disabled={salvando}
                            onClick={() => setConsumo(pesoAnterior.toString())}
                            className="py-2.5 bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-500 hover:text-zinc-100 hover:bg-rose-500 rounded-xl transition-all active:scale-95 uppercase tracking-widest disabled:opacity-30"
                        >
                            RESTANTE
                        </button>
                    </div>
                </section>

                {/* Seção 02 */}
                <section className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <h4>[02] Detalhes</h4>
                        <div className="h-px bg-zinc-800/50 flex-1" />
                    </div>

                    <div className="p-6 bg-zinc-950/40/20 border border-zinc-800/50 rounded-[1.5rem] space-y-5">
                        {/* Toggles */}
                        <div className="flex items-center justify-between p-1 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                            <button
                                onClick={() => setEhFalha(false)}
                                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${!ehFalha ? 'bg-zinc-800 text-zinc-100 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Uso Normal
                            </button>
                            <button
                                onClick={() => setEhFalha(true)}
                                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${ehFalha ? 'bg-rose-500 text-white shadow-lg' : 'text-zinc-500 hover:text-rose-500'}`}
                            >
                                <AlertOctagon size={12} />
                                Falha de Impressão
                            </button>
                        </div>

                        {/* Reason Input (Conditional) */}
                        {ehFalha && (
                            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                                <UnifiedInput
                                    label="O que aconteceu?"
                                    type="select"
                                    options={[{
                                        items: (isResin ? [
                                            "Falha de Aderência (Plataforma)", "Falha de Cura", "Queda de Energia",
                                            "Suporte Quebrado", "Fim de Resina", "Resina Contaminada", "Outros"
                                        ] : [
                                            "Falha de Aderência", "Entupimento de Bico", "Queda de Energia",
                                            "Erro no Fatiamento", "Fim de Filamento", "Warping (Empenamento)", "Outros"
                                        ]).map(r => ({ value: r, label: r }))
                                    }]}
                                    value={motivoFalha}
                                    onChange={(v) => setMotivoFalha(v)}
                                />
                            </div>
                        )}

                        {/* Compact Stats */}
                        <div className="flex justify-between items-center h-6">
                            {erroSaldoNegativo ? (
                                <div className="flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase animate-pulse">
                                    <AlertTriangle size={14} /> Saldo insuficiente no carretel
                                </div>
                            ) : (
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                                    Estimativa após consumo
                                </div>
                            )}
                        </div>

                        {/* Visual Bar */}
                        <div className="h-3 w-full bg-zinc-950 rounded-full border border-zinc-800/50 overflow-hidden relative p-0.5 shadow-inner">
                            <div
                                className="absolute h-full transition-all duration-500 opacity-20"
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
                    </div>
                </section>
            </div>
        </SideBySideModal>
    );
}
