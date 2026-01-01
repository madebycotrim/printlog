import React, { useState, useEffect, useRef } from 'react';
import {
    User, Lock, Save, RefreshCw, Camera,
    CheckCircle2, Database, Cloud, Activity
} from 'lucide-react';
import { useClerk, useUser } from "@clerk/clerk-react";

import MainSidebar from "../layouts/mainSidebar";
import Toast from "../components/Toast";

// --- COMPONENTE: INPUT ESTILO HUD (REFINADO) ---
const HUDInput = ({ label, value, onChange, placeholder, type = "text", info, disabled }) => (
    <div className="space-y-2 group">
        <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-focus-within:text-sky-400 transition-colors">
                {label}
            </label>
            {info && <span className="text-[10px] text-zinc-600 font-semibold uppercase tracking-tight">{info}</span>}
        </div>
        <div className="relative">
            <input
                disabled={disabled}
                type={type} value={value} onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-sky-500/30 focus:bg-zinc-900/80 transition-all font-sans disabled:opacity-40"
            />
        </div>
    </div>
);

// --- SEÇÃO DE CONFIGURAÇÃO (REFINADA) ---
const ConfigSection = ({ title, icon: Icon, badge, children }) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex items-center gap-5">
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sky-400 shadow-sm">
                <Icon size={18} strokeWidth={2} />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-200 whitespace-nowrap">{title}</h2>
            <div className="h-px flex-1 bg-zinc-800/40 mx-4" />
            <div className="px-4 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800/80 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {badge}
            </div>
        </div>
        {children}
    </div>
);

export default function ConfigPage() {
    const [larguraSidebar, setLarguraSidebar] = useState(68);
    const [activeTab, setActiveTab] = useState('PERFIL');
    const [isSaving, setIsSaving] = useState(false);

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const { signOut } = useClerk();
    const { user, isLoaded } = useUser();
    const fileInputRef = useRef(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

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
            setToast({ show: true, message: "Ajustes da oficina salvos com sucesso!", type: 'success' });
        } catch (err) {
            setToast({ show: true, message: err.errors?.[0]?.message || "Erro de sincronização.", type: 'error' });
        } finally { setIsSaving(false); }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'PERFIL':
                return (
                    <div className="space-y-12">
                        {/* CARD DE PERFIL REFINADO */}
                        <div className="relative p-10 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm shadow-sm overflow-hidden group">
                            <div className="absolute -right-10 -top-10 w-48 h-48 blur-[100px] opacity-10 rounded-full bg-sky-500" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-[2rem] bg-zinc-950 border-2 border-zinc-800 p-1.5 group/avatar">
                                        <div className="w-full h-full rounded-[1.6rem] overflow-hidden bg-zinc-900 flex items-center justify-center relative">
                                            {user?.imageUrl ? <img src={user.imageUrl} className="w-full h-full object-cover" alt="Sua Foto" /> : <User size={40} className="text-zinc-700" />}
                                            <button onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-zinc-950/70 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera size={24} className="text-white" />
                                            </button>
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            try {
                                                await user.setProfileImage({ file });
                                                setToast({ show: true, message: "Foto de perfil atualizada!", type: 'success' });
                                            } catch {
                                                setToast({ show: true, message: "Erro ao carregar imagem.", type: 'error' });
                                            }
                                        }
                                    }} className="hidden" accept="image/*" />
                                </div>

                                <div className="flex-1 space-y-4 text-center md:text-left">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-sky-400 uppercase tracking-[0.3em]">Farm Manager</p>
                                        <h3 className="text-3xl font-bold text-zinc-100 tracking-tighter leading-none">
                                            {firstName} {lastName}
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                        <span className="px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-2">
                                            <CheckCircle2 size={12} /> Sistemas Operacionais
                                        </span>
                                        <span className="px-3 py-1 bg-zinc-950/50 border border-zinc-800 text-zinc-500 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-2">
                                            <Database size={12} /> ID: {user?.id.slice(-8).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ConfigSection title="Identidade do Operador" icon={User} badge="Perfil">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-800/50">
                                <HUDInput label="Primeiro Nome" value={firstName} onChange={setFirstName} />
                                <HUDInput label="Sobrenome" value={lastName} onChange={setLastName} />
                                <HUDInput label="E-mail Principal" value={user?.primaryEmailAddress?.emailAddress || ""} disabled info="Acesso Restrito" />
                                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-4">
                                    <Cloud className="text-sky-500/60" size={20} />
                                    <p className="text-[10px] font-medium text-zinc-500 uppercase leading-relaxed tracking-wider">
                                        As credenciais de login são gerenciadas por protocolo de segurança externo.
                                    </p>
                                </div>
                            </div>
                        </ConfigSection>
                    </div>
                );

            case 'SEGURANÇA':
                return (
                    <div className="space-y-12">
                        <ConfigSection title="Segurança da Camada de Acesso" icon={Lock} badge="Privacidade">
                            <div className="bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-800/50 space-y-10">
                                <p className="text-xs text-zinc-500 font-medium leading-relaxed border-l-2 border-sky-500/30 pl-6">
                                    Sua conta opera sob criptografia de ponta a ponta. Alterações de senha exigem autenticação de dois fatores via Clerk.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <HUDInput label="Senha Atual" type="password" placeholder="********" />
                                    <HUDInput label="Nova Senha" type="password" placeholder="********" />
                                </div>
                            </div>
                        </ConfigSection>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 68 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out" style={{ marginLeft: `${larguraSidebar}px` }}>
                {/* BACKGROUND DECORATIVO: BUILD PLATE */}
                <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
                    <div className="absolute inset-0 opacity-[0.1]"
                        style={{
                            backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                            backgroundSize: '50px 50px',
                            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                        }}
                    />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full opacity-40">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
                        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-sky-500/20 via-transparent to-transparent" />
                    </div>
                </div>

                <header className="h-20 px-10 flex items-center justify-between z-40 relative border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Painel de Controle</h1>
                        <h2 className="text-xl font-bold tracking-tight text-zinc-100 uppercase">Ajustes da <span className="text-sky-400">Oficina</span></h2>
                    </div>

                    <button
                        onClick={handleGlobalSave}
                        disabled={isSaving}
                        className="h-10 px-8 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-3 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                        {isSaving ? "Gravando..." : "Salvar Alterações"}
                    </button>
                </header>

                <div className="flex-1 flex overflow-hidden relative">
                    <aside className="w-80 border-r border-zinc-800/50 p-8 bg-zinc-900/10 relative z-40 flex flex-col justify-between shrink-0">
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-8 px-4 border-l border-zinc-800">Menu de Preferências</p>
                            {[
                                { id: 'PERFIL', label: 'Meu Perfil', icon: User },
                                { id: 'SEGURANÇA', label: 'Segurança e Acesso', icon: Lock },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all duration-200 ${activeTab === tab.id ? 'bg-zinc-100 text-zinc-950 shadow-lg scale-[1.02]' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
                                >
                                    <tab.icon size={18} strokeWidth={2.5} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => signOut()} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all group">
                            <Lock size={18} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" /> Encerrar Sessão
                        </button>
                    </aside>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-12 lg:p-16 relative z-10 scroll-smooth">
                        <div className="max-w-4xl mx-auto pb-24">{renderContent()}</div>
                    </div>
                </div>
            </main>
        </div>
    );
}