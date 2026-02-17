import React from "react";
import { Link as LinkIcon, ExternalLink } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";

export default function FormAquisicaoManutencao({ formulario, atualizarFormulario, mostrarErros }) {
    return (
        <section className="space-y-5">
            <div className="flex items-center gap-4">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Aquisição & Manutenção</h4>
                <div className="h-px bg-zinc-800/50 flex-1" />
            </div>

            {/* Link de Compra */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-end px-1 min-h-[18px]">
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
        </section>
    );
}
