import React from 'react';
import {
    Coins, Database, MessageSquare, Cpu
} from 'lucide-react';
import Reveal from './common/Reveal';
import Badge from './common/Badge';

const GlassCard = ({ children, className = "" }) => (
    <div className={`bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 lg:p-10 overflow-hidden hover:border-white/10 group ${className}`}>
        {children}
    </div>
);


export default function FeaturesSection() {
    return (
        <section className="py-24 px-8 max-w-7xl mx-auto z-10 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
                <Reveal className="lg:col-span-8">
                    <GlassCard>
                        <div className="space-y-6">
                            <Badge icon={Coins} label="Precificação Inteligente" color="emerald" />
                            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Quanto custa o <span className="text-emerald-500">bico ligado?</span></h3>
                            <p className="text-zinc-500 text-lg max-w-lg">Contabilizamos a luz da sua região, o desgaste da sua máquina e até uma reserva para peças que dão errado (warp ou bico entupido).</p>
                        </div>
                        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-8 bg-black/40 p-8 rounded-[2rem] border border-white/5 font-bold uppercase italic">
                            <div><p className="text-[10px] text-zinc-600 mb-1">Luz por hora</p><p className="text-2xl text-white">R$ 0,82</p></div>
                            <div className="border-l border-white/5 pl-8"><p className="text-[10px] text-zinc-600 mb-1">Desgaste/H</p><p className="text-2xl text-white">R$ 0,25</p></div>
                            <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-8"><p className="text-[10px] text-emerald-500 mb-1">Preço Sugerido</p><p className="text-3xl text-emerald-400">R$ 54,90</p></div>
                        </div>
                    </GlassCard>
                </Reveal>

                <Reveal className="lg:col-span-4 flex flex-col justify-between" delay={0.2}>
                    <GlassCard className="h-full">
                        <div className="space-y-4">
                            <Badge icon={Database} label="Estoque de Materiais" color="sky" />
                            <h3 className="text-2xl font-bold uppercase italic leading-tight">Meus <br /> Filamentos.</h3>
                            <p className="text-zinc-500 text-sm font-medium italic">Saiba exatamente se o rolo aguenta o tranco até o fim da impressão.</p>
                        </div>
                        <div className="space-y-3 mt-8">
                            {[
                                { name: "PLA Silk Ouro", weight: "820g", color: "bg-amber-500", p: 82 },
                                { name: "PETG Preto", weight: "110g", color: "bg-rose-500", p: 11, alert: true },
                                { name: "PLA Branco", weight: "500g", color: "bg-white", p: 50 },
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex justify-between items-center mb-2 font-bold text-[9px] uppercase">
                                        <span className="text-zinc-400">{item.name}</span>
                                        <span className={item.alert ? "text-rose-500" : "text-white"}>{item.weight}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: `${item.p}%` }} />
                                    </div>
                                    <div className="w-8 h-8 rounded-full border-2 border-[#050506] bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 overflow-hidden mt-2 hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 15}`} alt="User" loading="lazy" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </Reveal>

                <Reveal className="lg:col-span-12" delay={0.4}>
                    <GlassCard className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <Badge icon={MessageSquare} label="Vendas" color="emerald" />
                            <h3 className="text-4xl md:text-5xl font-black text-white uppercase italic leading-[0.9] tracking-tighter">Mande o orçamento <br /> direto no <span className="text-emerald-500">WhatsApp.</span></h3>
                            <p className="text-zinc-500 text-lg max-w-sm italic">O sistema cria uma mensagem profissional com todos os detalhes técnicos para você mandar pro cliente em um clique.</p>
                        </div>
                        <div className="w-full max-w-[380px] bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="flex justify-between items-center p-5 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400"><Cpu size={18} /></div>
                                    <p className="text-[10px] font-bold text-white uppercase leading-none">PrintLog<br /><span className="text-sky-500 text-[8px]">Calculadora Maker</span></p>
                                </div>
                            </div>
                            <div className="p-6 space-y-4 bg-[#0a0a0c]">
                                <div className="p-5 bg-[#0c0c0e] rounded-xl border border-white/5 font-mono text-[10px] space-y-3 text-zinc-300">
                                    <p className="text-zinc-500">*ORÇAMENTO DE IMPRESSÃO 3D*</p>
                                    <p>*Peça:* Samurai V2 (Resolução 0.12mm)</p>
                                    <p>*Valor total:* <span className="text-emerald-400 font-bold">R$ 180,00</span></p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        const btn = e.currentTarget;
                                        const originalText = btn.innerHTML;

                                        // Feedback Visual Tátil
                                        btn.innerHTML = `<span class="flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copiado!</span>`;
                                        btn.classList.remove('bg-emerald-500', 'hover:bg-emerald-400', 'text-black');
                                        btn.classList.add('bg-zinc-800', 'text-emerald-400', 'scale-95');

                                        setTimeout(() => {
                                            btn.innerHTML = originalText;
                                            btn.classList.add('bg-emerald-500', 'hover:bg-emerald-400', 'text-black');
                                            btn.classList.remove('bg-zinc-800', 'text-emerald-400', 'scale-95');
                                        }, 2000);
                                    }}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 py-3.5 rounded-xl text-black font-bold text-[10px] uppercase transition-all duration-200"
                                >
                                    Copiar e mandar pro cliente
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </Reveal>
            </div>
        </section>
    );
}
