import React, { useState } from "react";
import { ShoppingBag, Link as LinkIcon, Flame, CalendarClock, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";

export default function FormAquisicaoManutencao({ formulario, atualizarFormulario, mostrarErros }) {
    const [isOpen, setIsOpen] = useState(false);

    const setHoje = () => {
        const hoje = new Date().toISOString().split('T')[0];
        atualizarFormulario('data_secagem', hoje);
    };

    return (
        <section className="space-y-5">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-4 group cursor-pointer focus:outline-none"
            >
                <h4 className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isOpen ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                    [03] Aquisição & Manutenção
                </h4>
                <div className={`p-1 rounded-md transition-colors ${isOpen ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
                <div className="h-px bg-zinc-800/50 flex-1 group-hover:bg-zinc-800 transition-colors" />
            </button>

            {isOpen && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 fade-in duration-300">

                    {/* Fornecedor */}
                    <div className="space-y-1.5 col-span-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                            Fornecedor
                        </label>
                        <UnifiedInput
                            icon={ShoppingBag}
                            value={formulario.fornecedor || ""}
                            onChange={(e) => atualizarFormulario('fornecedor', e.target.value)}
                            placeholder="Ex: Amazon, Mercado Livre..."
                        />
                    </div>

                    {/* Data de Secagem - APENAS FDM */}
                    {formulario.tipo !== 'SLA' && (
                        <div className="space-y-1.5 col-span-2 md:col-span-1">
                            <div className="flex justify-between items-end px-1 min-h-[22px]">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                                    <Flame size={10} className="text-orange-500" /> Última Secagem
                                </label>
                                <button
                                    type="button"
                                    onClick={setHoje}
                                    className="text-[9px] text-orange-500 hover:text-orange-400 font-bold uppercase tracking-tighter transition-colors bg-orange-500/10 px-2 py-0.5 rounded"
                                >
                                    Marcar Hoje
                                </button>
                            </div>
                            <UnifiedInput
                                icon={CalendarClock}
                                type="date"
                                value={formulario.data_secagem || ""}
                                onChange={(e) => atualizarFormulario('data_secagem', e.target.value)}
                            />
                        </div>
                    )}

                    {/* Link de Compra */}
                    <div className="space-y-1.5 col-span-2">
                        <div className="flex justify-between items-end px-1 min-h-[22px]">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                                Link de Recompra
                            </label>
                            {formulario.url_compra && (
                                <a
                                    href={formulario.url_compra}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-[9px] text-sky-500 hover:text-sky-400 font-bold uppercase tracking-tighter transition-colors"
                                >
                                    Testar Link <ExternalLink size={8} />
                                </a>
                            )}
                        </div>

                        <UnifiedInput
                            icon={LinkIcon}
                            value={formulario.url_compra || ""}
                            onChange={(e) => atualizarFormulario('url_compra', e.target.value)}
                            placeholder="https://..."
                            className={formulario.url_compra ? "text-sky-400 underline decoration-sky-500/30" : ""}
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
