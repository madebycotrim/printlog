import React, { useMemo } from "react";
import { DollarSign, Disc, Layers, Coins } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";
import { Tooltip } from "../../../components/ui/Tooltip";
import { parseNumber } from "../../../utils/numbers";

export default function FormularioEstoqueFilamento({ formulario, atualizarFormulario, mostrarErros, setFormulario, dadosIniciais }) {

    const custoPorGrama = useMemo(() => {
        const preco = parseNumber(formulario.preco);
        const peso = parseNumber(formulario.peso_total);
        if (!preco || !peso) return null;

        const valor = preco / peso;
        let cor = "text-emerald-500";
        if (valor > 0.10) cor = "text-yellow-500";
        if (valor > 0.20) cor = "text-rose-500";

        return (
            <span className={`font-mono ${cor} font-bold text-[10px] tracking-tight flex items-center gap-1`}>
                <Coins size={10} /> {valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 3 })} /g
            </span>
        );
    }, [formulario.preco, formulario.peso_total]);

    return (
        <section className="space-y-5">
            <div className="flex items-center gap-4">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">[02] Estoque & Valores</h4>
                <div className="h-px bg-zinc-800/50 flex-1" />
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-5">
                <div className="space-y-1.5 w-full">
                    <div className="flex justify-between items-end px-1 min-h-[18px]">
                        <label className={`text-[10px] font-bold uppercase tracking-wide ${mostrarErros && formulario.preco === "" ? "text-rose-500 animate-pulse" : "text-zinc-500"}`}>
                            Preço Pago {mostrarErros && formulario.preco === "" && "*"}
                        </label>
                        {custoPorGrama}
                    </div>
                    <UnifiedInput
                        icon={DollarSign}
                        value={formulario.preco}
                        onChange={(e) => {
                            const v = e.target.value;
                            if (/^[0-9.,]*$/.test(v)) atualizarFormulario('preco', v);
                        }}
                        placeholder="0,00"
                        error={mostrarErros && formulario.preco === ""}
                        align="right"
                    />
                </div>

                <div className="space-y-1.5 w-full">
                    <div className="flex justify-between items-end px-1 min-h-[18px]">
                        <label className={`text-[10px] font-bold uppercase tracking-wide ${mostrarErros && !parseNumber(formulario.peso_total) ? "text-rose-500 animate-pulse" : "text-zinc-500"}`}>
                            Peso Total (g) {mostrarErros && !parseNumber(formulario.peso_total) && "*"}
                        </label>
                    </div>
                    <UnifiedInput
                        icon={Disc}
                        suffix="g"
                        value={formulario.peso_total}
                        onChange={(e) => {
                            const novoValor = e.target.value;
                            if (/^[0-9.]*$/.test(novoValor)) {
                                setFormulario(anterior => ({
                                    ...anterior,
                                    peso_total: novoValor,
                                    // Não preenche mais automaticamente peso_atual, mantém vazio para novos itens
                                    peso_atual: !dadosIniciais ? formulario.peso_atual : anterior.peso_atual
                                }));
                            }
                        }}
                        error={mostrarErros && !parseNumber(formulario.peso_total)}
                        align="right"
                    />
                </div>

                <div className="space-y-1.5 w-full">
                    <div className="flex justify-between items-end px-1 min-h-[18px]">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                            Peso Restante
                            <div className="w-3 h-3">
                                <Tooltip
                                    text="Deixe em branco para indicar que o carretel está cheio (Novo)."
                                />
                            </div>
                        </label>
                    </div>
                    <UnifiedInput
                        icon={Layers}
                        suffix="g"
                        value={formulario.peso_atual !== undefined ? formulario.peso_atual : ""}
                        onChange={(e) => {
                            const v = e.target.value;
                            if (/^[0-9.]*$/.test(v)) atualizarFormulario('peso_atual', v);
                        }}
                        className="border-blue-500/30"
                        align="right"
                        error={false}
                    />
                </div>
            </div>
        </section>
    );
}
