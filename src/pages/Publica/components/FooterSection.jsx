import React from 'react';
import { useLocation } from "wouter";
import { Mail } from 'lucide-react';
import logo from '../../../assets/logo-branca.png';

export default function FooterSection() {
    const [, setLocation] = useLocation();

    return (
        <footer className="py-12 sm:py-20 border-t border-white/5 bg-[#050506] relative z-10 text-[10px]">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="PrintLog" className="w-5 h-5 opacity-80" />
                            <span className="text-sm font-bold uppercase italic text-white tracking-widest">PrintLog</span>
                        </div>
                        <p className="text-zinc-500 leading-relaxed max-w-xs">
                            Sistema de gestão profissional para impressão 3D.
                            Calculamos o custo real para você lucrar de verdade.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white uppercase tracking-widest mb-4">Produto</h4>
                        <ul className="space-y-2 text-zinc-500">
                            <li><a href="#pricing" className="hover:text-sky-500 transition-colors">Planos e Preços</a></li>
                            <li><button onClick={() => setLocation('/login')} className="hover:text-sky-500 transition-colors">Login</button></li>
                            <li><button onClick={() => setLocation('/register')} className="hover:text-sky-500 transition-colors">Criar Conta</button></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white uppercase tracking-widest mb-4">Legal</h4>
                        <ul className="space-y-2 text-zinc-500">
                            <li><a href="/terms-of-service" className="hover:text-sky-500 transition-colors">Termos de Uso</a></li>
                            <li><a href="/privacy-policy" className="hover:text-sky-500 transition-colors">Política de Privacidade</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white uppercase tracking-widest mb-4">Contato</h4>
                        <a href="mailto:suporte@printlog.com.br" className="group flex items-center gap-2 text-zinc-500 hover:text-sky-500 transition-colors">
                            <Mail size={14} />
                            <span>suporte@printlog.com.br</span>
                        </a>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-600 font-medium tracking-wider">
                    <span>© {new Date().getFullYear()} PrintLog. Todos os direitos reservados.</span>
                    <span className="uppercase text-[8px] tracking-[0.2em] opacity-50">madebycotrim</span>
                </div>
            </div>
        </footer>
    );
}
