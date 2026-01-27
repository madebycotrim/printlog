import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Building2, Phone, Mail, MapPin, Loader2, AlertCircle, Terminal } from 'lucide-react';
import { useClientStore } from '../logic/clients';
import { UnifiedInput } from '../../../components/UnifiedInput';
import FormFeedback from '../../../components/FormFeedback';
import { useFormFeedback } from '../../../hooks/useFormFeedback';
import SideBySideModal from '../../../components/ui/SideBySideModal';

export default function ModalCliente({ isOpen, onClose, clienteParaEditar = null, reduced = false, onSuccess, initialData = {} }) {
    const { saveClient, isSaving } = useClientStore();
    const { feedback, showSuccess, showError, hide: hideFeedback } = useFormFeedback();

    const initialForm = useMemo(() => ({
        nome: "",
        empresa: "",
        email: "",
        telefone: "",

        endereco: "",
        observacoes: ""
    }), []);

    const [formData, setFormData] = useState(initialForm);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (clienteParaEditar) {
                setFormData(clienteParaEditar);
            } else {
                setFormData({ ...initialForm, ...initialData });
            }
            setIsDirty(false);
            hideFeedback();
        }
    }, [isOpen, clienteParaEditar, initialForm, hideFeedback, initialData]);

    const updateForm = (updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
        setIsDirty(true);
    };

    const handleTentativaFechar = useCallback(() => {
        if (isSaving) return;
        if (isDirty) {
            if (window.confirm("Você tem alterações não salvas. Deseja realmente sair?")) {
                onClose();
            }
        } else {
            onClose();
        }
    }, [isSaving, isDirty, onClose]);

    const handleSubmit = async () => {
        if (isSaving) return;

        if (!formData.nome.trim()) {
            showError("O nome do cliente é obrigatório.");
            return;
        }

        try {
            hideFeedback();
            const result = await saveClient(formData);
            if (result) {
                showSuccess(clienteParaEditar ? 'Cliente atualizado com sucesso!' : 'Novo cliente cadastrado!');
                if (onSuccess) {
                    // Se result for objeto com id, usa-o. Se não, tenta usar result direto.
                    const newId = result.id || result.data?.id || (typeof result === 'object' ? result.id : null);
                    onSuccess(newId);
                }
                setTimeout(() => {
                    onClose();
                }, 1000);
            }
        } catch {
            showError("Erro ao salvar cliente.");
        }
    };

    // Sidebar Content (Prévia)
    const sidebarContent = (
        <div className="flex flex-col items-center w-full space-y-10 relative z-10 h-full justify-between">
            <div className="w-full">
                <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-10">
                    <div className="h-px w-4 bg-zinc-900/50" />
                    <span>Prévia</span>
                    <div className="h-px w-4 bg-zinc-900/50" />
                </div>

                <div className="relative group p-10 rounded-[2.5rem] bg-zinc-950/50 border border-zinc-800 shadow-inner flex items-center justify-center backdrop-blur-sm mx-auto w-fit mb-10">
                    <div className="relative scale-110">
                        <User size={80} className="text-zinc-600" strokeWidth={1} />
                    </div>
                </div>

                <div className="text-center space-y-3 w-full">
                    <h3 className="text-xl font-bold text-zinc-100 tracking-tight truncate px-2 leading-tight">
                        {formData.nome || "Novo Cliente"}
                    </h3>
                    {formData.empresa ? (
                        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-800/50 inline-block">
                            {formData.empresa}
                        </span>
                    ) : (
                        <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                            Pessoa Física
                        </span>
                    )}
                </div>
            </div>


        </div>
    );

    // Footer Content
    const footerContent = ({ onClose }) => (
        <div className="flex flex-col gap-4 w-full">
            <FormFeedback
                type={feedback.type}
                message={feedback.message}
                show={feedback.show}
                onClose={hideFeedback}
            />

            {!formData.nome.trim() && isDirty && !isSaving && (
                <div className="flex items-center gap-2 text-rose-500 animate-shake mb-2">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Nome é obrigatório</span>
                </div>
            )}

            <div className="flex gap-4">
                <button disabled={isSaving} onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 transition-all disabled:opacity-20">
                    Cancelar
                </button>
                <button
                    disabled={isSaving}
                    onClick={handleSubmit}
                    className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 ${!isSaving ? "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 hover:shadow-xl shadow-lg shadow-indigo-900/20" : "bg-zinc-950/40 text-zinc-600 cursor-not-allowed"}`}
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
                    {isSaving ? "Salvando..." : clienteParaEditar ? "Salvar Cliente" : "Cadastrar Cliente"}
                </button>
            </div>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={isOpen}
            onClose={onClose}
            sidebar={sidebarContent}
            header={{
                title: clienteParaEditar ? "Editar Cliente" : (reduced ? "Cadastro Rápido" : "Cadastrar Cliente"),
                subtitle: clienteParaEditar ? "Atualize os dados de contato do cliente" : (reduced ? "Preencha apenas os dados essenciais para começar" : "Adicione um novo parceiro ou cliente à sua base")
            }}
            footer={footerContent}
            isSaving={isSaving}
            isDirty={isDirty}
        >
            <div className="space-y-8">
                {/* Seção 01 - Identificação */}
                <section className="space-y-5">
                    <div className="flex items-center gap-4">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">[01] Identificação</h4>
                        <div className="h-px bg-zinc-800/50 flex-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                        <div className="space-y-1.5 col-span-2 md:col-span-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Nome Completo</label>
                            <UnifiedInput
                                icon={User}
                                value={formData.nome}
                                onChange={(e) => updateForm({ nome: e.target.value })}
                                placeholder="Ex: João da Silva"
                            />
                        </div>
                        <div className="space-y-1.5 col-span-2 md:col-span-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Empresa (Opcional)</label>
                            <UnifiedInput
                                icon={Building2}
                                value={formData.empresa}
                                onChange={(e) => updateForm({ empresa: e.target.value })}
                                placeholder="Ex: Tech Solutions"
                            />
                        </div>
                    </div>
                </section>

                {/* Seção 02 - Contato */}
                <section className="space-y-5">
                    <div className="flex items-center gap-4">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">[02] Contato</h4>
                        <div className="h-px bg-zinc-800/50 flex-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                        <div className="space-y-1.5 col-span-2 md:col-span-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Email</label>
                            <UnifiedInput
                                icon={Mail}
                                value={formData.email}
                                onChange={(e) => updateForm({ email: e.target.value })}
                                placeholder="contato@exemplo.com"
                            />
                        </div>
                        <div className="space-y-1.5 col-span-2 md:col-span-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Telefone / WhatsApp</label>
                            <UnifiedInput
                                icon={Phone}
                                value={formData.telefone}
                                onChange={(e) => updateForm({ telefone: e.target.value })}
                                placeholder="(11) 99999-9999"
                            />
                        </div>
                    </div>
                </section>

                {/* Seção 03 - Detalhes */}
                {!reduced && (
                    <section className="space-y-5">
                        <div className="flex items-center gap-4">
                            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">[03] Dados Adicionais</h4>
                            <div className="h-px bg-zinc-800/50 flex-1" />
                        </div>
                        <div className="space-y-5">

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Endereço Completo</label>
                                <UnifiedInput
                                    icon={MapPin}
                                    value={formData.endereco}
                                    onChange={(e) => updateForm({ endereco: e.target.value })}
                                    placeholder="Rua, Número, Bairro, Cidade - UF"
                                />
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </SideBySideModal>
    );
}
