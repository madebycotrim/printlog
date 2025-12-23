import React, { useState, useEffect, useRef } from 'react';
import {
    User, ShieldCheck, Save, Lock, LogOut, Zap,
    CheckCircle2, RefreshCw, Camera,
    Database, Trash2, Smartphone, Settings2, AlertTriangle, Cloud,
    Globe, Activity, Volume2, Wrench, Box, Ruler
} from 'lucide-react';
import { useClerk, useUser } from "@clerk/clerk-react";

import MainSidebar from "../components/MainSidebar";

// --- COMPONENTE: INPUT ESTILO HUD ---
const HUDInput = ({ label, value, onChange, placeholder, type = "text", info, disabled }) => (
    <div className="space-y-2 group">
        <div className="flex justify-between items-center px-1">
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] group-focus-within:text-[#0091ff] transition-colors italic">{label}</label>
            {info && <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">{info}</span>}
        </div>
        <div className="relative">
            <input
                disabled={disabled}
                type={type} value={value} onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-black border border-zinc-800/80 rounded-xl px-4 py-3.5 text-[11px] text-zinc-100 outline-none focus:border-[#0091ff]/50 focus:shadow-[0_0_15px_rgba(0,145,255,0.05)] transition-all font-mono disabled:opacity-50"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-zinc-800 group-focus-within:bg-[#0091ff]" />
        </div>
    </div>
);

// --- COMPONENTE: TOGGLE ESTILO MODULO ---
const HUDToggle = ({ label, sublabel, enabled, onToggle, icon: Icon }) => (
    <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-500 ${enabled ? 'bg-[#0091ff]/5 border-[#0091ff]/20' : 'bg-[#0a0a0b] border-zinc-900'}`}>
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl border ${enabled ? 'bg-black border-[#0091ff]/30 text-[#0091ff]' : 'bg-black border-zinc-800 text-zinc-600'}`}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
                <span className="text-[11px] font-black text-zinc-200 uppercase tracking-widest">{label}</span>
                <span className="text-[9px] text-zinc-600 font-bold uppercase mt-0.5 tracking-tight">{sublabel}</span>
            </div>
        </div>
        <button
            onClick={() => onToggle(!enabled)}
            className={`w-12 h-6 rounded-full transition-all relative ${enabled ? 'bg-[#0091ff]' : 'bg-zinc-800'}`}
        >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-xl transition-all ${enabled ? 'left-7' : 'left-1'}`} />
        </button>
    </div>
);

// --- SEÇÃO DE CONFIGURAÇÃO (ESTILO INDUSTRIAL) ---
const ConfigSection = ({ title, icon: Icon, badge, children }) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-5">
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[#0091ff] shadow-xl">
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-100 whitespace-nowrap">{title}</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-800/80 via-zinc-800/30 to-transparent" />
            <div className="px-4 py-1.5 rounded-full bg-zinc-900/30 border border-zinc-800/60 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                {badge}
            </div>
        </div>
        {children}
    </div>
);

export default function ConfigPage() {
    const [larguraSidebar, setLarguraSidebar] = useState(72);
    const [activeTab, setActiveTab] = useState('PERFIL');
    const [isSaving, setIsSaving] = useState(false);
    const { signOut } = useClerk();
    const { user, isLoaded } = useUser();
    const fileInputRef = useRef(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [kwhPrice, setKwhPrice] = useState("0.85");
    const [performance, setPerformance] = useState(true);
    const [sounds, setSounds] = useState(true);

    useEffect(() => {
        if (isLoaded && user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
        }
    }, [isLoaded, user]);

    const handleGlobalSave = async () => {
        setIsSaving(true);
        try {
            if (activeTab === 'PERFIL') await user.update({ firstName, lastName });
            alert("Terminal Sincronizado!");
        } catch (err) {
            alert("Falha na sincronia: " + (err.errors?.[0]?.message || "Erro desconhecido"));
        } finally { setIsSaving(false); }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'PERFIL':
                return (
                    <div className="space-y-12">
                        {/* CARD DE PERFIL / ID BADGE */}
                        <div className="relative p-8 rounded-[2rem] bg-[#0a0a0b] border border-[#0091ff]/20 shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden group">
                            <div className="absolute -right-10 -top-10 w-40 h-40 blur-[80px] opacity-10 rounded-full bg-[#0091ff] transition-all group-hover:opacity-20" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-3xl bg-black border-2 border-zinc-800 p-1 group/avatar">
                                        <div className="w-full h-full rounded-[1.2rem] overflow-hidden bg-zinc-900 flex items-center justify-center relative">
                                            {user?.imageUrl ? <img src={user.imageUrl} className="w-full h-full object-cover" alt="Profile" /> : <User size={40} className="text-zinc-700" />}
                                            <button onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera size={20} className="text-white" />
                                            </button>
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) await user.setProfileImage({ file });
                                    }} className="hidden" accept="image/*" />
                                </div>

                                <div className="flex-1 space-y-4 text-center md:text-left">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-[#0091ff] uppercase tracking-[0.4em] italic">Authorized_Operador</p>
                                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
                                            {firstName} {lastName}
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start uppercase font-black text-[8px]">
                                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg flex items-center gap-1.5">
                                            <CheckCircle2 size={10} /> Terminal Ativo
                                        </span>
                                        <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-lg flex items-center gap-1.5">
                                            <Database size={10} /> Node: {user?.id.slice(-8).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ConfigSection title="Dados Cadastrais" icon={User} badge="Módulo 01">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#0a0a0b] p-8 rounded-[2rem] border border-zinc-900">
                                <HUDInput label="NOME_DE_REGISTRO" value={firstName} onChange={setFirstName} />
                                <HUDInput label="IDENTIFICAÇÃO_S" value={lastName} onChange={setLastName} />
                                <HUDInput label="EMAIL_PRINCIPAL" value={user?.primaryEmailAddress?.emailAddress || ""} disabled info="Sincronizado" />
                                <div className="p-4 rounded-xl bg-black border border-zinc-800 flex items-center gap-4">
                                    <Cloud className="text-[#0091ff]" size={18} />
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase leading-relaxed tracking-wider">Servidores Clerk em modo leitura. Alterações de e-mail requerem validação externa.</p>
                                </div>
                            </div>
                        </ConfigSection>
                    </div>
                );

            case 'BANCADA':
                return (
                    <div className="space-y-12">
                        <ConfigSection title="Parâmetros de Produção" icon={Ruler} badge="Módulo 02">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#0a0a0b] p-8 rounded-[2rem] border border-zinc-900">
                                <HUDInput label="CUSTO_KWH" value={kwhPrice} onChange={setKwhPrice} type="number" info="BRL/R$" />
                                <HUDInput label="TAXA_DE_LUCRO" value="25" placeholder="%" info="Margem base" />
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] italic ml-1">Sistema de Medida</label>
                                    <select className="w-full bg-black border border-zinc-800 rounded-xl px-4 h-[46px] text-[11px] text-zinc-100 outline-none focus:border-[#0091ff]/50 transition-all font-mono uppercase cursor-pointer">
                                        <option>Métrico (mm/kg)</option>
                                        <option>Imperial (in/lb)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] italic ml-1">Nozzle Default</label>
                                    <select className="w-full bg-black border border-zinc-800 rounded-xl px-4 h-[46px] text-[11px] text-zinc-100 outline-none focus:border-[#0091ff]/50 transition-all font-mono uppercase cursor-pointer">
                                        <option>0.4 mm</option>
                                        <option>0.6 mm</option>
                                        <option>0.2 mm</option>
                                    </select>
                                </div>
                            </div>
                        </ConfigSection>

                        <ConfigSection title="Interface e Performance" icon={Activity} badge="Ajustes de UI">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <HUDToggle label="Modo Render_Turbo" sublabel="Desativa animações pesadas" enabled={performance} onToggle={setPerformance} icon={Zap} />
                                <HUDToggle label="Audio_Alerts" sublabel="Sons de erro e conclusão" enabled={sounds} onToggle={setSounds} icon={Volume2} />
                            </div>
                        </ConfigSection>

                        <div className="p-8 bg-[#0a0a0b] border border-zinc-900 rounded-[2rem] flex flex-col md:flex-row gap-6">
                            <button className="flex-1 flex items-center justify-center gap-3 p-4 bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase text-zinc-400 rounded-xl hover:bg-zinc-800 transition-all">
                                <Database size={16} /> Exportar Backup .JSON
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-3 p-4 bg-rose-500/5 border border-rose-500/10 text-[10px] font-black uppercase text-rose-500 rounded-xl hover:bg-rose-500/10 transition-all">
                                <Trash2 size={16} /> Limpar Cache Operacional
                            </button>
                        </div>
                    </div>
                );

            case 'SEGURANÇA':
                return (
                    <div className="space-y-12">
                        <ConfigSection title="Segurança do Terminal" icon={Lock} badge="Nível 03">
                            <div className="bg-[#0a0a0b] p-8 rounded-[2rem] border border-zinc-900 space-y-8">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest border-l-2 border-[#0091ff] pl-4 italic leading-relaxed">
                                    O gerenciamento de senhas e autenticação de dois fatores é processado via Clerk Security Gateway.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <HUDInput label="ATUALIZAR_CHAVE" type="password" placeholder="SENHA ATUAL" />
                                    <HUDInput label="NOVA_CHAVE" type="password" placeholder="REPETIR NOVA" />
                                </div>
                            </div>
                        </ConfigSection>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic ml-2">Sessões em Aberto</h3>
                            <div className="p-6 bg-[#0a0a0b] border border-zinc-900 rounded-2xl flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-black border border-zinc-800 rounded-xl text-[#0091ff]">
                                        <Smartphone size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-white uppercase italic tracking-tight">Chrome em Windows (Atual)</span>
                                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">IP: 189.122.XX.XX — São Paulo, BR</span>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase italic">Seguro</span>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="flex h-screen w-full bg-[#050505] text-zinc-100 font-sans overflow-hidden">
            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 72 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out" style={{ marginLeft: `${larguraSidebar}px` }}>

                {/* GRID DE FUNDO */}
                <div className="absolute inset-x-0 top-0 h-[500px] z-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        maskImage: 'linear-gradient(to bottom, black, transparent)'
                    }}
                />

                <header className="h-20 px-8 flex items-center justify-between z-40 relative border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
                    <div className="flex flex-col">
                        <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-1">CALCULATION_CORE_V2.4</h1>
                        <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Parâmetros do <span className="text-[#0091ff]">Maker</span></h2>
                    </div>

                    <button
                        onClick={handleGlobalSave}
                        disabled={isSaving}
                        className="h-11 px-8 bg-[#0091ff] hover:bg-[#007cdb] text-white rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 shadow-[0_0_20px_rgba(0,145,255,0.2)] transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={18} strokeWidth={3} />}
                        {isSaving ? "Sincronizando..." : "Sincronizar Terminal"}
                    </button>
                </header>

                <div className="flex-1 flex overflow-hidden relative">
                    <aside className="w-80 border-r border-white/5 p-8 bg-[#08080a]/50 relative z-40 flex flex-col justify-between">
                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-6 px-2 italic border-l-2 border-zinc-900 ml-1">Módulos de Controle</p>
                            {[
                                { id: 'PERFIL', label: 'Operador', icon: User },
                                { id: 'SEGURANÇA', label: 'Segurança', icon: Lock },
                                { id: 'BANCADA', label: 'Bancada', icon: Ruler },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === tab.id ? 'bg-[#0091ff] text-white shadow-[0_0_20px_rgba(0,145,255,0.2)] scale-[1.02]' : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/5'}`}
                                >
                                    <tab.icon size={18} strokeWidth={2.5} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => signOut()} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-500/10 transition-all group">
                            <LogOut size={18} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" /> Logout Terminal
                        </button>
                    </aside>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-16 relative z-10 scroll-smooth">
                        <div className="max-w-4xl mx-auto pb-20">{renderContent()}</div>
                    </div>
                </div>

                <footer className="p-4 px-10 border-t border-white/5 bg-black/40 flex justify-between items-center relative z-40 backdrop-blur-md">
                    <p className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.8em]">P R I N T L O G &nbsp; T E R M I N A L &nbsp; C O R E</p>
                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest italic">Build_2026.12.22_STABLE</span>
                </footer>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; } 
                .custom-scrollbar::-webkit-scrollbar-track { background: #050505; } 
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f23; border-radius: 20px; border: 1px solid #050505; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #27272a; }
            `}</style>
        </div>
    );
}