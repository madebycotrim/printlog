import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, ShieldAlert, X, AlertOctagon, RefreshCw } from 'lucide-react';
import SideBySideModal from '../../../components/ui/SideBySideModal';
import { UnifiedInput } from '../../../components/UnifiedInput';

export default function DeleteAccountModal({ isOpen, onClose, onConfirm, isLoading }) {
    const [confirmationText, setConfirmationText] = useState('');
    const [canDelete, setCanDelete] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setConfirmationText('');
            setCanDelete(false);
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const text = e.target.value;
        setConfirmationText(text);
        setCanDelete(text.toUpperCase() === 'EXCLUIR');
    };

    const handleConfirm = () => {
        if (canDelete) {
            onConfirm();
        }
    };

    return (
        <SideBySideModal
            isOpen={isOpen}
            onClose={onClose}
            header={{
                title: "ZONA DE PERIGO",
                subtitle: "Esta ação é irreversível.",
                color: "rose"
            }}
            sidebar={
                <div className="flex flex-col h-full w-full relative z-10 py-12 px-8 bg-rose-950/10">
                    <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />

                    <div className="flex flex-col items-center justify-center flex-1 text-center space-y-6">
                        <div className="w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)] animate-pulse">
                            <AlertTriangle size={48} className="text-rose-500" strokeWidth={1.5} />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-rose-500 uppercase tracking-widest">Atenção Crítica</h3>
                            <p className="text-xs text-rose-300/70 font-medium leading-relaxed max-w-[200px] mx-auto">
                                Você está prestes a apagar permanentemente todos os dados associados a esta conta.
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                            <div className="flex gap-3">
                                <ShieldAlert className="text-rose-500 shrink-0" size={16} />
                                <span className="text-[10px] text-rose-200/60 font-medium leading-relaxed">
                                    Nossa equipe de suporte <strong>não poderá recuperar</strong> seus dados após esta confirmação.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            }
            footer={
                <div className="flex items-center gap-3 w-full">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900/50 text-xs font-bold uppercase text-zinc-400 hover:text-zinc-100 transition-all hover:bg-zinc-800"
                    >
                        Cancelar, Manter Conta
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={!canDelete || isLoading}
                        className={`
                            flex-[2] py-3 px-6 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all duration-300
                            ${canDelete
                                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_-5px_rgba(225,29,72,0.5)]'
                                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'}
                        `}
                    >
                        {isLoading ? <RefreshCw className="animate-spin" size={16} /> : <Trash2 size={16} />}
                        {isLoading ? "Processando..." : "Excluir Permanentemente"}
                    </button>
                </div>
            }
        >
            <div className="space-y-8">
                {/* Warning Header */}
                <div className="space-y-4 border-b border-white/5 pb-6">
                    <h2 className="text-lg font-bold text-white">O que será excluído?</h2>
                    <ul className="space-y-3">
                        {[
                            "Todos os projetos e arquivos salvos",
                            "Histórico de impressões e insumos",
                            "Configurações personalizadas da conta",
                            "Dados de faturamento e assinaturas"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                                <div className="w-5 h-5 rounded flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
                                    <X size={12} strokeWidth={3} />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Confirmation Input */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Confirmação de Segurança</label>
                        <p className="text-xs text-zinc-400">
                            Para confirmar, digite <strong className="text-white select-all">EXCLUIR</strong> no campo abaixo:
                        </p>
                    </div>

                    <UnifiedInput
                        value={confirmationText}
                        onChange={handleInputChange}
                        placeholder="Digite EXCLUIR para confirmar"
                        className="border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-950/20 text-rose-200 placeholder-rose-800/50"
                        accentColor="rose"
                    />
                </div>
            </div>
        </SideBySideModal>
    );
}
