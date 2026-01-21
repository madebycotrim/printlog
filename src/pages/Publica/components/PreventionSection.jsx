import React from 'react';
import {
    AlertTriangle, Wrench, ShoppingBag, History, ShieldAlert
} from 'lucide-react';
import Reveal from './common/Reveal';
import Badge from './common/Badge';

export default function PreventionSection() {
    return (
        <section className="py-24 sm:py-32 bg-[#050506] border-y border-white/5 relative z-10 text-center">
            <Reveal>
                <div className="max-w-7xl mx-auto px-8">
                    <Badge label="Evite prejuízos" color="rose" icon={ShieldAlert} className="mx-auto" />

                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] uppercase italic mt-4">
                        PARE DE JOGAR <br /><span className="text-rose-500">DINHEIRO FORA</span>
                    </h2>

                    <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl mt-8 mb-12 leading-relaxed font-light">
                        Pequenos desperdícios escondidos no seu dia a dia estão matando sua margem de lucro sem você perceber.
                        Tenha controle total sobre cada grama de filamento e cada minuto de máquina ligada.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                        {[
                            { title: 'Peças que deram errado', icon: AlertTriangle, desc: 'Calcule o prejuízo real quando a peça descola da mesa ou a luz acaba.' },
                            { title: 'Troca de bico e peças', icon: Wrench, desc: 'Junte uma reserva automática para bicos, correias e lubrificação sem sustos.' },
                            { title: 'Taxas de Venda', icon: ShoppingBag, desc: 'Saiba seu lucro de verdade após descontar as taxas de Shopee ou Mercado Livre.' },
                            { title: 'Seu tempo vale ouro', icon: History, desc: 'Não esqueça de cobrar pelo tempo que você gasta fatiando e limpando a peça.' }
                        ].map((item, i) => (
                            <Reveal key={i} delay={i * 0.1} className="h-full">
                                <div className="p-8 sm:p-10 rounded-[2.5rem] bg-[#0a0a0c] border border-white/5 hover:border-rose-500/20 transition-all group h-full">
                                    <item.icon size={28} className="text-rose-500 mb-6 sm:mb-8 group-hover:scale-110 transition-transform" />
                                    <h4 className="text-lg sm:text-xl font-bold text-white uppercase mb-3 italic tracking-tighter">{item.title}</h4>
                                    <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </Reveal>
        </section>
    );
}
