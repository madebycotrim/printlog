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
        const fileName = `PRINTLOG_MANIFESTO_${timestamp}`;

        // --- PROTOCOLO 1: CSV ---
        if (format === 'csv') {
            let csvContent = "\ufeff--- MANIFESTO DE DADOS PRINTLOG ---\n";
            csvContent += `GERADO EM:;${new Date().toLocaleString()}\n\n`;

            if (fullData.filaments?.length > 0) {
                csvContent += `--- FILAMENTOS ---\nID;NOME;MATERIAL;COR;PESO;PRECO\n`;
                fullData.filaments.forEach(f => {
                    csvContent += `${f.id};"${f.nome}";${f.material};${f.cor};${f.peso_atual}g;${f.preco}\n`;
                });
            }

            if (fullData.printers?.length > 0) {
                csvContent += `\n--- IMPRESSORAS ---\nNOME;MODELO;HORAS\n`;
                fullData.printers.forEach(p => {
                    csvContent += `"${p.nome}";"${p.modelo}";${p.horas_totais}h\n`;
                });
            }

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            downloadFile(blob, `${fileName}.csv`);
        }

        // --- PROTOCOLO 2: PDF PROFISSIONAL .SYS ---
        else if (format === 'pdf') {
            const doc = new jsPDF('p', 'mm', 'a4');
            const cores = { sky: [14, 165, 233], emerald: [16, 185, 129], dark: [10, 10, 10], grid: [235, 235, 235] };

            // 1. FUNDO TÉCNICO (GRADE MAKER)
            doc.setLineWidth(0.05);
            doc.setDrawColor(...cores.grid);
            for (let i = 0; i < 210; i += 5) doc.line(i, 0, i, 297);
            for (let i = 0; i < 297; i += 5) doc.line(0, i, 210, i);
            
            // Marcas de Canto (Mira)
            doc.setDrawColor(...cores.sky);
            doc.setLineWidth(0.5);
            doc.line(10, 10, 15, 10); doc.line(10, 10, 10, 15); // Topo esquerdo

            // 2. CABEÇALHO INDUSTRIAL
            doc.setFillColor(...cores.dark);
            doc.rect(10, 15, 190, 30, 'F');
            doc.setFillColor(...cores.sky);
            doc.rect(10, 15, 2, 30, 'F'); // Detalhe lateral

            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.text("MANIFESTO TÉCNICO", 18, 30);
            doc.setTextColor(...cores.sky);
            doc.text(".SYS", 98, 30);

            doc.setFont("courier", "bold");
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            const hash = Math.random().toString(36).toUpperCase().substring(2, 10);
            doc.text(`OPERADOR: ${user?.fullName?.toUpperCase() || 'MAKER'}`, 18, 38);
            doc.text(`ID_REF: ${hash} // ${new Date().toLocaleDateString()}`, 130, 38);

            let currentY = 55;

            // 3. SEÇÃO: FILAMENTOS (Condicional)
            if (fullData.filaments?.length > 0) {
                doc.setTextColor(...cores.dark);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text("> 01. INVENTÁRIO DE INSUMOS (FILAMENTOS)", 10, currentY);
                
                autoTable(doc, {
                    startY: currentY + 4,
                    head: [['NOME', 'MATERIAL', 'COR', 'PESO DISPONÍVEL', 'VALOR/KG']],
                    body: fullData.filaments.map(f => [f.nome, f.material, f.cor, `${f.peso_atual}g`, `R$ ${f.preco}`]),
                    headStyles: { fillColor: cores.sky, font: 'courier' },
                    theme: 'striped',
                    margin: { left: 10, right: 10 }
                });
                currentY = doc.lastAutoTable.finalY + 15;
            }

            // 4. SEÇÃO: IMPRESSORAS (Condicional)
            if (fullData.printers?.length > 0) {
                if (currentY > 250) { doc.addPage(); currentY = 20; }
                doc.setTextColor(...cores.dark);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text("> 02. UNIDADES DE PROCESSAMENTO (MÁQUINAS)", 10, currentY);
                
                autoTable(doc, {
                    startY: currentY + 4,
                    head: [['IMPRESSORA', 'MODELO', 'HORAS ACUMULADAS', 'STATUS']],
                    body: fullData.printers.map(p => [p.nome, p.modelo, `${p.horas_totais}h`, 'OPERACIONAL']),
                    headStyles: { fillColor: cores.emerald, font: 'courier' },
                    theme: 'grid',
                    margin: { left: 10, right: 10 }
                });
                currentY = doc.lastAutoTable.finalY + 15;
            }

            // 5. SEÇÃO: PROJETOS (Condicional)
            if (fullData.projects?.length > 0) {
                if (currentY > 250) { doc.addPage(); currentY = 20; }
                doc.setTextColor(...cores.dark);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text("> 03. LOG DE PRODUÇÃO (ÚLTIMOS PROJETOS)", 10, currentY);
                
                autoTable(doc, {
                    startY: currentY + 4,
                    head: [['PROJETO', 'CLIENTE', 'CUSTO ESTIMADO', 'DATA']],
                    body: fullData.projects.slice(0, 15).map(p => [
                        p.nome, 
                        p.cliente || 'INTERNO', 
                        `R$ ${p.custo_total || 0}`, 
                        new Date(p.created_at || Date.now()).toLocaleDateString()
                    ]),
                    headStyles: { fillColor: [80, 80, 80], font: 'courier' },
                    theme: 'striped',
                    margin: { left: 10, right: 10 }
                });
            }

            // 6. RODAPÉ TÉCNICO
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(7);
                doc.setTextColor(150, 150, 150);
                doc.setFont("courier", "normal");
                doc.text(`PRINTLOG DASHBOARD // BUILD_2026.MAKER // PÁGINA ${i} DE ${pageCount}`, 105, 290, { align: "center" });
            }

            // ABRIR EM NOVA ABA
            const blobURL = doc.output('bloburl');
            window.open(blobURL, '_blank');
        }

        setToast({ show: true, message: `${format.toUpperCase()} gerado com sucesso!`, type: 'success' });
    } catch (error) {
        console.error("Erro na exportação:", error);
        setToast({ show: true, message: "Falha técnica ao gerar manifesto.", type: 'error' });
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
