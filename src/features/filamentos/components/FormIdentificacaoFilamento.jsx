import React, { useState } from "react";
import { PaintbrushVertical } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";
import { CORES_MAIS_VENDIDAS, OPCOES_MARCAS, OPCOES_TIPOS } from "../logic/constantes";

export default function FormularioIdentificacaoFilamento({ formulario, atualizarFormulario, mostrarErros }) {
    const [entradaManual, setEntradaManual] = useState(false);

    return (
        <section className="space-y-5">
            <div className="flex items-center gap-4">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">[01] Identificação</h4>
                <div className="h-px bg-zinc-800/50 flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Nome do Filamento</label>
                    <UnifiedInput
                        icon={PaintbrushVertical}
                        value={formulario.nome}
                        onChange={(e) => atualizarFormulario('nome', e.target.value)}
                        placeholder="Ex: PLA Azul Deep"
                        error={mostrarErros && !formulario.nome}
                    />
                </div>

                {/* Seletor de Cor */}
                <div className="space-y-1.5 col-span-2">
                    <label className={`text-[10px] font-bold uppercase tracking-wide px-1 ${mostrarErros && !formulario.cor_hex ? "text-rose-500 animate-pulse" : "text-zinc-500"}`}>
                        Cor Predominante {mostrarErros && !formulario.cor_hex && "*"}
                    </label>
                    <div className={`flex flex-nowrap overflow-x-auto gap-3 p-3 rounded-xl bg-zinc-950/30 border ${mostrarErros && !formulario.cor_hex ? "border-rose-500/30 bg-rose-500/5" : "border-zinc-800/50"} [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']`}>
                        {CORES_MAIS_VENDIDAS.map(c => (
                            <button key={c} onClick={() => atualizarFormulario('cor_hex', c)}
                                className={`w-6 h-6 rounded-md border border-zinc-700 shadow-sm transition-all duration-300 hover:scale-110 ${formulario.cor_hex && c.toLowerCase() === formulario.cor_hex.toLowerCase() ? "ring-2 ring-white scale-110 z-10" : "opacity-70 hover:opacity-100 hover:ring-2 hover:ring-white/20"}`}
                                style={{ backgroundColor: c }}
                                title={c}
                                type="button"
                            />
                        ))}
                        <div className="ml-auto border-l border-zinc-800 pl-2">
                            <div className="relative w-6 h-6 rounded-md border border-zinc-700 overflow-hidden group hover:scale-110 transition-transform cursor-pointer shadow-lg opacity-80 hover:opacity-100 hover:ring-2 hover:ring-white/20">
                                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 via-yellow-500 to-sky-500 opacity-80 group-hover:opacity-100" />
                                <input type="color" value={formulario.cor_hex || "#000000"} onChange={(e) => atualizarFormulario('cor_hex', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <div className="flex justify-between items-end px-1 min-h-[22px]">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Fabricante</label>
                        <button onClick={() => setEntradaManual(!entradaManual)} className="text-[9px] text-[#3b82f6] hover:text-[#60a5fa] font-bold uppercase tracking-tighter transition-colors">
                            {entradaManual ? "Selecionar Lista" : "Digitar"}
                        </button>
                    </div>
                    <UnifiedInput
                        type={entradaManual ? "text" : "select"}
                        options={OPCOES_MARCAS}
                        value={formulario.marca}
                        onChange={(v) => atualizarFormulario('marca', entradaManual ? v.target.value : v)}
                        placeholder="Selecione..."
                    />
                </div>

                {/* Material & Diâmetro */}
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <div className="flex justify-between items-end px-1 min-h-[22px]">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Tipo de Material</label>
                        <div className="flex items-center bg-zinc-900 rounded-md p-0.5 border border-zinc-800">
                            <button
                                onClick={() => atualizarFormulario('diametro', "1.75")}
                                className={`px-1.5 py-0.5 text-[8px] font-bold rounded flex items-center transition-all ${formulario.diametro === "1.75" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-600 hover:text-zinc-400"}`}
                            >
                                1.75
                            </button>
                            <button
                                onClick={() => atualizarFormulario('diametro', "2.85")}
                                className={`px-1.5 py-0.5 text-[8px] font-bold rounded flex items-center transition-all ${formulario.diametro === "2.85" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-600 hover:text-zinc-400"}`}
                            >
                                2.85
                            </button>
                        </div>
                    </div>
                    <UnifiedInput
                        type="select"
                        options={OPCOES_TIPOS}
                        value={formulario.material}
                        onChange={(v) => atualizarFormulario('material', v)}
                        placeholder="Selecione..."
                        error={mostrarErros && !formulario.material}
                    />
                </div>
            </div>
        </section>
    );
}
