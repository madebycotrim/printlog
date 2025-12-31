// src/features/calculadora/components/cards/materiaPrima.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Package, DollarSign, Tag, Layers, Loader2 } from "lucide-react";
import { useFilamentStore } from "../../../filamentos/logic/filaments";
import { UnifiedInput } from "../../../../components/UnifiedInput";

/* ---------- COMPONENTE: LINHA DE FILAMENTO ---------- */
const LinhaFilamento = ({ indice, total, dadosSlot, opcoesSelecao, aoAtualizar, aoRemover, podeRemover }) => {
    const ordemVisual = (total - indice) * 10;

    return (
        <div
            style={{ zIndex: ordemVisual }}
            className="flex items-end gap-2 group animate-in slide-in-from-right-2 duration-300 mb-2 relative"
        >
            <div className="flex-1 min-w-0 relative">
                <UnifiedInput
                    placeholder="MATERIAL..."
                    type="select"
                    icon={Tag}
                    options={opcoesSelecao}
                    value={dadosSlot.id || "manual"}
                    onChange={(id) => aoAtualizar(indice, { id })}
                />
            </div>

            <div className="w-[82px] shrink-0 relative">
                <UnifiedInput
                    placeholder="0"
                    type="number"
                    suffix="G"
                    value={dadosSlot.weight || ""}
                    onChange={(e) => aoAtualizar(indice, { weight: e.target.value })}
                />
            </div>

            <div className="w-[82px] shrink-0 relative">
                <UnifiedInput
                    placeholder="0.00"
                    type="number"
                    suffix="R$"
                    value={dadosSlot.priceKg || ""}
                    onChange={(e) => aoAtualizar(indice, { priceKg: e.target.value })}
                />
            </div>

            <button
                type="button"
                onClick={() => podeRemover && aoRemover(indice)}
                className="h-11 w-10 shrink-0 flex items-center justify-center rounded-xl border border-zinc-800/60 text-zinc-700 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all mb-[1px]"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
};

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function MaterialModule({
    custoRolo, setCustoRolo,
    pesoModelo, setPesoModelo,
    selectedFilamentId, setSelectedFilamentId,
    materialSlots = [],
    setMaterialSlots
}) {
    // Modo de exibição: single (uma cor) ou multi (várias cores)
    const [modo, setModo] = useState(selectedFilamentId === "multi" ? "multi" : "single");
    const { filaments: filamentos, fetchFilaments: buscarFilamentos, loading: carregando } = useFilamentStore();

    useEffect(() => {
        buscarFilamentos();
    }, [buscarFilamentos]);

    // Sincroniza o modo visual caso o estado global mude (ex: carregar projeto salvo)
    useEffect(() => {
        if (selectedFilamentId === "multi") {
            setModo("multi");
        } else {
            setModo("single");
        }
    }, [selectedFilamentId]);

    // Agrupa filamentos do estoque por tipo de material para o select
    const opcoesSelecao = useMemo(() => {
        const grupos = {};
        const lista = Array.isArray(filamentos) ? filamentos : [];

        lista.forEach((item) => {
            const tipoMaterial = (item.material || "Outros").toUpperCase();
            if (!grupos[tipoMaterial]) grupos[tipoMaterial] = [];

            grupos[tipoMaterial].push({
                value: item.id,
                label: item.nome
            });
        });

        return [
            { group: "ENTRADA MANUAL", items: [{ value: "manual", label: "Preço Manual" }] },
            ...Object.keys(grupos).map(tipo => ({
                group: `ESTOQUE: ${tipo}`,
                items: grupos[tipo]
            }))
        ];
    }, [filamentos]);

    // Atualiza um slot específico e auto-calcula o preço/kg se vier do estoque
    const lidarAtualizacaoSlot = (indice, novosDados) => {
        const slotsAtuais = Array.isArray(materialSlots) ? materialSlots : [];
        const novosSlots = [...slotsAtuais];
        novosSlots[indice] = { ...novosSlots[indice], ...novosDados };

        if (novosDados.id && novosDados.id !== "manual") {
            const itemEstoque = filamentos.find(f => String(f.id) === String(novosDados.id));
            if (itemEstoque && Number(itemEstoque.peso_total) > 0) {
                // Cálculo: (Preço Total / Peso Total em g) * 1000 para ter preço por KG
                const precoPorKg = ((Number(itemEstoque.preco) / Number(itemEstoque.peso_total)) * 1000).toFixed(2);
                novosSlots[indice].priceKg = String(precoPorKg);
            }
        }

        setMaterialSlots(novosSlots);
    };

    // Peso total somado (reativo para o cabeçalho)
    const pesoTotalSomado = useMemo(() => {
        if (modo === "single") return parseFloat(String(pesoModelo || "0").replace(',', '.')) || 0;

        const slotsSeguros = Array.isArray(materialSlots) ? materialSlots : [];
        return slotsSeguros.reduce((acc, s) => {
            const valor = parseFloat(String(s?.weight || "0").replace(',', '.'));
            return acc + (isNaN(valor) ? 0 : valor);
        }, 0);
    }, [materialSlots, pesoModelo, modo]);

    // Alterna entre modo Simples e Multi-Material
    const alternarModo = (novoModo) => {
        setModo(novoModo);
        if (novoModo === "multi") {
            setSelectedFilamentId("multi");
        } else {
            setSelectedFilamentId("manual");
        }
    };

    return (
        <div className="flex flex-col gap-5 animate-in fade-in duration-500">

            {/* SELETOR DE MODO */}
            <div className="flex bg-zinc-900/40 border border-zinc-800/60 p-1 rounded-xl">
                {["single", "multi"].map(m => (
                    <button
                        key={m}
                        onClick={() => alternarModo(m)}
                        className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all
                        ${modo === m ? "bg-zinc-800 text-sky-400 border border-white/5 shadow-lg" : "text-zinc-600 hover:text-zinc-400"}`}
                    >
                        {m === "single" ? "Uma cor" : "Várias cores"}
                    </button>
                ))}
            </div>

            {modo === "single" ? (
                <div className="space-y-4 animate-in slide-in-from-left-2 relative">
                    <div className="relative z-20">
                        <UnifiedInput
                            label="Selecionar Filamento"
                            type="select"
                            icon={carregando ? Loader2 : Tag}
                            className={carregando ? "animate-spin" : ""}
                            options={opcoesSelecao}
                            value={selectedFilamentId || "manual"}
                            onChange={(id) => {
                                setSelectedFilamentId(id);
                                if (id !== 'manual') {
                                    const item = filamentos.find(f => String(f.id) === String(id));
                                    if (item && Number(item.peso_total) > 0) {
                                        const precoPorKg = ((Number(item.preco) / Number(item.peso_total)) * 1000).toFixed(2);
                                        setCustoRolo(String(precoPorKg));
                                    }
                                }
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 relative z-10">
                        <UnifiedInput
                            label="Peso Modelo"
                            suffix="G"
                            icon={Package}
                            type="number"
                            value={pesoModelo || ""}
                            onChange={(e) => setPesoModelo(e.target.value)}
                        />
                        <UnifiedInput
                            label="Preço / KG"
                            suffix="R$"
                            icon={DollarSign}
                            type="number"
                            value={custoRolo || ""}
                            onChange={(e) => setCustoRolo(e.target.value)}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between px-1 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                            <Layers size={12} className="text-zinc-500" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Rack de Materiais</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-mono font-bold text-sky-400">
                                    {pesoTotalSomado.toFixed(0)}g
                                </span>
                                <span className="text-[7px] font-black text-zinc-700 uppercase tracking-tighter">Total</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMaterialSlots([...materialSlots, { id: 'manual', weight: '', priceKg: '' }])}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500 hover:bg-sky-500 hover:text-white transition-all active:scale-90"
                            >
                                <Plus size={16} strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col min-h-0 relative">
                        {materialSlots.length === 0 ? (
                            <div className="py-8 text-center border-2 border-dashed border-zinc-900 rounded-2xl animate-in fade-in zoom-in-95">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">
                                    Nenhum filamento adicionado ao rack
                                </p>
                            </div>
                        ) : (
                            materialSlots.map((slot, idx) => (
                                <LinhaFilamento
                                    key={`slot-${idx}`}
                                    indice={idx}
                                    total={materialSlots.length}
                                    dadosSlot={slot}
                                    opcoesSelecao={opcoesSelecao}
                                    aoAtualizar={lidarAtualizacaoSlot}
                                    aoRemover={(i) => setMaterialSlots(materialSlots.filter((_, x) => x !== i))}
                                    podeRemover={true}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}