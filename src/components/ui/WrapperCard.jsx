import React from 'react';
import { HelpCircle } from "lucide-react";

/**
 * WrapperCard Component
 * Wraps calculator sections with a standard visual style, step number, and help tooltip.
 */
const WrapperCard = React.memo(({ children, title, step, className = "", zPriority = "z-10", hasNext, subtotal }) => {
    const textosAjuda = {
        "01": "Defina o preço do seu filamento e o peso da peça (em gramas) que aparece no seu fatiador.",
        "02": "O tempo de impressão afeta o custo de energia e o desgaste da máquina. O tempo manual é o seu trabalho direto.",
        "03": "As taxas de venda diminuem o seu lucro bruto. Veja aqui como elas afetam o preço final.",
        "04": "Lixas, tintas, parafusos e embalagens devem ser somados para você não sair no prejuízo.",
        "05": "A margem de lucro desejada é calculada sobre o preço final de venda (Método do Divisor)."
    };

    return (
        <div className={`relative ${zPriority} ${className} mx-2`}>
            <div className={`relative bg-zinc-900/20 border border-zinc-800 backdrop-blur-md rounded-2xl p-5 flex flex-col gap-4 group focus-within:z-50 focus-within:border-sky-500/30 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg`}>
                <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-[10px] font-black text-sky-500 shadow-sm group-hover:scale-110 transition-transform">
                            {step}
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] group-hover:text-zinc-300 transition-colors">{title}</h3>
                            {subtotal && (
                                <span className="text-[10px] font-mono font-bold text-sky-400 animate-in fade-in slide-in-from-left-2">
                                    {subtotal}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="group/info relative">
                        <HelpCircle size={14} className="text-zinc-700 hover:text-sky-500 cursor-help transition-colors" />
                        <div className="absolute right-0 top-6 w-48 p-3 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl invisible opacity-0 group-hover/info:visible group-hover/info:opacity-100 z-[110] transition-all pointer-events-none transform translate-y-1 group-hover/info:translate-y-0">
                            <p className="text-[9px] text-zinc-400 uppercase font-bold leading-relaxed">{textosAjuda[step]}</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-visible pt-2">{children}</div>
            </div>

            {/* LINHA CONECTORA VISUAL */}
            {/* Se houver próximo passo, desenha uma linha conectando verticalmente */}
            {
                (hasNext) && (
                    <div className="absolute left-[2.2rem] -bottom-6 w-px h-6 bg-gradient-to-b from-zinc-800 to-zinc-900 z-0"></div>
                )
            }
        </div >
    );
});

export default WrapperCard;
