/// <reference types="@cloudflare/workers-types" />
import { verificarRateLimit } from "../utilitarios/rate-limit";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env, any, { uid?: string }> = async (context) => {
  const { env, request } = context;
  const metodo = request.method;
  const url = new URL(request.url);
  const ip = request.headers.get("cf-connecting-ip") || "127.0.0.1";

  // === GET: Busca a URL original pelo ID encurtado ===
  if (metodo === "GET") {
    const limitCheck = verificarRateLimit(ip, "publico-encurtador-get", 60, 60_000);
    if (!limitCheck.permitido) {
      return new Response(
        JSON.stringify({ erro: "Muitas requisições. Aguarde um momento." }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": String(limitCheck.segundosParaReset)
          } 
        }
      );
    }

    const id = url.searchParams.get("id");
    if (!id || typeof id !== "string" || id.length > 32) {
      return new Response(
        JSON.stringify({ erro: "ID não fornecido ou inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const registro = await env.DB.prepare(
        "SELECT url_original FROM links_encurtados WHERE id = ?"
      ).bind(id.trim()).first() as any;

      if (!registro) {
        return new Response(
          JSON.stringify({ erro: "Link encurtado não encontrado" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ urlOriginal: registro.url_original }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (erro) {
      console.error("[encurtador-get] Erro ao buscar link:", erro);
      return new Response(
        JSON.stringify({ erro: "Erro interno no servidor" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // === POST: Cria um novo link encurtado ===
  if (metodo === "POST") {
    // Bloqueio de Segurança: Apenas operadores autenticados podem encurtar links
    const usuarioId = context.data?.uid;
    if (!usuarioId) {
      return new Response(
        JSON.stringify({ erro: "Não autorizado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const limitCheck = verificarRateLimit(`${usuarioId}:${ip}`, "publico-encurtador-post", 20, 60_000);
    if (!limitCheck.permitido) {
      return new Response(
        JSON.stringify({ erro: "Limite de criação de links atingido. Aguarde alguns instantes." }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": String(limitCheck.segundosParaReset)
          } 
        }
      );
    }

    try {
      const { url: urlOriginal } = await request.json() as { url: string };

      if (!urlOriginal || typeof urlOriginal !== "string") {
        return new Response(
          JSON.stringify({ erro: "URL original não fornecida" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Bloqueio Anti Open Redirect: permitir apenas links internos estritos (sem //) ou domínio oficial
      const ehRotaInterna = urlOriginal.startsWith("/") && !urlOriginal.startsWith("//");
      const ehDominioOficial = urlOriginal.startsWith("https://printlog.com.br/") || 
                               urlOriginal.startsWith("https://www.printlog.com.br/") ||
                               urlOriginal.startsWith("http://localhost:") || 
                               urlOriginal.startsWith("http://127.0.0.1:");
      const ehValida = ehRotaInterna || ehDominioOficial;

      if (!ehValida) {
        return new Response(
          JSON.stringify({ erro: "URL de destino inválida. Apenas links internos são permitidos." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Gera um ID alfanumérico curto e verifica se já existe
      let id = "";
      let existe = true;
      let tentativas = 0;

      const caracteres = "abcdefghijklmnopqrstuvwxyz0123456789";
      const bufferAleatorio = new Uint8Array(6);

      while (existe && tentativas < 10) {
        crypto.getRandomValues(bufferAleatorio);
        id = Array.from(bufferAleatorio, (byte) => caracteres[byte % caracteres.length]).join("");
        const registro = await env.DB.prepare(
          "SELECT id FROM links_encurtados WHERE id = ?"
        ).bind(id).first();
        if (!registro) {
          existe = false;
        }
        tentativas++;
      }

      if (existe) {
        return new Response(
          JSON.stringify({ erro: "Não foi possível gerar um ID único" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Insere no banco de dados
      await env.DB.prepare(
        "INSERT INTO links_encurtados (id, url_original) VALUES (?, ?)"
      ).bind(id, urlOriginal).run();

      return new Response(
        JSON.stringify({ id }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    } catch (erro) {
      console.error("[encurtador-post] Erro ao encurtar:", erro);
      return new Response(
        JSON.stringify({ erro: "Erro interno no servidor" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response("Método não permitido", { status: 405 });
};
