import { useState, useEffect, useRef } from 'react';
import { useClerk, useUser } from "@clerk/clerk-react";
import api from '../../../utils/api';

export const useConfigLogic = () => {
    const { signOut } = useClerk();
    const { user, isLoaded } = useUser();
    const fileInputRef = useRef(null);

    // Estados de Interface
    const [larguraSidebar, setLarguraSidebar] = useState(68);
    const [activeTab, setActiveTab] = useState('PERFIL');
    const [isSaving, setIsSaving] = useState(false);
    const [busca, setBusca] = useState("");
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [modalConfig, setModalConfig] = useState({
        open: false, title: "", message: "", type: "info", onConfirm: null
    });

    // Estados de Dados
    const [firstName, setFirstName] = useState("");
    const [originalData, setOriginalData] = useState({ firstName: "" });
    const [totalPrintingHours, setTotalPrintingHours] = useState(0); // Estado para armazenar o total de horas impressas
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Carrega dados iniciais do perfil e calcula horas totais das máquinas
    useEffect(() => {
        if (isLoaded && user) {
            setFirstName(user.firstName || "");
            setOriginalData({ firstName: user.firstName || "" });
            
            // Busca as impressoras para somar as horas de voo de todas as máquinas
            const fetchAndSumHours = async () => {
                try {
                    const printers = await api.get('/printers');
                    if (Array.isArray(printers)) {
                        const sum = printers.reduce((acc, p) => acc + (Number(p.horas_totais || p.totalHours) || 0), 0);
                        setTotalPrintingHours(Math.floor(sum));
                    }
                } catch (err) {
                    console.error("Erro ao calcular horas totais:", err);
                }
            };
            fetchAndSumHours();
        }
    }, [isLoaded, user]);

    const isDirty = firstName !== originalData.firstName;
    
    const isVisible = (tag) => !busca || tag.toLowerCase().includes(busca.toLowerCase());

    const getAuthInfo = () => {
        if (!user) return { method: "Padrão", isSocial: false };
        if (user.externalAccounts.length > 0) {
            const provider = user.externalAccounts[0].provider;
            return { method: provider.charAt(0).toUpperCase() + provider.slice(1), isSocial: true };
        }
        return { method: "E-mail e Senha", isSocial: false };
    };

    const handleGlobalSave = async () => {
        if (!isLoaded || !user) return;
        setIsSaving(true);
        try {
            await user.update({ firstName });
            setOriginalData({ firstName });
            setToast({ show: true, message: "Perfil atualizado com sucesso!", type: 'success' });
        } catch (err) {
            setToast({ show: true, message: "Erro ao sincronizar com a nuvem.", type: 'error' });
        } finally { setIsSaving(false); }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsSaving(true);
        try {
            await user.setProfileImage({ file });
            setToast({ show: true, message: "Sua foto de perfil foi atualizada!", type: 'success' });
        } catch {
            setToast({ show: true, message: "Não conseguimos enviar sua foto. Tente de novo?", type: 'error' });
        } finally { setIsSaving(false); }
    };

    const handleUpdatePassword = async () => {
        if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
            setToast({ show: true, message: "A nova senha precisa ter pelo menos 8 caracteres.", type: 'error' });
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setToast({ show: true, message: "As senhas digitadas não são iguais.", type: 'error' });
            return;
        }

        setIsSaving(true);
        try {
            if (user.passwordEnabled) {
                await user.update({ password: passwordForm.newPassword, currentPassword: passwordForm.currentPassword });
            } else {
                await user.createPassword({ password: passwordForm.newPassword });
            }
            setToast({ show: true, message: "Sua senha foi atualizada com sucesso!", type: 'success' });
            setShowPasswordModal(false);
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            const errorMsg = err.errors?.[0]?.longMessage || "Ops! Tivemos um erro ao atualizar sua senha.";
            setToast({ show: true, message: errorMsg, type: 'error' });
        } finally { setIsSaving(false); }
    };

    // Função de exclusão: Remove do banco de dados e depois deleta o usuário do Clerk
    const handleDeleteAccount = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            // 1. Limpa todos os dados vinculados ao userId no banco de dados (D1)
            const response = await api.delete('/users');
            
            if (response.success) {
                // 2. Deleta o registro do usuário permanentemente no serviço de autenticação (Clerk)
                await user.delete();
                
                setToast({ show: true, message: "Sua conta e todos os seus dados foram removidos. Até a próxima!", type: 'success' });
                
                // Pequeno delay para exibir o feedback antes de deslogar completamente
                setTimeout(() => signOut(), 1500);
            } else {
                throw new Error("Erro na resposta do servidor");
            }
        } catch (err) {
            console.error("Erro ao encerrar conta:", err);
            setToast({ show: true, message: "Não conseguimos excluir sua conta agora. Tente novamente mais tarde.", type: 'error' });
            setIsSaving(false);
        }
    };

    const exportFormattedData = async (format) => {
        try {
            setIsSaving(true);
            const response = await api.get(`/users/backup`);
            if (!response.success) throw new Error();

            const timestamp = new Date().getTime();
            let blob, filename;

            if (format === 'json') {
                blob = new Blob([JSON.stringify(response, null, 2)], { type: "application/json" });
                filename = `meu_backup_maker_${timestamp}.json`;
            } else if (format === 'csv') {
                const csvContent = `MEUS DADOS MAKER\nOperador,${firstName}\nID do Usuário,${user.id}`;
                blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
                filename = `minha_planilha_maker_${timestamp}.csv`;
            } else {
                window.print();
                setIsSaving(false); return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            setToast({ show: true, message: `Seu arquivo .${format.toUpperCase()} foi gerado!`, type: 'success' });
        } catch {
            setToast({ show: true, message: "Tivemos um problema ao gerar seu arquivo de backup.", type: 'error' });
        } finally { setIsSaving(false); }
    };

    return {
        user, isLoaded, signOut, fileInputRef,
        larguraSidebar, setLarguraSidebar,
        activeTab, setActiveTab,
        isSaving, busca, setBusca,
        toast, setToast,
        modalConfig, setModalConfig,
        firstName, setFirstName,
        totalPrintingHours, // Exposto para ser usado no badge de perfil
        isDirty, isVisible, getAuthInfo,
        handleGlobalSave, handleImageUpload,
        showPasswordModal, setShowPasswordModal,
        passwordForm, setPasswordForm,
        handleUpdatePassword, exportFormattedData,
        handleDeleteAccount
    };
};