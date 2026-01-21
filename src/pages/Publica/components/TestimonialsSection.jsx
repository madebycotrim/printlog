import React from 'react';
import { Quote, Star } from 'lucide-react';

const TestimonialsSection = () => {
    const testimonials = [
        {
            name: "Ricardo Mendes",
            role: "Maker & Youtuber",
            text: "Antes eu chutava o preço e perdia dinheiro. Com o PrintLog, sei exatamente quanto cada peça custa, até a energia.",
            initials: "RM",
            color: "bg-emerald-500"
        },
        {
            name: "Ana Clara",
            role: "Loja 3D Criativa",
            text: "A gestão de filamentos salvou minha produção. O alerta de 'rolo no fim' é simplesmente genial para prints longos.",
            initials: "AC",
            color: "bg-purple-500"
        },
        {
            name: "Felipe Torres",
            role: "Engenharia de Protótipos",
            text: "Profissionalismo total. Meus clientes ficam impressionados quando mando o orçamento detalhado direto pelo WhatsApp.",
            initials: "FT",
            color: "bg-sky-500"
        }
    ];

    return (
        <section className="py-24 px-8 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
                        Quem usa <span className="text-sky-500">aprova.</span>
                    </h2>
                    <p className="text-zinc-500 text-lg">Junte-se à comunidade que está profissionalizando a impressão 3D.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-[#0a0a0c] border border-white/5 p-8 rounded-[2rem] relative group hover:border-sky-500/20 hover:-translate-y-2 hover:bg-white/5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 0.2}s` }}>
                            <Quote size={40} className="text-zinc-800 absolute top-6 right-6 group-hover:text-sky-500/20 transition-colors" />

                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className="text-amber-500 fill-amber-500" />
                                ))}
                            </div>

                            <p className="text-zinc-300 text-sm leading-relaxed mb-8 relative z-10">
                                "{t.text}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-xs`}>
                                    {t.initials}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm uppercase">{t.name}</h4>
                                    <p className="text-sky-500 text-[10px] font-bold uppercase tracking-wider">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
