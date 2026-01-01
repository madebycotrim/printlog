import React, { useState } from "react";
import { Layers, ChevronDown } from "lucide-react";
import { FilamentCard, FilamentRow } from "./cardsFilamentos";

export default function SessaoFilamentos({ tipo, items = [], acoes, viewMode, currentHumidity }) {
    const [isOpen, setIsOpen] = useState(true);
 
    // Garantimos que items seja um array para evitar erro no reduce
    const listaItens = Array.isArray(items) ? items : [];

    // Lógica de cálculo: Soma da massa atual de todos os rolos desta sessão
    const pesoTotalGrama = listaItens.reduce((acc, item) => {
        const peso = Number(item.peso_atual);
        return acc + (isNaN(peso) ? 0 : peso);
    }, 0);

    // Conversão para KG com tratamento de precisão
    const pesoFormatado = (pesoTotalGrama / 1000).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // Quantidade de carretéis formatada com zero à esquerda
    const totalCarreteis = String(listaItens.length).padStart(2, '0');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header da Sessão */}
            <div className="flex items-center gap-6 group">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-5 hover:opacity-90 transition-all duration-200 focus:outline-none"
                    aria-expanded={isOpen}
                >
                    {/* ÍCONE COM ESTADO DINÂMICO */}
                    <div className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center ${
                        isOpen 
                        ? 'bg-zinc-900 border-zinc-800 text-sky-400 shadow-inner' 
                        : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                    }`}>
                        <Layers size={18} strokeWidth={2} />
                    </div>

                    <div className="flex flex-col items-start">
                        <div className="flex items-center gap-3">
                            <h2 className="text-zinc-50 text-base font-bold uppercase tracking-widest leading-none">
                                {tipo || "Sem Categoria"}
                            </h2>
                            <ChevronDown
                                size={16}
                                className={`text-zinc-600 transition-transform duration-300 ease-out ${!isOpen ? "-rotate-90" : ""}`}
                            />
                        </div>
                        <span className="text-xs text-zinc-500 font-medium mt-2 tracking-wide text-left">
                            Filamentos da categoria {tipo}
                        </span>
                    </div>
                </button>

                <div className="h-px flex-1 bg-zinc-800/40 mx-2" />

                {/* Métricas HUD */}
                <div className="flex items-center gap-6 px-5 py-2 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md shadow-sm">
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase mb-1 tracking-widest">Massa Total</span>
                        <span className="text-sm font-bold font-mono text-sky-400 leading-none">
                            {pesoFormatado}<span className="text-[10px] ml-1 font-sans text-sky-600/70">kg</span>
                        </span>
                    </div>
                    
                    <div className="w-px h-6 bg-zinc-800/60" />
                    
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase mb-1 tracking-widest">Carretéis</span>
                        <span className="text-sm font-bold font-mono text-zinc-200 leading-none">
                            {totalCarreteis}
                        </span>
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            {isOpen && (
                <div className={`animate-in fade-in slide-in-from-top-2 duration-500 ease-out ${
                        viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 pb-10"
                            : "flex flex-col gap-3 pb-6"
                    }`}
                >
                    {listaItens.map(item => (
                        viewMode === 'grid'
                            ? <FilamentCard key={item.id} item={item} currentHumidity={currentHumidity} {...acoes} />
                            : <FilamentRow key={item.id} item={item} currentHumidity={currentHumidity} {...acoes} />
                    ))}
                    
                    {listaItens.length === 0 && (
                        <div className="col-span-full py-10 text-center border border-dashed border-zinc-800 rounded-2xl">
                            <span className="text-zinc-600 text-xs uppercase font-bold tracking-widest">Nenhum filamento nesta categoria</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}