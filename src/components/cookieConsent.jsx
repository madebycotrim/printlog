import React, { useState, useEffect } from 'react';
import { ShieldAlert, Database, X, ChevronLeft, Check, Settings2, Lock } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [view, setView] = useState('simple');

    // Estados mapeados para os parâmetros oficiais do Google
    const [prefs, setPrefs] = useState({
        analytics_storage: true,
        ad_storage: false,
        ad_user_data: false,
        ad_personalization: false,
        functionality_storage: true // Essencial
    });

    useEffect(() => {
        const consent = localStorage.getItem('printlog_consent_v2');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        } else {
            // Se já existe, aplica as permissões salvas no carregamento
            updateGoogleConsent(JSON.parse(consent));
        }
    }, []);

    // Função vital para o Consent Mode V2
    const updateGoogleConsent = (settings) => {
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': settings.analytics_storage ? 'granted' : 'denied',
                'ad_storage': settings.ad_storage ? 'granted' : 'denied',
                'ad_user_data': settings.ad_user_data ? 'granted' : 'denied',
                'ad_personalization': settings.ad_personalization ? 'granted' : 'denied',
            });
        }
    };

    const savePreferences = (all = false) => {
        const finalPrefs = all
            ? {
                analytics_storage: true,
                ad_storage: true,
                ad_user_data: true,
                ad_personalization: true,
                functionality_storage: true
            }
            : prefs;

        localStorage.setItem('printlog_consent_v2', JSON.stringify(finalPrefs));
        updateGoogleConsent(finalPrefs);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    const Toggle = ({ active, disabled, onClick }) => (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`w-10 h-5 rounded-full transition-all relative ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} ${active ? 'bg-sky-500' : 'bg-zinc-800'}`}
        >
            <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${active ? 'left-6 bg-white' : 'left-1 bg-zinc-500'}`} />
        </button>
    );

    return (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[420px] z-[100] animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="bg-[#0c0c0e]/95 backdrop-blur-2xl border border-sky-500/20 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                    <Settings2 size={180} />
                </div>

                <div className="relative z-10">
                    {view === 'simple' ? (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-500 border border-sky-500/20">
                                        <ShieldAlert size={20} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 italic">Consent V2 Ready</span>
                                </div>
                                <button onClick={() => setIsVisible(false)} className="text-zinc-600 hover:text-white transition-colors"><X size={18} /></button>
                            </div>
                            <h4 className="text-white font-black text-xl uppercase italic tracking-tighter mb-3 leading-tight">Otimizando sua <br /><span className="text-sky-500">Experiência Maker.</span></h4>
                            <p className="text-zinc-500 text-[11px] leading-relaxed mb-8 font-medium italic">Utilizamos cookies para processar seus orçamentos e garantir que seus cálculos de filamento sejam precisos via Google Analytics e Ads.</p>
                            <div className="flex gap-3">
                                <button onClick={() => savePreferences(true)} className="flex-1 bg-white text-black py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all active:scale-95">Aceitar Tudo</button>
                                <button onClick={() => setView('config')} className="px-6 border border-white/5 text-zinc-500 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">Configurar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <button onClick={() => setView('simple')} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors group/back">
                                <ChevronLeft size={16} className="group-hover/back:-translate-x-1 transition-transform" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Voltar</span>
                            </button>
                            <h4 className="text-white font-black text-lg uppercase italic mb-6 tracking-tighter">Privacidade de Dados</h4>
                            <div className="space-y-4 mb-8">
                                {/* Essenciais */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-[10px] font-bold text-white uppercase italic">Essenciais</p>
                                            <Lock size={10} className="text-zinc-500" />
                                        </div>
                                        <p className="text-[9px] text-zinc-500 leading-none">Login e cálculos de farm.</p>
                                    </div>
                                    <Toggle active={true} disabled={true} />
                                </div>

                                {/* Analytics */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-bold text-white uppercase italic mb-1">Analíticos</p>
                                        <p className="text-[9px] text-zinc-500 leading-none">Melhoria de performance (GA4).</p>
                                    </div>
                                    <Toggle
                                        active={prefs.analytics_storage}
                                        onClick={() => setPrefs({ ...prefs, analytics_storage: !prefs.analytics_storage })}
                                    />
                                </div>

                                {/* Marketing (G-Ads V2) */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-bold text-white uppercase italic mb-1">Publicidade</p>
                                        <p className="text-[9px] text-zinc-500 leading-none">Sinais de Ads e personalização.</p>
                                    </div>
                                    <Toggle
                                        active={prefs.ad_storage}
                                        onClick={() => {
                                            const val = !prefs.ad_storage;
                                            setPrefs({ ...prefs, ad_storage: val, ad_user_data: val, ad_personalization: val });
                                        }}
                                    />
                                </div>
                            </div>
                            <button onClick={() => savePreferences(false)} className="w-full bg-sky-600 text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-sky-500 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Check size={14} strokeWidth={3} /> Salvar Preferências
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;