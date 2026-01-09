import { useState, useEffect, useRef, useMemo } from 'react';
import { useClerk, useUser } from "@clerk/clerk-react";
import api from './api';

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const useConfigLogic = () => {
    const { signOut } = useClerk();
    const { user, isLoaded } = useUser();
    const fileInputRef = useRef(null);

    const [larguraSidebar, setLarguraSidebar] = useState(68);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [firstName, setFirstName] = useState("");
    const [originalName, setOriginalName] = useState("");
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

    const hasPassword = useMemo(() => user?.passwordEnabled, [user]);

    useEffect(() => {
        if (isLoaded && user) {
            setFirstName(user.firstName || "");
            setOriginalName(user.firstName || "");
        }
    }, [isLoaded, user]);

    // --- SENHA E SEGURANÇA ---
    const passwordStrength = useMemo(() => {
        const pass = passwordForm.newPassword;
        if (!pass) return { score: 0, label: "Aguardando", color: "zinc" };
        let score = 0;
        if (pass.length >= 8) score += 25;
        if (pass.length >= 12) score += 25;
        if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 25;
        if (/[^A-Za-z0-9]/.test(pass)) score += 25;

        if (score <= 25) return { score, label: "Fraca", color: "rose" };
        if (score <= 50) return { score, label: "Média", color: "amber" };
        if (score <= 75) return { score, label: "Forte", color: "sky" };
        return { score, label: "NIST-Compliant", color: "emerald" };
    }, [passwordForm.newPassword]);

    const isPasswordValid = useMemo(() =>
        passwordStrength.score >= 50 && passwordForm.newPassword === passwordForm.confirmPassword
        , [passwordStrength, passwordForm]);

    // --- UPLOAD E OTIMIZAÇÃO DE IMAGEM ---
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsSaving(true);
        setToast({ show: true, message: "Otimizando Bio-ID...", type: 'info' });

        const compress = (f) => new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(f);
            reader.onload = (ev) => {
                const img = new Image();
                img.src = ev.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const size = 400;
                    canvas.width = size; canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, size, size);
                    canvas.toBlob((blob) => resolve(new File([blob], f.name, { type: "image/jpeg" })), "image/jpeg", 0.8);
                };
            };
        });

        try {
            const optimized = await compress(file);
            await user.setProfileImage({ file: optimized });
            setToast({ show: true, message: "Bio-ID visual sincronizado!", type: 'success' });
        } catch {
            setToast({ show: true, message: "Erro no upload.", type: 'error' });
        } finally { setIsSaving(false); }
    };

    // --- HELPER DE DOWNLOAD ---
    const downloadFile = (blob, name) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    // --- EXPORTAÇÃO COMPLETA (CSV / PDF) ---
    const exportManifesto = async (format) => {
        setIsSaving(true);
        try {
            const res = await api.get('/users/backup');
            const fullData = res.data.data;

            if (!fullData) throw new Error("Dados não encontrados");

            const timestamp = new Date().toISOString().split('T')[0];
            const fileName = `PRINTLOG_EXPORT_${timestamp}`;

            // --- PROTOCOLO 1: PLANILHA DE DADOS (CSV) ---
            if (format === 'csv') {
                let csvContent = "\ufeff--- MANIFESTO DE DADOS PRINTLOG ---\n";
                csvContent += `Data de Exportação:;${new Date().toLocaleString()}\n\n`;

                // Seção de Filamentos
                csvContent += `--- FILAMENTOS (%: ${fullData.filaments?.length || 0}) ---\n`;
                csvContent += `ID;NOME;MATERIAL;COR;PESO ATUAL;PRECO\n`;
                fullData.filaments?.forEach(f => {
                    csvContent += `${f.id};"${f.nome}";${f.material};${f.cor};${f.peso_atual}g;${f.preco}\n`;
                });

                // Seção de Impressoras
                csvContent += `\n--- IMPRESSORAS (%: ${fullData.printers?.length || 0}) ---\n`;
                csvContent += `NOME;MODELO;HORAS DE USO\n`;
                fullData.printers?.forEach(p => {
                    csvContent += `"${p.nome}";"${p.modelo}";${p.horas_totais}h\n`;
                });

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                downloadFile(blob, `${fileName}.csv`);
            }

            // --- PROTOCOLO 2: RELATÓRIO TÉCNICO (PDF) ---
            else if (format === 'pdf') {
                const doc = new jsPDF();
                const now = new Date().toLocaleString();

                // Cabeçalho Industrial (Fundo Escuro)
                doc.setFillColor(10, 10, 10);
                doc.rect(0, 0, 210, 40, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(22);
                doc.setFont("helvetica", "bold");
                doc.text("MANIFESTO TÉCNICO .SYS", 15, 20);

                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(150, 150, 150);
                doc.text(`OPERADOR: ${user?.fullName?.toUpperCase() || 'MAKER'}`, 15, 30);
                doc.text(`GERADO VIA DASHBOARD - DATA: ${now}`, 120, 30);

                // 1. FILAMENTOS
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("1. INVENTÁRIO DE FILAMENTOS", 15, 55);

                const filamentRows = fullData.filaments?.map(f => [
                    f.nome, f.material, f.cor, `${f.peso_atual}g`, `R$ ${f.preco}`
                ]) || [];

                autoTable(doc, {
                    startY: 60,
                    head: [['Nome', 'Material', 'Cor', 'Peso', 'Preço']],
                    body: filamentRows,
                    headStyles: { fillColor: [14, 165, 233] }, // Azul Sky
                    theme: 'striped',
                    margin: { left: 15, right: 15 }
                });

                // 2. IMPRESSORAS
                let finalY = doc.lastAutoTable.finalY + 15;
                doc.setFontSize(14);
                doc.text("2. FROTA DE IMPRESSORAS", 15, finalY);

                const printerRows = fullData.printers?.map(p => [
                    p.nome, p.modelo, `${p.horas_totais}h`
                ]) || [];

                autoTable(doc, {
                    startY: finalY + 5,
                    head: [['Impressora', 'Modelo', 'Uso Total']],
                    body: printerRows,
                    headStyles: { fillColor: [16, 185, 129] }, // Verde Emerald
                    theme: 'grid',
                    margin: { left: 15, right: 15 }
                });

                // 3. PROJETOS
                finalY = doc.lastAutoTable.finalY + 15;
                doc.setFontSize(14);
                doc.text("3. LOG DE PROJETOS", 15, finalY);

                const projectRows = fullData.projects?.map(p => [
                    p.nome, p.cliente || 'Interno', `R$ ${p.custo_total || 0}`
                ]) || [];

                autoTable(doc, {
                    startY: finalY + 5,
                    head: [['Projeto', 'Cliente', 'Custo Final']],
                    body: projectRows,
                    headStyles: { fillColor: [100, 100, 100] }, // Cinza
                    theme: 'striped',
                    margin: { left: 15, right: 15 }
                });

                doc.save(`${fileName}.pdf`);
            }

            setToast({ show: true, message: `Manifesto ${format.toUpperCase()} exportado com sucesso!`, type: 'success' });
        } catch (error) {
            console.error("Erro na exportação:", error);
            setToast({ show: true, message: "Falha técnica na geração do arquivo.", type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleGlobalSave = async () => {
        setIsSaving(true);
        try {
            await user.update({ firstName });
            setOriginalName(firstName);
            setToast({ show: true, message: "Bio-ID atualizado.", type: 'success' });
        } catch { setToast({ show: true, message: "Erro ao salvar.", type: 'error' }); }
        finally { setIsSaving(false); }
    };

    const handleUpdatePassword = async () => {
        setIsSaving(true);
        try {
            if (hasPassword) {
                await user.update({ password: passwordForm.newPassword, currentPassword: passwordForm.currentPassword });
            } else {
                await user.createPassword({ password: passwordForm.newPassword });
            }
            setToast({ show: true, message: "Protocolo de segurança atualizado.", type: 'success' });
            setShowPasswordModal(false);
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            setToast({ show: true, message: err.errors?.[0]?.longMessage, type: 'error' });
        } finally { setIsSaving(false); }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("PROTOCOLAR EXPURGO TOTAL? Esta ação não pode ser desfeita.")) return;
        setIsSaving(true);
        try {
            await api.delete('/users');
            setToast({ show: true, message: "Dados eliminados. Encerrando sessão...", type: 'success' });
            setTimeout(() => signOut(), 2000);
        } catch { setToast({ show: true, message: "Erro no expurgo.", type: 'error' }); setIsSaving(false); }
    };

    return {
        user, isLoaded, fileInputRef, larguraSidebar, setLarguraSidebar,
        isSaving, toast, setToast, firstName, setFirstName, isDirty: firstName !== originalName,
        showPasswordModal, setShowPasswordModal, passwordForm, setPasswordForm,
        hasPassword, passwordStrength, isPasswordValid,
        handleGlobalSave, handleImageUpload, handleUpdatePassword, exportManifesto, handleDeleteAccount
    };
};
