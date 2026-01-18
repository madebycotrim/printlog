import React from 'react';
import { Check, ShieldCheck, Zap } from 'lucide-react';
import { useLocation } from "wouter";

const PricingCard = ({ title, price, oldPrice, discountBadge, features, recommended, onSelect }) => (
    <div className={`relative p-8 rounded-[2.5rem] flex flex-col h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${recommended
        ? 'bg-[#0c0c0e] border border-sky-500/30 shadow-[0_0_50px_rgba(14,165,233,0.1)] scale-100 md:scale-105 z-10'
        : 'bg-[#050506] border border-white/5 opacity-80 hover:opacity-100 hover:border-white/10'
        }`}>

        {recommended && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] py-1.5 px-4 rounded-full shadow-lg shadow-sky-500/20 animate-bounce" style={{ animationDuration: '3s' }}>
                Mais Popular
            </div>
        )}

        {discountBadge && (
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 rotate-12 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-lg shadow-xl border-2 border-[#0c0c0e] z-20 animate-pulse">
                {discountBadge}
            </div>
        )}

        <div className="mb-8">
            <h3 className={`text-lg font-bold uppercase tracking-wider mb-2 ${recommended ? 'text-white' : 'text-zinc-400'}`}>
                {title}
            </h3>
            <div className="flex items-baseline gap-2">
                {oldPrice && <span className="text-lg text-zinc-600 line-through decoration-rose-500/50 decoration-2">{oldPrice}</span>}
                <span className="text-4xl font-black text-white">{price}</span>
                {price !== "Grátis" && !price.includes("Grátis") && <span className="text-sm text-zinc-500">/mês</span>}
            </div>
        </div>

        <ul className="space-y-4 mb-8 flex-1">
            {features.map((feat, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                    <Check size={16} className={`shrink-0 mt-0.5 ${recommended ? 'text-sky-500' : 'text-zinc-600'}`} />
                    <span className={feat.highlight ? 'text-white font-medium' : ''}>{feat.text}</span>
                </li>
            ))}
        </ul>

        <button
            onClick={onSelect}
            className={`w-full py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 ${recommended
                ? 'bg-white text-black hover:bg-sky-500 hover:text-white shadow-xl'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
        >
            {recommended ? <Zap size={16} /> : null}
            {price.includes("Grátis") ? "Começar Agora" : "Assinar Pro"}
        </button>
    </div>
);

const PricingSection = () => {
    const [, setLocation] = useLocation();

    return (
        <section className="py-24 px-8 relative z-10" id="pricing">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                        <ShieldCheck size={12} /> Garantia de 7 dias
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
                        Invista no seu <span className="text-emerald-500">negócio.</span>
                    </h2>
                    <p className="text-zinc-500 text-lg max-w-lg mx-auto">
                        Aproveite o <strong className="text-white">acesso total liberado</strong> gratuitamente durante nossa fase de Beta Público.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <PricingCard
                        title="Maker Iniciante"
                        price="Sempre Grátis"
                        features={[
                            { text: "Gestão de até 2 impressoras" },
                            { text: "Orçamentos básicos (PDF simples)" },
                            { text: "Cálculo de custo de filamento" },
                            { text: "Acesso à comunidade" }
                        ]}
                        onSelect={() => setLocation('/register')}
                    />
                    <PricingCard
                        title="Oficina Pro"
                        price="Grátis"
                        oldPrice="R$ 19,90"
                        discountBadge="100% OFF NO BETA"
                        recommended={true}
                        features={[
                            { text: "Impressoras ILIMITADAS", highlight: true },
                            { text: "Orçamentos Profissionais (PDF e WhatsApp)", highlight: true },
                            { text: "Gestão de Estoque Avançada (Alertas)" },
                            { text: "Cálculo de ROI e Depreciação" },
                            { text: "Suporte Prioritário" }
                        ]}
                        onSelect={() => setLocation('/register?plan=pro')}
                    />
                </div>

                <p className="text-center text-zinc-600 text-xs mt-12">
                    * O plano Pro será cobrado apenas após o fim do Beta. Avisaremos com 30 dias de antecedência.
                </p>
            </div>
        </section>
    );
};

export default PricingSection;
