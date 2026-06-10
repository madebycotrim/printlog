/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env, any> = async (context) => {
  const { env, request } = context;
  const metodo = request.method;
  const url = new URL(request.url);

  // === GET: Busca a URL original pelo ID encurtado ===
  if (metodo === "GET") {
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response(
        JSON.stringify({ erro: "ID não fornecido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const registro = await env.DB.prepare(
        "SELECT url_original FROM links_encurtados WHERE id = ?"
      ).bind(id).first() as any;

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
    try {
      const { url: urlOriginal } = await request.json() as { url: string };

      if (!urlOriginal) {
        return new Response(
          JSON.stringify({ erro: "URL original não fornecida" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Gera um ID alfanumérico curto e verifica se já existe
      let id = "";
      let existe = true;
      let tentativas = 0;

      while (existe && tentativas < 10) {
        id = Math.random().toString(36).substring(2, 8); // 6 caracteres alfanuméricos
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
