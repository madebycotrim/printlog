import React from 'react';
import { KeyRound, RefreshCw, Lock, AlertTriangle, Trash2, Download, ShieldCheck } from 'lucide-react';
import { ConfigSection } from './ConfigUI';

export default function SecurityModule({ logic }) {
    return (
        <div className="space-y-16">
            {/* Seção de Gerenciamento de Acesso */}
            <ConfigSection title="Segurança e Acesso" icon={KeyRound} badge="Segurança" description="Gerencie suas credenciais e proteja seu espaço maker.">
                <div className="bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-800/40">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1">
                            <p className="text-[11px] text-zinc-200 font-black uppercase tracking-widest">Credenciais de Acesso</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-medium">
                                {logic.user.passwordEnabled ? "Mantenha sua senha atualizada para garantir a segurança dos seus dados." : "Acesso via Redes Sociais (Sem senha local definida)."}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4 w-full md:w-auto">
                            <button
                                onClick={() => logic.setShowPasswordModal(true)}
                                className="flex-1 md:flex-none px-6 py-4 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"
                            >
                                <RefreshCw size={14} /> {logic.user.passwordEnabled ? "Alterar Senha" : "Criar Senha Local"}
                            </button>
                        </div>
                    </div>
                </div>
            </ConfigSection>

            {/* Seção de Exportação de Dados (Backup Maker) */}
            <ConfigSection title="Privacidade e Dados" icon={Download} badge="Backup" description="Baixe uma cópia de segurança de tudo o que você fez antes de realizar mudanças críticas.">
                <div className="bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-800/40">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1">
                            <p className="text-[11px] text-zinc-200 font-black uppercase tracking-widest">Exportar Biblioteca Maker</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-medium">Gere um arquivo com todo o seu estoque, histórico de impressoras e orçamentos.</p>
                        </div>
                        <button
                            onClick={() => logic.exportFormattedData('json')}
                            className="flex-1 md:flex-none px-6 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"
                        >
                            <Download size={14} /> Exportar Tudo
                        </button>
                    </div>
                </div>
            </ConfigSection>

            {/* Zona de Risco: Exclusão com melhoria visual e clareza de impacto */}
            <ConfigSection title="Zona de Risco" icon={AlertTriangle} badge="Ação Crítica" description="Apagar a conta é um processo definitivo e remove todo o seu histórico de produção.">
                <div className="bg-rose-500/5 p-12 rounded-[2.5rem] border border-rose-500/20 space-y-8 relative overflow-hidden group">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black uppercase text-white tracking-tighter">Apagar minha <span className="text-rose-500">Jornada Maker</span></h2>
                        <p className="text-xs text-zinc-500 uppercase font-bold leading-relaxed max-w-xl">
                            Essa ação não tem volta. Ao confirmar, seu estoque de filamentos, registros de impressoras, orçamentos e estatísticas de uso serão apagados para sempre.
                        </p>
                    </div>
                    <button
                        onClick={() => logic.setModalConfig({
                            open: true,
                            title: "Deseja mesmo sair?",
                            message: "Essa ação vai apagar permanentemente seu estoque, impressoras e todo o histórico de projetos. Não dá pra desfazer depois!",
                            type: "danger",
                            icon: AlertTriangle,
                            onConfirm: () => logic.handleDeleteAccount()
                        })}
                        className="group flex items-center gap-4 px-8 py-5 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 rounded-2xl transition-all"
                    >
                        <Trash2 size={20} className="text-rose-500 group-hover:text-white" />
                        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-500 group-hover:text-white">Confirmar Exclusão Permanente</span>
                    </button>
                </div>
            </ConfigSection>
        </div>
    );
}