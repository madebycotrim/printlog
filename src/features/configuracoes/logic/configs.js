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

    const handleGlobalSave = async () => {
        if (!isLoaded || !user) return;
        setIsSaving(true);
        try {
            await user.update({ firstName });
            setOriginalData({ firstName });
            setToast({ show: true, message: "Bio-ID atualizado no sistema.", type: 'success' });
        } catch (err) {
            setToast({ show: true, message: "Falha na sincronização orbital.", type: 'error' });
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
            setToast({ show: true, message: "Erro no upload da imagem.", type: 'error' });
        } finally { setIsSaving(false); }
    };

    // --- LÓGICA DE SENHA INTELIGENTE ---
    
    // Dispara e-mail de redefinição (Caso esqueceu ou logou via rede social)
    const handleResetPasswordEmail = async () => {
        try {
            setIsSaving(true);
            // O Clerk envia para o e-mail primário do usuário logado
            await user.preparePasswordReset({ strategy: "email_code" });
            setToast({ 
                show: true, 
                message: "Protocolo enviado! Verifique seu e-mail para redefinir.", 
                type: 'success' 
            });
        } catch (err) {
            setToast({ show: true, message: "Falha ao disparar e-mail de recuperação.", type: 'error' });
        } finally { setIsSaving(false); }
    };

    const handleUpdatePassword = async () => {
        // Validação mínima de 8 caracteres (Sincronizado com o Clerk que configuramos)
        if (passwordForm.newPassword.length < 8) {
            setToast({ show: true, message: "A chave deve conter no mínimo 8 caracteres.", type: 'error' });
            return;
        }

        setIsSaving(true);
        try {
            if (user.passwordEnabled) {
                // Se já tem senha, exige a antiga (Update)
                await user.update({ 
                    password: passwordForm.newPassword, 
                    currentPassword: passwordForm.currentPassword 
                });
            } else {
                // Se é user social sem senha, cria a primeira (Create)
                await user.createPassword({ password: passwordForm.newPassword });
            }
            
            setToast({ show: true, message: "Nova chave de acesso criptografada!", type: 'success' });
            setShowPasswordModal(false);
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            // Captura erro de senha fraca ou senha atual incorreta
            const errorMsg = err.errors?.[0]?.longMessage || "Erro ao validar nova chave.";
            setToast({ show: true, message: errorMsg, type: 'error' });
        } finally { setIsSaving(false); }
    };

    // --- EXCLUSÃO TOTAL (BANCO + CLERK) ---
    const handleDeleteAccount = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            // O Backend agora lida com tudo (D1 + Clerk API)
            const response = await api.delete('/users');
            
            if (response.success) {
                setToast({ show: true, message: "Expurgo concluído. Encerrando sessão...", type: 'success' });
                // Redireciona e limpa tokens
                setTimeout(() => {
                    signOut();
                    window.location.href = "/";
                }, 2000);
            }
        } catch (err) {
            setToast({ show: true, message: "Falha crítica no protocolo de purga.", type: 'error' });
            setIsSaving(false);
        }
    };

    // --- EXPORTAÇÃO DE DADOS (PDF / PLANILHA) ---
    const exportFormattedData = async (format) => {
        try {
            setIsSaving(true);
            const response = await api.get(`/users/backup`);
            if (!response.success) throw new Error();

            const timestamp = new Date().toISOString().split('T')[0];
            
            if (format === 'pdf') {
                // Para PDF, geralmente usamos a função de impressão do navegador formatada
                // ou uma biblioteca como jspdf. Aqui usamos o print padrão do sistema.
                window.print();
            } else if (format === 'xlsx' || format === 'csv') {
                // Simulação de CSV/Planilha
                const data = response.data;
                let csvContent = "data:text/csv;charset=utf-8,ID;NOME;MATERIAL;COR\n";
                data.filaments.forEach(f => {
                    csvContent += `${f.id};${f.nome};${f.material};${f.cor_hex}\n`;
                });

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `printlog_manifesto_${timestamp}.csv`);
                document.body.appendChild(link);
                link.click();
            }

            setToast({ show: true, message: `Manifesto ${format.toUpperCase()} gerado com sucesso.`, type: 'success' });
        } catch {
            setToast({ show: true, message: "Erro ao extrair logs de dados.", type: 'error' });
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
        handleResetPasswordEmail, // Exposto para o botão de e-mail
        exportFormattedData,
        handleDeleteAccount
    };
};
