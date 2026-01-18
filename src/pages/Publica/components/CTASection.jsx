import React from 'react';
import { useLocation } from "wouter";
import { ArrowRight, Zap } from 'lucide-react';
import Reveal from './common/Reveal';
import Badge from './common/Badge';

export default function CTASection() {
    const [, setLocation] = useLocation();

    return (
        <section className="py-32 sm:py-40 px-8 relative z-10 text-center bg-zinc-950">
            <Reveal>
                <div className="absolute inset-0 bg-sky-500/5 blur-[150px] pointer-events-none" />
                <div className="max-w-4xl mx-auto space-y-12 sm:space-y-14 relative">
                    <Badge label="Bora imprimir com lucro?" color="sky" icon={Zap} />

                    <h2 className="text-5xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase italic">
                        MENOS CHUTE. <br />
                        <span className="text-zinc-700">MAIS PRODUÇÃO.</span>
                    </h2>

                    <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl leading-relaxed">
                        Abandone as planilhas complexas e as contas de cabeça. Tenha o controle absoluto de cada grama e cada centavo da sua operação 3D.
                    </p>

                    <button
                        onClick={() => setLocation('/register')}
                        className="h-20 px-10 sm:px-14 rounded-[2.5rem] bg-white text-black text-[11px] sm:text-[13px] font-bold uppercase tracking-widest hover:bg-sky-500 hover:text-white shadow-2xl flex items-center justify-center gap-4 group mx-auto transition-all hover:scale-105 active:scale-95"
                    >
                        Criar Conta Grátis
                        <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </Reveal>
        </section>
    );
}
