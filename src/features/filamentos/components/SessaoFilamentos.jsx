import React, { useState, useMemo } from "react";
import { Layers, ChevronDown, PackageOpen } from "lucide-react";
import { FilamentCard, FilamentRow } from "./CardsFilamentos";

export default function SessaoFilamentos({
    tipo,
    items = [],
    acoes,
    viewMode,
    currentHumidity
}) {
    const [isOpen, setIsOpen] = useState(true);

    // Garantimos que items seja um array para evitar erros de renderização
    const listaItens = useMemo(() => (Array.isArray(items) ? items : []), [items]);

    // Lógica de cálculo centralizada e otimizada para performance
    const { pesoFormatado, totalCarreteis } = useMemo(() => {
        const totalGrams = listaItens.reduce((acc, item) => {
            const peso = parseFloat(item.peso_atual);
            return acc + (isNaN(peso) ? 0 : peso);
        }, 0);

        return {
            pesoFormatado: (totalGrams / 1000).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }),
            totalCarreteis: String(listaItens.length).padStart(2, '0')
        };
    }, [listaItens]);

    // Título formatado (Nomes amigáveis)
    const tituloSessao = (tipo || "Outros Materiais").toUpperCase();

    return (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Cabeçalho da Seção */}
            <div className="flex items-center gap-6 group">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-5 hover:opacity-90 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 rounded-xl"
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? 'Recolher' : 'Expandir'} categoria ${tipo}`}
                >
                    {/* ÍCONE COM ESTADO DINÂMICO */}
                    <div className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center ${isOpen
                            ? 'bg-zinc-950/40 border-zinc-800 text-sky-400 shadow-[inset_0_0_10px_rgba(14,165,233,0.1)]'
                            : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                        }`}>
                        <Layers size={18} strokeWidth={2} />
                    </div>

                    <div className="flex flex-col items-start">
                        <div className="flex items-center gap-3">
                            <h2 className="text-zinc-50 text-base font-bold uppercase tracking-widest leading-none">
                                {tituloSessao}
                            </h2>
                            <ChevronDown
                                size={16}
                                className={`text-zinc-600 transition-transform duration-500 ease-in-out ${!isOpen ? "-rotate-90" : ""}`}
                            />
                        </div>
                        <span className="text-xs text-zinc-500 font-medium mt-2 tracking-wide text-left">
                            {listaItens.length} {listaItens.length === 1 ? 'material disponível' : 'materiais disponíveis'}
                        </span>
                    </div>
                </button>

                {/* Linha Decorativa Dinâmica */}
                <div className={`h-px flex-1 transition-all duration-700 ${isOpen ? 'bg-zinc-900/50/60' : 'bg-zinc-950/40/20'} mx-2`} />

                {/* Métricas do Painel (Exibição de dados) */}
                <div className="flex items-center gap-6 px-5 py-2 rounded-2xl bg-zinc-950/40/40 border border-zinc-800/50 backdrop-blur-md shadow-sm select-none">
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase mb-1 tracking-widest">Peso Total</span>
                        <span className="text-sm font-bold font-mono text-sky-400 leading-none">
                            {pesoFormatado}<span className="text-[10px] ml-0.5 font-sans text-sky-600/70">kg</span>
                        </span>
                    </div>

                    <div className="w-px h-6 bg-zinc-900/50/60" />

                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase mb-1 tracking-widest">Estoque</span>
                        <span className="text-sm font-bold font-mono text-zinc-200 leading-none">
                            {totalCarreteis}
                        </span>
                    </div>
                </div>
            </div>

            {/* Conteúdo Dinâmico */}
            {isOpen && (
                <div
                    className={`animate-in fade-in slide-in-from-top-2 duration-500 ease-out ${viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 pb-10"
                            : "flex flex-col gap-3 pb-6"
                        }`}
                >
                    {listaItens.length > 0 ? (
                        listaItens.map(item => (
                            viewMode === 'grid'
                                ? <FilamentCard
                                    key={item.id}
                                    item={item}
                                    currentHumidity={currentHumidity}
                                    {...acoes}
                                />
                                : <FilamentRow
                                    key={item.id}
                                    item={item}
                                    currentHumidity={currentHumidity}
                                    {...acoes}
                                />
                        ))
                    ) : (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center border border-dashed border-zinc-800/50 rounded-[2rem] bg-zinc-950/40/5">
                            <PackageOpen size={32} className="text-zinc-700 mb-3 stroke-[1.5]" />
                            <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.2em]">
                                Nenhum material nessa categoria
                            </span>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
