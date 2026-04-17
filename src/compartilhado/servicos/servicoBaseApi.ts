import { autenticacao } from "./firebase";
import { registrar } from "../utilitarios/registrador";

const URL_API_BASE = import.meta.env.VITE_URL_API || "http://localhost:8787";

/**
 * Interface para erros padronizados da API
 */
export interface ErroApi {
  status: number;
  mensagem: string;
  codigo?: string;
}

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
    
    // Busca o token atualizado do Firebase
    const usuario = autenticacao.currentUser;
    const token = usuario ? await usuario.getIdToken() : null;

    const headers = new Headers(opcoes.headers);
    headers.set("Content-Type", "application/json");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    try {
      const resposta = await fetch(url, {
        ...opcoes,
        headers,
      });

      if (resposta.status === 401) {
        const erro: ErroApi = { status: 401, mensagem: "Sessão expirada. Por favor, logue novamente." };
        throw erro;
      }

      if (!resposta.ok) {
        const erroJson = (await resposta.json().catch(() => ({}))) as Record<string, string>;
        const erro: ErroApi = {
          status: resposta.status,
          mensagem: erroJson.mensagem || "Erro inesperado no servidor.",
          codigo: erroJson.codigo
        };
        throw erro;
      }

      // Se for 204 No Content
      if (resposta.status === 204) return {} as T;

      return await resposta.json();
    } catch (erro: unknown) {
      registrar.error(
        { rastreioId: "api", servico: "servicoBaseApi", caminho },
        "Erro na requisição à API",
        erro
      );
      throw erro;
    }
  },

  /**
   * Realiza uma requisição GET.
   * @param caminho - Endpoint da API
   */
  get<T>(caminho: string): Promise<T> {
    return this.requisicao<T>(caminho, { method: "GET" });
  },

  /**
   * Realiza uma requisição POST.
   * @param caminho - Endpoint da API
   * @param dados - Corpo da requisição
   */
  post<T>(caminho: string, dados: unknown): Promise<T> {
    return this.requisicao<T>(caminho, {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  /**
   * Realiza uma requisição PUT.
   * @param caminho - Endpoint da API
   * @param dados - Corpo da requisição
   */
  put<T>(caminho: string, dados: unknown): Promise<T> {
    return this.requisicao<T>(caminho, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  /**
   * Realiza uma requisição DELETE.
   * @param caminho - Endpoint da API
   */
  delete<T>(caminho: string): Promise<T> {
    return this.requisicao<T>(caminho, { method: "DELETE" });
  },
};
