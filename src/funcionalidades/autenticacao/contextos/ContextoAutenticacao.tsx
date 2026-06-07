import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  AuthError,

  deleteUser,
  linkWithCredential,
  signInWithCredential,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendEmailVerification,
} from "firebase/auth";
import { autenticacao } from "@/compartilhado/servicos/firebase";
import { registrar, mascararDadoPessoal } from "@/compartilhado/utilitarios/registrador";
import { useArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { toast } from "react-hot-toast";

import { Usuario } from "@/compartilhado/tipos/modelos";

interface ContextoAutenticacaoProps {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastro: (email: string, senha: string, nome: string) => Promise<void>;
  sair: (mostrarToast?: boolean) => Promise<void>;
  recuperarSenha: (email: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  loginGithub: () => Promise<void>;
  atualizarPerfil: (dados: { nome?: string; fotoUrl?: string }) => Promise<void>;
  excluirConta: () => Promise<void>;
  exportarDadosPessoais: () => Promise<void>;
  buscarToken: () => Promise<string | null>;
  enviarLinkMagicoLogin: (email: string) => Promise<void>;
  enviarEmailVerificacao: () => Promise<void>;
  recarregarUsuario: () => Promise<void>;
}

const ContextoAutenticacao = createContext<ContextoAutenticacaoProps>({} as ContextoAutenticacaoProps);

/**
 * Hook para acessar o contexto de autenticação.
 */
export function useAutenticacao() {
  return useContext(ContextoAutenticacao);
}

interface ProvedorAutenticacaoProps {
  children: ReactNode;
}

/**
 * Registra o aceite dos termos e política de privacidade no banco de dados.
 * @param uid - ID do usuário
 */
const registrarAceiteTermos = async (uid: string) => {
  try {
    const token = await autenticacao.currentUser?.getIdToken();
    if (!token) return;

    await fetch("/api/usuario-aceite", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        versao_termos: "2026-05-14",
        versao_politica: "2026-05-14",
      })
    });

    registrar.info({ rastreioId: `aceite-${uid}` }, "Aceite de termos registrado no Cloudflare D1.");
  } catch (erro) {
    registrar.error({ rastreioId: `aceite-${uid}` }, "Falha ao registrar aceite", erro);
  }
};

/**
 * Provedor de Contexto de Autenticação.
 * Gerencia o estado global do usuário e integração com Firebase Auth.
 */
