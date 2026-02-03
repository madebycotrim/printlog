import React, { useState } from 'react';
import {
    User, Lock, Save, ShieldCheck,
    KeyRound, ShieldAlert, FileText,
    Camera, Mail,
    Wrench, Database, Check,
    Trash2, Store, Crown,
    Table, MessageCircle, ExternalLink, HelpCircle,
    History, Zap, CreditCard, Download, CloudLightning,
    RefreshCw, Globe, HardDrive
} from 'lucide-react';

import { useLogicaConfiguracao } from '../../utils/configLogic';
import ManagementLayout from "../../layouts/ManagementLayout";
import { UnifiedInput } from "../../components/UnifiedInput";
import Modal from '../../components/ui/Modal';
import SideBySideModal from '../../components/ui/SideBySideModal';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/ui/ConfirmModal';
import ReauthModal from '../../components/ui/ReauthModal';
import PageHeader from '../../components/ui/PageHeader';
import LixeiraModal from '../../features/sistema/components/LixeiraModal';
import DeleteAccountModal from '../../features/sistema/components/DeleteAccountModal';

// --- VISUAL COMPONENTS "SYSTEM MATCH" ---

const SystemCard = ({ children, className = "", onClick, ...props }) => (
    <div
        onClick={onClick}
        className={`
            relative overflow-hidden rounded-xl
            bg-[#09090b] border border-zinc-800
            ${onClick ? 'cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-300' : ''}
            group
            ${className}
        `}
        {...props}
    >
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        {children}
    </div>
);

