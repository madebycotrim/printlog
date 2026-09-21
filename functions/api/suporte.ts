/// <reference types="@cloudflare/workers-types" />
import { z } from "zod";

interface Env {
  DB: D1Database;
}

const SchemaCriarChamado = z.object({
  assunto: z.string().trim().min(3, "Assunto deve ter no mínimo 3 caracteres").max(150, "Assunto muito longo"),
  categoria: z.enum(["bug", "duvida", "sugestao", "financeiro", "emergencia", "outro"]),
  prioridade: z.enum(["baixa", "normal", "alta", "urgente"]).default("normal"),
  mensagem: z.string().trim().min(10, "A mensagem deve conter pelo menos 10 caracteres").max(5000, "Mensagem excede 5.000 caracteres"),
  anexoContexto: z.string().max(2000).optional(),
});

export const onRequest: PagesFunction<Env, any, { uid: string; email?: string }> = async (context) => {
  const { env, request, data } = context;
  const usuarioId = data.uid;
  if (!usuarioId) {
    return new Response(JSON.stringify({ erro: "Não autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const metodo = request.method;

  try {
    // Garantir criação da tabela no D1
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

    // GET — Lista chamados do próprio usuário
    if (metodo === "GET") {
      const { results } = await env.DB.prepare(`
        SELECT * FROM chamados_suporte 
        WHERE id_usuario = ? 
        ORDER BY data_atualizacao DESC 
        LIMIT 50
      `).bind(usuarioId).all();

      return new Response(JSON.stringify(results || []), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // POST — Cria um novo chamado
    if (metodo === "POST") {
      const body = await request.json();
      const validado = SchemaCriarChamado.safeParse(body);

      if (!validado.success) {
        return new Response(
          JSON.stringify({
            sucesso: false,
            mensagem: validado.error.issues[0]?.message || "Dados inválidos",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const id = crypto.randomUUID();
      const agora = new Date().toISOString();
      const emailUsuario = data.email || "anonimo@printlog.com.br";

      // Tenta buscar nome do usuário ou estúdio nas configurações
      const configUser = await env.DB.prepare(`
        SELECT nome_estudio FROM configuracoes_usuario WHERE id_usuario = ?
      `).bind(usuarioId).first() as any;
      const nomeUsuario = configUser?.nome_estudio || emailUsuario.split("@")[0];

      await env.DB.prepare(`
        INSERT INTO chamados_suporte (
          id, id_usuario, email_usuario, nome_usuario, assunto, categoria, 
          prioridade, status, mensagem, anexo_contexto, data_criacao, data_atualizacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'aberto', ?, ?, ?, ?)
      `).bind(
        id,
        usuarioId,
        emailUsuario,
        nomeUsuario,
        validado.data.assunto,
        validado.data.categoria,
        validado.data.prioridade,
        validado.data.mensagem,
        validado.data.anexoContexto || null,
        agora,
        agora
      ).run();

      return new Response(
        JSON.stringify({
          sucesso: true,
          id,
          mensagem: "Chamado registrado com sucesso! Nossa equipe técnica responderá em breve.",
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response("Método não permitido", { status: 405 });
  } catch (erro: any) {
    console.error("[API Suporte]", erro);
    return new Response(
      JSON.stringify({ sucesso: false, mensagem: erro.message || "Erro interno do servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
