import { onAuthStateChanged } from "firebase/auth";
import { autenticacao } from "./firebase";
import { registrar } from "../utilitarios/registrador";

const URL_API_BASE = import.meta.env.VITE_URL_API || "";

/**
 * Interface para erros padronizados da API
 */
export interface ErroApi {
  status: number;
  mensagem: string;
  codigo?: string;
}

/**
 * Tenta obter o token do usuário atual, aguardando a inicialização se necessário.
 * Resolve problemas de corrida onde a API é chamada antes do Firebase carregar o estado.
 */
const obterTokenSeguro = async (): Promise<string | null> => {
  const usuarioAtual = autenticacao.currentUser;
  if (usuarioAtual) return usuarioAtual.getIdToken();

  // Se não houver usuário imediato, aguarda a primeira mudança de estado (inicialização)
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(autenticacao, async (user) => {
      unsubscribe();
      if (user) {
        resolve(await user.getIdToken());
      } else {
        resolve(null);
      }
    });

    // Limite de espera de 3 segundos para não travar a aplicação
    setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, 3000);
  });
};

/**
 * Serviço base para realizar requisições autenticadas para o backend na Cloudflare.
 * Garante que o ID Token do Firebase seja enviado em todas as chamadas.
 */
export const servicoBaseApi = {
  /**
   * Realiza uma requisição fetch com o token de autenticação injetado.
   */
  async requisicao<T>(
    caminho: string,
    opcoes: RequestInit = {}
  ): Promise<T> {
    const url = `${URL_API_BASE}${caminho}`;
    
    // Busca o token de forma resiliente
    const usuario = autenticacao.currentUser;
    const token = await obterTokenSeguro();

    const headers = new Headers(opcoes.headers);
    headers.set("Content-Type", "application/json");
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Temporário: Mantém compatibilidade com o backend atual
    if (usuario) {
      headers.set("x-usuario-id", usuario.uid);
    }

    try {
      const resposta = await fetch(url, {
        ...opcoes,
        headers,
      });

      if (resposta.status === 401) {
        throw { 
          status: 401, 
          mensagem: "Sessão expirada ou não autorizada. Por favor, logue novamente." 
        } as ErroApi;
      }

      if (!resposta.ok) {
        let mensagem = "Erro inesperado no servidor.";
        let codigo = undefined;

        const contentType = resposta.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const erroJson = (await resposta.json().catch(() => ({}))) as Record<string, string>;
          mensagem = erroJson.mensagem || mensagem;
          codigo = erroJson.codigo;
        }

        throw {
          status: resposta.status,
          mensagem,
          codigo
        } as ErroApi;
      }

      const contentType = resposta.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw {
          status: resposta.status,
          mensagem: `Resposta inválida do servidor (esperado JSON, recebido ${contentType || 'nada'}). Verifique se a VITE_URL_API está correta.`
        } as ErroApi;
      }

      if (resposta.status === 204) return {} as T;
      return await resposta.json();
    } catch (erro: any) {
      // Evita logar erros de cancelamento ou aborto que são normais em React
      if (erro.name !== "AbortError") {
        registrar.error(
          { rastreioId: "api", servico: "servicoBaseApi", caminho },
          "Erro na requisição à API",
          erro
        );
      }
      throw erro;
    }
  },

  get<T>(caminho: string): Promise<T> {
    return this.requisicao<T>(caminho, { method: "GET" });
  },

  post<T>(caminho: string, dados: unknown): Promise<T> {
    return this.requisicao<T>(caminho, {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  put<T>(caminho: string, dados: unknown): Promise<T> {
    return this.requisicao<T>(caminho, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  patch<T>(caminho: string, dados: unknown): Promise<T> {
    return this.requisicao<T>(caminho, {
      method: "PATCH",
      body: JSON.stringify(dados),
    });
  },

  delete<T>(caminho: string): Promise<T> {
    return this.requisicao<T>(caminho, { method: "DELETE" });
  },
};
