/// <reference types="@cloudflare/workers-types" />
import { ehUrlSegura } from "../utilitarios/sanitizacao";

interface Env {
  DB: D1Database;
  EMAIL_DONO: string;
}

interface DadosAviso {
  mensagem: string;
  tipo?: "INFO" | "ALERTA" | "SUCESSO" | "MANUTENCAO";
  linkRotulo?: string;
  linkUrl?: string;
  ativo: boolean;
}

export const onRequest: PagesFunction<Env, any, { uid: string; email?: string }> = async (context) => {
  const { env, data, request } = context;

  // 1. Verificação de Identidade (Middleware JWT já validou que o usuário existe no Firebase)
  const usuarioId = data.uid;
  if (!usuarioId) return new Response("Não autorizado", { status: 401 });

  const userEmail = (data.email || "").trim().toLowerCase();
  const donoEmail = (env.EMAIL_DONO || "").trim().toLowerCase();
  if (!userEmail || !donoEmail || userEmail !== donoEmail) {
    return new Response("Não autorizado", { status: 403 });
  }

  const metodo = request.method;

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

    // GET — Retorna o aviso configurado para o Console do Dono
    if (metodo === "GET") {
      const aviso = await env.DB.prepare(
        "SELECT mensagem, tipo, link_rotulo, link_url, ativo, atualizado_em FROM aviso_global WHERE id = 'GLOBAL' LIMIT 1"
      ).first() as any;

      if (!aviso) {
        return new Response(JSON.stringify({
          ativo: false,
          mensagem: "",
          tipo: "INFO",
          linkRotulo: "",
          linkUrl: "",
          atualizadoEm: null
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({
        ativo: Boolean(aviso.ativo),
        mensagem: aviso.mensagem || "",
        tipo: aviso.tipo || "INFO",
        linkRotulo: aviso.link_rotulo || "",
        linkUrl: aviso.link_url || "",
        atualizadoEm: aviso.atualizado_em
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // POST / PUT — Define ou atualiza o aviso global
    if (metodo === "POST" || metodo === "PUT") {
      const corpo = await request.json() as DadosAviso;

      const mensagem = (corpo.mensagem || "").trim();
      const tipo = corpo.tipo || "INFO";
      const linkRotulo = (corpo.linkRotulo || "").trim();
      const linkUrl = (corpo.linkUrl || "").trim();
      const ativo = corpo.ativo ? 1 : 0;
      const agora = new Date().toISOString();

      if (linkUrl && !ehUrlSegura(linkUrl)) {
        return new Response(JSON.stringify({ mensagem: "A URL do link é inválida ou contém protocolo não seguro." }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      await env.DB.prepare(`
        INSERT INTO aviso_global (id, mensagem, tipo, link_rotulo, link_url, ativo, atualizado_em)
        VALUES ('GLOBAL', ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          mensagem = excluded.mensagem,
          tipo = excluded.tipo,
          link_rotulo = excluded.link_rotulo,
          link_url = excluded.link_url,
          ativo = excluded.ativo,
          atualizado_em = excluded.atualizado_em
      `).bind(mensagem, tipo, linkRotulo || null, linkUrl || null, ativo, agora).run();

      return new Response(JSON.stringify({ sucesso: true, ativo: Boolean(ativo) }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Método não permitido", { status: 405 });
  } catch (erro: any) {
    return new Response(JSON.stringify({ mensagem: erro.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
