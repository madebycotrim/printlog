import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth, useUser } from "../contexts/AuthContext";
import { auth, storage } from "../services/firebase";
import { updateProfile, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Globe, WifiOff, Zap, Loader2, Activity } from 'lucide-react';
import api from './api';
import { calculatePasswordStrength } from './auth';
import { PDF_COLORS, drawPDFHeader } from './pdfUtils';

import { useSidebarStore } from '../stores/sidebarStore';

export const useLogicaConfiguracao = () => {
    const { signOut: encerrarSessao, updateUserData } = useAuth();
    const { user: usuario, isLoaded: estaCarregado } = useUser();
    const referenciaEntradaArquivo = useRef(null);

    const { width: larguraBarraLateral } = useSidebarStore();
    const [estaSalvando, setEstaSalvando] = useState(false);
    const [aviso, setAviso] = useState({ exibir: false, mensagem: '', tipo: 'sucesso' });
    const [primeiroNome, setPrimeiroNome] = useState("");
    const [nomeOficina, setNomeOficina] = useState("");
    const [nomeOriginal, setNomeOriginal] = useState("");
    const [exibirJanelaSenha, setExibirJanelaSenha] = useState(false);
    const [exibirModalReauth, setExibirModalReauth] = useState(false);
    const [formularioSenha, setFormularioSenha] = useState({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });

    // --- STORAGE STATS ---
    const [storageStats, setStorageStats] = useState({ userUsage: 0, maxStorage: 1024 * 1024 * 1024, percentage: 0 });

    const formatBytes = (bytes, decimals = 1) => {
        if (!+bytes) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    useEffect(() => {
        if (estaCarregado && usuario?.id) {
            api.get(`/stats?userId=${usuario.id}`)
                .then(res => setStorageStats(res.data))
                .catch(console.error);
        }
    }, [estaCarregado, usuario]);

    // Firebase do not expose "passwordEnabled" easily on client without checking providers.
    // Assuming password is enabled if provider is password.
    const temSenhaDefinida = useMemo(() => {
        if (!auth.currentUser) return false;
        return auth.currentUser.providerData.some(p => p.providerId === 'password');
    }, [usuario]);

    useEffect(() => {
        if (estaCarregado && usuario) {
            setPrimeiroNome(usuario.firstName || "");
            const savedWorkshopName = localStorage.getItem('printlog_workshop_name') || "";
            setNomeOficina(savedWorkshopName);
            setNomeOriginal(usuario.firstName || "");
        }
    }, [estaCarregado, usuario]);

    // --- SEGURANÇA E FORÇA DA SENHA ---
    const forcaSenha = useMemo(() => {
        return calculatePasswordStrength(formularioSenha.novaSenha);
    }, [formularioSenha.novaSenha]);

    const requisitosSenha = useMemo(() => {
        const senha = formularioSenha.novaSenha;
        return {
            tamanhoMinimo: senha.length >= 8,
            temMaiuscula: /[A-Z]/.test(senha),
            temMinuscula: /[a-z]/.test(senha),
            temNumero: /[0-9]/.test(senha),
            temEspecial: /[^A-Za-z0-9]/.test(senha),
            senhasConferem: senha.length > 0 && senha === formularioSenha.confirmarSenha
        };
    }, [formularioSenha.novaSenha, formularioSenha.confirmarSenha]);

    const todosRequisitosAtendidos = useMemo(() =>
        Object.values(requisitosSenha).every(req => req === true),
        [requisitosSenha]
    );

    // --- CARREGAMENTO DE IMAGEM (LOCAL STORAGE - SEM FIREBASE STORAGE) ---
    const manipularCarregamentoImagem = async (evento) => {
        const arquivo = evento.target.files[0];
        if (!arquivo) return;

        // Validação básica
        if (!arquivo.type.startsWith('image/')) {
            setAviso({ exibir: true, mensagem: "Apenas arquivos de imagem.", tipo: 'erro' });
            return;
        }

        if (arquivo.size > 2 * 1024 * 1024) { // Limitado a 2MB para não explodir o LocalStorage
            setAviso({ exibir: true, mensagem: "Imagem muito grande! Máximo 2MB.", tipo: 'erro' });
            return;
        }

        setEstaSalvando(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Usuário não autenticado");

            // Converter para Base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;

                try {
                    // 1. Salva no LocalStorage (Persistência Local)
                    const storageKey = `printlog_avatar_${user.uid}`;
                    localStorage.setItem(storageKey, base64String);

                    // 2. Atualiza Estado do App (Feedback Imediato)
                    // Nota: Não enviamos para o Firebase Auth (updateProfile) pois ele tem limite de caracteres baixo para photoURL
                    await updateUserData({ photoURL: base64String });

                    setAviso({ exibir: true, mensagem: "Foto salva localmente!", tipo: 'sucesso' });
                } catch (e) {
                    if (e.name === 'QuotaExceededError') {
                        setAviso({ exibir: true, mensagem: "Espaço local cheio!", tipo: 'erro' });
                    } else {
                        throw e;
                    }
                } finally {
                    setEstaSalvando(false);
                }
            };
            reader.readAsDataURL(arquivo);

        } catch (erro) {
            console.error("Erro ao processar imagem:", erro);
            setAviso({ exibir: true, mensagem: "Falha ao salvar a imagem.", tipo: 'erro' });
            setEstaSalvando(false);
        } finally {
            if (referenciaEntradaArquivo.current) {
                referenciaEntradaArquivo.current.value = "";
            }
        }
    };

    // --- AUXILIAR PARA BAIXAR ARQUIVOS ---
    const baixarArquivo = (dadosBrutos, nome) => {
        const enderecoUrl = window.URL.createObjectURL(dadosBrutos);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = enderecoUrl;
        link.download = nome;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(enderecoUrl);
        document.body.removeChild(link);
    };

    // --- EXPORTAÇÃO DE RELATÓRIOS (CSV / PDF) ---
    const exportarRelatorio = async (formato) => {
        setEstaSalvando(true);
        try {
            const resposta = await api.get('/users/backup');

            if (resposta.data && resposta.data.error) {
                console.error("Erro do backend:", resposta.data);
                throw new Error(`Erro do Servidor: ${resposta.data.error} - ${resposta.data.details || ''}`);
            }

            const dadosCompletos = resposta.data.data;

            if (!dadosCompletos) {
                console.error("Estrutura de resposta inválida:", resposta.data);
                throw new Error("Dados não encontrados ou resposta inválida");
            }

            const dataAtual = new Date().toISOString().split('T')[0];
            const nomeArquivo = `RELATORIO_SISTEMA_${dataAtual}`;

            // --- OPÇÃO 1: FORMATO PLANILHA (CSV) ---
            if (formato === 'csv') {
                let conteudoCsv = "\ufeff--- RELATÓRIO DE DADOS DO SISTEMA ---\n";
                conteudoCsv += `GERADO EM:;${new Date().toLocaleString()}\n\n`;

                if (dadosCompletos.filaments?.length > 0) {
                    conteudoCsv += `--- MATERIAIS (FILAMENTOS) ---\nID;NOME;MATERIAL;COR;PESO ATUAL;PRECO\n`;
                    dadosCompletos.filaments.forEach(item => {
                        conteudoCsv += `${item.id};"${item.nome}";${item.material};${item.cor};${item.peso_atual}g;${item.preco}\n`;
                    });
                }

                if (dadosCompletos.printers?.length > 0) {
                    conteudoCsv += `\n--- MÁQUINAS (IMPRESSORAS) ---\nNOME;MODELO;HORAS DE USO\n`;
                    dadosCompletos.printers.forEach(maquina => {
                        conteudoCsv += `"${maquina.nome}";"${maquina.modelo}";${maquina.horas_totais}h\n`;
                    });
                }

                if (dadosCompletos.clients?.length > 0) {
                    conteudoCsv += `\n--- CLIENTES ---\nNOME;EMPRESA;EMAIL;TELEFONE;ENDERECO\n`;
                    dadosCompletos.clients.forEach(c => {
                        conteudoCsv += `"${c.nome}";"${c.empresa || ''}";"${c.email || ''}";"${c.telefone || ''}";"${c.endereco || ''}"\n`;
                    });
                }

                const arquivoGerado = new Blob([conteudoCsv], { type: 'text/csv;charset=utf-8;' });
                baixarArquivo(arquivoGerado, `${nomeArquivo}.csv`);
            }

            // --- OPÇÃO 2: FORMATO DOCUMENTO (PDF) ---
            else if (formato === 'pdf') {
                const { jsPDF } = await import("jspdf");
                const { default: autoTable } = await import("jspdf-autotable");

                const documentoPdf = new jsPDF('p', 'mm', 'a4');
                const coresPaleta = {
                    ...PDF_COLORS,
                    azul: PDF_COLORS.ceu500,
                    verde: PDF_COLORS.verde500,
                    escuro: PDF_COLORS.zinco950
                };

                // Desenha cabeçalho padrão
                drawPDFHeader(documentoPdf, "RELATÓRIO TÉCNICO", "SISTEMA", usuario);

                documentoPdf.setFont("courier", "bold");
                documentoPdf.setFontSize(8);
                documentoPdf.setTextColor(120, 120, 120);
                documentoPdf.text(`OPERADOR: ${usuario?.fullName?.toUpperCase() || 'USUÁRIO'}`, 18, 38);

                let posicaoY = 55;

                // 3. SEÇÃO DE FILAMENTOS
                if (dadosCompletos.filaments?.length > 0) {
                    documentoPdf.setTextColor(...coresPaleta.escuro);
                    documentoPdf.setFont("helvetica", "bold");
                    documentoPdf.setFontSize(12);
                    documentoPdf.text("> 01. INVENTÁRIO DE MATERIAIS (FILAMENTOS)", 10, posicaoY);

                    autoTable(documentoPdf, {
                        startY: posicaoY + 4,
                        head: [['NOME', 'MATERIAL', 'COR', 'PESO DISPONÍVEL', 'PREÇO/KG']],
                        body: dadosCompletos.filaments.map(item => [item.nome, item.material, item.cor, `${item.peso_atual}g`, `R$ ${item.preco}`]),
                        headStyles: { fillColor: coresPaleta.azul, font: 'courier' },
                        theme: 'striped',
                        margin: { left: 10, right: 10 }
                    });
                    posicaoY = documentoPdf.lastAutoTable.finalY + 15;
                }

                // 4. SEÇÃO DE MÁQUINAS
                if (dadosCompletos.printers?.length > 0) {
                    if (posicaoY > 250) { documentoPdf.addPage(); posicaoY = 20; }
                    documentoPdf.setTextColor(...coresPaleta.escuro);
                    documentoPdf.setFont("helvetica", "bold");
                    documentoPdf.setFontSize(12);
                    documentoPdf.text("> 02. EQUIPAMENTOS (IMPRESSORAS)", 10, posicaoY);

                    autoTable(documentoPdf, {
                        startY: posicaoY + 4,
                        head: [['MÁQUINA', 'MODELO', 'USO ACUMULADO', 'SITUAÇÃO']],
                        body: dadosCompletos.printers.map(maquina => [maquina.nome, maquina.modelo, `${maquina.horas_totais}h`, 'ATIVO']),
                        headStyles: { fillColor: coresPaleta.verde, font: 'courier' },
                        theme: 'grid',
                        margin: { left: 10, right: 10 }
                    });
                    posicaoY = documentoPdf.lastAutoTable.finalY + 15;
                }

                // 5. SEÇÃO DE PROJETOS
                if (dadosCompletos.projects?.length > 0) {
                    if (posicaoY > 250) { documentoPdf.addPage(); posicaoY = 20; }
                    documentoPdf.setTextColor(...coresPaleta.escuro);
                    documentoPdf.setFont("helvetica", "bold");
                    documentoPdf.setFontSize(12);
                    documentoPdf.text("> 03. HISTÓRICO DE PRODUÇÃO (ÚLTIMOS PROJETOS)", 10, posicaoY);

                    autoTable(documentoPdf, {
                        startY: posicaoY + 4,
                        head: [['PROJETO', 'CLIENTE', 'CUSTO ESTIMADO', 'DATA']],
                        body: dadosCompletos.projects.slice(0, 15).map(projeto => [
                            projeto.nome,
                            projeto.cliente || 'USO INTERNO',
                            `R$ ${projeto.custo_total || 0}`,
                            new Date(projeto.created_at || Date.now()).toLocaleDateString()
                        ]),
                        headStyles: { fillColor: [80, 80, 80], font: 'courier' },
                        theme: 'striped',
                        margin: { left: 10, right: 10 }
                    });
                }

                // 6. RODAPÉ DO DOCUMENTO
                const totalPaginas = documentoPdf.internal.getNumberOfPages();
                for (let i = 1; i <= totalPaginas; i++) {
                    documentoPdf.setPage(i);
                    documentoPdf.setFontSize(7);
                    documentoPdf.setTextColor(150, 150, 150);
                    documentoPdf.setFont("courier", "normal");
                    documentoPdf.text(`RELATÓRIO DO SISTEMA // PÁGINA ${i} DE ${totalPaginas}`, 105, 290, { align: "center" });
                }

                const urlArquivo = documentoPdf.output('bloburl');
                window.open(urlArquivo, '_blank');
            }

            setAviso({ exibir: true, mensagem: `Arquivo ${formato.toUpperCase()} gerado com sucesso!`, tipo: 'sucesso' });
        } catch (erro) {
            console.error("Erro na exportação:", erro);
            setAviso({ exibir: true, mensagem: "Falha ao gerar o arquivo solicitado.", tipo: 'erro' });
        } finally {
            setEstaSalvando(false);
        }
    };

    const salvarAlteracoesGerais = async () => {
        setEstaSalvando(true);
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: primeiroNome });

                // Save workshop name to local storage
                localStorage.setItem('printlog_workshop_name', nomeOficina);
                window.dispatchEvent(new Event('workshopNameUpdated'));

                // Note: AuthContext should update automatically via onAuthStateChanged
                setNomeOriginal(primeiroNome);
                setAviso({ exibir: true, mensagem: "Perfil atualizado com sucesso!", tipo: 'sucesso' });
            }
        } catch {
            setAviso({ exibir: true, mensagem: "Erro ao salvar alterações.", tipo: 'erro' });
        } finally {
            setEstaSalvando(false);
        }
    };

    const atualizarSenha = async () => {
        setEstaSalvando(true);
        try {
            const user = auth.currentUser;
            if (!user) return;

            // Reauthenticate is usually required before updating password
            if (temSenhaDefinida) {
                const credential = EmailAuthProvider.credential(user.email, formularioSenha.senhaAtual);
                await reauthenticateWithCredential(user, credential);
            }

            await updatePassword(user, formularioSenha.novaSenha);

            setAviso({ exibir: true, mensagem: "Senha de segurança atualizada!", tipo: 'sucesso' });
            setExibirJanelaSenha(false);
            setFormularioSenha({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
        } catch (erroServidor) {
            console.error(erroServidor);
            if (erroServidor.code === 'auth/requires-recent-login') {
                const user = auth.currentUser;
                const isGoogle = user.providerData.some(p => p.providerId === 'google.com');

                if (isGoogle) {
                    try {
                        setAviso({ exibir: true, mensagem: "Por favor, confirme seu login com o Google para alterar a senha.", tipo: 'sucesso' });

                        const provider = new GoogleAuthProvider();
                        provider.setCustomParameters({ login_hint: user.email });

                        await reauthenticateWithPopup(user, provider);
                        await atualizarSenha(); // Recursive retry
                        return;
                    } catch (googleErro) {
                        console.error(googleErro);
                        if (googleErro.code === 'auth/user-mismatch') {
                            setAviso({ exibir: true, mensagem: "Conta incorreta selecionada! Use o mesmo e-mail: " + user.email, tipo: 'erro' });
                        } else {
                            setAviso({ exibir: true, mensagem: "Reautenticação cancelada ou falhou.", tipo: 'erro' });
                        }
                    }
                } else {
                    setAviso({ exibir: true, mensagem: "Login recente necessário. Saia e entre novamente.", tipo: 'erro' });
                }
            } else {
                setAviso({ exibir: true, mensagem: "Erro ao atualizar senha. Verifique os dados.", tipo: 'erro' });
            }
        } finally { setEstaSalvando(false); }
    };

    const confirmarExclusao = async (senha = null) => {
        setEstaSalvando(true);
        try {
            const user = auth.currentUser;
            if (!user) return;

            // Se senha foi fornecida (via ReauthModal), reautentica primeiro
            if (senha) {
                const credential = EmailAuthProvider.credential(user.email, senha);
                await reauthenticateWithCredential(user, credential);
                setExibirModalReauth(false); // Fecha modal se sucesso
            }

            // Tenta deletar
            await api.delete('/users'); // Delete data from DB
            await deleteUser(user); // Delete user from Firebase

            setAviso({ exibir: true, mensagem: "Sua conta foi removida. Saindo do sistema...", tipo: 'sucesso' });
        } catch (erro) {
            console.error(erro);
            // Se erro for de login recente, verifica o provider:
            if (erro.code === 'auth/requires-recent-login') {
                const user = auth.currentUser;
                const isGoogle = user.providerData.some(p => p.providerId === 'google.com');

                if (isGoogle) {
                    try {
                        setAviso({ exibir: true, mensagem: "Por favor, confirme seu login com o Google na janela que abrir.", tipo: 'sucesso' });

                        const provider = new GoogleAuthProvider();
                        // 'prompt: select_account' força a escolha, evitando loops silenciosos ou bloqueios
                        provider.setCustomParameters({ login_hint: user.email, prompt: 'select_account' });

                        console.log("Iniciando reauthenticateWithPopup...");
                        await reauthenticateWithPopup(user, provider);
                        console.log("Reautenticação concluída com sucesso!");

                        // Se sucesso, tenta excluir novamente
                        setAviso({ exibir: true, mensagem: "Login confirmado. Excluindo conta...", tipo: 'sucesso' });
                        await confirmarExclusao();
                        return;
                    } catch (googleErro) {
                        console.error("Erro CRÍTICO na Reautenticação Google:", googleErro);

                        let msg = "Falha na reautenticação do Google.";
                        if (googleErro.code === 'auth/popup-closed-by-user') {
                            msg = "A janela foi fechada antes de terminar. Tente novamente.";
                        } else if (googleErro.code === 'auth/popup-blocked') {
                            msg = "O navegador bloqueou a janela. Habilite pop-ups para este site.";
                        } else if (googleErro.code === 'auth/cancelled-popup-request') {
                            msg = "Operação cancelada (múltiplos cliques?). Tente mais devagar.";
                        } else if (googleErro.code === 'auth/user-mismatch') {
                            msg = `Conta incorreta! Faça login com ${user.email}`;
                        }

                        setAviso({ exibir: true, mensagem: msg, tipo: 'erro' });
                    }
                } else {
                    // Fallback para senha
                    setExibirModalReauth(true);
                    setAviso({ exibir: true, mensagem: "Confirme sua senha para continuar.", tipo: 'sucesso' });
                }
            } else if (erro.code === 'auth/wrong-password') {
                setAviso({ exibir: true, mensagem: "Senha incorreta.", tipo: 'erro' });
            } else {
                setAviso({ exibir: true, mensagem: "Erro ao excluir conta. Tente novamente mais tarde.", tipo: 'erro' });
            }
        } finally {
            // Se abriu modal, não para loading visual da pagina, mas o modal tem seu proprio loading?
            // Aqui decidimos parar o loading geral se NÃO estivermos esperando reauth
            // Mas como o modal abre, podemos parar o loading geral principal
            setEstaSalvando(false);
        }
    };

    const excluirContaPermanente = async () => {
        // Wrapper simples que chama a primeira vez sem senha
        confirmarExclusao();
    };

    const [statusConexaoNuvem, setStatusConexaoNuvem] = useState({
        rotulo: 'Conectando',
        cor: 'sky',
        informacao: 'Verificando sistema...',
        Icone: Loader2
    });

    useEffect(() => {
        let isMounted = true;

        const verificarSaudeSistema = async () => {
            const timeoutId = setTimeout(() => {
                if (isMounted) {
                    setStatusConexaoNuvem(prev => (prev.rotulo === 'Conectando' ? {
                        rotulo: 'Demorando...',
                        cor: 'amber',
                        informacao: 'Conexão lenta ou instável',
                        Icone: Loader2
                    } : prev));
                }
            }, 5000);

            try {
                const inicio = Date.now();
                const resposta = await api.get('/users/health');
                const tempoResposta = Date.now() - inicio;

                clearTimeout(timeoutId);

                if (!isMounted) return;

                if (resposta.data && resposta.data.status === 'online') {
                    const latenciaReal = resposta.data.latency || tempoResposta;

                    if (latenciaReal > 800) {
                        setStatusConexaoNuvem({
                            rotulo: 'Lenta',
                            cor: 'amber',
                            informacao: `Resposta em: ${latenciaReal}ms (Instável)`,
                            Icone: Zap
                        });
                    } else {
                        setStatusConexaoNuvem({
                            rotulo: 'Conectada',
                            cor: 'sky',
                            informacao: `Resposta em: ${latenciaReal}ms (Estável)`,
                            Icone: Globe
                        });
                    }
                } else {
                    setStatusConexaoNuvem({
                        rotulo: 'Indisponível',
                        cor: 'zinc',
                        informacao: 'Sistema em manutenção',
                        Icone: Activity
                    });
                }
            } catch (_erro) {
                clearTimeout(timeoutId);
                if (isMounted) {
                    setStatusConexaoNuvem({
                        rotulo: 'Desconectada',
                        cor: 'rose',
                        informacao: 'Sem comunicação com o servidor',
                        Icone: WifiOff
                    });
                }
            }
        };

        verificarSaudeSistema();
        const intervalo = setInterval(verificarSaudeSistema, 30000);

        return () => {
            isMounted = false;
            clearInterval(intervalo);
        };
    }, []);

    return {
        usuario,
        estaCarregado,

        referenciaEntradaArquivo,
        larguraBarraLateral,
        estaSalvando,
        aviso,
        setAviso,
        primeiroNome,
        setPrimeiroNome,
        setPrimeiroNome,
        nomeOficina,
        setNomeOficina,
        temAlteracao: primeiroNome !== nomeOriginal || nomeOficina !== (localStorage.getItem('printlog_workshop_name') || ""),
        exibirJanelaSenha,
        setExibirJanelaSenha,
        formularioSenha,
        setFormularioSenha,
        temSenhaDefinida,
        forcaSenha,
        requisitosSenha,
        todosRequisitosAtendidos,

        statusConexaoNuvem,
        salvarAlteracoesGerais,
        manipularCarregamentoImagem,
        atualizarSenha,
        exportarRelatorio,
        atualizarSenha,
        exportarRelatorio,
        excluirContaPermanente,
        confirmarExclusao, // Expose internal re-churn function or just use the state
        exibirModalReauth,
        setExibirModalReauth,
        setExibirModalReauth,
        confirmarExclusao,

        storageStats,
        formatBytes
    };
};
