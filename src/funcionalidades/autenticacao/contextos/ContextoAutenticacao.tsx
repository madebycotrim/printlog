import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  AuthError,
  setPersistence,
  browserLocalPersistence,
  deleteUser,
} from "firebase/auth";
import { autenticacao } from "@/compartilhado/servicos/firebase";
import { registrar } from "@/compartilhado/utilitarios/registrador";

import { Usuario } from "@/compartilhado/tipos/modelos";

interface ContextoAutenticacaoProps {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastro: (email: string, senha: string, nome: string) => Promise<void>;
  sair: () => Promise<void>;
  recuperarSenha: (email: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  atualizarPerfil: (dados: { nome?: string; fotoUrl?: string }) => Promise<void>;
  excluirConta: () => Promise<void>;
  exportarDadosPessoais: () => Promise<void>;
  buscarToken: () => Promise<string | null>;
}

const ContextoAutenticacao = createContext<ContextoAutenticacaoProps>({} as ContextoAutenticacaoProps);

/**
 * Hook para acessar o contexto de autenticação.
 */
export function usarAutenticacao() {
  return useContext(ContextoAutenticacao);
}

interface ProvedorAutenticacaoProps {
  children: ReactNode;
}

/**
 * Obtém o endereço IP do usuário para fins de auditoria de segurança (LGPD).
 * @returns IP em string
 */
const obterIpUsuario = async (): Promise<string> => {
  try {
    const resposta = await fetch("https://api.ipify.org?format=json");
    const dados = (await resposta.json()) as { ip: string };
    return dados.ip;
  } catch (erro) {
    registrar.error({ rastreioId: "sistema", servico: "Autenticacao" }, "Erro ao obter IP", erro);
    return "0.0.0.0";
  }
};

/**
 * Registra o aceite dos termos e política de privacidade no banco de dados.
 * @param uid - ID do usuário
 */
const registrarAceiteTermos = async (uid: string) => {
  try {
    const ip = await obterIpUsuario();
    const payload = {
      user_id: uid,
      data_aceite: new Date().toISOString(),
      versao_termos: "2026-02-24",
      versao_politica: "2026-02-24",
      ip: ip,
    };

    // Simulação - Integrar com Cloudflare D1 em breve
    registrar.info({ rastreioId: `aceite-${uid}`, payload }, "Registrando aceite no banco de dados (Cloudflare D1)");
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

  useEffect(() => {
    // Configura persistência local (mantém logado mesmo fechando o navegador)
    const configurarPersistencia = async () => {
      try {
        await setPersistence(autenticacao, browserLocalPersistence);
      } catch (erro) {
        registrar.error({ rastreioId: "sistema", servico: "Autenticacao" }, "Erro ao configurar persistência", erro);
      }
    };
    configurarPersistencia();

    const cancelarInscricao = onAuthStateChanged(autenticacao, (user) => {
      if (user) {
        const ehGoogle = user.providerData.some((provedor) => provedor.providerId === "google.com");
        definirUsuario({
          uid: user.uid,
          email: user.email,
          nome: user.displayName,
          fotoUrl: user.photoURL,
          provedorGoogle: ehGoogle,
        });
      } else {
        definirUsuario(null);
      }
      definirCarregando(false);
    });

    return () => cancelarInscricao();
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
      default:
        throw new Error("Ocorreu um erro inesperado. Tente novamente mais tarde.");
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
  const sair = async () => {
    const uid = usuario?.uid || "desconhecido";
    try {
      await signOut(autenticacao);
      registrar.info(
        { rastreioId: uid, servico: "Autenticacao", evento: "LOGOUT" },
        "Sessão encerrada pelo usuário"
      );
    } catch (erro: unknown) {
      registrar.error({ rastreioId: uid, servico: "Autenticacao", evento: "LOGOUT_FALHA" }, "Erro ao sair", erro);
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
   * Realiza login utilizando o Google.
   */
  const loginGoogle = async () => {
    try {
      const provedor = new GoogleAuthProvider();
      const credencial = await signInWithPopup(autenticacao, provedor);
      registrar.info(
        { rastreioId: credencial.user.uid, servico: "Autenticacao", evento: "LOGIN_GOOGLE_SUCESSO" },
        "Login realizado com sucesso via Google"
      );
    } catch (erro: unknown) {
      registrar.warn(
        { rastreioId: "desconhecido", servico: "Autenticacao", evento: "LOGIN_GOOGLE_FALHA" },
        "Tentativa de login via Google falhou"
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
   */
  const excluirConta = async () => {
    try {
      if (!autenticacao.currentUser) throw new Error("Usuário não autenticado.");
      await deleteUser(autenticacao.currentUser);
    } catch (erro: unknown) {
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
          provedorMetodo: usuario.provedorGoogle ? "Google" : "Email/Senha",
          dataCriacaoConta: metadadosFirebase?.creationTime || "Não disponível",
          ultimoLogin: metadadosFirebase?.lastSignInTime || "Não disponível",
        },
        conformidadeLegis: {
          versaoTermosAceitos: "2026-02-24",
          versaoPoliticaPrivacidade: "2026-02-24",
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
    atualizarPerfil,
    excluirConta,
    exportarDadosPessoais,
    buscarToken,
  };

  return <ContextoAutenticacao.Provider value={valor}>{children}</ContextoAutenticacao.Provider>;
}
