import { useState, useEffect, useRef, useMemo } from 'react';
import { useClerk, useUser } from "@clerk/clerk-react";
import { Globe, WifiOff, Zap, Loader2, Activity } from 'lucide-react';
import api from './api';
import { calculatePasswordStrength } from './auth';
import { PDF_COLORS, drawPDFHeader } from './pdfUtils';

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { useSidebarStore } from '../stores/sidebarStore';

export const useLogicaConfiguracao = () => {
    const { signOut: encerrarSessao } = useClerk();
    const { user: usuario, isLoaded: estaCarregado } = useUser();
    const referenciaEntradaArquivo = useRef(null);

    const { width: larguraBarraLateral } = useSidebarStore();
    const [estaSalvando, setEstaSalvando] = useState(false);
    const [aviso, setAviso] = useState({ exibir: false, mensagem: '', tipo: 'sucesso' });
    const [primeiroNome, setPrimeiroNome] = useState("");
    const [nomeOriginal, setNomeOriginal] = useState("");
    const [exibirJanelaSenha, setExibirJanelaSenha] = useState(false);
    const [formularioSenha, setFormularioSenha] = useState({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });

    const temSenhaDefinida = useMemo(() => usuario?.passwordEnabled, [usuario]);

    useEffect(() => {
        if (estaCarregado && usuario) {
            setPrimeiroNome(usuario.firstName || "");
            setNomeOriginal(usuario.firstName || "");
        }
    }, [estaCarregado, usuario]);



    // ... existing imports ...

    // Inside hook...

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



    // --- CARREGAMENTO E OTIMIZAÇÃO DE IMAGEM ---
    const manipularCarregamentoImagem = async (evento) => {
        const arquivo = evento.target.files[0];
        if (!arquivo) return;
        setEstaSalvando(true);
        setAviso({ exibir: true, mensagem: "Otimizando imagem de perfil...", tipo: 'informativo' });

        const comprimirImagem = (arquivoOriginal) => new Promise((resolver) => {
            const leitor = new FileReader();
            leitor.readAsDataURL(arquivoOriginal);
            leitor.onload = (eventoLeitura) => {
                const imagem = new Image();
                imagem.src = eventoLeitura.target.result;
                imagem.onload = () => {
                    const quadro = document.createElement('canvas');
                    const tamanho = 400;
                    quadro.width = tamanho; quadro.height = tamanho;
                    const contexto = quadro.getContext('2d');
                    contexto.drawImage(imagem, 0, 0, tamanho, tamanho);
                    quadro.toBlob((blob) => resolver(new File([blob], arquivoOriginal.name, { type: "image/jpeg" })), "image/jpeg", 0.8);
                };
            };
        });

        try {
            const imagemOtimizada = await comprimirImagem(arquivo);
            await usuario.setProfileImage({ file: imagemOtimizada });
            setAviso({ exibir: true, mensagem: "Foto de perfil atualizada!", tipo: 'sucesso' });
        } catch {
            setAviso({ exibir: true, mensagem: "Erro ao enviar imagem.", tipo: 'erro' });
        } finally { setEstaSalvando(false); }
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
            const dadosCompletos = resposta.data.data;

            if (!dadosCompletos) throw new Error("Dados não encontrados");

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

                const arquivoGerado = new Blob([conteudoCsv], { type: 'text/csv;charset=utf-8;' });
                baixarArquivo(arquivoGerado, `${nomeArquivo}.csv`);
            }

            // --- OPÇÃO 2: FORMATO DOCUMENTO (PDF) ---
            else if (formato === 'pdf') {
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
            await usuario.update({ firstName: primeiroNome });
            setNomeOriginal(primeiroNome);
            setAviso({ exibir: true, mensagem: "Nome de perfil atualizado.", tipo: 'sucesso' });
        } catch {
            setAviso({ exibir: true, mensagem: "Erro ao salvar alterações.", tipo: 'erro' });
        } finally {
            setEstaSalvando(false);
        }
    };

    const atualizarSenha = async () => {
        setEstaSalvando(true);
        try {
            if (temSenhaDefinida) {
                await usuario.update({ password: formularioSenha.novaSenha, currentPassword: formularioSenha.senhaAtual });
            } else {
                await usuario.createPassword({ password: formularioSenha.novaSenha });
            }
            setAviso({ exibir: true, mensagem: "Senha de segurança atualizada!", tipo: 'sucesso' });
            setExibirJanelaSenha(false);
            setFormularioSenha({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
        } catch (erroServidor) {
            setAviso({ exibir: true, mensagem: erroServidor.errors?.[0]?.longMessage || "Erro ao atualizar senha.", tipo: 'erro' });
        } finally { setEstaSalvando(false); }
    };

    const excluirContaPermanente = async () => {
        setEstaSalvando(true);
        try {
            await api.delete('/users');
            setAviso({ exibir: true, mensagem: "Sua conta foi removida. Saindo do sistema...", tipo: 'sucesso' });
            setTimeout(() => encerrarSessao(), 2000);
        } catch {
            setAviso({ exibir: true, mensagem: "Erro ao tentar excluir os dados.", tipo: 'erro' });
            setEstaSalvando(false);
        }
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
            // Se demorar muito, já define como desconectado para não ficar em loop infinito visual
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
                const tempoResposta = Date.now() - inicio; // Medição local de latência para garantia

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
        const intervalo = setInterval(verificarSaudeSistema, 30000); // Polling a cada 30s

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
        temAlteracao: primeiroNome !== nomeOriginal,
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
        excluirContaPermanente
    };
};