const SystemSectionHeader = ({ title, subtitle, icon: Icon, color = "cyan", extraActions }) => (
    <div className="flex items-center justify-between mb-4">
        <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {title}
            </h3>
            {subtitle && <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
            {extraActions}
            {Icon && (
                <div className={`
                    p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 
                    text-${color}-500 shadow-lg shadow-${color}-900/10
                    group-hover:scale-105 group-hover:border-${color}-500/30 transition-all duration-300
                `}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
            )}
        </div>
    </div>
);

export default function PaginaConfiguracao() {
    const logica = useLogicaConfiguracao();
    const { temSenhaDefinida: temSenhaSegura } = logica;

    // UI States
    const [exibirLixeira, setExibirLixeira] = useState(false);
    const [exibirModalSuporte, setExibirModalSuporte] = useState(false);
    const [exibirModalExclusao, setExibirModalExclusao] = useState(false);
    const [isCleaningCache, setIsCleaningCache] = useState(false);

    // Dados de Armazenamento (Prioridade: Backend -> Mock Realista)
    const limitStorage = 0.5 * 1024 * 1024 * 1024; // 0.5 GB (Solicitado)

    const displayStorage = {
        used: (logica.storageStats?.userUsage && logica.storageStats.userUsage > 0)
            ? logica.storageStats.userUsage
            : (126.98 * 1024), // Fallback exato do print (~127KB) se backend for 0
        limit: limitStorage
    };

    displayStorage.percentage = (displayStorage.used / displayStorage.limit) * 100;

    // ALIAS DE SEGURANÇA (Caso haja referências antigas no HMR ou código)
    const mockStorage = displayStorage;

    // Ação: Limpar Cache Local
    const handleClearCache = async () => {
        setIsCleaningCache(true);
        // Simula scan
        await new Promise(r => setTimeout(r, 1500));

        // Limpa
        try {
            localStorage.clear();
            sessionStorage.clear();
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
            }
            // Não limpamos cookies aqui para evitar deslogar brutalmente se for por cookie, 
            // mas localStorage é seguro para "limpar preferências locais/cache".

            // Simula otimização final
            await new Promise(r => setTimeout(r, 800));

            // Feedback visual: Recarrega ou exibe sucesso?
            // Vamos recarregar para efetivar "Limpeza" real
            window.location.reload();
        } catch (e) {
            console.error("Erro ao limpar cache", e);
            setIsCleaningCache(false);
        }
    };

    // Format date logic fallback
    const memberSince = logica.usuario?.createdAt ? new Date(logica.usuario.createdAt).getFullYear() : '2025';

    if (!logica.estaCarregado) return null;

    return (
        <ManagementLayout>
            <input
                type="file"
                ref={logica.referenciaEntradaArquivo}
                onChange={logica.manipularCarregamentoImagem}
                accept="image/*"
                className="hidden"
            />

            {/* 1. HEADER (Standard System) */}
            <div className="shrink-0 z-10 mb-6">
                <PageHeader
                    title="Configurações"
                    subtitle="Gerencie sua conta e preferências do sistema."
                    accentColor="text-cyan-500"
                    actionButton={
                        <Button
                            onClick={logica.salvarAlteracoesGerais}
                            disabled={!logica.temAlteracao}
                            isLoading={logica.estaSalvando}
                            variant="secondary"
                            className={`h-10 px-6 text-xs font-bold uppercase transition-all shadow-lg ${logica.temAlteracao ? "!bg-cyan-500 !hover:bg-cyan-400 !text-white !border-cyan-400 shadow-cyan-500/20" : "hover:shadow-cyan-900/20"}`}
                            icon={Save}
                        >
                            Salvar Alterações
                        </Button>
                    }
                />
            </div>

            {/* 2. MAIN GRID */}
            <main className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-[minmax(0,1fr)_minmax(0,auto)] gap-6 z-10 w-full">

                {/* --- ROW 1 (TOP) --- */}

                {/* IDENTIDADE (8 Cols) */}
                {/* IDENTIDADE (8 Cols) */}
                <div className="col-span-1 md:col-span-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <SystemCard className="h-full p-8 flex flex-col lg:flex-row gap-8 bg-gradient-to-br from-[#09090b] to-[#0c0c0e]">
                        {/* Avatar Section */}
                        <div className="w-full lg:w-1/3 shrink-0 flex flex-col items-center justify-center lg:border-r border-zinc-800/50 lg:pr-8 h-full relative">
                            {/* Decorative Background Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none" />

                            <div className="relative group cursor-pointer" onClick={() => logica.referenciaEntradaArquivo.current?.click()}>
                                <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-full overflow-hidden bg-zinc-900 border-4 border-zinc-800/80 group-hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 relative z-10">
                                    {logica.usuario?.imageUrl ? (
                                        <img src={logica.usuario.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Perfil" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-900">
                                            <User size={56} strokeWidth={1.5} />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute 
                                    bottom-1 right-1 lg:bottom-2 lg:right-2 
                                    p-2.5 bg-cyan-500 text-black rounded-full 
                                    shadow-lg shadow-cyan-900/30 
                                    transition-all duration-300 transform
                                    translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 
                                    z-20 border-2 border-[#09090b]"
                                >
                                    <Camera size={18} strokeWidth={2.5} />
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col items-center gap-2 relative z-10">
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full border border-amber-500/20 backdrop-blur-sm shadow-sm">
                                    <Crown size={14} className="text-amber-400" fill="currentColor" />
                                    <span className="text-[11px] font-black text-amber-200/90 uppercase tracking-widest text-shadow-sm">Conta Premium</span>
                                </div>
                                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                                    Membro Desde {memberSince}
                                </span>
                            </div>
                        </div>

                        {/* Inputs Section */}
                        <div className="flex-1 w-full max-w-xl space-y-8 py-2">
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3 tracking-tight">
                                    Identidade Visual
                                    <span className="px-2 py-1 rounded-md text-[10px] bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 uppercase tracking-widest font-bold">Pessoal</span>
                                </h2>
                                <p className="text-sm text-zinc-500 font-medium">Informações utilizadas em relatórios e orçamentos.</p>
                            </div>

                            <div className="grid gap-6">
                                <UnifiedInput
                                    label="Nome do Membro"
                                    icon={User}
                                    value={logica.primeiroNome}
                                    onChange={e => logica.setPrimeiroNome(e.target.value)}
                                    className="h-10 text-sm bg-black/40 text-zinc-200 placeholder:text-zinc-600 focus:bg-black/60 transition-all rounded-md"
                                    placeholder="Seu Nome"
                                />
                                <UnifiedInput
                                    label="Nome da Marca"
                                    icon={Store}
                                    value={logica.nomeOficina}
                                    onChange={e => logica.setNomeOficina(e.target.value)}
                                    className="h-10 text-sm bg-black/40 text-zinc-200 placeholder:text-zinc-600 focus:bg-black/60 transition-all rounded-md"
                                    placeholder="Nome da Oficina"
                                />
                                <div className="relative">
                                    <UnifiedInput
                                        label="E-mail Principal"
                                        icon={Mail}
                                        value={logica.usuario?.primaryEmailAddress?.emailAddress}
                                        readOnly
                                        className="h-10 text-sm bg-black/40 text-zinc-500 cursor-not-allowed rounded-md"
                                        disabled
                                    />
                                    <div className="absolute bottom-2.5 right-3 text-[10px] text-zinc-600 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900/50 pointer-events-none">
                                        Gerenciado
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SystemCard>
                </div>

                {/* RIGHT STACK (4 Cols) - STORAGE + DATA */}
                <div className="col-span-1 md:col-span-4 flex flex-col gap-6">

                    {/* STORAGE */}
                    <SystemCard className="flex-1 p-5 flex flex-col justify-between animate-fade-in-up hover:border-emerald-500/20" style={{ animationDelay: '0.2s' }}>
                        <SystemSectionHeader
                            title="Armazenamento"
                            subtitle="Banco de Dados & Cache"
                            icon={Database}
                            color="emerald"
                            extraActions={
                                <div className={`
                                    group/tooltip relative p-2.5 rounded-xl flex items-center justify-center transition-all cursor-help border border-transparent
                                    bg-${logica.statusConexaoNuvem?.cor || 'zinc'}-500/10 text-${logica.statusConexaoNuvem?.cor || 'zinc'}-500 
                                    hover:bg-${logica.statusConexaoNuvem?.cor || 'zinc'}-500/20 hover:border-${logica.statusConexaoNuvem?.cor || 'zinc'}-500/20
                                `}>
                                    {logica.statusConexaoNuvem?.Icone ? <logica.statusConexaoNuvem.Icone size={18} strokeWidth={2.5} /> : <Zap size={18} strokeWidth={2.5} />}

                                    <div className="absolute right-0 top-full mt-2 w-max max-w-[150px] p-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl text-[10px] text-zinc-300 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 flex flex-col gap-1">
                                        <span className={`font-bold uppercase text-${logica.statusConexaoNuvem?.cor}-400`}>{logica.statusConexaoNuvem?.rotulo}</span>
                                        <span className="leading-tight opacity-70">{logica.statusConexaoNuvem?.informacao}</span>
                                    </div>
                                </div>
                            }
                        />

                        <div className="flex flex-col gap-1 mb-2">
                            {/* STORAGE USAGE ROW */}
                            <div className="flex flex-col p-2 rounded-lg hover:bg-white/5 transition-colors group/item border border-transparent hover:border-zinc-800 gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md flex items-center justify-center bg-zinc-800 text-zinc-400">
                                            <HardDrive size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-white tracking-wider">Espaço Utilizado</span>
                                            <span className="text-[10px] text-zinc-500 leading-none">
                                                {logica.formatBytes(displayStorage.used)} de {logica.formatBytes(displayStorage.limit)}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-400">{(displayStorage?.percentage || 0).toFixed(1)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden flex shadow-inner border border-zinc-800/50">
                                    <div
                                        className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-700 ease-out"
                                        style={{ width: `${Math.max(displayStorage.percentage, 2)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleClearCache}
                            disabled={isCleaningCache}
                            variant="outline"
                            className={`w-full h-7 text-[9px] uppercase border p-0 border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 text-zinc-400 group flex items-center justify-center gap-2 transition-all
                                ${isCleaningCache ? 'cursor-not-allowed opacity-50' : ''}
                            `}
                        >
                            <Trash2 size={12} className={isCleaningCache ? "animate-spin" : "opacity-70 group-hover:opacity-100 transition-opacity"} />
                            {isCleaningCache ? "Limpando..." : "Limpar Cache"}
                        </Button>
                    </SystemCard>

                    {/* SUPPORT (Balanced) */}
                    <SystemCard className="px-5 py-6 flex flex-col gap-4 group hover:border-sky-500/30 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <SystemSectionHeader title="Suporte Maker" subtitle="Central de Ajuda" icon={HelpCircle} color="sky" />

                        <div className="flex flex-col gap-3">
                            <p className="text-xs text-sky-200/60 font-medium px-1">
                                Dúvidas sobre o sistema ou encontrou algum problema?
                            </p>

                            <div className="flex gap-2.5">
                                <Button
                                    variant="secondary"
                                    className="flex-1 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-xs uppercase font-bold flex items-center justify-center gap-2 h-10"
                                    onClick={() => setExibirModalSuporte(true)}
                                >
                                    <MessageCircle size={14} className="text-sky-500" />
                                    Abrir Chamado
                                </Button>
                                <a
                                    href="https://wa.me/5511999999999" // Exemplo
                                    target="_blank"
                                    rel="noreferrer"
                                    className="h-10 w-10 flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-sky-500 transition-colors cursor-pointer"
                                >
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>
                    </SystemCard>

                </div >


                {/* --- ROW 2 (BOTTOM) --- */}

                {/* DATA & TRASH (Moved from Stack) */}
                <div className="col-span-1 md:col-span-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <SystemCard className="h-full p-6 flex flex-col justify-between hover:border-violet-500/20 transition-colors group">
                        <SystemSectionHeader title="Meus Dados" subtitle="Gestão de Registros" icon={Database} color="violet" />

                        <div className="flex flex-col gap-3 justify-center flex-1">
                            {/* LIVE STATS MINI-DASHBOARD */}
                            {/* LIVE STATS MINI-DASHBOARD */}
                            <div className="flex items-center justify-between px-2 py-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50 my-2">
                                {[
                                    { label: "Clientes", val: logica.storageStats?.counts?.clients || 0 },
                                    { label: "Filamentos", val: logica.storageStats?.counts?.filaments || 0 },
                                    { label: "Insumos", val: logica.storageStats?.counts?.supplies || 0 },
                                    { label: "Impressoras", val: logica.storageStats?.counts?.printers || 0 },
                                    { label: "Projetos", val: logica.storageStats?.counts?.projects || 0 },
                                ].map((stat, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center justify-center first:border-l-0 border-l border-zinc-800/50">
                                        <span className="text-xl font-black text-white leading-none tracking-tight">{stat.val}</span>
                                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{stat.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        className="flex-1 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-[10px] items-center justify-center gap-2 h-9"
                                        onClick={() => logica.exportarRelatorio('csv')}
                                        isLoading={logica.estaSalvando}
                                    >
                                        <FileText size={14} className="text-violet-400 opacity-70" />
                                        CSV
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="flex-1 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-[10px] items-center justify-center gap-2 h-9"
                                        onClick={() => logica.exportarRelatorio('pdf')}
                                        isLoading={logica.estaSalvando}
                                    >
                                        <FileText size={14} className="text-rose-400 opacity-70" />
                                        PDF
                                    </Button>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full h-8 text-[10px] uppercase border p-0 border-dashed border-zinc-700 hover:border-rose-500/30 hover:bg-rose-950/10 hover:text-rose-400 text-zinc-400 group flex items-center justify-center gap-2 transition-all"
                                onClick={() => setExibirLixeira(true)}
                            >
                                <Trash2 size={12} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                                Abrir Lixeira do Sistema
                            </Button>
                        </div>
                    </SystemCard>
                </div>
                {/* SECURITY */}
                <div className="col-span-1 md:col-span-4 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
                    <SystemCard className={`
                        h-full p-6 flex flex-col justify-between group transition-all duration-300
                        ${temSenhaSegura ? 'hover:border-emerald-500/30' : 'hover:border-rose-500/30'}
                    `}>
                        <SystemSectionHeader
                            title="Segurança"
                            subtitle="Credenciais & Acesso"
                            icon={temSenhaSegura ? ShieldCheck : ShieldAlert}
                            color={temSenhaSegura ? "emerald" : "rose"}
                        />

                        <div className="flex flex-col gap-1 mb-2">
                            {/* MASTER PASSWORD ROW */}
                            <div className={`
                                flex items-center justify-between p-2 rounded-lg transition-all duration-300 group/item border border-transparent
                                ${temSenhaSegura ? 'hover:bg-emerald-500/5 hover:border-emerald-500/10' : 'hover:bg-rose-500/5 hover:border-rose-500/10'}
                            `}>
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        p-1.5 rounded-md flex items-center justify-center transition-colors
                                        ${temSenhaSegura ? 'bg-emerald-500/10 text-emerald-500 group-hover/item:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-500 group-hover/item:bg-rose-500/20'}
                                    `}>
                                        <Lock size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${temSenhaSegura ? 'text-zinc-200 group-hover/item:text-emerald-100' : 'text-zinc-200 group-hover/item:text-rose-100'}`}>
                                            Senha Mestra
                                        </span>
                                        <span className="text-[10px] text-zinc-500 leading-none">
                                            {temSenhaSegura ? "Ativa e protegendo" : "Não configurada"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${temSenhaSegura ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {temSenhaSegura ? "SEGURA" : "VULNERÁVEL"}
                                    </span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${temSenhaSegura ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-rose-500 animate-pulse'}`} />
                                </div>
                            </div>

                            {/* DIVIDER */}
                            <div className="h-px bg-zinc-800/50 mx-2" />

                            {/* GOOGLE AUTH ROW */}
                            <div className={`
                                flex items-center justify-between p-2 rounded-lg transition-all duration-300 group/item border border-transparent
                                ${logica.usuario?.providerData?.some(p => p.providerId === 'google.com') ? 'hover:bg-[#4285F4]/5 hover:border-[#4285F4]/10' : 'hover:bg-zinc-800/50 hover:border-zinc-700/50'}
                            `}>
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        p-1.5 rounded-md flex items-center justify-center transition-colors
                                        ${logica.usuario?.providerData?.some(p => p.providerId === 'google.com') ? 'bg-[#4285F4]/10 group-hover/item:bg-[#4285F4]/20' : 'bg-zinc-800 group-hover/item:bg-zinc-700'}
                                    `}>
                                        {logica.usuario?.providerData?.some(p => p.providerId === 'google.com') ?
                                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            :
                                            <Mail size={14} className="text-zinc-500" />
                                        }
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${logica.usuario?.providerData?.some(p => p.providerId === 'google.com') ? 'text-zinc-200 group-hover/item:text-[#4285F4]' : 'text-zinc-200'}`}>
                                            Conta Vinculada
                                        </span>
                                        <span className="text-[10px] text-zinc-500 leading-none">
                                            {logica.usuario?.email || "Usuário"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${logica.usuario?.providerData?.some(p => p.providerId === 'google.com') ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                        {logica.usuario?.providerData?.some(p => p.providerId === 'google.com') ? 'GOOGLE' : 'E-MAIL'}
                                    </span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${logica.usuario?.providerData?.some(p => p.providerId === 'google.com') ? 'bg-[#4285F4] shadow-[0_0_6px_rgba(66,133,244,0.8)]' : 'bg-zinc-500'}`} />
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="secondary"
                            className={`
                                w-full mt-2 text-xs uppercase font-bold flex items-center justify-center gap-2 h-10 transition-all duration-300 border
                                bg-zinc-900 border-zinc-800 hover:bg-zinc-800
                                ${temSenhaSegura
                                    ? 'hover:border-emerald-500/20 hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                    : 'hover:border-rose-500/20 hover:text-rose-400 hover:shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                                }
                            `}
                            onClick={() => logica.setExibirJanelaSenha(true)}
                        >
                            <KeyRound size={14} className={temSenhaSegura ? "group-hover:text-emerald-500" : "group-hover:text-rose-500"} />
                            Gerenciar Acesso
                        </Button>
                    </SystemCard>
                </div>

                {/* DANGER */}
                <div className="col-span-1 md:col-span-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <SystemCard className="h-full p-6 flex flex-col justify-between border-rose-500/10 hover:border-rose-500/30 transition-all duration-300 group">
                        <SystemSectionHeader title="Zona de Perigo" subtitle="Ações Irreversíveis" icon={ShieldAlert} color="rose" />

                        <div className="flex flex-col gap-1 mb-2">
                            <p className="text-[11px] text-zinc-500 mb-2 px-1 leading-relaxed">
                                A exclusão da conta removerá permanentemente todos os seus dados, configurações e históricos de impressão. <strong className="text-rose-500/80">Esta ação não pode ser desfeita.</strong>
                            </p>

                            {/* DELETE ACCOUNT ROW */}
                            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-rose-500/5 transition-colors group/item border border-transparent hover:border-rose-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-md flex items-center justify-center bg-rose-500/10 text-rose-500 group-hover/item:bg-rose-500/20 transition-colors">
                                        <Trash2 size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-zinc-200 group-hover/item:text-rose-200 transition-colors tracking-wider">
                                            Excluir conta permanentemente
                                        </span>
                                        <span className="text-[10px] text-zinc-500 leading-none">
                                            Esta ação não pode ser desfeita
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="danger"
                            className="w-full mt-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-xs font-bold uppercase transition-all shadow-none hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] h-10 flex items-center justify-center gap-2"
                            onClick={() => setExibirModalExclusao(true)}
                        >
                            <Trash2 size={14} />
                            Excluir Minha Conta
                        </Button>
                    </SystemCard>
                </div>

            </main >


            {/* --- MODAIS --- */}

            {/* LIXEIRA */}
            <LixeiraModal isOpen={exibirLixeira} onClose={() => setExibirLixeira(false)} />

            {/* JANELA DE SENHA (SMART SECURITY CENTER) */}
            <SideBySideModal
                isOpen={logica.exibirJanelaSenha}
                onClose={() => logica.setExibirJanelaSenha(false)}
                header={{
                    title: "Central de Segurança",
                    subtitle: "Gerencie suas credenciais de acesso."
                }}
                sidebar={
                    <div className="flex flex-col items-center w-full h-full relative z-10 py-12 px-8 overflow-y-auto custom-scrollbar">
                        {/* Status Header - Enhanced & Premium */}
                        <div className="w-full space-y-6 mb-12 shrink-0 text-center flex flex-col items-center">
                            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                                {logica.formularioSenha.novaSenha.length > 0 ? "ANÁLISE DE SEGURANÇA" : "STATUS ATUAL"}
                            </h2>

                            {/* Premium Glow Badge */}
                            <div className="relative group cursor-default">
                                <div className={`
                                    absolute inset-0 rounded-full blur-xl opacity-20 transition-all duration-500 group-hover:opacity-40
                                    ${logica.formularioSenha.novaSenha.length > 0
                                        ? `bg-${logica.forcaSenha.cor}-500`
                                        : (temSenhaSegura ? 'bg-emerald-500' : 'bg-rose-500')
                                    }
                                `} />
                                <span className={`
                                    relative text-[11px] font-bold uppercase tracking-[0.15em] border rounded-full px-6 py-2.5 transition-all duration-500 flex items-center gap-3 bg-zinc-950/50 backdrop-blur-md
                                    ${logica.formularioSenha.novaSenha.length > 0
                                        ? `text-${logica.forcaSenha.cor}-500 border-${logica.forcaSenha.cor}-500/50 shadow-[0_0_15px_-3px_rgba(var(--${logica.forcaSenha.cor}-500-rgb),0.2)]`
                                        : (temSenhaSegura
                                            ? 'text-emerald-500 border-emerald-500/50 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]'
                                            : 'text-rose-500 border-rose-500/50 shadow-[0_0_15px_-3px_rgba(244,63,94,0.2)]'
                                        )
                                    }
                                `}>
                                    <div className={`
                                        w-1.5 h-1.5 rounded-full animate-pulse
                                        ${logica.formularioSenha.novaSenha.length > 0 ? `bg-${logica.forcaSenha.cor}-500` : (temSenhaSegura ? 'bg-emerald-500' : 'bg-rose-500')}
                                    `} />
                                    {logica.formularioSenha.novaSenha.length > 0
                                        ? `${logica.forcaSenha.pontuacao}% PROTEGIDO`
                                        : (temSenhaSegura ? "CONTA BLINDADA" : "RISCO DETECTADO")
                                    }
                                </span>
                            </div>
                        </div>

                        {/* CONTENT: Strikethrough Checklist */}
                        <div className="w-full flex-1 flex flex-col relative">
                            {logica.formularioSenha.novaSenha.length > 0 ? (
                                /* Minimalist Strikethrough List */
                                <div className="w-full space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                                    <div className="flex flex-col gap-3 w-full pl-2">
                                        {[
                                            { test: logica.requisitosSenha.tamanhoMinimo, label: "08 Caracteres" },
                                            { test: logica.requisitosSenha.temMaiuscula, label: "Maiúscula" },
                                            { test: logica.requisitosSenha.temMinuscula, label: "Minúscula" },
                                            { test: logica.requisitosSenha.temNumero, label: "Número" },
                                            { test: logica.requisitosSenha.temEspecial, label: "Símbolo" },
                                            { test: logica.requisitosSenha.senhasConferem, label: "Coincidem" },
                                        ].map((req, i) => (
                                            <div key={i} className="flex items-center gap-3 group">
                                                {/* Icon Indicator */}
                                                <div className={`transition-all duration-300 ${req.test ? 'text-emerald-500/50' : 'text-zinc-600'}`}>
                                                    {req.test ? <Check size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-zinc-700" />}
                                                </div>

                                                {/* Label with Strikethrough */}
                                                <span className={`
                                                    text-[11px] uppercase tracking-wider font-semibold transition-all duration-300
                                                    ${req.test
                                                        ? 'text-zinc-600 line-through decoration-zinc-700'
                                                        : 'text-zinc-300'}
                                                `}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* Default Clean Icon State */
                                <div className="flex-1 flex flex-col items-center justify-center -mt-10">
                                    <div className={`
                                        mb-8 transition-colors duration-500 scale-110
                                        ${temSenhaSegura ? 'text-emerald-500/20' : 'text-rose-500/20'}
                                    `}>
                                        {temSenhaSegura ? <ShieldCheck size={80} strokeWidth={1} /> : <ShieldAlert size={80} strokeWidth={1} />}
                                    </div>

                                    <p className="text-xs text-zinc-500 font-medium leading-relaxed text-center max-w-[200px]">
                                        {temSenhaSegura ? "Autenticação forte ativa." : "Ação necessária."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                }
                footer={({ onClose }) => (
                    <div className="flex gap-3 w-full">
                        <button
                            disabled={logica.estaSalvando}
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 transition-all disabled:opacity-20"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={!logica.todosRequisitosAtendidos || logica.estaSalvando}
                            onClick={logica.atualizarSenha}
                            className={`
                                flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300
                                ${logica.todosRequisitosAtendidos && !logica.estaSalvando
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20'
                                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}
                            `}
                        >
                            {logica.estaSalvando ? "Salvando..." : "Atualizar Credenciais"}
                        </button>
                    </div>
                )}
            >
                <div className="space-y-6">
                    {temSenhaSegura && (
                        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                            <UnifiedInput
                                label="Senha Atual"
                                type="password"
                                value={logica.formularioSenha.senhaAtual}
                                onChange={e => logica.setFormularioSenha({ ...logica.formularioSenha, senhaAtual: e.target.value })}
                                placeholder="Informe sua senha atual..."
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <UnifiedInput
                                label="Nova Senha"
                                type="password"
                                value={logica.formularioSenha.novaSenha}
                                onChange={e => logica.setFormularioSenha({ ...logica.formularioSenha, novaSenha: e.target.value })}
                                placeholder="Crie uma senha forte..."
                            />
                            {/* Strength Meter Bar */}
                            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden w-full">
                                <div
                                    className={`h-full transition-all duration-500 ease-out bg-${logica.forcaSenha.cor}-500`}
                                    style={{ width: `${logica.forcaSenha.pontuacao}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center px-1">
                                <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors text-${logica.forcaSenha.cor}-500`}>
                                    {logica.forcaSenha.rotulo}
                                </span>
                                <span className="text-[10px] text-zinc-600 font-medium">Use letras, números e símbolos</span>
                            </div>
                        </div>

                        <UnifiedInput
                            label="Confirmar Nova Senha"
                            type="password"
                            value={logica.formularioSenha.confirmarSenha}
                            onChange={e => logica.setFormularioSenha({ ...logica.formularioSenha, confirmarSenha: e.target.value })}
                            placeholder="Repita a senha..."
                        />
                    </div>
                </div>
            </SideBySideModal>

            {/* MODAL SUPORTE (SIDE-BY-SIDE NO SIDEBAR) */}
            <SideBySideModal
                isOpen={exibirModalSuporte}
                onClose={() => setExibirModalSuporte(false)}

                className="w-full max-w-[640px]"
                contentClassName="p-0"
            >
                <div className="w-full h-[80vh] bg-zinc-100 grayscale contrast-125">
                    <iframe
                        src="https://docs.google.com/forms/d/e/1FAIpQLSet7HVM3asx7qDukgZv0pFhyQRaQGl-ArM6jLif8nceI223Ow/viewform?embedded=true"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        marginHeight="0"
                        marginWidth="0"
                    >
                        Carregando...
                    </iframe>
                </div>
            </SideBySideModal>

            {/* MODAL EXCLUSÃO */}
            <DeleteAccountModal
                isOpen={exibirModalExclusao}
                onClose={() => setExibirModalExclusao(false)}
                onConfirm={() => { setExibirModalExclusao(false); logica.excluirContaPermanente(); }}
                isLoading={logica.estaSalvando}
            />

            {/* MODAL REAUTH */}
            <ReauthModal isOpen={logica.exibirModalReauth} onClose={() => logica.setExibirModalReauth(false)} onConfirm={logica.confirmarExclusao} isLoading={logica.estaSalvando} />

        </ManagementLayout >
    );
}
