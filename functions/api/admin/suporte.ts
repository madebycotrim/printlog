/// <reference types="@cloudflare/workers-types" />
import { z } from "zod";

interface Env {
  DB: D1Database;
  EMAIL_DONO: string;
}

const SchemaResponderChamado = z.object({
  idChamado: z.string().uuid("ID de chamado inválido"),
  respostaAdmin: z.string().trim().min(2, "A resposta deve conter pelo menos 2 caracteres").max(5000),
  novoStatus: z.enum(["aberto", "em_analise", "respondido", "resolvido", "fechado"]),
});

export const onRequest: PagesFunction<Env, any, { uid: string; email?: string }> = async (context) => {
  const { env, request, data } = context;

  // Verificação de Identidade Admin
  const usuarioId = data.uid;
  if (!usuarioId) {
    return new Response(JSON.stringify({ erro: "Não autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userEmail = (data.email || "").trim().toLowerCase();
  const donoEmail = (env.EMAIL_DONO || "").trim().toLowerCase();
  if (!userEmail || !donoEmail || userEmail !== donoEmail) {
    return new Response(JSON.stringify({ erro: "Acesso restrito ao administrador" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const metodo = request.method;

  try {
    // Garantir tabela
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS chamados_suporte (
        id TEXT PRIMARY KEY,
        id_usuario TEXT NOT NULL,
        email_usuario TEXT,
        nome_usuario TEXT,
        assunto TEXT NOT NULL,
        categoria TEXT NOT NULL,
        prioridade TEXT NOT NULL DEFAULT 'normal',
        status TEXT NOT NULL DEFAULT 'aberto',
        mensagem TEXT NOT NULL,
        anexo_contexto TEXT,
        resposta_admin TEXT,
        respondido_por TEXT,
        data_criacao TEXT NOT NULL,
        data_resposta TEXT,
        data_atualizacao TEXT NOT NULL
      )
    `).run().catch(() => {});

    // GET — Listagem de todos os chamados e KPIs para o Admin Console
    if (metodo === "GET") {
      const url = new URL(request.url);
      const statusFiltro = url.searchParams.get("status");
      const categoriaFiltro = url.searchParams.get("categoria");
      const busca = url.searchParams.get("busca")?.trim().toLowerCase();

      // Estatísticas
      const statsRaw = await env.DB.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'aberto' THEN 1 ELSE 0 END) as abertos,
          SUM(CASE WHEN status = 'em_analise' THEN 1 ELSE 0 END) as emAnalise,
          SUM(CASE WHEN status = 'respondido' THEN 1 ELSE 0 END) as respondidos,
          SUM(CASE WHEN status = 'resolvido' OR status = 'fechado' THEN 1 ELSE 0 END) as resolvidos
        FROM chamados_suporte
      `).first() as any;

      const estatisticas = {
        total: statsRaw?.total || 0,
        abertos: statsRaw?.abertos || 0,
        emAnalise: statsRaw?.emAnalise || 0,
        respondidos: statsRaw?.respondidos || 0,
        resolvidos: statsRaw?.resolvidos || 0,
      };

      // Construção da Query dinâmica
      let query = "SELECT * FROM chamados_suporte WHERE 1=1";
      const params: any[] = [];

      if (statusFiltro && statusFiltro !== "TODOS") {
        query += " AND status = ?";
        params.push(statusFiltro);
      }

      if (categoriaFiltro && categoriaFiltro !== "TODAS") {
        query += " AND categoria = ?";
        params.push(categoriaFiltro);
      }

      if (busca) {
        query += " AND (LOWER(assunto) LIKE ? OR LOWER(email_usuario) LIKE ? OR LOWER(nome_usuario) LIKE ?)";
        const like = `%${busca}%`;
        params.push(like, like, like);
      }

      query += " ORDER BY CASE status WHEN 'aberto' THEN 1 WHEN 'em_analise' THEN 2 WHEN 'respondido' THEN 3 ELSE 4 END, data_atualizacao DESC LIMIT 100";

      const { results } = await env.DB.prepare(query).bind(...params).all();

      return new Response(
        JSON.stringify({
          estatisticas,
          chamados: results || [],
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // PATCH — Responder ou atualizar status do chamado
    if (metodo === "PATCH") {
      const body = await request.json();
      const validado = SchemaResponderChamado.safeParse(body);

      if (!validado.success) {
        return new Response(
          JSON.stringify({
            sucesso: false,
            mensagem: validado.error.issues[0]?.message || "Dados inválidos",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const agora = new Date().toISOString();

      const resultado = await env.DB.prepare(`
        UPDATE chamados_suporte 
        SET resposta_admin = ?,
            respondido_por = ?,
            status = ?,
            data_resposta = ?,
            data_atualizacao = ?
        WHERE id = ?
      `).bind(
        validado.data.respostaAdmin,
        userEmail,
        validado.data.novoStatus,
        agora,
        agora,
        validado.data.idChamado
      ).run();

      if (!resultado.success) {
        throw new Error("Erro ao atualizar chamado no banco.");
      }

      return new Response(
        JSON.stringify({
          sucesso: true,
          mensagem: "Resposta gravada e status do chamado atualizado com sucesso!",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response("Método não permitido", { status: 405 });
  } catch (erro: any) {
    console.error("[API Admin Suporte]", erro);
    return new Response(
      JSON.stringify({ sucesso: false, mensagem: erro.message || "Erro interno no servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
