import React, { useState } from "react";
import { PaintbrushVertical, Beaker, Cylinder } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";
import { CORES_MAIS_VENDIDAS, CORES_RESINA, OPCOES_MARCAS_FDM, OPCOES_MARCAS_RESINA, OPCOES_TIPOS } from "../logic/constantes";

export default function FormularioIdentificacaoFilamento({ formulario, atualizarFormulario, mostrarErros, isEditing = false }) {
    const [entradaManual, setEntradaManual] = useState(false);
    const [entradaManualMaterial, setEntradaManualMaterial] = useState(false);
    const coresDisponiveis = formulario.tipo === 'SLA' ? CORES_RESINA : CORES_MAIS_VENDIDAS;
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
        <section className="space-y-5">
            <div className="flex items-center gap-4">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">[01] Identificação</h4>
                <div className="h-px bg-zinc-800/50 flex-1" />
            </div>

            {/* Seletor de Tecnologia (FDM vs SLA) */}
            <div className={`grid grid-cols-2 gap-3 p-1 bg-zinc-900/50 rounded-lg border border-zinc-800/50 ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <button
                    type="button"
                    disabled={isEditing}
                    onClick={() => {
                        atualizarFormulario('tipo', 'FDM');
                        atualizarFormulario('material', '');
                        setEntradaManualMaterial(false);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${(!formulario.tipo || formulario.tipo === 'FDM') ? 'bg-zinc-800 text-sky-400 shadow-sm border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'} ${isEditing ? 'cursor-not-allowed' : ''}`}
                >
                    <Cylinder size={14} /> FDM (Filamento)
                </button>
                <button
                    type="button"
                    disabled={isEditing}
                    onClick={() => {
                        atualizarFormulario('tipo', 'SLA');
                        atualizarFormulario('material', '');
                        setEntradaManualMaterial(false);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${(formulario.tipo === 'SLA') ? 'bg-zinc-800 text-purple-400 shadow-sm border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'} ${isEditing ? 'cursor-not-allowed' : ''}`}
                >
                    <Beaker size={14} /> SLA (Resina)
                </button>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-12 gap-x-4 gap-y-5">

                {/* Linha 1: Nome (50%) | Fabricante (25%) | Material (25%) */}

                {/* 1. Nome */}
                <div className="space-y-1.5 col-span-12 md:col-span-6">
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
                <div className="space-y-1.5 col-span-6 md:col-span-3">
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
                <div className="space-y-1.5 col-span-6 md:col-span-3">
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

                {/* Linha 2: Cor e Detalhes Técnicos */}

                {/* Linha 2: Cor (7) | Detalhes Técnicos (5) */}



                {/* 5. Detalhes Técnicos (Diâmetro / Densidade) */}
                <div className="col-span-12 flex justify-end items-end pb-1.5">
                    {(!formulario.tipo || formulario.tipo === 'FDM') ? (
                        <div className="flex items-center gap-2 w-full justify-end">
                            <span className="text-[10px] font-medium text-zinc-500">Diâmetro</span>
                            <div className="flex items-center bg-zinc-900/50 rounded p-0.5 border border-zinc-800/50">
                                <button
                                    onClick={() => atualizarFormulario('diametro', "1.75")}
                                    className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all ${formulario.diametro === "1.75" ? "bg-zinc-700 text-zinc-100 shadow-sm" : "text-zinc-600 hover:text-zinc-400"}`}
                                >
                                    1.75
                                </button>
                                <button
                                    onClick={() => atualizarFormulario('diametro', "2.85")}
                                    className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all ${formulario.diametro === "2.85" ? "bg-zinc-700 text-zinc-100 shadow-sm" : "text-zinc-600 hover:text-zinc-400"}`}
                                >
                                    2.85
                                </button>
                            </div>
                            <span className="text-[10px] text-zinc-600">mm</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 w-full justify-end">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-zinc-500">Densidade</span>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-12 py-0.5 pl-1 pr-1 bg-transparent border-b border-zinc-700 text-[11px] font-medium text-center text-zinc-300 focus:outline-none focus:border-purple-500 transition-all placeholder-zinc-700"
                                        value={formulario.densidade || 1.25}
                                        onChange={(e) => atualizarFormulario('densidade', e.target.value)}
                                    />
                                    <span className="absolute right-0 bottom-1 text-[8px] text-zinc-600 opacity-50">g/ml</span>
                                </div>
                            </div>

                            <div className="w-px h-6 bg-zinc-800" />

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-zinc-500">Cura</span>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-10 py-0.5 pl-1 pr-1 bg-transparent border-b border-zinc-700 text-[11px] font-medium text-center text-zinc-300 focus:outline-none focus:border-purple-500 transition-all placeholder-zinc-700"
                                        value={formulario.tempo_exposicao !== undefined ? formulario.tempo_exposicao : 2.5}
                                        onChange={(e) => atualizarFormulario('tempo_exposicao', e.target.value)}
                                    />
                                    <span className="absolute right-0 bottom-1 text-[8px] text-zinc-600 opacity-50">s</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section >
    );
}
