/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  if (request.method !== "GET") {
    return new Response("Método não permitido", { status: 405 });
  }

  try {
    // Garante que a tabela exista
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS aviso_global (
        id TEXT PRIMARY KEY,
        mensagem TEXT NOT NULL,
        tipo TEXT DEFAULT 'INFO',
        link_rotulo TEXT,
        link_url TEXT,
        ativo INTEGER DEFAULT 0,
        atualizado_em TEXT
      )
    `).run();

    const aviso = await env.DB.prepare(
      "SELECT mensagem, tipo, link_rotulo, link_url, ativo, atualizado_em FROM aviso_global WHERE id = 'GLOBAL' LIMIT 1"
    ).first() as {
      mensagem: string;
      tipo: string;
      link_rotulo?: string;
      link_url?: string;
      ativo: number;
      atualizado_em: string;
    } | null;

    if (!aviso || !aviso.ativo) {
      return new Response(JSON.stringify({ ativo: false }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      ativo: true,
      mensagem: aviso.mensagem,
      tipo: aviso.tipo || "INFO",
      linkRotulo: aviso.link_rotulo || null,
      linkUrl: aviso.link_url || null,
      atualizadoEm: aviso.atualizado_em
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60" // Cache leve de 1 minuto
      }
    });
  } catch (erro: any) {
    return new Response(JSON.stringify({ ativo: false, erro: erro.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
