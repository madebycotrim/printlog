import React, { useMemo, useState } from "react";
import { DollarSign, Disc, Layers, Coins, Beaker } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";
import { Tooltip } from "../../../components/ui/Tooltip";
import { parseNumber } from "../../../utils/numbers";

export default function FormularioEstoqueFilamento({ formulario, atualizarFormulario, mostrarErros, setFormulario, dadosIniciais }) {
    const [usarConversao, setUsarConversao] = useState(false);

    const isResin = formulario.tipo === 'SLA';
    const unitLabel = isResin ? 'ml' : 'g';
    const qtyLabel = isResin ? 'Volume Total' : 'Peso Total';

    const custoPorUnidade = useMemo(() => {
        const preco = parseNumber(formulario.preco);
        const qtd = parseNumber(formulario.peso_total);
        if (!preco || !qtd) return null;

        const valor = preco / qtd;
        let cor = "text-emerald-500";
        // Ajuste de 'caro' para resina (costuma ser mais caro que filamento)
        const threshold = isResin ? 0.50 : 0.10;

        if (valor > threshold) cor = "text-yellow-500";
        if (valor > (threshold * 2)) cor = "text-rose-500";

        return (
            <span className={`font-mono ${cor} font-bold text-[10px] tracking-tight flex items-center gap-1`}>
                <Coins size={10} /> {valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 3 })} /{unitLabel}
            </span>
        );
    }, [formulario.preco, formulario.peso_total, isResin, unitLabel]);

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
                        {custoPorUnidade}
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
                            {usarConversao ? 'Peso (g)' : qtyLabel} {usarConversao ? '' : `(${unitLabel})`} {mostrarErros && !parseNumber(formulario.peso_total) && "*"}
                        </label>
                        {isResin && (
                            <button
                                onClick={() => setUsarConversao(!usarConversao)}
                                className="text-[9px] font-bold text-sky-500 hover:text-sky-400 uppercase tracking-wider transition-colors"
                            >
                                {usarConversao ? 'Usar ML' : 'Usar Gramas'}
                            </button>
                        )}
                    </div>

                    {usarConversao && isResin ? (
                        <div className="relative">
                            <UnifiedInput
                                icon={Disc}
                                suffix="g"
                                placeholder="1000"
                                onChange={(e) => {
                                    const gramas = parseNumber(e.target.value);
                                    if (!isNaN(gramas)) {
                                        const densidade = parseNumber(formulario.densidade) || 1.25;
                                        const ml = Math.round(gramas / densidade);
                                        setFormulario(prev => ({
                                            ...prev,
                                            peso_total: ml,
                                            peso_atual: !dadosIniciais ? ml : prev.peso_atual
                                        }));
                                    }
                                }}
                                align="right"
                            />
                            <div className="absolute right-0 top-full mt-1 text-[9px] text-zinc-500 font-mono text-right w-full">
                                ≈ {formulario.peso_total}ml (d={formulario.densidade || 1.25})
                            </div>
                        </div>
                    ) : (
                        <UnifiedInput
                            icon={isResin ? Beaker : Disc}
                            suffix={unitLabel}
                            value={formulario.peso_total}
                            onChange={(e) => {
                                const novoValor = e.target.value;
                                if (/^[0-9.]*$/.test(novoValor)) {
                                    setFormulario(anterior => ({
                                        ...anterior,
                                        peso_total: novoValor,
                                        // Manter sincronizado se for criação
                                        peso_atual: !dadosIniciais ? novoValor : anterior.peso_atual
                                    }));
                                }
                            }}
                            error={mostrarErros && !parseNumber(formulario.peso_total)}
                            align="right"
                        />
                    )}
                </div>

                <div className="space-y-1.5 w-full">
                    <div className="flex justify-between items-end px-1 min-h-[18px]">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                            {isResin ? 'Volume Restante' : 'Peso Restante'}
                            <div className="w-3 h-3">
                                <Tooltip
                                    text={`Deixe em branco para indicar que o ${isResin ? 'frasco' : 'carretel'} está cheio.`}
                                />
                            </div>
                        </label>
                    </div>
                    <UnifiedInput
                        icon={Layers}
                        suffix={unitLabel}
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
