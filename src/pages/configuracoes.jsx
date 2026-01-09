import {
    User, Lock, RefreshCw, Save, ShieldCheck,
    KeyRound, Fingerprint, ShieldAlert, FileText,
    Table, Trash2, X, Loader2, Camera, Mail,
    Download, Box, Radiation,
    Wrench, HardDrive, Info,
} from 'lucide-react';

import { useConfigLogic } from '../utils/configLogic';
import MainSidebar from "../layouts/mainSidebar";
import Toast from "../components/Toast";

// --- COMPONENTE DE CARTÃO (ESTILO INDUSTRIAL REFINADO) ---
const InfoCard = ({ title, subtitle, icon: Icon, colorClass, children, badge }) => (
    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all duration-300">
        {/* Detalhe visual de canto (Cyberpunk style) */}
        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
            <div className="w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
        </div>

        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-${colorClass}-500/10 text-${colorClass}-400`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h2>
                    <p className="text-[11px] text-zinc-500 font-medium leading-tight">{subtitle}</p>
                </div>
            </div>
            {badge && (
                <span className="text-[9px] font-bold px-2 py-1 rounded bg-zinc-950 border border-white/10 text-zinc-400 uppercase tracking-tighter">
                    {badge}
                </span>
            )}
        </div>
        <div className="p-8">
            {children}
        </div>
    </div>
);

export default function ConfigPage() {
    const logic = useConfigLogic();

    if (!logic.isLoaded) return (
        <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center gap-4">
            <RefreshCw className="text-sky-500 animate-spin" size={40} />
            <p className="text-xs font-mono text-zinc-500 animate-pulse uppercase tracking-widest">Acessando Banco de Dados...</p>
        </div>
    );

    const hasPassword = logic.user?.passwordEnabled;
    const strategy = logic.user?.externalAccounts?.[0]?.verification?.strategy || "oauth_google";
    const isSocial = strategy.includes('google');

    return (
        <div className="flex h-screen w-full bg-[#050505] text-zinc-300 font-sans antialiased overflow-hidden">
            {/* LINHAS DE GRADE NO FUNDO (ESSENCIAL PARA O DESIGN MAKER/CAD) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            <div className="absolute inset-0 bg-radial-at-t from-sky-500/5 via-transparent to-transparent pointer-events-none" />

            <input
                type="file"
                ref={logic.fileInputRef}
                onChange={logic.handleImageUpload}
                accept="image/*"
                className="hidden"
            />

            {logic.toast.show && <Toast {...logic.toast} onClose={() => logic.setToast({ ...logic.toast, show: false })} />}
            <MainSidebar onCollapseChange={(collapsed) => logic.setLarguraSidebar(collapsed ? 68 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-500" style={{ marginLeft: `${logic.larguraSidebar}px` }}>

                {/* CABEÇALHO */}
                <header className="h-24 px-10 flex items-center justify-between z-40 relative border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Wrench size={14} className="text-sky-500" />
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Painel de Controle da Oficina</p>
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Ajustes <span className="text-sky-500 text-2xl not-italic">.SYS</span></h1>
                    </div>

                    <button
                        onClick={logic.handleGlobalSave}
                        disabled={logic.isSaving || !logic.isDirty}
                        className="h-12 px-8 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-all disabled:opacity-20 shadow-[0_0_25px_rgba(14,165,233,0.2)] active:scale-95 border border-sky-400/30"
                    >
                        {logic.isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Salvar Alterações
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-8 pb-10 relative z-10 custom-scrollbar">
                    <div className="max-w-[1400px] mx-auto space-y-8">

                        {/* 1. RESUMO RÁPIDO */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: Fingerprint,
                                    label: 'Assinatura Maker',
                                    value: logic.user?.id?.slice(-8).toUpperCase(),
                                    color: 'sky',
                                    info: 'Seu ID único no sistema'
                                },
                                {
                                    icon: ShieldCheck,
                                    label: 'Proteção da Oficina',
                                    value: hasPassword ? 'Segura' : 'Sem Senha',
                                    color: hasPassword ? 'emerald' : 'amber',
                                    info: 'Status da sua chave mestra'
                                },
                                {
                                    icon: logic.cloudStatus.icon, // Ícone que vem do estado
                                    label: 'Nuvem Maker',
                                    value: logic.cloudStatus.label,
                                    color: logic.cloudStatus.color,
                                    info: logic.cloudStatus.info,
                                    isCloud: true // Flag para identificarmos este card no loop
                                },
                            ].map((stat, i) => (
                                <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:bg-zinc-900/60 transition-all">
                                    <div className="flex items-center gap-4">
                                        {/* Ajuste dinâmico de cores baseado no status da nuvem */}
                                        <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500 ring-1 ring-${stat.color}-500/20 shadow-[0_0_15px_rgba(var(--color-rgb),0.1)]`}>
                                            <stat.icon size={20} className={`${stat.value === 'Sincronizando' ? 'animate-spin' : ''} ${stat.value === 'Instável' ? 'animate-pulse' : ''} transition-all duration-500`} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                                            <h3 className="text-lg font-bold text-white tracking-tight">{stat.value}</h3>
                                            <p className="text-[9px] text-zinc-600 font-medium">{stat.info}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 2. GRID PRINCIPAL */}
                        <div className="grid grid-cols-12 gap-8">

                            {/* PERFIL */}
                            <div className="col-span-12 lg:col-span-4">
                                <InfoCard title="Minha Identidade" subtitle="Como você aparece na rede" icon={User} colorClass="sky" badge="Operador">
                                    <div className="flex flex-col items-center mb-10">
                                        <div className="relative group">
                                            <div className="w-36 h-36 rounded-[2rem] overflow-hidden border-4 border-zinc-800 bg-zinc-950 p-1.5 transition-all group-hover:rotate-3 group-hover:scale-105 shadow-2xl">
                                                {logic.user?.imageUrl ? (
                                                    <img src={logic.user.imageUrl} className="w-full h-full object-cover rounded-[1.5rem]" alt="Foto" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 rounded-[1.5rem]">
                                                        <User size={48} className="text-zinc-700" />
                                                    </div>
                                                )}
                                            </div>
                                            <button onClick={() => logic.fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-sky-500 text-zinc-950 rounded-2xl shadow-xl hover:bg-sky-400 transition-all border-4 border-[#050505] hover:scale-110" title="Mudar Imagem">
                                                <Camera size={18} />
                                            </button>
                                        </div>
                                        <div className="mt-6 text-center">
                                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{logic.firstName || "Novo Maker"}</h2>
                                            <div className="flex items-center gap-2 justify-center mt-1">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Oficina Online</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-widest flex items-center gap-2">
                                                Seu Apelido <Info size={10} />
                                            </label>
                                            <input
                                                value={logic.firstName}
                                                onChange={e => logic.setFirstName(e.target.value)}
                                                placeholder="Ex: Tony Stark"
                                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-4 px-5 text-sm font-medium text-white outline-none focus:border-sky-500/50 transition-all focus:ring-1 focus:ring-sky-500/20"
                                            />
                                        </div>
                                        <div className="p-4 bg-zinc-950/30 border border-white/[0.03] rounded-xl">
                                            <p className="text-[9px] font-bold text-zinc-600 uppercase mb-1">E-mail Cadastrado</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-zinc-400 font-mono truncate mr-2">{logic.user?.primaryEmailAddress?.emailAddress}</p>
                                                <Mail size={14} className="text-zinc-700 shrink-0" />
                                            </div>
                                        </div>
                                    </div>
                                </InfoCard>
                            </div>

                            {/* SEGURANÇA E BACKUP */}
                            <div className="col-span-12 lg:col-span-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                    {/* SEGURANÇA */}
                                    <InfoCard title="Acesso e Chaves" subtitle="Mantenha sua oficina segura" icon={Lock} colorClass="emerald" badge="Criptografado">
                                        <div className="space-y-4 mb-8">
                                            <p className="text-xs text-zinc-500 leading-relaxed italic bg-zinc-950/50 p-3 rounded-lg border-l-2 border-emerald-500/40">
                                                {isSocial
                                                    ? "Dica: Você usa login social. Criar uma senha interna permite que você acesse o sistema mesmo se o Google falhar."
                                                    : "Lembre-se: Use senhas fortes com números e símbolos para proteger seus projetos de impressão."}
                                            </p>
                                            <div className="flex justify-between items-center p-3 border border-white/5 rounded-xl bg-white/[0.01]">
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase">Login Via Rede Social</span>
                                                <span className={`text-[10px] font-bold uppercase ${isSocial ? 'text-emerald-500' : 'text-zinc-600'}`}>
                                                    {isSocial ? "Ativo" : "Inativo"}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => logic.setShowPasswordModal(true)}
                                            className="w-full py-4 bg-white hover:bg-emerald-500 text-zinc-950 hover:text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg"
                                        >
                                            <KeyRound size={16} /> {hasPassword ? "Mudar Minha Chave" : "Criar Nova Chave"}
                                        </button>
                                    </InfoCard>

                                    {/* EXPORTAÇÃO (BACKUP) */}
                                    <InfoCard
                                        title="Cópia de Segurança"
                                        subtitle="Baixe seus dados para controle offline"
                                        icon={HardDrive}
                                        colorClass="sky"
                                        badge="Exportar"
                                    >
                                        <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                                            Selecione o formato de saída para seus dados. A <span className="text-emerald-400 font-bold">Planilha</span> é ideal para cálculos externos, enquanto o <span className="text-sky-400 font-bold">PDF</span> é formatado para leitura.
                                        </p>

                                        <div className="grid grid-cols-1 gap-4">
                                            {/* PLANILHA (CSV) */}
                                            <button
                                                onClick={() => logic.exportManifesto('csv')}
                                                disabled={logic.isSaving}
                                                className="group w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between hover:border-emerald-500/40 transition-all disabled:opacity-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Table size={20} className="text-emerald-400" />
                                                    <div className="text-left">
                                                        <span className="text-xs font-bold text-zinc-300 uppercase block tracking-tight">Planilha de Dados (CSV)</span>
                                                    </div>
                                                </div>
                                                <Download size={14} className="text-zinc-600 group-hover:text-emerald-500 group-hover:translate-y-0.5 transition-transform" />
                                            </button>

                                            {/* RELATÓRIO PDF */}
                                            <button
                                                onClick={() => logic.exportManifesto('pdf')}
                                                disabled={logic.isSaving}
                                                className="group w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between hover:border-sky-500/40 transition-all disabled:opacity-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText size={20} className="text-sky-400" />
                                                    <div className="text-left">
                                                        <span className="text-xs font-bold text-zinc-300 uppercase block tracking-tight">Manifesto Técnico (PDF)</span>
                                                    </div>
                                                </div>
                                                <Download size={14} className="text-zinc-600 group-hover:text-sky-500 group-hover:translate-y-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </InfoCard>
                                </div>

                                {/* ZONA DE PERIGO - EXCLUSÃO DE CONTA */}
                                <div className="bg-rose-500/[0.03] border border-rose-500/20 rounded-2xl p-8 relative overflow-hidden group">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                        <div className="flex items-start gap-5">
                                            <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                                                <Trash2 size={32} />
                                            </div>
                                            <div className="max-w-md">
                                                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-3">
                                                    Encerrar Registro Maker <span className="text-[9px] bg-rose-500 text-white px-2 py-0.5 rounded animate-pulse shadow-lg shadow-rose-500/40">Ação Irreversível</span>
                                                </h3>
                                                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                                    Você está prestes a <span className="text-rose-400 font-bold">excluir sua conta permanentemente</span>.
                                                    Isso apagará seu login, seus filamentos salvos, suas impressoras e todo o seu histórico.
                                                    <br /><br />
                                                    <span className="text-zinc-400 underline italic">Não será possível recuperar esses dados depois.</span>
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={logic.handleDeleteAccount}
                                            className="h-14 px-8 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/30 text-rose-500 hover:text-white rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            <ShieldAlert size={16} /> Excluir Minha Conta
                                        </button>
                                    </div>

                                    {/* Marca d'água de fundo para estilo */}
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                        <Radiation size={120} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RODAPÉ DO TERMINAL */}
                <div className="fixed bottom-0 left-0 right-0 h-10 px-10 flex items-center justify-between border-t border-white/5 bg-[#050505] z-50" style={{ marginLeft: `${logic.larguraSidebar}px` }}>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            {/* O pontinho pulsante indica que o "espírito maker" está ativo */}
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]" />

                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                                Forjado por Makers, para Makers
                            </span>
                        </div>

                        <div className="h-4 w-[1px] bg-white/5" />

                        <div className="flex items-center gap-2">
                            <Box size={12} className="text-zinc-700" />
                            <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest font-mono">
                                NODE_ID: {logic.user?.id?.slice(-12).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-mono text-zinc-700 uppercase">Latência: 12ms</span>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold text-sky-500/80">BUILD: 2026.MAKER</span>
                    </div>
                </div>
            </main>

            {/* MODAL DE SENHA */}
            {logic.showPasswordModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => logic.setShowPasswordModal(false)} />
                    <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                            <h2 className="text-xs font-bold uppercase text-white tracking-widest flex items-center gap-2">
                                <KeyRound size={14} className="text-sky-500" /> {hasPassword ? "Atualizar Acesso" : "Primeira Chave"}
                            </h2>
                            <button onClick={() => logic.setShowPasswordModal(false)} className="text-zinc-500 hover:text-white transition-colors bg-white/5 p-1 rounded-lg"><X size={18} /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                {hasPassword && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Sua Senha Atual</label>
                                        <input
                                            type="password"
                                            value={logic.passwordForm.currentPassword}
                                            onChange={e => logic.setPasswordForm({ ...logic.passwordForm, currentPassword: e.target.value })}
                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 px-4 text-sm text-white outline-none focus:border-sky-500 transition-all"
                                        />
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Nova Senha Escolhida</label>
                                    <input
                                        type="password"
                                        placeholder="No mínimo 8 caracteres"
                                        value={logic.passwordForm.newPassword}
                                        onChange={e => logic.setPasswordForm({ ...logic.passwordForm, newPassword: e.target.value })}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 px-4 text-sm text-white outline-none focus:border-sky-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Confirme a Senha</label>
                                    <input
                                        type="password"
                                        value={logic.passwordForm.confirmPassword}
                                        onChange={e => logic.setPasswordForm({ ...logic.passwordForm, confirmPassword: e.target.value })}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 px-4 text-sm text-white outline-none focus:border-sky-500 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={logic.handleUpdatePassword}
                                disabled={logic.isSaving}
                                className="w-full py-5 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] active:scale-95 shadow-xl shadow-sky-900/20 transition-all disabled:opacity-20"
                            >
                                {logic.isSaving ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Gravar Nova Chave"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}