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
    const [totalPrintingHours, setTotalPrintingHours] = useState(0); 
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (isLoaded && user) {
            setFirstName(user.firstName || "");
            setOriginalData({ firstName: user.firstName || "" });
            
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

    // --- LOGICA DE ALTERAÇÃO DE PERFIL ---
    const handleGlobalSave = async () => {
        if (!isLoaded || !user) return;
        setIsSaving(true);
        try {
            await user.update({ firstName });
            setOriginalData({ firstName });
            setToast({ show: true, message: "Bio-ID atualizado com sucesso!", type: 'success' });
        } catch (err) {
            setToast({ show: true, message: "Erro ao sincronizar perfil.", type: 'error' });
        } finally { setIsSaving(false); }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsSaving(true);
        try {
            await user.setProfileImage({ file });
            setToast({ show: true, message: "Bio-ID visual atualizado!", type: 'success' });
        } catch {
            setToast({ show: true, message: "Falha no upload da imagem.", type: 'error' });
        } finally { setIsSaving(false); }
    };

    // --- PROTOCOLO DE SENHA (CLERK) ---

    // 1. Redefinição via E-mail (Para quem esqueceu ou é login social)
    const handleResetPasswordEmail = async () => {
        try {
            setIsSaving(true);
            // Solicita ao Clerk para enviar um código/link de redefinição para o e-mail do usuário
            await user.preparePasswordReset({ strategy: "email_code" });
            setToast({ 
                show: true, 
                message: "Protocolo enviado! Verifique seu e-mail para redefinir a chave.", 
                type: 'success' 
            });
        } catch (err) {
            console.error(err);
            setToast({ show: true, message: "Falha ao disparar e-mail de recuperação.", type: 'error' });
        } finally { setIsSaving(false); }
    };

    // 2. Atualização Manual (Quando o usuário sabe a senha atual)
    const handleUpdatePassword = async () => {
        if (passwordForm.newPassword.length < 8) {
            setToast({ show: true, message: "A nova senha precisa ter pelo menos 8 caracteres.", type: 'error' });
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setToast({ show: true, message: "As senhas não coincidem.", type: 'error' });
            return;
        }

        setIsSaving(true);
        try {
            if (user.passwordEnabled) {
                await user.update({ 
                    password: passwordForm.newPassword, 
                    currentPassword: passwordForm.currentPassword 
                });
            } else {
                // Se for usuário social sem senha, o Clerk cria a primeira aqui
                await user.createPassword({ password: passwordForm.newPassword });
            }
            setToast({ show: true, message: "Chave de acesso atualizada!", type: 'success' });
            setShowPasswordModal(false);
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            const errorMsg = err.errors?.[0]?.longMessage || "Erro ao validar nova senha.";
            setToast({ show: true, message: errorMsg, type: 'error' });
        } finally { setIsSaving(false); }
    };

    // --- PROTOCOLO DE EXPURGO (BACKEND + CLERK) ---
    const handleDeleteAccount = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            // O backend limpa o D1 e deleta o usuário no Clerk via Secret Key
            const response = await api.delete('/users');
            
            if (response.success) {
                setToast({ show: true, message: "Expurgo concluído. Encerrando sessão...", type: 'success' });
                // Desloga e limpa o estado local após 2 segundos
                setTimeout(() => signOut(), 2000);
            }
        } catch (err) {
            setToast({ show: true, message: "Erro crítico no expurgo total.", type: 'error' });
            setIsSaving(false);
        }
    };

    // --- EXTRAÇÃO DE DADOS (PDF / PLANILHA / JSON) ---
    const exportFormattedData = async (format) => {
        try {
            setIsSaving(true);
            const response = await api.get(`/users/backup`);
            if (!response.success) throw new Error();

            const timestamp = new Date().toISOString().split('T')[0];

            if (format === 'pdf') {
                // Protocolo de Impressão do Navegador (Formatado pelo seu CSS)
                window.print();
            } else if (format === 'xlsx' || format === 'csv') {
                // Gera um CSV básico com os dados recebidos
                const data = response.data;
                let csv = "ID;NOME;MATERIAL;COR;PESO_ATUAL\n";
                data.filaments.forEach(f => {
                    csv += `${f.id};${f.nome};${f.material};${f.cor_hex};${f.peso_atual}\n`;
                });
                
                const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `printlog_manifesto_${timestamp}.csv`;
                link.click();
            }

            setToast({ show: true, message: `Manifesto ${format.toUpperCase()} gerado com sucesso.`, type: 'success' });
        } catch (err) {
            setToast({ show: true, message: "Erro ao gerar arquivo de exportação.", type: 'error' });
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
        totalPrintingHours,
        isDirty, isVisible,
        handleGlobalSave, handleImageUpload,
        showPasswordModal, setShowPasswordModal,
        passwordForm, setPasswordForm,
        handleUpdatePassword, 
        handleResetPasswordEmail,
        exportFormattedData,
        handleDeleteAccount
    };
};
