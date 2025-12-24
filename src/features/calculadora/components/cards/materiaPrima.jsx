import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Package, DollarSign } from "lucide-react";
import { getFilaments } from "../../../filamentos/logic/filaments";
import { UnifiedInput } from "../../../../components/formInputs";

/* ---------- CONFIGURAÇÃO DOS INPUTS (DADOS) ---------- */
const CONFIG = {
    selecao: { 
        label: "Filamento", 
        type: "select", 
        placeholder: "ESCOLHA O MATERIAL NO ESTOQUE...", 
        searchable: true 
    },
    peso: { 
        label: "Peso do Modelo", 
        suffix: "g", 
        icon: Package, 
        type: "number", 
        placeholder: "0" 
    },
    preco: { 
        label: "Preço por kg", 
        suffix: "R$", 
        icon: DollarSign, 
        type: "number", 
        placeholder: "0.00" 
    },
    // Configurações para os campos dentro do Rack de Slots (Multi-cor)
    slotSelecao: { type: "select", placeholder: "FILAMENTO..." },
    slotPeso: { suffix: "G", type: "number", placeholder: "0" },
    slotPreco: { suffix: "R$/KG", type: "number", placeholder: "0.00" }
};

/* ---------- COMPONENTE: LINHA DE FILAMENTO (RACK) ---------- */
const FilamentRow = ({ index, slotData, selectOptions, onUpdate, onRemove, canRemove, isOk }) => {
    return (
        <div className={`
            relative grid grid-cols-[48px_1fr_85px_95px_36px] items-stretch
            bg-zinc-950/50 border rounded-xl group/row transition-all h-12 mb-2
            ${!isOk ? 'border-rose-500/30 bg-rose-500/5' : 'border-zinc-800/60 hover:border-zinc-700'}
        `}>
            {/* 1. SLOT ID */}
            <div className="flex flex-col items-center justify-center border-r border-zinc-800/60">
                <span className="text-[7px] font-black opacity-40 uppercase">Slot</span>
                <span className="text-sm font-mono font-black">{index + 1}</span>
            </div>

            {/* 2. SELECT (Sem borda) */}
            <div className="min-w-0 flex items-center">
                <UnifiedInput
                    variant="ghost" // <--- REMOVE A BORDA INTERNA
                    type="select"
                    options={selectOptions}
                    value={slotData.id || "manual"}
                    onChange={(id) => onUpdate(index, { id })}
                />
            </div>

            {/* 3. MASSA (Sem borda) */}
            <div className="border-l border-zinc-800/60">
                <UnifiedInput
                    variant="ghost" // <--- REMOVE A BORDA INTERNA
                    suffix="G"
                    type="number"
                    value={slotData.weight}
                    onChange={(e) => onUpdate(index, { weight: e.target.value })}
                />
            </div>

            {/* 4. PREÇO (Sem borda) */}
            <div className="border-l border-zinc-800/60">
                <UnifiedInput
                    variant="ghost" // <--- REMOVE A BORDA INTERNA
                    suffix="R$/KG"
                    type="number"
                    value={slotData.priceKg}
                    onChange={(e) => onUpdate(index, { priceKg: e.target.value })}
                />
            </div>

            {/* 5. BOTÃO REMOVER */}
            <button className="border-l border-zinc-800/60 ...">
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
    const [mode, setMode] = useState("single");
    const [inventory, setInventory] = useState([]);

    useEffect(() => { setInventory(getFilaments()); }, []);

    // Lógica de agrupamento do estoque
    const selectOptions = useMemo(() => {
        const groups = {};
        inventory.forEach((item) => {
            const type = item.type || "Outros";
            if (!groups[type]) groups[type] = [];
            groups[type].push({ value: item.id, label: item.name });
        });

        return [
            { group: "ENTRADA MANUAL", items: [{ value: "manual", label: "Digitar preço por kg" }] },
            ...Object.keys(groups).map(type => ({
                group: `ESTOQUE: ${type.toUpperCase()}`,
                items: groups[type]
            }))
        ];
    }, [inventory]);

    const handleUpdateSlot = (index, newData) => {
        const newSlots = [...materialSlots];
        const updatedSlot = { ...newSlots[index], ...newData };
        if (newData.id && newData.id !== "manual") {
            const item = inventory.find(f => f.id === newData.id);
            if (item) updatedSlot.priceKg = ((item.price / item.weightTotal) * 1000).toFixed(2);
        }
        newSlots[index] = updatedSlot;
        setMaterialSlots(newSlots);
    };

    const totalWeight = useMemo(() => {
        if (mode === "single") return Number(pesoModelo) || 0;
        return materialSlots.reduce((acc, s) => acc + (Number(s.weight) || 0), 0);
    }, [materialSlots, pesoModelo, mode]);

    return (
        <div className="flex flex-col gap-5 animate-in fade-in duration-500">
            
            {/* TOGGLE MODO (UMA COR / VÁRIAS CORES) */}
            <div className="flex bg-zinc-900/40 border border-zinc-800/60 p-1 rounded-xl">
                {["single", "multi"].map(m => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all
                        ${mode === m ? "bg-zinc-800 text-sky-400 border border-white/5 shadow-lg" : "text-zinc-600 hover:text-zinc-400"}`}
                    >
                        {m === "single" ? "Uma cor" : "Várias cores"}
                    </button>
                ))}
            </div>

            {mode === "single" ? (
                /* MODO UMA COR */
                <div className="space-y-4 animate-in slide-in-from-left-2">
                    <UnifiedInput
                        {...CONFIG.selecao}
                        options={selectOptions}
                        value={selectedFilamentId || "manual"}
                        onChange={(id) => {
                            setSelectedFilamentId(id);
                            if (id !== 'manual') {
                                const item = inventory.find(f => f.id === id);
                                if (item) setCustoRolo(((item.price / item.weightTotal) * 1000).toFixed(2));
                            }
                        }}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <UnifiedInput
                            {...CONFIG.peso}
                            value={pesoModelo}
                            onChange={(e) => setPesoModelo(e.target.value)}
                        />
                        <UnifiedInput
                            {...CONFIG.preco}
                            value={custoRolo}
                            onChange={(e) => setCustoRolo(e.target.value)}
                        />
                    </div>
                </div>
            ) : (
                /* MODO VÁRIAS CORES */
                <div className="space-y-3 animate-in slide-in-from-right-2">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Rack de Materiais</span>
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-mono text-sky-500 font-bold opacity-50">{totalWeight}g TOTAL</span>
                            <button onClick={() => setMaterialSlots([...materialSlots, { id: 'manual', weight: '', priceKg: '' }])} className="text-sky-500 hover:text-sky-400 active:scale-90 transition-transform">
                                <Plus size={14} strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col max-h-[300px] overflow-visible pr-1 custom-scrollbar">
                        {materialSlots.map((slot, idx) => (
                            <FilamentRow
                                key={idx}
                                index={idx}
                                slotData={slot}
                                selectOptions={selectOptions}
                                onUpdate={handleUpdateSlot}
                                onRemove={(i) => setMaterialSlots(materialSlots.filter((_, x) => x !== i))}
                                canRemove={materialSlots.length > 1}
                                isOk={!inventory.find(f => f.id === slot.id) || (inventory.find(f => f.id === slot.id).weightCurrent >= (Number(slot.weight) || 0))}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}