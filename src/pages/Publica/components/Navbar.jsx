import React from 'react';
import { useLocation } from "wouter";
import logo from '../../../assets/logo-branca.png';

export default function Navbar() {
    const [, setLocation] = useLocation();

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050506]/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <img src={logo} alt="PrintLog" className="w-8 h-8 object-contain" />
                    <span className="text-xl font-bold tracking-tighter uppercase italic text-white flex items-center gap-2">
                        PRINTLOG
                        <span className="bg-sky-500/20 border border-sky-500/30 text-sky-400 text-[9px] px-1.5 py-0.5 rounded-md not-italic">BETA</span>
                    </span>
                </div>
                <div className="flex items-center gap-8">
                    <button onClick={() => setLocation('/login')} className="hidden sm:block text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest">Entrar</button>
                    <button onClick={() => setLocation('/register')} className="bg-white text-black px-7 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-sky-500 hover:text-white">Acessar</button>
                </div>
            </div>
        </nav>
    );
}
