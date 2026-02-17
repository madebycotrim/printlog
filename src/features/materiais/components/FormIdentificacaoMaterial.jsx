import React, { useState } from "react";
import { PaintbrushVertical, Beaker, Cylinder } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";
import { CORES_MAIS_VENDIDAS, CORES_RESINA, OPCOES_MARCAS_FDM, OPCOES_MARCAS_RESINA, OPCOES_TIPOS } from "../logic/constantes";

export default function FormularioIdentificacaoMaterial({ formulario, atualizarFormulario, mostrarErros, isEditing = false }) {
    const [entradaManual, setEntradaManual] = useState(false);
    const [entradaManualMaterial, setEntradaManualMaterial] = useState(false);

    // Complete color palette (all colors available)
    const CORES_DISPONIVEIS = [
        // Row 1
        "#FFFFFF", "#FFE4C4", "#D1D5DB", "#FFFF00", "#FFD700", "#FF8C00", "#FF4500", "#B8860B",
        // Row 2
        "#ADFF2F", "#32CD32", "#228B22", "#FA8072", "#FF69B4", "#FF00FF", "#DC2626", "#8B0000",
        // Row 3
        "#8A2BE2", "#4B0082", "#06B6D4", "#0EA5E9", "#2563EB", "#1E3A8A", "#8B4513", "#5D4037",
        // Row 4
        "#556B2F", "#6B7280", "#9CA3AF", "#4B5563", "#1F2937", "#09090b"
    ];

    const marcasDisponiveis = formulario.tipo === 'SLA' ? OPCOES_MARCAS_RESINA : OPCOES_MARCAS_FDM;

    // Auto-detect modes (List vs Manual) based on values
    React.useEffect(() => {
        // Verifica MATERIAL
        if (formulario.material) {
            const currentOptions = OPCOES_TIPOS[formulario.tipo] || OPCOES_TIPOS['FDM'];
            const flatValues = currentOptions.flatMap(g => g.items.map(i => i.value));

            // Busca case-insensitive
            const match = flatValues.find(v => v.toLowerCase() === formulario.material.toLowerCase());

            if (match) {
                setEntradaManualMaterial(false); // Found in list -> List Mode
                // Normalize casing if needed
                if (match !== formulario.material) {
                    atualizarFormulario('material', match);
                }
            } else {
                setEntradaManualMaterial(true); // Not found -> Manual Mode
            }
        }

        // Verifica MARCA
        if (formulario.marca) {
            const flatBrands = marcasDisponiveis.flatMap(g => g.items.map(i => i.value));
            const match = flatBrands.find(b => b.toLowerCase() === formulario.marca.toLowerCase());

            if (match) {
                setEntradaManual(false); // Found in list -> List Mode
                // Normalize casing if needed
                if (match !== formulario.marca) {
                    atualizarFormulario('marca', match);
                }
            } else {
                setEntradaManual(true); // Not found -> Manual Mode
            }
        }
    }, [formulario.tipo, formulario.material, formulario.marca, marcasDisponiveis, atualizarFormulario]);

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-4 pt-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Identificação</h4>
                <div className="h-px bg-gradient-to-r from-zinc-800 to-transparent flex-1" />
            </div>

            {/* Seletor de Tecnologia (FDM vs SLA) */}
            <div className={`grid grid-cols-2 gap-3 p-1 bg-zinc-900/30 rounded-xl border border-white/5 ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <button
                    type="button"
                    disabled={isEditing}
                    onClick={() => {
                        atualizarFormulario('tipo', 'FDM');
                        atualizarFormulario('material', '');
                        setEntradaManualMaterial(false);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${(!formulario.tipo || formulario.tipo === 'FDM') ? 'bg-zinc-800 text-sky-400 shadow-sm border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'} ${isEditing ? 'cursor-not-allowed' : ''}`}
                >
                    <Cylinder size={14} strokeWidth={2.5} /> FDM (Filamento)
                </button>
                <button
                    type="button"
                    disabled={isEditing}
                    onClick={() => {
                        atualizarFormulario('tipo', 'SLA');
                        atualizarFormulario('material', '');
                        setEntradaManualMaterial(false);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${(formulario.tipo === 'SLA') ? 'bg-zinc-800 text-purple-400 shadow-sm border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'} ${isEditing ? 'cursor-not-allowed' : ''}`}
                >
                    <Beaker size={14} strokeWidth={2.5} /> SLA (Resina)
                </button>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-12 gap-x-4 gap-y-6">

                {/* Linha 1: Nome (50%) | Fabricante (25%) | Material (25%) */}

                {/* 1. Nome */}
                <div className="space-y-2 col-span-12 md:col-span-6">
                    <label className={`text-[10px] font-bold uppercase tracking-wide px-1 ${mostrarErros && !formulario.nome ? "text-rose-500 animate-pulse" : "text-zinc-500"}`}>
                        Nome {formulario.tipo === 'SLA' ? 'da Resina' : 'do Filamento'} {mostrarErros && !formulario.nome && "*"}
                    </label>
                    <UnifiedInput
                        icon={PaintbrushVertical}
                        value={formulario.nome}
                        onChange={(e) => atualizarFormulario('nome', e.target.value)}
                        placeholder="Ex: PLA Azul Deep"
                        error={mostrarErros && !formulario.nome}
                    />
                </div>

                {/* 2. Fabricante */}
                <div className="space-y-2 col-span-6 md:col-span-3">
                    <div className="flex justify-between items-end px-1 min-h-[18px]">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Fabricante</label>
                        <button onClick={() => setEntradaManual(!entradaManual)} className="text-[9px] text-[#3b82f6] hover:text-[#60a5fa] font-bold uppercase tracking-tighter transition-colors">
                            {entradaManual ? "Lista" : "Digitar"}
                        </button>
                    </div>
                    <UnifiedInput
                        type={entradaManual ? "text" : "select"}
                        options={marcasDisponiveis}
                        value={formulario.marca}
                        onChange={(v) => atualizarFormulario('marca', entradaManual ? v.target.value : v)}
                        placeholder="Selecione..."
                    />
                </div>

                {/* 3. Material */}
                <div className="space-y-2 col-span-6 md:col-span-3">
                    <div className="flex justify-between items-end px-1 min-h-[18px]">
                        <label className={`text-[10px] font-bold uppercase tracking-wide ${mostrarErros && !formulario.material ? "text-rose-500 animate-pulse" : "text-zinc-500"}`}>
                            Material {mostrarErros && !formulario.material && "*"}
                        </label>
                        <button onClick={() => setEntradaManualMaterial(!entradaManualMaterial)} className="text-[9px] text-[#3b82f6] hover:text-[#60a5fa] font-bold uppercase tracking-tighter transition-colors">
                            {entradaManualMaterial ? "Lista" : "Digitar"}
                        </button>
                    </div>
                    <UnifiedInput
                        type={entradaManualMaterial ? "text" : "select"}
                        options={OPCOES_TIPOS[formulario.tipo] || OPCOES_TIPOS['FDM']}
                        value={formulario.material}
                        onChange={(v) => atualizarFormulario('material', entradaManualMaterial ? v.target.value : v)}
                        placeholder="Selecione..."
                        error={mostrarErros && !formulario.material}
                    />
                </div>
            </div>

            {/* Color Selection - New Grid Layout */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                        Cor Predominante
                    </label>
                    {formulario.cor_hex && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-zinc-900/50 rounded-full border border-zinc-800/50">
                            <div className="w-2 h-2 rounded-full ring-1 ring-zinc-700" style={{ backgroundColor: formulario.cor_hex }} />
                            <span className="text-[9px] font-mono text-zinc-400 leading-none">{formulario.cor_hex}</span>
                        </div>
                    )}
                </div>

                <div className="p-2 bg-zinc-900/30 rounded-xl border border-white/5">
                    <div className="flex flex-wrap gap-1.5 justify-start">
                        {CORES_DISPONIVEIS.map((c) => {
                            const isSelected = formulario.cor_hex && c.toLowerCase() === formulario.cor_hex.toLowerCase();
                            return (
                                <button
                                    key={c}
                                    onClick={() => atualizarFormulario('cor_hex', c)}
                                    className={`
                                        w-7 h-7 rounded-lg border transition-all duration-200 
                                        flex items-center justify-center shrink-0
                                        ${isSelected
                                            ? "border-white/50 ring-2 ring-white/20 scale-110 shadow-lg z-10"
                                            : "border-transparent hover:border-white/20 hover:scale-110 opacity-80 hover:opacity-100"
                                        }
                                    `}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                    type="button"
                                >
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                                </button>
                            );
                        })}

                        {/* Custom Picker Button */}
                        <div className="relative w-7 h-7 rounded-lg border border-zinc-700/50 overflow-hidden group hover:border-white/20 hover:scale-110 shrink-0 transition-all cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-amber-500 to-cyan-500 opacity-80 group-hover:opacity-100" />
                            <div className="absolute inset-0 flex items-center justify-center text-white/80 font-bold text-xs">+</div>
                            <input
                                type="color"
                                value={formulario.cor_hex || "#000000"}
                                onChange={(e) => atualizarFormulario('cor_hex', e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