export function ProvedorAutenticacao({ children }: ProvedorAutenticacaoProps) {
  const [usuario, definirUsuario] = useState<Usuario | null>(null);
  const [carregando, definirCarregando] = useState(true);
  const inicializadoRef = useRef(false);
  const logoutIntencionalRef = useRef(false);
  const usuarioAnteriorRef = useRef<Usuario | null>(null);
  const carregarConfiguracoes = useArmazemConfiguracoes((s) => s.carregarDoD1);

  useEffect(() => {
    const inicializarApp = async () => {
      try {
        registrar.info({ rastreioId: "sistema", servico: "Autenticacao" }, "Iniciando Autenticação...");
        
        // Processa Login com Magic Link se existir
        if (isSignInWithEmailLink(autenticacao, window.location.href)) {
          let emailForSignIn = window.localStorage.getItem("emailForSignIn");
          
          if (!emailForSignIn) {
            // Se o e-mail não estiver no localStorage (usuário abriu o link em outro dispositivo)
            // Pedimos para ele confirmar o e-mail. Usaremos um window.prompt como fallback seguro.
            emailForSignIn = window.prompt("Por favor, digite seu e-mail para confirmação de segurança:");
          }
          
          if (emailForSignIn) {
            try {
              registrar.info({ rastreioId: "sistema", servico: "Autenticacao" }, "Processando Link Mágico...");
              await signInWithEmailLink(autenticacao, emailForSignIn, window.location.href);
              window.localStorage.removeItem("emailForSignIn");
              
              // Limpa a URL removendo os parâmetros do Firebase sem recarregar a página
              if (window.history && window.history.replaceState) {
                window.history.replaceState({}, document.title, window.location.pathname);
              }
              
              toast.success("Login com Link Mágico realizado com sucesso!");
            } catch (err) {
              registrar.error({ rastreioId: "sistema", servico: "Autenticacao" }, "Falha ao logar com Link Mágico", err);
              toast.error("O link é inválido ou já expirou. Tente gerar um novo.");
            }
          }
        }

        // Processa o redirecionamento
        registrar.info({ rastreioId: "sistema", servico: "Autenticacao" }, "Verificando resultado de redirecionamento do Google...");
        const resultado = await getRedirectResult(autenticacao);
        
        if (resultado) {
          registrar.info(
            { rastreioId: resultado.user.uid, servico: "Autenticacao", evento: "LOGIN_REDIRECT_SUCESSO" },
            `Google Redirect detectado para: ${mascararDadoPessoal(resultado.user.email || "", "email")}`
          );
        } else {
          registrar.info({ rastreioId: "sistema", servico: "Autenticacao" }, "Nenhum resultado de redirecionamento pendente.");
        }
      } catch (erro) {
        registrar.error({ rastreioId: "sistema", servico: "Autenticacao" }, "Falha na inicialização do Firebase Auth", erro);
      }
    };

    inicializarApp();

    const cancelarInscricao = onAuthStateChanged(autenticacao, (user) => {
      registrar.info(
        { rastreioId: user?.uid || "anônimo", servico: "Autenticacao", evento: "AUTH_STATE_CHANGED" },
        user ? `Usuário identificado: ${mascararDadoPessoal(user.email || "", "email")}` : "Nenhum usuário logado."
      );

      if (user) {
        const ehGoogle = user.providerData.some((provedor) => provedor.providerId === "google.com");
        const ehGithub = user.providerData.some((provedor) => provedor.providerId === "github.com");
        const plano = useArmazemConfiguracoes.getState().plano;
        
        const novoUsuario = {
          uid: user.uid,
          email: user.email,
          nome: user.displayName,
          fotoUrl: user.photoURL,
          provedorGoogle: ehGoogle,
          provedorGithub: ehGithub,
          plano: plano,
          dataAceiteTermos: new Date().toISOString(), // Idealmente buscar do banco D1
          versaoTermos: "2026-05-14",
          emailVerified: user.emailVerified,
        };
        
        definirUsuario(novoUsuario);
        usuarioAnteriorRef.current = novoUsuario;
        logoutIntencionalRef.current = false;
        carregarConfiguracoes(user.uid);
      } else {
        if (usuarioAnteriorRef.current && !logoutIntencionalRef.current) {
          // Se o usuário foi desconectado pelo Firebase (sessão expirada, etc) sem chamar sair()
          toast.error("Sua sessão expirou por segurança. Faça login novamente.", { id: "sessao-expirada" });
        }
        definirUsuario(null);
        usuarioAnteriorRef.current = null;
      }

      // Finaliza o estado de carregamento global após a primeira resposta real
      if (!inicializadoRef.current) {
        inicializadoRef.current = true;
        definirCarregando(false);
      }
    });

    return () => cancelarInscricao();
  }, [carregarConfiguracoes]);

  // Sincroniza o plano do ArmazemConfiguracoes com o objeto de usuário de forma reativa
  useEffect(() => {
    const cancelarInscricaoPlano = useArmazemConfiguracoes.subscribe(
      (estado) => estado.plano,
      (plano) => {
        definirUsuario((prev) => (prev ? { ...prev, plano } : null));
      }
    );
    return () => cancelarInscricaoPlano();
  }, []);

  /**
   * Traduz códigos de erro do Firebase para mensagens amigáveis em PT-BR.
   * @param erro - Erro original do Firebase
   */
  const traduzirErroFirebase = (erro: unknown) => {
    const authError = erro as AuthError;
    registrar.error({ rastreioId: "sistema", servico: "Autenticacao" }, `Erro Firebase: ${authError.code}`, authError);
    switch (authError.code) {
      case "auth/email-already-in-use":
        throw new Error("Este email já está em uso.");
      case "auth/invalid-email":
        throw new Error("O email informado é inválido.");
      case "auth/operation-not-allowed":
        throw new Error("Operação não permitida.");
      case "auth/weak-password":
        throw new Error("A senha é muito fraca. Escolha uma senha mais forte.");
      case "auth/user-disabled":
        throw new Error("Este usuário foi desativado.");
      case "auth/user-not-found":
      case "auth/invalid-credential":
        throw new Error("Email ou senha incorretos.");
      case "auth/wrong-password":
        throw new Error("Senha incorreta.");
      case "auth/account-exists-with-different-credential":
        throw new Error("Já existe uma conta associada a este e-mail usando outro provedor (ex: Google). Por favor, acesse pelo método original.");
      default:
        throw new Error("Ocorreu um erro inesperado. Tente novamente mais tarde.");
    }
  };

  /**
   * Envia link de login sem senha para o e-mail informado.
   */
  const enviarLinkMagicoLogin = async (email: string) => {
    try {
      const actionCodeSettings = {
        // A URL que o usuário será redirecionado após clicar no link.
        // Vamos usar a mesma página onde ele estava.
        url: window.location.origin + "/autenticacao",
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(autenticacao, email, actionCodeSettings);
      
      // Salva o email no localStorage para completar o login sem o usuário ter que digitar de novo
      window.localStorage.setItem("emailForSignIn", email);
      
      registrar.info(
        { rastreioId: "anônimo", servico: "Autenticacao", evento: "LINK_MAGICO_ENVIADO" },
        `Link mágico enviado para: ${mascararDadoPessoal(email, "email")}`
      );
    } catch (erro: unknown) {
      registrar.error({ rastreioId: "sistema", servico: "Autenticacao" }, "Falha ao enviar Link Mágico", erro);
      traduzirErroFirebase(erro);
    }
  };

  /**
   * Realiza login com email e senha.
   */
  const login = async (email: string, senha: string) => {
    try {
      const credencial = await signInWithEmailAndPassword(autenticacao, email, senha);
      registrar.info(
        { rastreioId: credencial.user.uid, servico: "Autenticacao", evento: "LOGIN_SUCESSO" },
        "Login realizado com sucesso via email/senha"
      );
    } catch (erro: unknown) {
      registrar.warn(
        { rastreioId: "desconhecido", servico: "Autenticacao", evento: "LOGIN_FALHA", metodo: "email" },
        "Tentativa de login falhou"
      );
      traduzirErroFirebase(erro);
    }
  };

  /**
   * Realiza o cadastro de um novo usuário.
   */
  const cadastro = async (email: string, senha: string, nome: string) => {
    try {
      const credencial = await createUserWithEmailAndPassword(autenticacao, email, senha);
      await updateProfile(credencial.user, { displayName: nome });

      await registrarAceiteTermos(credencial.user.uid);

      registrar.info(
        { rastreioId: credencial.user.uid, servico: "Autenticacao", evento: "CADASTRO_SUCESSO" },
        "Novo usuário cadastrado com sucesso"
      );

      // Atualiza o estado local imediatamente para refletir o nome
      definirUsuario({
        uid: credencial.user.uid,
        email: credencial.user.email,
        nome: nome,
        fotoUrl: credencial.user.photoURL,
        provedorGoogle: false,
        plano: "FREE",
      });
    } catch (erro: unknown) {
      registrar.warn(
        { rastreioId: "desconhecido", servico: "Autenticacao", evento: "CADASTRO_FALHA" },
        "Tentativa de cadastro falhou"
      );
      traduzirErroFirebase(erro);
    }
  };

  /**
   * Encerra a sessão do usuário.
   */
  const sair = async (mostrarToast = true) => {
    const uid = usuario?.uid || "desconhecido";
    try {
      logoutIntencionalRef.current = true;
      await signOut(autenticacao);
      registrar.info(
        { rastreioId: uid, servico: "Autenticacao", evento: "LOGOUT" },
        "Sessão encerrada pelo usuário"
      );
      if (mostrarToast) {
        toast.success("Você foi deslogado com sucesso.");
      }
    } catch (erro: unknown) {
      registrar.error({ rastreioId: uid, servico: "Autenticacao", evento: "LOGOUT_FALHA" }, "Erro ao sair", erro);
      if (mostrarToast) {
        toast.error("Ocorreu um erro ao tentar deslogar.");
      }
    }
  };

  /**
   * Envia email de recuperação de senha.
   */
  const recuperarSenha = async (email: string) => {
    try {
      await sendPasswordResetEmail(autenticacao, email);
    } catch (erro: unknown) {
      traduzirErroFirebase(erro);
    }
  };

  /**
   * Recarrega os dados do usuário atual (útil para atualizar emailVerified).
   */
  const recarregarUsuario = async () => {
    if (autenticacao.currentUser) {
      await autenticacao.currentUser.reload();
      // Força a atualização do estado local criando um novo objeto
      definirUsuario((prev) => prev ? { ...prev, emailVerified: autenticacao.currentUser?.emailVerified } : null);
    }
  };

  /**
   * Envia um e-mail de verificação para o usuário atual.
   */
  const enviarEmailVerificacao = async () => {
    try {
      definirCarregando(true);
      if (!autenticacao.currentUser) throw new Error("Usuário não autenticado");
      
      await autenticacao.currentUser.reload();
      if (autenticacao.currentUser.emailVerified) {
        definirUsuario((prev) => prev ? { ...prev, emailVerified: true } : null);
        toast.success("Seu e-mail já está verificado!");
        return;
      }
      
      await sendEmailVerification(autenticacao.currentUser);
      toast.success("E-mail de verificação enviado! Verifique sua caixa de entrada e spam.");
    } catch (erro: any) {
      registrar.error({ rastreioId: "auth", servico: "Autenticacao" }, "Erro ao enviar verificacao", erro);
      toast.error("Falha ao enviar e-mail de verificação. Tente novamente mais tarde.");
      throw erro;
    } finally {
      definirCarregando(false);
    }
  };

  /**
   * Realiza login utilizando o Google.
   * Em localhost, prioriza Popup para melhor experiência.
   * Em produção ou se o popup falhar, usa Redirect.
   */
  const loginGoogle = async () => {
    const provedor = new GoogleAuthProvider();

    try {
      registrar.info({ rastreioId: "sistema", servico: "Autenticacao" }, "Iniciando tentativa de login via Google Popup...");
      await signInWithPopup(autenticacao, provedor);
      registrar.info({ rastreioId: "sistema", servico: "Autenticacao" }, "Login via Popup concluído com sucesso.");
    } catch (erro: any) {
      if (erro.code === "auth/account-exists-with-different-credential") {
        registrar.warn({ rastreioId: "sistema", servico: "Autenticacao" }, "E-mail já cadastrado com outro provedor. Tentando vincular...");
        try {
          const credencialPendente = GoogleAuthProvider.credentialFromError(erro);
          if (credencialPendente) {
            const provedorGithub = new GithubAuthProvider();
            registrar.info({ rastreioId: "sistema", servico: "Autenticacao" }, "Solicitando login com GitHub para fins de vinculação...");
            const resultadoGithub = await signInWithPopup(autenticacao, provedorGithub);
            try {
              await linkWithCredential(resultadoGithub.user, credencialPendente);
              registrar.info({ rastreioId: resultadoGithub.user.uid, servico: "Autenticacao" }, "Conta do Google vinculada com sucesso à conta GitHub.");
            } catch (erroVinculo: any) {
              if (erroVinculo.code === "auth/email-already-in-use") {
                registrar.warn({ rastreioId: "sistema", servico: "Autenticacao" }, "Google já está vinculado a outra conta. Efetuando login direto...");
                await signInWithCredential(autenticacao, credencialPendente);
                return;
              }
              throw erroVinculo;
            }
            return;
          }
        } catch (erroGeralVinculo: any) {
          registrar.error({ rastreioId: "sistema", servico: "Autenticacao" }, "Falha geral ao vincular Google ao GitHub", erroGeralVinculo);
          traduzirErroFirebase(erroGeralVinculo);
        }
      }

      if (erro.code === "auth/popup-blocked" || erro.code === "auth/cancelled-popup-request") {
        registrar.warn({ rastreioId: "sistema", servico: "Autenticacao" }, "Popup bloqueado ou fechado, tentando Redirect...");
        await signInWithRedirect(autenticacao, provedor);
        return;
      }
      
      registrar.error(
        { rastreioId: "sistema", servico: "Autenticacao", erro: erro.code },
        "Falha ao realizar login com Google",
        erro
      );
      traduzirErroFirebase(erro);
    }
  };

  /**
   * Realiza login utilizando o GitHub.
   * Em localhost, prioriza Popup para melhor experiência.
   * Em produção ou se o popup falhar, usa Redirect.
   */
  const loginGithub = async () => {
    const provedor = new GithubAuthProvider();

    try {
      registrar.info({ rastreioId: "sistema", servico: "Autenticacao" }, "Iniciando tentativa de login via GitHub Popup...");
      await signInWithPopup(autenticacao, provedor);
      registrar.info({ rastreioId: "sistema", servico: "Autenticacao" }, "Login via Popup concluído com sucesso.");
    } catch (erro: any) {
      if (erro.code === "auth/account-exists-with-different-credential") {
        registrar.warn({ rastreioId: "sistema", servico: "Autenticacao" }, "E-mail já cadastrado com outro provedor. Tentando vincular...");
        try {
          const credencialPendente = GithubAuthProvider.credentialFromError(erro);
          if (credencialPendente) {
            const provedorGoogle = new GoogleAuthProvider();
            registrar.info({ rastreioId: "sistema", servico: "Autenticacao" }, "Solicitando login com Google para fins de vinculação...");
            const resultadoGoogle = await signInWithPopup(autenticacao, provedorGoogle);
            try {
              await linkWithCredential(resultadoGoogle.user, credencialPendente);
              registrar.info({ rastreioId: resultadoGoogle.user.uid, servico: "Autenticacao" }, "Conta do GitHub vinculada com sucesso à conta Google.");
            } catch (erroVinculo: any) {
              if (erroVinculo.code === "auth/email-already-in-use") {
                registrar.warn({ rastreioId: "sistema", servico: "Autenticacao" }, "GitHub já está vinculado a outra conta. Efetuando login direto...");
                await signInWithCredential(autenticacao, credencialPendente);
                return;
              }
              throw erroVinculo;
            }
            return;
          }
        } catch (erroGeralVinculo: any) {
          registrar.error({ rastreioId: "sistema", servico: "Autenticacao" }, "Falha geral ao vincular GitHub ao Google", erroGeralVinculo);
          traduzirErroFirebase(erroGeralVinculo);
        }
      }

      if (erro.code === "auth/popup-blocked" || erro.code === "auth/cancelled-popup-request") {
        registrar.warn({ rastreioId: "sistema", servico: "Autenticacao" }, "Popup bloqueado ou fechado, tentando Redirect...");
        await signInWithRedirect(autenticacao, provedor);
        return;
      }

      registrar.error(
        { rastreioId: "sistema", servico: "Autenticacao", erro: erro.code },
        "Falha ao realizar login com GitHub",
        erro
      );
      traduzirErroFirebase(erro);
    }
  };

  /**
   * Recupera o token JWT atualizado do Firebase.
   * Utilizado para autenticar requisições no backend.
   * @returns Token JWT ou null se não autenticado
   */
  const buscarToken = async (): Promise<string | null> => {
    if (!autenticacao.currentUser) return null;
    try {
      // getIdToken(true) força a atualização se o token estiver perto de expirar
      return await autenticacao.currentUser.getIdToken();
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "Autenticacao" }, "Erro ao recuperar token", erro);
      return null;
    }
  };

  /**
   * Atualiza o perfil básico do usuário (nome e foto).
   */
  const atualizarPerfil = async (dados: { nome?: string; fotoUrl?: string }) => {
    try {
      if (!autenticacao.currentUser) throw new Error("Usuário não autenticado.");

      await updateProfile(autenticacao.currentUser, {
        displayName: dados.nome !== undefined ? dados.nome : autenticacao.currentUser.displayName,
        photoURL: dados.fotoUrl !== undefined ? dados.fotoUrl : autenticacao.currentUser.photoURL,
      });

      // Atualiza estado local
      definirUsuario((prev) =>
        prev
          ? {
              ...prev,
              nome: dados.nome !== undefined ? dados.nome : prev.nome,
              fotoUrl: dados.fotoUrl !== undefined ? dados.fotoUrl : prev.fotoUrl,
            }
          : null,
      );
    } catch (erro: unknown) {
      traduzirErroFirebase(erro);
    }
  };

  /**
   * Exclui permanentemente a conta do usuário (Direito ao Esquecimento - LGPD).
   * Realiza a purga dos dados no D1 antes de remover a credencial do Firebase.
   */
  const excluirConta = async () => {
    try {
      if (!autenticacao.currentUser) throw new Error("Usuário não autenticado.");

      registrar.info({ rastreioId: autenticacao.currentUser.uid, servico: "Autenticacao" }, "Iniciando purga de dados no D1...");
      
      // 1. Limpa os dados de negócio no Cloudflare D1
      const token = await autenticacao.currentUser.getIdToken();
      const respostaPurga = await fetch("/api/usuario-excluir", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!respostaPurga.ok) {
        const erroPurga = await respostaPurga.json() as any;
        throw new Error(erroPurga?.erro || "Falha ao limpar dados do banco de dados.");
      }

      registrar.info({ rastreioId: autenticacao.currentUser.uid, servico: "Autenticacao" }, "Purga no D1 concluída. Removendo usuário do Firebase Auth...");

      // 2. Remove o usuário do Firebase Auth (Ação irreversível)
      await deleteUser(autenticacao.currentUser);
      
      registrar.info({ rastreioId: "sistema", servico: "Autenticacao" }, "Conta excluída permanentemente com sucesso.");
    } catch (erro: unknown) {
      registrar.error({ rastreioId: "sistema", servico: "Autenticacao" }, "Falha total na exclusão de conta", erro);
      traduzirErroFirebase(erro);
    }
  };

  /**
   * Exporta os dados pessoais em formato JSON para portabilidade (Art. 18, V - LGPD).
   */
  const exportarDadosPessoais = async () => {
    try {
      if (!usuario) throw new Error("Usuário não autenticado.");

      const metadadosFirebase = autenticacao.currentUser?.metadata;

      const dadosExportacao = {
        titular: {
          uid: usuario.uid,
          nome: usuario.nome || "Não informado",
          email: usuario.email || "Não informado",
          provedorMetodo: usuario.provedorGoogle ? "Google" : usuario.provedorGithub ? "GitHub" : "Email/Senha",
          dataCriacaoConta: metadadosFirebase?.creationTime || "Não disponível",
          ultimoLogin: metadadosFirebase?.lastSignInTime || "Não disponível",
        },
        conformidadeLegis: {
          versaoTermosAceitos: "2026-05-14",
          versaoPoliticaPrivacidade: "2026-05-14",
          dataExportacao: new Date().toISOString(),
          baseLegal: "Art. 18, V (Portabilidade) - LGPD",
          finalidade: "Exercício do direito de portabilidade de dados pessoais",
          canalDPO: "privacidade@printlog.com.br",
        },
        aviso: {
          conteudo:
            "Este arquivo contém seus dados cadastrais básicos. O histórico de projetos, fatiamentos e pedidos pode ser consultado diretamente na plataforma ou solicitado via suporte técnico caso necessite de um formato específico para migração.",
        },
      };

      const blob = new Blob([JSON.stringify(dadosExportacao, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `portabilidade-printlog-${usuario.uid}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (erro: unknown) {
      traduzirErroFirebase(erro);
    }
  };

  const valor = {
    usuario,
    carregando,
    login,
    cadastro,
    sair,
    recuperarSenha,
    loginGoogle,
    loginGithub,
    atualizarPerfil,
    excluirConta,
    exportarDadosPessoais,
    buscarToken,
    enviarLinkMagicoLogin,
    enviarEmailVerificacao,
    recarregarUsuario,
  };

  return <ContextoAutenticacao.Provider value={valor}>{children}</ContextoAutenticacao.Provider>;
}
